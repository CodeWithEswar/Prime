import { test, expect } from "./support/shell-session";
import type { Page, Locator } from "@playwright/test";
import path from "node:path";

async function capture(page: Page, name: string) {
  if (process.env.PRIME_SHELL_SCREENSHOTS && test.info().project.name === "chromium") {
    await page.evaluate(async () => {
      await document.fonts.ready;
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      );
    });
    await page.screenshot({
      caret: "initial",
      path: path.join(process.env.PRIME_SHELL_SCREENSHOTS, `prime-shell-${name}.png`),
    });
  }
}

const sidebar = (page: Page) =>
  page.getByRole("complementary", { name: "Application Sidebar" });
const breadcrumb = (page: Page) => page.getByRole("navigation", { name: "Breadcrumb" });
async function expectWidth(locator: Locator, width: number) {
  await expect
    .poll(async () => Math.round((await locator.boundingBox())?.width ?? 0))
    .toBe(width);
}
async function expectInside(control: Locator, parent: Locator) {
  const button = await control.boundingBox(),
    box = await parent.boundingBox();
  expect(button).not.toBeNull();
  expect(box).not.toBeNull();
  expect(button!.width).toBeGreaterThanOrEqual(44);
  expect(button!.height).toBeGreaterThanOrEqual(44);
  expect(button!.x).toBeGreaterThanOrEqual(box!.x);
  expect(button!.x + button!.width).toBeLessThanOrEqual(box!.x + box!.width);
  expect(button!.y).toBeGreaterThanOrEqual(box!.y);
  expect(button!.y + button!.height).toBeLessThanOrEqual(box!.y + box!.height);
}
async function expectNoOverflow(page: Page) {
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
  ).toBe(true);
}
async function expectTerminalCentered(rail: Locator) {
  const active = rail.locator(".shell-nav-link.is-active"),
    marker = active.locator(".shell-route-terminal");
  await expect
    .poll(async () => {
      const row = await active.boundingBox(),
        signal = await marker.boundingBox();
      return Math.abs(row!.y + row!.height / 2 - (signal!.y + signal!.height / 2));
    })
    .toBeLessThan(1);
}

test("inside controls preserve icon alignment and the server-rendered collapse preference", async ({
  page,
  context,
  browser,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      /hydration|didn't match|does not match/i.test(message.text())
    )
      errors.push(message.text());
  });
  await page.goto("/practice/dsa");
  const rail = sidebar(page),
    collapse = rail.getByRole("button", { name: "Collapse sidebar" });
  await expectWidth(rail, 240);
  await expectInside(collapse, rail);
  await expectTerminalCentered(rail);
  await capture(page, "desktop");
  const icon = rail.locator(".shell-nav-icon").first();
  const position = (await icon.boundingBox())!.x;
  await collapse.click();
  await expectWidth(rail, 64);
  await expectTerminalCentered(rail);
  await expectInside(rail.getByRole("button", { name: "Expand sidebar" }), rail);
  await capture(page, "compact");
  expect((await icon.boundingBox())!.x).toBeCloseTo(position, 0);
  expect(
    (await context.cookies()).find((c) => c.name === "prime_sidebar_collapsed")?.value
  ).toBe("true");
  await page.reload();
  await expectWidth(rail, 64);
  const staticContext = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 1440, height: 900 },
  });
  await staticContext.addCookies(await context.cookies());
  const staticPage = await staticContext.newPage();
  await staticPage.goto("http://127.0.0.1:3102/practice/dsa");
  await expectWidth(sidebar(staticPage), 64);
  await staticContext.close();
  await rail.getByRole("button", { name: "Expand sidebar" }).click();
  await expectWidth(rail, 240);
  expect(errors).toEqual([]);
});

