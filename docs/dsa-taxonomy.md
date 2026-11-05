# PRIME DSA taxonomy

The catalog reuses `roadmap_topics` with `domain = 'dsa'` and the existing `problem_topics` join table. There is no competing DSA topic table. Existing topic UUIDs and roadmap dependencies are preserved; the established `bst` and `heap` slugs are retained.

The 25 V1 topics are:

Fundamentals; Arrays; Strings; Hashing; Sorting; Two Pointers; Sliding Window; Prefix Sum; Binary Search; Linked Lists; Stacks; Queues; Recursion; Backtracking; Trees; Binary Search Trees; Heaps / Priority Queues; Graphs; Greedy; Dynamic Programming; Bit Manipulation; Tries; Intervals; Math; Matrix.

`scripts/dsa/config/taxonomy.ts` is the explicit mapping reference. Hash Table/HashMap map to Hashing, Binary Tree to Trees, BST to the existing `bst`, Priority Queue to the existing `heap`, and DP to Dynamic Programming. Explicit combined labels expand to multiple topics. Original source tags remain in provenance.

Labels such as “Medium / Hard” and motivational sheet section names are unknown topics, not new records. The source inspection found such labels in the consolidated export, so unknown mappings are visible in reports. BFS/DFS are broad graph labels in V1; finer roadmap placement is future curation.

The primary topic is selected by the stable taxonomy order, unless a reviewed canonical override specifies its topic list. All additional mapped topics remain attached. The database enforces that a non-null primary topic is also in the problem's topic memberships. A missing topic is reported, never replaced with guessed confidence or difficulty.

The foundation's non-DSA domains remain separate and unchanged. A source import cannot bind a DSA topic to an existing slug belonging to another domain.
