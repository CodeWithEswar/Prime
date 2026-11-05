# Content provenance and source review

Review date: 2026-10-31. Public availability is not treated as redistribution permission. No coding-provider problem statements, solution code, or explanations were copied.

Import update, 2026-11-01: the user explicitly instructed “no problem import them” after receiving the source review. The manifests record this as `user_directed_factual_metadata`, scoped to factual metadata only. License fields remain null and no upstream license grant is asserted.

| Source                                                                                                                                      | Revision / evidence                                                          | Decision                                       | Imported                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------- |
| [BooleanStack DSA Sheets](https://github.com/orkait-abhay/dsa-sheets/tree/dc5b55cb3ca0c611b0b0dcc14d0f896466b918e4)                         | No LICENSE, COPYING, NOTICE, or README reuse grant found                     | `metadata_only`, user-directed                 | Contributes to the shared canonical catalog |
| [LeetCode company-wise problems](https://github.com/liquidslr/leetcode-company-wise-problems/tree/2b71796266751b4736a7ef180efb6847879166ee) | No LICENSE, COPYING, NOTICE, or Readme.md reuse grant found                  | `metadata_only`, user-directed                 | Explicit company/window metadata            |
| [Striver A2Z reference](https://takeuforward.org/prep-hub/strivers-a2z-dsa-sheet)                                                           | Official roadmap page inspected for context                                  | Reference only; no copying permission inferred | Nothing scraped/imported                    |
| LeetCode / GFG / TUF / Coding Ninjas provider URLs                                                                                          | External practice destinations, not local problem content                    | URL references only                            | No full statements or solutions             |
| PRIME test fixtures                                                                                                                         | Small synthetic inputs authored for this importer, explicitly marked CC0-1.0 | Test-only metadata                             | Disposable test database only               |

The source manifest at `scripts/dsa/config/sources.json` holds the exact commit revisions, export blob hashes, review status, check date, and review evidence. Approvals must be explicit and recorded in version control. The BooleanStack company export is derived from the company repository: using the derivative does not resolve upstream rights.

## Inspection findings

Read-only inspection confirmed 1,552 records in the pinned BooleanStack DSA export and 3,257 records in its company export. These are observed upstream row counts, not a certified PRIME canonical problem count or an imported dataset. A URL-pattern audit found 1,550 distinct explicit LeetCode identities in the DSA export. The remaining references and all semantic merges require validation before a permitted production import.

The pinned company repository contains 2,350 CSV files across 470 company directory names. This differs from the consolidated repository's historical description of 471 companies and 4,700 scanned files; those historical claims are not used as ingestion assertions. Approved factual fields were imported after the user's directive, with 420 companies remaining after DSA scope filtering.

One upstream consolidated record puts a sum-equals-K variation under a maximum-subarray identity. This may conflate different tasks. Its variation list must not become a reviewed alias map. Other source topic labels represent difficulty or sheet prose rather than DSA concepts. These findings are reasons for explicit validation, not proof that the entire upstream consolidation is correct.

The company CSV's acceptance-rate sample has an uncertain scale, so no fraction/percentage conversion was inferred. Consolidated company/timeframe prose is retained only as source-specific reference metadata when approved, never promoted into invented numeric frequency.

## Current import result

The verified live import scanned 41,156 records from two pinned sources. It quarantined 1,391 non-DSA/tutorial references and resolved 39,765 accepted source records into 4,411 canonical questions, with six collections and 35,129 company/window relationships. Exact identities merged 35,354 duplicate rows; 311 title-similarity candidates remain separate for review. No raw third-party dataset is committed, and this record does not claim an upstream redistribution license.

The fixture dry run processes seven inputs into three canonical identities: three exact duplicate rows merge by strong identity and one cross-provider pair merges through an explicit test-only alias. Two collections, one company, and two company/window relationships remain normalized links. One same-title/different-URL pair remains separate for review.

## Remote changes and deferred work

The metadata-authorization migration was applied to the linked project, followed by a privately staged atomic catalog import. All staged catalog fields passed database verification before commit. The original starter IDs were retained; attempts and progress stayed at zero; no private staging tables remain. Existing foundation seed data was not presented as new independent source records. The import ledger stores the snapshot hash, source revisions, write counts, and verified result.

No Practice, Company, Roadmap, Search, or admin UI was built. Core curriculum selection, planning, revision, mastery, and readiness algorithms remain separate future work.

Implementation references: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Supabase roles](https://supabase.com/docs/guides/database/postgres/roles), [Supabase database functions](https://supabase.com/docs/guides/database/functions), [PGlite](https://pglite.dev/docs/).
