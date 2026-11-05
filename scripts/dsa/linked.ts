import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import type { Catalog } from "./model";
import {
  bindExistingIds,
  planImport,
  checkThreshold,
  snapshotHash,
  tableSpecs,
  type Connection,
  type Plan,
} from "./database";

const exec = promisify(execFile);
const literal = (value: unknown) => `'${String(value).replaceAll("'", "''")}'`;
function checkedStage(stage: string) {
  if (!/^private\.dsa_stage_[a-f0-9]{32}$/.test(stage))
    throw new Error("Invalid staging table");
  return stage;
}
export function stageInsertSql(stage: string, entries: { table: string; row: object }[]) {
  checkedStage(stage);
  if (entries.some((e) => !(e.table in tableSpecs)))
    throw new Error("Unexpected stage table");
  return `set standard_conforming_strings=on;insert into ${stage}(table_name,row_data) select value->>'table',value->'row' from jsonb_array_elements(${literal(JSON.stringify(entries))}::jsonb);`;
}
export function tableFingerprintSql(name: string) {
  if (!(name in tableSpecs)) throw new Error("Unexpected table");
  return `(select md5(coalesce(jsonb_agg(to_jsonb(t) order by ${tableSpecs[name].key.map((k) => `t.${k}`).join(",")}), '[]'::jsonb)::text) from public.${name} t)`;
}
export function linkedCommitSql(
  catalog: Catalog,
  stage: string,
  plan: Plan,
  fingerprints: Record<string, string>,
  hash = snapshotHash(catalog),
  verifyOnly = false
) {
  checkedStage(stage);
  const parts = [
    "begin;set local statement_timeout='180s';select pg_advisory_xact_lock(170731,1);",
  ];
  for (const [name, hashValue] of Object.entries(fingerprints))
    parts.push(
      `do $$begin if ${tableFingerprintSql(name)}<>${literal(hashValue)} then raise exception 'Catalog changed after review: ${name}';end if;end$$;`
    );
  for (const [name, spec] of Object.entries(tableSpecs)) {
    const rows = catalog.tables[name] ?? [];
    if (!rows.length) continue;
    const columns = Object.keys(rows[0]);
    if (
      columns.some((c) => !/^[a-z_]+$/.test(c)) ||
      rows.some((r) => JSON.stringify(Object.keys(r)) !== JSON.stringify(columns))
    )
      throw new Error("Invalid staged shape");
    if (!verifyOnly) {
      const updates = columns.filter((c) => !spec.key.includes(c));
      parts.push(
        `insert into public.${name} as target(${columns.join(",")}) select ${columns.join(",")} from jsonb_populate_recordset(null::public.${name},(select jsonb_agg(row_data) from ${stage} where table_name=${literal(name)})) r where true on conflict(${spec.key.join(",")}) ${updates.length ? `do update set ${updates.map((c) => `${c}=excluded.${c}`).join(",")} where ${updates.map((c) => `target.${c} is distinct from excluded.${c}`).join(" or ")}` : "do nothing"};`
      );
    }
    parts.push(
      `do $$begin if exists(select 1 from ${stage} s cross join lateral jsonb_populate_record(null::public.${name},s.row_data) r where s.table_name=${literal(name)} and not exists(select 1 from public.${name} target where ${spec.key.map((k) => `target.${k}=r.${k}`).join(" and ")} and ${columns.map((c) => `target.${c} is not distinct from r.${c}`).join(" and ")})) then raise exception 'Import verification failed: ${name}';end if;end$$;`
    );
  }
  if (!verifyOnly)
    parts.push(
      `insert into public.dsa_import_runs(snapshot_hash,source_revisions,report) values(${literal(hash)},${literal(JSON.stringify(catalog.sources.map((s) => ({ slug: s.slug, revision: s.revision }))))}::jsonb,${literal(JSON.stringify({ ...plan, verified: true, method: "linked-cli-private-staging" }))}::jsonb);`
    );
  parts.push(
    `drop table ${stage};commit;select jsonb_build_object('verified',true,'snapshot_hash',${literal(hash)},'canonical_problems',${catalog.tables.problems.length},'company_relationships',${catalog.tables.company_problem_stats.length}) as result;`
  );
  return parts.join("\n");
}

