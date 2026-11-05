import { loadEnvFile } from "node:process";
import { access } from "node:fs/promises";
import { z } from "zod";
import postgres from "postgres";
import { syncLinked } from "./linked";
import { fatalIssues } from "./catalog";
import {
  readSources,
  fetchSources,
  generateCatalog,
  saveReports,
  loadStagedCatalog,
} from "./pipeline";
import {
  applyCatalog,
  planImport,
  verifyCatalog,
  type Connection,
  type Database,
} from "./database";

const args = process.argv.slice(2),
  command = args[0] ?? "sync",
  fixture = args.includes("--fixtures"),
  dry = args.includes("--dry-run");
async function main() {
  if (
    args
      .slice(1)
      .some((a) => !["--fixtures", "--dry-run", "--linked", "--staged"].includes(a))
  )
    throw new Error("Unknown DSA option");
  if (
    !["fetch", "normalize", "validate", "report", "sync", "import", "verify"].includes(
      command
    )
  )
    throw new Error("Unknown DSA command");
  if (command === "fetch") {
    if (fixture) throw new Error("Fixtures require no fetching");
    console.log(JSON.stringify(await fetchSources(await readSources()), null, 2));
    return;
  }
  if (fixture && args.includes("--staged"))
    throw new Error("Fixtures cannot load a production snapshot");
  const catalog = args.includes("--staged")
      ? await loadStagedCatalog()
      : await generateCatalog(fixture),
    output = await saveReports(catalog);
  console.log(
    JSON.stringify(
      {
        ...catalog.report,
        issues: catalog.report.issues.length,
        review: catalog.report.review.length,
        duplicates: catalog.report.duplicates.length,
        output,
        mode: catalog.mode,
      },
      null,
      2
    )
  );
  if (command === "normalize" || command === "report") return;
  if (
    catalog.report.blockedSources.length ||
    catalog.report.invalidRows ||
    fatalIssues(catalog.report.issues).length
  ) {
    if (dry) return;
    throw new Error(
      "Catalog is not eligible for import. Review source permissions and quality reports."
    );
  }
  if (
    command === "validate" ||
    ((command === "sync" || command === "import") && dry && !args.includes("--linked"))
  )
    return;
  if (fixture)
    throw new Error(
      "CLI fixture writes are disabled. Use the isolated database integration tests."
    );
  if (args.includes("--linked")) {
    const result = await syncLinked(catalog, {
      dryRun: dry,
      verifyOnly: command === "verify",
    });
    if (result.verified && command !== "verify") {
      catalog.report.rowsImported = result.plan.inserted;
      catalog.report.rowsUpdated = result.plan.updated;
      catalog.report.rowsUnchanged = result.plan.unchanged;
      await saveReports(catalog);
    }
    return;
  }
  // No application env module is imported; this secret stays inside an offline Node process.
  try {
    await access(".env.local");
    loadEnvFile(".env.local");
  } catch {
    /* An explicit process environment is also supported. */
  }
  const connectionString = z.string().url().parse(process.env.PRIME_DSA_DATABASE_URL);
  const target = new URL(connectionString);
  if (!["postgres:", "postgresql:"].includes(target.protocol))
    throw new Error("Expected a Postgres database URL");
  const remote = !["localhost", "127.0.0.1", "[::1]"].includes(target.hostname);
  if (remote && process.env.PRIME_DSA_EXPECTED_HOST !== target.hostname)
    throw new Error("Remote database host must match PRIME_DSA_EXPECTED_HOST");
  const sql = postgres(connectionString, {
    max: 1,
    prepare: false,
    connect_timeout: 10,
    ssl: remote ? "require" : false,
  });
  const connection = (runner: typeof sql): Connection => ({
    query: async <T extends Record<string, unknown>>(
      query: string,
      params?: unknown[]
    ) => ({
      rows: [
        ...(await runner.unsafe(query, (params as never[]) ?? [])),
      ] as unknown as T[],
    }),
  });
  const db: Database = {
    ...connection(sql),
    transaction: async (run) =>
      sql.begin(async (tx) => run(connection(tx as unknown as typeof sql))) as Promise<
        Awaited<ReturnType<typeof run>>
      >,
  };
  try {
    if (command === "verify") {
      console.log(JSON.stringify(await verifyCatalog(db, catalog)));
      return;
    }
    const plan = await planImport(db, catalog);
    console.log(JSON.stringify({ plan }));
    const result = await applyCatalog(db, catalog);
    catalog.report.rowsImported = result.inserted;
    catalog.report.rowsUpdated = result.updated;
    catalog.report.rowsUnchanged = result.unchanged;
    await verifyCatalog(db, catalog);
    await saveReports(catalog);
    console.log(JSON.stringify({ verified: true, ...result }));
  } finally {
    await sql.end();
  }
}
void main().catch(() => {
  console.error(
    "DSA command stopped. Check source permissions, staged quality reports, and the explicit database configuration. No credentials are logged."
  );
  process.exitCode = 1;
});
