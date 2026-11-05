import { test, expect } from "./support/problem-session";
import type { Page } from "@playwright/test";
import path from "node:path";
const detail = "/practice/dsa/01-knapsack-problem";
async function scenario(page: Page, mode: string) {
  await page.request.get(`http://127.0.0.1:54340/__scenario?mode=${mode}`);
}
async function capture(page: Page, name: string) {
  if (process.env.PRIME_PROBLEM_SCREENSHOTS && test.info().project.name === "chromium") {
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    await page.screenshot({
      path: path.join(process.env.PRIME_PROBLEM_SCREENSHOTS, `prime-problem-${name}.png`),
      fullPage: true,
      caret: "initial",
    });
  }
}
async function noOverflow(page: Page) {
  // Let responsive charts commit their ResizeObserver update after a viewport change.
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      )
  );
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
  ).toBe(true);
  const layout = await page.evaluate(() => {
    const header = document.querySelector(".problem-page-header");
    const sidebar = document.querySelector(".shell-sidebar");
    if (!header || !sidebar || !sidebar.getClientRects().length) return null;
    return {
      contentLeft: header.getBoundingClientRect().left,
      sidebarRight: sidebar.getBoundingClientRect().right,
    };
  });
  if (layout)
    expect(layout.contentLeft, JSON.stringify(layout)).toBeGreaterThanOrEqual(
      layout.sidebarRight
    );
}

test("catalog opens the canonical page and preserves every catalog filter on return", async ({
  page,
}) => {
  const filters =
    "q=Knapsack&topic=dynamic-programming&difficulty=medium&company=amazon&collection=algoprep-151&sort=title_asc&page=2&window=three_months";
  await page.goto(`/practice/dsa?${filters}`);
  const link = page
    .getByRole("link", { name: "0/1 Knapsack Problem", exact: true })
    .filter({ visible: true });
  await link.click();
  await expect(page).toHaveURL(/\/practice\/dsa\/01-knapsack-problem\?from=/);
  await expect(
    page.getByRole("heading", { level: 1, name: "0/1 Knapsack Problem" })
  ).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByText("From Amazon · 3M source context")).toBeVisible();
  await page.getByRole("link", { name: "Back to DSA Practice", exact: true }).click();
  await page.waitForURL(/\/practice\/dsa\?/);
  const url = new URL(page.url());
  for (const [key, value] of new URLSearchParams(filters))
    expect(url.searchParams.get(key)).toBe(value);
  await expect(link).toBeFocused();
});

test("new problem uses real context without charts or fabricated missing metrics", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(detail);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "0/1 Knapsack Problem"
  );
  await expect(page.getByRole("link", { name: "Open on GeeksforGeeks" })).toHaveAttribute(
    "href",
    /geeksforgeeks.org/
  );
  await expect(page.locator(".prime-chart")).toHaveCount(0);
  await expect(page.getByText("Suggested target", { exact: true })).toHaveCount(0);
  await expect(page.getByText(/Provider acceptance rate/)).toHaveCount(0);
  await expect(page.locator(".problem-collection-list li")).toHaveCount(3);
  await expect(page.getByText("No attempts yet.", { exact: true })).toBeVisible();
  await noOverflow(page);
  await capture(page, "new-desktop");
  const requests = (await (
    await page.request.get("http://127.0.0.1:54340/__requests")
  ).json()) as { path: string; query: Record<string, string> }[];
  for (const request of requests.filter((r) => r.path.endsWith("/problems")))
    expect(request.query.slug).toBe("eq.01-knapsack-problem");
  expect(requests.some((r) => r.path.endsWith("/companies"))).toBe(false);
  expect(requests.find((r) => r.path.endsWith("/problem_attempts"))?.query.limit).toBe(
    "40"
  );
});

