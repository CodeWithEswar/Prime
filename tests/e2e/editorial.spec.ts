import { test, expect } from "@playwright/test";

test("editorial previews demonstrate roadmap, planning, reflection, revision, and readiness", async ({
  page,
}) => {
  await page.goto("/");
  await page.addStyleTag({ content: "nextjs-portal{display:none!important;}" });
  const roadmap = page.getByLabel("Sample roadmap", { exact: true });
  await roadmap.getByRole("button", { name: "Binary Search", exact: true }).click();
  await expect(roadmap.locator(".fragment-insight")).toContainText("Further ahead");
  await expect(roadmap.locator(".fragment-insight h3")).toHaveText("Binary Search");
  const daily = page.getByLabel("Sample daily plan", { exact: true });
  await daily.getByRole("button", { name: "30 min", exact: true }).click();
  await expect(daily.locator(".daily-agenda li")).toHaveCount(2);
  await daily
    .getByRole("checkbox", { name: "Complete sample Binary Search", exact: true })
    .focus();
  await page.keyboard.press("Space");
  await expect(
    daily.getByRole("checkbox", { name: "Complete sample Binary Search", exact: true })
  ).toBeChecked();
  await expect(daily.locator(".fragment-note")).toContainText("1 of 2 steps complete");
  await daily.getByRole("button", { name: "90 min", exact: true }).click();
  await expect(daily.locator(".fragment-note")).toContainText("0 of 3 steps complete");
  await expect(daily).toContainText("SQL joins");
  const practice = page.getByLabel("Sample practice reflection", { exact: true });
  await practice.getByRole("button", { name: /Merge Intervals/ }).click();
  await expect(
    practice.getByRole("button", { name: "Reviewed solution", exact: true })
  ).toHaveAttribute("aria-pressed", "true");
  await practice.getByRole("button", { name: "Still difficult", exact: true }).click();
  await expect(practice.locator(".reflection-note")).toContainText(
    "Keep the difficult step visible"
  );
  const revision = page.getByLabel("Sample revision timeline", { exact: true });
  await revision.getByRole("button", { name: "Tomorrow", exact: true }).click();
  await expect(revision.locator("h3")).toHaveText("Hashing");
  await revision.getByRole("button", { name: "In 3 days", exact: true }).click();
  await expect(revision.locator("h3")).toHaveText("DBMS Normalization");
  const consistency = page
    .getByRole("group", { name: "Preparation dimensions" })
    .getByRole("button", { name: /Consistency/ });
  await consistency.focus();
  await page.keyboard.press("Enter");
  await expect(consistency).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".readiness-dimension-detail")).toContainText(
    "CURRENT FOCUS / CONSISTENCY"
  );
});

test("open sections and footer stay within all requested viewport widths", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.addStyleTag({ content: "nextjs-portal{display:none!important;}" });
  for (const width of [
    320, 360, 375, 390, 430, 768, 1024, 1280, 1366, 1440, 1536, 1920,
  ]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
    ).toBe(true);
    const escaped = await page
      .locator(
        "#features h2,.clarity-principles > a,.feature-fragment,.preparation-signal,.readiness-dimensions button,.method-open-step,.cinematic-wordmark svg,.cinematic-footer-navigation"
      )
      .evaluateAll((els) =>
        els
          .filter((el) => {
            const r = el.getBoundingClientRect();
            return r.width > 0 && (r.left < -1 || r.right > innerWidth + 1);
          })
          .map((el) => el.className)
      );
    expect(escaped, `overflow at ${width}px`).toEqual([]);
  }
  await expect(page.locator(".product-panel,.workspace-demo")).toHaveCount(0);
  await expect(page.locator(".quiet-transition")).toBeVisible();
  await expect(page.locator(".cinematic-wordmark svg")).toBeVisible();
});

test("editorial content and final brand frame remain available without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("#features h2")).toContainText("LESS GUESSWORK.");
  await expect(page.locator("#roadmap .fragment-insight")).toContainText("Two Pointers");
  await expect(page.locator("#revision .revision-focus")).toContainText("Binary Search");
  await expect(page.locator("#readiness")).toContainText(
    "not a prediction of hiring outcomes"
  );
  await expect(page.locator(".method-open-step")).toHaveCount(4);
  await expect(page.locator(".cinematic-wordmark svg")).toBeVisible();
  for (const href of await page
    .locator(".cinematic-footer a[href^='#']")
    .evaluateAll((els) => els.map((el) => el.getAttribute("href")!)))
    await expect(page.locator(href)).toHaveCount(1);
  await context.close();
});
