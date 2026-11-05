// Isolated test backend. It never forwards requests to Supabase or writes real user data.
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
const user = {
  id: "11111111-1111-4111-8111-111111111111",
  aud: "authenticated",
  role: "authenticated",
  email: "alex@example.test",
  app_metadata: { provider: "email" },
  user_metadata: { full_name: "Alex Morgan" },
  created_at: "2026-10-01T00:00:00Z",
};
const topic = {
  id: "33333333-3333-4333-8333-333333333333",
  slug: "arrays",
  name: "Arrays",
};
const problems = [
  {
    id: "66666666-6666-4666-8666-666666666666",
    slug: "01-matrix",
    title: "01 Matrix",
    difficulty: "medium",
    source: "leetcode",
    external_url: "https://leetcode.com/problems/01-matrix",
    acceptance_rate: 48.5,
    prime_priority: "canonical",
    primary_topic: topic,
    collections: [],
    created_at: "2026-10-01T00:00:00Z",
    updated_at: "2026-10-01T00:00:00Z",
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    slug: "two-sum",
    title: "Two Sum",
    difficulty: "easy",
    source: "leetcode",
    external_url: "https://leetcode.com/problems/two-sum",
    acceptance_rate: null,
    prime_priority: "standard",
    primary_topic: topic,
    collections: [],
    created_at: "2026-10-01T00:00:00Z",
    updated_at: "2026-10-01T00:00:00Z",
  },
  {
    id: "55555555-5555-4555-8555-555555555555",
    slug: "lru-cache",
    title: "LRU Cache",
    difficulty: "medium",
    source: "leetcode",
    external_url: "https://leetcode.com/problems/lru-cache",
    acceptance_rate: null,
    prime_priority: "standard",
    primary_topic: topic,
    collections: [],
    created_at: "2026-10-01T00:00:00Z",
    updated_at: "2026-10-01T00:00:00Z",
  },
];
let context = "full";
const plannerProposals = new Map();
let plannerTasks = [];
let plannerIntents = [];
const learningCourses = new Map();
const learningEnrollments = new Map();
const defaultSettingsRows = () =>
  new Map([
    [
      "profiles",
      [
        {
          id: user.id,
          display_name: "Alex Morgan",
          full_name: null,
          avatar_url: null,
          created_at: user.created_at,
          updated_at: user.created_at,
        },
      ],
    ],
    [
      "user_settings",
      [
        {
          user_id: user.id,
          target_role: "Software Engineer",
          target_date: "2027-01-31",
          start_date: "2026-10-01",
          daily_study_minutes: 90,
          experience_level: "intermediate",
          difficulty_preference: "balanced",
          timezone: "UTC",
          rest_days: [],
        },
      ],
    ],
    ["user_appearance_preferences", []],
    ["user_learning_preferences", []],
    ["availability_rules", []],
    ["account_security_events", []],
    ["aptitude_enrollments", []],
    ["aptitude_topic_progress", []],
    ["aptitude_video_progress", []],
    [
      "notification_preferences",
      [
        {
          id: "settings-notifications",
          user_id: user.id,
          timezone: "UTC",
          in_app_enabled: true,
          email_enabled: true,
          revision_email_enabled: true,
          session_email_enabled: true,
          assessment_email_enabled: true,
          missed_task_email_enabled: true,
          aptitude_reminder_enabled: true,
          daily_digest_enabled: true,
          weekly_report_enabled: true,
          session_lead_time_minutes: 15,
          daily_digest_local_time: "07:00:00",
          weekly_report_day: 0,
          weekly_report_local_time: "19:00:00",
          quiet_hours_enabled: false,
          quiet_hours_start: "22:00:00",
          quiet_hours_end: "07:00:00",
          created_at: user.created_at,
          updated_at: user.created_at,
        },
      ],
    ],
  ]);
