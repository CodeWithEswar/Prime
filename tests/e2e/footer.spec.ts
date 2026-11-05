import { test, expect } from "@playwright/test";

test("footer resolves into a named terminal and a useful numbered rail", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.addStyleTag({ content: "nextjs-portal{display:none!important;}" });
  const footer = page.locator("footer.cinematic-footer");
  await expect(
    footer.getByRole("heading", { name: "PREPARATION SHOULD LEAD SOMEWHERE." })
  ).toBeVisible();
  await expect(footer.locator(".footer-terminal svg")).toBeVisible();
  await expect(footer.locator(".footer-link-number")).toHaveText([
    "01",
    "02",
    "03",
    "04",
    "05",
  ]);
  await expect(footer.locator(".footer-brand-definition")).toContainText(
    "Preparation Roadmap for Interviews"
  );
  await expect(
    footer.getByRole("link", { name: "Sign in to PRIME", exact: true })
  ).toHaveAttribute("href", "/login");
  const top = footer.getByRole("link", { name: "Back to top", exact: true });
  await top.focus();
  await expect(top).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(120);
});

test("footer keeps its hierarchy, bounds, and mobile navigation across widths", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  for (const width of [320, 375, 430, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    const escaped = await page
      .locator(
        ".footer-arrival h2,.footer-terminal,.cinematic-wordmark,.footer-navigation-rail,.cinematic-footer-bottom,.footer-return"
      )
      .evaluateAll((els) =>
        els
          .filter((el) => {
            const r = el.getBoundingClientRect();
            return r.left < -1 || r.right > innerWidth + 1;
          })
          .map((el) => el.className)
      );
    expect(escaped, `footer overflow at ${width}`).toEqual([]);
    if (await page.evaluate(() => matchMedia("(max-width:767px)").matches)) {
      const rows = await page
        .locator(".footer-navigation-rail li")
        .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().y));
      expect(rows.every((y, i) => i === 0 || y > rows[i - 1])).toBe(true);
    }
  }
  await expect(page.locator(".footer-wordmark-reveal")).toHaveCSS("transform", "none");
  await expect(page.locator(".footer-wordmark-reveal")).toHaveCSS("clip-path", "none");
});
