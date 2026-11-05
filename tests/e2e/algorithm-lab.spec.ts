import { test, expect } from "./support/weather-session";
import type { Page } from "@playwright/test";
const widths = [360, 390, 430, 768, 1024, 1440, 1920];
async function openLab(page: Page, slug = "binary-search") {
  await page.goto(`/lab/${slug}?mode=step`, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("button", { name: "Next step", exact: true })).toBeVisible({
    timeout: 45000,
  });
}
async function noOverflow(page: Page) {
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    .toBe(true);
}
test("catalog search, shell discovery and responsive layout", async ({ page }) => {
  await page.goto("/lab", { waitUntil: "domcontentloaded" });
  await page.getByRole("textbox", { name: "Search algorithms" }).fill("window");
  await expect(
    page.getByRole("heading", { name: "Sliding Window", exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Binary Search", exact: true })
  ).toHaveCount(0);
  await page.getByRole("textbox", { name: "Search algorithms" }).fill("");
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await noOverflow(page);
  }
  await page.getByRole("link", { name: "Start with Binary Search" }).click();
  await expect(page.getByRole("button", { name: "Next step", exact: true })).toBeVisible({
    timeout: 45000,
  });
  await expect(
    page.locator(".shell-nav").getByRole("link", { name: "Algorithm Lab", exact: true })
  ).toHaveAttribute("aria-current", "page");
});
test("390px custom input, reversible playback, Java and prediction gates", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openLab(page);
  await page.getByRole("button", { name: "Input", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Advanced JSON", exact: true }).click();
  await dialog
    .getByLabel("INPUT / JSON")
    .fill(JSON.stringify({ kind: "search", values: [9, 2, 5, 7], target: 7 }));
  await dialog.getByRole("button", { name: "Generate trace" }).click();
  await expect(dialog.getByRole("alert")).toContainText("nondecreasing");
  await dialog.getByRole("button", { name: "Sort values explicitly" }).click();
  await dialog.getByRole("button", { name: "Generate trace" }).click();
  await expect(dialog).not.toBeVisible();
  await noOverflow(page);
  await expect(
    page.getByLabel("Array state").getByRole("listitem").first()
  ).toHaveAttribute("aria-label", /Index 0: 2/);
  await page.getByRole("button", { name: "Next step", exact: true }).click();
  await expect(page.locator(".lab-state-trace h2")).toHaveText("Choose midpoint 1");
  await page.getByRole("button", { name: "Previous step", exact: true }).click();
  await expect(page.locator(".lab-state-trace h2")).toHaveText(
    "Keep the target in range"
  );
  await page.getByRole("button", { name: "View code", exact: true }).click();
  await expect(page.locator(".prime-code-line[data-highlighted=true]")).toHaveCount(1);
  await page.getByRole("tab", { name: "Pseudocode", exact: true }).click();
  await expect(page.locator(".lab-active-line")).toContainText("low = 0");
  await page.getByRole("button", { name: "Hide code", exact: true }).click();
  await page.getByRole("tab", { name: "Practice", exact: true }).click();
  await page.getByRole("button", { name: "Next step", exact: true }).click();
  await page.getByRole("button", { name: "Next step", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "What should happen next?", exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Next step", exact: true })
  ).toBeDisabled();
  await page.getByRole("button", { name: "Move high to mid - 1", exact: true }).click();
  await expect(page.getByText("Not quite. Try again.", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Next step", exact: true })
  ).toBeDisabled();
  await page.getByRole("button", { name: "Move low to mid + 1", exact: true }).click();
  await expect(page.getByText("✓ Correct", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Next step", exact: true }).click();
  await expect(page.locator(".lab-state-trace h2")).toHaveText("low: 0 → 2");
  await noOverflow(page);
  if (process.env.PRIME_LAB_SCREENSHOTS && test.info().project.name === "chromium")
    await page.screenshot({
      path: `${process.env.PRIME_LAB_SCREENSHOTS}/prime-lab-mobile.png`,
      fullPage: true,
    });
});
test("shared playback, keyboard, speed, completion and reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openLab(page);
  const workspace = page.getByRole("region", {
    name: "Binary Search execution workbench",
  });
  await workspace.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".lab-playback-position")).toContainText("02");
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator(".lab-playback-position")).toContainText("01");
  await page.getByRole("tab", { name: "Watch", exact: true }).click();
  await page.getByRole("combobox", { name: "Playback speed" }).click();
  await page.getByRole("option", { name: "2×", exact: true }).click();
  await page.getByRole("button", { name: "Play trace", exact: true }).click();
  await expect
    .poll(() => page.locator(".lab-playback-position").innerText())
    .not.toContain("01 /");
  await page.getByRole("button", { name: "Pause playback", exact: true }).click();
  const timeline = page.getByRole("slider", { name: "Execution timeline" });
  await timeline.focus();
  await page.keyboard.press("End");
  await expect(page.locator(".lab-result")).toContainText("4");
  await expect(
    page.getByRole("button", { name: "Next step", exact: true })
  ).toBeDisabled();
  await page.getByRole("button", { name: "Restart trace", exact: true }).click();
  await expect(page.locator(".lab-state-trace h2")).toHaveText(
    "Keep the target in range"
  );
  await page.getByRole("button", { name: "Focus visualization" }).click();
  await expect(page.locator(".lab-workspace")).toHaveAttribute("data-focus", "true");
  await page.getByRole("button", { name: "Exit focus view" }).click();
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await noOverflow(page);
  }
  if (process.env.PRIME_LAB_SCREENSHOTS && test.info().project.name === "chromium") {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.screenshot({
      path: `${process.env.PRIME_LAB_SCREENSHOTS}/prime-lab-desktop.png`,
      fullPage: true,
    });
  }
});
test("all renderer families load; graph supports pan, zoom and textual inspection", async ({
  page,
}) => {
  test.setTimeout(180000); // Eleven full navigations include development compilation/hydration.
  await page.setViewportSize({ width: 390, height: 844 });
  for (const slug of [
    "linear-search",
    "bubble-sort",
    "two-pointers",
    "sliding-window",
    "stack",
    "queue",
    "linked-list",
    "tree-dfs",
    "tree-bfs",
    "bfs",
    "dfs",
  ]) {
    await openLab(page, slug);
    await noOverflow(page);
    await page.getByRole("button", { name: "Next step", exact: true }).click();
  }
  await page.getByRole("button", { name: "Input", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Advanced JSON", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByLabel("INPUT / JSON")
    .fill(
      JSON.stringify({
        kind: "graph",
        nodeCount: 3,
        edges: [
          [0, 1],
          [1, 2],
        ],
        weights: [4, 7],
        directed: true,
        source: 0,
      })
    );
  await page.getByRole("dialog").getByRole("button", { name: "Generate trace" }).click();
  await expect(page.locator(".lab-edge-weight")).toHaveText(["4", "7"]);
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await expect(page.locator(".lab-network-controls")).toContainText("120%");
  await page.getByRole("button", { name: "Pan visualization" }).click();
  await expect(page.getByRole("button", { name: "Pan visualization" })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  const svg = page.locator(".lab-network-svg"),
    box = await svg.boundingBox();
  const transform = await svg.locator(":scope > g").getAttribute("transform");
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.mouse.move(box!.x + box!.width / 2 + 32, box!.y + box!.height / 2 + 20);
  await page.mouse.up();
  await expect(svg.locator(":scope > g")).not.toHaveAttribute("transform", transform!);
  await page.getByRole("button", { name: "Fit visualization" }).click();
  await expect(page.locator(".lab-network-controls")).toContainText("100%");
  await page.getByText("Inspect nodes and read structure", { exact: true }).click();
  await page.getByRole("button", { name: "Inspect node 0", exact: true }).click();
  await expect(page.locator(".lab-selected-node")).toContainText("Node 0");
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await noOverflow(page);
  }
  if (process.env.PRIME_LAB_SCREENSHOTS && test.info().project.name === "chromium")
    await page.screenshot({
      path: `${process.env.PRIME_LAB_SCREENSHOTS}/prime-lab-graph.png`,
      fullPage: true,
    });
});
test("PRIME AI receives the validated selected-step snapshot and returns focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openLab(page);
  await page.getByRole("button", { name: "Next step", exact: true }).click();
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/ai/context?") && response.url().includes("type=lab")
  );
  await page
    .getByRole("button", { name: "Ask PRIME about this step", exact: true })
    .click();
  const response = await responsePromise;
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.facts.algorithmId).toBe("binary-search");
  expect(body.facts.currentStep).toBe(2);
  expect(body.facts.variables.mid).toBe(3);
  const panel = page.getByRole("dialog", { name: "PRIME AI", exact: true });
  await expect(
    panel.getByRole("button", { name: "Explain this step", exact: true })
  ).toBeVisible();
  await panel.getByRole("button", { name: "Close PRIME AI", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Ask PRIME about this step", exact: true })
  ).toBeFocused();
  await noOverflow(page);
});
