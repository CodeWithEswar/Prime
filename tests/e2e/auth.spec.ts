import { test, expect } from "@playwright/test";

test("auth validates, keeps loading stable, masks email, and handles retry", async ({
  page,
}) => {
  await page.goto("/login");
  await page.addStyleTag({ content: "nextjs-portal{display:none!important;}" });
  const email = page.getByRole("textbox", { name: "Email address", exact: true });
  const submit = page.getByRole("button", { name: "Continue with email", exact: true });
  await submit.click();
  await expect(email).toBeFocused();
  await expect(email).toHaveAttribute("aria-invalid", "true");
  await expect(
    page.getByText("Enter your email address.", { exact: true })
  ).toBeVisible();
  await email.fill("invalid");
  await email.press("Enter");
  await expect(
    page.getByText("Enter a valid email address.", { exact: true })
  ).toBeVisible();
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  let requests = 0;
  await page.route("**/auth/email", async (route) => {
    requests++;
    await pending;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: '{"ok":true}',
    });
  });
  await email.fill("candidate@example.com");
  const width = (await submit.boundingBox())!.width;
  await email.press("Enter");
  await expect(page.getByRole("button", { name: "Sending your link…" })).toBeDisabled();
  await expect(email).toBeDisabled();
  expect(
    (await page.getByRole("button", { name: "Sending your link…" }).boundingBox())!.width
  ).toBe(width);
  release();
  await expect(page.getByRole("heading", { name: "Check your email." })).toBeVisible({
    timeout: 15000,
  });
  await expect(page.getByRole("heading", { name: "Check your email." })).toBeFocused();
  await expect(page.locator(".auth-description")).toContainText("c••••@example.com");
  await expect(page.locator(".auth-description")).not.toContainText(
    "candidate@example.com"
  );
  expect(requests).toBe(1);
  await expect(page.getByRole("button", { name: "Send another link" })).toBeDisabled();
  await page.getByRole("button", { name: "Use another email" }).click();
  await expect(email).toBeVisible();
  await page.unroute("**/auth/email");
  await page.route("**/auth/email", (route) =>
    route.fulfill({ status: 503, contentType: "application/json", body: '{"ok":false}' })
  );
  await email.fill("candidate@example.com");
  await submit.click();
  await expect(page.locator(".auth-surface").getByRole("alert")).toContainText(
    "We couldn’t sign you in"
  );
  await expect(submit).toBeEnabled();
});

test("auth provider failure, offline behavior, focus and reduced motion stay calm", async ({
  page,
  context,
}) => {
  await page.route("**/auth/methods", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: '{"google":true,"email":true}',
    })
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/login");
  await page.addStyleTag({ content: "nextjs-portal{display:none!important;}" });
  await page.route("**/auth/google", (route) =>
    route.fulfill({ status: 503, contentType: "application/json", body: '{"ok":false}' })
  );
  await page.getByRole("button", { name: "Continue with Google", exact: true }).click();
  await expect(page.locator(".auth-surface").getByRole("alert")).toContainText(
    "We couldn’t sign you in"
  );
  const email = page.getByRole("textbox", { name: "Email address", exact: true });
  await email.focus();
  await expect(page.locator(".prime-auth")).toHaveAttribute("data-phase", "email-focus");
  await expect(page.locator(".auth-far-geometry")).toHaveCSS("transform", "none");
  await expect(page.locator(".auth-cursor-field")).toHaveCSS("display", "none");
  await email.fill("candidate@example.com");
  await context.setOffline(true);
  await page.getByRole("button", { name: "Continue with email", exact: true }).click();
  await expect(page.locator(".auth-surface").getByRole("alert")).toContainText("offline");
  await context.setOffline(false);
});

