import { test, expect } from "./support/shell-session";

const sections = [
  ["", "Overview"],
  ["profile", "Profile"],
  ["targets", "Career targets"],
  ["study", "Study schedule"],
  ["learning", "Learning preferences"],
  ["notifications", "Notifications"],
  ["appearance", "Appearance"],
  ["security", "Account & security"],
  ["connections", "Connected accounts"],
  ["privacy", "Privacy & data"],
] as const;

test("all settings sections fit mobile, tablet, and desktop", async ({ page }) => {
  test.setTimeout(180_000);
  for (const [path, label] of sections) {
    await page.goto("/settings" + (path ? "/" + path : ""));
    await expect(
      page.getByRole("heading", { name: "Settings", exact: true })
    ).toBeVisible({ timeout: 45000 });
    if (path)
      await expect(page.getByRole("heading", { name: label, exact: true })).toBeVisible();
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 850 });
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
        path + " at " + width
      ).toBeLessThanOrEqual(width);
    }
  }
  await page.goto("/settings");
  await page.setViewportSize({ width: 390, height: 850 });
  await page.screenshot({
    path: ".generated/planner/settings-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: ".generated/planner/settings-desktop.png",
    fullPage: true,
  });
});

test("profile drafts can be cancelled, guarded on navigation, saved, and reloaded", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 850 });
  await page.goto("/settings/profile");
  const name = page.getByRole("textbox", { name: "Display name", exact: true });
  const save = page.getByRole("button", { name: "Save changes", exact: true });
  await expect(save).toBeDisabled({ timeout: 45000 });
  await name.fill("Draft name");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(name).toHaveValue("Alex Morgan");
  await name.fill("Alex Updated");
  await page.getByRole("combobox", { name: "Settings section" }).click();
  await page.getByRole("option", { name: "Appearance", exact: true }).click();
  const guard = page.getByRole("alertdialog");
  await expect(guard.getByText("Discard unsaved changes?")).toBeVisible();
  await guard.getByRole("button", { name: "Keep editing" }).click();
  await expect(name).toHaveValue("Alex Updated");
  await save.click();
  await expect(
    page.getByRole("status").filter({ hasText: "Changes saved." })
  ).toBeVisible();
  await page.reload();
  await expect(name).toHaveValue("Alex Updated");
});

test("targets use the shared calendar and keep empty compensation empty", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 850 });
  await page.goto("/settings/targets");
  await expect(
    page.getByRole("spinbutton", { name: "Target amount", exact: true })
  ).toHaveValue("", { timeout: 45000 });
  await page.getByRole("button", { name: /^Preparation target date/ }).click();
  const calendar = page.getByRole("dialog", { name: "Preparation target date calendar" });
  await expect(calendar).toBeVisible();
  const bounds = await calendar.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
  await page.keyboard.press("Escape");
  await page.getByRole("textbox", { name: "Add a company" }).fill("Example Company");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Remove Example Company" })
  ).toBeVisible();
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Changes saved." })
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Remove Example Company" })
  ).toBeVisible();
});

test("saved appearance changes apply to controls and survive reload", async ({
  page,
}) => {
  await page.goto("/settings/appearance");
  await page.getByRole("combobox", { name: "Interface density" }).click();
  await page.getByRole("option", { name: "Compact", exact: true }).click();
  await page.getByRole("combobox", { name: "Animation preference" }).click();
  await page.getByRole("option", { name: "Reduced motion", exact: true }).click();
  await page.getByRole("combobox", { name: "Text size" }).click();
  await page.getByRole("option", { name: "Larger", exact: true }).click();
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-prime-density", "compact");
  await expect(page.locator("html")).toHaveAttribute("data-prime-motion", "reduced");
  await expect
    .poll(() => page.evaluate(() => getComputedStyle(document.documentElement).fontSize))
    .toBe("17.6px");
  await page.reload();
  await expect(page.getByRole("combobox", { name: "Interface density" })).toHaveText(
    "Compact"
  );
  await expect(page.locator("html")).toHaveAttribute("data-prime-motion", "reduced");
  await page.setViewportSize({ width: 320, height: 850 });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth)
  ).toBeLessThanOrEqual(320);
});

test("notification controls save lead times and preserve toggles across reload", async ({
  page,
}) => {
  await page.goto("/settings/notifications");
  await page.getByRole("combobox", { name: "Session reminder timing" }).click();
  await page.getByRole("option", { name: "30 minutes before", exact: true }).click();
  await page.getByRole("switch", { name: "Quiet hours", exact: true }).click();
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Changes saved." })
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("combobox", { name: "Session reminder timing" })
  ).toHaveText("30 minutes before");
  await expect(
    page.getByRole("switch", { name: "Quiet hours", exact: true })
  ).toBeChecked();
});

test("privacy controls require confirmation and account deletion requires exact text", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 850 });
  await page.goto("/settings/privacy");
  await page.getByRole("button", { name: "Clear inbox", exact: true }).click();
  const dialog = page.getByRole("alertdialog");
  await expect(
    dialog.getByRole("heading", { name: "Clear notification inbox?" })
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.getByRole("button", { name: "Delete account", exact: true }).click();
  const destroy = dialog.getByRole("button", { name: "Permanently delete account" });
  await expect(destroy).toBeDisabled();
  await dialog
    .getByRole("textbox", { name: "Type DELETE MY ACCOUNT to confirm" })
    .fill("DELETE");
  await expect(destroy).toBeDisabled();
  await dialog
    .getByRole("textbox", { name: "Type DELETE MY ACCOUNT to confirm" })
    .fill("DELETE MY ACCOUNT");
  await expect(destroy).toBeEnabled();
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(dialog).toHaveCount(0);
});
