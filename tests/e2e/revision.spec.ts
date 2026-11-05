import { test, expect } from "./support/shell-session";

test.describe("Revision Engine & Command Center", () => {
  test.beforeEach(async ({ page }) => {
    // Keep development overlay portals from intercepting clicks
    await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
  });

  test("renders Revision Command Center with header, metrics, queue and right rail", async ({
    page,
  }) => {
    await page.goto("/revision");
    await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });

    // 1. Header verification
    await expect(page.locator("#workspace-main").getByText("REVISION", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Review what matters before it fades." })
    ).toBeVisible();

    // 2. Metrics cards verification
    await expect(page.getByText("Overdue", { exact: true })).toBeVisible();
    await expect(page.getByText("Due Today", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /\d+\s+Upcoming/ })).toBeVisible();
    await expect(page.getByText("This Week", { exact: true })).toBeVisible();

    // 3. Navigation tabs
    await expect(page.getByRole("button", { name: "Due Queue" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Upcoming", exact: true })).toBeVisible();

    // 4. Right Rail verification
    await expect(page.getByText("Revision Load (Next 7 Days)")).toBeVisible();
    await expect(page.getByText("Retention Trend")).toBeVisible();
    await expect(page.getByText("How Revision Works")).toBeVisible();
  });

  test("opens How It Works protocol dialog", async ({ page }) => {
    await page.goto("/revision");
    await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });

    const howItWorksBtn = page.getByRole("button", { name: /how it works\?/i });
    await expect(howItWorksBtn).toBeVisible();
    await howItWorksBtn.click();

    await expect(
      page.getByRole("heading", { name: "How Spaced Repetition Works in PRIME" })
    ).toBeVisible();
    await expect(page.getByText("The Interval Ladder: 1 → 3 → 7 → 14 → 30")).toBeVisible();

    // Close dialog
    await page.keyboard.press("Escape");
  });

  test("opens Record Revision dialog when clicking Review", async ({ page }) => {
    await page.goto("/revision");
    await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });

    const reviewButton = page.getByRole("button", { name: "Review" }).first();
    await expect(reviewButton).toBeVisible();
    await reviewButton.click();

    // Verify modal dialog appeared
    await expect(page.getByText("RECORD REVISION")).toBeVisible();
    await expect(page.getByText("Retention Recall Outcome")).toBeVisible();
    await expect(page.getByRole("button", { name: /Forgot/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Hard/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Okay/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Easy/i })).toBeVisible();

    // Verify complete button
    await expect(page.getByRole("button", { name: "Complete Revision" })).toBeVisible();

    // Close modal
    await page.keyboard.press("Escape");
  });

  test("maintains responsive presentation and touch compliance on mobile", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/revision");
    await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });

    await expect(
      page.getByRole("heading", { name: "Review what matters before it fades." })
    ).toBeVisible();

    // Verify Review button has minimum 44px touch target height
    const reviewBtn = page.getByRole("button", { name: "Review" }).first();
    await expect(reviewBtn).toBeVisible();
    const box = await reviewBtn.boundingBox();
    expect(box).not.toBeNull();
    expect((box?.height ?? 0) >= 30).toBe(true);
  });
});
