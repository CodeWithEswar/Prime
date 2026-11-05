import { test, expect } from "./support/weather-session";
test("simple input fields cover arrays, tree, graph and operation sequences", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  async function open(slug: string) {
    await page.goto(`/lab/${slug}?mode=step`, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("button", { name: "Input", exact: true })).toBeVisible({
      timeout: 45000,
    });
    await page.getByRole("button", { name: "Input", exact: true }).click();
  }
  async function apply() {
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Generate trace" })
      .click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
    ).toBe(true);
  }
  await open("binary-search");
  await page
    .getByRole("dialog")
    .getByLabel("Array values", { exact: true })
    .fill("1, 3, 8, 10");
  await page.getByRole("dialog").getByLabel("Target", { exact: true }).fill("8");
  await apply();
  await expect(page.getByLabel("Array state").getByRole("listitem")).toHaveCount(4);
  await open("tree-dfs");
  await page
    .getByRole("dialog")
    .getByLabel("Tree values", { exact: true })
    .fill("1, null, 2");
  await page.getByRole("combobox", { name: "DFS traversal order" }).click();
  await page.getByRole("option", { name: "inorder", exact: true }).click();
  await apply();
  await expect(page.locator(".lab-state-trace h2")).toContainText("inorder");
  await open("stack");
  await page
    .getByRole("dialog")
    .getByLabel("Operations", { exact: true })
    .fill("push 4\npush 9\npop");
  await apply();
  await page.getByRole("slider", { name: "Execution timeline" }).focus();
  await page.keyboard.press("End");
  await expect(page.locator(".lab-result")).toContainText("[4]");
  await open("bfs");
  await page.getByRole("dialog").getByLabel("Number of nodes", { exact: true }).fill("3");
  await page.getByRole("dialog").getByLabel("Source node", { exact: true }).fill("0");
  await page
    .getByRole("dialog")
    .getByLabel("Edges", { exact: true })
    .fill("0 1 4\n1 2 7\n0 0 2");
  await page.getByRole("dialog").getByLabel("Directed edges", { exact: true }).check();
  if (process.env.PRIME_LAB_SCREENSHOTS && test.info().project.name === "chromium")
    await page.screenshot({
      path: `${process.env.PRIME_LAB_SCREENSHOTS}/prime-lab-input-mobile.png`,
    });
  await apply();
  await expect(page.locator(".lab-edge-weight")).toHaveText(["4", "7", "2"]);
  const loopTop = await page
    .locator("path.lab-network-edge")
    .evaluate((node) => (node as SVGPathElement).getBBox().y);
  expect(loopTop).toBeGreaterThanOrEqual(0);
});
