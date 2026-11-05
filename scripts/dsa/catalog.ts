import {
  rowSchema,
  canImport,
  type Catalog,
  type EntityRow,
  type InputRow,
  type Issue,
  type Overrides,
  type Source,
} from "./model";
import { hasSourcedPracticeLink } from "./links";
import {
  mapTopics,
  normalizeCompany,
  normalizeDifficulty,
  normalizeTitle,
  normalizeUrl,
  normalizeWindow,
  slug,
  stableId,
  titleSimilarity,
} from "./normalize";
import { sheetMap, topics } from "./config/taxonomy";

type Prepared = { row: InputRow; url: ReturnType<typeof normalizeUrl>; keys: string[] };
const tableNames = [
  "content_sources",
  "roadmap_topics",
  "problems",
  "dsa_problem_identities",
  "dsa_problem_sources",
  "problem_topics",
  "dsa_problem_aliases",
  "problem_collections",
  "problem_collection_items",
  "companies",
  "company_problem_stats",
];
export function buildCatalog(
  input: unknown[],
  sources: Source[],
  overrides: Overrides,
  mode: Catalog["mode"] = "catalog"
): Catalog {
  const tables: Catalog["tables"] = Object.fromEntries(
    tableNames.map((name) => [name, []])
  );
  const report: Catalog["report"] = {
    sourcesScanned: sources.length,
    blockedSources: sources.filter((s) => !canImport(s)).map((s) => s.slug),
    rawRows: input.length,
    validRows: 0,
    invalidRows: 0,
    quarantinedRows: 0,
    canonicalProblems: 0,
    exactDuplicates: 0,
    aliasMerges: 0,
    topicsMapped: 0,
    collections: 0,
    companies: 0,
    companyRelationships: 0,
    missingUrls: 0,
    invalidUrls: 0,
    issues: [],
    review: [],
    duplicates: [],
    unknownTopics: 0,
    unknownCompanies: 0,
    difficultyConflicts: 0,
    sourceConflicts: 0,
    rowsImported: 0,
    rowsUpdated: 0,
    rowsUnchanged: 0,
  };
  const prepared: Prepared[] = [],
    permitted = new Map(sources.filter(canImport).map((s) => [s.slug, s]));
  const issue = (category: string, detail: string, row?: Partial<InputRow>) =>
    report.issues.push({
      category,
      detail,
      source: row?.source,
      record: row?.sourceRecordId,
    });
  for (const value of input) {
    const parsed = rowSchema.safeParse(value);
    if (!parsed.success) {
      report.invalidRows++;
      if (value && typeof value === "object" && "url" in value && !value.url)
        report.missingUrls++;
      issue(
        "invalid_row",
        parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")
      );
      continue;
    }
    const row = parsed.data;
    if (!permitted.has(row.source)) {
      report.invalidRows++;
      issue("blocked_source", "Source has no approved reuse basis", row);
      continue;
    }
    try {
      const url = normalizeUrl(row.url);
      const keys = [url.identity, `url:${url.url}`];
      if (row.providerId) keys.push(`${url.provider}:id:${row.providerId}`);
      prepared.push({ row, url, keys });
    } catch {
      report.invalidRows++;
      report.invalidUrls++;
      issue("invalid_url", "Missing or invalid external practice URL", row);
    }
  }
  prepared.sort(
    (a, b) =>
      a.url.identity.localeCompare(b.url.identity) ||
      a.row.source.localeCompare(b.row.source) ||
      a.row.sourceRecordId.localeCompare(b.row.sourceRecordId) ||
      JSON.stringify(a.row).localeCompare(JSON.stringify(b.row))
  );
  const parents = new Map<string, string>();
  function find(key: string): string {
    if (!parents.has(key)) parents.set(key, key);
    const p = parents.get(key)!;
    if (p === key) return key;
    const root = find(p);
    parents.set(key, root);
    return root;
  }
  function join(a: string, b: string) {
    const left = find(a),
      right = find(b);
    if (left === right) return;
    const lc = [...parents.keys()].filter(
      (k) => /^leetcode:[a-z0-9-]+$/.test(k) && [left, right].includes(find(k))
    );
    if (new Set(lc).size > 1) {
      issue(
        "identity_conflict",
        `Refusing to combine distinct LeetCode identities: ${lc.join(", ")}`
      );
      return;
    }
    parents.set(left < right ? right : left, left < right ? left : right);
  }
  for (const p of prepared) p.keys.forEach((k) => join(p.keys[0], k));
  const before = new Set(prepared.map((p) => find(p.keys[0]))).size;
  report.exactDuplicates = prepared.length - before;
  const firstExact = new Map<string, Prepared>();
  for (const p of prepared) {
    const root = find(p.keys[0]),
      first = firstExact.get(root);
    if (first)
      report.duplicates.push({
        category:
          p.url.provider === "leetcode" ? "exact_provider_match" : "exact_url_match",
        identities: [
          `${first.row.source}:${first.row.sourceRecordId}`,
          `${p.row.source}:${p.row.sourceRecordId}`,
        ],
        detail: `Strong identity ${root}`,
      });
    else firstExact.set(root, p);
  }
  for (const merge of overrides.merges) {
    if (
      !merge.reason.trim() ||
      !parents.has(merge.fromIdentity) ||
      !parents.has(merge.toIdentity)
    ) {
      issue("invalid_override", "Merge needs a reason and two existing identities");
      continue;
    }
    const different = find(merge.fromIdentity) !== find(merge.toIdentity);
    join(merge.fromIdentity, merge.toIdentity);
    if (different && find(merge.fromIdentity) === find(merge.toIdentity))
      report.duplicates.push({
        category: "alias_match",
        identities: [merge.fromIdentity, merge.toIdentity],
        detail: merge.reason,
      });
  }
  for (const alias of overrides.aliases) {
    if (!alias.reason.trim() || !parents.has(alias.targetIdentity)) {
      issue(
        "invalid_override",
        `Alias target absent or reason missing: ${alias.targetIdentity}`
      );
      continue;
    }
    for (const p of prepared)
      if (normalizeTitle(p.row.title) === normalizeTitle(alias.alias)) {
        const different = find(p.keys[0]) !== find(alias.targetIdentity);
        join(p.keys[0], alias.targetIdentity);
        if (different && find(p.keys[0]) === find(alias.targetIdentity))
          report.duplicates.push({
            category: "alias_match",
            identities: [p.keys[0], alias.targetIdentity],
            detail: alias.reason,
          });
      }
  }
  const groups = new Map<string, Prepared[]>();
  for (const p of prepared) {
    const key = find(p.keys[0]);
    groups.set(key, [...(groups.get(key) ?? []), p]);
  }
  report.aliasMerges = before - groups.size;
  const identityToProblem = new Map<string, string>();
  const emitted = new Map<string, Map<string, EntityRow>>();
  function emit(table: string, key: string, row: EntityRow) {
    let items = emitted.get(table);
    if (!items) {
      items = new Map();
      emitted.set(table, items);
    }
    const existing = items.get(key);
    if (existing && JSON.stringify(existing) !== JSON.stringify(row)) {
      issue("source_conflict", `${table}: conflicting stable key ${key}`);
      return;
    }
    items.set(key, row);
  }
  const titleGroups: { id: string; identity: string; title: string }[] = [];
  for (const source of permitted.values())
    emit("content_sources", source.slug, {
      id: stableId(`source:${source.slug}`),
      slug: source.slug,
      name: source.name,
      source_type: source.sourceType,
      repository_url: source.repositoryUrl,
      license: source.license,
      license_url: source.licenseUrl,
      attribution_required: source.attributionRequired,
      redistribution_status: source.redistributionStatus,
      last_checked_at: source.checkedAt,
      revision: source.revision,
      approval: source.approval,
    });
  for (const [key, group] of [...groups].sort(([a], [b]) => a.localeCompare(b))) {
    const identities = [...parents.keys()].filter((k) => find(k) === key).sort();
    const lc = identities.find((k) => /^leetcode:[a-z0-9-]+$/.test(k));
    const identity = lc ?? identities.find((k) => !k.startsWith("url:")) ?? identities[0];
    const problemId = stableId(`problem:${identity}`);
    identities.forEach((k) => identityToProblem.set(k, problemId));
    const selected = [...group].sort((a, b) => {
      const aProvider =
        permitted.get(a.row.source)?.sourceType === "problem_provider" ? 0 : 1;
      const bProvider =
        permitted.get(b.row.source)?.sourceType === "problem_provider" ? 0 : 1;
      return (
        aProvider - bProvider ||
        Number(!a.row.metadata.provider_title) - Number(!b.row.metadata.provider_title) ||
        a.row.source.localeCompare(b.row.source) ||
        a.row.sourceRecordId.localeCompare(b.row.sourceRecordId)
      );
    })[0];
    const override = overrides.canonical[identity];
    const difficulty =
      override?.difficulty ?? normalizeDifficulty(selected.row.difficulty);
    const difficulties = new Set(
      group
        .map((p) => normalizeDifficulty(p.row.difficulty))
        .filter((x) => x !== "unknown")
    );
    if (difficulties.size > 1)
      issue(
        "difficulty_conflict",
        `${identity}: ${[...difficulties].sort().join(", ")}; deterministic source precedence retained`,
        selected.row
      );
    const title = override?.title ?? selected.row.title;
    const topicSlugs = new Set<string>();
    for (const p of group) {
      const mapped = mapTopics(p.row.topics);
      mapped.mapped.forEach((t) => topicSlugs.add(t));
      mapped.unknown.forEach((t) => issue("unknown_topic", t, p.row));
    }
    if (override?.topicSlugs) {
      topicSlugs.clear();
      for (const t of override.topicSlugs)
        if (topics.some(([s]) => s === t)) topicSlugs.add(t);
        else issue("invalid_override", `Unknown canonical topic ${t}`);
    }
    const orderedTopics = [...topicSlugs].sort(
      (a, b) => topics.findIndex(([s]) => s === a) - topics.findIndex(([s]) => s === b)
    );
    if (!orderedTopics.length) issue("missing_topic", identity, selected.row);
    const externalUrl = lc
      ? `https://leetcode.com/problems/${lc.slice(9)}`
      : selected.url.url;
    const sourcedLink = hasSourcedPracticeLink(group.map((p) => p.row));
    if (!sourcedLink)
      issue(
        "unverified_practice_link",
        `${identity}: upstream generated URL withheld pending original-source evidence`,
        selected.row
      );
    const canonicalSlug = lc
      ? lc.slice(9)
      : `${selected.url.provider}-${slug(new URL(externalUrl).pathname.split("/").filter(Boolean).at(-1) ?? "problem")}-${stableId(identity).slice(0, 8)}`;
    emit("problems", identity, {
      id: problemId,
      slug: canonicalSlug,
      title,
      difficulty,
      source: sourcedLink ? selected.url.provider : "unverified",
      primary_topic_id: orderedTopics[0] ? stableId(`topic:${orderedTopics[0]}`) : null,
      leetcode_slug: sourcedLink && lc ? lc.slice(9) : null,
      external_url: sourcedLink ? externalUrl : null,
      estimated_minutes: null,
      prime_priority: "standard",
      is_active: true,
    });
    titleGroups.push({ id: problemId, identity, title });
    for (const t of orderedTopics)
      emit("problem_topics", `${problemId}:${t}`, {
        problem_id: problemId,
        topic_id: stableId(`topic:${t}`),
      });
    for (const k of identities)
      emit("dsa_problem_identities", k, { identity_key: k, problem_id: problemId });
    for (const p of group) {
      const sourceId = stableId(`source:${p.row.source}`),
        sourceKey = `${p.row.source}:${p.row.sourceRecordId}`;
      emit("dsa_problem_sources", sourceKey, {
        id: stableId(`record:${sourceKey}`),
        problem_id: problemId,
        source_id: sourceId,
        source_problem_id: p.row.sourceRecordId,
        source_title: p.row.title,
        source_url:
          typeof p.row.metadata.original_url === "string"
            ? normalizeUrl(p.row.metadata.original_url).url
            : p.url.url,
        source_revision: permitted.get(p.row.source)!.revision,
        source_metadata: JSON.parse(
          JSON.stringify({
            ...p.row.metadata,
            original_topics: p.row.topics,
            original_difficulty: p.row.difficulty,
          })
        ),
        is_active: true,
      });
      // Different titles sharing a strong identity are safe search aliases; raw_variations are never inferred aliases.
      if (
        p.row.title !== title &&
        !overrides.aliases.some((a) => a.alias === p.row.title)
      )
        emit("dsa_problem_aliases", `${problemId}:${p.row.title}`, {
          problem_id: problemId,
          alias: p.row.title,
          normalized_alias: normalizeTitle(p.row.title),
          reason: "Same verified provider/URL identity",
        });
      for (const name of p.row.sheets) {
        const sheet = sheetMap[name];
        if (!sheet) {
          issue("unknown_sheet", name, p.row);
          continue;
        }
        const collectionId = stableId(`collection:${sheet.slug}`);
        if (!emitted.get("problem_collections")?.has(sheet.slug))
          emit("problem_collections", sheet.slug, {
            id: collectionId,
            slug: sheet.slug,
            name: sheet.name,
            collection_type: "sheet",
            source_id: sourceId,
            description: null,
            is_active: true,
          });
        // Consolidated exports do not preserve original sheet order; do not invent curriculum position.
        const membershipKey = `${collectionId}:${problemId}`;
        if (!emitted.get("problem_collection_items")?.has(membershipKey))
          emit("problem_collection_items", membershipKey, {
            collection_id: collectionId,
            problem_id: problemId,
            position: null,
            section: null,
            subsection: null,
            source_metadata: {
              source_topic: p.row.topics,
              source_difficulty: p.row.difficulty,
              source_url: p.url.url,
            },
          });
      }
      if (p.row.company) {
        const company = normalizeCompany(p.row.company),
          window = normalizeWindow(p.row.timeWindow ?? "");
        if (!company) {
          issue("unknown_company", p.row.company, p.row);
          continue;
        }
        if (!window) {
          issue("unknown_window", p.row.timeWindow ?? "missing", p.row);
          continue;
        }
        const companyId = stableId(`company:${company.slug}`);
        emit("companies", company.slug, {
          id: companyId,
          slug: company.slug,
          name: company.name,
          is_active: true,
        });
        const statKey = `${companyId}:${problemId}:${window}:${sourceId}`;
        const dbWindow: Record<string, string> = {
          "30d": "thirty_days",
          "3m": "three_months",
          "6m": "six_months",
          "6m_plus": "more_than_six_months",
          all: "all_time",
        };
        emit("company_problem_stats", statKey, {
          id: stableId(`stat:${statKey}`),
          company_id: companyId,
          problem_id: problemId,
          time_window: dbWindow[window],
          source_id: sourceId,
          frequency: p.row.frequency,
          raw_frequency: p.row.rawFrequency,
          raw_acceptance_rate: p.row.rawAcceptanceRate,
          acceptance_rate: null,
          source_revision: permitted.get(p.row.source)!.revision,
          source_metadata: { original_window: p.row.timeWindow },
          is_active: true,
        });
      }
    }
  }
  for (const alias of overrides.aliases) {
    const problemId = identityToProblem.get(alias.targetIdentity);
    if (problemId)
      emit("dsa_problem_aliases", `${problemId}:${alias.alias}`, {
        problem_id: problemId,
        alias: alias.alias,
        normalized_alias: normalizeTitle(alias.alias),
        reason: alias.reason,
      });
  }
  // Candidates are advisory only; no title or fuzzy match changes the identity graph.
  for (let i = 0; i < titleGroups.length; i++)
    for (let j = i + 1; j < titleGroups.length; j++) {
      const a = titleGroups[i],
        b = titleGroups[j];
      const score = titleSimilarity(a.title, b.title);
      if (score >= 0.75)
        report.review.push({
          category:
            normalizeTitle(a.title) === normalizeTitle(b.title)
              ? "normalized_title_match"
              : "fuzzy_candidate",
          identities: [a.identity, b.identity],
          confidence: score,
          detail: "Review only; not merged",
        });
    }
  // Reuse the foundation's roadmap taxonomy and existing bst/heap slugs.
  topics.forEach(([s, name]) =>
    emit("roadmap_topics", s, {
      id: stableId(`topic:${s}`),
      slug: s,
      name,
      domain: "dsa",
    })
  );
  for (const name of tableNames)
    tables[name] = [...(emitted.get(name)?.values() ?? [])].sort((a, b) =>
      JSON.stringify(a).localeCompare(JSON.stringify(b))
    );
  report.validRows = prepared.length;
  report.canonicalProblems = tables.problems.length;
  report.topicsMapped = tables.problem_topics.length;
  report.collections = tables.problem_collections.length;
  report.companies = tables.companies.length;
  report.companyRelationships = tables.company_problem_stats.length;
  report.unknownTopics = report.issues.filter(
    (i) => i.category === "unknown_topic"
  ).length;
  report.unknownCompanies = report.issues.filter(
    (i) => i.category === "unknown_company"
  ).length;
  report.difficultyConflicts = report.issues.filter(
    (i) => i.category === "difficulty_conflict"
  ).length;
  report.sourceConflicts = report.issues.filter(
    (i) => i.category === "source_conflict" || i.category === "identity_conflict"
  ).length;
  return { mode, sources: structuredClone(sources), tables, report };
}
export function fatalIssues(issues: Issue[]) {
  return issues.filter((i) =>
    [
      "invalid_row",
      "invalid_url",
      "blocked_source",
      "identity_conflict",
      "source_conflict",
      "invalid_override",
      "parse_error",
      "snapshot_mismatch",
      "unsupported_company_breakdown",
    ].includes(i.category)
  );
}
