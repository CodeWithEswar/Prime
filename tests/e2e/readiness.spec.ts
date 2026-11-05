import { test, expect } from "./support/shell-session";

test("Interview Readiness Engine workspace loads, inspects competency, and navigates tabs", async ({
  page,
}) => {
  // Mobile check first
  await page.setViewportSize({ width: 320, height: 580 });
  await page.goto("/readiness");

  // Verify page title & header
  await expect(
    page.getByRole("heading", { name: "Interview Readiness", exact: true })
  ).toBeVisible({ timeout: 45000 });

  // Verify summary metrics exist
  await expect(page.getByText("Core Requirements")).toBeVisible();
  await expect(page.getByText("Evidence Aligned", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Target profile" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Company emphasis" })).toBeVisible();
  const compare = page.getByRole("button", { name: "Compare Targets" });
  await compare.click();
  const comparison = page.getByRole("dialog", { name: "Compare targets" });
  await expect(comparison.getByText("Current target", { exact: true })).toBeVisible();
  await expect(
    comparison.getByRole("button", { name: "Close", exact: true })
  ).toBeInViewport();
  const comparisonBounds = await comparison.boundingBox();
  expect(comparisonBounds!.width).toBeLessThan(320);
  expect(comparisonBounds!.height).toBeLessThan(580);
  await page.keyboard.press("Escape");
  await expect(comparison).toBeHidden();
  await expect(compare).toBeFocused();
  await expect(
    page.getByRole("link", { name: "Open chat", exact: true })
  ).toHaveAttribute("href", /context=readiness/);

  // Test responsive layout - no horizontal overflow
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
  ).toBe(true);

  // Verify Tab navigation
  const landscapeTab = page.getByRole("tab", { name: /Landscape/i });
  const matrixTab = page.getByRole("tab", { name: /Evidence Matrix/i });
  const depTab = page.getByRole("tab", { name: /Dependency Map/i });
  const trajTab = page.getByRole("tab", { name: /Evidence Trajectory/i });
  const gapsTab = page.getByRole("tab", { name: /Priority Gaps/i });

  await expect(landscapeTab).toBeVisible();
  await expect(matrixTab).toBeVisible();
  await expect(depTab).toBeVisible();
  await expect(trajTab).toBeVisible();
  await expect(gapsTab).toBeVisible();

  // Switch to Dependency Map tab
  await depTab.click();
  await expect(page.getByRole("heading", { name: "Prerequisite chains" })).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
  ).toBe(true);

  // Switch to Evidence Trajectory tab
  await trajTab.click();
  await expect(
    page.getByText(/Preparation Evidence Growth Timeline|No Historical Trajectory Yet/i)
  ).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
  ).toBe(true);

  // Switch to Evidence Matrix tab
  await matrixTab.click();
  await expect(page.getByPlaceholder(/Search competencies/i)).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
  ).toBe(true);
  await page.getByRole("searchbox", { name: "Search competencies" }).fill("Arrays");
  await expect(
    page.getByRole("button", { name: /Inspect Arrays & Hashing/i })
  ).toBeVisible();

  // Switch to Priority Gaps tab
  await gapsTab.click();
  await expect(page.getByText(/Priority Preparation Gaps/i)).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
  ).toBe(true);

  // Switch back to Landscape tab
  await landscapeTab.click();
  await expect(page.getByText("Data Structures & Algorithms")).toBeVisible();

  // Find a competency card (e.g., Arrays & Hashing) and click to open inspector
  const arraysComp = page.getByRole("button", { name: /^Arrays & Hashing/i }).first();
  await arraysComp.click();

  // Inspector sheet opens
  const inspector = page.getByRole("dialog");
  await expect(inspector).toBeVisible();
  await expect(
    inspector.getByRole("heading", { name: "Arrays & Hashing", exact: true })
  ).toBeVisible();
  await expect(
    inspector.getByRole("link", { name: /Plan Improvement/i })
  ).toBeInViewport();
  await expect(inspector.getByRole("button", { name: "Close" })).toBeInViewport();

  // Close inspector via Dismiss button
  await inspector.getByRole("button", { name: /Dismiss/i }).click();
  await expect(inspector).toBeHidden();
  await expect(arraysComp).toBeFocused();
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
    ).toBe(true);
  }
});
