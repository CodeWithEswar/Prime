// @vitest-environment node
import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import { expect, it } from "vitest";
import {
  calculateProblemMastery,
  type AttemptRecord,
  type RevisionRecord,
} from "@/domain/mastery";

it("recomputes mastery from saved attempts and recall, isolates owners, and surfaces regression", async () => {
  const db = new PGlite();
  const owner = "11111111-1111-4111-8111-111111111111";
  const other = "22222222-2222-4222-8222-222222222222";
  try {
    await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
      create schema auth; create table auth.users(id uuid primary key, email text, raw_user_meta_data jsonb default '{}');
      create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
      grant usage on schema public,auth to authenticated;
      create function public.handle_updated_at() returns trigger language plpgsql as $$begin new.updated_at=now();return new;end;$$;`);
    for (const migration of [
      "20261031180218_schema_and_rls",
      "20261031180951_dsa_content_catalog_v1",
      "20261031190356_practice_dsa_and_attempt_flow",
      "20261102120000_revision_engine",
    ])
      await db.exec(await readFile("supabase/migrations/" + migration + ".sql", "utf8"));
    await db.exec(
      "grant select,insert,update,delete on all tables in schema public to authenticated"
    );
    await db.query(
      "insert into auth.users(id,email) values($1,'mastery@example.test'),($2,'other@example.test')",
      [owner, other]
    );
    const problemId = (
      await db.query<{ id: string }>(
        "select id from public.problems where slug='two-sum'"
      )
    ).rows[0].id;
    await db.exec("set role authenticated");
    const setUser = (user: string) =>
      db.query("select set_config('request.jwt.claim.sub',$1,false)", [user]);
    const evidence = async () =>
      calculateProblemMastery({
        problemId,
        difficulty: "EASY",
        targetTimeMinutes: 30,
        attempts: (
          await db.query<AttemptRecord>(
            `select id,outcome,time_taken_seconds "timeTakenSeconds", confidence, attempted_at "attemptedAt"
        from public.problem_attempts where problem_id=$1`,
            [problemId]
          )
        ).rows,
        revisions: (
          await db.query<RevisionRecord>(
            `select r.id,r.rating,r.previous_interval_days "previousIntervalDays",
        r.next_interval_days "nextIntervalDays",r.reviewed_at "reviewedAt" from public.revision_attempts r
        join public.revision_items i on i.id=r.revision_item_id where i.entity_type='problem' and i.entity_id=$1`,
            [problemId]
          )
        ).rows,
      });
    await setUser(owner);
    const solve = () =>
      db.query(
        "select public.record_problem_attempt($1,'independent',1200,5,null,'solved',14)",
        [problemId]
      );
    await solve();
    expect((await evidence()).level).toBe("practiced");
    await solve();
    await db.query("select public.complete_problem_revision($1,'easy',10,5,null)", [
      problemId,
    ]);
    const proven = await evidence();
    expect(proven.level).toBe("mastered");
    expect(proven.requirements.longestSuccessfulIntervalDays).toBe(14);

    await setUser(other);
    expect((await evidence()).level).toBe("unseen");
    await setUser(owner);
    await db.query("select public.complete_problem_revision($1,'forgot',10,1,null)", [
      problemId,
    ]);
    const regressed = await evidence();
    expect(regressed.level).not.toBe("mastered");
    expect(regressed.blockers.map((blocker) => blocker.code)).toContain("RECENT_FORGOT");
  } finally {
    await db.close();
  }
}, 60000);
