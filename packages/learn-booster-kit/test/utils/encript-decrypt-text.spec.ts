import { describe, it, expect } from 'vitest';
import {
  encryptText,
  decryptText,
  FORMAT_VERSION,
} from '../../src/lib/utils/encript-decrypt-text';

const PASSWORD = 'test-password-123';

describe('encryptText / decryptText', () => {
  it('roundtrip: encrypt -> decrypt מחזיר טקסט מקורי', async () => {
    const plaintext = 'שלום עולם!';
    const encrypted = await encryptText(plaintext, PASSWORD);
    const decrypted = await decryptText(encrypted, PASSWORD);
    expect(decrypted).toBe(plaintext);
  });

  it('roundtrip עם AAD: encrypt + AAD -> decrypt + אותו AAD', async () => {
    const plaintext = 'test message';
    const aad = 'context:v1';
    const encrypted = await encryptText(plaintext, PASSWORD, { aad });
    const decrypted = await decryptText(encrypted, PASSWORD, { aad });
    expect(decrypted).toBe(plaintext);
  });

  it('AAD שגוי: decrypt עם AAD שונה זורק שגיאה', async () => {
    const encrypted = await encryptText('data', PASSWORD, { aad: 'aad-correct' });
    await expect(decryptText(encrypted, PASSWORD, { aad: 'aad-wrong' })).rejects.toThrow();
  });

  it('סיסמה שגויה: decrypt זורק שגיאה', async () => {
    const encrypted = await encryptText('data', PASSWORD);
    await expect(decryptText(encrypted, 'wrong-password')).rejects.toThrow();
  });

  it('הבייט הראשון של הפלט (לפני Base64) הוא FORMAT_VERSION=0x01', async () => {
    const encrypted = await encryptText('hello', PASSWORD);
    const b64url = encrypted;
    let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4;
    if (pad) b64 += '='.repeat(4 - pad);
    const binary = atob(b64);
    expect(binary.charCodeAt(0)).toBe(FORMAT_VERSION);
  });

  it('מחזיר מחרוזת שאינה ריקה', async () => {
    const result = await encryptText('test', PASSWORD);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('שתי הצפנות של אותו טקסט נותנות תוצאות שונות (IV אקראי)', async () => {
    const enc1 = await encryptText('same', PASSWORD);
    const enc2 = await encryptText('same', PASSWORD);
    expect(enc1).not.toBe(enc2);
  });
});
