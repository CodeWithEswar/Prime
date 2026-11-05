# DSA practice-link audit — 2026-11-02

The audit examined all 4,411 live problem records and their 39,765 provenance records. Every problem originally had `source=leetcode` and a LeetCode URL. This was an upstream data problem, not a hardcoded provider in the Practice UI: the UI already used `external_url` from the database.

## Root cause

The pinned [upstream builder](https://github.com/orkait-abhay/dsa-sheets/blob/dc5b55cb3ca0c611b0b0dcc14d0f896466b918e4/build_master_combo_sheet.py) constructs a LeetCode URL from the title when no Fraz URL exists. Lines 409–413 call this a placeholder. The initial importer validated URL syntax but did not distinguish these generated references from sourced practice URLs.

Of 1,159 records supported only by the consolidated DSA sheet, two had actual Fraz hyperlinks and 1,157 were generated placeholders. The remaining 3,252 records had independent company-catalog provenance. Company datasets are intentionally LeetCode based; that does not establish a LeetCode destination for a sheet-only exercise.

## Repair

Original hyperlinks were extracted from the four pinned source spreadsheets. Matching used exact normalized source titles and original variations, not fuzzy title similarity. Tutorial/article links and ambiguous or colliding provider identities were withheld. No distinct problem variants were merged.

- 206 practice URLs were recovered with original file/cell evidence in `scripts/dsa/config/problem-links.json`.
- 951 unsupported generated links were cleared and marked `source=unverified`. Their questions remain active and the UI shows “Pending,” with an accessible “Practice link pending verification” label. They are not classified as confirmed 404s.
- All 4,411 question UUIDs, PRIME slugs, titles, collections, and personal references remain in place. Original imported URLs remain in provenance.
- The live repair changed only catalog link metadata and associated provenance/identity metadata. It did not delete questions, alter RLS, or write attempts or progress.

The resulting provider counts are 3,255 LeetCode, 187 GeeksforGeeks, 12 SPOJ, six other original platforms, and 951 awaiting verification.

The reported `k-largest-element-in-an-array` entry came from `FINAL450.xlsx`, cell B339. Its original destination is [GeeksforGeeks K Largest Elements](https://www.geeksforgeeks.org/problems/k-largest-elements4206/1), which returns the largest **k elements**. It must not be merged into [LeetCode 215](https://leetcode.com/problems/kth-largest-element-in-an-array/), which returns the **kth element**. [Two Sum](https://leetcode.com/problems/two-sum/description/) retains its valid LeetCode destination.

## Verification and limits

HTTP checks of the 206 recovered links returned 193 HTTP 200 responses and 13 automation blocks (403), with no 404/410 responses. A successful HTTP status does not by itself establish statement equivalence or guarantee that a client-rendered provider page remains available. Original-source evidence is retained separately from HTTP health. LeetCode blocked bulk automated API/sitemap access; no claim is made that all 3,255 LeetCode destinations were individually live-validated.

The remaining 951 entries need original-source or provider evidence. The repair deliberately does not invent GFG/LeetCode slugs or treat blocked requests as missing questions. The pending review list and before/after audit artifacts are local under `.generated/dsa/link-audit/`, which is ignored by Git.

## Import protection

The BooleanStack parser records generated-link origin. Catalog normalization withholds unsupported generated URLs unless another source corroborates the same identity. Reviewed hyperlink corrections preserve the raw URL, source file, and cell. Existing source-record identity binds corrected provider links to the original UUID and PRIME route; ambiguous existing identities still stop the import. Changing link rules invalidates an old staged snapshot.

`scripts/dsa/link-repair.ts` generates an atomic, guarded metadata repair: stale snapshots and provider-identity collisions abort the transaction. Unit and PostgreSQL integration tests cover placeholder withholding, corroboration, non-LeetCode restoration, unchanged source evidence, stable IDs/routes, rollback, and unchanged personal records. The repaired catalog still normalizes to 4,411 records with zero invalid rows and zero source conflicts.

An independent post-commit database read confirmed zero changed question IDs/slugs/titles and zero repair-plan mismatches. Attempts and progress both remained at zero. Project lint, DSA lint, type checking, production build, and all 192 tests passed after the repair work.
