import { test, expect } from "./support/weather-session";
import type { Page } from "@playwright/test";
import type { AIAction, AIEvent, AIMessage } from "../../features/ai/types";
import type { ChatInput } from "../../features/ai/schema";
test("technical manuscript contains wide tables and code on mobile", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          (window as Window & { primeCopiedCode?: string }).primeCopiedCode = text;
        },
      },
    });
  });
  await page.goto("/design-system/ai-markdown", { waitUntil: "domcontentloaded" });
  await page.getByRole("combobox", { name: "Markdown fixture" }).click();
  await page.getByRole("option", { name: "Tables", exact: true }).click();
  await expect(page.getByRole("table")).toHaveCount(2);
  for (const width of [320, 360, 375, 390, 412, 430, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
      .toBe(true);
  }
  await page.setViewportSize({ width: 360, height: 800 });
  const table = page.locator(".prime-table-viewport").last();
  expect(await table.evaluate((node) => node.scrollWidth > node.clientWidth)).toBe(true);
  await table.evaluate((node) => {
    node.scrollLeft = 120;
  });
  expect(await table.evaluate((node) => node.scrollLeft)).toBeGreaterThan(0);
  await page.getByRole("combobox", { name: "Markdown fixture" }).click();
  await page.getByRole("option", { name: "Languages", exact: true }).click();
  const code = page.locator(".prime-code-frame pre").first();
  await expect(code).toBeVisible();
  const keyword = code.locator(".hljs-keyword").first();
  await expect(keyword).toBeVisible();
  await expect(keyword).toHaveCSS("color", "rgb(196, 161, 255)");
  expect(await code.evaluate((node) => node.scrollWidth > node.clientWidth)).toBe(true);
  const copy = page.getByRole("button", { name: "Copy code", exact: true }).first();
  await copy.click();
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as Window & { primeCopiedCode?: string }).primeCopiedCode ?? ""
      )
    )
    .toContain("@Override");
  expect(await copy.innerText()).toBe("");
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
  ).toBe(true);
  if (process.env.PRIME_AI_SCREENSHOTS && test.info().project.name === "chromium")
    await page.screenshot({
      path: `${process.env.PRIME_AI_SCREENSHOTS}/prime-ai-markdown-mobile.png`,
    });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole("combobox", { name: "Markdown fixture" }).click();
  await page.getByRole("option", { name: "DSA Java", exact: true }).click();
  await page.getByRole("combobox", { name: "Preview width" }).click();
  await page.getByRole("option", { name: "400px container", exact: true }).click();
  await expect
    .poll(() =>
      page
        .locator(".prime-md-h2")
        .first()
        .evaluate((node) => parseFloat(getComputedStyle(node).fontSize))
    )
    .toBeLessThanOrEqual(20);
  if (process.env.PRIME_AI_SCREENSHOTS && test.info().project.name === "chromium")
    await page.screenshot({
      path: `${process.env.PRIME_AI_SCREENSHOTS}/prime-ai-markdown-panel.png`,
    });
  await page.getByRole("combobox", { name: "Markdown fixture" }).click();
  await page.getByRole("option", { name: "Broken Markdown", exact: true }).click();
  await expect(page.getByText("Generating…", { exact: true })).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
  ).toBe(true);
});
const conversationId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
async function mockAI(page: Page) {
  let messages: AIMessage[] = [],
    hint = 0,
    context = { type: "general" },
    actions: AIAction[] = [],
    noteCount = 0,
    requests = 0;
  let slow = false;
  await page.route("**/api/ai/**", async (route) => {
    const url = new URL(route.request().url()),
      method = route.request().method();
    if (url.pathname.endsWith("/context")) {
      const type = url.searchParams.get("type");
      return route.fulfill({
        json: {
          reference: { type, ref: url.searchParams.get("ref") },
          label:
            type === "problem"
              ? "Two Sum"
              : type === "revision"
                ? "Due revisions"
                : type === "roadmap"
                  ? "Arrays and Hashing"
                  : "Preparation workspace",
          subtitle: type === "problem" ? "Arrays · Easy" : "PRIME context",
          facts: type === "problem" ? { status: "solved", attemptCount: 2 } : {},
          references: [],
          unavailable: [],
        },
      });
    }
    if (url.pathname.endsWith("/conversations")) {
      if (method === "PATCH") return route.fulfill({ json: { ok: true } });
      return route.fulfill({
        json: {
          conversations: messages.length
            ? [
                {
                  id: conversationId,
                  title: "Two Sum reasoning",
                  context,
                  hint_depth: hint,
                  mode: "ask",
                  updated_at: new Date().toISOString(),
                  archived: false,
                },
              ]
            : [],
          nextCursor: null,
        },
      });
    }
    if (url.pathname.endsWith("/messages"))
      return route.fulfill({ json: { messages, actions, nextCursor: null } });
    if (url.pathname.endsWith("/tools")) {
      if (method === "PATCH") {
        const { id, decision } = route.request().postDataJSON();
        const action = actions.find((a) => a.id === id)!;
        if (action.status === "pending" && decision === "confirm") noteCount++;
        action.status = decision === "confirm" ? "completed" : "cancelled";
        return route.fulfill({ json: { status: action.status, noteId: id } });
      }
      const action: AIAction = {
        id: crypto.randomUUID(),
        tool_name: "create_note",
        status: "pending",
        input: {
          title: "Two Sum Recall",
          body: "## Invariant\nKeep the complement in the map.",
        },
        expires_at: new Date(Date.now() + 600000).toISOString(),
        result: null,
      };
      actions = [action];
      return route.fulfill({ json: { action } });
    }
    if (url.pathname.endsWith("/feedback")) return route.fulfill({ json: { ok: true } });
    if (url.pathname.endsWith("/chat")) {
      requests++;
      if (slow) {
        await new Promise((r) => setTimeout(r, 3000));
        return route
          .fulfill({ status: 503, json: { error: "Interrupted fixture" } })
          .catch(() => {});
      }
      const input = route.request().postDataJSON() as ChatInput;
      context = input.context;
      if (input.mode !== "send") {
        const last = messages.map((m) => m.role).lastIndexOf("user");
        messages = messages.slice(0, last + 1);
        if (input.mode === "edit") messages[last].content = input.message;
      } else
        messages.push({
          id: crypto.randomUUID(),
          role: "user",
          content: input.message,
          status: "completed",
          intent: input.intent,
          ordinal: messages.length + 1,
          created_at: new Date().toISOString(),
          parts: [],
        });
      if (input.intent === "hint") hint++;
      const id = crypto.randomUUID(),
        text =
          input.intent === "hint"
            ? `## Hint ${hint}\n\nThink about the **complement** and the invariant.`
            : input.intent === "quiz"
              ? "## Recall\n\nWhat must stay true before each lookup?"
              : "## Reasoning\n\nKeep the **invariant** precise.\n\n| Attempt | Result |\n|---|---|\n| 1 | With hint |\n\n```java\nint complement = target - value;\n```";
      const parts: AIEvent[] = [
        {
          type: "tool_result",
          name:
            input.context.type === "revision"
              ? "get_due_revisions"
              : "get_problem_context",
          ok: true,
          summary: "Read authorized PRIME data",
        },
      ];
      messages.push({
        id,
        role: "assistant",
        content: text,
        status: "completed",
        intent: input.intent,
        ordinal: messages.length + 1,
        created_at: new Date().toISOString(),
        parts,
      });
      const events: AIEvent[] = [
        { type: "start", conversationId, messageId: id, hintDepth: hint },
        { type: "text_delta", text: text.slice(0, 20) },
        { type: "text_delta", text: text.slice(20) },
        ...parts,
        { type: "done", status: "completed" },
      ];
      return route.fulfill({
        contentType: "application/x-ndjson",
        body: events.map((e) => JSON.stringify(e)).join("\n") + "\n",
      });
    }
    return route.fulfill({ status: 404, json: { error: "Unexpected fixture route" } });
  });
  return {
    get notes() {
      return noteCount;
    },
    get requests() {
      return requests;
    },
    slow: () => {
      slow = true;
    },
  };
}
test("contextual problem coaching persists from panel to workspace", async ({ page }) => {
  await mockAI(page);
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto("/practice/dsa/two-sum", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Ask PRIME", exact: true }).click();
  const panel = page.getByRole("complementary", { name: "PRIME AI panel" });
  await expect(panel.getByRole("heading", { name: "Two Sum", exact: true })).toBeVisible({
    timeout: 45000,
  });
  if (process.env.PRIME_AI_SCREENSHOTS && test.info().project.name === "chromium")
    await page.screenshot({
      path: `${process.env.PRIME_AI_SCREENSHOTS}/prime-ai-sheet.png`,
      fullPage: true,
    });
  await panel.getByRole("button", { name: "Hint", exact: true }).click();
  await expect(panel.getByRole("heading", { name: "Hint 1", exact: true })).toBeVisible();
  await panel
    .getByRole("textbox", { name: "Ask PRIME", exact: true })
    .fill("Another hint");
  await panel.getByRole("button", { name: "Send", exact: true }).click();
  await expect(panel.getByRole("heading", { name: "Hint 2", exact: true })).toBeVisible();
  await panel.getByRole("button", { name: "Close PRIME AI" }).click();
  await expect(
    page.getByRole("button", { name: "Ask PRIME", exact: true })
  ).toBeFocused();
  await page.getByRole("button", { name: "Ask PRIME", exact: true }).click();
  await expect(panel.getByRole("heading", { name: "Hint 2", exact: true })).toBeVisible();
  await panel.getByRole("link", { name: "Open workspace" }).click();
  await expect(page).toHaveURL(/\/ai$/, { timeout: 45000 });
  await expect(page.getByRole("heading", { name: "Hint 2", exact: true })).toBeVisible();
});
test("workspace renders Markdown and requires note confirmation", async ({ page }) => {
  const fixture = await mockAI(page);
  await page.goto("/ai", { waitUntil: "domcontentloaded" });
  await page
    .getByRole("textbox", { name: "Ask PRIME", exact: true })
    .fill("Explain the invariant");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Reasoning", exact: true })).toBeVisible(
    { timeout: 45000 }
  );
  await expect(page.getByRole("table")).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy code" })).toBeVisible();
  await expect(page.locator(".ai-workspace")).toBeVisible();
  await expect(page.getByRole("heading", { name: "PRIME AI", exact: true })).toBeVisible();
  await page.getByRole("combobox", { name: "AI intent" }).click();
  await expect(page.getByRole("option", { name: "Correct", exact: true })).toBeVisible();
  await page.getByRole("option", { name: "Correct", exact: true }).click();
  if (process.env.PRIME_AI_SCREENSHOTS && test.info().project.name === "chromium")
    await page.screenshot({
      path: `${process.env.PRIME_AI_SCREENSHOTS}/prime-ai-desktop.png`,
      fullPage: true,
    });
  await page.getByRole("button", { name: "Save as Note" }).click();
  await expect(page.getByRole("heading", { name: "Two Sum Recall" })).toBeVisible();
  expect(fixture.notes).toBe(0);
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  expect(fixture.notes).toBe(0);
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(page.getByRole("button", { name: "Save as Note" })).toBeVisible();
  await page.getByRole("button", { name: "Save as Note" }).click();
  await page.getByRole("button", { name: "Confirm save" }).click();
  await expect(page.getByText("Saved to Notes", { exact: true })).toBeVisible();
  expect(fixture.notes).toBe(1);
});
test("revision context, history and compact responsive layouts", async ({ page }) => {
  await mockAI(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/revision", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Ask PRIME", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Due revisions", exact: true })
  ).toBeVisible({ timeout: 45000 });
  await page.getByRole("button", { name: "Quiz me", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Recall", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Open workspace" }).click();
  await expect(page).toHaveURL(/\/ai$/, { timeout: 45000 });
  for (const width of [320, 360, 390, 430, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
    ).toBe(true);
    expect(
      await page
        .locator(".ai-canvas-toolbar .ai-action-row")
        .evaluate((node) => parseFloat(getComputedStyle(node).columnGap))
    ).toBeGreaterThanOrEqual(6);
  }
  for (const viewport of [
    { width: 683, height: 384 },
    { width: 768, height: 390 },
  ]) {
    await page.setViewportSize(viewport);
    await expect(page.getByRole("button", { name: "Send", exact: true })).toBeVisible();
    const composer = await page.locator(".ai-composer").boundingBox();
    expect(composer!.y + composer!.height).toBeLessThanOrEqual(viewport.height);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Context", exact: true }).click();
  await expect(
    page.getByRole("dialog").getByRole("heading", { name: "Due revisions", exact: true })
  ).toBeVisible();
  await page.keyboard.press("Escape");
  if (process.env.PRIME_AI_SCREENSHOTS && test.info().project.name === "chromium")
    await page.screenshot({
      path: `${process.env.PRIME_AI_SCREENSHOTS}/prime-ai-mobile.png`,
      fullPage: true,
    });
  await page.getByRole("button", { name: "History", exact: true }).click();
  await expect(
    page.getByRole("dialog").getByRole("button", { name: /^Two Sum reasoning/ })
  ).toBeVisible();
  await page.keyboard.press("Escape");
});
test("stop cancels a pending request and errors remain recoverable", async ({ page }) => {
  const fixture = await mockAI(page);
  fixture.slow();
  await page.goto("/ai", { waitUntil: "domcontentloaded" });
  await page
    .getByRole("textbox", { name: "Ask PRIME", exact: true })
    .fill("Explain binary search");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await page.getByRole("button", { name: "Stop generation" }).click();
  await expect(page.getByRole("button", { name: "Send", exact: true })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Ask PRIME", exact: true })).toHaveValue(
    "Explain binary search"
  );
  expect(fixture.requests).toBeLessThanOrEqual(1);
});
