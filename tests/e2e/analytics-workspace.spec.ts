import { test, expect } from "./support/shell-session";

test.describe.configure({ timeout: 180000 });

test("inspects real fixture evidence across desktop and mobile analytics views", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto("/progress");
  await expect(page).toHaveURL(/\/analytics/, { timeout: 45000 });
  await expect(page.getByRole("heading", { name: "Analytics", exact: true })).toBeVisible(
    { timeout: 45000 }
  );
  const metrics = page.getByRole("definition").filter({ hasText: "50%" });
  await expect(metrics).toBeVisible();
  const pulse = page.getByRole("region", { name: "Preparation Pulse" });
  await expect(pulse.getByText("Selected day")).toBeVisible();
  await pulse.getByRole("button", { name: "Earlier" }).click();
  await expect(pulse.getByRole("button", { name: "Reset" })).toBeVisible();
  await pulse.getByRole("button", { name: "Reset" }).click();
  await pulse.getByText("View chart data").click();
  await expect(pulse.getByRole("table")).toBeVisible();

  for (const width of [320, 430, 390, 360, 768, 1440]) {
    await page.setViewportSize({ width, height: 850 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
    ).toBe(true);
    const bounds = await pulse.boundingBox();
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
  }

  await page.getByRole("combobox", { name: "Date range" }).click();
  await page.getByRole("option", { name: "Last 7 days" }).click();
  await expect(page).toHaveURL(/days=7/, { timeout: 20000 });
  await page.getByRole("combobox", { name: "Compare periods" }).click();
  await page.getByRole("option", { name: "Previous period" }).click();
  await expect(page).toHaveURL(/compare=previous/, { timeout: 20000 });
  const nav = page.getByRole("tablist", { name: "Analytics views" });
  const dsa = nav.getByRole("tab", { name: "DSA", exact: true });
  await page.setViewportSize({ width: 320, height: 850 });
  await dsa.click();
  await expect(page).toHaveURL(/view=dsa/, { timeout: 20000 });
  await expect(dsa).toHaveAttribute("aria-selected", "true");
  const filters = page.getByRole("group", { name: "DSA filters" });
  await expect(filters.getByRole("combobox")).toHaveCount(3);
  const trajectory = page.getByRole("region", { name: "Performance trajectory" });
  const performance = trajectory.getByRole("tab", { name: "Performance" });
  await performance.click();
  await expect(performance).toHaveAttribute("aria-selected", "true");
  await expect(trajectory.getByRole("tabpanel", { name: "Performance" })).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
  ).toBe(true);
  const filterBounds = await filters.boundingBox();
  expect(filterBounds!.x + filterBounds!.width).toBeLessThanOrEqual(320);
  await page.setViewportSize({ width: 320, height: 570 });
  const matrix = page.getByRole("group", { name: "Topic performance" });
  const topic = matrix.getByRole("button", { name: /Arrays/ }).first();
  await topic.click();
  const sheet = page.getByRole("dialog", { name: "Arrays" });
  await expect(sheet.getByRole("heading", { name: "Arrays", exact: true })).toBeFocused();
  await expect(sheet.getByRole("heading", { name: "Period performance" })).toBeVisible();
  await expect(sheet.getByText("Independently solved")).toBeVisible();
  await expect(sheet.getByRole("heading", { name: "Current mastery" })).toBeVisible();
  await expect(sheet.getByRole("link", { name: "Open mastery" })).toHaveAttribute(
    "href",
    /topic=stage-1%3A/
  );
  await expect(sheet.getByRole("link", { name: "Open practice" })).toBeInViewport();
  await expect(sheet.getByRole("button", { name: "Close" })).toBeInViewport();
  expect(
    await sheet.evaluate((element) => element.scrollWidth <= element.clientWidth)
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();
  await expect(topic).toBeFocused();
  await filters.getByRole("combobox", { name: "Difficulty" }).click();
  await page.getByRole("option", { name: "Easy", exact: true }).click();
  await expect(page).toHaveURL(/difficulty=EASY/, { timeout: 20000 });
  await topic.click();
  await expect(
    sheet.getByText("No attempts match this topic and the current filters.")
  ).toBeVisible();
  await expect(sheet.getByText("Median solve", { exact: true })).toBeHidden();
  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();
  await page.setViewportSize({ width: 1440, height: 850 });

  await dsa.focus();
  await dsa.press("ArrowRight");
  const time = nav.getByRole("tab", { name: "Time & execution" });
  await expect(time).toBeFocused();
  await expect(dsa).toHaveAttribute("aria-selected", "true");
  await time.press("Enter");
  await expect(page).toHaveURL(/view=time/, { timeout: 20000 });
  await expect(page.getByText("40 min", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("25 min", { exact: true }).first()).toBeVisible();
  await page.goBack();
  await expect(dsa).toHaveAttribute("aria-selected", "true");
  await nav.getByRole("tab", { name: "Consistency" }).click();
  await expect(page).toHaveURL(/view=consistency/, { timeout: 20000 });
  await page.getByRole("button", { name: /, Rest$/ }).click();
  await expect(page.getByText("Planned rest", { exact: true })).toBeVisible();
  await nav.getByRole("tab", { name: "Skills & retention" }).click();
  await expect(page).toHaveURL(/view=skills/, { timeout: 20000 });
  await expect(page.getByRole("heading", { name: "Mastery Landscape" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Retention evidence" })).toBeVisible();
  await nav.getByRole("tab", { name: "Insights" }).click();
  await expect(page).toHaveURL(/view=insights/, { timeout: 20000 });
  await expect(
    page.getByRole("link", { name: "Open Planner", exact: true })
  ).toHaveAttribute("href", "/plan");
});
