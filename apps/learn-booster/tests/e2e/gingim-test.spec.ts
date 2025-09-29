/* eslint-disable1 no-debugger */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { test, expect } from "@playwright/test";


import {
  loginToGingim,
  injectCode,
  openGame,
  testFunctionality
} from "./utils";

import "dotenv/config";

declare global {
  interface Window {
    loadExternalScript: (text: string) => void;
    gingimBoosterTest: {
      videoShown: boolean,
      logMessages: Array<any>,
    };

    gameTestState: {
      videoShown: boolean,
      turnsMade: number,
    };

    // הגדרת PIXI לצורך הבדיקות
    PIXI?: {
      game?: {
        state?: {
          states?: {
            game?: {
              makeNewTurn?: (...args: any[]) => any;
            };
          };
        };
      };
    };
  }
}


/**
 * בדיקת קצה לקצה לפרויקט gingim-booster
 *
 * הבדיקה כוללת:
 * 1. התחברות לאתר ג'ינג'ים
 * 2. הזרקת הקוד של gingim-booster
 * 3. פתיחת משחק
 * 4. בדיקת הפונקציונליות
 */
test("בדיקת gingim-booster באתר ג'ינג'ים", async ({ page }) => {
  // 1. התחברות לאתר ג'ינג'ים
  await test.step("התחברות לאתר ג'ינג'ים", async () => {
    await loginToGingim(page);
  });

  // 2. הזרקת הקוד של gingim-booster
  await test.step("הזרקת הקוד של gingim-booster", async () => {
    await injectCode(page);
  });

  // 3. פתיחת משחק
  let gameFrame;
  await test.step("פתיחת משחק", async () => {
    gameFrame = await openGame(page, 208);
  });

  // 4. בדיקת הפונקציונליות
  await test.step("בדיקת הפונקציונליות", async () => {
    const isGameSupported = await testFunctionality(page, gameFrame);
    expect(isGameSupported).toBeTruthy();
  });

  // צילום מסך בסיום הבדיקה
  await page.screenshot({
    path: "playwright-report/gingim-test-result.png",
    fullPage: true,
  });
});