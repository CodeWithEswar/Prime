import { test, expect } from "./support/shell-session";

test.describe("DSA Practice & Problem Tracking", () => {
  test.beforeEach(async ({ page }) => {
    // Keep development overlay portals from intercepting clicks
    await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
  });

  test("/practice redirects cleanly to /practice/dsa", async ({ page }) => {
    await page.goto("/practice");
    await expect(page).toHaveURL(/\/practice\/dsa/);
  });

  test("renders DSA practice catalog with fixture data and headers", async ({ page }) => {
    await page.goto("/practice/dsa");
    await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });

    // 1. Header displays editorial title & summary metrics
    await expect(page.getByRole("heading", { name: "DSA Practice" })).toBeVisible();

    // 2. Context Rail displays Collections and Topics
    await expect(page.getByText("Collections", { exact: true })).toBeVisible();
    await expect(page.getByText("Roadmap Topics", { exact: true })).toBeVisible();

    // 3. Problem list displays real canonical problems
    await expect(page.locator("text=01 Matrix").first()).toBeVisible();

    // 4. External link verification (never hijack coding practice)
    const externalLink = page
      .locator('a[target="_blank"][rel="noopener noreferrer"]')
      .first();
    await expect(externalLink).toBeVisible();
  });

  test("searching filters the canonical catalog dynamically", async ({ page }) => {
    await page.goto("/practice/dsa");
    await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });

    const searchInput = page.getByPlaceholder(
      "Search problems by title, slug, or topic..."
    );
    await expect(searchInput).toBeVisible();

    // Search for "Two Sum"
    await searchInput.fill("Two Sum");
    await page.waitForTimeout(600); // Wait for debounce and network query

    // Verify Two Sum appears in the filtered results
    await expect(page.locator("text=Two Sum").first()).toBeVisible();
  });

  test("clicking a problem opens its dedicated page with an attempt dialog", async ({
    page,
  }) => {
    await page.goto("/practice/dsa");
    await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });

    // Click on 01 Matrix
    const matrixRow = page.locator("text=01 Matrix").first();
    await expect(matrixRow).toBeVisible();
    await matrixRow.click();

    await expect(page).toHaveURL(/\/practice\/dsa\/01-matrix/);
    await expect(
      page.getByRole("heading", { name: "01 Matrix", level: 1 })
    ).toBeVisible();
    await expect(page.getByRole("dialog")).toHaveCount(0);

    // Verify Attempt CTA and External link
    await expect(page.getByRole("button", { name: "Record Attempt" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Open on LeetCode" })).toBeVisible();

    // Click Record Attempt to open dialog
    await page.getByRole("button", { name: "Record Attempt" }).click();

    // Attempt Dialog should open
    await expect(page.getByRole("heading", { name: "Record Attempt" })).toBeVisible();
    await expect(page.getByText("Resolution Outcome")).toBeVisible();
    await expect(page.getByText("Time Taken (Minutes)")).toBeVisible();
    await expect(page.getByText("Confidence Rating")).toBeVisible();
  });

  test("mobile viewport keeps content within bounds without horizontal scroll overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/practice/dsa");
    await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });

    const isNoOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    );
    expect(isNoOverflow).toBe(true);
  });
});