test("recording attempts refreshes status, history, revision and progressive analytics", async ({
  page,
}) => {
  await page.goto(detail);
  for (const [index, minutes] of [25, 20].entries()) {
    await page
      .locator(".problem-actions")
      .getByRole("button", { name: "Record Attempt", exact: true })
      .click();
    const dialog = page.getByRole("dialog", { name: "Record Attempt" });
    await expect(dialog).toBeVisible();
    await dialog
      .getByLabel("Time Taken (Minutes)", { exact: true })
      .fill(String(minutes));
    await dialog.getByRole("button", { name: "Confidence 4 out of 5" }).click();
    await dialog
      .getByLabel("Key Insights & Edge Cases (Optional)", { exact: true })
      .fill(`Verified capacity transition ${index + 1}`);
    await dialog.getByRole("button", { name: /Save Attempt/i }).click();
    await expect(dialog).not.toBeVisible();
    await expect(
      page
        .locator(".problem-attempt-timeline")
        .getByText(`Verified capacity transition ${index + 1}`)
    ).toBeVisible();
    await expect(page.locator(".problem-header-meta")).toContainText("Solved");
    await expect(page.locator(".problem-revision-state")).toContainText(
      index === 0 ? "3-day review" : "7-day review"
    );
    await expect(page.locator("#performance .prime-chart")).toHaveCount(
      index === 0 ? 0 : 2
    );
  }
  await page.reload();
  await expect(page.locator(".problem-attempt-timeline li")).toHaveCount(2);
  await capture(page, "practiced");
});

test("a failed attempt save preserves form state and can be retried", async ({
  page,
}) => {
  await scenario(page, "rpc-error");
  await page.goto(detail);
  await page
    .locator(".problem-actions")
    .getByRole("button", { name: "Record Attempt", exact: true })
    .click();
  const dialog = page.getByRole("dialog", { name: "Record Attempt" });
  const notes = dialog.getByLabel("Key Insights & Edge Cases (Optional)", {
    exact: true,
  });
  await notes.fill("Keep this insight after a failed request.");
  await dialog.getByRole("button", { name: /Save Attempt/i }).click();
  await expect(dialog.getByRole("alert")).toBeVisible();
  await expect(notes).toHaveValue("Keep this insight after a failed request.");
  await page.request.get("http://127.0.0.1:54340/__allow-rpc");
  await dialog.getByRole("button", { name: /Save Attempt/i }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.locator(".problem-attempt-timeline")).toContainText(
    "Keep this insight"
  );
});

test("review evidence, company windows, logo fallback and context are truthful", async ({
  page,
}) => {
  await scenario(page, "due");
  await page.route("**/brand/companies/amazon.svg", (route) => route.abort());
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(
    `${detail}?from=${encodeURIComponent("/practice/dsa?company=amazon&window=three_months&collection=algoprep-151")}`
  );
  await expect(page.locator(".problem-header-meta")).toContainText("Revision overdue");
  await expect(page.locator("#revision .prime-chart")).toHaveCount(1);
  await expect(page.locator(".problem-revision-path [aria-current=step]")).toContainText(
    "7D"
  );
  await expect(page.locator(".problem-revision-path [data-completed=true]")).toHaveCount(
    2
  );
  await expect(
    page
      .getByRole("group", { name: "Company source window" })
      .getByRole("button", { name: "3M", exact: true })
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "View all 8 companies" }).click();
  await expect(page.locator(".problem-company-row")).toHaveCount(8);
  const failedLogo = page
    .locator(".problem-company-row")
    .filter({ hasText: "Amazon" })
    .locator(".company-identity");
  await expect(failedLogo.locator("img")).toHaveCount(0);
  await expect(failedLogo.locator("svg")).toBeVisible();
  const google = page
    .locator(".problem-company-row")
    .filter({ hasText: "Google" })
    .locator("img");
  await expect(google).toHaveAttribute("src", /\/brand\/providers\/google-g\.png$/);
  await expect(google).toHaveCSS("filter", "none");
  await expect(page.getByText("Source frequency", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/interview probability/)).toBeVisible();
  await capture(page, "due");
});

