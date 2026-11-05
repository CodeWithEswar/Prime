import { test, expect } from "@playwright/test";

test("mastery diagnostic reveals evidence on hover, selection, and keyboard focus", async ({
  page,
}) => {
  await page.goto("/#mastery");
  await page.addStyleTag({ content: "nextjs-portal { display:none!important; }" });
  const diagnostic = page.getByLabel("Illustrative mastery diagnostic", { exact: true });
  const insight = diagnostic.locator("#mastery-topic-insight");
  await expect(insight.getByRole("heading")).toHaveText("Binary Search");
  await expect(insight).toContainText("NEEDS ATTENTION");
  await expect(
    page.getByText("A clearer picture of mastery", { exact: true })
  ).toHaveCount(0);
  const arrays = diagnostic.getByRole("button", {
    name: "Arrays — Mastered",
    exact: true,
  });
  await arrays.hover();
  await expect(insight.getByRole("heading")).toHaveText("Arrays");
  await arrays.click();
  await page.locator("#mastery h2").hover();
  await expect(arrays).toHaveAttribute("aria-pressed", "true");
  await expect(insight).toContainText("Recalled clearly");
  await diagnostic.getByRole("button", { name: "Trees — Learning", exact: true }).focus();
  await page.locator("#mastery h2").hover();
  await expect(insight.getByRole("heading")).toHaveText("Trees");
  const binary = diagnostic.getByRole("button", {
    name: "Binary Search — Needs revision",
    exact: true,
  });
  await binary.focus();
  await expect(insight).toContainText("Hard to recall");
  await page.keyboard.press("Enter");
  await expect(binary).toHaveAttribute("aria-pressed", "true");
  await diagnostic.getByRole("button", { name: "Review next", exact: true }).click();
  await expect(diagnostic.getByText("SAMPLE REVIEW PLAN", { exact: true })).toBeVisible();
  await diagnostic.getByRole("button", { name: "Close review preview" }).click();
  await expect(diagnostic.getByText("SAMPLE REVIEW PLAN", { exact: true })).toBeHidden();
});

test("mastery becomes a readable vertical path on mobile and respects reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#mastery");
  await page.addStyleTag({ content: "nextjs-portal { display:none!important; }" });
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    // WebKit excludes the scrollbar from its media-query viewport width.
    const mobile = await page.evaluate(() => matchMedia("(max-width: 767px)").matches);
    if (mobile) await expect(page.locator(".mastery-connections")).toBeHidden();
    else await expect(page.locator(".mastery-connections")).toBeVisible();
    const nodes = page.locator(".mastery-node");
    await expect(nodes).toHaveCount(6);
    const rects = await nodes.evaluateAll((items) =>
      items.map((item) => {
        const r = item.getBoundingClientRect();
        return { x: r.x, y: r.y, right: r.right, bottom: r.bottom };
      })
    );
    for (const rect of rects) {
      expect(rect.x).toBeGreaterThanOrEqual(0);
      expect(rect.right).toBeLessThanOrEqual(width);
    }
    const map = await page.locator(".mastery-map-column").boundingBox();
    const detail = await page.locator("#mastery-topic-insight").boundingBox();
    if (!mobile) expect(detail!.x).toBeGreaterThanOrEqual(map!.x + map!.width);
    else expect(detail!.y).toBeGreaterThanOrEqual(map!.y + map!.height);
    if (mobile) {
      await expect(page.locator(".mastery-connections")).toBeHidden();
      for (let i = 1; i < rects.length; i++)
        expect(rects[i].y).toBeGreaterThanOrEqual(rects[i - 1].bottom);
    }
  }
  expect(
    await page
      .locator(".mastery-backdrop")
      .evaluate((el) => getComputedStyle(el).transform)
  ).toBe("none");
});