test("one command dialog restores focus, respects editors, and searches the existing catalog", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/practice/dsa");
  const trigger = page.locator("header").getByRole("button", { name: "Search PRIME" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Search PRIME" });
  await expect(dialog).toHaveCount(1);
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await page.keyboard.press("/");
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await page.keyboard.press("Control+k");
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  const editor = page.getByPlaceholder("Search problems by title, slug, or topic...");
  await editor.fill("/");
  await editor.press("/");
  await expect(dialog).not.toBeVisible();
  await editor.fill("");
  await trigger.click();
  await dialog.getByPlaceholder("Find a page or search questions…").fill("Two Sum");
  await dialog.getByRole("option", { name: /Search questions for/ }).click();
  await expect(page).toHaveURL(/q=Two(%20|\+)Sum/);
  await expect(dialog).not.toBeVisible();
});

test("real destinations, revision filters, and refreshed deep links keep accurate route context", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/practice/dsa");
  const rail = sidebar(page);
  await expect(rail.getByRole("link", { name: "DSA Practice" })).toHaveAttribute(
    "aria-current",
    "page"
  );
  await expect(rail.getByRole("link", { name: "Today", exact: true })).toHaveCount(0);
  await expect(rail.getByRole("link", { name: "Planner", exact: true })).toBeVisible();
  await rail.getByRole("link", { name: "Planner", exact: true }).click();
  await expect(page).toHaveURL(/\/plan/);
  await expect(rail.getByRole("link", { name: "Planner", exact: true })).toHaveAttribute(
    "aria-current",
    "page"
  );
  await rail.getByRole("link", { name: "Settings", exact: true }).click();
  await expect(breadcrumb(page)).toContainText("SETTINGS");
  await rail.getByRole("link", { name: /Revision/ }).click();
  await expect(page).toHaveURL(/\/revision/);
  await expect(rail.getByRole("link", { name: /Revision/ })).toHaveAttribute(
    "aria-current",
    "page"
  );
  await expect(rail.getByRole("link", { name: "DSA Practice" })).not.toHaveAttribute(
    "aria-current"
  );
  await page.goto("/practice/dsa/two-sum");
  await page.reload();
  await expect(breadcrumb(page)).toContainText("TWO SUM");
  await expect(rail.getByRole("link", { name: "DSA Practice" })).toHaveAttribute(
    "aria-current",
    "page"
  );
  await breadcrumb(page).locator("..").getByRole("link", { name: /back/i }).click();
  await expect(page).toHaveURL(/\/practice\/dsa$/);
});

test("desktop and short windows fit with pinned account controls", async ({ page }) => {
  await page.goto("/settings");
  for (const [width, height] of [
    [1280, 800],
    [1366, 768],
    [1440, 900],
    [1600, 900],
    [1920, 1080],
    [1366, 650],
  ]) {
    await page.setViewportSize({ width, height });
    await expectWidth(sidebar(page), 240);
    await expectNoOverflow(page);
    await expectInside(
      sidebar(page).getByRole("button", { name: "Collapse sidebar" }),
      sidebar(page)
    );
    const account = await sidebar(page)
      .getByRole("button", { name: "User Account Menu" })
      .boundingBox();
    expect(account!.y + account!.height).toBeLessThanOrEqual(height);
    expect(account!.y).toBeGreaterThan(height - 100);
  }
});

