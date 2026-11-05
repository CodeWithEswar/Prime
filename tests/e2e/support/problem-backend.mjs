// Isolated HTTP fixture. No request is forwarded to a real provider or database.
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
const port = 54340,
  origin = "http://127.0.0.1:3103";
const user = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "alex@example.test",
  aud: "authenticated",
  role: "authenticated",
  app_metadata: { provider: "email" },
  user_metadata: { full_name: "Alex Morgan" },
  created_at: "2026-10-01T00:00:00Z",
};
const problemId = "44444444-4444-4444-8444-444444444444",
  topic = {
    id: "33333333-3333-4333-8333-333333333333",
    slug: "dynamic-programming",
    name: "Dynamic Programming",
  };
const collectionNames = [
  ["algoprep-151", "AlgoPrep 151"],
  ["love-babbar-450", "Love Babbar 450"],
  ["shradha", "Shradha"],
];
const collections = collectionNames.map(([slug, name], i) => ({
  id: `66666666-6666-4666-8666-${String(i + 1).padStart(12, "0")}`,
  slug,
  name,
}));
const problem = {
  id: problemId,
  slug: "01-knapsack-problem",
  title: "0/1 Knapsack Problem",
  difficulty: "medium",
  source: "geeksforgeeks",
  external_url: "https://geeksforgeeks.org/problems/0-1-knapsack-problem0945/1",
  leetcode_slug: null,
  acceptance_rate: null,
  estimated_minutes: null,
  prime_priority: "standard",
  is_active: true,
  primary_topic: topic,
  collections: collections.map((collection) => ({ collection })),
  created_at: "2026-10-01T00:00:00Z",
  updated_at: "2026-10-01T00:00:00Z",
};
const companies = [
  "Amazon",
  "Google",
  "Meta",
  "Microsoft",
  "Adobe",
  "Goldman Sachs",
  "Oracle",
  "Atlassian",
].map((name, i) => ({
  id: `77777777-7777-4777-8777-${String(i + 1).padStart(12, "0")}`,
  slug: name.toLowerCase().replaceAll(" ", "-"),
  name,
}));
let mode = "new",
  attempts = [],
  revision = null,
  progress = null,
  requests = [],
  failRpc = false;
