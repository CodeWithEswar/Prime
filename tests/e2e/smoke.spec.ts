import { test, expect } from "@playwright/test";

test.describe("PRIME Foundation Smoke Test", () => {
  test("loads foundation verification page with theme and controls", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Engineering Foundation Verification");
    await expect(
      page.getByRole("button", { name: /primary hardware cta/i })
    ).toBeVisible();
  });
});
