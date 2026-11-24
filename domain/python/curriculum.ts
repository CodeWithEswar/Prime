import type { PythonInterviewQuestion } from "./types";

export const PYTHON_TOPIC_NAMES: Record<string, string> = {
  "python-basics": "Python Foundations & Reference Semantics",
  "python-oop": "Python OOP & Dunder Protocol Methods",
  "python-generators": "Generators & Memory-Efficient Streaming",
  "python-iterators": "Custom Iterators & Iteration Protocols",
  "python-decorators": "Decorators & Top-Down DP Memoization",
  "big-o": "Asymptotic Complexity & Big-O Notation",
  "dsa-foundations": "Algorithmic Foundations & Array Memory",
  "python-collections": "Collections Module (Counter, deque, defaultdict)",
  "dynamic-arrays": "Dynamic Arrays & Amortized Doubling",
  "binary-search": "Binary Search & Partitioning Templates",
  "two-pointers": "Two Pointers Convergence & Inward Traversal",
  "sliding-window": "Variable & Fixed Sliding Window Patterns",
  "binary-search-answer": "Binary Search on Monotonic Answer Space",
  "linked-lists": "Singly Linked Lists & In-Place Reversal",
  "lru-cache": "LRU Cache Architecture (Hash Map + Doubly Linked List)",
  "floyd-cycle": "Floyd's Tortoise & Hare Cycle Detection",
  "stacks-queues": "LIFO Stacks & FIFO Queues with deque",
  "monotonic-stack": "Monotonic Decreasing & Increasing Stacks",
  "tree-traversals": "Binary Tree DFS (In/Pre/Post) & BFS Traversals",
  "bst": "Binary Search Tree Validation & Invariants",
  "lca": "Lowest Common Ancestor in Trees & BSTs",
  "heaps": "Min-Heaps & Priority Queues via heapq",
  "top-k-heaps": "Top-K Streaming Elements & Median Balancing",
  "recursion-mental-model": "State Space Trees & Call Stack Visualization",
  "backtracking-subsets": "Backtracking: Subsets & Binary Decisions",
  "backtracking-combinations": "Combination Sum & Permutation Pruning",
  "grid-backtracking": "2D Grid Backtracking & Word Search",
  "tries": "Prefix Trees (Tries) & Wildcard Search",
  "graph-representation": "Graph Representations with defaultdict",
  "graph-bfs": "BFS Shortest Path in Unweighted Graphs",
  "graph-dfs": "DFS Connected Components & Cycle Detection",
  "topological-sort": "Kahn's Algorithm & Topological Ordering",
  "dijkstra": "Dijkstra's Algorithm with Min-Heap heapq",
  "union-find": "Disjoint Set Union (DSU) & Redundant Connection",
  "dp-1d": "1D Dynamic Programming & State Compression",
  "dp-coin-change": "Coin Change & Unbounded Knapsack",
  "dp-lis": "Longest Increasing Subsequence & Patience Sorting",
  "dp-2d-grid": "2D Grid Dynamic Programming & Unique Paths",
  "dp-knapsack": "0/1 Knapsack & Subset Sum Tabulation",
  "dp-lcs": "Longest Common Subsequence (LCS) Grid DP",
  "greedy-jump-game": "Greedy Reachability & Goalpost Shifting",
  "intervals": "Interval Merging & Meeting Rooms Scheduling",
  "bit-manipulation": "Bitwise Tricks, XOR & Set Bitmasks",
};

export const PYTHON_STAGES_CURRICULUM = [
  { dayNumber: 1, title: "Python Modern Syntax & Language Internals", estimatedMinutes: 396 },
  { dayNumber: 2, title: "Algorithmic Complexity & Python Built-in Containers", estimatedMinutes: 256 },
  { dayNumber: 3, title: "Two Pointers, Sliding Window & Binary Search", estimatedMinutes: 84 },
  { dayNumber: 4, title: "Linear Data Structures: Linked Lists, Stacks & Queues", estimatedMinutes: 114 },
  { dayNumber: 5, title: "Non-Linear Structures: Trees, BSTs & Heap/Priority Queues", estimatedMinutes: 128 },
  { dayNumber: 6, title: "Recursion, Backtracking & Prefix Trees (Tries)", estimatedMinutes: 127 },
  { dayNumber: 7, title: "Graphs: BFS, DFS, Shortest Paths & Disjoint Set Union", estimatedMinutes: 170 },
  { dayNumber: 8, title: "Dynamic Programming & Greedy Algorithms in Python", estimatedMinutes: 242 },
];