/** CLI-authenticated transport, for machines without a separate DB password. */
export async function syncLinked(
  catalog: Catalog,
  options: { dryRun?: boolean; verifyOnly?: boolean } = {}
) {
  if (catalog.mode !== "catalog") throw new Error("Fixtures cannot use a linked project");
  const ref = (await readFile("supabase/.temp/project-ref", "utf8")).trim();
  if (!/^[a-z0-9]{15,30}$/.test(ref)) throw new Error("Invalid linked project");
  const root = path.resolve(".generated/dsa/linked", randomUUID());
  await mkdir(root, { recursive: true });
  let sequence = 0;
  async function query(sql: string) {
    const filename = path.join(root, `${String(sequence++).padStart(4, "0")}.sql`);
    await writeFile(filename, sql, "utf8");
    const result = await exec(
      process.execPath,
      [
        path.resolve("node_modules/supabase/dist/supabase.js"),
        "db",
        "query",
        "--linked",
        "--project-ref",
        ref,
        "--file",
        filename,
      ],
      { maxBuffer: 150 * 1024 * 1024, timeout: 240000, windowsHide: true }
    );
    const start = result.stdout.indexOf("{");
    if (start < 0) throw new Error("Invalid linked query response");
    const response = JSON.parse(result.stdout.slice(start));
    if (!Array.isArray(response.rows)) throw new Error("Linked query failed");
    return response.rows as Record<string, unknown>[];
  }
  const snapshotExpr = Object.keys(tableSpecs)
    .map(
      (name) =>
        `${literal(name)},jsonb_build_object('fingerprint',${tableFingerprintSql(name)},'rows',(select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) from public.${name} t))`
    )
    .join(",");
  const snapshot = (
    await query(`select jsonb_build_object(${snapshotExpr}) as snapshot;`)
  )[0].snapshot as Record<
    string,
    { fingerprint: string; rows: Record<string, unknown>[] }
  >;
  const db: Connection = {
    query: async <T extends Record<string, unknown>>(sql: string) => {
      const match = sql.match(/^select \* from public\.([a-z_]+)$/);
      if (!match || !snapshot[match[1]]) throw new Error("Unexpected snapshot query");
      const rows = structuredClone(snapshot[match[1]].rows);
      for (const r of rows)
        if (typeof r.last_checked_at === "string")
          r.last_checked_at = new Date(r.last_checked_at);
      return { rows: rows as T[] };
    },
  };
  const plan = await planImport(db, catalog);
  checkThreshold(plan);
  const bound = await bindExistingIds(db, catalog);
  console.log(JSON.stringify({ project: ref, plan, snapshot: snapshotHash(catalog) }));
  if (options.dryRun) return { plan, verified: false };
  const stage = checkedStage(`private.dsa_stage_${randomUUID().replaceAll("-", "")}`);
  await query(
    `create schema if not exists private;create unlogged table ${stage}(table_name text not null,row_data jsonb not null);alter table ${stage} enable row level security;revoke all on ${stage} from public,anon,authenticated;select true as staged;`
  );
  try {
    let batch: { table: string; row: object }[] = [],
      size = 0,
      uploaded = 0;
    async function flush() {
      if (!batch.length) return;
      await query(stageInsertSql(stage, batch) + "select true as staged;");
      uploaded += batch.length;
      batch = [];
      size = 0;
      console.log(`Privately staged ${uploaded} rows`);
    }
    for (const [table, rows] of Object.entries(bound.tables))
      for (const row of rows) {
        const bytes = Buffer.byteLength(JSON.stringify(row));
        if (size + bytes > 1_500_000) await flush();
        batch.push({ table, row });
        size += bytes;
      }
    await flush();
    await query(
      `create index on ${stage}(table_name);select count(*) as rows from ${stage};`
    );
    const fingerprints = Object.fromEntries(
      Object.entries(snapshot).map(([k, v]) => [k, v.fingerprint])
    );
    const result = await query(
      linkedCommitSql(
        bound,
        stage,
        plan,
        fingerprints,
        snapshotHash(catalog),
        options.verifyOnly
      )
    );
    console.log(JSON.stringify(result[0]));
    return { plan, verified: true };
  } catch (error) {
    await query(`drop table if exists ${stage};select true as cleaned;`).catch(() => {});
    throw error;
  }
}
