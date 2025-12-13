/* eslint-disable @typescript-eslint/no-explicit-any */

import { expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

export async function injectMainCode(page: Page) {

    const mainJsPath = path.join(import.meta.dirname, "../../public/gingim-booster-inject.js");
    const injectScript = fs.readFileSync(mainJsPath, "utf8");

    await page.evaluate(async () => {
        // יצירת פונקציה להזרקת סקריפט
        window.loadScriptFromUrl = function (text: string) {
            const script = document.createElement("script");
            script.async = true;
            script.type = "module";
            script.textContent = text;
            document.head.appendChild(script);
            console.log(`Script loaded`);
        };
    });

    // הזרקת הקוד העיקרי
    await page.evaluate(async (mainJs) => {
        window.loadScriptFromUrl(mainJs)
        console.log("Main script injected");
    }, injectScript);

}

export async function injectTestCode(page: Page) {
    await page.evaluate(async () => {
        // הגדרת אובייקט חלון גלובלי לבדיקות
        window.gingimBoosterTest = {
            videoShown: false,
            logMessages: [] as [] | Array<any>,
        };

        // עטיפת console.log כדי לעקוב אחר הודעות
        const originalLog = console.log;

        console.log = function (...args: any[]) {
            if (typeof args[0] === 'string')
                window.gingimBoosterTest.logMessages.push(args[0]);
            originalLog.apply(console, args);
        };
    });
}


/**
 * הזרקת הקוד של gingim-booster לדף
 */
export async function injectCode(page: Page) {

    // הזרקת הקוד
    await injectTestCode(page);
    await injectMainCode(page);

    await page.waitForTimeout(2 * 1000);

    // בדיקה שהקוד הוזרק בהצלחה
    const injectionSuccess = await page.evaluate(() => {
        return window.gingimBoosterTest.logMessages.some((msg: string) =>
            msg.includes("Gingim-Booster is loaded")
        );
    });

    expect(injectionSuccess).toBeTruthy();
    console.log("✅ Code injection successful");
}

/**
 * התחברות לאתר ג'ינג'ים
 */
export async function loginToGingim(page: Page) {
    // ניווט לדף ההתחברות
    await page.goto("https://gingim.net/login");

    // בדיקה שמשתני הסביבה קיימים
    if (!process.env.GINGIM_USER || !process.env.GINGIM_PASS) {
        throw new Error("Environment variables GINGIM_USER and GINGIM_PASS must be defined");
    }

    // מילוי פרטי ההתחברות
    await page.fill("#user_login", process.env.GINGIM_USER);
    await page.fill("#user_pass", process.env.GINGIM_PASS);

    // לחיצה על כפתור ההתחברות
    await page.click(".tml-button");

    // המתנה לניווט לדף הבית אחרי ההתחברות
    await page.waitForURL("https://gingim.net/**");

    // וידוא שההתחברות הצליחה
    const loggedIn = await page.isVisible(".logged-in");
    expect(loggedIn).toBeTruthy();

    console.log("✅ Login to Gingim website successful");
}

/**
 * פתיחת משחק ספציפי
 */
export async function openGame(page: Page, gameId: number = 208) {
    await page.click(`[data-gid="${gameId}"] img`);

    // המתנה לטעינת המשחק
    await page.waitForSelector("iframe");

    // מעבר ל-iframe של המשחק
    const gameFrame = page.frameLocator(".game_iframe");

    if (!gameFrame) {
        throw new Error("Game iframe not found");
    }

    // המתנה לטעינת המשחק בתוך ה-iframe
    await gameFrame.locator("canvas").waitFor();

    console.log("✅ Game opened successfully");

    const childFrames = page.mainFrame().childFrames();

    // מציאת ה-iframe של המשחק
    const frame = childFrames.find((f) =>
        (new URL(f.url()).hostname) === 'gingim.net');

    if (!frame) {
        throw new Error("Game iframe not found");
    }

    await injectTestCode(frame.page());

    return gameFrame;
}

/**
 * בדיקת הפונקציונליות של gingim-booster
 * לוחץ במרכז הקנוואס ובודק אם יש לוג שהדפיס "The game is supported!"
 */
export async function testFunctionality(page: Page, gameFrame: any) {

    const childFrames = page.mainFrame().childFrames();

    // מציאת ה-iframe של המשחק
    const frame = childFrames.find((f) =>
        (new URL(f.url()).hostname) === 'gingim.net');

    if (!frame) {
        throw new Error("Game iframe not found");
    }

    const framePage = frame.page();

    // המתנה שהמשחק ייטען
    await framePage.waitForTimeout(10 * 1000);

    // לחיצה במרכז הקנוואס
    const canvas = gameFrame.locator("canvas");
    const canvasBounds = await canvas.boundingBox();

    if (canvasBounds) {
        // לחיצה במרכז הקנוואס
        const centerX = canvasBounds.width * 0.5;
        const centerY = canvasBounds.height * 0.5;

        await canvas.click({ position: { x: centerX, y: centerY } });

        // המתנה קצרה לאחר הלחיצה
        await framePage.waitForTimeout(1000);
    }

    // בדיקה אם יש לוג שהדפיס "The game is supported!"
    const gameSupported = await framePage.evaluate(() => {

        return window.gingimBoosterTest.logMessages.some((msg: string) =>
            msg.includes("The game is supported!")
        );
    });

    if (gameSupported) {
        console.log("✅ Test successful: The game is supported!");
    } else {
        console.log("❌ Test failed: The game is not supported or there is a problem with code injection");
    }

    return gameSupported;
}
