# PRIME Core DSA Curriculum V1 — QA & Distribution Report

Generated at: 2026-11-02T17:28:57.846Z

## Summary Overview

- **Total Curated Problems**: 189
- **Curriculum Version**: 2026.1
- **Total Stages**: 16
- **Prerequisite Edges (DAG)**: 52

## Difficulty Distribution

| Difficulty | Count | Percentage |
| :--- | :--- | :--- |
| **EASY** | 43 | 22.8% |
| **MEDIUM** | 126 | 66.7% |
| **HARD** | 20 | 10.6% |

*Note: Targets balanced interview prep: Easy 20-30%, Medium 60-70%, Hard 5-15%.*

## Stage Breakdown

| # | Stage Name | Slug | Problems | Est. Minutes |
| :--- | :--- | :--- | :--- | :--- |
| 01 | **Foundations** | `foundations` | 10 | 145m |
| 02 | **Arrays & Hashing** | `arrays-hashing` | 12 | 295m |
| 03 | **Strings & Pattern Recognition** | `strings` | 10 | 210m |
| 04 | **Two Pointers & Sliding Window** | `two-pointers-sliding-window` | 14 | 380m |
| 05 | **Prefix Sum & Intervals** | `prefix-sum-intervals` | 13 | 310m |
| 06 | **Binary Search** | `binary-search` | 12 | 320m |
| 07 | **Linked Lists** | `linked-lists` | 12 | 275m |
| 08 | **Stacks & Queues** | `stacks-queues` | 11 | 275m |
| 09 | **Recursion & Backtracking** | `recursion-backtracking` | 12 | 345m |
| 10 | **Trees & Binary Search Trees** | `trees-bst` | 16 | 375m |
| 11 | **Heaps & Priority Queues** | `heaps-priority-queues` | 9 | 260m |
| 12 | **Graphs** | `graphs` | 16 | 475m |
| 13 | **Greedy Algorithms** | `greedy` | 10 | 235m |
| 14 | **Dynamic Programming** | `dynamic-programming` | 18 | 490m |
| 15 | **Bit Manipulation & Math** | `bit-manipulation-math` | 8 | 160m |
| 16 | **Mixed Interview Patterns** | `mixed-interview-patterns` | 6 | 260m |
| **Total** | | | **189** | **4810m (~80h)** |

## Complete Ordered Curriculum

### Stage 01: Foundations

*Core array traversal, iteration invariants, basic complexity intuition, and simple frequency counting.*