test("responsive workspace, charts, keyboard and reduced motion fit required windows", async ({
  page,
}) => {
  await scenario(page, "returning");
  await page.goto(detail);
  for (const width of [
    320, 360, 375, 390, 430, 768, 820, 1024, 1280, 1366, 1440, 1600, 1920,
  ]) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 900 });
    await noOverflow(page);
    await expect(
      page.locator(".problem-actions").getByRole("button", { name: "Record Attempt" })
    ).toBeVisible();
    if (width === 390) await capture(page, "mobile");
    if (width === 820) await capture(page, "tablet");
  }
  await page.setViewportSize({ width: 1366, height: 650 });
  await noOverflow(page);
  await page.setViewportSize({ width: 683, height: 384 });
  await noOverflow(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page
    .getByRole("navigation", { name: "Problem sections" })
    .getByRole("link", { name: "Attempts", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#attempts$/);
  const open = page
    .locator(".problem-actions")
    .getByRole("button", { name: "Record Attempt" });
  await open.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: "Record Attempt" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(open).toBeFocused();
});

test("missing problem and partial failures keep clear and recoverable states", async ({
  page,
}) => {
  await page.goto("/practice/dsa/not-a-real-problem");
  await expect(page.getByRole("heading", { name: "Problem not found" })).toBeVisible();
  await scenario(page, "company-error");
  await page.goto(detail);
  await expect(
    page.getByText(/Company context is temporarily unavailable/)
  ).toBeVisible();
  await expect(
    page.locator(".problem-actions").getByRole("button", { name: "Record Attempt" })
  ).toBeVisible();
  await scenario(page, "history-error");
  await page.reload();
  await expect(
    page.getByText(
      "Your attempt history is temporarily unavailable. Your saved history has not been changed."
    )
  ).toBeVisible();
});

test("large history is bounded and can load older attempts", async ({ page }) => {
  await scenario(page, "history");
  await page.goto(detail);
  await expect(page.locator(".problem-attempt-timeline li")).toHaveCount(40);
  await expect(
    page.getByText(
      "Charts summarize the latest 40 of 45 attempts. Load older entries in Attempt History."
    )
  ).toBeVisible();
  await page.getByRole("button", { name: "Load older attempts" }).click();
  await expect(page.locator(".problem-attempt-timeline li")).toHaveCount(45);
  await expect(page.getByRole("button", { name: "Load older attempts" })).toHaveCount(0);
});

test("chart interaction does not render browser focus outline", async ({ page }) => {
  await scenario(page, "history");
  await page.goto(detail);
  const confidenceChart = page.locator(".prime-chart", { hasText: "Confidence" });
  await expect(confidenceChart).toBeVisible();

  // Click on the confidence chart plot
  const plot = confidenceChart.locator(".prime-chart-plot");
  await plot.click({ position: { x: 100, y: 100 } });

  // Verify that active element or any element in chart does NOT have a visible outline
  const outlineStyles = await page.evaluate(() => {
    const el = document.activeElement;
    const comp = el ? window.getComputedStyle(el) : null;
    const activeOutline = comp ? comp.outlineStyle : "none";
    
    // Check all svg, g, and recharts elements
    const elementsWithOutline: string[] = [];
    document.querySelectorAll(".prime-chart-plot svg, .prime-chart-plot svg *").forEach((node) => {
      const c = window.getComputedStyle(node);
      if (c.outlineStyle !== "none" && c.outlineWidth !== "0px" && c.outlineColor !== "transparent") {
        const cls = node instanceof SVGElement ? node.className.baseVal : (node instanceof HTMLElement ? node.className : "");
        elementsWithOutline.push(`${node.tagName}.${cls}`);
      }
    });

    return { activeOutline, elementsWithOutline };
  });

  expect(outlineStyles.elementsWithOutline).toHaveLength(0);
  expect(outlineStyles.activeOutline).toBe("none");

  // Capture screenshot to visual artifact
  await confidenceChart.screenshot({
    path: "C:/Users/hp/.gemini/antigravity/brain/972a971a-9099-4efb-b994-6cbc4ac04847/chart-premium-verified.png",
  });
});


