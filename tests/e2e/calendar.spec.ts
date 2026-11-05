import { test, expect } from "./support/shell-session";

test.describe("PRIME Preparation Calendar — Temporal Planning Canvas E2E", () => {
  test("month view renders pulse grid, load rails, and opens day lens inspector", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/calendar");

    // Header context
    await expect(page.getByRole("region", { name: "Monthly Preparation Canvas" })).toBeVisible();
    await expect(page.locator("text=Preparation across time")).toBeVisible();

    // Check weekday column headers
    for (const day of ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]) {
      await expect(page.getByRole("columnheader", { name: day })).toBeVisible();
    }

    // Check grid cell presence and load rails
    const gridcells = page.getByRole("gridcell");
    await expect(gridcells.first()).toBeVisible();
    const count = await gridcells.count();
    expect(count).toBeGreaterThanOrEqual(28);

    // Day Lens inspector on desktop
    const dayLens = page.getByRole("region", { name: /Inspection details/ });
    await expect(dayLens).toBeVisible();

    // Select another day
    const thirdCell = gridcells.nth(2);
    await thirdCell.click();
    await expect(thirdCell).toHaveAttribute("aria-selected", "true");

    // Capture visual artifact for desktop
    await page.screenshot({
      path: "C:/Users/hp/.gemini/antigravity/brain/972a971a-9099-4efb-b994-6cbc4ac04847/calendar-month-desktop.png",
    });
  });

  test("switches between Month, Week, and Agenda views with operational integrity", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/calendar");

    // Switch to Week View
    const weekTab = page.getByRole("tab", { name: /week/i });
    await weekTab.click();
    await expect(
      page.getByText(/Weekly workload capacity and allocation/).filter({ visible: true })
    ).toBeVisible();

    // Capture visual artifact for week view
    await page.screenshot({
      path: "C:/Users/hp/.gemini/antigravity/brain/972a971a-9099-4efb-b994-6cbc4ac04847/calendar-week-desktop.png",
    });

    // Switch to Agenda View
    const agendaTab = page.getByRole("tab", { name: /agenda/i });
    await agendaTab.click();
    await expect(
      page.getByText(/CHRONOLOGICAL PREPARATION AGENDA/).filter({ visible: true })
    ).toBeVisible();

    // Capture visual artifact for agenda view
    await page.screenshot({
      path: "C:/Users/hp/.gemini/antigravity/brain/972a971a-9099-4efb-b994-6cbc4ac04847/calendar-agenda-desktop.png",
    });
  });

  test("mobile view transforms to date strip and inline agenda with zero horizontal overflow", async ({
    page,
  }) => {
    // Test 390px (iPhone 14) and 360px (Samsung Galaxy S8 / Android standard)
    for (const width of [390, 360]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/calendar");

      // Verify zero horizontal page overflow
      const hasOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth
      );
      expect(hasOverflow).toBe(false);

      // Verify mobile month map region
      const mobileMap = page.getByRole("region", { name: "Mobile Month Map" });
      await expect(mobileMap).toBeVisible();

      // Tap a date in compact map
      const dateButtons = mobileMap.locator("button");
      await expect(dateButtons.first()).toBeVisible();
      await dateButtons.nth(2).click();

      // Capture screenshot at 390px
      if (width === 390) {
        await page.screenshot({
          path: "C:/Users/hp/.gemini/antigravity/brain/972a971a-9099-4efb-b994-6cbc4ac04847/calendar-mobile-390.png",
        });
      }
    }
  });
});

