import { test, expect } from "./support/shell-session";

test("planner and its review sheet fit narrow and wide viewports", async ({ page }) => {
  await page.goto("/plan");
  await expect(page.getByRole("heading", { name: "90-day timeline" })).toBeVisible({
    timeout: 45000,
  });
  for (const width of [360, 390, 430, 768, 1440]) {
    await page.setViewportSize({ width, height: 820 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
    ).toBe(true);
    await page.getByRole("button", { name: "Plan work", exact: true }).click();
    const sheet = page.getByRole("dialog");
    await expect(sheet).toBeVisible();
    const bounds = await sheet.boundingBox();
    expect(bounds).toBeTruthy();
    expect(bounds!.width).toBeLessThanOrEqual(width);
    if (width < 480) {
      const usableWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(bounds!.width).toBe(usableWidth);
      await expect.poll(async () => (await sheet.boundingBox())?.x).toBe(0);
    }
    await sheet.getByRole("combobox", { name: "Work source" }).click();
    await expect(page.getByRole("option", { name: "Prime Core" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("option", { name: "Prime Core" })).toBeHidden();
    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();

    await page.getByRole("button", { name: "Automatic plan", exact: true }).click();
    const target = sheet.getByRole("button", { name: /^Target date,/ });
    const initialTarget = await target.textContent();
    await target.click();
    const calendar = page.getByRole("dialog", { name: "Target date calendar" });
    await expect(calendar).toBeVisible();
    await expect(calendar.getByRole("button", { name: "Next month" })).toBeDisabled();
    await calendar.getByRole("button", { name: "Previous month" }).click();
    const calendarBounds = await calendar.boundingBox();
    expect(calendarBounds!.x).toBeGreaterThanOrEqual(0);
    expect(calendarBounds!.x + calendarBounds!.width).toBeLessThanOrEqual(width);
    await calendar
      .getByRole("button", { name: /\d{1,2}, \d{4}$/ })
      .first()
      .click();
    await expect(calendar).toBeHidden();
    await expect(target).not.toHaveText(initialTarget ?? "");
    const horizon = sheet.getByRole("combobox", { name: "Plan through" });
    await horizon.click();
    await page.getByRole("option", { name: "Target date", exact: true }).click();
    await expect(horizon).toHaveText("Target date");
    await sheet.getByText("Include optional practice").click();
    await expect(
      sheet.getByRole("checkbox", { name: "Include optional practice" })
    ).toBeChecked();
    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();
  }
});

test("reviews a commitment before applying and then displays it in the week", async ({
  page,
}) => {
  await page.goto("/plan?work=new");
  const sheet = page.getByRole("dialog");
  await sheet
    .getByRole("textbox", { name: "Task title" })
    .fill("Review join strategies", { timeout: 45000 });
  await sheet.getByRole("button", { name: "Preview changes" }).click();
  await expect(sheet.getByText("Review join strategies")).toBeVisible();
  await expect(sheet.getByText("1 added")).toBeVisible();
  await sheet.getByRole("button", { name: "Confirm changes" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Schedule updated." })
  ).toBeVisible();
  await page.getByRole("tab", { name: "Week" }).click();
  await expect(page.getByText("Review join strategies")).toBeVisible();
});

test("opens AI planning with the selected date and sends a weekly draft request", async ({
  page,
}) => {
  const date = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);
  await page.setViewportSize({ width: 390, height: 820 });
  await page.route("**/api/ai/chat", (route) =>
    route.fulfill({
      contentType: "application/x-ndjson",
      body:
        [
          {
            type: "start",
            conversationId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
            messageId: "draft-1",
            hintDepth: 0,
          },
          { type: "text_delta", text: "Start with your due reviews." },
          { type: "done", status: "completed" },
        ]
          .map((event) => JSON.stringify(event))
          .join("\n") + "\n",
    })
  );
  await page.goto("/plan?date=" + date);
  await page.getByRole("button", { name: "Plan with AI" }).click({ timeout: 45000 });
  const panel = page.getByRole("dialog", { name: "PRIME AI" });
  await expect(
    panel.getByRole("heading", { name: "Plan your preparation" })
  ).toBeVisible();
  const request = page.waitForRequest(
    (req) => req.url().endsWith("/api/ai/chat") && req.method() === "POST"
  );
  await panel.getByRole("button", { name: "Draft my week" }).click();
  expect((await request).postDataJSON()).toMatchObject({
    context: { type: "planner", date },
    message: expect.stringContaining("actual daily study budgets"),
  });
  await expect(
    panel.getByText("Start with your due reviews.", { exact: true })
  ).toBeVisible();
});
