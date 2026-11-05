import { test, expect } from "./support/shell-session";

test.describe("PRIME CS Fundamentals — 12-Day DBMS Learning Roadmap", () => {
  test.beforeEach(async ({ page }) => {
    await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
  });

  test("renders DBMS Workspace with hero, timeline rail, focus card, and tabs", async ({
    page,
  }) => {
    await page.goto("/roadmap/dbms");
    await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });

    // 1. Hero & Badges
    await expect(
      page.getByRole("heading", { name: "12-Day DBMS Learning Roadmap" })
    ).toBeVisible();
    await expect(page.getByText("CS Fundamentals")).toBeVisible();
    await expect(
      page.getByText("91 Verified Neso Academy Lectures + 12 Deep Dives")
    ).toBeVisible();
    await expect(page.getByText("Overall Progress")).toBeVisible();

    // 2. 12-Day Timeline Rail
    await expect(page.getByText("Day 01", { exact: true })).toBeVisible();
    await expect(page.getByText("Day 12", { exact: true })).toBeVisible();

    // 3. Next Recommended Step
    await expect(page.getByText("NEXT RECOMMENDED STEP")).toBeVisible();

    // 4. Primary Tabs
    await expect(page.getByRole("tab", { name: /Roadmap & Days/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /91 Video Directory/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /SQL Practice/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Interview Prep/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Analytics & Mastery/i })).toBeVisible();
  });

  test("switches tabs to Video Directory and filters by search query", async ({
    page,
  }) => {
    await page.goto("/roadmap/dbms");
    await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });

    // Click 91 Video Directory tab
    await page.getByRole("tab", { name: /91 Video Directory/i }).click();

    // Verify directory header
    await expect(
      page.getByRole("heading", { name: "Complete 91-Video Curriculum Directory" })
    ).toBeVisible();

    // Search for "Relational"
    const searchInput = page.getByPlaceholder(
      "Search by lesson title, position, or topic..."
    );
    await expect(searchInput).toBeVisible();
    await searchInput.fill("Relational Algebra");

    // Results should show filtered lessons
    await expect(page.getByText(/Relational Algebra/i).first()).toBeVisible();
  });

  test("switches to SQL Practice and displays exercises", async ({ page }) => {
    await page.goto("/roadmap/dbms");
    await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });

    // Click SQL Practice tab
    await page.getByRole("tab", { name: /SQL Practice/i }).click();

    await expect(
      page.getByRole("heading", { name: "Hands-on SQL Query & Practice Suites" })
    ).toBeVisible();
    await expect(page.getByText("SQLBolt: Creating Tables (Lesson 13)")).toBeVisible();
  });

  test("switches to Interview Prep and Analytics", async ({ page }) => {
    await page.goto("/roadmap/dbms");
    await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });

    // Click Interview Prep tab
    await page.getByRole("tab", { name: /Interview Prep/i }).click();
    await expect(
      page.getByRole("heading", {
        name: "12-Day Comprehensive DBMS Interview Question Bank",
      })
    ).toBeVisible();
    await expect(
      page.getByText("Why do we use a DBMS instead of an OS File System?")
    ).toBeVisible();

    // Click Analytics & Mastery tab
    await page.getByRole("tab", { name: /Analytics & Mastery/i }).click();
    await expect(
      page.getByRole("heading", {
        name: "DBMS Mastery Intelligence & Learning Analytics",
      })
    ).toBeVisible();
    await expect(page.getByText("Topic Domain Mastery Breakdown")).toBeVisible();
  });
});

