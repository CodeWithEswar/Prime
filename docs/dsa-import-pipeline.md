# DSA import pipeline

The importer is an offline TypeScript CLI under `scripts/dsa`. Application requests never fetch GitHub or parse source files. The frontend continues to use Supabase.

## Workflow

```sh
pnpm dsa:fetch
pnpm dsa:sync --dry-run
pnpm dsa:validate
pnpm dsa:report
pnpm dsa:sync
pnpm dsa:verify
```

`dsa:normalize` performs the same staging operation without a write, and `dsa:import` is a synonym for the controlled sync write. `dsa:report` recomputes the current staging report; historical committed import summaries live in `dsa_import_runs`.

On 2026-11-01 the user explicitly directed a factual-metadata import after the source review. Both manifests now record `metadata_only` with `user_directed_factual_metadata` as the approval basis. Upstream license fields remain null; this records the user's scope decision rather than inventing a source license. Problem statements, solution code, and explanations remain excluded.

For the linked Supabase project, the CLI can use its existing authenticated connection without exposing a separate database password:

```sh
pnpm dsa:sync --dry-run
pnpm dsa:validate --staged
pnpm dsa:sync --linked --staged --dry-run
pnpm dsa:sync --linked --staged
```

`--staged` verifies the saved catalog hash, current source manifest, and configuration modification times. The linked transport uploads bounded batches to a private RLS-protected staging table, then publishes and verifies all catalog tables in one transaction. Fingerprints reject any concurrent catalog change after planning. The private staging table is removed on completion or failure. No public RPC or browser secret is added.

For a reproducible local demonstration:

```sh
pnpm dsa:sync --dry-run --fixtures
pnpm dsa:validate --fixtures
pnpm test:dsa
```

Fixtures use a separate output directory and are forbidden from CLI database writes. The integration suite alone imports them into a disposable in-memory PostgreSQL instance.

## Source approval and retrieval

`config/sources.json` records reviewed repository revisions and blob checksums. Approval requires an importable status and a recorded basis: a source license or the explicitly scoped user directive for factual metadata. `metadata_only` requires an approval scoped to metadata. A directive does not imply that the upstream repository has granted a redistribution license; the license fields continue to reflect the actual inspection.

After a source is approved, `dsa:fetch` downloads only the pinned metadata exports. For the company repository it discovers CSVs from the pinned recursive Git tree, rejects an incomplete tree or unfamiliar time window, and caches a revision-specific file index and blob checksums. It does not clone entire repositories or retrieve provider problem pages. Files are checked as bytes before parsing, including UTF-8 BOM handling; paths cannot escape the cache directory.

Caches, normalized tables, reports, and test artifacts are under ignored `.generated/dsa/`. Raw datasets and large generated outputs are not committed. Source revision and source record identity remain in database provenance.

## Parsing and normalization

- BooleanStack DSA JSON contributes canonical references, topic labels, sheet tags, and selected provenance. Hints, editorials, code, and problem statements are not copied.
- BooleanStack company JSON contributes canonical references and original company/timeframe prose as non-authoritative provenance. It lacks per-company numeric frequency; the importer does not manufacture statistics from that prose.
- Company CSVs contribute explicit company/window relationships, original frequency, and original acceptance-rate text. Quoted fields are parsed with `csv-parse` and every normalized row is validated with Zod.
- Topics and reviewed company aliases use version-controlled maps. Ambiguous names such as a suffixed `Amazon+`, unknown windows, and unmatched topics appear in quality diagnostics.
- Unknown difficulty stays unknown. Frequencies retain source semantics; no cross-repository normalization or PRIME priority score is invented. Acceptance rates stay null when their scale is uncertain. The existing foundation column uses percentages; this importer preserves the raw value separately rather than assuming a fraction-to-percent conversion.
- Explicit tutorial/course references and Database/Pandas identities are quarantined outside the DSA catalog. The version-controlled scope rules and each quarantined source record remain in the reports. Clear algorithm tag aliases map into the existing taxonomy; unrecognized tags remain visible for review.

## Reports and conflicts

Each staging run writes `catalog.json`, `report.json`, `duplicate_report.json`, `possible_duplicates.json`, `quality_issues.json`, and `snapshot.json`. Counts cover scanned/valid/invalid rows, canonical problems, exact duplicates, reviewed merges, topics, collections, companies, relationships, unknown mappings, difficulty/source conflicts, URL failures, and actual write outcomes.

Detailed matches distinguish provider/URL identities and approved aliases. Normalized-title/fuzzy candidates never merge automatically. Conflicts, invalid URLs/rows, checksum failures, invalid overrides, and unapproved sources prevent writes. An unknown topic is reported rather than becoming an invented new taxonomy entry.

## Database writes

Apply the reviewed migration through the project's Supabase migration workflow before importing. Supply `PRIME_DSA_DATABASE_URL` to the Node CLI only. For a remote target, `PRIME_DSA_EXPECTED_HOST` must match its hostname exactly and TLS is required. Use a privileged database role that can write the catalog; no service key, URL password, or personal access token is printed or bundled into browser code.

The importer binds existing natural/provider keys to actual UUIDs, obtains a transaction advisory lock, calculates the write plan, and upserts batches of 250 rows inside one transaction. Fatal SQL errors roll back every batch. Database constraints form the final identity boundary. Upserts update only changed values, preserving original creation timestamps and avoiding updated-at churn on reruns.

The safety guard stops an import when more than 20% of a source's already-managed canonical problems disappear or change. There is no CLI force option: inspect the report and use an explicitly reviewed maintenance procedure for a large correction. Unrelated foundation/manual problems are excluded from that removal calculation. Missing source rows do not delete canonical problems, relationships, or personal progress; deactivation remains explicit.

After commit, verification checks that staged catalog fields match the database and writes the actual inserted/updated/unchanged summary. No import is described as verified when this check fails.

## Update procedure

Review the new upstream revision and reuse evidence, update its pinned commit/blob metadata and any reviewed aliases/maps, fetch, stage, validate, inspect conflicts and change sizes, then perform a controlled sync and verify. Do not reuse an unreviewed moving branch or silently approve a source because it is public.

## Verification limits

The database integration tests execute the actual foundation and DSA migrations in PGlite (PostgreSQL compiled to WASM), with test-only Supabase roles and `auth.uid()` context. They exercise actual SQL constraints, transactions, and RLS, not a mocked in-memory repository. They are not a claim of a live Supabase/Auth deployment test. The normal unit suite and targeted DSA suite are separate from the production Next.js build.

The production build still fails at the previously observed Turbopack CSS worker startup handshake (`components/auth/auth.css`). No frontend workaround or unrelated UI changes were introduced in this database phase.
