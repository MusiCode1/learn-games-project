import { encryptText } from "../src/lib/utils/encript-decrypt-text";
import { webcrypto } from "node:crypto";

// globalThis.crypto = webcrypto;

if (!globalThis.crypto) {
    globalThis.crypto = webcrypto as unknown as Crypto;
}


const passwordKey = import.meta.env.VITE_PASS_KEY;

async function generateKeyFromPassword(password: string) {
    const aad = 'gingim-booster-fully-kiosk-key:v1';
    const encryptedKey = await encryptText(passwordKey, password, { aad });
    console.log('Encrypted Key:', encryptedKey);
    console.log(password);
    
}

const password = process.argv[2];

if (!password) {
    console.error('Please provide a password as a command line argument.');
    process.exit(1);
}

generateKeyFromPassword(password).catch(err => {
    console.error('Error generating key:', err);
    process.exit(1);
});
