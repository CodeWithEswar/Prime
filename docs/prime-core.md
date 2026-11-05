# PRIME Core DSA Curriculum Engine

## 1. Executive Architecture

PRIME Core transforms the raw searchable library of 4,400+ canonical DSA problems into an intentionally curated, pedagogically sequenced interview curriculum of approximately 180 high-value problems.

```text
Canonical DSA Catalog (4,000+ Problems)
                  │
                  ▼
          Problem Intelligence
  (Topics, Difficulties, Collections, Companies, Frequencies)
                  │
                  ▼
              PRIME CORE
       (~180 Curated Problems)
                  │
                  ▼
            DSA Roadmap
                  │
                  ▼
          90-Day Planner
                  │
                  ▼
                Today
```

## 2. Reusable Generic Data Model

The schema supports multiple curricula (e.g. PRIME Core DSA, Amazon Focused Prep, 30-Day Sprint) without duplicating problem entities:

- `curricula`: Defines the curriculum metadata (`slug = 'prime-core-dsa'`, `version = '2026.1'`, `status = 'published'`).
- `curriculum_stages`: 16 canonical stages defining the learning progression.
- `curriculum_items`: References canonical `problems(id)` with sequence, priority (P0/P1/P2), target minutes, and selection reason.
- `curriculum_dependencies`: Explicit prerequisite DAG edges enforced acyclic via automated topological sort.

## 3. The 16 Canonical Learning Stages

1. **Foundations**: Array traversal, invariants, basic complexity, simple frequency counting.
2. **Arrays & Hashing**: Frequency maps, set lookups, duplicate detection, Two-Sum hash matching.
3. **Strings & Pattern Recognition**: Character frequency, palindromes, anagram verification.
4. **Two Pointers & Sliding Window**: Opposite/same direction pointers, fixed/variable windows.
5. **Prefix Sum & Intervals**: Cumulative lookups, subarray difference arrays, interval merging.
6. **Binary Search**: Logarithmic search, search in rotated arrays, binary search on answer spaces.
7. **Linked Lists**: Pointer manipulation, in-place reversal, cycle detection, sorted list merging.
8. **Stacks & Queues**: LIFO evaluation, parentheses matching, monotonic stacks, deque windowing.
9. **Recursion & Backtracking**: Decision trees, state rollbacks, subsets, permutations, combinations.
10. **Trees & BST**: DFS/BFS traversal, tree depth, diameter, LCA, and BST validation.
11. **Heaps & Priority Queues**: Top-K elements, streaming Kth largest, multi-stream merging, running medians.
12. **Graphs**: Adjacency lists, BFS/DFS, connected components, grid graphs, topological sorting, Dijkstra, Union-Find.
13. **Greedy Algorithms**: Activity selection, jump reachability, greedy sorting decisions.
14. **Dynamic Programming**: 1D recurrence, House Robber, 2D Grid paths, 0/1 Knapsack, LCS, LIS.
15. **Bit Manipulation & Math**: XOR cancellation, bitmasking, power-of-two tests, set-bit counting.
16. **Mixed Interview Patterns**: Complex multi-technique synthesis and unprompted pattern recognition.

## 4. Selection Signals & Formula

Candidate ranking uses an explainable weighted scoring formula:

$$\text{CoreScore} = 0.30 \times \text{Importance} + 0.20 \times \text{Consensus} + 0.15 \times \text{Breadth} + 0.10 \times \text{Frequency} + 0.15 \times \text{PatternValue} + 0.10 \times \text{PrereqValue}$$

## 5. Integration with User Progress & Revision

- **Progress Independence**: Curriculum definitions remain strictly global. User completion is derived by joining `user_problem_progress` on canonical `problem_id`.
- **Revision Precedence**: Solved problems with due spaced repetition reviews surface `Revision Due` without decrementing solved completion metrics.
- **Deterministic Continue Algorithm**: Always recommends the earliest unsolved required item whose required prerequisites are met.
