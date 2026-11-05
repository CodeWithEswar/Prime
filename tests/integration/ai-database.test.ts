// @vitest-environment node
import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
let pg: PGlite;
const owner = "11111111-1111-4111-8111-111111111111",
  other = "22222222-2222-4222-8222-222222222222";
async function turn(
  user = owner,
  conversation: string | null = null,
  mode = "send",
  intent = "ask",
  message = "Explain binary search"
) {
  return (
    await pg.query<{
      result: { conversationId: string; messageId: string; hintDepth: number };
    }>(
      'select public.begin_ai_turn($1,$2,gen_random_uuid(),$3,$4,\'{"type":"general"}\',$5) as result',
      [user, conversation, message, intent, mode]
    )
  ).rows[0].result;
}
async function release(id: string) {
  await pg.query(
    "update public.ai_conversations set active_until=null,active_request=null where id=$1",
    [id]
  );
}
beforeAll(async () => {
  pg = new PGlite();
  await pg.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema public,auth to anon,authenticated,service_role;grant execute on function auth.uid() to anon,authenticated,service_role;
  create table public.problems(id uuid primary key,is_active boolean not null default true);
  create table public.notes(id uuid primary key,user_id uuid not null,entity_type text not null,entity_id uuid,body text not null);
  grant all on public.notes to service_role;grant select on public.problems to service_role;`);
  await pg.exec(
    await readFile("supabase/migrations/20261102183803_prime_ai.sql", "utf8")
  );
  await pg.query("insert into auth.users values($1),($2)", [owner, other]);
}, 60000);
afterAll(async () => {
  await pg?.close();
});
describe("Actual AI migration in PostgreSQL", () => {
  it("atomically creates a conversation, messages and a lease", async () => {
    const t = await turn();
    expect(t.conversationId).toBeTruthy();
    expect(
      (
        await pg.query(
          "select role from public.ai_messages where conversation_id=$1 order by ordinal",
          [t.conversationId]
        )
      ).rows
    ).toEqual([{ role: "user" }, { role: "assistant" }]);
    await expect(turn(owner, t.conversationId)).rejects.toThrow("AI_BUSY");
    await release(t.conversationId);
  });
  it("uses owner policies and denies forged assistant writes and confirmation", async () => {
    const a = await turn(),
      b = await turn(other);
    await pg.exec(`set role authenticated;set request.jwt.claim.sub='${owner}';`);
    expect(
      (await pg.query("select distinct user_id from public.ai_conversations")).rows
    ).toEqual([{ user_id: owner }]);
    expect(
      (
        await pg.query("select * from public.ai_messages where conversation_id=$1", [
          b.conversationId,
        ])
      ).rows
    ).toEqual([]);
    await expect(
      pg.query("update public.ai_messages set status='completed' where id=$1", [
        a.messageId,
      ])
    ).rejects.toThrow(/permission denied/);
    await expect(
      pg.query("select public.decide_ai_note($1,gen_random_uuid(),true)", [owner])
    ).rejects.toThrow(/permission denied/);
    await pg.exec("reset role;reset request.jwt.claim.sub;");
    await release(a.conversationId);
    await release(b.conversationId);
  });
  it("rejects a different owner's conversation", async () => {
    const a = await turn(other);
    await expect(turn(owner, a.conversationId)).rejects.toThrow("AI_NOT_FOUND");
    await release(a.conversationId);
  });
  it("retry replaces only the last assistant and edit replaces the latest user prompt", async () => {
    const t = await turn(other);
    await release(t.conversationId);
    await turn(other, t.conversationId, "retry");
    await release(t.conversationId);
    expect(
      (
        await pg.query(
          "select count(*)::int as n from public.ai_messages where conversation_id=$1",
          [t.conversationId]
        )
      ).rows[0]
    ).toEqual({ n: 2 });
    await turn(other, t.conversationId, "edit", "ask", "Explain the invariant instead");
    expect(
      (
        await pg.query(
          "select content from public.ai_messages where conversation_id=$1 and role='user'",
          [t.conversationId]
        )
      ).rows[0]
    ).toEqual({ content: "Explain the invariant instead" });
    await release(t.conversationId);
  });
  it("requires a stored owned proposal and confirms exactly once", async () => {
    await pg.exec("delete from public.ai_usage_buckets;");
    const t = await turn();
    const action = (
      await pg.query<{ id: string }>(
        'insert into public.ai_tool_calls(conversation_id,message_id,user_id,tool_name,input) values($1,$2,$3,\'create_note\',\'{"title":"Recall","body":"Keep the invariant."}\') returning id',
        [t.conversationId, t.messageId, owner]
      )
    ).rows[0].id;
    await expect(
      pg.query("select public.decide_ai_note($1,$2,true)", [other, action])
    ).rejects.toThrow("AI_NOT_FOUND");
    expect(
      (await pg.query("select * from public.notes where id=$1", [action])).rows
    ).toHaveLength(0);
    const first = await pg.query("select public.decide_ai_note($1,$2,true) as result", [
      owner,
      action,
    ]);
    const replay = await pg.query("select public.decide_ai_note($1,$2,true) as result", [
      owner,
      action,
    ]);
    expect(first.rows).toEqual(replay.rows);
    expect(
      (await pg.query("select * from public.notes where id=$1", [action])).rows
    ).toHaveLength(1);
    await release(t.conversationId);
  });
  it("cancel and expired proposals do not save notes", async () => {
    for (const expired of [false, true]) {
      const t = await turn();
      const a = (
        await pg.query<{ id: string }>(
          'insert into public.ai_tool_calls(conversation_id,message_id,user_id,tool_name,input,expires_at) values($1,$2,$3,\'create_note\',\'{"title":"Recall","body":"Draft"}\',now()+$4::interval) returning id',
          [t.conversationId, t.messageId, owner, expired ? "-1 second" : "10 minutes"]
        )
      ).rows[0].id;
      await pg.query("select public.decide_ai_note($1,$2,$3)", [owner, a, expired]);
      expect(
        (await pg.query("select * from public.notes where id=$1", [a])).rows
      ).toHaveLength(0);
      await release(t.conversationId);
    }
  });
  it("caps hint depth, and new turns cancel old proposals", async () => {
    await pg.exec("delete from public.ai_usage_buckets;");
    const t = await turn(owner, null, "send", "hint");
    expect(t.hintDepth).toBe(1);
    await release(t.conversationId);
    const next = await turn(owner, t.conversationId, "send", "hint", "Another hint");
    expect(next.hintDepth).toBe(2);
    await release(t.conversationId);
  });
  it("enforces persisted per-user quotas", async () => {
    await pg.exec("delete from public.ai_usage_buckets;");
    for (let i = 0; i < 8; i++) {
      const t = await turn();
      await release(t.conversationId);
    }
    await expect(turn()).rejects.toThrow("AI_LIMIT");
    expect(
      (
        await pg.query(
          "select count(*)::int as n from public.ai_usage_buckets where user_id=$1",
          [owner]
        )
      ).rows[0]
    ).toEqual({ n: 2 });
  });
});
