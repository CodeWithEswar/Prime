import { test, expect } from "./support/shell-session";

test.describe("PRIME Core DSA Roadmap & Learning Spine", () => {
  test.beforeEach(async ({ page }) => {
    // Keep development overlay portals from intercepting clicks
    await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
  });

  test("renders DSA Roadmap with header, stats, continue hero, and stages", async ({
    page,
  }) => {
    await page.goto("/roadmap/dsa");
    await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });

    // 1. Header & Telemetry
    await expect(page.getByText("CURRICULUM · PRIME CORE")).toBeVisible();
    await expect(page.getByRole("heading", { name: "DSA Roadmap" })).toBeVisible();
    await expect(page.getByText(/Solved/)).toBeVisible();
    await expect(page.getByText("In Progress")).toBeVisible();
    await expect(page.getByText("Remaining")).toBeVisible();

    // 2. Continue Hero card
    await expect(page.getByText("NEXT UP IN YOUR CURRICULUM")).toBeVisible();
    await expect(page.getByRole("link", { name: /Continue Step/i })).toBeVisible();

    // 3. Stage 01 and problems list
    await expect(page.getByText("STAGE 01", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Arrays, Hashing & String Manipulation" })
    ).toBeVisible();

    // 4. Learning Spine problem row
    await expect(page.getByRole("link", { name: "Two Sum" }).first()).toBeVisible();
  });

  test("navigates from roadmap to problem workspace and returns via back link", async ({
    page,
  }) => {
    await page.goto("/roadmap");
    await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });

    // Click the 01 Matrix problem row
    const problemLink = page.getByRole("link", { name: "01 Matrix" }).first();
    await expect(problemLink).toBeVisible();
    await problemLink.click();

    // URL should have ?from=roadmap
    await expect(page).toHaveURL(/.*\/practice\/dsa\/01-matrix\?from=roadmap/);

    // Problem page loads and displays title
    await expect(
      page.getByRole("heading", { name: "01 Matrix", level: 1 })
    ).toBeVisible();

    // Problem page displays roadmap context
    await expect(page.getByText("PRIME Core Curriculum Roadmap")).toBeVisible();

    // Problem page back button says "Back to DSA Roadmap"
    const backBtn = page.getByRole("link", { name: /Back to DSA Roadmap/i });
    await expect(backBtn).toBeVisible();
    await backBtn.click();

    // Returns cleanly to /roadmap
    await expect(page).toHaveURL(/.*\/roadmap/);
    await expect(page.getByRole("heading", { name: "DSA Roadmap" })).toBeVisible();
  });

  test("filters problems by search query and category pills", async ({ page }) => {
    await page.goto("/roadmap/dsa");
    await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });

    // Search for "LRU Cache"
    const searchInput = page.getByPlaceholder("Search problems, patterns...");
    await searchInput.fill("LRU Cache");

    await expect(page.getByRole("link", { name: "LRU Cache" }).first()).toBeVisible();

    // Reset search
    await searchInput.fill("");

    // Click "Completed" filter
    const completedFilter = page.getByRole("button", { name: /Completed/i });
    await completedFilter.click();
    await expect(completedFilter).toHaveClass(/bg-\[#1E1E1E\]/);
  });

  test("renders cleanly on mobile viewport (390px)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/roadmap/dsa");
    await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });

    // Header visible on mobile
    await expect(page.getByRole("heading", { name: "DSA Roadmap" })).toBeVisible();

    // Continue hero visible and responsive
    await expect(page.getByText("NEXT UP IN YOUR CURRICULUM")).toBeVisible();
    await expect(page.getByRole("link", { name: /Continue Step/i })).toBeVisible();

    // Stage 01 problem visible
    await expect(page.getByRole("link", { name: "Two Sum" }).first()).toBeVisible();

    // Ensure no horizontal scroll overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(390);
  });
});