test("tablet rail opens a contained drawer with focus trapping and restoration", async ({
  page,
}) => {
  await page.goto("/settings");
  for (const width of [768, 820, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    await expectWidth(sidebar(page), 64);
    await expectNoOverflow(page);
    const trigger = sidebar(page).getByRole("button", { name: "Expand sidebar" });
    await expectInside(trigger, sidebar(page));
    await trigger.click();
    const drawer = page.getByRole("dialog", { name: "Workspace navigation" });
    await expect(drawer).toBeVisible();
    await expectWidth(drawer, 288);
    if (width === 820) await capture(page, "tablet-drawer");
    await expectInside(
      drawer.getByRole("button", { name: "Close", exact: true }),
      drawer
    );
    for (let i = 0; i < 9; i++) {
      await page.keyboard.press("Tab");
      expect(await drawer.evaluate((el) => el.contains(document.activeElement))).toBe(
        true
      );
    }
    await page.keyboard.press("Escape");
    await expect(drawer).not.toBeVisible();
    await expect(trigger).toBeFocused();
    if (width === 820) await capture(page, "tablet");
  }
});

test("mobile sidebar fits narrow screens and closes after navigation", async ({
  page,
}) => {
  await page.goto("/settings");
  for (const width of [320, 360, 375, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(sidebar(page)).not.toBeVisible();
    await expectNoOverflow(page);
    await expect(page.locator(".shell-mobile-nav")).toHaveCount(0);
    const trigger = page.getByRole("button", { name: "Open sidebar" });
    await expect(trigger).toBeInViewport();
    await expect(page.getByRole("button", { name: "Search PRIME" })).toBeInViewport();
    await trigger.click();
    const sheet = page.getByRole("dialog", { name: "Workspace navigation" });
    await expect(sheet).toBeVisible();
    await expectWidth(sheet, 288);
    expect((await sheet.boundingBox())!.x).toBeCloseTo(0, 0);
    const nav = sheet.getByRole("navigation", { name: "Primary Navigation" });
    await expect(nav.getByRole("group", { name: "Prepare" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Planner", exact: true })).toBeVisible();
    if (width === 390) await capture(page, "mobile-sidebar");
    await expect(
      sheet.getByRole("link", { name: "Settings", exact: true })
    ).toHaveAttribute("aria-current", "page");
    await expectInside(sheet.getByRole("button", { name: "Close", exact: true }), sheet);
    await page.keyboard.press("Escape");
    await expect(sheet).not.toBeVisible();
    await expect(trigger).toBeFocused();
    if (width === 390) await capture(page, "mobile");
    await expect(page.locator("#workspace-main")).toHaveCSS("padding-bottom", "16px");
  }
  await page.getByRole("button", { name: "Open sidebar" }).click();
  const sheet = page.getByRole("dialog", { name: "Workspace navigation" });
  await sheet.getByRole("link", { name: "DSA Practice" }).click();
  await expect(page).toHaveURL(/\/practice\/dsa$/);
  await expect(sheet).toBeHidden();
  await page.getByRole("button", { name: "Open sidebar" }).click();
  await expect(sheet.getByRole("link", { name: "DSA Practice" })).toHaveAttribute(
    "aria-current",
    "page"
  );
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(sheet).toBeHidden();
  await expect(sidebar(page)).toBeVisible();
});

test("missing context stays honest, reduced motion works, and the account menu signs out", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/settings");
  await expect(sidebar(page).getByText("Target Goal")).toBeVisible();
  expect(
    await sidebar(page).evaluate((el) => getComputedStyle(el).transitionDuration)
  ).toBe("0s");
  for (const mode of ["empty", "failure"]) {
    await page.request.get(`http://127.0.0.1:54339/__context?mode=${mode}`);
    await page.reload();
    await expect(sidebar(page).getByText("Target Goal")).toHaveCount(0);
    await expect(sidebar(page).locator(".shell-attention")).toHaveCount(0);
    await expect(sidebar(page).getByRole("link", { name: "DSA Practice" })).toBeVisible();
  }
  await page.setViewportSize({ width: 683, height: 384 });
  await expectNoOverflow(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  const account = sidebar(page).getByRole("button", { name: "User Account Menu" });
  await account.focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("menu")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(account).toBeFocused();
  await account.click();
  await page.getByRole("menuitem", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL(/\/login/);
  await expect(sidebar(page)).toHaveCount(0);
});

test("an anonymous deep link reaches login with a safe return destination", async ({
  page,
  browser,
}) => {
  const anonymous = await browser.newContext();
  const tab = await anonymous.newPage();
  await tab.goto("http://127.0.0.1:3102/practice/dsa/two-sum?source=revision");
  const url = new URL(tab.url());
  expect(url.pathname).toBe("/login");
  expect(url.searchParams.get("next")).toBe("/practice/dsa/two-sum?source=revision");
  await expect(sidebar(tab)).toHaveCount(0);
  await anonymous.close();
  // Keep the authenticated fixture active too: both paths use the real middleware.
  await page.goto("/settings");
  await expect(sidebar(page)).toBeVisible();
});

test("compact controls stay consistent across the workspace, login, and landing page", async ({
  page,
  browser,
  context,
  browserName,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/practice/dsa");
  const selects = page.getByRole("combobox");
  await expect(selects).toHaveCount(3);
  for (const select of await selects.all())
    await expect(select).toHaveCSS("height", "32px");
  await expect(
    page.getByPlaceholder("Search problems by title, slug, or topic...")
  ).toHaveCSS("height", "32px");
  await selects.first().click();
  const options = page.getByRole("option");
  await expect(options.first()).toHaveCSS("min-height", "32px");
  await page.keyboard.press("Escape");
  await expect(selects.first()).toBeFocused();
  await page.locator("header").getByRole("button", { name: "Search PRIME" }).click();
  const command = page.getByRole("dialog", { name: "Search PRIME" });
  await expect(command.getByRole("option").first()).toHaveCSS("min-height", "32px");
  await expect(command.getByRole("combobox")).toHaveCSS("height", "40px");
  await expect(command.getByRole("button", { name: "Close", exact: true })).toHaveCSS(
    "height",
    "32px"
  );
  await capture(page, "command");
  await page.keyboard.press("Escape");
  const anonymous = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const login = await anonymous.newPage();
  await login.goto("http://127.0.0.1:3102/login");
  await expect(login.getByLabel("Email address", { exact: true })).toHaveCSS(
    "height",
    "40px"
  );
  await expect(login.getByRole("button", { name: "Continue with email" })).toHaveCSS(
    "min-height",
    "40px"
  );
  await login.goto("http://127.0.0.1:3102/");
  await expect(login.locator(".hero-actions > a").first()).toHaveCSS("height", "36px");
  await expectNoOverflow(login);
  await anonymous.close();
  if (browserName === "chromium") {
    const touch = await browser.newContext({
      hasTouch: true,
      viewport: { width: 390, height: 844 },
    });
    await touch.addCookies(await context.cookies());
    const phone = await touch.newPage();
    await phone.goto("http://127.0.0.1:3102/practice/dsa");
    await expect(phone.getByRole("combobox").first()).toHaveCSS("height", "32px");
    await phone.locator("header").getByRole("button", { name: "Search PRIME" }).click();
    await expect(phone.getByRole("dialog").getByRole("option").first()).toHaveCSS(
      "min-height",
      "32px"
    );
    await touch.close();
  }
});
