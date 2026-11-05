# PRIME — DSA Catalog Data Quality & Deduplication Audit

## Executive Summary

PRIME maintains a high-density canonical DSA catalog of **4,411 problems** indexed across 25 roadmap topics, 6 curated industry collections (Striver A2Z, Love Babbar 450, AlgoPrep 151, Fraz, Shradha, Siddharth Singh), and company frequency distributions.

This report documents the structural findings from a non-destructive audit of the imported catalog, specifically identifying near-duplicate problem titles, import artifacts, and recommended reconciliation paths that preserve canonical ID stability and existing user attempt records.

---

## 1. Catalog Architecture & Ingestion Origins

The 4,411 problems in Supabase originate from two distinct pipelines:
1. **Canonical LeetCode Corpus**: Ingested with standardized slugs (e.g. `01-matrix`), acceptance rates, and external URLs pointing directly to practice endpoints.
2. **Curated Sheet Ingestion**: Ingested from external educator sheets (Striver A2Z, Love Babbar 450, AlgoPrep 151, Siddharth Singh). Authors in these sheets frequently:
   - Added lecture/video indices to titles (e.g. `(Dp – 19)`).
   - Omitted or spaced numeric titles (e.g. `0 1 Matrix` instead of `01 Matrix`).
   - Included directional algorithmic hints in problem names (e.g. `0 Or 1 Matrix (Bfs Problem)`).

---

## 2. Identified Near-Duplicate Clusters

### Cluster A: The "01 Matrix" Family

| Problem ID | Slug | Title | External URL | Collections | Topic |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `1d3c8568-4d9a-5f73-993a-ba849792ecb3` | `01-matrix` | `01 Matrix` | `https://leetcode.com/problems/01-matrix` | *(Canonical Corpus)* | Arrays / Graphs |
| `62fbfd2e-1e91-5e1f-849f-7511e8d76c6f` | `0-1-matrix` | `0 1 Matrix` | `null` | AlgoPrep 151, Siddharth Singh | Graphs |
| `0e2f5ac4-...` | `o-or-1-matrix-bfs-problem` | `0 Or 1 Matrix (Bfs Problem)` | `null` | *(Curated Sheet)* | Graphs |

**Root Cause**: The string `"01 Matrix"` was tokenized as `"0 1 Matrix"` by the Google Sheets importer when parsing whitespace.
**Recommendation**:
- Mark `1d3c8568-4d9a-5f73-993a-ba849792ecb3` (`01-matrix`) as the **Canonical Primary**.
- Merge the collection membership (`AlgoPrep 151`, `Siddharth Singh`) onto the canonical primary record.
- Non-destructively redirect `0-1-matrix` via a `canonical_problem_id` foreign key rather than hard-deleting the row, protecting foreign keys in `user_problem_progress` and `problem_attempts`.

---

### Cluster B: The "0/1 Knapsack" Family

| Problem ID | Slug | Title | External URL | Collections | Topic |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `9b61758d-d7b3-5a6d-98cb-85c7c57422d5` | `0-1-knapsack-dp-19` | `0 1 Knapsack (Dp – 19)` | `null` | Striver A2Z | Dynamic Programming |
| `...` | `0-1-knapsack-problem` | `0/1 Knapsack Problem` | `https://...` | AlgoPrep 151, Love Babbar 450 | Dynamic Programming |

**Root Cause**: Striver's A2Z sheet explicitly appends video episode markers such as `(Dp – 19)` or `(Lec 35)` to track tutorial progression.
**Recommendation**:
- Strip trailing video annotations matching `/\s*\((dp|lec|video|episode)\s*[-–]\s*\d+\)/i` during catalog normalization.
- Map Striver's collection link to the canonical `0/1 Knapsack Problem` entry.

---

### Cluster C: Typographical and Quotation Artifacts

| Raw Title | Cleaned Presentation | Source Artifact |
| :--- | :--- | :--- |
| `“K” Largest Element In An Array` | `Kth Largest Element In An Array` | Curved Unicode quotes `“ ”` in spreadsheet cell. |
| `Two Sum II - Input Array Is Sorted` | Standardized hyphenation | Mixing en-dash `–`, em-dash `—`, and hyphen `-`. |

**Recommendation**:
- In the frontend presentation layer, apply non-destructive typographic cleanup (`normalizeProblemTitle(title)`) to strip curved quotes and normalize spacing without altering canonical slugs.

---

## 3. Safe Deduplication Strategy & Protocol

To eliminate duplication without risking user data loss or broken foreign keys:

1. **Schema Extension (`canonical_problem_id`)**:
   Add an optional `canonical_problem_id UUID REFERENCES problems(id)` column to `problems`.
   - Primary problems have `canonical_problem_id IS NULL`.
   - Secondary alias problems point to their canonical primary.

2. **Collection Item Migration**:
   Update `problem_collection_items` to associate directly with the canonical primary:
   ```sql
   INSERT INTO problem_collection_items (collection_id, problem_id)
   SELECT pci.collection_id, p.canonical_problem_id
   FROM problem_collection_items pci
   JOIN problems p ON p.id = pci.problem_id
   WHERE p.canonical_problem_id IS NOT NULL
   ON CONFLICT DO NOTHING;
   ```

3. **User Progress Rollup**:
   If a user solved an alias problem, a safe view or trigger maps `user_problem_progress` to the canonical problem ID.

4. **Frontend Query Optimization**:
   The catalog query filters `WHERE is_active = true AND canonical_problem_id IS NULL`, eliminating visual duplicate rows while leaving legacy URLs functional.

---

## 4. Immediate Display Safeguards Implemented

1. **Topic & Collection Counts**: Accurate counts are aggregated dynamically via Supabase relational count queries, ensuring the rail always displays live numbers.
2. **External Link Fallback**: When an imported problem lacks an `external_url` (due to sheet origin), the row displays an accessible `Pending` status instead of broken or fake URLs, keeping the problem fully actionable via PRIME's internal workspace drawer.
3. **Multi-Collection Context**: Problem rows display the actual collection name (e.g. `Striver A2Z`, `Love Babbar 450`) rather than ambiguous "1 set" or "2 sets" strings.

