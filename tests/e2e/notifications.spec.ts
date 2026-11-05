import { test, expect } from "./support/shell-session";

async function seed(page: import("@playwright/test").Page, mode = "notifications") {
  await page.request.get("http://127.0.0.1:54344/__context?mode=" + mode);
  await page.goto("/notifications");
  await expect(
    page.getByRole("heading", { name: "Notifications", exact: true })
  ).toBeVisible();
}

test("inbox fits mobile and desktop, with independent selection and complete pagination", async ({
  page,
}) => {
  await seed(page);
  const rows = page.getByTestId("notification-row");
  await expect(rows).toHaveCount(20);
  await expect(page.getByText("Foreign notification", { exact: true })).toHaveCount(0);
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth)
    ).toBeLessThanOrEqual(width);
  }
  const first = rows.first();
  await expect(first).toHaveAttribute("data-unread", "true");
  await first.getByRole("checkbox").press("Space");
  await expect(first).toHaveAttribute("data-unread", "true");
  await page
    .getByRole("button", { name: "Load more notifications", exact: true })
    .click();
  await expect(rows).toHaveCount(40);
  await page
    .getByRole("button", { name: "Load more notifications", exact: true })
    .click();
  await expect(rows).toHaveCount(45);
  expect(
    new Set(
      await rows
        .locator("button")
        .filter({ hasText: /^Preparation update|Earlier database/ })
        .allTextContents()
    ).size
  ).toBe(45);
  await expect(page.getByRole("button", { name: "Load more notifications" })).toHaveCount(
    0
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page
    .getByRole("heading", { name: "Notifications", exact: true })
    .scrollIntoViewIfNeeded();
  await page.screenshot({
    path: ".generated/planner/notifications-desktop.png",
    fullPage: false,
  });
  await page.setViewportSize({ width: 390, height: 900 });
  await page
    .getByRole("heading", { name: "Notifications", exact: true })
    .scrollIntoViewIfNeeded();
  await page.screenshot({
    path: ".generated/planner/notifications-mobile.png",
    fullPage: false,
  });
  await first.getByRole("button", { name: "Preparation update 1", exact: true }).click();
  const detail = page.getByRole("dialog", { name: "Preparation update 1" });
  await expect(detail).toBeVisible();
  await expect(detail.getByRole("link", { name: "Open in PRIME" })).toHaveCount(0);
  await detail.getByRole("button", { name: "Close", exact: true }).click();
  await expect(first).toHaveAttribute("data-unread", "false");
});

test("search includes older records and category and unread filters use saved data", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await seed(page);
  await page
    .getByRole("searchbox", { name: "Search notifications" })
    .fill("Earlier database");
  await expect(page.getByTestId("notification-row")).toHaveCount(1);
  await expect(
    page.getByRole("button", { name: "Earlier database review", exact: true })
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear search", exact: true }).click();
  await expect(page.getByTestId("notification-row")).toHaveCount(20);
  await page.getByRole("tab", { name: "Unread", exact: true }).click();
  await expect(page.getByTestId("notification-row")).toHaveCount(15);
  await expect(
    page.locator('[data-testid="notification-row"][data-unread="false"]')
  ).toHaveCount(0);
  await page.getByRole("combobox", { name: "Notification category" }).click();
  await page.getByRole("option", { name: "Revision Ready", exact: true }).click();
  await expect(page.getByTestId("notification-row")).toHaveCount(7);
});

test("bulk read, unread, and confirmed delete persist after reload", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await seed(page);
  await expect(page.getByTestId("notification-row")).toHaveCount(20);
  await page
    .getByRole("checkbox", { name: "Select visible notifications", exact: true })
    .press("Space");
  await page.getByRole("button", { name: "Actions", exact: true }).click();
  await page.getByRole("menuitem", { name: "Mark as read", exact: true }).click();
  await expect(
    page.locator('[data-testid="notification-row"][data-unread="true"]')
  ).toHaveCount(0);
  await page
    .getByRole("checkbox", { name: "Select visible notifications", exact: true })
    .press("Space");
  await page.getByRole("button", { name: "Actions", exact: true }).click();
  await page.getByRole("menuitem", { name: "Mark as unread", exact: true }).click();
  await expect(
    page.locator('[data-testid="notification-row"][data-unread="true"]')
  ).toHaveCount(20);
  await page
    .getByRole("checkbox", { name: "Select visible notifications", exact: true })
    .press("Space");
  await page.getByRole("button", { name: "Actions", exact: true }).click();
  await page.getByRole("menuitem", { name: "Delete selected", exact: true }).click();
  const dialog = page.getByRole("alertdialog");
  await expect(
    dialog.getByRole("heading", { name: "Delete 20 notifications?" })
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.getByTestId("notification-row")).toHaveCount(20);
  await page.getByRole("button", { name: "Actions", exact: true }).click();
  await page.getByRole("menuitem", { name: "Delete selected", exact: true }).click();
  await dialog.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Preparation update 21", exact: true })
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Preparation update 1", exact: true })
  ).toHaveCount(0);
});

test("read failures keep notifications unread and list failures show a retry", async ({
  page,
}) => {
  await seed(page, "notifications-write-error");
  const first = page.getByTestId("notification-row").first();
  await first
    .getByRole("button", { name: "Actions for Preparation update 1", exact: true })
    .click();
  await page.getByRole("menuitem", { name: "Mark as read", exact: true }).click();
  await expect(page.getByTestId("notification-inbox").getByRole("alert")).toContainText(
    "Could not update notifications"
  );
  await expect(first).toHaveAttribute("data-unread", "true");
  await seed(page, "notifications-error");
  await expect(page.getByRole("heading", { name: "Your inbox is clear" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Try again", exact: true })).toBeVisible({
    timeout: 20000,
  });
});

test("bell opens a bounded mobile sheet and desktop popover", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 850 });
  await seed(page);
  await page.getByRole("button", { name: /15 unread notifications/ }).click();
  const sheet = page.getByRole("dialog", { name: "Notification inbox", exact: true });
  await expect(sheet).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth)
  ).toBeLessThanOrEqual(320);
  await sheet.getByRole("tab", { name: "Unread", exact: true }).click();
  await expect(sheet.getByTestId("notification-row")).toHaveCount(8);
  await sheet.getByRole("button", { name: "Close", exact: true }).click();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole("button", { name: /15 unread notifications/ }).click();
  const preview = page.getByRole("dialog");
  await expect(
    preview.getByRole("link", { name: "Open inbox", exact: true })
  ).toBeVisible();
});

test("API rejects invalid filters and opaque cursors", async ({ page }) => {
  await seed(page);
  for (const query of [
    "limit=NaN",
    "limit=500",
    "tab=invalid",
    "category=bad",
    "cursor=bad",
  ]) {
    expect((await page.request.get("/api/notifications?" + query)).status()).toBe(400);
  }
});
