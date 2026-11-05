import fs from "fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { CANONICAL_STAGES } from "../../data/prime-core/stages";
import { PRIME_CORE_SEED_ITEMS } from "../../data/prime-core/curriculum";
import { PRIME_CORE_SEED_DEPENDENCIES } from "../../data/prime-core/dependencies";
import { validateCurriculumDAG } from "../../domain/curriculum/dag-validator";
import { calculateCurationScore } from "../../domain/curriculum/curation-scorer";
import type { CurriculumItem, CurriculumDependency } from "../../domain/curriculum/types";

const exec = promisify(execFile);
const literal = (value: unknown) => `'${String(value).replaceAll("'", "''")}'`;

function parseEnv() {
  const env: Record<string, string> = {};
  if (fs.existsSync(".env.local")) {
    const lines = fs.readFileSync(".env.local", "utf8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
        env[k] = v;
      }
    }
  }
  return env;
}

async function runLinkedQuery(sql: string): Promise<Record<string, unknown>[]> {
  const tempDir = path.resolve(".generated/prime-core");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const filename = path.join(tempDir, `query-${Date.now()}.sql`);
  fs.writeFileSync(filename, sql, "utf8");

  const result = await exec(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["supabase", "db", "query", "--linked", "--file", filename],
    { maxBuffer: 100 * 1024 * 1024, timeout: 180000, shell: true }
  );

  try {
    fs.unlinkSync(filename);
  } catch {}

  const start = result.stdout.indexOf("{");
  if (start < 0) {
    throw new Error(`Invalid linked query response: ${result.stdout}`);
  }

  const response = JSON.parse(result.stdout.slice(start));
  if (!Array.isArray(response.rows)) {
    throw new Error(`Linked query failed: ${result.stdout}`);
  }

  return response.rows as Record<string, unknown>[];
}

// ----------------------------------------------------------------------------
// 1. ANALYZE
// ----------------------------------------------------------------------------
async function runAnalyze() {
  console.log("Analyzing PRIME Core candidate pool against canonical database...");

  // Load collection items count
  const colRows = await runLinkedQuery(
    "SELECT collection_id, problem_id FROM public.problem_collection_items;"
  );
  const problemCollectionMap = new Map<string, Set<string>>();
  for (const ci of colRows) {
    const set = problemCollectionMap.get(String(ci.problem_id)) ?? new Set<string>();
    set.add(String(ci.collection_id));
    problemCollectionMap.set(String(ci.problem_id), set);
  }

  // Load company stats
  const compRows = await runLinkedQuery(
    "SELECT problem_id, company_id, frequency FROM public.company_problem_stats;"
  );
  const problemCompanyMap = new Map<string, Set<string>>();
  const problemFreqMap = new Map<string, number>();

  for (const cs of compRows) {
    const compSet = problemCompanyMap.get(String(cs.problem_id)) ?? new Set<string>();
    compSet.add(String(cs.company_id));
    problemCompanyMap.set(String(cs.problem_id), compSet);

    const prevFreq = problemFreqMap.get(String(cs.problem_id)) ?? 0;
    problemFreqMap.set(String(cs.problem_id), prevFreq + (Number(cs.frequency) || 1));
  }

  const catalogCache: Record<string, { id: string; slug: string; title: string; difficulty: string }> =
    JSON.parse(fs.readFileSync("data/prime-core/catalog-cache.json", "utf8"));

  const scores: Array<{
    slug: string;
    title: string;
    stageSlug: string;
    collectionsCount: number;
    companiesCount: number;
    frequency: number;
    score: number;
  }> = [];

  for (const item of PRIME_CORE_SEED_ITEMS) {
    const prob = catalogCache[item.slug.toLowerCase()];
    if (!prob) continue;

    const colCount = problemCollectionMap.get(prob.id)?.size ?? 0;
    const compCount = problemCompanyMap.get(prob.id)?.size ?? 0;
    const freq = problemFreqMap.get(prob.id) ?? 0;

    const breakdown = calculateCurationScore({
      curriculumImportance: item.priority === "P0" ? 1.0 : item.priority === "P1" ? 0.75 : 0.5,
      collectionOverlapCount: colCount,
      maxCollections: 6,
      uniqueCompanyCount: compCount,
      maxCompanyBreadth: 25,
      totalCompanyFrequency: freq,
      maxCompanyFrequency: 200,
      patternValue: item.isCheckpoint ? 1.0 : 0.8,
      prerequisiteValue: 0.8,
    });

    scores.push({
      slug: item.slug,
      title: prob.title,
      stageSlug: item.stageSlug,
      collectionsCount: colCount,
      companiesCount: compCount,
      frequency: freq,
      score: breakdown.totalScore,
    });
  }

  scores.sort((a, b) => b.score - a.score);

  console.log("\nTop 10 highest-scoring PRIME Core problems by curation formula:");
  console.table(scores.slice(0, 10));
}

