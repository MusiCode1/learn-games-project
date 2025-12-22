import { test, expect } from "@playwright/test";

test.describe("Train Addition Game E2E", () => {
  test("Manual Mode Flow (Happy Path)", async ({ page }) => {
    // Inject Settings: Manual Mode, Max 1+1, Booster Off
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "train-addition-settings",
        JSON.stringify({
          schemaVersion: 4,
          maxA: 1,
          maxB: 1,
          gameMode: "manual_end",
          boosterEnabled: false,
        })
      );
    });
    await page.goto("/game");

    // 1. Check initial state - Expect "שים X קרונות"
    await expect(page.getByText("שים")).toBeVisible({ timeout: 10000 });
    const addCarBtn = page.getByRole("button", { name: "הוסף קרון" });

    // Phase A: Add cars for first number
    const greenBubble = page.locator(".bg-green-500").first();
    await expect(greenBubble).toBeVisible();

    // Wait for text to be present (non-empty)
    await expect(async () => {
      const t = await greenBubble.innerText();
      expect(t && t.trim().length > 0).toBeTruthy();
    }).toPass();

    const textA = await greenBubble.innerText();
    const targetA = parseInt(textA?.trim() || "0");

    for (let i = 0; i < targetA; i++) {
      await addCarBtn.click();
      await page.waitForTimeout(200);
    }

    // Check transition to Phase B
    await expect(page.getByTestId("instruction-text")).toContainText(
      "הוסף עוד",
      { timeout: 15000 }
    );

    const blueBubble = page.locator(".bg-blue-500").first();
    await expect(blueBubble).toBeVisible();
    const textB = await blueBubble.innerText();
    const targetB = parseInt(textB?.trim() || "0");

    for (let i = 0; i < targetB; i++) {
      await addCarBtn.click();
      await page.waitForTimeout(100);
    }

    // Answer Phase
    const total = targetA + targetB;
    await expect(page.locator("#answer-buttons-container")).toBeVisible();
    await page
      .getByRole("button", { name: total.toString(), exact: true })
      .click();

    // Verify Feedback
    await expect(page.getByText("נכון!")).toBeVisible();

    // Verify Level End Screen (Manual Mode)
    await expect(page.getByText("סיימת את השלב")).toBeVisible();

    // Click Play Again
    await page.getByRole("button", { name: "שחק שוב" }).click();

    // Verify New Round Started
    await expect(page.getByText("שים")).toBeVisible();
    await expect(page.getByText("סיימת את השלב")).not.toBeVisible();
  });

  test("Continuous Mode Flow", async ({ page }) => {
    // Inject Settings: Continuous Mode, Max 1+1, Booster Off
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "train-addition-settings",
        JSON.stringify({
          schemaVersion: 4,
          maxA: 1,
          maxB: 1,
          gameMode: "continuous",
          boosterEnabled: false,
        })
      );
    });
    await page.goto("/game");

    // Play one round
    const addCarBtn = page.getByRole("button", { name: "הוסף קרון" });
    const greenBubble = page.locator(".bg-green-500").first();
    const targetA = parseInt((await greenBubble.innerText()) || "0");
    for (let i = 0; i < targetA; i++) {
      await addCarBtn.click();
      await page.waitForTimeout(50);
    }

    await expect(page.getByTestId("instruction-text")).toContainText(
      "הוסף עוד"
    );
    const blueBubble = page.locator(".bg-blue-500").first();
    const targetB = parseInt((await blueBubble.innerText()) || "0");
    for (let i = 0; i < targetB; i++) {
      await addCarBtn.click();
      await page.waitForTimeout(50);
    }

    const total = targetA + targetB;
    await page
      .getByRole("button", { name: total.toString(), exact: true })
      .click();
    await expect(page.getByText("נכון!")).toBeVisible();

    // Verify IMMEDIATE transition to next round (No Level End)
    // We expect to see "שים" again shortly, without seeing "סיימת את השלב"
    await expect(page.getByText("שים")).toBeVisible();
    await expect(page.getByText("סיימת את השלב")).not.toBeVisible();
  });

  test("Feedback: Wrong Answer Logic", async ({ page }) => {
    // Inject Settigns
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "train-addition-settings",
        JSON.stringify({
          schemaVersion: 4,
          maxA: 1,
          maxB: 1,
          gameMode: "manual_end",
        })
      );
    });
    await page.goto("/game");

    const addCarBtn = page.getByRole("button", { name: "הוסף קרון" });
    const greenBubble = page.locator(".bg-green-500").first();
    const targetA = parseInt((await greenBubble.innerText()) || "0");
    for (let i = 0; i < targetA; i++) {
      await addCarBtn.click();
      await page.waitForTimeout(50);
    }

    await expect(page.getByTestId("instruction-text")).toContainText(
      "הוסף עוד"
    ); // Wait for phase change
    const blueBubble = page.locator(".bg-blue-500").first();
    const targetB = parseInt((await blueBubble.innerText()) || "0");
    for (let i = 0; i < targetB; i++) {
      await addCarBtn.click();
      await page.waitForTimeout(50);
    }

    // Click WRONG answer
    const total = targetA + targetB;
    const wrongAnswer = total === 0 ? 1 : 0; // Simple wrong answer
    await page
      .getByRole("button", { name: wrongAnswer.toString(), exact: true })
      .click();

    // Verify Error Overlay
    await expect(page.getByText("לא נכון")).toBeVisible();
    await expect(page.getByText("המתן...")).toBeVisible();
  });
});
