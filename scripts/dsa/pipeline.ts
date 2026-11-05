import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import {
  sourceSchema,
  canImport,
  type Catalog,
  type Issue,
  type Overrides,
  type Source,
} from "./model";
import { parseSource } from "./parsers";
import { buildCatalog } from "./catalog";
import { snapshotHash } from "./database";
import { fixtureSource, fixtureRows, fixtureOverrides } from "./fixtures";
import { normalizeWindow, normalizeUrl, slug } from "./normalize";
import { applyLinkCorrection } from "./links";

export const generatedRoot = path.resolve(".generated/dsa");
const configRoot = path.resolve("scripts/dsa/config");
export async function readSources() {
  return z
    .array(sourceSchema)
    .parse(JSON.parse(await readFile(path.join(configRoot, "sources.json"), "utf8")));
}
export async function readOverrides() {
  const value = JSON.parse(
    await readFile(path.join(configRoot, "overrides.json"), "utf8")
  );
  value.linkCorrections = JSON.parse(
    await readFile(path.join(configRoot, "problem-links.json"), "utf8")
  );
  return z
    .object({
      linkCorrections: z.array(
        z.object({
          source: z.string(),
          record: z.string(),
          originalUrl: z.string().url(),
          url: z.string().url(),
          evidenceUrl: z.string().url(),
          cell: z.string(),
        })
      ),
      excludeRecords: z
        .array(
          z.object({ source: z.string(), record: z.string(), reason: z.string().min(1) })
        )
        .optional(),
      excludedTopicTags: z.array(z.string()).optional(),
      aliases: z.array(
        z.object({
          alias: z.string().min(1),
          targetIdentity: z.string().min(1),
          reason: z.string().min(1),
        })
      ),
      merges: z.array(
        z.object({
          fromIdentity: z.string().min(1),
          toIdentity: z.string().min(1),
          reason: z.string().min(1),
        })
      ),
      canonical: z.record(
        z.string(),
        z.object({
          title: z.string().min(1).optional(),
          difficulty: z.enum(["easy", "medium", "hard", "unknown"]).optional(),
          topicSlugs: z.array(z.string()).optional(),
        })
      ),
    })
    .parse(value) as Overrides;
}
export function cachePath(source: Source, file: Source["files"][number]) {
  if (!/^[a-z0-9-]+$/.test(source.slug) || !/^[a-zA-Z0-9_-]+$/.test(source.revision))
    throw new Error("Invalid source snapshot path");
  const root = path.resolve(generatedRoot, "cache", source.slug, source.revision),
    target = path.resolve(root, file.path);
  if (!target.startsWith(root + path.sep)) throw new Error("Source path escapes cache");
  return target;
}
export function verifyBlob(text: string | Uint8Array, sha: string) {
  return (
    createHash("sha1")
      .update(`blob ${Buffer.byteLength(text)}\0`)
      .update(text)
      .digest("hex") === sha
  );
}
async function sourceFiles(source: Source, discover = false): Promise<Source["files"]> {
  if (!source.discovery) return source.files;
  const indexPath = cachePath(source, {
    path: ".file-index.json",
    format: "fixture",
    sha: "index",
  });
  if (discover) {
    const repository = source.repositoryUrl?.slice("https://github.com/".length);
    const response = await fetch(
      `https://api.github.com/repos/${repository}/git/trees/${source.revision}?recursive=1`,
      { signal: AbortSignal.timeout(30000) }
    );
    if (!response.ok) throw new Error("Cannot inspect approved company snapshot tree");
    const tree = z
      .object({
        truncated: z.literal(false),
        tree: z.array(z.object({ path: z.string(), type: z.string(), sha: z.string() })),
      })
      .parse(await response.json());
    const files: Source["files"] = [];
    for (const entry of tree.tree) {
      if (entry.type !== "blob" || !entry.path.endsWith(".csv")) continue;
      const pieces = entry.path.split("/");
      if (pieces.length !== 2)
        throw new Error("Unexpected company source directory structure");
      const window = pieces[1].replace(/\.csv$/i, "");
      if (!normalizeWindow(window))
        throw new Error("New company time window requires review");
      files.push({
        path: entry.path,
        format: "company-csv",
        sha: entry.sha,
        company: pieces[0],
        timeWindow: window,
      });
    }
    if (!files.length)
      throw new Error("Approved company snapshot contains no supported CSVs");
    await mkdir(path.dirname(indexPath), { recursive: true });
    await writeFile(
      indexPath,
      JSON.stringify({ revision: source.revision, files }, null, 2)
    );
    return files;
  }
  const index = JSON.parse(await readFile(indexPath, "utf8"));
  if (index.revision !== source.revision)
    throw new Error("Company file index revision mismatch");
  return sourceSchema.shape.files.parse(index.files);
}
export async function fetchSources(sources: Source[]) {
  const result: { source: string; status: string; files: number }[] = [];
  for (const source of sources) {
    if (!canImport(source)) {
      result.push({ source: source.slug, status: source.redistributionStatus, files: 0 });
      continue;
    }
    if (
      !source.repositoryUrl ||
      !/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/.test(source.repositoryUrl) ||
      !/^[a-f0-9]{40}$/.test(source.revision)
    )
      throw new Error("Only pinned GitHub snapshots may be fetched");
    const files = await sourceFiles(source, true);
    const repositoryUrl = source.repositoryUrl;
    let cursor = 0,
      completed = 0;
    async function download() {
      while (cursor < files.length) {
        const file = files[cursor++];
        const destination = cachePath(source, file);
        try {
          const cached = await readFile(destination);
          if (verifyBlob(cached, file.sha)) continue;
        } catch {
          /* Fetch missing approved snapshots below. */
        }
        const url = `https://raw.githubusercontent.com/${repositoryUrl.slice(19)}/${source.revision}/${file.path.split("/").map(encodeURIComponent).join("/")}`;
        const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
        if (!response.ok) throw new Error(`Source fetch failed (${response.status})`);
        const text = Buffer.from(await response.arrayBuffer());
        if (Buffer.byteLength(text) > 20_000_000 || !verifyBlob(text, file.sha))
          throw new Error("Source snapshot checksum or size invalid");
        await mkdir(path.dirname(destination), { recursive: true });
        await writeFile(destination, text);
        completed++;
        if (completed % 200 === 0)
          console.log(`${source.slug}: cached ${completed}/${files.length} files`);
      }
    }
    await Promise.all(
      Array.from({ length: Math.min(6, files.length) }, () => download())
    );
    result.push({ source: source.slug, status: "cached", files: files.length });
  }
  return result;
}
export async function normalizeSources(sources: Source[], overrides: Overrides) {
  const rows: unknown[] = [],
    issues: Issue[] = [];
  let rawRows = 0;
  for (const source of sources) {
    if (!canImport(source)) continue;
    let files: Source["files"];
    try {
      files = await sourceFiles(source);
    } catch {
      issues.push({
        category: "parse_error",
        source: source.slug,
        detail: "Missing or invalid approved company snapshot index. Run dsa:fetch.",
      });
      continue;
    }
    for (const file of files) {
      if (file.format === "fixture") {
        issues.push({
          category: "parse_error",
          source: source.slug,
          detail: "Fixture format is not allowed in production source manifests",
        });
        continue;
      }
      let text: Buffer;
      try {
        text = await readFile(cachePath(source, file));
      } catch {
        issues.push({
          category: "parse_error",
          source: source.slug,
          detail: `Missing cached snapshot: ${file.path}`,
        });
        continue;
      }
      if (!verifyBlob(text, file.sha)) {
        issues.push({
          category: "snapshot_mismatch",
          source: source.slug,
          detail: file.path,
        });
        continue;
      }
      const parsed = parseSource(
        text.toString("utf8").replace(/^\uFEFF/, ""),
        source,
        file
      );
      rows.push(
        ...parsed.rows.map((row) =>
          applyLinkCorrection(row, overrides.linkCorrections ?? [])
        )
      );
      issues.push(...parsed.issues);
      rawRows += parsed.rawRows;
    }
  }
  const scoped = new Set<string>(),
    excludedTags = new Set((overrides.excludedTopicTags ?? []).map(slug));
  for (const value of rows) {
    const row = value as import("./model").InputRow;
    if (row.topics.some((t) => excludedTags.has(slug(t))))
      try {
        scoped.add(normalizeUrl(row.url).identity);
      } catch {
        /* Invalid references are rejected below. */
      }
  }
  const allowed = rows.filter((value) => {
    const row = value as import("./model").InputRow;
    const exclusion = overrides.excludeRecords?.find(
      (x) => x.source === row.source && x.record === row.sourceRecordId
    );
    let scope = false;
    try {
      scope = scoped.has(normalizeUrl(row.url).identity);
    } catch {
      /* URL validator reports this unless explicitly quarantined. */
    }
    if (exclusion || scope) {
      issues.push({
        category: "quarantined_reference",
        source: row.source,
        record: row.sourceRecordId,
        detail:
          exclusion?.reason ?? "Database/Pandas problem is outside the DSA catalog scope",
      });
      return false;
    }
    return true;
  });
  const catalog = buildCatalog(allowed, sources, overrides);
  catalog.report.quarantinedRows = rows.length - allowed.length;
  catalog.report.rawRows = rawRows;
  catalog.report.issues.push(...issues);
  catalog.report.sourceConflicts += issues.filter(
    (i) => i.category === "source_conflict"
  ).length;
  catalog.report.invalidRows += issues.filter((i) => i.category === "invalid_row").length;
  return catalog;
}
export async function generateCatalog(fixture = false) {
  return fixture
    ? buildCatalog(fixtureRows, [fixtureSource], fixtureOverrides, "fixture")
    : normalizeSources(await readSources(), await readOverrides());
}
export async function loadStagedCatalog() {
  const root = path.join(generatedRoot, "catalog"),
    file = path.join(root, "catalog.json");
  const catalog = JSON.parse(await readFile(file, "utf8")) as Catalog;
  const snapshot = JSON.parse(await readFile(path.join(root, "snapshot.json"), "utf8"));
  if (
    catalog.mode !== "catalog" ||
    snapshot.sha256 !== snapshotHash(catalog) ||
    JSON.stringify(catalog.sources) !== JSON.stringify(await readSources())
  )
    throw new Error("Staged source snapshot is stale or modified");
  const modified = (await stat(file)).mtimeMs;
  for (const filename of [
    "sources.json",
    "overrides.json",
    "problem-links.json",
    "taxonomy.ts",
  ])
    if ((await stat(path.join(configRoot, filename))).mtimeMs > modified)
      throw new Error("Staged configuration changed; rerun the dry run");
  return catalog;
}
export async function saveReports(catalog: Catalog) {
  const root = path.join(generatedRoot, catalog.mode);
  await mkdir(root, { recursive: true });
  for (const [name, value] of Object.entries({
    catalog,
    report: catalog.report,
    possible_duplicates: catalog.report.review,
    duplicate_report: catalog.report.duplicates,
    quality_issues: catalog.report.issues,
    snapshot: { sha256: snapshotHash(catalog) },
  }))
    await writeFile(
      path.join(root, `${name}.json`),
      JSON.stringify(value, null, 2) + "\n",
      "utf8"
    );
  return root;
}