// ----------------------------------------------------------------------------
// 2. VALIDATE
// ----------------------------------------------------------------------------
async function runValidate(): Promise<boolean> {
  console.log("Validating PRIME Core Curriculum seed data...");

  let hasErrors = false;
  const stageSlugs = new Set(CANONICAL_STAGES.map((s) => s.slug));

  for (let i = 0; i < CANONICAL_STAGES.length; i++) {
    if (CANONICAL_STAGES[i].sequence !== i + 1) {
      console.error(`Stage sequence mismatch: ${CANONICAL_STAGES[i].slug} expected ${i + 1}, got ${CANONICAL_STAGES[i].sequence}`);
      hasErrors = true;
    }
  }

  const catalogCache: Record<string, { id: string; slug: string; title: string; difficulty: string }> =
    JSON.parse(fs.readFileSync("data/prime-core/catalog-cache.json", "utf8"));

  const seenSlugs = new Set<string>();
  const seedItems: CurriculumItem[] = [];

  for (let i = 0; i < PRIME_CORE_SEED_ITEMS.length; i++) {
    const item = PRIME_CORE_SEED_ITEMS[i];

    if (seenSlugs.has(item.slug)) {
      console.error(`Duplicate problem slug in seed: ${item.slug}`);
      hasErrors = true;
    }
    seenSlugs.add(item.slug);

    if (item.sequence !== i + 1) {
      console.error(`Item sequence mismatch for ${item.slug}: expected ${i + 1}, got ${item.sequence}`);
      hasErrors = true;
    }

    if (!stageSlugs.has(item.stageSlug)) {
      console.error(`Unknown stageSlug "${item.stageSlug}" referenced by item ${item.slug}`);
      hasErrors = true;
    }

    const prob = catalogCache[item.slug.toLowerCase()];
    if (!prob) {
      console.error(`Problem slug "${item.slug}" not found in canonical catalog!`);
      hasErrors = true;
    } else {
      seedItems.push({
        id: `item-${item.slug}`,
        curriculumId: "prime-core-dsa",
        stageId: item.stageSlug,
        problemId: prob.id,
        sequence: item.sequence,
        priority: item.priority,
        recommendedMinutes: item.recommendedMinutes,
        isRequired: item.isRequired,
        isCheckpoint: item.isCheckpoint,
        selectionReason: item.selectionReason,
        title: prob.title,
      });
    }
  }

  const seedDeps: CurriculumDependency[] = [];
  const itemSlugMap = new Map<string, CurriculumItem>();
  for (let i = 0; i < PRIME_CORE_SEED_ITEMS.length; i++) {
    const item = PRIME_CORE_SEED_ITEMS[i];
    itemSlugMap.set(item.slug, seedItems[i]);
  }

  for (const dep of PRIME_CORE_SEED_DEPENDENCIES) {
    const prereq = itemSlugMap.get(dep.prerequisiteSlug);
    const dependent = itemSlugMap.get(dep.dependentSlug);

    if (!prereq) {
      console.error(`Dependency error: Prerequisite slug "${dep.prerequisiteSlug}" not in curriculum!`);
      hasErrors = true;
      continue;
    }
    if (!dependent) {
      console.error(`Dependency error: Dependent slug "${dep.dependentSlug}" not in curriculum!`);
      hasErrors = true;
      continue;
    }

    seedDeps.push({
      curriculumId: "prime-core-dsa",
      prerequisiteItemId: prereq.id,
      dependentItemId: dependent.id,
      dependencyType: dep.dependencyType,
    });
  }

  const dagResult = validateCurriculumDAG(seedItems, seedDeps);
  if (!dagResult.isValid) {
    console.error("DAG Validation Failed!");
    for (const err of dagResult.errors) {
      console.error(` - ${err}`);
    }
    hasErrors = true;
  } else {
    console.log(`DAG Validation Passed: ${seedDeps.length} acyclic dependency edges verified.`);
  }

  if (hasErrors) {
    console.error("\n❌ Validation encountered errors.");
    return false;
  }

  console.log(`\n✅ All ${PRIME_CORE_SEED_ITEMS.length} items and 16 stages are 100% valid!`);
  return true;
}

