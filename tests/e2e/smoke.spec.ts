import { test, expect } from "@playwright/test";

test("landing tells the preparation story and links only to existing sections", async ({
  page,
}) => {
  await page.goto("/");
  // Keep development tooling from intercepting product interactions.
  await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Prepare with");
  await expect(page.locator("main")).not.toContainText(
    /Supabase|Cloudflare|Workers|PostgreSQL|10,000|success rate/i
  );
  await expect(page.locator(".prime-landing")).not.toContainText(/[↗↘↙↖↑↓←→]/);
  for (const href of await page
    .locator('a[href^="#"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute("href")!))) {
    await expect(page.locator(href)).toHaveCount(1);
  }
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /og-default.png/
  );
});

test("responsive layouts keep content within the viewport", async ({ page }) => {
  await page.goto("/");
  // Keep development tooling from intercepting product interactions.
  await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
  await expect(page.locator("h1")).toBeVisible();
  for (const width of [
    320, 360, 375, 390, 430, 768, 1024, 1280, 1366, 1440, 1536, 1920,
  ]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
    ).toBe(true);
    const headline = await page.locator("h1").boundingBox();
    expect(headline!.x).toBeGreaterThanOrEqual(0);
    expect(headline!.x + headline!.width).toBeLessThanOrEqual(width);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("navigation", { name: "Mobile navigation", exact: true })
    .getByRole("link", { name: "Roadmap" })
    .click();
  await expect(page.getByRole("button", { name: "Open navigation" })).toHaveAttribute(
    "aria-expanded",
    "false"
  );
});

test("keyboard navigation and reduced motion remain usable", async ({
  page,
  browserName,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  // Keep development tooling from intercepting product interactions.
  await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
  // WebKit's link tabbing policy varies by host; verify keyboard activation from focus.
  if (browserName === "webkit")
    await page.getByRole("link", { name: "Skip to content" }).focus();
  else await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
  expect(
    await page.locator("html").evaluate((el) => getComputedStyle(el).scrollBehavior)
  ).toBe("auto");
  await page.locator("#roadmap").scrollIntoViewIfNeeded();
  expect(
    await page
      .locator(".geometry-hero")
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).transform))
  ).toEqual(["none", "none"]);
});

test("reduced motion and no-JavaScript retain the complete landing page", async ({
  browser,
}) => {
  const context = await browser.newContext({
    reducedMotion: "reduce",
    javaScriptEnabled: false,
  });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Start Preparing", exact: true })
  ).toBeVisible();
  await expect(page.locator(".geometry-hero svg")).toHaveCount(2);
  await expect(page.locator(".geometry-hero svg").first()).toBeVisible();
  await expect(page.locator(".geometry-hero svg").last()).toBeVisible();
  await expect(page.locator(".mastery-node")).toHaveCount(6);
  await expect(page.locator("#mastery-topic-insight")).toContainText("NEEDS ATTENTION");
  expect(
    await page.locator("html").evaluate((el) => getComputedStyle(el).scrollBehavior)
  ).toBe("auto");
  await context.close();
});