let settingsRows = defaultSettingsRows();
let notificationRecords = [];
function inboxFixture() {
  return Array.from({ length: 45 }, (_, index) => ({
    id: `77777777-7777-4777-8777-${String(1000 - index).padStart(12, "0")}`,
    user_id: user.id,
    event_id: null,
    category: index % 2 ? "revision_due" : "study_session_upcoming",
    title: index === 44 ? "Earlier database review" : `Preparation update ${index + 1}`,
    body: "Your scheduled practice is ready. Review your plan and continue where you left off.",
    action_url: index === 0 ? "javascript:alert(1)" : "/plan",
    priority: "medium",
    read_at: index % 3 === 0 ? null : new Date().toISOString(),
    dismissed_at: null,
    deleted_at: null,
    // Multiple rows intentionally share a timestamp to exercise the cursor tie-breaker.
    created_at: new Date(Date.now() - Math.floor(index / 3) * 86400000)
      .toISOString()
      .replace(/\.\d{3}Z$/, ".000Z"),
  }));
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://127.0.0.1:54339");
  res.setHeader(
    "Access-Control-Allow-Origin",
    process.env.PRIME_TEST_APP_ORIGIN ?? "http://127.0.0.1:3102"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "authorization,apikey,content-type,x-client-info,prefer"
  );
  res.setHeader("Access-Control-Expose-Headers", "content-range");
  function send(body, status = 200) {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json");
    res.end(req.method === "HEAD" ? undefined : JSON.stringify(body));
  }
  if (req.method === "OPTIONS") {
    res.end();
    return;
  }
  if (url.pathname === "/health") {
    send({ ok: true });
    return;
  }
  if (url.pathname === "/__context") {
    context = url.searchParams.get("mode") ?? "full";
    if (process.env.PRIME_PLANNER_QA === "1") {
      plannerProposals.clear();
      plannerTasks = [];
      plannerIntents = [];
      settingsRows = defaultSettingsRows();
      notificationRecords = context.startsWith("notifications") ? inboxFixture() : [];
      learningCourses.clear();
      learningEnrollments.clear();
    }
    send({ context });
    return;
  }
  if (url.pathname === "/auth/v1/user") {
    if (!req.headers.authorization?.startsWith("Bearer ")) {
      send({ message: "Missing session" }, 401);
      return;
    }
    send(user);
    return;
  }
  if (url.pathname === "/auth/v1/logout") {
    send({});
    return;
  }
  if (url.pathname === "/rest/v1/rpc/complete_problem_revision") {
    let body = "";
    for await (const part of req) body += part;
    const input = JSON.parse(body);
    send({
      revision_item_id: "rev-1",
      attempt_id: "att-rev-1",
      problem_id: input.p_problem_id,
      rating: input.p_rating,
      previous_interval_days: 1,
      next_interval_days: 3,
      next_review_at: new Date(Date.now() + 3 * 86400000).toISOString(),
    });
    return;
  }
  if (url.pathname === "/rest/v1/rpc/snooze_problem_revision") {
    let body = "";
    for await (const part of req) body += part;
    const input = JSON.parse(body);
    send({
      revision_item_id: "rev-1",
      snoozed_until: input.p_snooze_until,
    });
    return;
  }
  if (url.pathname === "/rest/v1/rpc/toggle_revision_bookmark") {
    send(true);
    return;
  }
  const table = url.pathname.split("/").at(-1);
  if (process.env.PRIME_PLANNER_QA === "1" && table === "notifications") {
    if (
      context === "notifications-error" ||
      (context === "notifications-write-error" && req.method === "PATCH")
    ) {
      send({ message: "Inbox temporarily unavailable" }, 503);
      return;
    }
    let rows = notificationRecords.filter(
      (row) => row.user_id === url.searchParams.get("user_id")?.slice(3)
    );
    for (const key of ["deleted_at", "read_at"]) {
      if (url.searchParams.get(key) === "is.null")
        rows = rows.filter((row) => row[key] == null);
    }
    const ids = url.searchParams.get("id");
    if (ids?.startsWith("in.("))
      rows = rows.filter((row) => ids.slice(4, -1).split(",").includes(row.id));
    const category = url.searchParams.get("category");
    if (category?.startsWith("eq."))
      rows = rows.filter((row) => row.category === category.slice(3));
    if (category?.startsWith("in.("))
      rows = rows.filter((row) =>
        category.slice(4, -1).split(",").includes(row.category)
      );
    for (const condition of url.searchParams.getAll("or")) {
      const search = condition.match(/title\.ilike\.%([^%]+)%/);
      if (search)
        rows = rows.filter((row) =>
          (row.title + " " + row.body).toLowerCase().includes(search[1].toLowerCase())
        );
      const cursor = condition.match(
        /created_at\.lt\.([^,]+),and\(created_at\.eq\.[^,]+,id\.lt\.([^)]+)/
      );
      if (cursor)
        rows = rows.filter(
          (row) =>
            row.created_at < cursor[1] ||
            (row.created_at === cursor[1] && row.id < cursor[2])
        );
    }
    if (req.method === "PATCH") {
      let body = "";
      for await (const part of req) body += part;
      const changes = JSON.parse(body);
      rows.forEach((row) => Object.assign(row, changes));
      send(rows.map((row) => ({ id: row.id })));
      return;
    }
    rows.sort(
      (a, b) => b.created_at.localeCompare(a.created_at) || b.id.localeCompare(a.id)
    );
    const count = rows.length;
    const limit = Number(url.searchParams.get("limit") ?? 50);
    res.setHeader(
      "Content-Range",
      `0-${Math.max(0, Math.min(limit, count) - 1)}/${count}`
    );
    send(rows.slice(0, limit));
    return;
  }
  if (process.env.PRIME_PLANNER_QA === "1" && settingsRows.has(table)) {
    let records = settingsRows.get(table);
    if (
      context === "settings-failure" &&
      ["profiles", "notification_preferences"].includes(table)
    ) {
      send({ message: "Preferences temporarily unavailable" }, 503);
      return;
    }
    if (["POST", "PATCH"].includes(req.method)) {
      let body = "";
      for await (const part of req) body += part;
      const payload = JSON.parse(body);
      const updates = Array.isArray(payload) ? payload : [payload];
      for (const row of updates) {
        const key =
          table === "profiles"
            ? "id"
            : table === "availability_rules"
              ? "day_of_week"
              : "user_id";
        const keys =
          table === "aptitude_video_progress"
            ? ["user_id", "topic_id", "video_id"]
            : table === "aptitude_topic_progress"
              ? ["user_id", "topic_id"]
              : [key];
        const index = records.findIndex((record) =>
          keys.every((field) => record[field] === row[field])
        );
        if (index >= 0) records[index] = { ...records[index], ...row };
        else records.push({ id: randomUUID(), created_at: user.created_at, ...row });
      }
      settingsRows.set(table, records);
      const single = req.headers.accept?.includes("vnd.pgrst.object+json");
      send(single ? records[0] : records);
      return;
    }
    if (req.method === "DELETE") {
      settingsRows.set(table, []);
      send(null);
      return;
    }
    if (context === "empty") records = [];
    const single = req.headers.accept?.includes("vnd.pgrst.object+json");
    send(single ? (records[0] ?? null) : records);
    return;
  }
  if (
    process.env.PRIME_PLANNER_QA === "1" &&
    ["learning_courses", "learning_enrollments"].includes(table)
  ) {
    const catalog = table === "learning_courses";
    const records = catalog ? learningCourses : learningEnrollments;
    if (req.method === "POST") {
      let body = "";
      for await (const part of req) body += part;
      const input = JSON.parse(body);
      const admin = req.headers.authorization === "Bearer planner-fixture-server";
      if (catalog ? !admin : admin || input.user_id !== user.id) {
        send({ message: "Permission denied", code: "42501" }, 403);
        return;
      }
      const key = catalog ? input.slug : input.course_id;
      if (!records.has(key))
        records.set(key, {
          id: randomUUID(),
          created_at: new Date().toISOString(),
          status: catalog ? "published" : "in_progress",
          ...(!catalog && { current_day: 1 }),
          ...input,
        });
      send(null, 201);
      return;
    }
    const key = url.searchParams.get(catalog ? "slug" : "course_id")?.slice(3);
    const result = records.get(key);
    send(
      req.headers.accept?.includes("vnd.pgrst.object+json")
        ? (result ?? null)
        : result
          ? [result]
          : []
    );
    return;
  }
  if (
    process.env.PRIME_PLANNER_QA === "1" &&
    ["planner_snapshot", "planner_proposals", "commit_planner_proposal"].includes(table)
  ) {
    if (req.method === "DELETE") {
      send(null);
      return;
    }
    let body = "";
    for await (const part of req) body += part;
    const input = JSON.parse(body);
    if (table === "planner_snapshot") {
      const target = new Date(input.p_day + "T00:00:00Z");
      target.setUTCDate(target.getUTCDate() + 89);
      send({
        version: "fixture",
        settings: {
          timezone: "UTC",
          daily_study_minutes: 120,
          rest_days: [],
          target_role: "Engineer",
        },
        plan: {
          start_date: input.p_day,
          target_date: target.toISOString().slice(0, 10),
          target_role: "Engineer",
        },
        tasks: plannerTasks,
        intents: plannerIntents,
        rules: [],
        exceptions: [],
        days: [],
        revisions: [],
      });
    } else if (table === "planner_proposals") {
      const id = randomUUID();
      plannerProposals.set(id, input.changes);
      send({ id, expires_at: new Date(Date.now() + 600000).toISOString() }, 201);
    } else {
      const changes = plannerProposals.get(input.p_id);
      if (!changes) {
        send({ message: "PLANNER_PROPOSAL_MISSING" }, 400);
        return;
      }
      for (const work of changes.placements ?? [])
        plannerTasks.push({
          id: randomUUID(),
          date: work.date,
          title: work.title,
          planned_minutes: work.minutes,
          status: "pending",
          is_locked: work.locked ?? false,
          source: work.source,
          task_type: work.type,
          priority: work.priority,
          scheduled_reason: work.reason,
        });
      if (changes.intent?.status === "backlog")
        plannerIntents.push({ ...changes.intent, id: randomUUID() });
      plannerProposals.delete(input.p_id);
      send(null);
    }
    return;
  }
  if (
    context === "failure" &&
    ["profiles", "user_settings", "revision_items"].includes(table)
  ) {
    send({ message: "Test context unavailable" }, 503);
    return;
  }
  let rows = [];
  if (table === "profiles" && context !== "empty")
    rows = [{ id: user.id, display_name: "Alex Morgan", avatar_url: null }];
  if (table === "user_settings" && context !== "empty")
    rows = [
      {
        user_id: user.id,
        target_role: "Software Engineer",
        target_date: "2027-01-31",
        start_date: "2026-10-01",
        daily_study_minutes: 90,
        difficulty_preference: "balanced",
      },
    ];
  if (table === "problems") {
    rows = problems;
    if (
      process.env.PRIME_PLANNER_QA === "1" &&
      url.searchParams.get("select")?.includes("attempts:problem_attempts")
    ) {
      rows = problems.map((problem, index) => ({
        ...problem,
        estimated_minutes: 30,
        attempts:
          index === 0
            ? [7, 16].map((days, i) => ({
                id: "mastery-attempt-" + i,
                outcome: "independent",
                time_taken_seconds: 1000,
                confidence: 5,
                attempted_at: new Date(Date.now() - days * 86400000).toISOString(),
              }))
            : [],
      }));
    }
    const slug = url.searchParams.get("slug");
    if (slug?.startsWith("eq.")) rows = rows.filter((p) => p.slug === slug.slice(3));
    const title = url.searchParams.get("title");
    if (title?.startsWith("ilike."))
      rows = rows.filter((p) =>
        p.title.toLowerCase().includes(title.slice(6).replaceAll("%", "").toLowerCase())
      );
  }
  if (table === "roadmap_topics") rows = [topic];
  if (table === "problem_topics") {
    rows = problems.map((p) => ({
      problem_id: p.id,
      roadmap_topics: topic,
    }));
  }
  if (table === "revision_items") {
    if (context === "full") {
      rows = [
        {
          id: "rev-1",
          user_id: user.id,
          entity_id: problems[0].id,
          entity_type: "problem",
          interval_days: 1,
          next_review_at: new Date(Date.now() - 86400000).toISOString(),
          snoozed_until: null,
          bookmarked: false,
          status: "active",
        },
        {
          id: "rev-2",
          user_id: user.id,
          entity_id: problems[1].id,
          entity_type: "problem",
          interval_days: 3,
          next_review_at: new Date().toISOString(),
          snoozed_until: null,
          bookmarked: true,
          status: "active",
        },
        {
          id: "rev-3",
          user_id: user.id,
          entity_id: problems[2].id,
          entity_type: "problem",
          interval_days: 7,
          next_review_at: new Date(Date.now() + 86400000).toISOString(),
          snoozed_until: null,
          bookmarked: false,
          status: "active",
        },
      ];
      const entityId = url.searchParams.get("entity_id");
      if (entityId?.startsWith("eq."))
        rows = rows.filter((r) => r.entity_id === entityId.slice(3));
      if (
        process.env.PRIME_PLANNER_QA === "1" &&
        url.searchParams.get("select")?.includes("reviews:revision_attempts")
      ) {
        rows = rows.map((row) => ({
          ...row,
          reviews:
            row.entity_id === problems[0].id
              ? [
                  {
                    id: "mastery-review",
                    rating: "easy",
                    previous_interval_days: 14,
                    next_interval_days: 30,
                    reviewed_at: new Date(Date.now() - 3600000).toISOString(),
                  },
                ]
              : [],
        }));
      }
    } else {
      rows = [];
    }
  }
  if (table === "problem_attempts") {
    rows = [
      {
        id: "att-1",
        problem_id: problems[0].id,
        outcome: "independent",
        time_taken_seconds: 1080,
        attempted_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "att-2",
        problem_id: problems[1].id,
        outcome: "hint",
        time_taken_seconds: 1560,
        attempted_at: new Date().toISOString(),
      },
    ];
  }
  if (table === "revision_attempts") {
    rows = [
      {
        revision_item_id: "rev-1",
        rating: "hard",
        reviewed_at: new Date().toISOString(),
      },
      {
        revision_item_id: "rev-2",
        rating: "okay",
        reviewed_at: new Date().toISOString(),
      },
    ];
  }
  if (table === "problem_collections") {
    rows = [
      { id: "coll-1", slug: "striver-a2z", name: "Striver A2Z" },
      { id: "coll-2", slug: "love-babbar-450", name: "Love Babbar 450" },
    ];
  }
  if (table === "company_problem_stats") rows = [];
  if (table === "problem_collection_items") rows = [];
  if (table === "curricula") {
    rows = [
      {
        id: "curr-1",
        slug: "prime-core-dsa",
        name: "PRIME Core DSA",
        description: "Curated 189 high-value canonical DSA problems.",
        version: "1.0.0",
        status: "published",
        estimated_problem_count: 189,
        created_at: "2026-10-01T00:00:00Z",
        updated_at: "2026-10-01T00:00:00Z",
      },
    ];
  }
  if (table === "curriculum_stages") {
    rows = [
      {
        id: "stage-1",
        curriculum_id: "curr-1",
        slug: "arrays-hashing",
        name: "Arrays, Hashing & String Manipulation",
        description: "Foundational frequency counters, two pointers, and prefix sums.",
        sequence: 1,
        estimated_problem_count: 14,
        estimated_minutes: 360,
        created_at: "2026-10-01T00:00:00Z",
        updated_at: "2026-10-01T00:00:00Z",
      },
    ];
  }
  if (table === "curriculum_items") {
    rows = [
      {
        id: "item-1",
        curriculum_id: "curr-1",
        stage_id: "stage-1",
        problem_id: problems[0].id,
        sequence: 1,
        priority: "P0",
        recommended_minutes: 15,
        is_required: true,
        is_checkpoint: true,
        selection_reason: "Universal index mapping prerequisite.",
        created_at: "2026-10-01T00:00:00Z",
        updated_at: "2026-10-01T00:00:00Z",
        problems: problems[0],
      },
      {
        id: "item-2",
        curriculum_id: "curr-1",
        stage_id: "stage-1",
        problem_id: problems[1].id,
        sequence: 2,
        priority: "P0",
        recommended_minutes: 25,
        is_required: true,
        is_checkpoint: true,
        selection_reason: "Two pointer and hash map classic.",
        created_at: "2026-10-01T00:00:00Z",
        updated_at: "2026-10-01T00:00:00Z",
        problems: problems[1],
      },
      {
        id: "item-3",
        curriculum_id: "curr-1",
        stage_id: "stage-1",
        problem_id: problems[2].id,
        sequence: 3,
        priority: "P0",
        recommended_minutes: 35,
        is_required: true,
        is_checkpoint: true,
        selection_reason: "Hash map with doubly linked list pattern.",
        created_at: "2026-10-01T00:00:00Z",
        updated_at: "2026-10-01T00:00:00Z",
        problems: problems[2],
      },
    ];
  }
  if (
    table === "curriculum_items" &&
    url.searchParams.get("select")?.includes("problem:problems!inner")
  ) {
    rows = rows.map((row) => ({
      ...row,
      problem: { ...row.problems, topic, is_active: true },
    }));
  }
  if (table === "curriculum_dependencies") {
    rows = [];
  }
  if (table === "preparation_plans") {
    rows = [
      {
        id: "plan-1",
        user_id: user.id,
        start_date: "2026-10-01",
        target_date: "2026-12-31",
        timezone: "Asia/Kolkata",
        target_role: "Staff Software Engineer",
        daily_capacity_minutes: 240,
        status: "active",
        feasibility_status: "on_track",
        created_at: "2026-10-01T00:00:00Z",
        updated_at: "2026-10-01T00:00:00Z",
      },
    ];
  }
  if (table === "availability_rules") {
    rows = [
      { day_of_week: 0, available_minutes: 0, is_rest_day: true },
      { day_of_week: 1, available_minutes: 240, is_rest_day: false },
      { day_of_week: 2, available_minutes: 240, is_rest_day: false },
      { day_of_week: 3, available_minutes: 240, is_rest_day: false },
      { day_of_week: 4, available_minutes: 240, is_rest_day: false },
      { day_of_week: 5, available_minutes: 240, is_rest_day: false },
      { day_of_week: 6, available_minutes: 240, is_rest_day: false },
    ];
  }
  if (table === "availability_exceptions") {
    rows = [];
  }
  if (table === "daily_plans") {
    const today = new Date().toISOString().slice(0, 10);
    rows = [
      {
        id: "dp-today",
        user_id: user.id,
        plan_date: today,
        available_minutes: 240,
        planned_minutes: 180,
        completed_minutes: 60,
        is_rest_day: false,
        status: "in_progress",
        preparation_plan_id: "plan-1",
      },
    ];
  }
  if (table === "daily_tasks") {
    rows = [
      {
        id: "task-1",
        daily_plan_id: "dp-today",
        user_id: user.id,
        task_type: "revision",
        revision_item_id: "rev-1",
        problem_id: problems[0].id,
        title: "Retention Review",
        planned_minutes: 20,
        completed_minutes: 20,
        status: "completed",
        priority: "P0",
        sort_order: 1,
        scheduled_reason: "REVISION_DUE",
      },
      {
        id: "task-2",
        daily_plan_id: "dp-today",
        user_id: user.id,
        task_type: "dsa_problem",
        problem_id: problems[1].id,
        title: "Two Sum",
        planned_minutes: 35,
        completed_minutes: 35,
        status: "completed",
        priority: "P1",
        sort_order: 2,
        scheduled_reason: "CURRENT_STAGE",
      },
      {
        id: "task-3",
        daily_plan_id: "dp-today",
        user_id: user.id,
        task_type: "dsa_problem",
        problem_id: problems[2].id,
        title: "LRU Cache",
        planned_minutes: 45,
        completed_minutes: 0,
        status: "pending",
        priority: "P1",
        sort_order: 3,
        scheduled_reason: "CORE_PRIORITY",
      },
    ];
  }
  const select = url.searchParams.get("select") ?? "";
  if (process.env.PRIME_PLANNER_QA === "1") {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const rest = new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10);
    const owned = url.searchParams.get("user_id") === `eq.${user.id}`;
    if (owned && context !== "empty") {
      if (table === "problem_attempts" && select.includes("problem:problems("))
        rows = [
          {
            id: "analytics-attempt-hint",
            problem_id: problems[0].id,
            outcome: "hint",
            time_taken_seconds: 600,
            attempted_at: `${yesterday}T10:00:00Z`,
            problem: { ...problems[0], topic },
          },
          {
            id: "analytics-attempt-solve",
            problem_id: problems[0].id,
            outcome: "independent",
            time_taken_seconds: 480,
            attempted_at: `${yesterday}T11:00:00Z`,
            problem: { ...problems[0], topic },
          },
        ];
      if (table === "daily_plans" && select === "plan_date,available_minutes,is_rest_day")
        rows = [
          { plan_date: yesterday, available_minutes: 90, is_rest_day: false },
          { plan_date: rest, available_minutes: 0, is_rest_day: true },
        ];
      if (table === "daily_tasks" && select.includes("plan:daily_plans!inner"))
        rows = [
          {
            id: "analytics-task",
            status: "completed",
            planned_minutes: 40,
            created_at: `${yesterday}T08:00:00Z`,
            plan: { plan_date: yesterday },
          },
        ];
      if (table === "daily_tasks" && select === "id,completed_at")
        rows = [{ id: "analytics-task", completed_at: `${yesterday}T11:30:00Z` }];
      if (table === "study_sessions" && select.includes("task:daily_tasks"))
        rows = [
          {
            id: "analytics-session",
            started_at: `${yesterday}T11:00:00Z`,
            ended_at: `${yesterday}T11:25:00Z`,
            duration_seconds: 1500,
            task: { task_type: "dsa_problem" },
          },
        ];
      if (table === "revision_attempts" && select === "id,reviewed_at,rating")
        rows = [
          {
            id: "analytics-review",
            rating: "okay",
            reviewed_at: `${yesterday}T12:00:00Z`,
          },
        ];
    }
  }
  const single = req.headers.accept?.includes("vnd.pgrst.object+json");
  const count = rows.length;
  if (!single) {
    res.setHeader("Content-Range", count ? `0-${count - 1}/${count}` : "*/0");
    res.setHeader("Preference-Applied", "count=exact");
  }
  send(single ? (rows[0] ?? null) : rows);
});
server.listen(Number(process.env.PRIME_TEST_BACKEND_PORT ?? 54339), "127.0.0.1", () =>
  console.log("Shell test backend ready")
);
process.on("SIGTERM", () => server.close());