// ----------------------------------------------------------------------------
// 3. REPORT
// ----------------------------------------------------------------------------
async function runReport() {
  console.log("Generating PRIME Core documentation and QA report...");
  const catalogCache: Record<string, { id: string; slug: string; title: string; difficulty: string }> =
    JSON.parse(fs.readFileSync("data/prime-core/catalog-cache.json", "utf8"));

  const difficultyCounts: Record<string, number> = { EASY: 0, MEDIUM: 0, HARD: 0 };
  const stageItemsMap = new Map<string, typeof PRIME_CORE_SEED_ITEMS>();

  for (const item of PRIME_CORE_SEED_ITEMS) {
    const prob = catalogCache[item.slug.toLowerCase()];
    if (prob) {
      difficultyCounts[prob.difficulty.toUpperCase()] =
        (difficultyCounts[prob.difficulty.toUpperCase()] || 0) + 1;
    }

    const list = stageItemsMap.get(item.stageSlug) ?? [];
    list.push(item);
    stageItemsMap.set(item.stageSlug, list);
  }

  const total = PRIME_CORE_SEED_ITEMS.length;

  let report = `# PRIME Core DSA Curriculum V1 — QA & Distribution Report\n\n`;
  report += `Generated at: ${new Date().toISOString()}\n\n`;
  report += `## Summary Overview\n\n`;
  report += `- **Total Curated Problems**: ${total}\n`;
  report += `- **Curriculum Version**: 2026.1\n`;
  report += `- **Total Stages**: ${CANONICAL_STAGES.length}\n`;
  report += `- **Prerequisite Edges (DAG)**: ${PRIME_CORE_SEED_DEPENDENCIES.length}\n\n`;

  report += `## Difficulty Distribution\n\n`;
  report += `| Difficulty | Count | Percentage |\n`;
  report += `| :--- | :--- | :--- |\n`;
  for (const [diff, count] of Object.entries(difficultyCounts)) {
    const pct = ((count / total) * 100).toFixed(1);
    report += `| **${diff}** | ${count} | ${pct}% |\n`;
  }
  report += `\n*Note: Targets balanced interview prep: Easy 20-30%, Medium 60-70%, Hard 5-15%.*\n\n`;

  report += `## Stage Breakdown\n\n`;
  report += `| # | Stage Name | Slug | Problems | Est. Minutes |\n`;
  report += `| :--- | :--- | :--- | :--- | :--- |\n`;

  let totalMinutes = 0;
  for (const stage of CANONICAL_STAGES) {
    const items = stageItemsMap.get(stage.slug) ?? [];
    const stageMinutes = items.reduce((acc, i) => acc + i.recommendedMinutes, 0);
    totalMinutes += stageMinutes;
    report += `| ${String(stage.sequence).padStart(2, "0")} | **${stage.name}** | \`${stage.slug}\` | ${items.length} | ${stageMinutes}m |\n`;
  }
  report += `| **Total** | | | **${total}** | **${totalMinutes}m (~${Math.round(totalMinutes / 60)}h)** |\n\n`;

  report += `## Complete Ordered Curriculum\n\n`;
  for (const stage of CANONICAL_STAGES) {
    const items = stageItemsMap.get(stage.slug) ?? [];
    report += `### Stage ${String(stage.sequence).padStart(2, "0")}: ${stage.name}\n\n`;
    report += `*${stage.description}*\n\n`;
    report += `| Seq | Problem Title | Difficulty | Priority | Target | Reason |\n`;
    report += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;

    for (const item of items) {
      const prob = catalogCache[item.slug.toLowerCase()];
      report += `| ${String(item.sequence).padStart(3, "0")} | [${prob?.title || item.slug}](https://leetcode.com/problems/${item.slug}) | \`${prob?.difficulty.toUpperCase()}\` | \`${item.priority}\` | ${item.recommendedMinutes}m | ${item.selectionReason} |\n`;
    }
    report += `\n`;
  }

  const reportsDir = path.resolve("docs/generated");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const reportPath = path.join(reportsDir, "prime-core-v1-report.md");
  fs.writeFileSync(reportPath, report, "utf8");
  console.log(`Saved QA report to ${reportPath}`);
}

