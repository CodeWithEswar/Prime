/**
 * PRIME Core DSA Curriculum Seed (V1 - 2026.1)
 * Exactly 189 canonical high-value DSA problems curated across 16 stages.
 * Automatically generated & validated against the 4,411 canonical catalog.
 */

export interface CurriculumSeedItem {
  slug: string;
  stageSlug: string;
  sequence: number;
  priority: "P0" | "P1" | "P2";
  recommendedMinutes: number;
  isRequired: boolean;
  isCheckpoint: boolean;
  selectionReason: string;
}

export const PRIME_CORE_SEED_ITEMS: CurriculumSeedItem[] = [
  {
    "slug": "two-sum",
    "stageSlug": "foundations",
    "sequence": 1,
    "priority": "P0",
    "recommendedMinutes": 15,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Foundational hash table complement lookup in single-pass O(N)."
  },
  {
    "slug": "best-time-to-buy-and-sell-stock",
    "stageSlug": "foundations",
    "sequence": 2,
    "priority": "P0",
    "recommendedMinutes": 15,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Single-pass running minimum tracking with peak profit calculation."
  },
  {
    "slug": "contains-duplicate",
    "stageSlug": "foundations",
    "sequence": 3,
    "priority": "P0",
    "recommendedMinutes": 10,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Fundamental set-based duplicate detection and hash complexity."
  },
  {
    "slug": "valid-anagram",
    "stageSlug": "foundations",
    "sequence": 4,
    "priority": "P0",
    "recommendedMinutes": 15,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Character frequency array counting vs sorting complexity comparison."
  },
  {
    "slug": "remove-duplicates-from-sorted-array",
    "stageSlug": "foundations",
    "sequence": 5,
    "priority": "P1",
    "recommendedMinutes": 15,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "In-place two-pointer array compaction on sorted boundaries."
  },
  {
    "slug": "move-zeroes",
    "stageSlug": "foundations",
    "sequence": 6,
    "priority": "P1",
    "recommendedMinutes": 15,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Non-zero compaction preserving relative element order."
  },
  {
    "slug": "squares-of-a-sorted-array",
    "stageSlug": "foundations",
    "sequence": 7,
    "priority": "P1",
    "recommendedMinutes": 15,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Two pointers from opposite ends exploiting absolute magnitude symmetry."
  },
  {
    "slug": "missing-number",
    "stageSlug": "foundations",
    "sequence": 8,
    "priority": "P1",
    "recommendedMinutes": 15,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Arithmetic Gauss sum formula vs XOR cancellation invariance."
  },
  {
    "slug": "majority-element",
    "stageSlug": "foundations",
    "sequence": 9,
    "priority": "P0",
    "recommendedMinutes": 15,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Boyer-Moore voting algorithm for linear time O(1) space majority detection."
  },
  {
    "slug": "merge-sorted-array",
    "stageSlug": "foundations",
    "sequence": 10,
    "priority": "P1",
    "recommendedMinutes": 15,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Three-pointer backwards merging into pre-allocated memory buffer."
  },
  {
    "slug": "group-anagrams",
    "stageSlug": "arrays-hashing",
    "sequence": 11,
    "priority": "P0",
    "recommendedMinutes": 20,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Categorizing string equivalence classes using canonical sorted or count tuples as hash keys."
  },
  {
    "slug": "top-k-frequent-elements",
    "stageSlug": "arrays-hashing",
    "sequence": 12,
    "priority": "P0",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Frequency mapping combined with bucket sort or min-heap for linear/log-linear selection."
  },
  {
    "slug": "product-of-array-except-self",
    "stageSlug": "arrays-hashing",
    "sequence": 13,
    "priority": "P0",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Prefix and suffix product passes without division in O(1) auxiliary space."
  },
  {
    "slug": "valid-sudoku",
    "stageSlug": "arrays-hashing",
    "sequence": 14,
    "priority": "P1",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Multidimensional hash set tracking for rows, columns, and 3x3 sub-boxes."
  },
  {
    "slug": "encode-and-decode-strings",
    "stageSlug": "arrays-hashing",
    "sequence": 15,
    "priority": "P1",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Length-prefixed chunk encoding to handle arbitrary delimiter collisions."
  },
  {
    "slug": "longest-consecutive-sequence",
    "stageSlug": "arrays-hashing",
    "sequence": 16,
    "priority": "P0",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Hash set sequence exploration by identifying sequence roots in O(N) amortized time."
  },
  {
    "slug": "sort-colors",
    "stageSlug": "arrays-hashing",
    "sequence": 17,
    "priority": "P1",
    "recommendedMinutes": 20,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Dutch National Flag three-way partitioning algorithm in single pass."
  },
  {
    "slug": "next-permutation",
    "stageSlug": "arrays-hashing",
    "sequence": 18,
    "priority": "P1",
    "recommendedMinutes": 30,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Lexicographical permutation generation via suffix pivot identification and reversal."
  },
  {
    "slug": "rotate-image",
    "stageSlug": "arrays-hashing",
    "sequence": 19,
    "priority": "P1",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "In-place 2D matrix manipulation via transpose and horizontal reflection."
  },
  {
    "slug": "spiral-matrix",
    "stageSlug": "arrays-hashing",
    "sequence": 20,
    "priority": "P1",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Four-boundary contraction simulation for 2D matrix traversal."
  },
  {
    "slug": "set-matrix-zeroes",
    "stageSlug": "arrays-hashing",
    "sequence": 21,
    "priority": "P1",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "State compression using first row and column markers for O(1) space zeroing."
  },
  {
    "slug": "brick-wall",
    "stageSlug": "arrays-hashing",
    "sequence": 22,
    "priority": "P2",
    "recommendedMinutes": 25,
    "isRequired": false,
    "isCheckpoint": false,
    "selectionReason": "Cumulative width hash map to minimize crossed vertical line segments."
  },
  {
    "slug": "valid-palindrome",
    "stageSlug": "strings",
    "sequence": 23,
    "priority": "P0",
    "recommendedMinutes": 15,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Alphanumeric normalization and opposite-end pointer convergence."
  },
  {
    "slug": "longest-common-prefix",
    "stageSlug": "strings",
    "sequence": 24,
    "priority": "P1",
    "recommendedMinutes": 15,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Horizontal vs vertical character scanning across string arrays."
  },
  {
    "slug": "string-to-integer-atoi",
    "stageSlug": "strings",
    "sequence": 25,
    "priority": "P1",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "State machine parsing with whitespace handling, signs, and 32-bit integer overflow clamping."
  },
  {
    "slug": "zigzag-conversion",
    "stageSlug": "strings",
    "sequence": 26,
    "priority": "P2",
    "recommendedMinutes": 20,
    "isRequired": false,
    "isCheckpoint": false,
    "selectionReason": "Directional row buffer simulation and cyclic period index computation."
  },
  {
    "slug": "roman-to-integer",
    "stageSlug": "strings",
    "sequence": 27,
    "priority": "P1",
    "recommendedMinutes": 15,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Subtractive numeral notation lookup through sequential lookahead."
  },
  {
    "slug": "integer-to-roman",
    "stageSlug": "strings",
    "sequence": 28,
    "priority": "P1",
    "recommendedMinutes": 20,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Greedy value-symbol mapping from highest to lowest Roman denominations."
  },
  {
    "slug": "count-and-say",
    "stageSlug": "strings",
    "sequence": 29,
    "priority": "P1",
    "recommendedMinutes": 20,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Run-length encoding string generation through iterative simulation."
  },
  {
    "slug": "find-the-index-of-the-first-occurrence-in-a-string",
    "stageSlug": "strings",
    "sequence": 30,
    "priority": "P1",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Sliding window substring matching and Knuth-Morris-Pratt (KMP) failure table fundamentals."
  },
  {
    "slug": "repeated-dna-sequences",
    "stageSlug": "strings",
    "sequence": 31,
    "priority": "P2",
    "recommendedMinutes": 25,
    "isRequired": false,
    "isCheckpoint": false,
    "selectionReason": "Fixed-length 10-mer rolling hash or bitmask encoding for duplicate substring detection."
  },
  {
    "slug": "valid-parenthesis-string",
    "stageSlug": "strings",
    "sequence": 32,
    "priority": "P0",
    "recommendedMinutes": 30,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Two-pointer min/max open bracket range tracking for wildcard resolution."
  },
  {
    "slug": "two-sum-ii-input-array-is-sorted",
    "stageSlug": "two-pointers-sliding-window",
    "sequence": 33,
    "priority": "P0",
    "recommendedMinutes": 15,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Monotonic sorted search space two-pointer narrowing in O(1) space."
  },
  {
    "slug": "3sum",
    "stageSlug": "two-pointers-sliding-window",
    "sequence": 34,
    "priority": "P0",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Fixing one element and reducing to Two Sum II with duplicate avoidance."
  },
  {
    "slug": "3sum-closest",
    "stageSlug": "two-pointers-sliding-window",
    "sequence": 35,
    "priority": "P1",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Tracking minimum absolute distance within sorted two-pointer traversal."
  },
  {
    "slug": "4sum",
    "stageSlug": "two-pointers-sliding-window",
    "sequence": 36,
    "priority": "P1",
    "recommendedMinutes": 30,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Generalizing K-Sum via recursive nested pointer loops with duplicate skipping."
  },
  {
    "slug": "container-with-most-water",
    "stageSlug": "two-pointers-sliding-window",
    "sequence": 37,
    "priority": "P0",
    "recommendedMinutes": 20,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Greedy two-pointer shrinking by always advancing the shorter limiting wall."
  },
  {
    "slug": "trapping-rain-water",
    "stageSlug": "two-pointers-sliding-window",
    "sequence": 38,
    "priority": "P0",
    "recommendedMinutes": 35,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Two-pointer max left/right boundary tracking for O(N) time O(1) space volume integration."
  },
  {
    "slug": "longest-substring-without-repeating-characters",
    "stageSlug": "two-pointers-sliding-window",
    "sequence": 39,
    "priority": "P0",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Variable-length sliding window with hash map jump-forward index on repeat."
  },
  {
    "slug": "longest-repeating-character-replacement",
    "stageSlug": "two-pointers-sliding-window",
    "sequence": 40,
    "priority": "P0",
    "recommendedMinutes": 30,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Sliding window with max frequency invariant where (window - maxFreq <= k)."
  },
  {
    "slug": "permutation-in-string",
    "stageSlug": "two-pointers-sliding-window",
    "sequence": 41,
    "priority": "P0",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Fixed-size sliding window frequency matching with match counter optimization."
  },
  {
    "slug": "find-all-anagrams-in-a-string",
    "stageSlug": "two-pointers-sliding-window",
    "sequence": 42,
    "priority": "P1",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Sliding window collecting all starting indices with matching frequency profile."
  },
  {
    "slug": "minimum-window-substring",
    "stageSlug": "two-pointers-sliding-window",
    "sequence": 43,
    "priority": "P0",
    "recommendedMinutes": 40,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Classic variable sliding window with target character frequency and formed condition."
  },
  {
    "slug": "sliding-window-maximum",
    "stageSlug": "two-pointers-sliding-window",
    "sequence": 44,
    "priority": "P0",
    "recommendedMinutes": 35,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Monotonic decreasing deque maintaining candidate maxima in O(N) total time."
  },
  {
    "slug": "fruit-into-baskets",
    "stageSlug": "two-pointers-sliding-window",
    "sequence": 45,
    "priority": "P1",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "At most 2 distinct elements sliding window pattern."
  },
  {
    "slug": "max-consecutive-ones-iii",
    "stageSlug": "two-pointers-sliding-window",
    "sequence": 46,
    "priority": "P1",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Sliding window with at most K zero flips."
  },
  {
    "slug": "range-sum-query-immutable",
    "stageSlug": "prefix-sum-intervals",
    "sequence": 47,
    "priority": "P0",
    "recommendedMinutes": 15,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Static 1D prefix sum array enabling O(1) range sum queries."
  },
  {
    "slug": "find-pivot-index",
    "stageSlug": "prefix-sum-intervals",
    "sequence": 48,
    "priority": "P0",
    "recommendedMinutes": 15,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Equilibrium index discovery comparing left sum to total minus current element."
  },
  {
    "slug": "subarray-sum-equals-k",
    "stageSlug": "prefix-sum-intervals",
    "sequence": 49,
    "priority": "P0",
    "recommendedMinutes": 30,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Prefix sum hash map counting historical complements for negative-compatible subarray queries."
  },
  {
    "slug": "continuous-subarray-sum",
    "stageSlug": "prefix-sum-intervals",
    "sequence": 50,
    "priority": "P2",
    "recommendedMinutes": 30,
    "isRequired": false,
    "isCheckpoint": false,
    "selectionReason": "Modulo prefix sum hash map tracking earliest remainder index for divisibility."
  },
  {
    "slug": "range-sum-query-2d-immutable",
    "stageSlug": "prefix-sum-intervals",
    "sequence": 51,
    "priority": "P1",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "2D inclusion-exclusion principle for matrix rectangle subquery in O(1)."
  },
  {
    "slug": "merge-intervals",
    "stageSlug": "prefix-sum-intervals",
    "sequence": 52,
    "priority": "P0",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Sort by start time and greedily merge overlapping intervals."
  },
  {
    "slug": "insert-interval",
    "stageSlug": "prefix-sum-intervals",
    "sequence": 53,
    "priority": "P0",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Linear three-stage partitioning: before overlap, overlapping merge, after overlap."
  },
  {
    "slug": "non-overlapping-intervals",
    "stageSlug": "prefix-sum-intervals",
    "sequence": 54,
    "priority": "P0",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Greedy interval scheduling by sorting by earliest end time to minimize removals."
  },
  {
    "slug": "minimum-number-of-arrows-to-burst-balloons",
    "stageSlug": "prefix-sum-intervals",
    "sequence": 55,
    "priority": "P1",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Finding mutual intersection points across overlapping ranges."
  },
  {
    "slug": "meeting-rooms",
    "stageSlug": "prefix-sum-intervals",
    "sequence": 56,
    "priority": "P1",
    "recommendedMinutes": 15,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Pairwise overlap verification via sorted start times."
  },
  {
    "slug": "meeting-rooms-ii",
    "stageSlug": "prefix-sum-intervals",
    "sequence": 57,
    "priority": "P0",
    "recommendedMinutes": 30,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Chronological event sweep line or min-heap to determine peak room concurrency."
  },
  {
    "slug": "car-pooling",
    "stageSlug": "prefix-sum-intervals",
    "sequence": 58,
    "priority": "P1",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Difference array bucket accumulation for capacity checking across distance."
  },
  {
    "slug": "corporate-flight-bookings",
    "stageSlug": "prefix-sum-intervals",
    "sequence": 59,
    "priority": "P2",
    "recommendedMinutes": 25,
    "isRequired": false,
    "isCheckpoint": false,
    "selectionReason": "Difference array technique for batch range additions with single prefix scan."
  },
  {
    "slug": "binary-search",
    "stageSlug": "binary-search",
    "sequence": 60,
    "priority": "P0",
    "recommendedMinutes": 10,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Canonical logarithmic search with overflow-safe midpoint calculation."
  },
  {
    "slug": "search-insert-position",
    "stageSlug": "binary-search",
    "sequence": 61,
    "priority": "P1",
    "recommendedMinutes": 15,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Lower bound / insertion point invariant when target is absent."
  },
  {
    "slug": "find-first-and-last-position-of-element-in-sorted-array",
    "stageSlug": "binary-search",
    "sequence": 62,
    "priority": "P0",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Dual binary search for left and right boundary confirmation."
  },
  {
    "slug": "search-a-2d-matrix",
    "stageSlug": "binary-search",
    "sequence": 63,
    "priority": "P0",
    "recommendedMinutes": 20,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Flattened 1D coordinate mapping onto 2D row/col in sorted matrix."
  },
  {
    "slug": "search-a-2d-matrix-ii",
    "stageSlug": "binary-search",
    "sequence": 64,
    "priority": "P1",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Staircase search starting from top-right or bottom-left corner."
  },
  {
    "slug": "find-minimum-in-rotated-sorted-array",
    "stageSlug": "binary-search",
    "sequence": 65,
    "priority": "P0",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Binary search on unsorted side to locate the rotation inflection pivot."
  },
  {
    "slug": "search-in-rotated-sorted-array",
    "stageSlug": "binary-search",
    "sequence": 66,
    "priority": "P0",
    "recommendedMinutes": 30,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Identifying which half is sorted and determining if target falls inside it."
  },
  {
    "slug": "koko-eating-bananas",
    "stageSlug": "binary-search",
    "sequence": 67,
    "priority": "P0",
    "recommendedMinutes": 30,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Canonical binary search on answer space using monotonic feasibility function."
  },
  {
    "slug": "capacity-to-ship-packages-within-d-days",
    "stageSlug": "binary-search",
    "sequence": 68,
    "priority": "P1",
    "recommendedMinutes": 30,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Binary search on min/max capacity with greedy daily load validation."
  },
  {
    "slug": "split-array-largest-sum",
    "stageSlug": "binary-search",
    "sequence": 69,
    "priority": "P1",
    "recommendedMinutes": 35,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Binary search on max subarray sum bound with greedy partition count."
  },
  {
    "slug": "time-based-key-value-store",
    "stageSlug": "binary-search",
    "sequence": 70,
    "priority": "P0",
    "recommendedMinutes": 30,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Hash map of sorted timestamp arrays queried with rightmost binary search."
  },
  {
    "slug": "median-of-two-sorted-arrays",
    "stageSlug": "binary-search",
    "sequence": 71,
    "priority": "P0",
    "recommendedMinutes": 45,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Binary search on partition split of smaller array in O(log(min(N, M)))."
  },
  {
    "slug": "reverse-linked-list",
    "stageSlug": "linked-lists",
    "sequence": 72,
    "priority": "P0",
    "recommendedMinutes": 15,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "In-place iterative pointer reversal using prev, curr, and next."
  },
  {
    "slug": "merge-two-sorted-lists",
    "stageSlug": "linked-lists",
    "sequence": 73,
    "priority": "P0",
    "recommendedMinutes": 15,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Dummy head node sentinel pattern for clean two-list splicing."
  },
  {
    "slug": "linked-list-cycle",
    "stageSlug": "linked-lists",
    "sequence": 74,
    "priority": "P0",
    "recommendedMinutes": 15,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Floyd's Tortoise and Hare fast and slow pointer cycle detection."
  },
  {
    "slug": "linked-list-cycle-ii",
    "stageSlug": "linked-lists",
    "sequence": 75,
    "priority": "P1",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Mathematical derivation to locate the exact cycle entry node."
  },
  {
    "slug": "reorder-list",
    "stageSlug": "linked-lists",
    "sequence": 76,
    "priority": "P0",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Synthesis of finding middle, reversing second half, and alternating merge."
  },
  {
    "slug": "remove-nth-node-from-end-of-list",
    "stageSlug": "linked-lists",
    "sequence": 77,
    "priority": "P0",
    "recommendedMinutes": 20,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Two pointers separated by N nodes for one-pass end deletion."
  },
  {
    "slug": "copy-list-with-random-pointer",
    "stageSlug": "linked-lists",
    "sequence": 78,
    "priority": "P0",
    "recommendedMinutes": 30,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Deep copy with random references via hash map or interweaved nodes."
  },
  {
    "slug": "add-two-numbers",
    "stageSlug": "linked-lists",
    "sequence": 79,
    "priority": "P0",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Digit-by-digit addition with carry propagation on linked structures."
  },
  {
    "slug": "find-the-duplicate-number",
    "stageSlug": "linked-lists",
    "sequence": 80,
    "priority": "P0",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Treating array values as linked list pointers and finding cycle entrance."
  },
  {
    "slug": "intersection-of-two-linked-lists",
    "stageSlug": "linked-lists",
    "sequence": 81,
    "priority": "P1",
    "recommendedMinutes": 20,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Two pointer switching head tracks to align equal path lengths."
  },
  {
    "slug": "palindrome-linked-list",
    "stageSlug": "linked-lists",
    "sequence": 82,
    "priority": "P1",
    "recommendedMinutes": 20,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Finding middle, reversing second half, and checking value symmetry in O(1) space."
  },
  {
    "slug": "reverse-nodes-in-k-group",
    "stageSlug": "linked-lists",
    "sequence": 83,
    "priority": "P0",
    "recommendedMinutes": 40,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Sublist length verification and iterative segment reversal with pointer relinking."
  },
  {
    "slug": "valid-parentheses",
    "stageSlug": "stacks-queues",
    "sequence": 84,
    "priority": "P0",
    "recommendedMinutes": 15,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "LIFO matching of opening and closing bracket types."
  },
  {
    "slug": "min-stack",
    "stageSlug": "stacks-queues",
    "sequence": 85,
    "priority": "P0",
    "recommendedMinutes": 20,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Dual stack or paired tuple tracking for O(1) minimum retrieval."
  },
  {
    "slug": "evaluate-reverse-polish-notation",
    "stageSlug": "stacks-queues",
    "sequence": 86,
    "priority": "P0",
    "recommendedMinutes": 20,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Postfix mathematical evaluation via operand stack processing."
  },
  {
    "slug": "daily-temperatures",
    "stageSlug": "stacks-queues",
    "sequence": 87,
    "priority": "P0",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Monotonic decreasing stack to find next greater element distance in O(N)."
  },
  {
    "slug": "next-greater-element-i",
    "stageSlug": "stacks-queues",
    "sequence": 88,
    "priority": "P1",
    "recommendedMinutes": 20,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Monotonic stack coupled with hash map lookup for subset queries."
  },
  {
    "slug": "next-greater-element-ii",
    "stageSlug": "stacks-queues",
    "sequence": 89,
    "priority": "P1",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Circular array simulation via 2N modulo pass with monotonic stack."
  },
  {
    "slug": "car-fleet",
    "stageSlug": "stacks-queues",
    "sequence": 90,
    "priority": "P1",
    "recommendedMinutes": 30,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Sorting by starting position and evaluating target arrival times using a stack."
  },
  {
    "slug": "largest-rectangle-in-histogram",
    "stageSlug": "stacks-queues",
    "sequence": 91,
    "priority": "P0",
    "recommendedMinutes": 40,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Monotonic increasing stack identifying width boundaries on pop."
  },
  {
    "slug": "implement-queue-using-stacks",
    "stageSlug": "stacks-queues",
    "sequence": 92,
    "priority": "P1",
    "recommendedMinutes": 20,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Two-stack amortized O(1) FIFO queue implementation."
  },
  {
    "slug": "simplify-path",
    "stageSlug": "stacks-queues",
    "sequence": 93,
    "priority": "P1",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Unix file path normalization handling '.', '..', and empty segments."
  },
  {
    "slug": "basic-calculator-ii",
    "stageSlug": "stacks-queues",
    "sequence": 94,
    "priority": "P1",
    "recommendedMinutes": 35,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Operator precedence evaluation using stack without full parenthesis parsing."
  },
  {
    "slug": "subsets",
    "stageSlug": "recursion-backtracking",
    "sequence": 95,
    "priority": "P0",
    "recommendedMinutes": 20,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Include/exclude binary decision tree state exploration."
  },
  {
    "slug": "subsets-ii",
    "stageSlug": "recursion-backtracking",
    "sequence": 96,
    "priority": "P1",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Sorting array to skip duplicate decision branches at the same tree depth."
  },
  {
    "slug": "combination-sum",
    "stageSlug": "recursion-backtracking",
    "sequence": 97,
    "priority": "P0",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Unbounded element reuse backtracking with target remainder decrement."
  },
  {
    "slug": "combination-sum-ii",
    "stageSlug": "recursion-backtracking",
    "sequence": 98,
    "priority": "P1",
    "recommendedMinutes": 30,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Single-use elements with duplicate avoidance via sorted branching."
  },
  {
    "slug": "permutations",
    "stageSlug": "recursion-backtracking",
    "sequence": 99,
    "priority": "P0",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Generating all element orderings using boolean visited array or in-place swap."
  },
  {
    "slug": "permutations-ii",
    "stageSlug": "recursion-backtracking",
    "sequence": 100,
    "priority": "P1",
    "recommendedMinutes": 30,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Permutation generation with duplicates using sorting and precedence rules."
  },
  {
    "slug": "word-search",
    "stageSlug": "recursion-backtracking",
    "sequence": 101,
    "priority": "P0",
    "recommendedMinutes": 30,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "2D grid DFS backtracking with in-place cell marking and restoration."
  },
  {
    "slug": "palindrome-partitioning",
    "stageSlug": "recursion-backtracking",
    "sequence": 102,
    "priority": "P1",
    "recommendedMinutes": 30,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Partitioning string prefixes verified as palindromes into complete paths."
  },
  {
    "slug": "letter-combinations-of-a-phone-number",
    "stageSlug": "recursion-backtracking",
    "sequence": 103,
    "priority": "P0",
    "recommendedMinutes": 20,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Cartesian product generation from digit-to-char mapping."
  },
  {
    "slug": "generate-parentheses",
    "stageSlug": "recursion-backtracking",
    "sequence": 104,
    "priority": "P0",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Constrained backtracking with open < n and close < open validity bounds."
  },
  {
    "slug": "n-queens",
    "stageSlug": "recursion-backtracking",
    "sequence": 105,
    "priority": "P1",
    "recommendedMinutes": 40,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Column and diagonal conflict set tracking on NxN chessboard."
  },
  {
    "slug": "sudoku-solver",
    "stageSlug": "recursion-backtracking",
    "sequence": 106,
    "priority": "P2",
    "recommendedMinutes": 45,
    "isRequired": false,
    "isCheckpoint": false,
    "selectionReason": "Exhaustive 9x9 constraint satisfaction with row, col, and box validity."
  },
  {
    "slug": "invert-binary-tree",
    "stageSlug": "trees-bst",
    "sequence": 107,
    "priority": "P0",
    "recommendedMinutes": 10,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Base recursive tree DFS swapping left and right subtrees."
  },
  {
    "slug": "maximum-depth-of-binary-tree",
    "stageSlug": "trees-bst",
    "sequence": 108,
    "priority": "P0",
    "recommendedMinutes": 15,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Postorder bottom-up height aggregation: 1 + max(left, right)."
  },
  {
    "slug": "diameter-of-binary-tree",
    "stageSlug": "trees-bst",
    "sequence": 109,
    "priority": "P0",
    "recommendedMinutes": 20,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Tracking global path maxima while returning single-branch height."
  },
  {
    "slug": "balanced-binary-tree",
    "stageSlug": "trees-bst",
    "sequence": 110,
    "priority": "P0",
    "recommendedMinutes": 20,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Bottom-up height calculation returning -1 early on balance violation."
  },
  {
    "slug": "same-tree",
    "stageSlug": "trees-bst",
    "sequence": 111,
    "priority": "P0",
    "recommendedMinutes": 15,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Simultaneous dual-tree recursive structural and value equality."
  },
  {
    "slug": "subtree-of-another-tree",
    "stageSlug": "trees-bst",
    "sequence": 112,
    "priority": "P1",
    "recommendedMinutes": 20,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Composing full tree traversal with identical tree verification."
  },
  {
    "slug": "lowest-common-ancestor-of-a-binary-search-tree",
    "stageSlug": "trees-bst",
    "sequence": 113,
    "priority": "P0",
    "recommendedMinutes": 20,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Exploiting BST ordering to navigate split points in O(H) time."
  },
  {
    "slug": "lowest-common-ancestor-of-a-binary-tree",
    "stageSlug": "trees-bst",
    "sequence": 114,
    "priority": "P0",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "General binary tree LCA using bottom-up target presence propagation."
  },
  {
    "slug": "binary-tree-level-order-traversal",
    "stageSlug": "trees-bst",
    "sequence": 115,
    "priority": "P0",
    "recommendedMinutes": 20,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Standard queue-based breadth-first level batching."
  },
  {
    "slug": "binary-tree-right-side-view",
    "stageSlug": "trees-bst",
    "sequence": 116,
    "priority": "P0",
    "recommendedMinutes": 20,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "BFS level processing capturing last element or reverse preorder DFS."
  },
  {
    "slug": "count-good-nodes-in-binary-tree",
    "stageSlug": "trees-bst",
    "sequence": 117,
    "priority": "P1",
    "recommendedMinutes": 20,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Top-down state propagation tracking path maximum value."
  },
  {
    "slug": "validate-binary-search-tree",
    "stageSlug": "trees-bst",
    "sequence": 118,
    "priority": "P0",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Bounded recursive interval verification (low < val < high) or inorder monotonicity."
  },
  {
    "slug": "kth-smallest-element-in-a-bst",
    "stageSlug": "trees-bst",
    "sequence": 119,
    "priority": "P0",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Inorder traversal yielding sorted elements with early termination at K."
  },
  {
    "slug": "construct-binary-tree-from-preorder-and-inorder-traversal",
    "stageSlug": "trees-bst",
    "sequence": 120,
    "priority": "P0",
    "recommendedMinutes": 35,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Root identification from preorder and subtree boundary splitting via inorder hash map."
  },
  {
    "slug": "binary-tree-maximum-path-sum",
    "stageSlug": "trees-bst",
    "sequence": 121,
    "priority": "P0",
    "recommendedMinutes": 40,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Postorder path aggregation ignoring negative subtrees and updating global root sum."
  },
  {
    "slug": "serialize-and-deserialize-binary-tree",
    "stageSlug": "trees-bst",
    "sequence": 122,
    "priority": "P1",
    "recommendedMinutes": 45,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Preorder or level-order tree encoding with null sentinel tokens."
  },
  {
    "slug": "kth-largest-element-in-a-stream",
    "stageSlug": "heaps-priority-queues",
    "sequence": 123,
    "priority": "P0",
    "recommendedMinutes": 20,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Min-heap of fixed size K maintaining running Kth largest element."
  },
  {
    "slug": "last-stone-weight",
    "stageSlug": "heaps-priority-queues",
    "sequence": 124,
    "priority": "P1",
    "recommendedMinutes": 15,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Max-heap simulation repeatedly smashing top two heaviest items."
  },
  {
    "slug": "k-closest-points-to-origin",
    "stageSlug": "heaps-priority-queues",
    "sequence": 125,
    "priority": "P0",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Max-heap of size K or QuickSelect on Euclidean distance."
  },
  {
    "slug": "kth-largest-element-in-an-array",
    "stageSlug": "heaps-priority-queues",
    "sequence": 126,
    "priority": "P0",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Min-heap of size K vs QuickSelect partition for linear average selection."
  },
  {
    "slug": "task-scheduler",
    "stageSlug": "heaps-priority-queues",
    "sequence": 127,
    "priority": "P0",
    "recommendedMinutes": 35,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Max-heap greedy task scheduling with cooldown queue or mathematical idle calculation."
  },
  {
    "slug": "design-twitter",
    "stageSlug": "heaps-priority-queues",
    "sequence": 128,
    "priority": "P1",
    "recommendedMinutes": 40,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "OOP social graph with K-way sorted stream merge of most recent tweets."
  },
  {
    "slug": "find-median-from-data-stream",
    "stageSlug": "heaps-priority-queues",
    "sequence": 129,
    "priority": "P0",
    "recommendedMinutes": 35,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Dual balanced heaps (max-heap for lower half, min-heap for upper half) in O(log N)."
  },
  {
    "slug": "reorganize-string",
    "stageSlug": "heaps-priority-queues",
    "sequence": 130,
    "priority": "P1",
    "recommendedMinutes": 30,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Max-heap of character frequencies placing most frequent chars alternately."
  },
  {
    "slug": "merge-k-sorted-lists",
    "stageSlug": "heaps-priority-queues",
    "sequence": 131,
    "priority": "P0",
    "recommendedMinutes": 35,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Min-heap of list heads to achieve O(N log K) overall merge."
  },
  {
    "slug": "number-of-islands",
    "stageSlug": "graphs",
    "sequence": 132,
    "priority": "P0",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Canonical 2D grid connected components using DFS/BFS sink modification."
  },
  {
    "slug": "max-area-of-island",
    "stageSlug": "graphs",
    "sequence": 133,
    "priority": "P0",
    "recommendedMinutes": 20,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Grid DFS aggregating component area size across cell neighbors."
  },
  {
    "slug": "clone-graph",
    "stageSlug": "graphs",
    "sequence": 134,
    "priority": "P0",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Graph traversal with hash map tracking cloned nodes to resolve cycles."
  },
  {
    "slug": "rotting-oranges",
    "stageSlug": "graphs",
    "sequence": 135,
    "priority": "P0",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Multi-source breadth-first search for synchronous time-step propagation."
  },
  {
    "slug": "pacific-atlantic-water-flow",
    "stageSlug": "graphs",
    "sequence": 136,
    "priority": "P1",
    "recommendedMinutes": 35,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Reverse DFS from ocean boundaries finding set intersection."
  },
  {
    "slug": "surrounded-regions",
    "stageSlug": "graphs",
    "sequence": 137,
    "priority": "P1",
    "recommendedMinutes": 30,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Boundary-connected region protection via flood-fill and inner flipping."
  },
  {
    "slug": "course-schedule",
    "stageSlug": "graphs",
    "sequence": 138,
    "priority": "P0",
    "recommendedMinutes": 30,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Directed cycle detection using Kahn's in-degree BFS or 3-color DFS."
  },
  {
    "slug": "course-schedule-ii",
    "stageSlug": "graphs",
    "sequence": 139,
    "priority": "P0",
    "recommendedMinutes": 30,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Topological sorting order generation for prerequisite graph."
  },
  {
    "slug": "redundant-connection",
    "stageSlug": "graphs",
    "sequence": 140,
    "priority": "P0",
    "recommendedMinutes": 30,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Disjoint Set Union (Union-Find) with path compression and rank."
  },
  {
    "slug": "number-of-provinces",
    "stageSlug": "graphs",
    "sequence": 141,
    "priority": "P1",
    "recommendedMinutes": 20,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Adjacency matrix connected component counting via DFS or Union-Find."
  },
  {
    "slug": "graph-valid-tree",
    "stageSlug": "graphs",
    "sequence": 142,
    "priority": "P1",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Verifying exact N-1 edges and single connected component with no cycles."
  },
  {
    "slug": "number-of-connected-components-in-an-undirected-graph",
    "stageSlug": "graphs",
    "sequence": 143,
    "priority": "P1",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Counting disjoint sets in undirected graph."
  },
  {
    "slug": "word-ladder",
    "stageSlug": "graphs",
    "sequence": 144,
    "priority": "P0",
    "recommendedMinutes": 40,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Shortest transformation path via unweighted BFS with wildcard intermediate buckets."
  },
  {
    "slug": "network-delay-time",
    "stageSlug": "graphs",
    "sequence": 145,
    "priority": "P0",
    "recommendedMinutes": 35,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Dijkstra's shortest path algorithm using priority queue for weighted edges."
  },
  {
    "slug": "cheapest-flights-within-k-stops",
    "stageSlug": "graphs",
    "sequence": 146,
    "priority": "P1",
    "recommendedMinutes": 40,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Bellman-Ford relaxation with step limit or BFS priority queue."
  },
  {
    "slug": "min-cost-to-connect-all-points",
    "stageSlug": "graphs",
    "sequence": 147,
    "priority": "P1",
    "recommendedMinutes": 40,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Minimum Spanning Tree (MST) using Prim's algorithm or Kruskal's with Union-Find."
  },
  {
    "slug": "maximum-subarray",
    "stageSlug": "greedy",
    "sequence": 148,
    "priority": "P0",
    "recommendedMinutes": 20,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Kadane's algorithm deciding whether to extend current sum or restart."
  },
  {
    "slug": "jump-game",
    "stageSlug": "greedy",
    "sequence": 149,
    "priority": "P0",
    "recommendedMinutes": 20,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Maintaining running maximum reachability index across linear scan."
  },
  {
    "slug": "jump-game-ii",
    "stageSlug": "greedy",
    "sequence": 150,
    "priority": "P0",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "BFS level window jumps advancing boundary when current reach exhausted."
  },
  {
    "slug": "gas-station",
    "stageSlug": "greedy",
    "sequence": 151,
    "priority": "P0",
    "recommendedMinutes": 30,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Single-pass deficit reset identifying unique starting index."
  },
  {
    "slug": "hand-of-straights",
    "stageSlug": "greedy",
    "sequence": 152,
    "priority": "P1",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Greedy consecutive sequence formation from sorted frequency map."
  },
  {
    "slug": "partition-labels",
    "stageSlug": "greedy",
    "sequence": 153,
    "priority": "P0",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Pre-recording last character occurrences and expanding interval partition limit."
  },
  {
    "slug": "merge-triplets-to-form-target-triplet",
    "stageSlug": "greedy",
    "sequence": 154,
    "priority": "P1",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Filtering out invalid oversized triplets and verifying coordinate coverage."
  },
  {
    "slug": "assign-cookies",
    "stageSlug": "greedy",
    "sequence": 155,
    "priority": "P2",
    "recommendedMinutes": 15,
    "isRequired": false,
    "isCheckpoint": false,
    "selectionReason": "Two pointer sorting greedy match of smallest sufficient cookie to child greed."
  },
  {
    "slug": "candy",
    "stageSlug": "greedy",
    "sequence": 156,
    "priority": "P1",
    "recommendedMinutes": 35,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Two-pass forward and backward rating slope comparison."
  },
  {
    "slug": "lemonade-change",
    "stageSlug": "greedy",
    "sequence": 157,
    "priority": "P2",
    "recommendedMinutes": 15,
    "isRequired": false,
    "isCheckpoint": false,
    "selectionReason": "Greedy change giving prioritizing larger denominations to preserve smaller bills."
  },
  {
    "slug": "climbing-stairs",
    "stageSlug": "dynamic-programming",
    "sequence": 158,
    "priority": "P0",
    "recommendedMinutes": 15,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Canonical 1D dynamic programming recurrence: dp[i] = dp[i-1] + dp[i-2]."
  },
  {
    "slug": "min-cost-climbing-stairs",
    "stageSlug": "dynamic-programming",
    "sequence": 159,
    "priority": "P0",
    "recommendedMinutes": 15,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "1D cost recurrence tracking minimum transition cost in O(1) space."
  },
  {
    "slug": "house-robber",
    "stageSlug": "dynamic-programming",
    "sequence": 160,
    "priority": "P0",
    "recommendedMinutes": 20,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Non-adjacent selection recurrence: rob = max(prev1, prev2 + curr)."
  },
  {
    "slug": "house-robber-ii",
    "stageSlug": "dynamic-programming",
    "sequence": 161,
    "priority": "P0",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Circular house array decomposed into two linear House Robber subproblems."
  },
  {
    "slug": "longest-palindromic-substring",
    "stageSlug": "dynamic-programming",
    "sequence": 162,
    "priority": "P0",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Expand-around-center or 2D table dp[i][j] = s[i]==s[j] && dp[i+1][j-1]."
  },
  {
    "slug": "palindromic-substrings",
    "stageSlug": "dynamic-programming",
    "sequence": 163,
    "priority": "P1",
    "recommendedMinutes": 20,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Counting palindrome centers across odd and even midpoints in O(N^2)."
  },
  {
    "slug": "decode-ways",
    "stageSlug": "dynamic-programming",
    "sequence": 164,
    "priority": "P0",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "1D DP with valid single-digit and two-digit (10-26) transition validation."
  },
  {
    "slug": "coin-change",
    "stageSlug": "dynamic-programming",
    "sequence": 165,
    "priority": "P0",
    "recommendedMinutes": 30,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Unbounded knapsack: min coins to reach amount via dp[i] = min(dp[i-c] + 1)."
  },
  {
    "slug": "maximum-product-subarray",
    "stageSlug": "dynamic-programming",
    "sequence": 166,
    "priority": "P0",
    "recommendedMinutes": 30,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Tracking both running minimum and maximum to handle double negative flips."
  },
  {
    "slug": "word-break",
    "stageSlug": "dynamic-programming",
    "sequence": 167,
    "priority": "P0",
    "recommendedMinutes": 30,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Boolean 1D prefix segmentation verified against dictionary word lengths."
  },
  {
    "slug": "longest-increasing-subsequence",
    "stageSlug": "dynamic-programming",
    "sequence": 168,
    "priority": "P0",
    "recommendedMinutes": 35,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "O(N^2) state transition vs O(N log N) patience sorting with binary search."
  },
  {
    "slug": "partition-equal-subset-sum",
    "stageSlug": "dynamic-programming",
    "sequence": 169,
    "priority": "P0",
    "recommendedMinutes": 30,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "0/1 Knapsack boolean subset sum targeting totalSum / 2 in O(N * Target)."
  },
  {
    "slug": "unique-paths",
    "stageSlug": "dynamic-programming",
    "sequence": 170,
    "priority": "P0",
    "recommendedMinutes": 20,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "2D grid DP combining paths from top and left neighbors: dp[i][j] = dp[i-1][j] + dp[i][j-1]."
  },
  {
    "slug": "longest-common-subsequence",
    "stageSlug": "dynamic-programming",
    "sequence": 171,
    "priority": "P0",
    "recommendedMinutes": 35,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Canonical 2D string matching: match adds 1, mismatch takes max of adjacent."
  },
  {
    "slug": "best-time-to-buy-and-sell-stock-with-cooldown",
    "stageSlug": "dynamic-programming",
    "sequence": 172,
    "priority": "P1",
    "recommendedMinutes": 35,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "State machine DP tracking held, sold (cooldown), and reset states."
  },
  {
    "slug": "coin-change-ii",
    "stageSlug": "dynamic-programming",
    "sequence": 173,
    "priority": "P1",
    "recommendedMinutes": 30,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Unbounded knapsack counting combinations by iterating coins on outer loop."
  },
  {
    "slug": "target-sum",
    "stageSlug": "dynamic-programming",
    "sequence": 174,
    "priority": "P1",
    "recommendedMinutes": 30,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Transforming +/- sign assignment into equivalent subset sum partitioning."
  },
  {
    "slug": "edit-distance",
    "stageSlug": "dynamic-programming",
    "sequence": 175,
    "priority": "P0",
    "recommendedMinutes": 40,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Levenshtein distance: insert, delete, replace transitions in 2D table."
  },
  {
    "slug": "single-number",
    "stageSlug": "bit-manipulation-math",
    "sequence": 176,
    "priority": "P0",
    "recommendedMinutes": 15,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "XOR self-inversion property: A ^ A = 0, A ^ 0 = A in linear time O(1) space."
  },
  {
    "slug": "number-of-1-bits",
    "stageSlug": "bit-manipulation-math",
    "sequence": 177,
    "priority": "P0",
    "recommendedMinutes": 15,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Brian Kernighan's algorithm clearing least significant bit via n & (n - 1)."
  },
  {
    "slug": "counting-bits",
    "stageSlug": "bit-manipulation-math",
    "sequence": 178,
    "priority": "P0",
    "recommendedMinutes": 20,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "DP recurrence combining previous bit counts: dp[i] = dp[i >> 1] + (i & 1)."
  },
  {
    "slug": "reverse-bits",
    "stageSlug": "bit-manipulation-math",
    "sequence": 179,
    "priority": "P1",
    "recommendedMinutes": 15,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "32-bit integer bit reversal using shift and mask accumulators."
  },
  {
    "slug": "sum-of-two-integers",
    "stageSlug": "bit-manipulation-math",
    "sequence": 180,
    "priority": "P1",
    "recommendedMinutes": 20,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Hardware adder simulation using XOR for sum and AND with shift for carry."
  },
  {
    "slug": "reverse-integer",
    "stageSlug": "bit-manipulation-math",
    "sequence": 181,
    "priority": "P1",
    "recommendedMinutes": 20,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Digit extraction with lookahead check for 32-bit signed overflow."
  },
  {
    "slug": "powx-n",
    "stageSlug": "bit-manipulation-math",
    "sequence": 182,
    "priority": "P1",
    "recommendedMinutes": 25,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Binary exponentiation (divide-and-conquer) reducing O(N) multiplication to O(log N)."
  },
  {
    "slug": "multiply-strings",
    "stageSlug": "bit-manipulation-math",
    "sequence": 183,
    "priority": "P2",
    "recommendedMinutes": 30,
    "isRequired": false,
    "isCheckpoint": false,
    "selectionReason": "Manual grade-school multiplication digit simulation on string arrays."
  },
  {
    "slug": "lru-cache",
    "stageSlug": "mixed-interview-patterns",
    "sequence": 184,
    "priority": "P0",
    "recommendedMinutes": 35,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Combining doubly linked list with hash map for O(1) get and put eviction."
  },
  {
    "slug": "lfu-cache",
    "stageSlug": "mixed-interview-patterns",
    "sequence": 185,
    "priority": "P1",
    "recommendedMinutes": 45,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "Dual hash maps with frequency-indexed doubly linked lists for least-frequently-used eviction."
  },
  {
    "slug": "design-in-memory-file-system",
    "stageSlug": "mixed-interview-patterns",
    "sequence": 186,
    "priority": "P2",
    "recommendedMinutes": 45,
    "isRequired": false,
    "isCheckpoint": false,
    "selectionReason": "Trie-style hierarchy with directory/file node discrimination."
  },
  {
    "slug": "word-ladder-ii",
    "stageSlug": "mixed-interview-patterns",
    "sequence": 187,
    "priority": "P1",
    "recommendedMinutes": 50,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "BFS shortest path DAG generation followed by DFS backtracking path reconstruction."
  },
  {
    "slug": "regular-expression-matching",
    "stageSlug": "mixed-interview-patterns",
    "sequence": 188,
    "priority": "P1",
    "recommendedMinutes": 45,
    "isRequired": true,
    "isCheckpoint": false,
    "selectionReason": "2D dynamic programming handling '.' any char and '*' zero-or-more preceding character."
  },
  {
    "slug": "alien-dictionary",
    "stageSlug": "mixed-interview-patterns",
    "sequence": 189,
    "priority": "P0",
    "recommendedMinutes": 40,
    "isRequired": true,
    "isCheckpoint": true,
    "selectionReason": "Lexicographical character graph construction and topological sorting with cycle detection."
  }
];
