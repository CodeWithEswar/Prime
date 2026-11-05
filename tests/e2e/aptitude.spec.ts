import { test, expect } from "./support/shell-session";

test.beforeEach(async ({ page }) => {
  await page.route("https://www.youtube-nocookie.com/**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<html><body style='background:#080808;color:white'>Isolated video player fixture</body></html>",
    })
  );
});

test("course views fit phones, tablets, and desktop with real lesson titles", async ({
  page,
}) => {
  test.setTimeout(150000);
  await page.goto("/aptitude");
  await expect(
    page.getByRole("heading", { name: "Aptitude & Reasoning", exact: true })
  ).toBeVisible({ timeout: 45000 });
  for (const tab of [
    "Learning plan",
    "All concepts",
    "Subjects",
    "Review & practice",
    "Progress",
  ]) {
    await page.getByRole("tab", { name: tab, exact: true }).click();
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
        tab + " at " + width
      ).toBeLessThanOrEqual(width);
    }
  }
  await page.getByRole("tab", { name: "Learning plan", exact: true }).click();
  await expect(page.getByTestId("aptitude-concept")).toHaveCount(4);
  await expect(page.getByText("No video required", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Curated Instructor", { exact: true })).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: /Watch Number System.*S Chand Academy/ })
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 900 });
  await page
    .getByRole("heading", { name: "Aptitude & Reasoning", exact: true })
    .scrollIntoViewIfNeeded();
  await page.screenshot({
    path: ".generated/planner/aptitude-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page
    .getByRole("heading", { name: "Aptitude & Reasoning", exact: true })
    .scrollIntoViewIfNeeded();
  await page.screenshot({
    path: ".generated/planner/aptitude-desktop.png",
    fullPage: false,
  });
});

test("previously missing reasoning and verbal lessons open the correct topic and alternative", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/aptitude");
  await page.getByRole("combobox", { name: "Subject", exact: true }).click();
  await page.getByRole("option", { name: "Logical reasoning", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Number, alphabet & mixed series", exact: true })
  ).toBeVisible();
  const mixed = page.getByTestId("aptitude-concept").filter({
    has: page.getByRole("heading", { name: "Mixed series reasoning", exact: true }),
  });
  await mixed
    .getByRole("button", { name: /Watch Alphanumeric Series Explanation/ })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("heading", { name: /Alphanumeric Series Explanation/ })
  ).toBeVisible();
  await expect(dialog.locator("iframe")).toHaveAttribute("src", /embed\/gi_7qz2Uljg/);
  await expect(dialog.getByRole("combobox", { name: "Choose lesson" })).toHaveCount(0);
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  await page.getByRole("combobox", { name: "Subject", exact: true }).click();
  await page.getByRole("option", { name: "Verbal ability", exact: true }).click();
  await page
    .getByRole("button", { name: /Watch Basic English Grammar: Parts of Speech/ })
    .click();
  await expect(dialog.locator("iframe")).toHaveAttribute("src", /embed\/SceDmiBEESI/);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth)
  ).toBeLessThanOrEqual(390);
  await expect(
    dialog.getByRole("link", { name: "Open on YouTube", exact: true })
  ).toHaveAttribute("href", "https://www.youtube.com/watch?v=SceDmiBEESI");
  await dialog.getByRole("combobox", { name: "Choose lesson" }).click();
  await page.getByRole("option", { name: /Alternative/ }).click();
  await expect(dialog.locator("iframe")).toHaveAttribute("src", /embed\/chjmnCSPnbw/);
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
});

test("directory search finds sourced DI lessons and hides unavailable records honestly", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/aptitude");
  await page.getByRole("tab", { name: "All concepts", exact: true }).click();
  await page.getByRole("searchbox", { name: "Search concepts" }).fill("Stacked bar");
  await expect(page.getByTestId("aptitude-directory-concept")).toHaveCount(1);
  await page
    .getByRole("button", { name: /Watch How to draw and interpret Stacked Bar Charts/ })
    .click();
  await expect(page.getByRole("dialog").locator("iframe")).toHaveAttribute(
    "src",
    /embed\/2ndlt3A6s6U/
  );
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Close", exact: true })
    .click();
  await page.getByRole("button", { name: "Clear search", exact: true }).click();
  await page.getByRole("combobox", { name: "Filter lessons", exact: true }).click();
  await page.getByRole("option", { name: "Needs a video lesson", exact: true }).click();
  await expect(page.getByTestId("aptitude-directory-concept")).toHaveCount(6);
  await expect(page.getByRole("button", { name: /^Watch / })).toHaveCount(0);
  await expect(page.getByText(/English lesson awaiting confirmation/)).toHaveCount(6);
});

test("watching one shared video keeps the other concept separate after reload", async ({
  page,
}) => {
  await page.goto("/aptitude");
  await page.getByRole("combobox", { name: "Jump to day", exact: true }).click();
  await page.getByRole("option", { name: /^Day 9 ·/ }).click();
  const work = page
    .getByTestId("aptitude-concept")
    .filter({ has: page.getByRole("heading", { name: "Time and work", exact: true }) });
  const efficiency = page
    .getByTestId("aptitude-concept")
    .filter({ has: page.getByRole("heading", { name: "Work efficiency", exact: true }) });
  await work.getByRole("button", { name: /Watch Time and Work/ }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Mark as watched", exact: true })
    .click();
  await expect(
    page.getByRole("dialog").getByRole("button", { name: "Watched", exact: true })
  ).toBeVisible();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Close", exact: true })
    .click();
  await expect(work.getByText("Main lesson · Watched", { exact: true })).toBeVisible();
  await expect(
    efficiency.getByText("Main lesson · Watched", { exact: true })
  ).toHaveCount(0);
  await page.reload();
  await page.getByRole("combobox", { name: "Jump to day", exact: true }).click();
  await page.getByRole("option", { name: /^Day 9 ·/ }).click();
  await expect(work.getByText("Main lesson · Watched", { exact: true })).toBeVisible();
  await expect(
    efficiency.getByText("Main lesson · Watched", { exact: true })
  ).toHaveCount(0);
});

test("review cards navigate to their real learning day", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/aptitude");
  await page.getByRole("tab", { name: "Review & practice", exact: true }).click();
  await page.getByRole("button", { name: "Open review day", exact: true }).nth(1).click();
  await expect(
    page.getByRole("tab", { name: "Learning plan", exact: true })
  ).toHaveAttribute("data-state", "active");
  await expect(
    page.getByRole("heading", { name: "Reasoning review", exact: true })
  ).toBeVisible();
});
