// @vitest-environment node
import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import { buildCatalog } from "../../scripts/dsa/catalog";
import { fixtureRows, fixtureSource, fixtureOverrides } from "../../scripts/dsa/fixtures";
import {
  applyCatalog,
  verifyCatalog,
  planImport,
  type Database,
} from "../../scripts/dsa/database";
import { linkedCommitSql, stageInsertSql } from "../../scripts/dsa/linked";
import { bindExistingIds } from "../../scripts/dsa/database";
import { linkRepairSql } from "../../scripts/dsa/link-repair";

let pg: PGlite, db: Database, originalTwoSum: string;
const catalog = () =>
  buildCatalog(fixtureRows, [fixtureSource], fixtureOverrides, "fixture");
const owner = "11111111-1111-4111-8111-111111111111",
  other = "22222222-2222-4222-8222-222222222222";
beforeAll(async () => {
  pg = new PGlite();
  await pg.exec(`create role anon;create role authenticated;create role service_role bypassrls;
    create schema auth;create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}');
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    grant usage on schema public,auth to anon,authenticated,service_role;grant execute on function auth.uid() to anon,authenticated,service_role;
    create function public.handle_updated_at() returns trigger language plpgsql as $$begin new.updated_at=now();return new;end;$$;`);
  // These are the actual repository migrations, not a hand-built model of the catalog.
  await pg.exec(
    await readFile("supabase/migrations/20261031180218_schema_and_rls.sql", "utf8")
  );
  await pg.exec(
    "grant select,insert,update,delete on all tables in schema public to authenticated;grant select on all tables in schema public to anon;"
  );
  await pg.exec(
    await readFile(
      "supabase/migrations/20261031180951_dsa_content_catalog_v1.sql",
      "utf8"
    )
  );
  await pg.exec(
    await readFile(
      "supabase/migrations/20261031183613_dsa_metadata_import_authorization.sql",
      "utf8"
    )
  );
  db = {
    query: (sql, params) => pg.query(sql, params),
    transaction: async (run) =>
      pg.transaction((tx) => run({ query: (sql, params) => tx.query(sql, params) })),
  };
  originalTwoSum = (
    await pg.query<{ id: string }>("select id from public.problems where slug='two-sum'")
  ).rows[0].id;
  await pg.query(
    "insert into auth.users(id,email) values ($1,'owner@example.test'),($2,'other@example.test')",
    [owner, other]
  );
  await pg.query(
    "insert into public.user_problem_progress(user_id,problem_id,status) values($1,$2,'solved')",
    [owner, originalTwoSum]
  );
  await pg.query(
    "insert into public.problem_attempts(user_id,problem_id,outcome,confidence) values($1,$2,'independent',4)",
    [owner, originalTwoSum]
  );
}, 60000);
afterAll(async () => {
  await pg?.close();
});
describe("DSA Postgres integration", () => {
  it("repairs external metadata atomically while retaining IDs and personal records", async () => {
    const row = (
      await pg.query<{
        id: string;
        slug: string;
        external_url: string;
        source: string;
        leetcode_slug: string;
      }>(
        "select id,slug,external_url,source,leetcode_slug from public.problems where id=$1",
        [originalTwoSum]
      )
    ).rows[0];
    const before = (await pg.query("select * from public.problem_attempts")).rows;
    const progress = (await pg.query("select * from public.user_problem_progress")).rows;
    const plan = [
      {
        id: row.id,
        slug: row.slug,
        old_url: row.external_url,
        old_source: row.source,
        old_leetcode_slug: row.leetcode_slug,
        url: null,
        source: "unverified",
        leetcode_slug: null,
        status: "pending_verification",
      },
    ];
    const sql = linkRepairSql(plan, [])
      .replace(/^begin;/, "")
      .replace(/commit;$/, " ");
    await expect(
      pg.transaction(async (tx) => {
        await tx.exec(sql);
        expect(
          (
            await tx.query(
              "select id,external_url,source from public.problems where id=$1",
              [row.id]
            )
          ).rows
        ).toEqual([{ id: row.id, external_url: null, source: "unverified" }]);
        expect((await tx.query("select * from public.problem_attempts")).rows).toEqual(
          before
        );
        expect(
          (await tx.query("select * from public.user_problem_progress")).rows
        ).toEqual(progress);
        throw new Error("rollback test repair");
      })
    ).rejects.toThrow("rollback test repair");
    expect(
      (await pg.query("select external_url from public.problems where id=$1", [row.id]))
        .rows[0]
    ).toEqual({ external_url: row.external_url });
  });
  it("accepts an explicit factual-metadata directive without fabricating a license", async () => {
    await expect(
      pg.query(
        "insert into public.content_sources(slug,name,source_type,redistribution_status,revision,last_checked_at) values('invalid','Invalid','manual','metadata_only','one',now())"
      )
    ).rejects.toThrow();
  });
  it("imports twice with stable IDs, unchanged counts and no personal changes", async () => {
    const first = await applyCatalog(db, catalog(), { fixture: true });
    expect(first.inserted).toBeGreaterThan(0);
    await pg.query(
      "update public.problems set prime_priority='core',estimated_minutes=25 where id=$1",
      [originalTwoSum]
    );
    const before = await pg.query("select count(*)::int as count from public.problems");
    const timestamps = (
      await pg.query("select id,updated_at from public.problems order by id")
    ).rows;
    const second = await applyCatalog(db, catalog(), { fixture: true });
    expect(second).toMatchObject({ inserted: 0, updated: 0 });
    expect(second.unchanged).toBeGreaterThan(0);
    expect(
      (await pg.query("select count(*)::int as count from public.problems")).rows
    ).toEqual(before.rows);
    expect(
      (await pg.query("select id,updated_at from public.problems order by id")).rows
    ).toEqual(timestamps);
    expect(
      (
        await pg.query<{ id: string }>(
          "select id from public.problems where slug='two-sum'"
        )
      ).rows[0].id
    ).toBe(originalTwoSum);
    expect(
      (
        await pg.query(
          "select status from public.user_problem_progress where user_id=$1",
          [owner]
        )
      ).rows
    ).toEqual([{ status: "solved" }]);
    expect(
      (
        await pg.query<{ count: number }>(
          "select count(*)::int as count from public.problem_attempts"
        )
      ).rows[0].count
    ).toBe(1);
    expect((await verifyCatalog(db, catalog())).inserted).toBe(0);
    expect(
      (
        await pg.query(
          "select prime_priority,estimated_minutes from public.problems where id=$1",
          [originalTwoSum]
        )
      ).rows
    ).toEqual([{ prime_priority: "core", estimated_minutes: 25 }]);
    expect(
      (
        await pg.query(
          "select p.slug from public.problems p join public.dsa_problem_aliases a on a.problem_id=p.id where to_tsvector('simple',a.alias) @@ plainto_tsquery('simple','kadane')"
        )
      ).rows
    ).toEqual([{ slug: "maximum-subarray" }]);
  }, 60000);
  it("enforces provider uniqueness and primary-topic membership in the database", async () => {
    await expect(
      pg.query(
        "insert into public.problems(slug,title,difficulty,source,leetcode_slug,external_url) values('duplicate-two','Duplicate','easy','leetcode','two-sum','https://example.org/duplicate')"
      )
    ).rejects.toThrow();
    const topic = (
      await pg.query<{ id: string }>(
        "select id from public.roadmap_topics where slug='graphs'"
      )
    ).rows[0].id;
    await expect(
      pg.query("update public.problems set primary_topic_id=$1 where id=$2", [
        topic,
        originalTwoSum,
      ])
    ).rejects.toThrow();
  });
  it("rolls back all batches on a late foreign-key failure", async () => {
    const c = catalog();
    c.tables.company_problem_stats[0].source_id = "99999999-9999-4999-8999-999999999999";
    c.tables.content_sources[0].name = "Must roll back";
    const before = (await pg.query("select name from public.content_sources")).rows;
    await expect(applyCatalog(db, c, { fixture: true })).rejects.toThrow();
    expect((await pg.query("select name from public.content_sources")).rows).toEqual(
      before
    );
  });
  it("blocks unexpected catalog shrinkage and unapproved imports before mutation", async () => {
    const c = buildCatalog(
      fixtureRows.slice(0, 3),
      [fixtureSource],
      { aliases: [], merges: [], canonical: {} },
      "fixture"
    );
    expect((await planImport(db, c)).missingProblems).toBeGreaterThan(0);
    await expect(applyCatalog(db, c, { fixture: true })).rejects.toThrow(
      /Large catalog change/
    );
    const blocked = buildCatalog(
      fixtureRows,
      [{ ...fixtureSource, redistributionStatus: "blocked" }],
      fixtureOverrides,
      "fixture"
    );
    await expect(applyCatalog(db, blocked, { fixture: true })).rejects.toThrow(
      /permissions/
    );
    await expect(applyCatalog(db, catalog())).rejects.toThrow(/fixtures/);
  });
  it("keeps a missing source record without deleting a canonical problem", async () => {
    const c = buildCatalog(
      fixtureRows.filter((r) => r.sourceRecordId !== "two"),
      [fixtureSource],
      fixtureOverrides,
      "fixture"
    );
    await applyCatalog(db, c, { fixture: true });
    expect(
      (
        await pg.query<{ count: number }>(
          "select count(*)::int as count from public.dsa_problem_sources where source_problem_id='two'"
        )
      ).rows[0].count
    ).toBe(1);
  });
  it("isolates personal rows and prevents catalog writes by authenticated users", async () => {
    await pg.exec(
      `set role authenticated;select set_config('request.jwt.claim.sub','${owner}',false);`
    );
    expect(
      (await pg.query("select status from public.user_problem_progress")).rows
    ).toEqual([{ status: "solved" }]);
    await expect(
      pg.query(
        "insert into public.problems(slug,title,difficulty) values('user-write','Denied','easy')"
      )
    ).rejects.toThrow();
    await expect(
      pg.query("update public.user_problem_progress set user_id=$1 where user_id=$2", [
        other,
        owner,
      ])
    ).rejects.toThrow();
    await pg.exec(`select set_config('request.jwt.claim.sub','${other}',false);`);
    expect((await pg.query("select * from public.user_problem_progress")).rows).toEqual(
      []
    );
    expect((await pg.query("select * from public.problem_attempts")).rows).toEqual([]);
    await expect(
      pg.query(
        "insert into public.user_problem_progress(user_id,problem_id) values($1,$2)",
        [owner, originalTwoSum]
      )
    ).rejects.toThrow();
    await pg.exec("reset role;set role anon;");
    expect((await pg.query("select * from public.user_problem_progress")).rows).toEqual(
      []
    );
    await expect(pg.query("select * from public.dsa_import_runs")).rejects.toThrow();
    await pg.exec("reset role;");
  });
  it("publishes and verifies a privately staged linked import atomically", async () => {
    const c = catalog();
    c.sources[0].license = null;
    c.sources[0].approval!.basis = "user_directed_factual_metadata";
    c.tables.content_sources[0].license = null;
    c.tables.content_sources[0].approval = c.sources[0].approval!;
    const plan = await planImport(db, c),
      bound = await bindExistingIds(db, c);
    const stage = "private.dsa_stage_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    await pg.exec(
      `create schema if not exists private;create unlogged table ${stage}(table_name text,row_data jsonb);`
    );
    const entries = Object.entries(bound.tables).flatMap(([table, rows]) =>
      rows.map((row) => ({ table, row }))
    );
    await pg.exec(stageInsertSql(stage, entries));
    await pg.exec(linkedCommitSql(bound, stage, plan, {}));
    expect((await verifyCatalog(db, c)).updated).toBe(0);
    expect(
      (
        await pg.query(
          "select license,approval->>'basis' as basis from public.content_sources where slug=$1",
          [c.sources[0].slug]
        )
      ).rows
    ).toEqual([{ license: null, basis: "user_directed_factual_metadata" }]);
  });
  it("binds a reviewed provider correction to the original UUID and PRIME route", async () => {
    const incoming = catalog();
    const problem = incoming.tables.problems.find((p) => p.slug === "two-sum")!;
    const id = problem.id;
    problem.slug = "reviewed-provider-route";
    problem.external_url = "https://geeksforgeeks.org/problems/source-backed-example/1";
    problem.source = "geeksforgeeks";
    problem.leetcode_slug = null;
    for (const identity of incoming.tables.dsa_problem_identities.filter(
      (r) => r.problem_id === id
    ))
      identity.identity_key =
        "url:https://geeksforgeeks.org/problems/source-backed-example/1";
    const bound = await bindExistingIds(db, incoming);
    expect(
      bound.tables.problems.find((p) => p.external_url === problem.external_url)
    ).toMatchObject({ id: originalTwoSum, slug: "two-sum" });
  });
});
