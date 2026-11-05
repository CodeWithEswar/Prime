# DSA Content DB V1

PRIME has one canonical catalog: `public.problems`. This phase extends the existing foundation instead of creating a second `dsa_problems` table. `problems.slug` is the canonical PRIME slug, while `leetcode_slug`, the normalized external URL, and `dsa_problem_identities` supply stronger provider identities. Existing UUIDs are retained, including those referenced by attempts, revision, and daily tasks.

## Relationships

| Entity                                            | Purpose                                                                                        |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `problems`                                        | Canonical title, difficulty, external reference, primary topic, estimated time, PRIME priority |
| `roadmap_topics`, `problem_topics`                | Existing shared taxonomy and multiple topics per problem                                       |
| `content_sources`                                 | Source revision, license status, attribution, and approval evidence                            |
| `dsa_problem_identities`                          | Unique provider/URL/provider-ID identities attached to one problem                             |
| `dsa_problem_sources`                             | Original record ID/title/URL, revision, and selected source-specific metadata                  |
| `dsa_problem_aliases`                             | Searchable alternative names justified by a strong identity or explicit review                 |
| `problem_collections`, `problem_collection_items` | Sheets and future curricula, with optional source order/section                                |
| `companies`, `company_problem_stats`              | Company/problem/window/source relationships and source-specific frequency                      |
| `dsa_import_runs`                                 | Privileged import history and the staged snapshot hash                                         |

The catalog contains no problem statements, solutions, copied explanations, or personal status. `user_problem_progress` and `problem_attempts` remain the existing user-owned tables. This phase does not change their mastery scale, outcomes, or ownership policies and does not implement any mastery calculation.

PRIME Core is a future curated collection of approximately 150–200 problems, separate from the larger catalog. No artificial curriculum was populated from the entire external dataset. Sheet membership is represented by collections rather than another pair of specialized sheet tables. A consolidated sheet flag does not establish original lesson order, so its collection position stays null.

## Canonical resolution

Identity precedence is exact LeetCode slug, normalized external URL, and a source-provided stable provider ID. Reviewed cross-provider merges/aliases live in `scripts/dsa/config/overrides.json`. Distinct LeetCode identities cannot be merged by a title alias. Matching normalized titles and token similarity generate review candidates only. The upstream `raw_variations` field is retained as provenance, never accepted wholesale as aliases.

Within a verified identity, provider-native sources take precedence, then stable source/record ordering; explicit canonical overrides take priority. Difficulty disagreements remain in the report and original values remain in provenance. Missing difficulty is `unknown`. No provider-native title/difficulty is claimed when that authority is not available.

The database enforces canonical slug, provider identity, normalized external URL, collection membership, topic membership, and company/window/source uniqueness. The primary topic must also be a problem topic. Existing problem IDs are resolved from actual database identities before foreign keys are written; an existing collision stops the import rather than reassigning user data. PRIME priority, estimated time, and manual deactivation survive subsequent imports.

## Migration and access

`20261031180951_dsa_content_catalog_v1.sql` follows the foundation migration and creates seven tables: sources, identities, provenance, aliases, collections, collection items, and import history. It extends existing problem/company tables and adds the missing DSA taxonomy entries without replacing IDs or dependency edges.

Existing catalog tables retain public read behavior and explicitly lose user write privileges. New provenance/collection tables are readable by authenticated users, with RLS enabled; import history has no public read policy. Only a privileged offline database connection writes catalog data. Personal rows remain protected by the foundation's ownership policies. The importer has a closed table allowlist excluding all personal tables.

## Current result

The 2026-11-02 [practice-link audit](dsa-link-audit.md) found generated upstream LeetCode placeholders. It restored 206 original platform links and withheld 951 unsupported links pending review. All 4,411 question records were retained. This supersedes any implication below that URL-format validation verified every external destination.

On 2026-11-01 the user directed a factual-metadata import. The live Supabase database now contains **4,411 canonical question records, six sheet collections, 420 companies, and 35,129 company/window relationships**, backed by 39,765 source records. The original six question IDs were reused. No problem statements, solutions, or personal progress were imported.

The importer scanned 41,156 source rows, quarantined 1,391 tutorial or Database/Pandas records outside DSA scope, and merged 35,354 exact duplicate rows. No fuzzy candidates were automatically merged. There are 311 review candidates and 58 questions awaiting primary-topic classification. The live database has zero duplicate LeetCode identities. Both source license fields remain null; the separate user-directed metadata basis is recorded in provenance.

The linked transport privately staged 101,265 rows, then published and verified the entire catalog in one transaction. Its audit reports 101,222 inserted rows, eight updated rows, and 35 unchanged rows across all catalog tables. Temporary staging tables were removed. Attempts and personal progress remained at their pre-import count of zero.

The isolated fixture has seven inputs, three canonical problems, three exact duplicate rows, one reviewed alias merge, two collections, one company, and two company/window relationships. Its remaining title match is deliberately kept as a review candidate. These numbers describe synthetic tests, not a shipped catalog.

Practice, roadmap, company, search, and admin UI; planner integration; curriculum selection; revision behavior; and mastery algorithms remain deferred.

## Verification record

- Project lint, DSA-specific lint, type checking, formatting, and whitespace checks passed.
- Full suite: 144 tests passed across 14 files. The focused DSA suite contains 32 passing tests, including real PostgreSQL constraint, rollback, idempotency, alias search, curation preservation, private staging, explicit metadata authorization, and RLS checks.
- Source fetch, normalization, validation, linked database dry run, atomic publication, and live verification completed. Snapshot: `531318f84ad0714ab6f1a5de7d2c353252522d57d1d975004741a1a60e73124a`.
- Fixture dry run and strict validation passed. No fixture can be written remotely through the CLI.
- Production build was attempted and failed at the existing Turbopack CSS worker startup error in `components/auth/auth.css`; no successful production build is claimed.
