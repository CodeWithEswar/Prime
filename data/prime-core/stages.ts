export interface StageDefinition {
  slug: string;
  name: string;
  description: string;
  sequence: number;
}

export const CANONICAL_STAGES: StageDefinition[] = [
  {
    slug: "foundations",
    name: "Foundations",
    description:
      "Core array traversal, iteration invariants, basic complexity intuition, and simple frequency counting.",
    sequence: 1,
  },
  {
    slug: "arrays-hashing",
    name: "Arrays & Hashing",
    description:
      "Frequency maps, set lookups, duplicate detection, Two-Sum hash matching, prefix/suffix transforms, and majority reasoning.",
    sequence: 2,
  },
  {
    slug: "strings",
    name: "Strings & Pattern Recognition",
    description:
      "Character frequency arrays, palindrome symmetry, anagram verification, and string transformation fundamentals.",
    sequence: 3,
  },
  {
    slug: "two-pointers-sliding-window",
    name: "Two Pointers & Sliding Window",
    description:
      "Opposite-direction and same-direction pointer strategies, fixed-size windows, and variable-size dynamic boundary expansion.",
    sequence: 4,
  },
  {
    slug: "prefix-sum-intervals",
    name: "Prefix Sum & Intervals",
    description:
      "Cumulative sum lookups, subarray difference arrays, interval sorting, merging, and overlap detection.",
    sequence: 5,
  },
  {
    slug: "binary-search",
    name: "Binary Search",
    description:
      "Logarithmic search boundaries, first/last occurrences, search in rotated sorted arrays, and binary search on answer spaces.",
    sequence: 6,
  },
  {
    slug: "linked-lists",
    name: "Linked Lists",
    description:
      "Pointer manipulation, in-place list reversal, fast/slow pointer cycle detection, sorted list merging, and reordering.",
    sequence: 7,
  },
  {
    slug: "stacks-queues",
    name: "Stacks & Queues",
    description:
      "LIFO evaluation, parentheses validation, monotonic stack next-greater-element, histogram reasoning, and FIFO queue deque structures.",
    sequence: 8,
  },
  {
    slug: "recursion-backtracking",
    name: "Recursion & Backtracking",
    description:
      "Recursive decision trees, state rollbacks, subsets, permutations, combinations, and constrained search spaces.",
    sequence: 9,
  },
  {
    slug: "trees-bst",
    name: "Trees & Binary Search Trees",
    description:
      "Depth-first search, breadth-first level order traversal, tree depth, diameter, Lowest Common Ancestor, and BST order properties.",
    sequence: 10,
  },
  {
    slug: "heaps-priority-queues",
    name: "Heaps & Priority Queues",
    description:
      "Top-K elements, min/max heap balancing, streaming Kth largest, multi-stream sorted list merging, and running medians.",
    sequence: 11,
  },
  {
    slug: "graphs",
    name: "Graphs",
    description:
      "Adjacency lists, BFS/DFS traversal, connected components, 2D grid graphs, cycle detection, topological sorting, Dijkstra, and Union-Find.",
    sequence: 12,
  },
  {
    slug: "greedy",
    name: "Greedy Algorithms",
    description:
      "Locally optimal choice heuristics, activity selection, jump reachability, and sorting-assisted greedy decisions.",
    sequence: 13,
  },
  {
    slug: "dynamic-programming",
    name: "Dynamic Programming",
    description:
      "Optimal substructure, overlapping subproblems, 1D state transitions, 2D grid paths, 0/1 Knapsack, and Longest Common/Increasing Subsequences.",
    sequence: 14,
  },
  {
    slug: "bit-manipulation-math",
    name: "Bit Manipulation & Math",
    description:
      "Bitwise XOR cancellation, bitmasking, power-of-two tests, set-bit counting, and interview-essential arithmetic patterns.",
    sequence: 15,
  },
  {
    slug: "mixed-interview-patterns",
    name: "Mixed Interview Patterns",
    description:
      "Synthesized problems requiring unprompted pattern recognition, multi-technique combination, and end-to-end interview problem solving.",
    sequence: 16,
  },
];

