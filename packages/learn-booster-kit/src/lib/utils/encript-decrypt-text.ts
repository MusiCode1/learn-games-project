// encript-decrypt-text.ts
// AES-GCM + PBKDF2(SHA-256)
// פורמט מטען: [ver(1)] [iters(4, BE)] [salt(16)] [iv(12)] [ciphertext|tag]  → Base64URL

const enc = new TextEncoder();
const dec = new TextDecoder();

export const FORMAT_VERSION = 0x01 as const;
export const SALT_BYTES = 16;
export const IV_BYTES = 12;
export const PBKDF2_ITERATIONS = 200_000;
export const KEY_LENGTH = 256;

// ==== עוזרים ====

function assert(cond: boolean, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

// ממיר Uint8Array ל-ArrayBuffer רגיל
function toAB(u8: Uint8Array): ArrayBuffer {
  const buf = u8.buffer;

  // אם יש SharedArrayBuffer בסביבה וזה Shared — נשכפל לבאפר חדש
  if (typeof SharedArrayBuffer !== "undefined" && buf instanceof SharedArrayBuffer) {
    const ab = new ArrayBuffer(u8.byteLength);
    new Uint8Array(ab).set(u8);
    return ab;
  }

  // אם זה ArrayBuffer רגיל וה-View מכסה את כולו – נחזיר ישירות (מסלול מהיר)
  if (buf instanceof ArrayBuffer && u8.byteOffset === 0 && u8.byteLength === buf.byteLength) {
    return buf;
  }

  // אחרת: משכפלים ל-ArrayBuffer חדש (מבטיח טיפוס ArrayBuffer נקי)
  const ab = new ArrayBuffer(u8.byteLength);
  new Uint8Array(ab).set(u8);
  return ab;
}


function normalizePassword(password: string): Uint8Array {
  return enc.encode(password.normalize("NFKC"));
}

function u32ToBytesBE(n: number): Uint8Array {
  const b = new Uint8Array(4);
  b[0] = (n >>> 24) & 0xff;
  b[1] = (n >>> 16) & 0xff;
  b[2] = (n >>> 8) & 0xff;
  b[3] = n & 0xff;
  return b;
}

function u32FromBytesBE(b: Uint8Array): number {
  assert(b.length === 4, "u32FromBytesBE: length must be 4");
  return ((b[0] << 24) | (b[1] << 16) | (b[2] << 8) | b[3]) >>> 0;
}

// ==== Base64 / Base64URL ====

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const len = binary.length;
  const out = new Uint8Array(len);
  for (let i = 0; i < len; i++) out[i] = binary.charCodeAt(i);
  return out;
}

function toBase64Url(b64: string): string {
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(b64url: string): string {
  let b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4;
  if (pad) b64 += "=".repeat(4 - pad);
  return b64;
}

// ==== AAD ====
export type EncryptOptions = {
  aad?: string | Uint8Array;
};
export type DecryptOptions = {
  aad?: string | Uint8Array;
  strictVersion?: boolean;
};

function normalizeAad(aad?: string | Uint8Array): Uint8Array | undefined {
  if (aad == null) return undefined;
  return typeof aad === "string" ? enc.encode(aad) : aad;
}

// ==== גזירת מפתח ====
async function deriveAesGcmKey(passwordBytes: Uint8Array, salt: Uint8Array, usage: KeyUsage[]): Promise<CryptoKey> {
  const keyMaterial = await globalThis.crypto.subtle.importKey("raw", toAB(passwordBytes), { name: "PBKDF2" }, false, ["deriveKey"]);
  return globalThis.crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: toAB(salt), iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: KEY_LENGTH },
    false,
    usage
  );
}

// ==== API ====

export async function encryptText(plaintext: string, password: string, opts: EncryptOptions = {}): Promise<string> {
  assert(typeof plaintext === "string", "plaintext must be a string");
  assert(typeof password === "string" && password.length > 0, "password is required");

  const salt = new Uint8Array(SALT_BYTES);
  globalThis.crypto.getRandomValues(salt);
  const iv = new Uint8Array(IV_BYTES);
  globalThis.crypto.getRandomValues(iv);

  const pw = normalizePassword(password);
  const key = await deriveAesGcmKey(pw, salt, ["encrypt"]);

  const aad = normalizeAad(opts.aad);
  const alg: AesGcmParams = {
    name: "AES-GCM",
    iv: toAB(iv),
    additionalData: aad ? toAB(aad) : undefined,
  };

  const msgBytes = enc.encode(plaintext);
  const ctBuf = await globalThis.crypto.subtle.encrypt(alg, key, toAB(msgBytes));
  const ct = new Uint8Array(ctBuf);

  const iters = u32ToBytesBE(PBKDF2_ITERATIONS);
  const out = new Uint8Array(1 + iters.length + salt.length + iv.length + ct.length);
  let off = 0;
  out[off++] = FORMAT_VERSION;
  out.set(iters, off);
  off += iters.length;
  out.set(salt, off);
  off += salt.length;
  out.set(iv, off);
  off += iv.length;
  out.set(ct, off);

  return toBase64Url(bytesToBase64(out));
}

export async function decryptText(b64urlPayload: string, password: string, opts: DecryptOptions = {}): Promise<string> {
  assert(typeof b64urlPayload === "string" && b64urlPayload.length > 0, "payload is required");
  assert(typeof password === "string" && password.length > 0, "password is required");

  const bytes = base64ToBytes(fromBase64Url(b64urlPayload));
  let off = 0;

  const ver = bytes[off++];
  const strict = opts.strictVersion ?? true;
  if (strict && ver !== FORMAT_VERSION) throw new Error(`Unsupported payload version: ${ver}`);

  const itersBytes = bytes.subarray(off, off + 4);
  off += 4;
  const iters = u32FromBytesBE(itersBytes);
  assert(iters >= 10_000 && iters <= 5_000_000, "PBKDF2 iterations out of safe bounds");

  const salt = bytes.subarray(off, off + SALT_BYTES);
  off += SALT_BYTES;
  const iv = bytes.subarray(off, off + IV_BYTES);
  off += IV_BYTES;
  const ct = bytes.subarray(off);
  assert(ct.length >= 16, "ciphertext is too short");

  const pw = normalizePassword(password);
  const keyMaterial = await globalThis.crypto.subtle.importKey("raw", toAB(pw), { name: "PBKDF2" }, false, ["deriveKey"]);
  const key = await globalThis.crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: toAB(salt), iterations: iters, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: KEY_LENGTH },
    false,
    ["decrypt"]
  );

  const aad = normalizeAad(opts.aad);
  const alg: AesGcmParams = {
    name: "AES-GCM",
    iv: toAB(iv),
    additionalData: aad ? toAB(aad) : undefined,
  };

  try {
    const ptBuf = await globalThis.crypto.subtle.decrypt(alg, key, toAB(ct));
    return dec.decode(ptBuf);
  } catch {
    throw new Error("Decryption failed (wrong password or corrupted data).");
  }
}

// ==== דוגמה ====
// (async () => {
//   const msg = "שלום עולם!";
//   const pass = "mySecretKey";
//   const aad = "note:demo-v1";
//   const encB64u = await encryptText(msg, pass, { aad });
//   console.log("Encrypted:", encB64u);
//   const decMsg = await decryptText(encB64u, pass, { aad });
//   console.log("Decrypted:", decMsg);
// })();
