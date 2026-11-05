import { test, expect } from "@playwright/test";

test("journey scrolls through all five stages and preview never overrides progress", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.addStyleTag({ content: "nextjs-portal{display:none!important;}" });
  const journey = page.locator("#journey");
  const stages = journey.locator(".preparation-stage");
  await expect(stages).toHaveCount(5);
  await expect(journey.locator(".preparation-stage-icon svg")).toHaveCount(5);
  const scrollToProgress = async (progress: number) => {
    await journey.evaluate((el, p) => {
      const top = el.getBoundingClientRect().top + scrollY;
      window.scrollTo({
        top:
          top -
          innerHeight * 0.22 +
          p * (el.getBoundingClientRect().height - innerHeight * 0.63),
        behavior: "instant",
      });
    }, progress);
  };
  for (const [index, progress] of [0.02, 0.35, 0.56, 0.77, 0.98].entries()) {
    await scrollToProgress(progress);
    await expect(stages.nth(index)).toHaveAttribute("data-state", "active");
    await expect(journey.locator('[aria-current="step"]')).toHaveCount(1);
    if (index)
      await expect(stages.nth(index - 1)).toHaveAttribute("data-state", "completed");
  }
  await scrollToProgress(0.56);
  await expect(stages.nth(2)).toHaveAttribute("data-state", "active");
  await stages.nth(0).getByRole("link").hover();
  await expect(stages.nth(0)).toHaveAttribute("data-preview", "true");
  await expect(stages.nth(2)).toHaveAttribute("data-state", "active");
  await journey.getByRole("heading", { level: 2 }).hover();
  await expect(stages.nth(0)).toHaveAttribute("data-preview", "false");
  await stages.nth(0).getByRole("link").focus();
  await expect(stages.nth(0).getByRole("link")).toBeFocused();
  await expect(stages.nth(2)).toHaveAttribute("data-state", "active");
});

test("journey stays readable across widths, reduced motion, and no JavaScript", async ({
  browser,
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#journey");
  await page.addStyleTag({ content: "nextjs-portal{display:none!important;}" });
  const nodes = page.locator(".preparation-stage-node");
  for (const width of [320, 360, 375, 390, 430, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    const rects = await nodes.evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, right: r.right, bottom: r.bottom };
      })
    );
    for (const rect of rects) {
      expect(rect.x).toBeGreaterThanOrEqual(0);
      expect(rect.right).toBeLessThanOrEqual(width);
    }
    if (width < 1100) {
      await expect(page.locator(".journey-path-mobile")).toBeVisible();
      for (let i = 1; i < rects.length; i++)
        expect(rects[i].y).toBeGreaterThan(rects[i - 1].bottom);
    } else await expect(page.locator(".journey-path-desktop")).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
    ).toBe(true);
  }
  expect(
    await page
      .locator(".preparation-journey-sticky")
      .evaluate((el) => getComputedStyle(el).position)
  ).toBe("relative");
  const context = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await context.newPage();
  await staticPage.goto("/");
  await expect(staticPage.locator("#journey h3")).toHaveText([
    "Plan",
    "Practice",
    "Review",
    "Revise",
    "Master",
  ]);
  await expect(staticPage.locator(".preparation-stage-icon svg")).toHaveCount(5);
  await context.close();
});