| Seq | Problem Title | Difficulty | Priority | Target | Reason |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 001 | [Two Sum](https://leetcode.com/problems/two-sum) | `EASY` | `P0` | 15m | Foundational hash table complement lookup in single-pass O(N). |
| 002 | [Best Time to Buy and Sell Stock](https://leetcode.com/problems/best-time-to-buy-and-sell-stock) | `EASY` | `P0` | 15m | Single-pass running minimum tracking with peak profit calculation. |
| 003 | [Contains Duplicate](https://leetcode.com/problems/contains-duplicate) | `EASY` | `P0` | 10m | Fundamental set-based duplicate detection and hash complexity. |
| 004 | [Valid Anagram](https://leetcode.com/problems/valid-anagram) | `EASY` | `P0` | 15m | Character frequency array counting vs sorting complexity comparison. |
| 005 | [Remove Duplicates from Sorted Array](https://leetcode.com/problems/remove-duplicates-from-sorted-array) | `EASY` | `P1` | 15m | In-place two-pointer array compaction on sorted boundaries. |
| 006 | [Move Zeroes](https://leetcode.com/problems/move-zeroes) | `EASY` | `P1` | 15m | Non-zero compaction preserving relative element order. |
| 007 | [Squares of a Sorted Array](https://leetcode.com/problems/squares-of-a-sorted-array) | `EASY` | `P1` | 15m | Two pointers from opposite ends exploiting absolute magnitude symmetry. |
| 008 | [Missing Number](https://leetcode.com/problems/missing-number) | `EASY` | `P1` | 15m | Arithmetic Gauss sum formula vs XOR cancellation invariance. |
| 009 | [Majority Element](https://leetcode.com/problems/majority-element) | `EASY` | `P0` | 15m | Boyer-Moore voting algorithm for linear time O(1) space majority detection. |
| 010 | [Merge Sorted Array](https://leetcode.com/problems/merge-sorted-array) | `EASY` | `P1` | 15m | Three-pointer backwards merging into pre-allocated memory buffer. |

### Stage 02: Arrays & Hashing

*Frequency maps, set lookups, duplicate detection, Two-Sum hash matching, prefix/suffix transforms, and majority reasoning.*

| Seq | Problem Title | Difficulty | Priority | Target | Reason |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 011 | [Group Anagrams](https://leetcode.com/problems/group-anagrams) | `MEDIUM` | `P0` | 20m | Categorizing string equivalence classes using canonical sorted or count tuples as hash keys. |
| 012 | [Top K Frequent Elements](https://leetcode.com/problems/top-k-frequent-elements) | `MEDIUM` | `P0` | 25m | Frequency mapping combined with bucket sort or min-heap for linear/log-linear selection. |
| 013 | [Product of Array Except Self](https://leetcode.com/problems/product-of-array-except-self) | `MEDIUM` | `P0` | 25m | Prefix and suffix product passes without division in O(1) auxiliary space. |
| 014 | [Valid Sudoku](https://leetcode.com/problems/valid-sudoku) | `MEDIUM` | `P1` | 25m | Multidimensional hash set tracking for rows, columns, and 3x3 sub-boxes. |
| 015 | [Encode and Decode Strings](https://leetcode.com/problems/encode-and-decode-strings) | `MEDIUM` | `P1` | 25m | Length-prefixed chunk encoding to handle arbitrary delimiter collisions. |
| 016 | [Longest Consecutive Sequence](https://leetcode.com/problems/longest-consecutive-sequence) | `MEDIUM` | `P0` | 25m | Hash set sequence exploration by identifying sequence roots in O(N) amortized time. |
| 017 | [Sort Colors](https://leetcode.com/problems/sort-colors) | `MEDIUM` | `P1` | 20m | Dutch National Flag three-way partitioning algorithm in single pass. |
| 018 | [Next Permutation](https://leetcode.com/problems/next-permutation) | `MEDIUM` | `P1` | 30m | Lexicographical permutation generation via suffix pivot identification and reversal. |
| 019 | [Rotate Image](https://leetcode.com/problems/rotate-image) | `MEDIUM` | `P1` | 25m | In-place 2D matrix manipulation via transpose and horizontal reflection. |
| 020 | [Spiral Matrix](https://leetcode.com/problems/spiral-matrix) | `MEDIUM` | `P1` | 25m | Four-boundary contraction simulation for 2D matrix traversal. |
| 021 | [Set Matrix Zeroes](https://leetcode.com/problems/set-matrix-zeroes) | `MEDIUM` | `P1` | 25m | State compression using first row and column markers for O(1) space zeroing. |
| 022 | [Brick Wall](https://leetcode.com/problems/brick-wall) | `MEDIUM` | `P2` | 25m | Cumulative width hash map to minimize crossed vertical line segments. |

### Stage 03: Strings & Pattern Recognition

*Character frequency arrays, palindrome symmetry, anagram verification, and string transformation fundamentals.*

| Seq | Problem Title | Difficulty | Priority | Target | Reason |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 023 | [Valid Palindrome](https://leetcode.com/problems/valid-palindrome) | `EASY` | `P0` | 15m | Alphanumeric normalization and opposite-end pointer convergence. |
| 024 | [Longest Common Prefix](https://leetcode.com/problems/longest-common-prefix) | `EASY` | `P1` | 15m | Horizontal vs vertical character scanning across string arrays. |
| 025 | [String to Integer (atoi)](https://leetcode.com/problems/string-to-integer-atoi) | `MEDIUM` | `P1` | 25m | State machine parsing with whitespace handling, signs, and 32-bit integer overflow clamping. |
| 026 | [Zigzag Conversion](https://leetcode.com/problems/zigzag-conversion) | `MEDIUM` | `P2` | 20m | Directional row buffer simulation and cyclic period index computation. |
| 027 | [Roman to Integer](https://leetcode.com/problems/roman-to-integer) | `EASY` | `P1` | 15m | Subtractive numeral notation lookup through sequential lookahead. |
| 028 | [Integer to Roman](https://leetcode.com/problems/integer-to-roman) | `MEDIUM` | `P1` | 20m | Greedy value-symbol mapping from highest to lowest Roman denominations. |
| 029 | [Count and Say](https://leetcode.com/problems/count-and-say) | `MEDIUM` | `P1` | 20m | Run-length encoding string generation through iterative simulation. |
| 030 | [Find the Index of the First Occurrence in a String](https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string) | `EASY` | `P1` | 25m | Sliding window substring matching and Knuth-Morris-Pratt (KMP) failure table fundamentals. |
| 031 | [Repeated DNA Sequences](https://leetcode.com/problems/repeated-dna-sequences) | `MEDIUM` | `P2` | 25m | Fixed-length 10-mer rolling hash or bitmask encoding for duplicate substring detection. |
| 032 | [Valid Parenthesis String](https://leetcode.com/problems/valid-parenthesis-string) | `MEDIUM` | `P0` | 30m | Two-pointer min/max open bracket range tracking for wildcard resolution. |

### Stage 04: Two Pointers & Sliding Window

*Opposite-direction and same-direction pointer strategies, fixed-size windows, and variable-size dynamic boundary expansion.*

| Seq | Problem Title | Difficulty | Priority | Target | Reason |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 033 | [Two Sum II - Input Array Is Sorted](https://leetcode.com/problems/two-sum-ii-input-array-is-sorted) | `MEDIUM` | `P0` | 15m | Monotonic sorted search space two-pointer narrowing in O(1) space. |
| 034 | [3Sum](https://leetcode.com/problems/3sum) | `MEDIUM` | `P0` | 25m | Fixing one element and reducing to Two Sum II with duplicate avoidance. |
| 035 | [3Sum Closest](https://leetcode.com/problems/3sum-closest) | `MEDIUM` | `P1` | 25m | Tracking minimum absolute distance within sorted two-pointer traversal. |
| 036 | [4Sum](https://leetcode.com/problems/4sum) | `MEDIUM` | `P1` | 30m | Generalizing K-Sum via recursive nested pointer loops with duplicate skipping. |
| 037 | [Container With Most Water](https://leetcode.com/problems/container-with-most-water) | `MEDIUM` | `P0` | 20m | Greedy two-pointer shrinking by always advancing the shorter limiting wall. |
| 038 | [Trapping Rain Water](https://leetcode.com/problems/trapping-rain-water) | `HARD` | `P0` | 35m | Two-pointer max left/right boundary tracking for O(N) time O(1) space volume integration. |
| 039 | [Longest Substring Without Repeating Characters](https://leetcode.com/problems/longest-substring-without-repeating-characters) | `MEDIUM` | `P0` | 25m | Variable-length sliding window with hash map jump-forward index on repeat. |
| 040 | [Longest Repeating Character Replacement](https://leetcode.com/problems/longest-repeating-character-replacement) | `MEDIUM` | `P0` | 30m | Sliding window with max frequency invariant where (window - maxFreq <= k). |
| 041 | [Permutation in String](https://leetcode.com/problems/permutation-in-string) | `MEDIUM` | `P0` | 25m | Fixed-size sliding window frequency matching with match counter optimization. |
| 042 | [Find All Anagrams in a String](https://leetcode.com/problems/find-all-anagrams-in-a-string) | `MEDIUM` | `P1` | 25m | Sliding window collecting all starting indices with matching frequency profile. |
| 043 | [Minimum Window Substring](https://leetcode.com/problems/minimum-window-substring) | `HARD` | `P0` | 40m | Classic variable sliding window with target character frequency and formed condition. |
| 044 | [Sliding Window Maximum](https://leetcode.com/problems/sliding-window-maximum) | `HARD` | `P0` | 35m | Monotonic decreasing deque maintaining candidate maxima in O(N) total time. |
| 045 | [Fruit Into Baskets](https://leetcode.com/problems/fruit-into-baskets) | `MEDIUM` | `P1` | 25m | At most 2 distinct elements sliding window pattern. |
| 046 | [Max Consecutive Ones III](https://leetcode.com/problems/max-consecutive-ones-iii) | `MEDIUM` | `P1` | 25m | Sliding window with at most K zero flips. |

### Stage 05: Prefix Sum & Intervals

*Cumulative sum lookups, subarray difference arrays, interval sorting, merging, and overlap detection.*

| Seq | Problem Title | Difficulty | Priority | Target | Reason |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 047 | [Range Sum Query - Immutable](https://leetcode.com/problems/range-sum-query-immutable) | `EASY` | `P0` | 15m | Static 1D prefix sum array enabling O(1) range sum queries. |
| 048 | [Find Pivot Index](https://leetcode.com/problems/find-pivot-index) | `EASY` | `P0` | 15m | Equilibrium index discovery comparing left sum to total minus current element. |
| 049 | [Subarray Sum Equals K](https://leetcode.com/problems/subarray-sum-equals-k) | `MEDIUM` | `P0` | 30m | Prefix sum hash map counting historical complements for negative-compatible subarray queries. |
| 050 | [Continuous Subarray Sum](https://leetcode.com/problems/continuous-subarray-sum) | `MEDIUM` | `P2` | 30m | Modulo prefix sum hash map tracking earliest remainder index for divisibility. |
| 051 | [Range Sum Query 2D - Immutable](https://leetcode.com/problems/range-sum-query-2d-immutable) | `MEDIUM` | `P1` | 25m | 2D inclusion-exclusion principle for matrix rectangle subquery in O(1). |
| 052 | [Merge Intervals](https://leetcode.com/problems/merge-intervals) | `MEDIUM` | `P0` | 25m | Sort by start time and greedily merge overlapping intervals. |
| 053 | [Insert Interval](https://leetcode.com/problems/insert-interval) | `MEDIUM` | `P0` | 25m | Linear three-stage partitioning: before overlap, overlapping merge, after overlap. |
| 054 | [Non-overlapping Intervals](https://leetcode.com/problems/non-overlapping-intervals) | `MEDIUM` | `P0` | 25m | Greedy interval scheduling by sorting by earliest end time to minimize removals. |
| 055 | [Minimum Number of Arrows to Burst Balloons](https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons) | `MEDIUM` | `P1` | 25m | Finding mutual intersection points across overlapping ranges. |
| 056 | [Meeting Rooms](https://leetcode.com/problems/meeting-rooms) | `EASY` | `P1` | 15m | Pairwise overlap verification via sorted start times. |
| 057 | [Meeting Rooms II](https://leetcode.com/problems/meeting-rooms-ii) | `MEDIUM` | `P0` | 30m | Chronological event sweep line or min-heap to determine peak room concurrency. |
| 058 | [Car Pooling](https://leetcode.com/problems/car-pooling) | `MEDIUM` | `P1` | 25m | Difference array bucket accumulation for capacity checking across distance. |
| 059 | [Corporate Flight Bookings](https://leetcode.com/problems/corporate-flight-bookings) | `MEDIUM` | `P2` | 25m | Difference array technique for batch range additions with single prefix scan. |

### Stage 06: Binary Search

*Logarithmic search boundaries, first/last occurrences, search in rotated sorted arrays, and binary search on answer spaces.*

| Seq | Problem Title | Difficulty | Priority | Target | Reason |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 060 | [Binary Search](https://leetcode.com/problems/binary-search) | `EASY` | `P0` | 10m | Canonical logarithmic search with overflow-safe midpoint calculation. |
| 061 | [Search Insert Position](https://leetcode.com/problems/search-insert-position) | `EASY` | `P1` | 15m | Lower bound / insertion point invariant when target is absent. |
| 062 | [Find First and Last Position of Element in Sorted Array](https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array) | `MEDIUM` | `P0` | 25m | Dual binary search for left and right boundary confirmation. |
| 063 | [Search a 2D Matrix](https://leetcode.com/problems/search-a-2d-matrix) | `MEDIUM` | `P0` | 20m | Flattened 1D coordinate mapping onto 2D row/col in sorted matrix. |
| 064 | [Search a 2D Matrix II](https://leetcode.com/problems/search-a-2d-matrix-ii) | `MEDIUM` | `P1` | 25m | Staircase search starting from top-right or bottom-left corner. |
| 065 | [Find Minimum in Rotated Sorted Array](https://leetcode.com/problems/find-minimum-in-rotated-sorted-array) | `MEDIUM` | `P0` | 25m | Binary search on unsorted side to locate the rotation inflection pivot. |
| 066 | [Search in Rotated Sorted Array](https://leetcode.com/problems/search-in-rotated-sorted-array) | `MEDIUM` | `P0` | 30m | Identifying which half is sorted and determining if target falls inside it. |
| 067 | [Koko Eating Bananas](https://leetcode.com/problems/koko-eating-bananas) | `MEDIUM` | `P0` | 30m | Canonical binary search on answer space using monotonic feasibility function. |
| 068 | [Capacity To Ship Packages Within D Days](https://leetcode.com/problems/capacity-to-ship-packages-within-d-days) | `MEDIUM` | `P1` | 30m | Binary search on min/max capacity with greedy daily load validation. |
| 069 | [Split Array Largest Sum](https://leetcode.com/problems/split-array-largest-sum) | `HARD` | `P1` | 35m | Binary search on max subarray sum bound with greedy partition count. |
| 070 | [Time Based Key-Value Store](https://leetcode.com/problems/time-based-key-value-store) | `MEDIUM` | `P0` | 30m | Hash map of sorted timestamp arrays queried with rightmost binary search. |
| 071 | [Median of Two Sorted Arrays](https://leetcode.com/problems/median-of-two-sorted-arrays) | `HARD` | `P0` | 45m | Binary search on partition split of smaller array in O(log(min(N, M))). |

### Stage 07: Linked Lists

*Pointer manipulation, in-place list reversal, fast/slow pointer cycle detection, sorted list merging, and reordering.*

| Seq | Problem Title | Difficulty | Priority | Target | Reason |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 072 | [Reverse Linked List](https://leetcode.com/problems/reverse-linked-list) | `EASY` | `P0` | 15m | In-place iterative pointer reversal using prev, curr, and next. |
| 073 | [Merge Two Sorted Lists](https://leetcode.com/problems/merge-two-sorted-lists) | `EASY` | `P0` | 15m | Dummy head node sentinel pattern for clean two-list splicing. |
| 074 | [Linked List Cycle](https://leetcode.com/problems/linked-list-cycle) | `EASY` | `P0` | 15m | Floyd's Tortoise and Hare fast and slow pointer cycle detection. |
| 075 | [Linked List Cycle II](https://leetcode.com/problems/linked-list-cycle-ii) | `MEDIUM` | `P1` | 25m | Mathematical derivation to locate the exact cycle entry node. |
| 076 | [Reorder List](https://leetcode.com/problems/reorder-list) | `MEDIUM` | `P0` | 25m | Synthesis of finding middle, reversing second half, and alternating merge. |
| 077 | [Remove Nth Node From End of List](https://leetcode.com/problems/remove-nth-node-from-end-of-list) | `MEDIUM` | `P0` | 20m | Two pointers separated by N nodes for one-pass end deletion. |
| 078 | [Copy List with Random Pointer](https://leetcode.com/problems/copy-list-with-random-pointer) | `MEDIUM` | `P0` | 30m | Deep copy with random references via hash map or interweaved nodes. |
| 079 | [Add Two Numbers](https://leetcode.com/problems/add-two-numbers) | `MEDIUM` | `P0` | 25m | Digit-by-digit addition with carry propagation on linked structures. |
| 080 | [Find the Duplicate Number](https://leetcode.com/problems/find-the-duplicate-number) | `MEDIUM` | `P0` | 25m | Treating array values as linked list pointers and finding cycle entrance. |
| 081 | [Intersection of Two Linked Lists](https://leetcode.com/problems/intersection-of-two-linked-lists) | `EASY` | `P1` | 20m | Two pointer switching head tracks to align equal path lengths. |
| 082 | [Palindrome Linked List](https://leetcode.com/problems/palindrome-linked-list) | `EASY` | `P1` | 20m | Finding middle, reversing second half, and checking value symmetry in O(1) space. |
| 083 | [Reverse Nodes in k-Group](https://leetcode.com/problems/reverse-nodes-in-k-group) | `HARD` | `P0` | 40m | Sublist length verification and iterative segment reversal with pointer relinking. |

### Stage 08: Stacks & Queues

*LIFO evaluation, parentheses validation, monotonic stack next-greater-element, histogram reasoning, and FIFO queue deque structures.*

| Seq | Problem Title | Difficulty | Priority | Target | Reason |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 084 | [Valid Parentheses](https://leetcode.com/problems/valid-parentheses) | `EASY` | `P0` | 15m | LIFO matching of opening and closing bracket types. |
| 085 | [Min Stack](https://leetcode.com/problems/min-stack) | `MEDIUM` | `P0` | 20m | Dual stack or paired tuple tracking for O(1) minimum retrieval. |
| 086 | [Evaluate Reverse Polish Notation](https://leetcode.com/problems/evaluate-reverse-polish-notation) | `MEDIUM` | `P0` | 20m | Postfix mathematical evaluation via operand stack processing. |
| 087 | [Daily Temperatures](https://leetcode.com/problems/daily-temperatures) | `MEDIUM` | `P0` | 25m | Monotonic decreasing stack to find next greater element distance in O(N). |
| 088 | [Next Greater Element I](https://leetcode.com/problems/next-greater-element-i) | `EASY` | `P1` | 20m | Monotonic stack coupled with hash map lookup for subset queries. |
| 089 | [Next Greater Element II](https://leetcode.com/problems/next-greater-element-ii) | `MEDIUM` | `P1` | 25m | Circular array simulation via 2N modulo pass with monotonic stack. |
| 090 | [Car Fleet](https://leetcode.com/problems/car-fleet) | `MEDIUM` | `P1` | 30m | Sorting by starting position and evaluating target arrival times using a stack. |
| 091 | [Largest Rectangle in Histogram](https://leetcode.com/problems/largest-rectangle-in-histogram) | `HARD` | `P0` | 40m | Monotonic increasing stack identifying width boundaries on pop. |
| 092 | [Implement Queue using Stacks](https://leetcode.com/problems/implement-queue-using-stacks) | `EASY` | `P1` | 20m | Two-stack amortized O(1) FIFO queue implementation. |
| 093 | [Simplify Path](https://leetcode.com/problems/simplify-path) | `MEDIUM` | `P1` | 25m | Unix file path normalization handling '.', '..', and empty segments. |
| 094 | [Basic Calculator II](https://leetcode.com/problems/basic-calculator-ii) | `MEDIUM` | `P1` | 35m | Operator precedence evaluation using stack without full parenthesis parsing. |

### Stage 09: Recursion & Backtracking

*Recursive decision trees, state rollbacks, subsets, permutations, combinations, and constrained search spaces.*

| Seq | Problem Title | Difficulty | Priority | Target | Reason |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 095 | [Subsets](https://leetcode.com/problems/subsets) | `MEDIUM` | `P0` | 20m | Include/exclude binary decision tree state exploration. |
| 096 | [Subsets II](https://leetcode.com/problems/subsets-ii) | `MEDIUM` | `P1` | 25m | Sorting array to skip duplicate decision branches at the same tree depth. |
| 097 | [Combination Sum](https://leetcode.com/problems/combination-sum) | `MEDIUM` | `P0` | 25m | Unbounded element reuse backtracking with target remainder decrement. |
| 098 | [Combination Sum II](https://leetcode.com/problems/combination-sum-ii) | `MEDIUM` | `P1` | 30m | Single-use elements with duplicate avoidance via sorted branching. |
| 099 | [Permutations](https://leetcode.com/problems/permutations) | `MEDIUM` | `P0` | 25m | Generating all element orderings using boolean visited array or in-place swap. |
| 100 | [Permutations II](https://leetcode.com/problems/permutations-ii) | `MEDIUM` | `P1` | 30m | Permutation generation with duplicates using sorting and precedence rules. |
| 101 | [Word Search](https://leetcode.com/problems/word-search) | `MEDIUM` | `P0` | 30m | 2D grid DFS backtracking with in-place cell marking and restoration. |
| 102 | [Palindrome Partitioning](https://leetcode.com/problems/palindrome-partitioning) | `MEDIUM` | `P1` | 30m | Partitioning string prefixes verified as palindromes into complete paths. |
| 103 | [Letter Combinations of a Phone Number](https://leetcode.com/problems/letter-combinations-of-a-phone-number) | `MEDIUM` | `P0` | 20m | Cartesian product generation from digit-to-char mapping. |
| 104 | [Generate Parentheses](https://leetcode.com/problems/generate-parentheses) | `MEDIUM` | `P0` | 25m | Constrained backtracking with open < n and close < open validity bounds. |
| 105 | [N-Queens](https://leetcode.com/problems/n-queens) | `HARD` | `P1` | 40m | Column and diagonal conflict set tracking on NxN chessboard. |
| 106 | [Sudoku Solver](https://leetcode.com/problems/sudoku-solver) | `HARD` | `P2` | 45m | Exhaustive 9x9 constraint satisfaction with row, col, and box validity. |

### Stage 10: Trees & Binary Search Trees

*Depth-first search, breadth-first level order traversal, tree depth, diameter, Lowest Common Ancestor, and BST order properties.*

| Seq | Problem Title | Difficulty | Priority | Target | Reason |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 107 | [Invert Binary Tree](https://leetcode.com/problems/invert-binary-tree) | `EASY` | `P0` | 10m | Base recursive tree DFS swapping left and right subtrees. |
| 108 | [Maximum Depth of Binary Tree](https://leetcode.com/problems/maximum-depth-of-binary-tree) | `EASY` | `P0` | 15m | Postorder bottom-up height aggregation: 1 + max(left, right). |
| 109 | [Diameter of Binary Tree](https://leetcode.com/problems/diameter-of-binary-tree) | `EASY` | `P0` | 20m | Tracking global path maxima while returning single-branch height. |
| 110 | [Balanced Binary Tree](https://leetcode.com/problems/balanced-binary-tree) | `EASY` | `P0` | 20m | Bottom-up height calculation returning -1 early on balance violation. |
| 111 | [Same Tree](https://leetcode.com/problems/same-tree) | `EASY` | `P0` | 15m | Simultaneous dual-tree recursive structural and value equality. |
| 112 | [Subtree of Another Tree](https://leetcode.com/problems/subtree-of-another-tree) | `EASY` | `P1` | 20m | Composing full tree traversal with identical tree verification. |
| 113 | [Lowest Common Ancestor of a Binary Search Tree](https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree) | `MEDIUM` | `P0` | 20m | Exploiting BST ordering to navigate split points in O(H) time. |
| 114 | [Lowest Common Ancestor of a Binary Tree](https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree) | `MEDIUM` | `P0` | 25m | General binary tree LCA using bottom-up target presence propagation. |
| 115 | [Binary Tree Level Order Traversal](https://leetcode.com/problems/binary-tree-level-order-traversal) | `MEDIUM` | `P0` | 20m | Standard queue-based breadth-first level batching. |
| 116 | [Binary Tree Right Side View](https://leetcode.com/problems/binary-tree-right-side-view) | `MEDIUM` | `P0` | 20m | BFS level processing capturing last element or reverse preorder DFS. |
| 117 | [Count Good Nodes in Binary Tree](https://leetcode.com/problems/count-good-nodes-in-binary-tree) | `MEDIUM` | `P1` | 20m | Top-down state propagation tracking path maximum value. |
| 118 | [Validate Binary Search Tree](https://leetcode.com/problems/validate-binary-search-tree) | `MEDIUM` | `P0` | 25m | Bounded recursive interval verification (low < val < high) or inorder monotonicity. |
| 119 | [Kth Smallest Element in a BST](https://leetcode.com/problems/kth-smallest-element-in-a-bst) | `MEDIUM` | `P0` | 25m | Inorder traversal yielding sorted elements with early termination at K. |
| 120 | [Construct Binary Tree from Preorder and Inorder Traversal](https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal) | `MEDIUM` | `P0` | 35m | Root identification from preorder and subtree boundary splitting via inorder hash map. |
| 121 | [Binary Tree Maximum Path Sum](https://leetcode.com/problems/binary-tree-maximum-path-sum) | `HARD` | `P0` | 40m | Postorder path aggregation ignoring negative subtrees and updating global root sum. |
| 122 | [Serialize and Deserialize Binary Tree](https://leetcode.com/problems/serialize-and-deserialize-binary-tree) | `HARD` | `P1` | 45m | Preorder or level-order tree encoding with null sentinel tokens. |

### Stage 11: Heaps & Priority Queues

*Top-K elements, min/max heap balancing, streaming Kth largest, multi-stream sorted list merging, and running medians.*

| Seq | Problem Title | Difficulty | Priority | Target | Reason |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 123 | [Kth Largest Element in a Stream](https://leetcode.com/problems/kth-largest-element-in-a-stream) | `EASY` | `P0` | 20m | Min-heap of fixed size K maintaining running Kth largest element. |
| 124 | [Last Stone Weight](https://leetcode.com/problems/last-stone-weight) | `EASY` | `P1` | 15m | Max-heap simulation repeatedly smashing top two heaviest items. |
| 125 | [K Closest Points to Origin](https://leetcode.com/problems/k-closest-points-to-origin) | `MEDIUM` | `P0` | 25m | Max-heap of size K or QuickSelect on Euclidean distance. |
| 126 | [Kth Largest Element in an Array](https://leetcode.com/problems/kth-largest-element-in-an-array) | `MEDIUM` | `P0` | 25m | Min-heap of size K vs QuickSelect partition for linear average selection. |
| 127 | [Task Scheduler](https://leetcode.com/problems/task-scheduler) | `MEDIUM` | `P0` | 35m | Max-heap greedy task scheduling with cooldown queue or mathematical idle calculation. |
| 128 | [Design Twitter](https://leetcode.com/problems/design-twitter) | `MEDIUM` | `P1` | 40m | OOP social graph with K-way sorted stream merge of most recent tweets. |
| 129 | [Find Median from Data Stream](https://leetcode.com/problems/find-median-from-data-stream) | `HARD` | `P0` | 35m | Dual balanced heaps (max-heap for lower half, min-heap for upper half) in O(log N). |
| 130 | [Reorganize String](https://leetcode.com/problems/reorganize-string) | `MEDIUM` | `P1` | 30m | Max-heap of character frequencies placing most frequent chars alternately. |
| 131 | [Merge k Sorted Lists](https://leetcode.com/problems/merge-k-sorted-lists) | `HARD` | `P0` | 35m | Min-heap of list heads to achieve O(N log K) overall merge. |

### Stage 12: Graphs

*Adjacency lists, BFS/DFS traversal, connected components, 2D grid graphs, cycle detection, topological sorting, Dijkstra, and Union-Find.*

| Seq | Problem Title | Difficulty | Priority | Target | Reason |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 132 | [Number of Islands](https://leetcode.com/problems/number-of-islands) | `MEDIUM` | `P0` | 25m | Canonical 2D grid connected components using DFS/BFS sink modification. |
| 133 | [Max Area of Island](https://leetcode.com/problems/max-area-of-island) | `MEDIUM` | `P0` | 20m | Grid DFS aggregating component area size across cell neighbors. |
| 134 | [Clone Graph](https://leetcode.com/problems/clone-graph) | `MEDIUM` | `P0` | 25m | Graph traversal with hash map tracking cloned nodes to resolve cycles. |
| 135 | [Rotting Oranges](https://leetcode.com/problems/rotting-oranges) | `MEDIUM` | `P0` | 25m | Multi-source breadth-first search for synchronous time-step propagation. |
| 136 | [Pacific Atlantic Water Flow](https://leetcode.com/problems/pacific-atlantic-water-flow) | `MEDIUM` | `P1` | 35m | Reverse DFS from ocean boundaries finding set intersection. |
| 137 | [Surrounded Regions](https://leetcode.com/problems/surrounded-regions) | `MEDIUM` | `P1` | 30m | Boundary-connected region protection via flood-fill and inner flipping. |
| 138 | [Course Schedule](https://leetcode.com/problems/course-schedule) | `MEDIUM` | `P0` | 30m | Directed cycle detection using Kahn's in-degree BFS or 3-color DFS. |
| 139 | [Course Schedule II](https://leetcode.com/problems/course-schedule-ii) | `MEDIUM` | `P0` | 30m | Topological sorting order generation for prerequisite graph. |
| 140 | [Redundant Connection](https://leetcode.com/problems/redundant-connection) | `MEDIUM` | `P0` | 30m | Disjoint Set Union (Union-Find) with path compression and rank. |
| 141 | [Number of Provinces](https://leetcode.com/problems/number-of-provinces) | `MEDIUM` | `P1` | 20m | Adjacency matrix connected component counting via DFS or Union-Find. |
| 142 | [Graph Valid Tree](https://leetcode.com/problems/graph-valid-tree) | `MEDIUM` | `P1` | 25m | Verifying exact N-1 edges and single connected component with no cycles. |
| 143 | [Number of Connected Components in an Undirected Graph](https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph) | `MEDIUM` | `P1` | 25m | Counting disjoint sets in undirected graph. |
| 144 | [Word Ladder](https://leetcode.com/problems/word-ladder) | `HARD` | `P0` | 40m | Shortest transformation path via unweighted BFS with wildcard intermediate buckets. |
| 145 | [Network Delay Time](https://leetcode.com/problems/network-delay-time) | `MEDIUM` | `P0` | 35m | Dijkstra's shortest path algorithm using priority queue for weighted edges. |
| 146 | [Cheapest Flights Within K Stops](https://leetcode.com/problems/cheapest-flights-within-k-stops) | `MEDIUM` | `P1` | 40m | Bellman-Ford relaxation with step limit or BFS priority queue. |
| 147 | [Min Cost to Connect All Points](https://leetcode.com/problems/min-cost-to-connect-all-points) | `MEDIUM` | `P1` | 40m | Minimum Spanning Tree (MST) using Prim's algorithm or Kruskal's with Union-Find. |

### Stage 13: Greedy Algorithms

*Locally optimal choice heuristics, activity selection, jump reachability, and sorting-assisted greedy decisions.*

| Seq | Problem Title | Difficulty | Priority | Target | Reason |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 148 | [Maximum Subarray](https://leetcode.com/problems/maximum-subarray) | `MEDIUM` | `P0` | 20m | Kadane's algorithm deciding whether to extend current sum or restart. |
| 149 | [Jump Game](https://leetcode.com/problems/jump-game) | `MEDIUM` | `P0` | 20m | Maintaining running maximum reachability index across linear scan. |
| 150 | [Jump Game II](https://leetcode.com/problems/jump-game-ii) | `MEDIUM` | `P0` | 25m | BFS level window jumps advancing boundary when current reach exhausted. |
| 151 | [Gas Station](https://leetcode.com/problems/gas-station) | `MEDIUM` | `P0` | 30m | Single-pass deficit reset identifying unique starting index. |
| 152 | [Hand of Straights](https://leetcode.com/problems/hand-of-straights) | `MEDIUM` | `P1` | 25m | Greedy consecutive sequence formation from sorted frequency map. |
| 153 | [Partition Labels](https://leetcode.com/problems/partition-labels) | `MEDIUM` | `P0` | 25m | Pre-recording last character occurrences and expanding interval partition limit. |
| 154 | [Merge Triplets to Form Target Triplet](https://leetcode.com/problems/merge-triplets-to-form-target-triplet) | `MEDIUM` | `P1` | 25m | Filtering out invalid oversized triplets and verifying coordinate coverage. |
| 155 | [Assign Cookies](https://leetcode.com/problems/assign-cookies) | `EASY` | `P2` | 15m | Two pointer sorting greedy match of smallest sufficient cookie to child greed. |
| 156 | [Candy](https://leetcode.com/problems/candy) | `HARD` | `P1` | 35m | Two-pass forward and backward rating slope comparison. |
| 157 | [Lemonade Change](https://leetcode.com/problems/lemonade-change) | `EASY` | `P2` | 15m | Greedy change giving prioritizing larger denominations to preserve smaller bills. |

### Stage 14: Dynamic Programming

*Optimal substructure, overlapping subproblems, 1D state transitions, 2D grid paths, 0/1 Knapsack, and Longest Common/Increasing Subsequences.*

| Seq | Problem Title | Difficulty | Priority | Target | Reason |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 158 | [Climbing Stairs](https://leetcode.com/problems/climbing-stairs) | `EASY` | `P0` | 15m | Canonical 1D dynamic programming recurrence: dp[i] = dp[i-1] + dp[i-2]. |
| 159 | [Min Cost Climbing Stairs](https://leetcode.com/problems/min-cost-climbing-stairs) | `EASY` | `P0` | 15m | 1D cost recurrence tracking minimum transition cost in O(1) space. |
| 160 | [House Robber](https://leetcode.com/problems/house-robber) | `MEDIUM` | `P0` | 20m | Non-adjacent selection recurrence: rob = max(prev1, prev2 + curr). |
| 161 | [House Robber II](https://leetcode.com/problems/house-robber-ii) | `MEDIUM` | `P0` | 25m | Circular house array decomposed into two linear House Robber subproblems. |
| 162 | [Longest Palindromic Substring](https://leetcode.com/problems/longest-palindromic-substring) | `MEDIUM` | `P0` | 25m | Expand-around-center or 2D table dp[i][j] = s[i]==s[j] && dp[i+1][j-1]. |
| 163 | [Palindromic Substrings](https://leetcode.com/problems/palindromic-substrings) | `MEDIUM` | `P1` | 20m | Counting palindrome centers across odd and even midpoints in O(N^2). |
| 164 | [Decode Ways](https://leetcode.com/problems/decode-ways) | `MEDIUM` | `P0` | 25m | 1D DP with valid single-digit and two-digit (10-26) transition validation. |
| 165 | [Coin Change](https://leetcode.com/problems/coin-change) | `MEDIUM` | `P0` | 30m | Unbounded knapsack: min coins to reach amount via dp[i] = min(dp[i-c] + 1). |
| 166 | [Maximum Product Subarray](https://leetcode.com/problems/maximum-product-subarray) | `MEDIUM` | `P0` | 30m | Tracking both running minimum and maximum to handle double negative flips. |
| 167 | [Word Break](https://leetcode.com/problems/word-break) | `MEDIUM` | `P0` | 30m | Boolean 1D prefix segmentation verified against dictionary word lengths. |
| 168 | [Longest Increasing Subsequence](https://leetcode.com/problems/longest-increasing-subsequence) | `MEDIUM` | `P0` | 35m | O(N^2) state transition vs O(N log N) patience sorting with binary search. |
| 169 | [Partition Equal Subset Sum](https://leetcode.com/problems/partition-equal-subset-sum) | `MEDIUM` | `P0` | 30m | 0/1 Knapsack boolean subset sum targeting totalSum / 2 in O(N * Target). |
| 170 | [Unique Paths](https://leetcode.com/problems/unique-paths) | `MEDIUM` | `P0` | 20m | 2D grid DP combining paths from top and left neighbors: dp[i][j] = dp[i-1][j] + dp[i][j-1]. |
| 171 | [Longest Common Subsequence](https://leetcode.com/problems/longest-common-subsequence) | `MEDIUM` | `P0` | 35m | Canonical 2D string matching: match adds 1, mismatch takes max of adjacent. |
| 172 | [Best Time to Buy and Sell Stock with Cooldown](https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown) | `MEDIUM` | `P1` | 35m | State machine DP tracking held, sold (cooldown), and reset states. |
| 173 | [Coin Change II](https://leetcode.com/problems/coin-change-ii) | `MEDIUM` | `P1` | 30m | Unbounded knapsack counting combinations by iterating coins on outer loop. |
| 174 | [Target Sum](https://leetcode.com/problems/target-sum) | `MEDIUM` | `P1` | 30m | Transforming +/- sign assignment into equivalent subset sum partitioning. |
| 175 | [Edit Distance](https://leetcode.com/problems/edit-distance) | `MEDIUM` | `P0` | 40m | Levenshtein distance: insert, delete, replace transitions in 2D table. |

### Stage 15: Bit Manipulation & Math

*Bitwise XOR cancellation, bitmasking, power-of-two tests, set-bit counting, and interview-essential arithmetic patterns.*

| Seq | Problem Title | Difficulty | Priority | Target | Reason |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 176 | [Single Number](https://leetcode.com/problems/single-number) | `EASY` | `P0` | 15m | XOR self-inversion property: A ^ A = 0, A ^ 0 = A in linear time O(1) space. |
| 177 | [Number of 1 Bits](https://leetcode.com/problems/number-of-1-bits) | `EASY` | `P0` | 15m | Brian Kernighan's algorithm clearing least significant bit via n & (n - 1). |
| 178 | [Counting Bits](https://leetcode.com/problems/counting-bits) | `EASY` | `P0` | 20m | DP recurrence combining previous bit counts: dp[i] = dp[i >> 1] + (i & 1). |
| 179 | [Reverse Bits](https://leetcode.com/problems/reverse-bits) | `EASY` | `P1` | 15m | 32-bit integer bit reversal using shift and mask accumulators. |
| 180 | [Sum of Two Integers](https://leetcode.com/problems/sum-of-two-integers) | `MEDIUM` | `P1` | 20m | Hardware adder simulation using XOR for sum and AND with shift for carry. |
| 181 | [Reverse Integer](https://leetcode.com/problems/reverse-integer) | `MEDIUM` | `P1` | 20m | Digit extraction with lookahead check for 32-bit signed overflow. |
| 182 | [Pow(x, n)](https://leetcode.com/problems/powx-n) | `MEDIUM` | `P1` | 25m | Binary exponentiation (divide-and-conquer) reducing O(N) multiplication to O(log N). |
| 183 | [Multiply Strings](https://leetcode.com/problems/multiply-strings) | `MEDIUM` | `P2` | 30m | Manual grade-school multiplication digit simulation on string arrays. |

### Stage 16: Mixed Interview Patterns

*Synthesized problems requiring unprompted pattern recognition, multi-technique combination, and end-to-end interview problem solving.*

| Seq | Problem Title | Difficulty | Priority | Target | Reason |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 184 | [LRU Cache](https://leetcode.com/problems/lru-cache) | `MEDIUM` | `P0` | 35m | Combining doubly linked list with hash map for O(1) get and put eviction. |
| 185 | [LFU Cache](https://leetcode.com/problems/lfu-cache) | `HARD` | `P1` | 45m | Dual hash maps with frequency-indexed doubly linked lists for least-frequently-used eviction. |
| 186 | [Design In-Memory File System](https://leetcode.com/problems/design-in-memory-file-system) | `HARD` | `P2` | 45m | Trie-style hierarchy with directory/file node discrimination. |
| 187 | [Word Ladder II](https://leetcode.com/problems/word-ladder-ii) | `HARD` | `P1` | 50m | BFS shortest path DAG generation followed by DFS backtracking path reconstruction. |
| 188 | [Regular Expression Matching](https://leetcode.com/problems/regular-expression-matching) | `HARD` | `P1` | 45m | 2D dynamic programming handling '.' any char and '*' zero-or-more preceding character. |
| 189 | [Alien Dictionary](https://leetcode.com/problems/alien-dictionary) | `HARD` | `P0` | 40m | Lexicographical character graph construction and topological sorting with cycle detection. |

