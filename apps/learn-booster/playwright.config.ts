// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * קובץ תצורה ל-Playwright עבור בדיקות קצה לקצה
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60000, // זמן מקסימלי לבדיקה בודדת (60 שניות)
  expect: {
    timeout: 10000 // זמן מקסימלי לפעולות expect
  },
  // הפעלת הבדיקות בסביבת דפדפן אמיתית
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,
  reporter: [['html', { open: 'never' }], ['list']],


  use: {
    // הגדרות בסיסיות
    baseURL: 'https://gingim.net',
    trace: 'on-first-retry',
    headless: false, // הפעלת הדפדפן במצב גלוי כדי שנוכל לראות את הבדיקה

    launchOptions: {
      devtools: true,
    },

    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,

    // הגדרות צילום מסך ווידאו
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    //storageState: 'output/storage-state.json'
  },

  // הגדרות פרויקטים שונים (דפדפנים שונים)
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
      testMatch: 'tests/**'
    },
  ],
});