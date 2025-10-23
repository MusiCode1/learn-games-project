import { decryptText } from "./utils/encript-decrypt-text";

import type { AppListItem } from "../types";

const filePath = '/data/user/0/com.fullykiosk.emm/files/remote-admin-pass';
const passwordKey = import.meta.env.VITE_PASS_KEY;
const aad = 'gingim-booster-fully-kiosk-key:v1';

async function getFullyKioskPassword() {

    const encryptedPassFile = window.fully?.readFile(filePath);
    if (!encryptedPassFile) {
        throw new Error('Could not read Fully Kiosk remote admin password file.');
    }

    const clearPass = await decryptText(encryptedPassFile,
        passwordKey, { strictVersion: true, aad });
    // להחליף בקובץ מקומי
    return clearPass;
}


export async function getAppsList() {
    const password = await getFullyKioskPassword();

    const params = new URLSearchParams({
        cmd: 'manageApps',
        type: 'json',
        password
    }).toString();

    const url = new URL('http://127.0.0.1:2323/?' + params);
    const rowResponse = await fetch(url.toString(), {});
    if (!rowResponse.ok) {
        throw new Error(`HTTP error! status: ${rowResponse.status}`);
    }

    const response = await rowResponse.json() as AppListItem[];

    return response;

}

