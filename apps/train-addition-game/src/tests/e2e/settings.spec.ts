import { test, expect } from "@playwright/test";

test.describe("Settings Page E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/settings");
  });

  test("Settings Navigation from Game", async ({ page }) => {
    // Go directly to settings
    await page.goto("/settings");
    // Click header back button
    await page.getByRole("button", { name: "חזרה למשחק" }).click();
    await expect(page).toHaveURL(/\/game/);
  });

  test("Change Game Mode", async ({ page }) => {
    const modeSelect = page.getByRole("combobox").first();
    // Select Manual
    await modeSelect.selectOption("manual_end");
    await page.reload();
    await expect(modeSelect).toHaveValue("manual_end");
  });

  test("Change Numbers Range", async ({ page }) => {
    const inputs = page.locator("input[type=number]");
    await inputs.nth(0).fill("5");
    await inputs.nth(1).fill("3");

    // Trigger change event just in case
    await inputs.nth(0).press("Tab");

    await page.reload();
    await expect(inputs.nth(0)).toHaveValue("5");
    await expect(inputs.nth(1)).toHaveValue("3");
  });

  test("Scroll and Modify Booster Settings", async ({ page }) => {
    // Ensure page container has overflow class
    const container = page.locator(".overflow-y-auto");
    await expect(container).toBeAttached();

    // Ensure booster is enabled to show the section
    // Check if toggle is off
    const boosterToggle = page.getByRole("button", { name: "הפעלת חיזוקים" });
    const isChecked = await boosterToggle.getAttribute("class");
    if (isChecked && isChecked.includes("bg-slate-200")) {
      await boosterToggle.click();
    }

    // Find turns per reward input
    // Note: RTL might affect visual order but DOM order should be logical.
    const turnsLabel = page.getByText("תורות לחיזוק");
    // We expect it to be visible now
    await expect(turnsLabel).toBeVisible({ timeout: 5000 });
  });
});
