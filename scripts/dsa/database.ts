import { createHash } from "node:crypto";
import type { Catalog, EntityRow } from "./model";
import { canImport } from "./model";
import { fatalIssues } from "./catalog";
import { normalizeUrl } from "./normalize";

export interface Connection {
  query: <T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    params?: unknown[]
  ) => Promise<{ rows: T[] }>;
}
export interface Database extends Connection {
  transaction: <T>(run: (connection: Connection) => Promise<T>) => Promise<T>;
}
// A closed allowlist makes personal progress unreachable from the import pipeline.
export const tableSpecs: Record<string, { key: string[]; natural?: string[] }> = {
  content_sources: { key: ["id"], natural: ["slug"] },
  roadmap_topics: { key: ["id"], natural: ["slug"] },
  problems: { key: ["id"], natural: ["slug"] },
  problem_topics: { key: ["problem_id", "topic_id"] },
  dsa_problem_identities: { key: ["identity_key"] },
  dsa_problem_sources: { key: ["id"], natural: ["source_id", "source_problem_id"] },
  dsa_problem_aliases: { key: ["problem_id", "alias"] },
  problem_collections: { key: ["id"], natural: ["slug"] },
  problem_collection_items: { key: ["collection_id", "problem_id"] },
  companies: { key: ["id"], natural: ["slug"] },
  company_problem_stats: {
    key: ["id"],
    natural: ["company_id", "problem_id", "time_window", "source_id"],
  },
};
export type Plan = {
  inserted: number;
  updated: number;
  unchanged: number;
  missingProblems: number;
  existingProblems: number;
  changedProblems: number;
};
function assertPayload(catalog: Catalog) {
  if (catalog.sources.some((s) => !canImport(s)) || catalog.report.blockedSources.length)
    throw new Error("Import blocked by source permissions");
  if (fatalIssues(catalog.report.issues).length || catalog.report.invalidRows)
    throw new Error("Import blocked by fatal validation errors");
  for (const key of Object.keys(catalog.tables))
    if (!(key in tableSpecs)) throw new Error("Unexpected catalog table");
}
export function snapshotHash(catalog: Catalog) {
  return createHash("sha256")
    .update(
      JSON.stringify({
        mode: catalog.mode,
        sources: catalog.sources,
        tables: catalog.tables,
      })
    )
    .digest("hex");
}
function equal(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a instanceof Date)
    return typeof b === "string" && a.valueOf() === new Date(b).valueOf();
  if (typeof a === "object" && typeof b === "object") {
    const left = a as Record<string, unknown>,
      right = b as Record<string, unknown>,
      keys = Object.keys(left).sort();
    return (
      JSON.stringify(keys) === JSON.stringify(Object.keys(right).sort()) &&
      keys.every((k) => equal(left[k], right[k]))
    );
  }
  return typeof b === "number" && String(b) === a;
}
const same = (existing: Record<string, unknown>, row: EntityRow) =>
  Object.keys(row).every((k) => equal(existing[k], row[k]));
const keyOf = (row: Record<string, unknown>, keys: string[]) =>
  JSON.stringify(keys.map((k) => row[k]));
async function readTable(db: Connection, name: string) {
  if (!(name in tableSpecs)) throw new Error("Unknown catalog table");
  return (await db.query(`select * from public.${name}`)).rows;
}

