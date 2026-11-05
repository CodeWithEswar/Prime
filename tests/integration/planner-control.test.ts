// @vitest-environment node
import { beforeAll, afterAll, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";

const db = new PGlite();
const owner = "11111111-1111-4111-8111-111111111111";
const other = "22222222-2222-4222-8222-222222222222";
let today: string;
let tomorrow: string;

beforeAll(async () => {
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}');
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    grant usage on schema public,auth to anon,authenticated,service_role;
    create function public.handle_updated_at() returns trigger language plpgsql as $$begin new.updated_at=now();return new;end;$$;`);
  for (const migration of [
    "20261031180218_schema_and_rls",
    "20261031180951_dsa_content_catalog_v1",
    "20261102120000_revision_engine",
    "20261102140000_prime_core_curriculum",
    "20261103020000_90_day_adaptive_planner",
  ])
    await db.exec(await readFile("supabase/migrations/" + migration + ".sql", "utf8"));
  await db.exec(
    "grant all on all tables in schema public to service_role; grant select,insert,update,delete on all tables in schema public to authenticated"
  );
  await db.exec(
    await readFile("supabase/migrations/20261103162620_planner_control.sql", "utf8")
  );
  await db.query(
    "insert into auth.users(id,email) values($1,'planner@example.test'),($2,'other@example.test')",
    [owner, other]
  );
  await db.query("update public.user_settings set timezone='UTC' where user_id=$1", [
    owner,
  ]);
  const dates = await db.query<{ today: string; tomorrow: string }>(
    "select current_date::text today,(current_date+1)::text tomorrow"
  );
  ({ today, tomorrow } = dates.rows[0]);
}, 60000);

afterAll(async () => {
  await db.close();
});

async function propose(changes: object) {
  return (
    await db.query<{ id: string }>(
      `insert into public.planner_proposals(user_id,local_day,snapshot_version,changes)
    values($1,$2,public.planner_snapshot($1,$2)->>'version',$3::jsonb) returning id`,
      [owner, today, JSON.stringify(changes)]
    )
  ).rows[0].id;
}

const apply = (id: string, user = owner) =>
  db.query("select public.commit_planner_proposal($1,$2)", [user, id]);

it("confirms once, isolates owners, rejects stale work and rolls back invalid moves", async () => {
  const draft = {
    target: { date: tomorrow, minutes: 90, role: "Engineer" },
    days: [{ date: today, available: 90, rest: false }],
    intent: { title: "Study", request: {}, status: "scheduled" },
    placements: [
      {
        date: today,
        title: "Study",
        minutes: 30,
        type: "custom",
        priority: "P2",
        source: "user_created",
        locked: true,
        requestIntent: true,
        reason: "USER_SELECTED_DATE",
      },
    ],
  };
  const id = await propose(draft);
  const stale = await propose(draft);
  expect((await db.query("select id from public.daily_tasks")).rows).toHaveLength(0);
  await expect(apply(id, other)).rejects.toThrow("PLANNER_PROPOSAL_MISSING");
  await db.exec("set role service_role");
  try {
    await apply(id);
    await apply(id);
    await expect(apply(stale)).rejects.toThrow("PLANNER_STALE");
  } finally {
    await db.exec("reset role");
  }
  const task = (
    await db.query<{ id: string; locked: boolean; linked: boolean }>(
      "select id,is_locked locked,planning_intent_id is not null linked from public.daily_tasks"
    )
  ).rows;
  expect(task).toEqual([{ id: expect.any(String), locked: true, linked: true }]);
  const move = await propose({
    days: [{ date: tomorrow, available: 90, rest: false }],
    placements: [{ date: tomorrow, moveId: task[0].id, reason: "CARRY_FORWARD" }],
  });
  await expect(apply(move)).rejects.toThrow("PLANNER_STALE");
  expect((await db.query("select planned_minutes from public.daily_plans")).rows).toEqual(
    [{ planned_minutes: 30 }]
  );
  const ownerDay = (await db.query<{ id: string }>("select id from public.daily_plans"))
    .rows[0].id;
  await apply(
    await propose({
      rule: { weekday: 0, minutes: 0, rest: true },
      exception: { date: tomorrow, minutes: 90, label: "Travel", remove: false },
      buffer: 20,
    })
  );
  await db.exec("set role authenticated");
  try {
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [other]);
    for (const relation of [
      "preparation_plans",
      "daily_plans",
      "daily_tasks",
      "availability_rules",
      "availability_exceptions",
    ]) {
      expect((await db.query("select id from public." + relation)).rows).toHaveLength(0);
    }
    await expect(
      db.query(
        "insert into public.daily_tasks(user_id,daily_plan_id,title,task_type) values($1,$2,'Foreign day','custom')",
        [other, ownerDay]
      )
    ).rejects.toThrow("row-level security");
    expect((await db.query("select id from public.planning_intents")).rows).toHaveLength(
      0
    );
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [owner]);
    expect((await db.query("select id from public.planning_intents")).rows).toHaveLength(
      1
    );
    await expect(db.query("select * from public.planner_proposals")).rejects.toThrow(
      "permission denied"
    );
    await expect(apply(id)).rejects.toThrow("permission denied");
  } finally {
    await db.exec("reset role");
  }
  await apply(await propose({ lock: { id: task[0].id, locked: false } }));
  await apply(
    await propose({
      days: [{ date: tomorrow, available: 90, rest: false }],
      placements: [{ date: tomorrow, moveId: task[0].id, reason: "CARRY_FORWARD" }],
    })
  );
  expect(
    (await db.query("select planned_minutes from public.daily_plans order by plan_date"))
      .rows
  ).toEqual([{ planned_minutes: 0 }, { planned_minutes: 30 }]);
  expect(
    (await db.query("select id,carry_count,original_date::text from public.daily_tasks"))
      .rows
  ).toEqual([{ id: task[0].id, carry_count: 1, original_date: today }]);
});
