import { decryptText } from "./utils/encript-decrypt-text";
import { getAllConfig } from "./config-manager";

import type { AppListItem } from "../types";

const filePath = '/data/user/0/com.fullykiosk.emm/files/remote-admin-pass';
const passwordKey = import.meta.env.VITE_PASS_KEY;
const aad = 'gingim-booster-fully-kiosk-key:v1';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getFullyKioskPasswordOld() {

    const encryptedPassFile = window.fully?.readFile(filePath);
    if (!encryptedPassFile) {
        throw new Error('Could not read Fully Kiosk remote admin password file.');
    }

    const clearPass = await decryptText(encryptedPassFile,
        passwordKey, { strictVersion: true, aad });
    // להחליף בקובץ מקומי
    return clearPass;
}

async function getExampleAppList() {

    return fetch('/example-app-list.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((data: AppListItem[]) => {
            return data;
        })
        .catch((error) => {
            console.error('Error fetching example app list:', error);
            throw error;
        });
}

async function getFullyKioskPassword() {

    const isRemoteAdminEnable = window.fully?.getBooleanSetting('remoteAdmin');

    if (isRemoteAdminEnable === 'false') {
        throw new Error('Fully Kiosk remote admin is not enabled.');
    }

    const password =
        window.fully?.getStringRawSetting('remoteAdminPassword');

    if (!password) {
        throw new Error('Could not read Fully Kiosk remote admin password file.');
    }

    return password;

}


export async function getAppsList() {

    const environmentMode = getAllConfig().environmentMode;

    if (environmentMode === 'development') {
        const exampleAppList = await getExampleAppList();

        return exampleAppList;
    }

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