/** Bind incoming natural identities to existing UUIDs before writing any references. */
export async function bindExistingIds(db: Connection, input: Catalog) {
  const catalog = structuredClone(input),
    ids = new Map<string, string>();
  const existing: Record<string, Record<string, unknown>[]> = {};
  for (const name of Object.keys(tableSpecs)) existing[name] = await readTable(db, name);
  const identityMap = new Map(
    existing.dsa_problem_identities.map((r) => [r.identity_key, r.problem_id])
  );
  const storedSourceOwners = new Map(
    existing.dsa_problem_sources.map((r) => [
      keyOf(r, ["source_id", "source_problem_id"]),
      String(r.problem_id),
    ])
  );
  const incomingSources = new Map<string, EntityRow[]>();
  for (const record of catalog.tables.dsa_problem_sources)
    incomingSources.set(String(record.problem_id), [
      ...(incomingSources.get(String(record.problem_id)) ?? []),
      record,
    ]);
  for (const [name, spec] of Object.entries(tableSpecs)) {
    const indexed = new Map(
      spec.natural ? existing[name].map((r) => [keyOf(r, spec.natural!), r]) : []
    );
    for (const row of catalog.tables[name] ?? []) {
      for (const column of [
        "problem_id",
        "source_id",
        "topic_id",
        "primary_topic_id",
        "company_id",
        "collection_id",
      ])
        if (typeof row[column] === "string" && ids.has(row[column] as string))
          row[column] = ids.get(row[column] as string)!;
      if (!row.id || !spec.natural) continue;
      let found = indexed.get(keyOf(row, spec.natural));
      if (name === "problems") {
        const sourceMatches = new Set<string>();
        for (const incoming of incomingSources.get(String(row.id)) ?? []) {
          const sourceId = ids.get(String(incoming.source_id)) ?? incoming.source_id;
          const owner = storedSourceOwners.get(
            keyOf({ ...incoming, source_id: sourceId }, [
              "source_id",
              "source_problem_id",
            ])
          );
          if (owner) sourceMatches.add(owner);
        }
        if (
          found?.external_url &&
          row.external_url &&
          normalizeUrl(String(found.external_url)).url !== row.external_url &&
          (!row.leetcode_slug || found.leetcode_slug !== row.leetcode_slug) &&
          !sourceMatches.has(String(found.id))
        )
          throw new Error("Existing slug collision is not a verified problem identity");
        const candidates = new Set<string>(sourceMatches);
        if (found) candidates.add(String(found.id));
        if (row.leetcode_slug) {
          for (const old of existing.problems)
            if (old.leetcode_slug === row.leetcode_slug) candidates.add(String(old.id));
        }
        for (const old of existing.problems) {
          try {
            if (
              old.external_url &&
              normalizeUrl(String(old.external_url)).url === row.external_url
            )
              candidates.add(String(old.id));
          } catch {
            /* Unrelated legacy URL needs its own later review. */
          }
        }
        for (const identity of catalog.tables.dsa_problem_identities.filter(
          (r) => r.problem_id === row.id
        )) {
          const id = identityMap.get(identity.identity_key);
          if (id) candidates.add(String(id));
        }
        if (candidates.size > 1)
          throw new Error(
            "Existing identity collision requires manual migration; personal IDs were not changed"
          );
        if (candidates.size === 1)
          found = existing.problems.find((r) => r.id === [...candidates][0]);
      }
      if (found) {
        if (name === "problems") {
          // Corrected provider links retain the PRIME route and all personal references.
          row.slug = found.slug as string;
          // Import metadata never resets later PRIME curation or manual deactivation.
          row.prime_priority = found.prime_priority as string;
          row.estimated_minutes = found.estimated_minutes as number | null;
          row.is_active = found.is_active as boolean;
        }
        if (name === "roadmap_topics" && found.domain !== "dsa")
          throw new Error("Topic slug belongs to another domain");
        ids.set(String(row.id), String(found.id));
        row.id = String(found.id);
      }
    }
  }
  // Some references precede their parent in the payload object; remap once more after all IDs are known.
  for (const rows of Object.values(catalog.tables))
    for (const row of rows)
      for (const key of Object.keys(row))
        if (
          (key === "id" || key.endsWith("_id")) &&
          typeof row[key] === "string" &&
          ids.has(row[key] as string)
        )
          row[key] = ids.get(row[key] as string)!;
  return catalog;
}
async function planBound(db: Connection, catalog: Catalog) {
  const plan: Plan = {
    inserted: 0,
    updated: 0,
    unchanged: 0,
    missingProblems: 0,
    existingProblems: 0,
    changedProblems: 0,
  };
  for (const [name, spec] of Object.entries(tableSpecs)) {
    const existing = await readTable(db, name),
      indexed = new Map(existing.map((r) => [keyOf(r, spec.key), r])),
      rows = catalog.tables[name] ?? [];
    for (const row of rows) {
      const old = indexed.get(keyOf(row, spec.key));
      if (!old) plan.inserted++;
      else if (same(old, row)) plan.unchanged++;
      else {
        plan.updated++;
        if (name === "problems") plan.changedProblems++;
      }
    }
    if (name === "problems") {
      // Compare only problems previously managed by these sources; unrelated foundation/manual rows are not removals.
      const sourceIds = new Set(catalog.tables.content_sources.map((r) => r.id));
      const managed = new Set(
        (await readTable(db, "dsa_problem_sources"))
          .filter((r) => sourceIds.has(r.source_id as string))
          .map((r) => r.problem_id)
      );
      const incoming = new Set(rows.map((r) => r.id));
      plan.existingProblems = managed.size;
      plan.missingProblems = [...managed].filter(
        (id) => !incoming.has(id as string)
      ).length;
    }
  }
  return plan;
}
export async function planImport(db: Connection, catalog: Catalog) {
  assertPayload(catalog);
  return planBound(db, await bindExistingIds(db, catalog));
}
export function checkThreshold(plan: Plan, maxChangeRatio = 0.2) {
  if (
    plan.existingProblems > 0 &&
    (plan.missingProblems + plan.changedProblems) / plan.existingProblems > maxChangeRatio
  )
    throw new Error("Large catalog change detected. Review the plan; no writes applied.");
}
export async function applyCatalog(
  db: Database,
  input: Catalog,
  options: { fixture?: boolean; maxChangeRatio?: number } = {}
) {
  assertPayload(input);
  if (input.mode === "fixture" && !options.fixture)
    throw new Error("Synthetic fixtures cannot be imported as production content");
  return db.transaction(async (tx) => {
    await tx.query("select pg_advisory_xact_lock(170731,1)");
    const catalog = await bindExistingIds(tx, input),
      plan = await planBound(tx, catalog);
    checkThreshold(plan, options.maxChangeRatio);
    for (const [name, spec] of Object.entries(tableSpecs)) {
      const rows = catalog.tables[name] ?? [];
      for (let start = 0; start < rows.length; start += 250) {
        const batch = rows.slice(start, start + 250);
        if (!batch.length) continue;
        const columns = Object.keys(batch[0]);
        if (
          batch.some(
            (row) => JSON.stringify(Object.keys(row)) !== JSON.stringify(columns)
          )
        )
          throw new Error("Inconsistent row shape");
        if (columns.some((c) => !/^[a-z_]+$/.test(c))) throw new Error("Invalid column");
        const params: unknown[] = [],
          values = batch
            .map(
              (row) =>
                `(${columns
                  .map((c) => {
                    const value = row[c];
                    params.push(
                      value !== null && typeof value === "object"
                        ? JSON.stringify(value)
                        : value
                    );
                    return `$${params.length}`;
                  })
                  .join(",")})`
            )
            .join(",");
        const updates = columns.filter((c) => !spec.key.includes(c)),
          assignment = updates.map((c) => `${c}=excluded.${c}`).join(","),
          change = updates
            .map((c) => `target.${c} is distinct from excluded.${c}`)
            .join(" or ");
        await tx.query(
          `insert into public.${name} as target (${columns.join(",")}) values ${values} on conflict (${spec.key.join(",")}) ${updates.length ? `do update set ${assignment} where ${change}` : "do nothing"}`,
          params
        );
      }
    }
    await tx.query(
      "insert into public.dsa_import_runs(snapshot_hash,source_revisions,report) values ($1,$2,$3)",
      [
        snapshotHash(input),
        JSON.stringify(
          catalog.sources.map((s) => ({ slug: s.slug, revision: s.revision }))
        ),
        JSON.stringify(plan),
      ]
    );
    return plan;
  });
}
export async function verifyCatalog(db: Connection, catalog: Catalog) {
  const plan = await planImport(db, catalog);
  if (plan.inserted || plan.updated)
    throw new Error("Database does not match staged catalog");
  return plan;
}