test("auth fits desktop and mobile, scrolls on short screens, and renders without JavaScript", async ({
  page,
  browser,
}) => {
  await page.goto("/login");
  await page.addStyleTag({ content: "nextjs-portal{display:none!important;}" });
  for (const width of [
    320, 360, 375, 390, 430, 768, 1024, 1280, 1366, 1440, 1536, 1920,
  ]) {
    await page.setViewportSize({ width, height: 1000 });
    const bounds = await page
      .locator(".auth-surface,input:not([type=hidden]),.auth-full-button,.auth-utility")
      .evaluateAll((els) =>
        els.map((el) => {
          const r = el.getBoundingClientRect();
          return { left: r.left, right: r.right };
        })
      );
    for (const rect of bounds) {
      expect(rect.left).toBeGreaterThanOrEqual(0);
      expect(rect.right).toBeLessThanOrEqual(width);
    }
    if (width > 767)
      expect(
        await page.evaluate(
          () => document.documentElement.scrollHeight <= innerHeight + 1
        )
      ).toBe(true);
  }
  for (const height of [600, 640, 720, 768]) {
    await page.setViewportSize({ width: 1366, height });
    expect(
      await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1)
    ).toBe(true);
    await expect(
      page.getByRole("link", { name: "Go back", exact: true })
    ).toBeInViewport();
    await expect(
      page.getByRole("button", { name: "Continue with email", exact: true })
    ).toBeInViewport();
  }
  await page.setViewportSize({ width: 844, height: 390 });
  expect(
    await page.evaluate(() => document.documentElement.scrollHeight > innerHeight)
  ).toBe(true);
  await page
    .getByRole("button", { name: "Continue with email", exact: true })
    .scrollIntoViewIfNeeded();
  await expect(
    page.getByRole("button", { name: "Continue with email", exact: true })
  ).toBeInViewport();
  const context = await browser.newContext({
    javaScriptEnabled: false,
    reducedMotion: "reduce",
  });
  const staticPage = await context.newPage();
  await staticPage.goto("/login");
  await expect(staticPage.getByRole("heading", { name: "Welcome back." })).toBeVisible();
  await expect(
    staticPage.getByRole("textbox", { name: "Email address", exact: true })
  ).toBeVisible();
  await expect(
    staticPage.getByRole("button", { name: "Continue with Google", exact: true })
  ).toBeVisible();
  await expect(staticPage.locator(".auth-primary-geometry svg")).toBeVisible();
  await expect(staticPage.locator(".cinematic-footer")).toHaveCount(0);
  await context.close();
});

test("unauthenticated completion and failed callbacks never show fake success", async ({
  page,
}) => {
  await page.goto("/auth/complete?next=https://evil.example");
  await expect(page).toHaveURL(/\/auth\/problem$/);
  await expect(page.getByRole("heading", { name: "Let’s try again." })).toBeVisible();
  await page.goto("/auth/callback?error=access_denied");
  await expect(page).toHaveURL(/\/auth\/problem$/);
});

test("Google availability follows enabled providers without blocking email", async ({
  page,
}) => {
  await page.route("**/auth/methods", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: '{"google":false,"email":true}',
    })
  );
  await page.goto("/login");
  await page.getByRole("textbox", { name: "Email address", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Continue with Google", exact: true })
  ).toBeDisabled();
  await expect(
    page.getByText("Google sign-in is currently unavailable.", { exact: true })
  ).toBeVisible({ timeout: 15000 });
  await expect(
    page.getByRole("button", { name: "Continue with email", exact: true })
  ).toBeEnabled();
});

