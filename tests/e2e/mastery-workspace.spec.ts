import { test, expect } from "./support/shell-session";

test("shows actual Core evidence and opens a keyboard-accessible evidence lens", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 820 });
  await page.goto("/mastery");
  await expect(page.getByRole("heading", { name: "Skill evidence map" })).toBeVisible({
    timeout: 45000,
  });
  const map = page.getByRole("group", { name: "Skill Evidence Map" });
  const skill = map.getByRole("button", { name: /^Arrays,/ });
  for (const width of [320, 360, 390, 768]) {
    await page.setViewportSize({ width, height: 820 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
    ).toBe(true);
    const bounds = await skill.boundingBox();
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(820);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
    await page.getByRole("combobox", { name: "Evidence level" }).click();
    await expect(page.getByRole("option", { name: /Needs evidence/i })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("listbox")).toBeHidden();
    await skill.focus();
    await page.keyboard.press("Enter");
    const lens = page.getByRole("dialog", { name: /^Skill details for / });
    await expect(lens.getByRole("link", { name: /01 Matrix.*mastered/i })).toBeVisible();
    const problem = lens.getByRole("link", { name: /Two Sum.*unseen/i });
    await problem.scrollIntoViewIfNeeded();
    await expect(problem).toBeInViewport();
    await expect(lens.getByRole("button", { name: "Close" })).toBeInViewport();
    await page.keyboard.press("Escape");
    await expect(lens).toBeHidden();
    await expect(skill).toBeFocused();
  }
  await page.setViewportSize({ width: 1440, height: 950 });
  const inlineLens = page.getByRole("region", { name: /^Evidence Lens for/ });
  await expect(inlineLens).toBeVisible();
  const lensBounds = await inlineLens.boundingBox();
  expect(lensBounds!.x + lensBounds!.width).toBeLessThanOrEqual(1440);
  const workspace = page.locator(".mastery-shell");
  await workspace.evaluate((element) => {
    element.style.maxWidth = "740px";
  });
  await expect(inlineLens).toBeHidden();
  await skill.click();
  const compactLens = page.getByRole("dialog", { name: /^Skill details for / });
  await expect(compactLens).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(compactLens).toBeHidden();
  await workspace.evaluate((element) => {
    element.style.removeProperty("max-width");
  });
  await expect(inlineLens).toBeVisible();
  const level = page.getByRole("combobox", { name: "Evidence level" });
  await level.click();
  await page.getByRole("option", { name: /Needs evidence/i }).click();
  await expect(level).toContainText("Needs evidence");
  await page
    .getByRole("searchbox", { name: "Search evidence map" })
    .fill("nothing-matches");
  await expect(page.getByText("No skills match this view.")).toBeVisible();
});

test("shows derived Roadmap mastery and the problem evidence breakdown", async ({
  page,
}) => {
  test.setTimeout(150000);
  await page.goto("/roadmap", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("link", { name: "01 Matrix", exact: true }).first()
  ).toBeVisible({ timeout: 45000 });
  await expect(page.getByText("Mastered", { exact: true })).toHaveCount(1);
  await page.goto("/practice/dsa/01-matrix", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Mastery evidence" })).toBeVisible({
    timeout: 45000,
  });
  await expect(
    page.locator("#mastery-evidence").getByText("Evidence breakdown")
  ).toBeVisible();
  const mastery = page
    .getByRole("navigation", { name: "Primary Navigation" })
    .getByRole("group", { name: "Understand" })
    .getByRole("link", { name: "Mastery", exact: true });
  await mastery.click();
  await expect(page).toHaveURL(/\/mastery$/);
  await expect(mastery).toHaveAttribute("aria-current", "page");
});
