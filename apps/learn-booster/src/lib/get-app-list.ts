import { decryptText } from "./utils/encript-decrypt-text";
import { getAllConfig, addConfigListener } from "./config-manager";

import type { AppListItem } from "../types";
import { isFullyKiosk } from "./fully-kiosk";

const filePath = '/data/user/0/com.fullykiosk.emm/files/remote-admin-pass';
const passwordKey = import.meta.env.VITE_PASS_KEY;
const aad = 'gingim-booster-fully-kiosk-key:v1';
let environmentMode = '';

let exampleAppList: AppListItem[] | [] = [];

(() => {

    const cleanListener = addConfigListener((newConfig) => {

        environmentMode = newConfig.environmentMode;

        if (isFullyKiosk() === false && environmentMode === 'development') {
            getExampleAppList().then((data) => {
                exampleAppList = data;
                cleanListener();
            }).catch((error) => {
                console.error('Error fetching example app list during initialization:', error);
            });
        }
    });

})();

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

    const currrntUrl = new URL(import.meta.url);

    return fetch(currrntUrl.origin + '/example-app-list.json')
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

    if (environmentMode === '') {
        const allConfig = getAllConfig();
        environmentMode = allConfig.environmentMode;
    }

    if (isFullyKiosk() === false) {
        if (environmentMode === 'development') {

            if (exampleAppList.length === 0) {
                exampleAppList = await getExampleAppList();
            }

            return exampleAppList;
        } else {
            throw new Error('Not in Fully Kiosk environment.');
        }
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