test("pointer depth leaves the form fixed and settles when the pointer leaves", async ({
  page,
}) => {
  await page.goto("/login");
  await page.addStyleTag({ content: "nextjs-portal{display:none!important;}" });
  const surface = page.locator(".auth-surface");
  await expect(surface).toBeVisible();
  await page.getByRole("textbox", { name: "Email address", exact: true }).click();
  await expect(page.locator(".prime-auth")).toHaveAttribute("data-phase", "email-focus");
  await expect(surface).toHaveCSS("opacity", "1");
  const before = await surface.boundingBox();
  await page.mouse.move(30, 30);
  await page.mouse.move(1000, 700);
  const dots = page.locator(".auth-cursor-field");
  await expect
    .poll(() => dots.evaluate((el) => Number(getComputedStyle(el).opacity)))
    .toBeGreaterThan(0.8);
  await expect(dots).toHaveCSS("pointer-events", "none");
  expect(await dots.evaluate((el) => getComputedStyle(el).maskImage)).toContain(
    "radial-gradient"
  );
  await expect
    .poll(() =>
      page.locator(".auth-far-geometry").evaluate((el) => getComputedStyle(el).transform)
    )
    .not.toBe("none");
  const after = await surface.boundingBox();
  expect(Math.abs(after!.x - before!.x)).toBeLessThan(1);
  expect(Math.abs(after!.y - before!.y)).toBeLessThan(1);
  await expect
    .poll(() => dots.evaluate((el) => Number(getComputedStyle(el).opacity)), {
      timeout: 5000,
    })
    .toBeLessThan(0.05);
  await page.mouse.move(950, 650);
  await expect
    .poll(() => dots.evaluate((el) => Number(getComputedStyle(el).opacity)))
    .toBeGreaterThan(0.8);
  await page.mouse.move(-20, -20);
  await expect
    .poll(() => dots.evaluate((el) => Number(getComputedStyle(el).opacity)))
    .toBeLessThan(0.05);
  await expect
    .poll(async () =>
      page.locator(".auth-far-geometry").evaluate((el) => {
        const t = getComputedStyle(el).transform;
        return t === "none"
          ? 0
          : Math.abs(new DOMMatrix(t).m41) + Math.abs(new DOMMatrix(t).m42);
      })
    )
    .toBeLessThan(0.2);
});

test("Back supports internal history, keyboard activation and direct-entry fallback", async ({
  page,
}) => {
  await page.goto("/#method");
  await page.locator('.cinematic-footer a[href="/login"]').click();
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.locator(".auth-surface")).toBeVisible();
  const emailInput = page.getByRole("textbox", { name: "Email address", exact: true });
  await expect(emailInput).toBeVisible();
  await emailInput.focus();
  await expect(page.locator(".prime-auth")).toHaveAttribute("data-phase", "email-focus");
  const back = page.getByRole("link", { name: "Go back", exact: true });
  await expect(back.locator("svg")).toHaveCount(1);
  await back.focus();
  await expect(back).toBeFocused();
  await back.press("Enter");
  await expect(page).toHaveURL(/\/#method$/);
  const direct = await page.context().newPage();
  await direct.goto("/login");
  await direct.getByRole("textbox", { name: "Email address", exact: true }).click();
  await expect(direct.locator(".prime-auth")).toHaveAttribute(
    "data-phase",
    "email-focus"
  );
  await direct.getByRole("link", { name: "Go back", exact: true }).click();
  await expect(direct).toHaveURL(/\/$/);
  await direct.close();
});

test("Google stays transparent and centered, while coarse pointers receive no dot effect", async ({
  page,
  browser,
}) => {
  await page.route("**/auth/methods", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: '{"google":true,"email":true}',
    })
  );
  await page.goto("/login");
  const google = page.getByRole("button", { name: "Continue with Google", exact: true });
  await expect(google).toBeEnabled();
  await page.mouse.move(0, 0);
  await expect(google).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(google.locator(".google-identity")).toHaveCSS(
    "background-color",
    "rgba(0, 0, 0, 0)"
  );
  const mark = (await google.locator(".google-identity").boundingBox())!;
  const text = (await google
    .locator(".auth-google-label > span:last-child")
    .boundingBox())!;
  expect(text.x - mark.x - mark.width).toBeCloseTo(10, 0);
  const button = (await google.boundingBox())!;
  const label = (await google.locator(".auth-google-label").boundingBox())!;
  expect(Math.abs(button.x + button.width / 2 - label.x - label.width / 2)).toBeLessThan(
    1
  );
  await google.focus();
  await expect(google).toBeFocused();
  expect(await google.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe(
    "none"
  );
  await page.mouse.move(button.x + 25, button.y + 20);
  await expect(google.locator(".auth-google-highlight")).toHaveCSS("opacity", "1");
  const touch = await browser.newContext({
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });
  const mobile = await touch.newPage();
  await mobile.goto("/login");
  await expect(mobile.locator(".auth-cursor-field")).toHaveCSS("display", "none");
  await expect(
    mobile.getByRole("link", { name: "Go back", exact: true })
  ).toBeInViewport();
  await touch.close();
});