function reset(next) {
  mode = next;
  failRpc = next === "rpc-error";
  requests = [];
  attempts = [];
  revision = null;
  progress = null;
  if (["returning", "due", "history"].includes(next)) {
    const count = next === "history" ? 45 : 3;
    attempts = Array.from({ length: count }, (_, i) => ({
      id: randomUUID(),
      user_id: user.id,
      problem_id: problemId,
      outcome: i === 0 ? "solution_viewed" : i === 1 ? "hint" : "independent",
      confidence: i === 0 ? 2 : i === 1 ? 3 : 4,
      time_taken_seconds: (i === 0 ? 46 : i === 1 ? 37 : 28) * 60,
      notes:
        i === count - 1
          ? "Explained the capacity transition without looking it up."
          : null,
      attempted_at: new Date(Date.now() - (count - i) * 86400000).toISOString(),
    })).reverse();
    const date = new Date(
      Date.now() + (next === "due" ? -2 : 7) * 86400000
    ).toISOString();
    progress = {
      user_id: user.id,
      problem_id: problemId,
      status: next === "due" ? "needs_revision" : "solved",
      mastery_score: 0.7,
      last_attempt_at: attempts[0].attempted_at,
      next_revision_at: date,
    };
    revision = {
      id: "88888888-8888-4888-8888-888888888888",
      user_id: user.id,
      entity_id: problemId,
      entity_type: "problem",
      status: "active",
      interval_days: 7,
      next_review_at: date,
      last_reviewed_at: attempts[0].attempted_at,
      reviews: ["hard", "okay", "easy"].map((rating, i) => ({
        id: randomUUID(),
        rating,
        user_id: user.id,
        reviewed_at: new Date(Date.now() - (4 - i) * 86400000).toISOString(),
        previous_interval_days: [1, 3, 3][i],
        next_interval_days: [3, 3, 7][i],
      })),
    };
  }
}
reset("new");
createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${port}`);
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader(
    "Access-Control-Allow-Headers",
    "authorization,apikey,content-type,x-client-info,prefer"
  );
  res.setHeader("Access-Control-Expose-Headers", "content-range");
  const send = (body, status = 200) => {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json");
    res.end(req.method === "HEAD" ? undefined : JSON.stringify(body));
  };
  if (req.method === "OPTIONS") {
    res.end();
    return;
  }
  if (url.pathname === "/health") {
    send({ ok: true });
    return;
  }
  if (url.pathname === "/__scenario") {
    reset(url.searchParams.get("mode") ?? "new");
    send({ mode });
    return;
  }
  if (url.pathname === "/__allow-rpc") {
    failRpc = false;
    send({ ok: true });
    return;
  }
  if (url.pathname === "/__requests") {
    send(requests);
    return;
  }
  requests.push({
    method: req.method,
    path: url.pathname,
    query: Object.fromEntries(url.searchParams),
  });
  if (url.pathname === "/auth/v1/user") {
    send(user);
    return;
  }
  if (url.pathname === "/auth/v1/logout") {
    send({});
    return;
  }
  if (url.pathname === "/rest/v1/rpc/record_problem_attempt") {
    if (failRpc) {
      send({ message: "Test storage failure", code: "test" }, 503);
      return;
    }
    if (!req.headers.authorization) {
      send({ message: "Authentication required" }, 401);
      return;
    }
    let body = "";
    for await (const part of req) body += part;
    const input = JSON.parse(body);
    const id = randomUUID(),
      at = new Date().toISOString(),
      nextReview = new Date(Date.now() + input.p_interval_days * 86400000).toISOString();
    attempts.unshift({
      id,
      user_id: user.id,
      problem_id: input.p_problem_id,
      outcome: input.p_outcome,
      time_taken_seconds: input.p_time_taken_seconds,
      confidence: input.p_confidence,
      notes: input.p_notes ?? null,
      attempted_at: at,
    });
    progress = {
      user_id: user.id,
      problem_id: problemId,
      status: input.p_next_status,
      mastery_score: 0.7,
      last_attempt_at: at,
      next_revision_at: nextReview,
    };
    revision = {
      id: "88888888-8888-4888-8888-888888888888",
      user_id: user.id,
      entity_id: problemId,
      entity_type: "problem",
      interval_days: input.p_interval_days,
      status: "active",
      next_review_at: nextReview,
      last_reviewed_at: null,
      reviews: revision?.reviews ?? [],
    };
    send({ attempt_id: id });
    return;
  }
  if (url.pathname === "/rest/v1/rpc/complete_problem_revision") {
    let body = "";
    for await (const part of req) body += part;
    const input = JSON.parse(body);
    const nextInterval = input.p_rating === "forgot" ? 1 : input.p_rating === "easy" ? 7 : 3;
    const nextDate = new Date(Date.now() + nextInterval * 86400000).toISOString();
    if (revision) {
      revision.interval_days = nextInterval;
      revision.next_review_at = nextDate;
      revision.last_reviewed_at = new Date().toISOString();
    }
    send({
      revision_item_id: revision?.id ?? "88888888-8888-4888-8888-888888888888",
      attempt_id: randomUUID(),
      problem_id: input.p_problem_id,
      rating: input.p_rating,
      previous_interval_days: 1,
      next_interval_days: nextInterval,
      next_review_at: nextDate,
    });
    return;
  }
  if (url.pathname === "/rest/v1/rpc/snooze_problem_revision") {
    let body = "";
    for await (const part of req) body += part;
    const input = JSON.parse(body);
    if (revision) {
      revision.snoozed_until = input.p_snooze_until;
      revision.next_review_at = input.p_snooze_until;
      revision.snooze_count = (revision.snooze_count ?? 0) + 1;
    }
    send({
      revision_item_id: revision?.id ?? "88888888-8888-4888-8888-888888888888",
      snoozed_until: input.p_snooze_until,
    });
    return;
  }
  if (url.pathname === "/rest/v1/rpc/toggle_revision_bookmark") {
    if (revision) {
      revision.bookmarked = !revision.bookmarked;
    }
    send(revision?.bookmarked ?? true);
    return;
  }
  const table = url.pathname.split("/").at(-1);
  if (mode === "company-error" && table === "company_problem_stats") {
    send({ message: "Fixture unavailable" }, 503);
    return;
  }
  if (mode === "history-error" && table === "problem_attempts") {
    send({ message: "Fixture unavailable" }, 503);
    return;
  }
  let rows = [];
  if (table === "profiles")
    rows = [{ id: user.id, display_name: "Alex Morgan", avatar_url: null }];
  if (table === "user_settings") rows = [];
  if (table === "problems") {
    rows = [
      {
        ...problem,
        estimated_minutes: ["returning", "due", "history"].includes(mode) ? 35 : null,
      },
      {
        ...problem,
        id: "55555555-5555-4555-8555-555555555555",
        slug: "two-sum",
        title: "Two Sum",
        difficulty: "easy",
        primary_topic: { ...topic, slug: "arrays", name: "Arrays" },
        external_url: "https://leetcode.com/problems/two-sum",
      },
    ];
    const slug = url.searchParams.get("slug"),
      id = url.searchParams.get("id");
    if (slug?.startsWith("eq.")) rows = rows.filter((p) => p.slug === slug.slice(3));
    if (id?.startsWith("eq.")) rows = rows.filter((p) => p.id === id.slice(3));
    // A second catalog page exercises return pagination without a large fixture.
    // Detail requests still resolve only the two canonical fixture problems above.
    if (!slug && !id && url.searchParams.has("offset")) {
      rows = [
        ...Array.from({ length: 25 }, (_, i) => ({
          ...problem,
          id: `99999999-9999-4999-8999-${String(i + 1).padStart(12, "0")}`,
          slug: `knapsack-fixture-${i + 1}`,
          title: `Knapsack practice case ${i + 1}`,
        })),
        ...rows,
      ];
    }
  }
  if (table === "problem_topics") rows = [{ topic }];
  if (table === "problem_collection_items")
    rows = collections.map((collection, i) => ({
      collection,
      position: null,
      section: null,
      ...(mode === "ordered" && i === 0 ? { position: 12 } : {}),
    }));
  if (table === "problem_collections") rows = collections;
  if (table === "roadmap_topics") rows = [topic];
  if (table === "company_problem_stats")
    rows = companies.flatMap((company, i) =>
      ["all_time", "three_months"].map((time_window) => ({
        company,
        time_window,
        frequency: i === 3 ? null : 32 - i * 2,
        source: { name: "Fixture company source" },
      }))
    );
  if (table === "user_problem_progress") rows = progress ? [progress] : [];
  if (table === "problem_attempts") rows = attempts;
  if (table === "revision_items") rows = revision ? [revision] : [];
  if (table === "revision_attempts") rows = revision?.reviews ?? [];
  const personal = [
    "user_problem_progress",
    "problem_attempts",
    "revision_items",
    "revision_attempts",
  ].includes(table);
  const scopedUser = url.searchParams.get("user_id");
  if (personal && scopedUser && scopedUser !== `eq.${user.id}`) rows = [];
  const problemFilter = url.searchParams.get("problem_id");
  if (personal && problemFilter && problemFilter !== `eq.${problemId}`) rows = [];
  if (table === "revision_items" && url.searchParams.has("lte")) rows = [];
  const due = url.searchParams.get("next_review_at");
  if (due?.startsWith("lte."))
    rows = rows.filter(
      (r) => r.next_review_at && Date.parse(r.next_review_at) <= Date.parse(due.slice(4))
    );
  const count = rows.length,
    offset = Number(url.searchParams.get("offset") ?? 0),
    limit = Number(url.searchParams.get("limit") ?? 1000);
  rows = rows.slice(offset, offset + limit);
  res.setHeader(
    "Content-Range",
    count ? `${offset}-${Math.max(offset, offset + rows.length - 1)}/${count}` : "*/0"
  );
  res.setHeader("Preference-Applied", "count=exact");
  send(req.headers.accept?.includes("vnd.pgrst.object+json") ? (rows[0] ?? null) : rows);
}).listen(port, "127.0.0.1", () => console.log("Problem workspace fixture ready"));
