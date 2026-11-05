export interface SeedDependency {
  prerequisiteSlug: string;
  dependentSlug: string;
  dependencyType: "required" | "recommended";
}

export const PRIME_CORE_SEED_DEPENDENCIES: SeedDependency[] = [
  // Two Pointers & K-Sum ladder
  {
    prerequisiteSlug: "two-sum",
    dependentSlug: "two-sum-ii-input-array-is-sorted",
    dependencyType: "required",
  },
  {
    prerequisiteSlug: "two-sum-ii-input-array-is-sorted",
    dependentSlug: "3sum",
    dependencyType: "required",
  },
  {
    prerequisiteSlug: "3sum",
    dependentSlug: "3sum-closest",
    dependencyType: "recommended",
  },
  {
    prerequisiteSlug: "3sum",
    dependentSlug: "4sum",
    dependencyType: "recommended",
  },

  // Sliding Window progression
  {
    prerequisiteSlug: "longest-substring-without-repeating-characters",
    dependentSlug: "longest-repeating-character-replacement",
    dependencyType: "recommended",
  },
  {
    prerequisiteSlug: "longest-substring-without-repeating-characters",
    dependentSlug: "minimum-window-substring",
    dependencyType: "required",
  },

  // Prefix Sum progression
  {
    prerequisiteSlug: "range-sum-query-immutable",
    dependentSlug: "range-sum-query-2d-immutable",
    dependencyType: "recommended",
  },
  {
    prerequisiteSlug: "range-sum-query-immutable",
    dependentSlug: "subarray-sum-equals-k",
    dependencyType: "required",
  },

  // Intervals ladder
  {
    prerequisiteSlug: "merge-intervals",
    dependentSlug: "insert-interval",
    dependencyType: "required",
  },
  {
    prerequisiteSlug: "merge-intervals",
    dependentSlug: "non-overlapping-intervals",
    dependencyType: "required",
  },
  {
    prerequisiteSlug: "meeting-rooms",
    dependentSlug: "meeting-rooms-ii",
    dependencyType: "required",
  },

  // Binary Search ladder
  {
    prerequisiteSlug: "binary-search",
    dependentSlug: "search-insert-position",
    dependencyType: "required",
  },
  {
    prerequisiteSlug: "binary-search",
    dependentSlug: "find-first-and-last-position-of-element-in-sorted-array",
    dependencyType: "recommended",
  },
  {
    prerequisiteSlug: "binary-search",
    dependentSlug: "search-a-2d-matrix",
    dependencyType: "recommended",
  },
  {
    prerequisiteSlug: "binary-search",
    dependentSlug: "find-minimum-in-rotated-sorted-array",
    dependencyType: "required",
  },
  {
    prerequisiteSlug: "find-minimum-in-rotated-sorted-array",
    dependentSlug: "search-in-rotated-sorted-array",
    dependencyType: "required",
  },
  {
    prerequisiteSlug: "binary-search",
    dependentSlug: "koko-eating-bananas",
    dependencyType: "required",
  },
  {
    prerequisiteSlug: "koko-eating-bananas",
    dependentSlug: "capacity-to-ship-packages-within-d-days",
    dependencyType: "recommended",
  },
  {
    prerequisiteSlug: "capacity-to-ship-packages-within-d-days",
    dependentSlug: "split-array-largest-sum",
    dependencyType: "recommended",
  },

  // Linked Lists ladder
  {
    prerequisiteSlug: "reverse-linked-list",
    dependentSlug: "reorder-list",
    dependencyType: "required",
  },
  {
    prerequisiteSlug: "reverse-linked-list",
    dependentSlug: "palindrome-linked-list",
    dependencyType: "recommended",
  },
  {
    prerequisiteSlug: "reverse-linked-list",
    dependentSlug: "reverse-nodes-in-k-group",
    dependencyType: "required",
  },
  {
    prerequisiteSlug: "linked-list-cycle",
    dependentSlug: "linked-list-cycle-ii",
    dependencyType: "required",
  },
  {
    prerequisiteSlug: "linked-list-cycle",
    dependentSlug: "find-the-duplicate-number",
    dependencyType: "recommended",
  },

  // Monotonic Stacks
  {
    prerequisiteSlug: "valid-parentheses",
    dependentSlug: "generate-parentheses",
    dependencyType: "recommended",
  },
  {
    prerequisiteSlug: "daily-temperatures",
    dependentSlug: "next-greater-element-i",
    dependencyType: "recommended",
  },
  {
    prerequisiteSlug: "daily-temperatures",
    dependentSlug: "largest-rectangle-in-histogram",
    dependencyType: "required",
  },

  // Recursion & Backtracking
  {
    prerequisiteSlug: "subsets",
    dependentSlug: "subsets-ii",
    dependencyType: "required",
  },
  {
    prerequisiteSlug: "combination-sum",
    dependentSlug: "combination-sum-ii",
    dependencyType: "required",
  },
  {
    prerequisiteSlug: "permutations",
    dependentSlug: "permutations-ii",
    dependencyType: "required",
  },

  // Trees & BST
  {
    prerequisiteSlug: "invert-binary-tree",
    dependentSlug: "maximum-depth-of-binary-tree",
    dependencyType: "recommended",
  },
  {
    prerequisiteSlug: "maximum-depth-of-binary-tree",
    dependentSlug: "diameter-of-binary-tree",
    dependencyType: "required",
  },
  {
    prerequisiteSlug: "maximum-depth-of-binary-tree",
    dependentSlug: "balanced-binary-tree",
    dependencyType: "required",
  },
  {
    prerequisiteSlug: "lowest-common-ancestor-of-a-binary-search-tree",
    dependentSlug: "lowest-common-ancestor-of-a-binary-tree",
    dependencyType: "required",
  },
  {
    prerequisiteSlug: "binary-tree-level-order-traversal",
    dependentSlug: "binary-tree-right-side-view",
    dependencyType: "recommended",
  },
  {
    prerequisiteSlug: "validate-binary-search-tree",
    dependentSlug: "kth-smallest-element-in-a-bst",
    dependencyType: "recommended",
  },

  // Heaps
  {
    prerequisiteSlug: "kth-largest-element-in-a-stream",
    dependentSlug: "kth-largest-element-in-an-array",
    dependencyType: "required",
  },
  {
    prerequisiteSlug: "kth-largest-element-in-an-array",
    dependentSlug: "find-median-from-data-stream",
    dependencyType: "required",
  },
  {
    prerequisiteSlug: "merge-two-sorted-lists",
    dependentSlug: "merge-k-sorted-lists",
    dependencyType: "required",
  },

  // Graphs
  {
    prerequisiteSlug: "number-of-islands",
    dependentSlug: "max-area-of-island",
    dependencyType: "recommended",
  },
  {
    prerequisiteSlug: "number-of-islands",
    dependentSlug: "rotting-oranges",
    dependencyType: "required",
  },
  {
    prerequisiteSlug: "number-of-islands",
    dependentSlug: "surrounded-regions",
    dependencyType: "recommended",
  },
  {
    prerequisiteSlug: "course-schedule",
    dependentSlug: "course-schedule-ii",
    dependencyType: "required",
  },
  {
    prerequisiteSlug: "course-schedule-ii",
    dependentSlug: "alien-dictionary",
    dependencyType: "required",
  },

  // Greedy
  {
    prerequisiteSlug: "jump-game",
    dependentSlug: "jump-game-ii",
    dependencyType: "required",
  },

  // Dynamic Programming
  {
    prerequisiteSlug: "climbing-stairs",
    dependentSlug: "min-cost-climbing-stairs",
    dependencyType: "required",
  },
  {
    prerequisiteSlug: "climbing-stairs",
    dependentSlug: "house-robber",
    dependencyType: "required",
  },
  {
    prerequisiteSlug: "house-robber",
    dependentSlug: "house-robber-ii",
    dependencyType: "required",
  },
  {
    prerequisiteSlug: "longest-palindromic-substring",
    dependentSlug: "palindromic-substrings",
    dependencyType: "recommended",
  },
  {
    prerequisiteSlug: "coin-change",
    dependentSlug: "coin-change-ii",
    dependencyType: "required",
  },

  // Bit Manipulation
  {
    prerequisiteSlug: "single-number",
    dependentSlug: "number-of-1-bits",
    dependencyType: "recommended",
  },
  {
    prerequisiteSlug: "number-of-1-bits",
    dependentSlug: "counting-bits",
    dependencyType: "required",
  },
];