for (const [course, heading] of [
  ["dbms", "12-Day DBMS Learning Roadmap"],
  ["os", "12-Day Operating Systems Learning Roadmap"],
  ["cn", "12-Day Computer Networks Learning Roadmap & Laboratory"],
  ["oop", "Object-Oriented Programming with Java"],
] as const) {
  test(`${course.toUpperCase()} course fits a phone and exposes its lesson tabs`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 740 });
    await page.goto(`/roadmap/${course}`);
    await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible({
      timeout: 45000,
    });
    await expect(page.getByRole("link", { name: "Schedule in Planner" })).toBeVisible();
    const tabs = page.getByRole("tablist", { name: /course views/ });
    const current = tabs.getByRole("tab", { selected: true });
    await expect(current).toHaveText("Roadmap & Days");
    await expect(page.getByRole("tabpanel").first()).toBeVisible();
    if (course === "dbms") {
      const day = page.getByRole("tablist", { name: "DBMS day views" });
      await day.getByRole("tab", { name: "Assignment & outcomes" }).click();
      await expect(
        page.getByRole("heading", { name: "Core Pedagogical Outcomes" })
      ).toBeVisible();
      await day.getByRole("tab", { name: /^Lessons/ }).click();
      await expect(
        page.getByRole("button", { name: "Bookmark lesson 1", exact: true })
      ).toBeVisible();
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
    ).toBe(true);

    await tabs.getByRole("tab", { name: /Video Directory|Video Library/ }).click();
    await expect(tabs.getByRole("tab", { selected: true })).toHaveText(
      /Video Directory|Video Library/
    );
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 800 });
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
        `${course} library at ${width}px`
      ).toBeLessThanOrEqual(width);
    }
  });
}

for (const [course, title, videoId] of [
  ["os", "Basics of OS (Computer System Operation)", "VjPgYcQqqN0"],
  ["cn", "Components of a Computer Network", "EBTP0mpCGBM"],
] as const) {
  test(`${course.toUpperCase()} uses DBMS-style day tabs and opens the mapped lesson`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 740 });
    await page.route("https://www.youtube-nocookie.com/**", (route) => route.abort());
    await page.goto(`/roadmap/${course}`);
    await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });

    const tabs = page.getByRole("tablist", { name: /day views/ });
    await tabs.getByRole("tab", { name: "Assignment & outcomes" }).click();
    await expect(page.getByRole("heading", { name: "Learning outcomes" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Practical assignment" })
    ).toBeVisible();
    await tabs.getByRole("tab", { name: /^Interview/ }).click();
    const questions = page.locator('[role="tabpanel"]:visible details');
    await questions.first().locator("summary").click();
    await expect(questions.first().locator("p")).toBeVisible();
    await tabs.getByRole("tab", { name: /^Lessons/ }).click();

    const lesson = page.getByRole("group", { name: title, exact: true });
    await lesson.getByRole("button", { name: "Watch", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: title });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Open on YouTube" })).toHaveAttribute(
      "href",
      `https://www.youtube.com/watch?v=${videoId}`
    );
    await expect(dialog.locator("iframe")).toHaveAttribute(
      "src",
      `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`
    );
    expect(
      await dialog.evaluate((element) => element.getBoundingClientRect().right)
    ).toBeLessThanOrEqual(320);
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
  });
}

for (const [course, label] of [
  ["dbms", "DBMS"],
  ["os", "OS"],
  ["cn", "CN"],
  ["oop", "OOP"],
] as const) {
  test(`${label} starts, persists, and schedules its roadmap in Planner`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.route("https://www.youtube-nocookie.com/**", (route) => route.abort());
    await page.goto(`/roadmap/${course}`);
    await page.getByRole("button", { name: "Start roadmap" }).click();
    await expect(page.getByRole("button", { name: "Resume roadmap" })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("button", { name: "Resume roadmap" })).toBeVisible();
    if (course === "oop") {
      const day = page.getByRole("tablist", { name: "OOP day views" });
      await day.getByRole("tab", { name: "Assignment & outcomes" }).click();
      await expect(page.getByRole("button", { name: "Open lab" })).toBeVisible();
    }

    await page.getByRole("link", { name: "Schedule in Planner" }).click();
    await expect(page).toHaveURL(new RegExp(`/plan\\?course=${course}$`));
    const sheet = page.getByRole("dialog");
    await expect(sheet.getByRole("heading", { name: "Schedule roadmap" })).toBeVisible();
    await sheet.getByRole("button", { name: "Preview changes" }).click();
    await expect(sheet.getByText("12 added")).toBeVisible();
    await expect(sheet.getByText(new RegExp(`^${label} Day 12 ·`))).toBeVisible();
    await sheet.getByRole("button", { name: "Confirm changes" }).click();
    await expect(
      page.getByRole("status").filter({ hasText: "Schedule updated." })
    ).toBeVisible();

    await page.goto(`/plan?course=${course}`);
    await sheet.getByRole("button", { name: "Preview changes" }).click();
    await expect(
      sheet.getByText("All sessions for this roadmap are already in your Planner.")
    ).toBeVisible();
    await expect(sheet.getByRole("button", { name: "Confirm changes" })).toBeDisabled();
  });
}