// ----------------------------------------------------------------------------
// 4. APPLY
// ----------------------------------------------------------------------------
async function runApply(isDryRun: boolean) {
  console.log(`Applying PRIME Core Curriculum to database (Dry Run: ${isDryRun})...`);
  const isValid = await runValidate();
  if (!isValid) {
    throw new Error("Validation failed! Cannot apply invalid curriculum.");
  }

  const catalogCache: Record<string, { id: string; slug: string; title: string; difficulty: string }> =
    JSON.parse(fs.readFileSync("data/prime-core/catalog-cache.json", "utf8"));

  // Generate atomic idempotent SQL
  const sqlParts: string[] = [
    "BEGIN;",
    "SET LOCAL statement_timeout = '180s';",
    "SELECT pg_advisory_xact_lock(170732, 1);",
  ];

  // 1. Curriculum
  sqlParts.push(`
INSERT INTO public.curricula (id, slug, name, description, version, status, estimated_problem_count, updated_at)
VALUES (
  '11111111-1111-4111-a111-111111111111',
  'prime-core-dsa',
  'PRIME Core DSA',
  'Curated 189-problem technical interview curriculum covering foundational patterns, algorithmic structures, and interview mastery.',
  '2026.1',
  'published',
  ${PRIME_CORE_SEED_ITEMS.length},
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  version = EXCLUDED.version,
  status = EXCLUDED.status,
  estimated_problem_count = EXCLUDED.estimated_problem_count,
  updated_at = NOW();
`);

  // 2. Stages
  const stageItemsMap = new Map<string, typeof PRIME_CORE_SEED_ITEMS>();
  for (const item of PRIME_CORE_SEED_ITEMS) {
    const list = stageItemsMap.get(item.stageSlug) ?? [];
    list.push(item);
    stageItemsMap.set(item.stageSlug, list);
  }

  for (const stage of CANONICAL_STAGES) {
    const items = stageItemsMap.get(stage.slug) ?? [];
    const totalMinutes = items.reduce((acc, i) => acc + i.recommendedMinutes, 0);

    sqlParts.push(`
INSERT INTO public.curriculum_stages (curriculum_id, slug, name, description, sequence, estimated_problem_count, estimated_minutes, updated_at)
SELECT
  c.id,
  ${literal(stage.slug)},
  ${literal(stage.name)},
  ${literal(stage.description)},
  ${stage.sequence},
  ${items.length},
  ${totalMinutes},
  NOW()
FROM public.curricula c WHERE c.slug = 'prime-core-dsa'
ON CONFLICT (curriculum_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sequence = EXCLUDED.sequence,
  estimated_problem_count = EXCLUDED.estimated_problem_count,
  estimated_minutes = EXCLUDED.estimated_minutes,
  updated_at = NOW();
`);
  }

  // 3. Curriculum Items
  for (const item of PRIME_CORE_SEED_ITEMS) {
    const prob = catalogCache[item.slug.toLowerCase()];
    if (!prob) continue;

    sqlParts.push(`
INSERT INTO public.curriculum_items (curriculum_id, stage_id, problem_id, sequence, priority, recommended_minutes, is_required, is_checkpoint, selection_reason, updated_at)
SELECT
  c.id,
  s.id,
  p.id,
  ${item.sequence},
  ${literal(item.priority)},
  ${item.recommendedMinutes},
  ${item.isRequired},
  ${item.isCheckpoint},
  ${literal(item.selectionReason)},
  NOW()
FROM public.curricula c
JOIN public.curriculum_stages s ON s.curriculum_id = c.id AND s.slug = ${literal(item.stageSlug)}
JOIN public.problems p ON p.id = ${literal(prob.id)}
WHERE c.slug = 'prime-core-dsa'
ON CONFLICT (curriculum_id, problem_id) DO UPDATE SET
  stage_id = EXCLUDED.stage_id,
  sequence = EXCLUDED.sequence,
  priority = EXCLUDED.priority,
  recommended_minutes = EXCLUDED.recommended_minutes,
  is_required = EXCLUDED.is_required,
  is_checkpoint = EXCLUDED.is_checkpoint,
  selection_reason = EXCLUDED.selection_reason,
  updated_at = NOW();
`);
  }

  // 4. Dependencies
  for (const dep of PRIME_CORE_SEED_DEPENDENCIES) {
    const prereqProb = catalogCache[dep.prerequisiteSlug.toLowerCase()];
    const depProb = catalogCache[dep.dependentSlug.toLowerCase()];
    if (!prereqProb || !depProb) continue;

    sqlParts.push(`
INSERT INTO public.curriculum_dependencies (curriculum_id, prerequisite_item_id, dependent_item_id, dependency_type)
SELECT
  c.id,
  prereq.id,
  dependent.id,
  ${literal(dep.dependencyType)}
FROM public.curricula c
JOIN public.curriculum_items prereq ON prereq.curriculum_id = c.id AND prereq.problem_id = ${literal(prereqProb.id)}
JOIN public.curriculum_items dependent ON dependent.curriculum_id = c.id AND dependent.problem_id = ${literal(depProb.id)}
WHERE c.slug = 'prime-core-dsa'
ON CONFLICT (curriculum_id, prerequisite_item_id, dependent_item_id) DO UPDATE SET
  dependency_type = EXCLUDED.dependency_type;
`);
  }

  sqlParts.push("COMMIT;");
  sqlParts.push("SELECT count(*) as count FROM public.curriculum_items WHERE curriculum_id = (SELECT id FROM public.curricula WHERE slug = 'prime-core-dsa');");

  const fullSql = sqlParts.join("\n");
  console.log(`Generated ${sqlParts.length} SQL statements (${fullSql.length} bytes).`);

  if (!isDryRun) {
    console.log("Executing transaction on linked Supabase database...");
    const result = await runLinkedQuery(fullSql);
    console.log("\nTransaction execution result:", result);
    console.log(`\n🎉 Successfully applied PRIME Core Curriculum to remote database!`);
  } else {
    console.log("\n[DRY RUN] Finished verification without applying database changes.");
  }
}

// ----------------------------------------------------------------------------
// CLI DISPATCHER
// ----------------------------------------------------------------------------
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "validate";
  const isDryRun = args.includes("--dry-run");

  switch (command) {
    case "analyze":
      await runAnalyze();
      break;
    case "validate":
      await runValidate();
      break;
    case "report":
      await runReport();
      break;
    case "apply":
      await runApply(isDryRun);
      break;
    default:
      console.log(`Usage: tsx scripts/prime-core/cli.ts <analyze|validate|report|apply> [--dry-run]`);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