export const PYTHON_STAGE_INTERVIEWS: Record<number, PythonInterviewQuestion[]> = {
  1: [
    {
      id: "py-int-1",
      category: "Python Internals",
      importance: "Critical",
      question: "How does Python handle variable assignment and memory management under the hood?",
      answer:
        "Variables in Python are object references pointing to objects allocated on the private heap. Python uses reference counting combined with a generational cyclic garbage collector (gc module) to reclaim unreachable cyclic objects. Small integers (-5 to 256) and interned strings are cached in memory.",
      codeSnippet: "a = [1, 2, 3]\nb = a\nb.append(4)\nassert a == [1, 2, 3, 4]  # Both point to the exact same heap object",
    },
    {
      id: "py-int-2",
      category: "Python Protocols",
      importance: "High",
      question: "Why should we implement __eq__ and __hash__ together when storing custom objects in sets or dicts?",
      answer:
        "If two objects compare equal via __eq__, they MUST produce the same hash value via __hash__ to satisfy Python's hash table invariant. If you override __eq__ without defining __hash__, Python sets __hash__ = None, making the object unhashable.",
    },
  ],
  2: [
    {
      id: "py-int-3",
      category: "Algorithmic Complexity",
      importance: "Critical",
      question: "What is the amortized time complexity of appending to a Python list, and how is it proven?",
      answer:
        "Amortized O(1). When a list exceeds capacity, Python allocates a new contiguous block with over-allocation (approximately growing by 1.125x + 3 to 6 slots) and copies elements. Since doubling costs O(n) once every n appends, the amortized cost per append is O(1).",
    },
    {
      id: "py-int-4",
      category: "Collections",
      importance: "High",
      question: "Why is pop(0) on a Python list O(n) while collections.deque.popleft() is O(1)?",
      answer:
        "Python lists are contiguous arrays: popping index 0 requires shifting all subsequent n-1 elements one position left. collections.deque is implemented as a doubly linked list of fixed-size 64-element memory blocks, allowing O(1) pointer unlinking from the head block.",
    },
  ],
  3: [
    {
      id: "py-int-5",
      category: "Search Patterns",
      importance: "Critical",
      question: "How do you avoid integer overflow and off-by-one errors in binary search in Python?",
      answer:
        "In Python, integers have arbitrary precision so overflow is rare, but standard pattern mid = left + (right - left) // 2 maintains language-agnostic correctness. Loop with while left <= right: when search space is inclusive, updating left = mid + 1 and right = mid - 1.",
      codeSnippet: "def binary_search(nums, target):\n    l, r = 0, len(nums) - 1\n    while l <= r:\n        mid = l + (r - l) // 2\n        if nums[mid] == target:\n            return mid\n        elif nums[mid] < target:\n            l = mid + 1\n        else:\n            r = mid - 1\n    return -1",
    },
  ],
  4: [
    {
      id: "py-int-6",
      category: "Data Structures",
      importance: "Critical",
      question: "How does an LRU Cache achieve O(1) get and O(1) put operations simultaneously?",
      answer:
        "By combining a hash map with a doubly linked list. The hash map maps keys to doubly linked list nodes for O(1) lookup. The doubly linked list maintains access order: upon access or insertion, the node is moved to the head in O(1). Sentinel head and tail nodes avoid null pointer checks.",
    },
  ],
  5: [
    {
      id: "py-int-7",
      category: "Trees & Heaps",
      importance: "Critical",
      question: "How does Python's heapq module work and how do you implement a max-heap?",
      answer:
        "heapq implements binary min-heaps in-place on standard 0-indexed lists using array relations: parent at (i-1)//2, left child at 2i+1, right child at 2i+2. To implement a max-heap, multiply values by -1 on push and multiply by -1 when reading from pop.",
    },
  ],
  6: [
    {
      id: "py-int-8",
      category: "Backtracking",
      importance: "High",
      question: "What is the general 3-step state structure for backtracking algorithms?",
      answer:
        "1. Choose / Make Decision: mutate state (e.g. path.append(nums[i])). 2. Explore / Recurse: call backtracking function with updated parameters. 3. Unchoose / Backtrack: undo the mutation (e.g. path.pop()) to leave state clean for sibling branches.",
    },
  ],
  7: [
    {
      id: "py-int-9",
      category: "Graphs",
      importance: "Critical",
      question: "When should you use BFS vs Dijkstra vs Bellman-Ford for shortest paths?",
      answer:
        "Use BFS when edge weights are unweighted / uniform 1 (O(V + E)). Use Dijkstra with min-heap when edge weights are non-negative (O((V + E) log V)). Use Bellman-Ford when graphs may contain negative edge weights or to detect negative cycles (O(V * E)).",
    },
  ],
  8: [
    {
      id: "py-int-10",
      category: "Dynamic Programming",
      importance: "Critical",
      question: "What are the two core prerequisites for a problem to be solvable via Dynamic Programming?",
      answer:
        "1. Optimal Substructure: the optimal solution to the global problem can be constructed from optimal solutions to its subproblems. 2. Overlapping Subproblems: the recursive space visits the same subproblems repeatedly rather than generating entirely new subproblems.",
    },
  ],
};
