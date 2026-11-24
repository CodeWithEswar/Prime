import fs from "node:fs";
import path from "node:path";

const PYTHON_STAGES = [
  {
    stageNumber: 1,
    id: "stage-1-python-internals",
    title: "Python Modern Syntax & Language Internals",
    subtitle: "Memory Model, OOP, Generators, Iterators & Decorators in Python",
    description:
      "Master core Python engineering rigor for algorithmic problem solving. Understand Python's reference model, memory management, OOP dunder methods, generator streaming pipelines, iterator protocols, and memoization decorators.",
    level: "Beginner to Intermediate",
    estimatedMinutes: 396,
    learningOutcomes: [
      "Master Python data model: mutability, identity (is vs ==), and garbage collection",
      "Author clean OOP classes using dunder methods (__init__, __repr__, __eq__, __lt__) for custom heap/sort order",
      "Implement memory-efficient streaming algorithms using generators and yield",
      "Apply decorators and functools.lru_cache for automated top-down DP memoization"
    ],
    modules: [
      {
        id: "module-1-1-syntax-core",
        title: "Python Foundation & Language Model",
        summary: "Modern Python 3 syntax, type hints, reference semantics, and control structures.",
        videos: [
          {
            position: 1,
            youtubeVideoId: "rfscVS0vtbw",
            title: "Learn Python - Full Course for Beginners [English Tutorial]",
            channel: "freeCodeCamp.org",
            canonicalUrl: "https://www.youtube.com/watch?v=rfscVS0vtbw",
            difficulty: "Easy",
            importance: "Critical",
            topicSlug: "python-basics",
            estimatedMinutes: 260,
            keyTakeaways: [
              "Python syntax, dynamic typing, and fundamental control flow",
              "Functions, scope, error handling with try/except, and file I/O",
              "Standard library foundation and Python idioms (PEP 8)"
            ]
          },
          {
            position: 2,
            youtubeVideoId: "ZDa-Z5JzLYM",
            title: "Python OOP - Working with Classes, Instances & Dunder Methods",
            channel: "Corey Schafer",
            canonicalUrl: "https://www.youtube.com/watch?v=ZDa-Z5JzLYM",
            difficulty: "Medium",
            importance: "High",
            topicSlug: "python-oop",
            estimatedMinutes: 42,
            keyTakeaways: [
              "Class vs instance variables and self parameter semantics",
              "Overriding __eq__, __hash__, and __lt__ for comparator logic in DSA",
              "Inheritance, encapsulation, and property decorators"
            ]
          }
        ]
      },
      {
        id: "module-1-2-advanced-internals",
        title: "Generators, Iterators & Performance Protocols",
        summary: "Memory optimization using generator expressions, custom iterables, and caching decorators.",
        videos: [
          {
            position: 3,
            youtubeVideoId: "bD05uGo_sVI",
            title: "Python Generators: Memory Optimization & Stream Processing",
            channel: "Corey Schafer",
            canonicalUrl: "https://www.youtube.com/watch?v=bD05uGo_sVI",
            difficulty: "Medium",
            importance: "High",
            topicSlug: "python-generators",
            estimatedMinutes: 31,
            keyTakeaways: [
              "Lazy evaluation with yield vs eager list materialization in memory",
              "Chaining generator pipelines for processing massive streams",
              "Measuring memory footprints using sys.getsizeof"
            ]
          },
          {
            position: 4,
            youtubeVideoId: "jTYiNjvnHZY",
            title: "Python Iterators & Iterables: Custom Protocols Under the Hood",
            channel: "Corey Schafer",
            canonicalUrl: "https://www.youtube.com/watch?v=jTYiNjvnHZY",
            difficulty: "Medium",
            importance: "Medium",
            topicSlug: "python-iterators",
            estimatedMinutes: 28,
            keyTakeaways: [
              "Differentiating iterables from iterators via __iter__ and __next__",
              "Building custom range/traversal iterators for custom graph structures",
              "StopIteration protocol and Python's internal for-loop mechanism"
            ]
          },
          {
            position: 5,
            youtubeVideoId: "FsAPt_9B50U",
            title: "Python Decorators & Memoization with functools.lru_cache",
            channel: "Corey Schafer",
            canonicalUrl: "https://www.youtube.com/watch?v=FsAPt_9B50U",
            difficulty: "Medium",
            importance: "Critical",
            topicSlug: "python-decorators",
            estimatedMinutes: 35,
            keyTakeaways: [
              "Higher-order functions and closure variable binding",
              "Writing caching decorators to prevent redundant recursion calls",
              "Leveraging @functools.lru_cache(None) for instantaneous DP optimization"
            ]
          }
        ]
      }
    ]
  },
  {
    stageNumber: 2,
    id: "stage-2-complexity-containers",
    title: "Algorithmic Complexity & Python Built-in Containers",
    subtitle: "Big-O, Dynamic Arrays, Hash Tables & Collections Module",
    description:
      "Understand time and space complexity in Python. Master dynamic array resizing, hash table amortized O(1) lookups, collision resolution, and the collections module (Counter, deque, defaultdict).",
    level: "Beginner to Intermediate",
    estimatedMinutes: 256,
    learningOutcomes: [
      "Analyze Big-O time and space complexity for recursive and iterative Python code",
      "Understand dynamic array memory allocation, doubling strategy, and amortized complexity",
      "Harness collections.defaultdict, collections.Counter, and collections.deque for O(1) operations",
      "Benchmark algorithmic execution speed using timeit and cProfile"
    ],
    modules: [
      {
        id: "module-2-1-big-o",
        title: "Complexity Analysis & Asymptotic Bounds",
        summary: "Big-O notation, space complexity, call stack frames, and operation limits.",
        videos: [
          {
            position: 6,
            youtubeVideoId: "BgLTDT03QtU",
            title: "Big-O Notation & Complexity Analysis for Coding Interviews",
            channel: "NeetCode",
            canonicalUrl: "https://www.youtube.com/watch?v=BgLTDT03QtU",
            difficulty: "Easy",
            importance: "Critical",
            topicSlug: "big-o",
            estimatedMinutes: 24,
            keyTakeaways: [
              "Asymptotic upper bound (Big-O), lower bound, and tight bounds",
              "Common complexities: O(1), O(log n), O(n), O(n log n), O(2^n), O(n!)",
              "Evaluating Python list and dict operations under the hood"
            ]
          },
          {
            position: 7,
            youtubeVideoId: "pkYVOmU3MgA",
            title: "Data Structures & Algorithms in Python - Big-O to Arrays",
            channel: "freeCodeCamp.org",
            canonicalUrl: "https://www.youtube.com/watch?v=pkYVOmU3MgA",
            difficulty: "Medium",
            importance: "High",
            topicSlug: "dsa-foundations",
            estimatedMinutes: 180,
            keyTakeaways: [
              "Linear search vs binary search complexity and execution trade-offs",
              "Memory representations of contiguous arrays in Python runtime",
              "Benchmarking algorithm scalability against large input sizes"
            ]
          }
        ]
      },
      {
        id: "module-2-2-containers",
        title: "Python Collections & Array Internals",
        summary: "Deep dive into dict, set, deque, Counter, and dynamic array resizing.",
        videos: [
          {
            position: 8,
            youtubeVideoId: "kr0mpwqttM0",
            title: "Python Collections Module: Counter, deque & defaultdict Mastery",
            channel: "Corey Schafer",
            canonicalUrl: "https://www.youtube.com/watch?v=kr0mpwqttM0",
            difficulty: "Easy",
            importance: "Critical",
            topicSlug: "python-collections",
            estimatedMinutes: 32,
            keyTakeaways: [
              "collections.defaultdict to avoid KeyError in frequency counting",
              "collections.Counter for anagram and frequency comparison in O(n)",
              "collections.deque for true O(1) double-ended queue operations"
            ]
          },
          {
            position: 9,
            youtubeVideoId: "oT_kgnrI-H8",
            title: "Dynamic Arrays - Resizing, Amortized O(1) Push & Python Lists",
            channel: "NeetCode",
            canonicalUrl: "https://www.youtube.com/watch?v=oT_kgnrI-H8",
            difficulty: "Medium",
            importance: "High",
            topicSlug: "dynamic-arrays",
            estimatedMinutes: 20,
            keyTakeaways: [
              "Internal capacity vs length in dynamic array resizing",
              "Amortized cost proof for array doubling strategy",
              "Implementing a custom ResizableArray class in Python"
            ]
          }
        ]
      }
    ]
  },
  {
    stageNumber: 3,
    id: "stage-3-pointers-sliding-window",
    title: "Two Pointers, Sliding Window & Binary Search",
    subtitle: "Essential Linear Array Search & Pointer Traversal Patterns",
    description:
      "Master the foundational patterns that solve 40%+ of array interview problems: opposite directional two pointers, fast & slow pointers, fixed/variable sliding windows, and binary search on values and arrays.",
    level: "Intermediate",
    estimatedMinutes: 84,
    learningOutcomes: [
      "Implement inward and forward two-pointer traversal patterns in O(n) time",
      "Apply variable sliding windows with hash map frequency state tracking",
      "Master binary search template for exact match, lower bound, and upper bound",
      "Solve binary search on answer/solution space problems (Koko Eating Bananas)"
    ],
    modules: [
      {
        id: "module-3-1-search-patterns",
        title: "Two Pointers & Binary Search",
        summary: "Opposite directional pointer convergence and logarithmic space partitioning.",
        videos: [
          {
            position: 10,
            youtubeVideoId: "s4DPM8ct1pI",
            title: "Binary Search - Recursive & Iterative in Python (LeetCode 704)",
            channel: "NeetCode",
            canonicalUrl: "https://www.youtube.com/watch?v=s4DPM8ct1pI",
            difficulty: "Easy",
            importance: "Critical",
            topicSlug: "binary-search",
            estimatedMinutes: 18,
            keyTakeaways: [
              "Midpoint calculation avoiding integer overflow (mid = left + (right-left)//2)",
              "Loop invariants: left <= right vs left < right boundary conditions",
              "Logarithmic O(log n) time complexity proof"
            ]
          },
          {
            position: 11,
            youtubeVideoId: "7p4RwbMh2_c",
            title: "Two Pointers Technique - Valid Palindrome & Container With Most Water",
            channel: "NeetCode",
            canonicalUrl: "https://www.youtube.com/watch?v=7p4RwbMh2_c",
            difficulty: "Medium",
            importance: "Critical",
            topicSlug: "two-pointers",
            estimatedMinutes: 22,
            keyTakeaways: [
              "Greedy height elimination in Container With Most Water (O(n) time)",
              "Handling non-alphanumeric filtering with str.isalnum()",
              "Three-sum sorting and deduplication logic"
            ]
          }
        ]
      },
      {
        id: "module-3-2-window-advanced-search",
        title: "Sliding Window & Solution Space Search",
        summary: "Variable window expansion/contraction and monotone predicate search.",
        videos: [
          {
            position: 12,
            youtubeVideoId: "gqXU1UyA8pk",
            title: "Sliding Window Technique - Longest Substring Without Repeating Characters",
            channel: "NeetCode",
            canonicalUrl: "https://www.youtube.com/watch?v=gqXU1UyA8pk",
            difficulty: "Medium",
            importance: "Critical",
            topicSlug: "sliding-window",
            estimatedMinutes: 25,
            keyTakeaways: [
              "Window invariant maintenance: expanding right and shrinking left",
              "Using a set or dictionary to track character occurrences in O(1)",
              "Minimum Window Substring frequency matching condition"
            ]
          },
          {
            position: 13,
            youtubeVideoId: "U2QzBRSo2lU",
            title: "Binary Search on Search Space - Koko Eating Bananas (LeetCode 875)",
            channel: "NeetCode",
            canonicalUrl: "https://www.youtube.com/watch?v=U2QzBRSo2lU",
            difficulty: "Hard",
            importance: "High",
            topicSlug: "binary-search-answer",
            estimatedMinutes: 19,
            keyTakeaways: [
              "Identifying monotonic feasibility predicate f(speed) -> bool",
              "Setting search boundaries between min possible and max possible answers",
              "Ceiling division arithmetic in Python: (pile + speed - 1) // speed"
            ]
          }
        ]
      }
    ]
  },
  {
    stageNumber: 4,
    id: "stage-4-linked-lists-stacks-queues",
    title: "Linear Data Structures: Linked Lists, Stacks & Queues",
    subtitle: "Node Pointer Manipulation, Floyd's Cycle Detection & Monotonic Stacks",
    description:
      "Deep dive into node-based linear data structures. Master in-place pointer manipulation, doubly linked lists for LRU Cache design, Floyd's cycle detection, and monotonic stacks for Next Greater Element problems.",
    level: "Intermediate",
    estimatedMinutes: 114,
    learningOutcomes: [
      "Implement singly and doubly linked lists with dummy head nodes",
      "Detect cycles and cycle entry points with Floyd's Tortoise and Hare algorithm",
      "Architect an O(1) LRU Cache using a hash map combined with a doubly linked list",
      "Utilize monotonic decreasing and increasing stacks for histogram and temperature problems"
    ],
    modules: [
      {
        id: "module-4-1-linked-lists",
        title: "Linked Lists & Cycle Detection",
        summary: "Pointer rewiring, reversal, and two-pointer cycle detection.",
        videos: [
          {
            position: 14,
            youtubeVideoId: "G8s4t91v02I",
            title: "Singly Linked Lists - Implementation & Reversal in Python",
            channel: "NeetCode",
            canonicalUrl: "https://www.youtube.com/watch?v=G8s4t91v02I",
            difficulty: "Easy",
            importance: "Critical",
            topicSlug: "linked-lists",
            estimatedMinutes: 26,
            keyTakeaways: [
              "Defining ListNode class in Python with val and next attributes",
              "In-place iterative reversal using prev, curr, and nxt pointers",
              "Recursive reversal mental model and stack frame rollback"
            ]
          },
          {
            position: 15,
            youtubeVideoId: "fu2qHq_r1wU",
            title: "Doubly Linked Lists & LRU Cache Architecture (LeetCode 146)",
            channel: "NeetCode",
            canonicalUrl: "https://www.youtube.com/watch?v=fu2qHq_r1wU",
            difficulty: "Hard",
            importance: "Critical",
            topicSlug: "lru-cache",
            estimatedMinutes: 28,
            keyTakeaways: [
              "Dummy head and dummy tail sentinel nodes to eliminate edge cases",
              "Pairing dict[key, Node] with doubly linked list for O(1) get and put",
              "Atomic node removal and insertion at most recent position"
            ]
          },
          {
            position: 16,
            youtubeVideoId: "7p4RwbMh2_c",
            title: "Fast & Slow Pointers: Floyd's Tortoise and Hare Cycle Detection",
            channel: "NeetCode",
            canonicalUrl: "https://www.youtube.com/watch?v=7p4RwbMh2_c",
            difficulty: "Medium",
            importance: "High",
            topicSlug: "floyd-cycle",
            estimatedMinutes: 15,
            keyTakeaways: [
              "Mathematical proof of convergence when slow moves 1 step and fast moves 2",
              "Finding cycle entrance point: resetting one pointer to head",
              "Detecting cycles in arrays: Find the Duplicate Number (LeetCode 287)"
            ]
          }
        ]
      },
      {
        id: "module-4-2-stacks-queues",
        title: "Stacks, Queues & Monotonic Sequences",
        summary: "LIFO/FIFO paradigms and monotonic stack pruning.",
        videos: [
          {
            position: 17,
            youtubeVideoId: "rfeVlNL5398",
            title: "Stacks & Queues with collections.deque in Python",
            channel: "NeetCode",
            canonicalUrl: "https://www.youtube.com/watch?v=rfeVlNL5398",
            difficulty: "Easy",
            importance: "High",
            topicSlug: "stacks-queues",
            estimatedMinutes: 21,
            keyTakeaways: [
              "Why Python list pop(0) is O(n) while deque popleft() is O(1)",
              "Valid Parentheses problem with hash map bracket matching",
              "Evaluating Reverse Polish Notation using stack operand evaluation"
            ]
          },
          {
            position: 18,
            youtubeVideoId: "Dq_OBPt9gDE",
            title: "Monotonic Stack Pattern - Daily Temperatures & Next Greater Element",
            channel: "NeetCode",
            canonicalUrl: "https://www.youtube.com/watch?v=Dq_OBPt9gDE",
            difficulty: "Medium",
            importance: "Critical",
            topicSlug: "monotonic-stack",
            estimatedMinutes: 24,
            keyTakeaways: [
              "Maintaining strict monotonicity (decreasing stack to find next greater)",
              "Storing (index, value) tuples on stack to resolve distances in O(n)",
              "Largest Rectangle in Histogram monotonic boundary analysis"
            ]
          }
        ]
      }
    ]
  },
  {
    stageNumber: 5,
    id: "stage-5-trees-bst-heaps",
    title: "Non-Linear Structures: Trees, BSTs & Heap/Priority Queues",
    subtitle: "Tree Traversals, BST Validation, Lowest Common Ancestor & heapq",
    description:
      "Master hierarchical non-linear structures. Implement recursive DFS and iterative BFS tree traversals, validate BST properties, solve Lowest Common Ancestor, and harness Python's heapq for streaming Top-K problems.",
    level: "Intermediate to Advanced",
    estimatedMinutes: 128,
    learningOutcomes: [
      "Implement Preorder, Inorder, Postorder, and Level-Order traversals in Python",
      "Validate Binary Search Trees using recursive (min_val, max_val) bounds",
      "Determine Lowest Common Ancestor in binary trees and BSTs",
      "Utilize Python's heapq module for min-heaps, max-heaps, and Top-K streaming elements"
    ],
    modules: [
      {
        id: "module-5-1-binary-trees",
        title: "Binary Trees & BSTs",
        summary: "DFS recursion, BFS queue traversals, and BST invariants.",
        videos: [
          {
            position: 19,
            youtubeVideoId: "OnSn2XEQ4MY",
            title: "Binary Tree Traversals (Inorder, Preorder, Postorder, Level Order)",
            channel: "NeetCode",
            canonicalUrl: "https://www.youtube.com/watch?v=OnSn2XEQ4MY",
            difficulty: "Medium",
            importance: "Critical",
            topicSlug: "tree-traversals",
            estimatedMinutes: 32,
            keyTakeaways: [
              "Recursive depth-first traversal patterns (DFS)",
              "Iterative breadth-first traversal (BFS) using collections.deque",
              "Maximum depth and diameter of binary tree calculations"
            ]
          },
          {
            position: 20,
            youtubeVideoId: "bmaeYtlO2OE",
            title: "Binary Search Tree: Search, Insert, and Validate BST Invariants",
            channel: "NeetCode",
            canonicalUrl: "https://www.youtube.com/watch?v=bmaeYtlO2OE",
            difficulty: "Medium",
            importance: "Critical",
            topicSlug: "bst",
            estimatedMinutes: 27,
            keyTakeaways: [
              "BST property: all left subtree keys < root < all right subtree keys",
              "Validating BST using (low, high) float('-inf') / float('inf') boundaries",
              "Inorder traversal of BST yields strictly sorted order"
            ]
          },
          {
            position: 21,
            youtubeVideoId: "c9h_7n_g9aA",
            title: "Lowest Common Ancestor in Binary Trees & BSTs (LeetCode 235 & 236)",
            channel: "NeetCode",
            canonicalUrl: "https://www.youtube.com/watch?v=c9h_7n_g9aA",
            difficulty: "Medium",
            importance: "High",
            topicSlug: "lca",
            estimatedMinutes: 18,
            keyTakeaways: [
              "Exploiting BST directional divergence (p.val < root.val < q.val)",
              "General binary tree postorder bottom-up bubbling of matched nodes",
              "O(h) time complexity where h is tree height"
            ]
          }
        ]
      },
      {
        id: "module-5-2-heaps",
        title: "Heaps & Priority Queues",
        summary: "heapq module, min/max heap semantics, and Top-K frequency tracking.",
        videos: [
          {
            position: 22,
            youtubeVideoId: "Qf4a5_n2HhQ",
            title: "Heaps & Priority Queues in Python using heapq Module",
            channel: "NeetCode",
            canonicalUrl: "https://www.youtube.com/watch?v=Qf4a5_n2HhQ",
            difficulty: "Medium",
            importance: "Critical",
            topicSlug: "heaps",
            estimatedMinutes: 29,
            keyTakeaways: [
              "Python heapq creates min-heaps by default; negate values for max-heaps",
              "heapify() converts list in O(n) linear time",
              "heappush() and heappop() operate in O(log n) time"
            ]
          },
          {
            position: 23,
            youtubeVideoId: "YPTqKIgVk-v",
            title: "Top-K Frequent Elements & Kth Largest Element with Heaps",
            channel: "NeetCode",
            canonicalUrl: "https://www.youtube.com/watch?v=YPTqKIgVk-v",
            difficulty: "Medium",
            importance: "High",
            topicSlug: "top-k-heaps",
            estimatedMinutes: 22,
            keyTakeaways: [
              "Maintaining a min-heap of size K for optimal O(n log k) complexity",
              "Bucket sort alternative for O(n) linear time Top-K frequency",
              "Find Median from Data Stream using two balancing heaps"
            ]
          }
        ]
      }
    ]
  },
  {
    stageNumber: 6,
    id: "stage-6-recursion-backtracking-tries",
    title: "Recursion, Backtracking & Prefix Trees (Tries)",
    subtitle: "State Space Trees, Combinatorial Search, Pruning & Trie Autocomplete",
    description:
      "Unlock combinatorial search and prefix tree architectures. Build mental models for state space recursion trees, master backtracking decision pruning (Subsets, Combinations, N-Queens), and implement high-throughput Trie prefix trees.",
    level: "Advanced",
    estimatedMinutes: 127,
    learningOutcomes: [
      "Construct recursive state trees with explicit base cases and backtracking state undoing",
      "Prune invalid recursive search branches early to reduce exponential time complexity",
      "Implement Trie (Prefix Tree) with insert, search, and startsWith methods in Python",
      "Solve Word Search II combining Trie indexing with 2D grid backtracking"
    ],
    modules: [
      {
        id: "module-6-1-backtracking",
        title: "Backtracking & Decision Trees",
        summary: "Combinations, subsets, permutations, and search pruning.",
        videos: [
          {
            position: 24,
            youtubeVideoId: "m9bHl9Q1s-g",
            title: "Recursion Tree Mental Model & Call Stack Execution in Python",
            channel: "NeetCode",
            canonicalUrl: "https://www.youtube.com/watch?v=m9bHl9Q1s-g",
            difficulty: "Medium",
            importance: "High",
            topicSlug: "recursion-mental-model",
            estimatedMinutes: 22,
            keyTakeaways: [
              "Visualizing recursive call frames and return values on the call stack",
              "Avoiding maximum recursion depth exceeded with sys.setrecursionlimit",
              "Distinguishing divide-and-conquer from exhaustive search"
            ]
          },
          {
            position: 25,
            youtubeVideoId: "pfiQ_74Kt7w",
            title: "Backtracking Patterns: Subsets & Combinations in Python (LeetCode 78)",
            channel: "NeetCode",
            canonicalUrl: "https://www.youtube.com/watch?v=pfiQ_74Kt7w",
            difficulty: "Medium",
            importance: "Critical",
            topicSlug: "backtracking-subsets",
            estimatedMinutes: 26,
            keyTakeaways: [
              "Pick or don't pick binary decision tree pattern",
              "State mutation: subset.append(nums[i]), recurse, subset.pop()",
              "Time complexity: O(2^n) subsets generating 2^n possibilities"
            ]
          },
          {
            position: 26,
            youtubeVideoId: "s7AvT8c734U",
            title: "Permutations & Combination Sum with State Pruning (LeetCode 39 & 46)",
            channel: "NeetCode",
            canonicalUrl: "https://www.youtube.com/watch?v=s7AvT8c734U",
            difficulty: "Medium",
            importance: "High",
            topicSlug: "backtracking-combinations",
            estimatedMinutes: 25,
            keyTakeaways: [
              "Pruning search branches when remaining target < 0",
              "Handling duplicate elements with sorting and sibling check",
              "Generating permutations using element inclusion bitmasks or visited sets"
            ]
          },
          {
            position: 27,
            youtubeVideoId: "pfiQ_74Kt7w",
            title: "Word Search & 2D Grid Backtracking (LeetCode 79)",
            channel: "NeetCode",
            canonicalUrl: "https://www.youtube.com/watch?v=pfiQ_74Kt7w",
            difficulty: "Hard",
            importance: "High",
            topicSlug: "grid-backtracking",
            estimatedMinutes: 24,
            keyTakeaways: [
              "Directional delta vectors: dr, dc = [-1, 1, 0, 0], [0, 0, -1, 1]",
              "Temporarily marking visited cells in-place to save O(r*c) space",
              "Early termination when grid cell character doesn't match word[index]"
            ]
          }
        ]
      },
      {
        id: "module-6-2-tries",
        title: "Prefix Trees (Tries)",
        summary: "TrieNode class, character hashing, and prefix searching.",
        videos: [
          {
            position: 28,
            youtubeVideoId: "oobqoCJlHA0",
            title: "Implement Trie (Prefix Tree) - LeetCode 208 in Python",
            channel: "NeetCode",
            canonicalUrl: "https://www.youtube.com/watch?v=oobqoCJlHA0",
            difficulty: "Medium",
            importance: "Critical",
            topicSlug: "tries",
            estimatedMinutes: 28,
            keyTakeaways: [
              "TrieNode architecture: children dict/array and is_end_of_word boolean",
              "O(L) time complexity for word insertion and prefix lookups",
              "Implementing wildcard '.' search in WordDictionary (LeetCode 211)"
            ]
          }
        ]
      }
    ]
  },
  {
    stageNumber: 7,
    id: "stage-7-graphs-algorithms",
    title: "Graphs: BFS, DFS, Shortest Paths & Disjoint Set Union",
    subtitle: "Adjacency Lists, Topological Sort, Dijkstra & Union-Find in Python",
    description:
      "Master network algorithms and relational graph problems. Build adjacency lists with defaultdict, compute shortest paths via BFS, detect cycles and topological order via Kahn's algorithm, implement Dijkstra's algorithm with heapq, and master Disjoint Set Union (DSU).",
    level: "Advanced",
    estimatedMinutes: 170,
    learningOutcomes: [
      "Represent directed and undirected graphs in Python using defaultdict(list)",
      "Execute BFS for shortest path in unweighted graphs and DFS for connected components",
      "Implement Kahn's topological sort algorithm to detect deadlocks and compile orders",
      "Apply Dijkstra's algorithm with min-heaps for single-source shortest path problems",
      "Build Disjoint Set Union (DSU) with path compression and rank optimization"
    ],
    modules: [
      {
        id: "module-7-1-graph-traversals",
        title: "Graph Representations & Traversals",
        summary: "Adjacency lists, BFS shortest paths, and DFS cycle detection.",
        videos: [
          {
            position: 29,
            youtubeVideoId: "kXGZ_E_jK_o",
            title: "Graph Representations in Python: Adjacency List using defaultdict",
            channel: "NeetCode",
            canonicalUrl: "https://www.youtube.com/watch?v=kXGZ_E_jK_o",
            difficulty: "Easy",
            importance: "Critical",
            topicSlug: "graph-representation",
            estimatedMinutes: 21,
            keyTakeaways: [
              "Adjacency list vs adjacency matrix space and time tradeoffs",
              "Constructing graphs from raw edge lists with collections.defaultdict",
              "Handling directed, undirected, and weighted graph edges"
            ]
          },
          {
            position: 30,
            youtubeVideoId: "x-VTfcmrLEQ",
            title: "Breadth First Search (BFS) for Shortest Path in Unweighted Graphs",
            channel: "NeetCode",
            canonicalUrl: "https://www.youtube.com/watch?v=x-VTfcmrLEQ",
            difficulty: "Medium",
            importance: "Critical",
            topicSlug: "graph-bfs",
            estimatedMinutes: 25,
            keyTakeaways: [
              "Level-order queue expansion guaranteeing shortest unweighted path",
              "Tracking visited set immediately upon enqueueing to prevent duplicates",
              "Multi-source BFS pattern: Rotting Oranges (LeetCode 994)"
            ]
          },
          {
            position: 31,
            youtubeVideoId: "PMMc4VsIacU",
            title: "Depth First Search (DFS) & Connected Components (Number of Islands)",
            channel: "NeetCode",
            canonicalUrl: "https://www.youtube.com/watch?v=PMMc4VsIacU",
            difficulty: "Medium",
            importance: "Critical",
            topicSlug: "graph-dfs",
            estimatedMinutes: 28,
            keyTakeaways: [
              "Grid graph exploration: row, col boundary checks and visited marking",
              "Counting connected components by triggering DFS on unvisited land cells",
              "Clone Graph: deep copy with hash map mapping original to clone nodes"
            ]
          }
        ]
      },
      {
        id: "module-7-2-topological-dijkstra-dsu",
        title: "Topological Sort, Dijkstra & Union-Find",
        summary: "DAG scheduling, weighted shortest paths, and disjoint set partitioning.",
        videos: [
          {
            position: 32,
            youtubeVideoId: "eL-KzMXSXXI",
            title: "Topological Sort & Kahn's Algorithm - Course Schedule (LeetCode 207)",
            channel: "NeetCode",
            canonicalUrl: "https://www.youtube.com/watch?v=eL-KzMXSXXI",
            difficulty: "Medium",
            importance: "Critical",
            topicSlug: "topological-sort",
            estimatedMinutes: 30,
            keyTakeaways: [
              "In-degree array initialization and zero-in-degree queue processing",
              "Detecting cycles: if processed node count < total nodes, cycle exists",
              "Course Schedule II: generating exact topological prerequisite order"
            ]
          },
          {
            position: 33,
            youtubeVideoId: "EFg3u_E6eHU",
            title: "Dijkstra's Algorithm with Min-Heap heapq (Network Delay Time)",
            channel: "NeetCode",
            canonicalUrl: "https://www.youtube.com/watch?v=EFg3u_E6eHU",
            difficulty: "Hard",
            importance: "Critical",
            topicSlug: "dijkstra",
            estimatedMinutes: 34,
            keyTakeaways: [
              "Min-heap holding (distance, node) pairs for greedy nearest node selection",
              "Skipping outdated heap entries when dist > shortest_path[node]",
              "O((V + E) log V) time complexity proof"
            ]
          },
          {
            position: 34,
            youtubeVideoId: "ayW5B2W9hfo",
            title: "Union-Find (Disjoint Set Union) with Path Compression & Rank (LeetCode 684)",
            channel: "NeetCode",
            canonicalUrl: "https://www.youtube.com/watch?v=ayW5B2W9hfo",
            difficulty: "Hard",
            importance: "Critical",
            topicSlug: "union-find",
            estimatedMinutes: 31,
            keyTakeaways: [
              "Parent pointer array and rank/size array initialization",
              "find(x) with path compression flattening the tree to O(alpha(n)) ~ O(1)",
              "union(x, y) returning False when nodes already belong to same component"
            ]
          }
        ]
      }
    ]
  },
  {
    stageNumber: 8,
    id: "stage-8-dynamic-programming-greedy",
    title: "Dynamic Programming & Greedy Algorithms in Python",
    subtitle: "1D/2D DP, Knapsack, Longest Common Subsequence & Greedy Intervals",
    description:
      "Conquer the pinnacle of algorithmic problem solving: Dynamic Programming and Greedy Optimization. Move systematically from recursion + memoization to bottom-up tabulation with space optimization. Master 1D, 2D grid DP, 0/1 knapsack, intervals, and bit manipulation tricks.",
    level: "Advanced to Expert",
    estimatedMinutes: 242,
    learningOutcomes: [
      "Deconstruct DP problems into states, transition relations, and base cases",
      "Transition top-down memoization (@lru_cache) into space-optimized bottom-up 1D arrays",
      "Solve classical DP patterns: House Robber, Coin Change, LIS, LCS, and 0/1 Knapsack",
      "Execute greedy choices for interval scheduling and jump game reachability",
      "Utilize bit manipulation bitmasks for subset and set state representation"
    ],
    modules: [
      {
        id: "module-8-1-dp-1d",
        title: "1D Dynamic Programming",
        summary: "Memoization, tabulation, and state variable compression.",
        videos: [
          {
            position: 35,
            youtubeVideoId: "H9bfqozjoqs",
            title: "1D Dynamic Programming: Climbing Stairs & House Robber in Python",
            channel: "NeetCode",
            canonicalUrl: "https://www.youtube.com/watch?v=H9bfqozjoqs",
            difficulty: "Medium",
            importance: "Critical",
            topicSlug: "dp-1d",
            estimatedMinutes: 28,
            keyTakeaways: [
              "Identifying subproblems: dp[i] = dp[i-1] + dp[i-2]",
              "Reducing O(n) array space to O(1) two variables (prev1, prev2)",
              "House Robber: deciding between robbing current house vs skipping"
            ]
          },
          {
            position: 36,
            youtubeVideoId: "1Rkv71mP36Y",
            title: "Coin Change & Unbounded Knapsack Memoization (LeetCode 322)",
            channel: "NeetCode",
            canonicalUrl: "https://www.youtube.com/watch?v=1Rkv71mP36Y",
            difficulty: "Medium",
            importance: "Critical",
            topicSlug: "dp-coin-change",
            estimatedMinutes: 26,
            keyTakeaways: [
              "dp[amount] = min(dp[amount - coin] + 1 for coin in coins)",
              "Initializing table with float('inf') and base case dp[0] = 0",
              "Handling impossible configurations gracefully returning -1"
            ]
          },
          {
            position: 37,
            youtubeVideoId: "cjWnW0hdF1Y",
            title: "Longest Increasing Subsequence (LIS) with DP & Binary Search (LeetCode 300)",
            channel: "NeetCode",
            canonicalUrl: "https://www.youtube.com/watch?v=cjWnW0hdF1Y",
            difficulty: "Hard",
            importance: "High",
            topicSlug: "dp-lis",
            estimatedMinutes: 25,
            keyTakeaways: [
              "Standard O(n^2) nested loop bottom-up tabulation approach",
              "Patience sorting with bisect.bisect_left for O(n log n) optimal runtime",
              "Reconstructing the actual sequence using predecessor pointers"
            ]
          }
        ]
      },
      {
        id: "module-8-2-dp-2d-knapsack",
        title: "2D Dynamic Programming & Knapsack",
        summary: "Grid DP, subsequence matching, and 0/1 knapsack transformations.",
        videos: [
          {
            position: 38,
            youtubeVideoId: "IlEsdxuD4lY",
            title: "2D Dynamic Programming: Unique Paths & Min Path Sum (LeetCode 62 & 64)",
            channel: "NeetCode",
            canonicalUrl: "https://www.youtube.com/watch?v=IlEsdxuD4lY",
            difficulty: "Medium",
            importance: "Critical",
            topicSlug: "dp-2d-grid",
            estimatedMinutes: 27,
            keyTakeaways: [
              "Transition: dp[r][c] = dp[r-1][c] + dp[r][c-1]",
              "Compressing 2D grid matrix into a single 1D rolling row array",
              "Handling obstacle grids by zeroing out unreachable cells"
            ]
          },
          {
            position: 39,
            youtubeVideoId: "nLmhmB6NzcM",
            title: "0/1 Knapsack Problem: Space-Optimized Tabulation in Python",
            channel: "NeetCode",
            canonicalUrl: "https://www.youtube.com/watch?v=nLmhmB6NzcM",
            difficulty: "Hard",
            importance: "Critical",
            topicSlug: "dp-knapsack",
            estimatedMinutes: 30,
            keyTakeaways: [
              "Choice matrix: take item (remaining weight decreases) or skip item",
              "Reverse iteration on weight to prevent using same item multiple times in 1D array",
              "Partition Equal Subset Sum (LeetCode 416) mapped to target = sum//2"
            ]
          },
          {
            position: 40,
            youtubeVideoId: "Ua0GhsJSlWM",
            title: "Longest Common Subsequence (LCS) Grid DP (LeetCode 1143)",
            channel: "NeetCode",
            canonicalUrl: "https://www.youtube.com/watch?v=Ua0GhsJSlWM",
            difficulty: "Medium",
            importance: "Critical",
            topicSlug: "dp-lcs",
            estimatedMinutes: 29,
            keyTakeaways: [
              "Character match: dp[i][j] = 1 + dp[i-1][j-1]",
              "Mismatch: dp[i][j] = max(dp[i-1][j], dp[i][j-1])",
              "Applications: Edit Distance (Levenshtein), diff tools, DNA sequence alignment"
            ]
          }
        ]
      },
      {
        id: "module-8-3-greedy-intervals-bits",
        title: "Greedy Algorithms, Intervals & Bit Manipulation",
        summary: "Locally optimal choice, interval merging, and bitwise tricks.",
        videos: [
          {
            position: 41,
            youtubeVideoId: "Yan0cv2cLy8",
            title: "Greedy Algorithms: Jump Game & Gas Station (LeetCode 55 & 134)",
            channel: "NeetCode",
            canonicalUrl: "https://www.youtube.com/watch?v=Yan0cv2cLy8",
            difficulty: "Medium",
            importance: "High",
            topicSlug: "greedy-jump-game",
            estimatedMinutes: 24,
            keyTakeaways: [
              "Greedy goal post shifting: working backwards from last index",
              "Single pass O(n) reachability vs O(n^2) dynamic programming",
              "Gas Station: running balance tracking and starting index determination"
            ]
          },
          {
            position: 42,
            youtubeVideoId: "44H3cEC2fFM",
            title: "Merge Intervals & Meeting Rooms Pattern (LeetCode 56 & 253)",
            channel: "NeetCode",
            canonicalUrl: "https://www.youtube.com/watch?v=44H3cEC2fFM",
            difficulty: "Medium",
            importance: "Critical",
            topicSlug: "intervals",
            estimatedMinutes: 22,
            keyTakeaways: [
              "Sorting intervals by start time: intervals.sort(key=lambda x: x[0])",
              "Merging overlapping ranges: if curr.start <= prev.end: prev.end = max(prev.end, curr.end)",
              "Min-heap approach for Meeting Rooms II counting concurrent rooms"
            ]
          },
          {
            position: 43,
            youtubeVideoId: "7kW34g7751E",
            title: "Bit Manipulation Tricks in Python: XOR, Bitmasks, Power of Two (LeetCode 136)",
            channel: "NeetCode",
            canonicalUrl: "https://www.youtube.com/watch?v=7kW34g7751E",
            difficulty: "Easy",
            importance: "High",
            topicSlug: "bit-manipulation",
            estimatedMinutes: 26,
            keyTakeaways: [
              "XOR properties: a ^ a = 0 and a ^ 0 = a for Single Number in O(1) space",
              "Brian Kernighan's algorithm (n & (n - 1)) to count set bits in O(k)",
              "Bitmask state representation for traveling salesman and subset enumeration"
            ]
          }
        ]
      }
    ]
  }
];

// 16 Practical Hands-on Labs
const PYTHON_EXERCISES = [
  {
    id: "py-lab-1-generator-pipeline",
    stageNumber: 1,
    moduleId: "module-1-2-advanced-internals",
    title: "Streaming Log Analyzer with Custom Python Generators",
    description: "Build a memory-efficient generator pipeline in Python that yields parsed JSON web server access logs, filters 4xx/5xx HTTP status codes on the fly, and calculates running error rates without loading the entire multi-gigabyte file into RAM.",
    difficulty: "Medium",
    externalUrl: "https://docs.python.org/3/howto/functional.html#generators",
    sourcePlatform: "Python Generators",
    topic: "Generators & Memory Streams",
    estimatedMinutes: 30,
    starterCode: "import json\n\ndef read_logs(file_path):\n    # Yield lines lazily\n    pass\n\ndef parse_and_filter_errors(lines):\n    # Filter 4xx/5xx\n    pass"
  },
  {
    id: "py-lab-2-memoization-benchmark",
    stageNumber: 1,
    moduleId: "module-1-2-advanced-internals",
    title: "Custom Memoization Decorator vs functools.lru_cache",
    description: "Implement a custom @memoize decorator supporting cache size limits and TTL expiration. Benchmark its execution time and memory consumption against Python's standard library functools.lru_cache using timeit and tracemalloc.",
    difficulty: "Medium",
    externalUrl: "https://docs.python.org/3/library/functools.html#functools.lru_cache",
    sourcePlatform: "Python Protocols",
    topic: "Decorators & Caching",
    estimatedMinutes: 35,
    starterCode: "import functools, time\n\ndef memoize_with_ttl(ttl_seconds=60):\n    # Custom decorator with TTL eviction\n    pass"
  },
  {
    id: "py-lab-3-dynamic-array",
    stageNumber: 2,
    moduleId: "module-2-2-containers",
    title: "Implement Custom Dynamic Resizing Array from Scratch",
    description: "Create an object-oriented DynamicArray class using ctypes.py_object that implements append with array doubling, pop, insert_at, remove_at, and get. Prove amortized O(1) push and verify geometric capacity growth.",
    difficulty: "Hard",
    externalUrl: "https://docs.python.org/3/library/ctypes.html",
    sourcePlatform: "Data Structures",
    topic: "Dynamic Arrays",
    estimatedMinutes: 45,
    starterCode: "import ctypes\n\nclass DynamicArray:\n    def __init__(self):\n        self._n = 0\n        self._capacity = 1\n        self._A = self._make_array(self._capacity)\n    # Implement append, pop, resize\n"
  },
  {
    id: "py-lab-4-collections-analytics",
    stageNumber: 2,
    moduleId: "module-2-2-containers",
    title: "Top-K Word Frequency Streamer with Counter & Deque",
    description: "Process a continuous stream of incoming sentences. Maintain an active 1000-word sliding window using collections.deque and output the real-time top-5 most frequent keywords using collections.Counter.",
    difficulty: "Easy",
    externalUrl: "https://docs.python.org/3/library/collections.html#collections.Counter",
    sourcePlatform: "Python Collections",
    topic: "Counter & Deque",
    estimatedMinutes: 25,
    starterCode: "from collections import deque, Counter\n\nclass WordStreamAnalyzer:\n    def __init__(self, window_size=1000):\n        self.window = deque()\n        self.counts = Counter()\n    # Process words in O(1)\n"
  },
  {
    id: "py-lab-5-two-pointers-3sum",
    stageNumber: 3,
    moduleId: "module-3-1-search-patterns",
    title: "Three-Sum Unique Triplet Engine with Duplicate Pruning",
    description: "Given an integer array nums, find all unique triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0 in O(n^2) time and O(1) auxiliary space.",
    difficulty: "Medium",
    externalUrl: "https://leetcode.com/problems/3sum/",
    sourcePlatform: "LeetCode 15",
    topic: "Two Pointers",
    estimatedMinutes: 30,
    starterCode: "def threeSum(nums: list[int]) -> list[list[int]]:\n    nums.sort()\n    res = []\n    # Implement sorted two-pointer sweep\n    return res"
  },
  {
    id: "py-lab-6-min-window-substring",
    stageNumber: 3,
    moduleId: "module-3-2-window-advanced-search",
    title: "Minimum Window Substring with Frequency Mapping",
    description: "Given two strings s and t, find the minimum window substring of s such that every character in t (including duplicates) is included in the window. Run in strictly O(m + n) time complexity.",
    difficulty: "Hard",
    externalUrl: "https://leetcode.com/problems/minimum-window-substring/",
    sourcePlatform: "LeetCode 76",
    topic: "Sliding Window",
    estimatedMinutes: 45,
    starterCode: "from collections import Counter\n\ndef minWindow(s: str, t: str) -> str:\n    # Maintain window character counts\n    pass"
  },
  {
    id: "py-lab-7-lru-cache-doubly-linked",
    stageNumber: 4,
    moduleId: "module-4-1-linked-lists",
    title: "Build Production LRU Cache with Sentinel Doubly Linked List",
    description: "Architect a Least Recently Used (LRU) Cache supporting get(key) and put(key, value) in guaranteed O(1) time. Avoid edge case NULL pointer checks by employing dummy head and dummy tail sentinel nodes.",
    difficulty: "Hard",
    externalUrl: "https://leetcode.com/problems/lru-cache/",
    sourcePlatform: "LeetCode 146",
    topic: "Doubly Linked List",
    estimatedMinutes: 40,
    starterCode: "class Node:\n    def __init__(self, key=0, val=0):\n        self.key, self.val = key, val\n        self.prev = self.next = None\n\nclass LRUCache:\n    def __init__(self, capacity: int):\n        # Initialize sentinel pointers\n        pass"
  },
  {
    id: "py-lab-8-daily-temperatures-stack",
    stageNumber: 4,
    moduleId: "module-4-2-stacks-queues",
    title: "Monotonic Decreasing Stack for Daily Temperatures",
    description: "Given an array of integers temperatures representing daily temperatures, return an array answer such that answer[i] is the number of days you have to wait after the ith day to get a warmer temperature in O(n) time.",
    difficulty: "Medium",
    externalUrl: "https://leetcode.com/problems/daily-temperatures/",
    sourcePlatform: "LeetCode 739",
    topic: "Monotonic Stack",
    estimatedMinutes: 25,
    starterCode: "def dailyTemperatures(temperatures: list[int]) -> list[int]:\n    res = [0] * len(temperatures)\n    stack = [] # pair: (temp, index)\n    # Maintain monotonic decreasing stack\n    return res"
  },
  {
    id: "py-lab-9-validate-bst-lca",
    stageNumber: 5,
    moduleId: "module-5-1-binary-trees",
    title: "Validate Binary Search Tree & Lowest Common Ancestor",
    description: "Write recursive algorithms to validate BST invariants with boundary propagation (min_val < node.val < max_val) and find the Lowest Common Ancestor of two given nodes in both BSTs and general binary trees.",
    difficulty: "Medium",
    externalUrl: "https://leetcode.com/problems/validate-binary-search-tree/",
    sourcePlatform: "LeetCode 98 & 236",
    topic: "Binary Trees & BST",
    estimatedMinutes: 35,
    starterCode: "class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef isValidBST(root: TreeNode | None) -> bool:\n    pass"
  },
  {
    id: "py-lab-10-running-median-heaps",
    stageNumber: 5,
    moduleId: "module-5-2-heaps",
    title: "Continuous Median Finder with Balancing Heaps",
    description: "Design a data structure MedianFinder that supports adding numbers from a data stream and calculating the running median in O(1) time using two balancing heaps (max-heap for smaller half, min-heap for larger half).",
    difficulty: "Hard",
    externalUrl: "https://leetcode.com/problems/find-median-from-data-stream/",
    sourcePlatform: "LeetCode 295",
    topic: "Balancing Heaps",
    estimatedMinutes: 40,
    starterCode: "import heapq\n\nclass MedianFinder:\n    def __init__(self):\n        self.small = [] # max-heap (invert signs)\n        self.large = [] # min-heap\n\n    def addNum(self, num: int) -> None:\n        pass"
  },
  {
    id: "py-lab-11-sudoku-backtracking",
    stageNumber: 6,
    moduleId: "module-6-1-backtracking",
    title: "Backtracking Sudoku Solver with Bitmask Validation",
    description: "Author an optimal backtracking solver for 9x9 Sudoku puzzles. Use bitmasks for rows, columns, and 3x3 sub-boxes to perform digit placement validity checks in O(1) time before exploring recursive decision branches.",
    difficulty: "Hard",
    externalUrl: "https://leetcode.com/problems/sudoku-solver/",
    sourcePlatform: "LeetCode 37",
    topic: "Backtracking & Bitmasks",
    estimatedMinutes: 45,
    starterCode: "def solveSudoku(board: list[list[str]]) -> None:\n    # Mutate board in-place using backtracking\n    pass"
  },
  {
    id: "py-lab-12-trie-autocomplete",
    stageNumber: 6,
    moduleId: "module-6-2-tries",
    title: "Implement High-Throughput Prefix Tree with Wildcard Search",
    description: "Implement a production-grade Trie supporting word insertion, exact search, prefix search (startsWith), and wildcard matching where '.' can match any arbitrary letter in O(M) time.",
    difficulty: "Medium",
    externalUrl: "https://leetcode.com/problems/design-add-and-search-words-data-structure/",
    sourcePlatform: "LeetCode 211",
    topic: "Prefix Trees",
    estimatedMinutes: 35,
    starterCode: "class TrieNode:\n    def __init__(self):\n        self.children = {}\n        self.is_word = False\n\nclass WordDictionary:\n    def __init__(self):\n        self.root = TrieNode()\n    # Implement addWord, search with '.' wildcards\n"
  },
  {
    id: "py-lab-13-network-delay-dijkstra",
    stageNumber: 7,
    moduleId: "module-7-2-topological-dijkstra-dsu",
    title: "Network Delay Time via Dijkstra's Shortest Path",
    description: "You are given a network of n nodes labeled 1 to n and a list of travel times directed edges. Calculate the minimum time required for all nodes to receive a signal using Dijkstra's algorithm with heapq.",
    difficulty: "Medium",
    externalUrl: "https://leetcode.com/problems/network-delay-time/",
    sourcePlatform: "LeetCode 743",
    topic: "Dijkstra & Min-Heap",
    estimatedMinutes: 35,
    starterCode: "import heapq\nfrom collections import defaultdict\n\ndef networkDelayTime(times: list[list[int]], n: int, k: int) -> int:\n    # Build graph and run Dijkstra\n    pass"
  },
  {
    id: "py-lab-14-redundant-connection-dsu",
    stageNumber: 7,
    moduleId: "module-7-2-topological-dijkstra-dsu",
    title: "Cycle Detection with Disjoint Set Union (DSU)",
    description: "Given a tree with n nodes that has one additional edge added causing a cycle, return an edge that can be removed so that the resulting graph is a tree of n nodes using Union-Find with path compression and rank.",
    difficulty: "Medium",
    externalUrl: "https://leetcode.com/problems/redundant-connection/",
    sourcePlatform: "LeetCode 684",
    topic: "Disjoint Set Union",
    estimatedMinutes: 30,
    starterCode: "class DSU:\n    def __init__(self, n):\n        self.parent = list(range(n + 1))\n        self.rank = [1] * (n + 1)\n    # Implement find and union\n"
  },
  {
    id: "py-lab-15-coin-change-knapsack",
    stageNumber: 8,
    moduleId: "module-8-1-dp-1d",
    title: "Coin Change Fewest Coins with Space-Optimized DP",
    description: "Given integer array coins and integer amount, compute the fewest number of coins needed to make up that amount. Implement both memoized recursion and bottom-up 1D tabulation, proving O(amount * len(coins)) complexity.",
    difficulty: "Medium",
    externalUrl: "https://leetcode.com/problems/coin-change/",
    sourcePlatform: "LeetCode 322",
    topic: "Dynamic Programming",
    estimatedMinutes: 35,
    starterCode: "def coinChange(coins: list[int], amount: int) -> int:\n    dp = [float('inf')] * (amount + 1)\n    dp[0] = 0\n    # Tabulate minimum coins\n    return dp[amount] if dp[amount] != float('inf') else -1"
  },
  {
    id: "py-lab-16-merge-intervals-greedy",
    stageNumber: 8,
    moduleId: "module-8-3-greedy-intervals-bits",
    title: "Merge Overlapping Intervals with Sorting Optimization",
    description: "Given an array of intervals where intervals[i] = [start_i, end_i], merge all overlapping intervals and return an array of the non-overlapping intervals that cover all the intervals in the input in O(n log n) time.",
    difficulty: "Medium",
    externalUrl: "https://leetcode.com/problems/merge-intervals/",
    sourcePlatform: "LeetCode 56",
    topic: "Intervals & Greedy",
    estimatedMinutes: 25,
    starterCode: "def merge(intervals: list[list[int]]) -> list[list[int]]:\n    intervals.sort(key=lambda x: x[0])\n    merged = []\n    # Merge overlapping boundaries\n    return merged"
  }
];

function main() {
  console.log("Generating Python & DSA Curriculum Manifests...");

  // 1. Build python-dsa-manifest.json
  const totalVideos = PYTHON_STAGES.reduce(
    (acc, s) => acc + s.modules.reduce((mAcc, m) => mAcc + m.videos.length, 0),
    0
  );

  const totalEstimatedMinutes = PYTHON_STAGES.reduce(
    (acc, s) => acc + s.modules.reduce(
      (mAcc, m) => mAcc + m.videos.reduce((vAcc, v) => vAcc + v.estimatedMinutes, 0),
      0
    ),
    0
  );

  const manifest = {
    course: "python-dsa",
    slug: "python-dsa",
    title: "Python & DSA Mastery Roadmap",
    subtitle: "Complete English Curriculum from Modern Python Internals to LeetCode Data Structures & Algorithms",
    totalStages: PYTHON_STAGES.length,
    totalModules: PYTHON_STAGES.reduce((acc, s) => acc + s.modules.length, 0),
    totalVideos,
    totalEstimatedMinutes,
    stages: PYTHON_STAGES
  };

  const manifestOutPath = path.resolve("content/python/python-dsa-manifest.json");
  fs.writeFileSync(manifestOutPath, JSON.stringify(manifest, null, 2), "utf-8");
  console.log(`Created ${manifestOutPath} with ${totalVideos} videos across ${PYTHON_STAGES.length} stages.`);

  // 2. Build python-dsa-exercises.json
  const exercisesOutPath = path.resolve("content/python/python-dsa-exercises.json");
  fs.writeFileSync(exercisesOutPath, JSON.stringify(PYTHON_EXERCISES, null, 2), "utf-8");
  console.log(`Created ${exercisesOutPath} with ${PYTHON_EXERCISES.length} practical labs.`);

  // 3. Update content/dsa/playlists-manifest.json with python-dsa-mastery
  const playlistsManifestPath = path.resolve("content/dsa/playlists-manifest.json");
  const playlists = JSON.parse(fs.readFileSync(playlistsManifestPath, "utf-8"));

  const allVideosFlat = PYTHON_STAGES.flatMap((s) =>
    s.modules.flatMap((m) =>
      m.videos.map((v) => ({
        position: v.position,
        youtubeVideoId: v.youtubeVideoId,
        title: v.title,
        durationSeconds: v.estimatedMinutes * 60,
        durationText: `${Math.floor(v.estimatedMinutes / 60)}h ${v.estimatedMinutes % 60}m`,
        thumbnailUrl: `https://i.ytimg.com/vi/${v.youtubeVideoId}/hqdefault.jpg`,
        channelTitle: v.channel,
        topicSlug: v.topicSlug,
        canonicalWatchUrl: v.canonicalUrl
      }))
    )
  );

  const pythonPlaylistEntry = {
    slug: "python-dsa-mastery",
    title: "Python DSA Mastery — Algorithms & Data Structures",
    instructor: "NeetCode & FreeCodeCamp",
    channel: "NeetCode / freeCodeCamp.org",
    playlistId: "PLot-Xpze53ldg4pN6PfzoJY7KsKcxGV1g",
    focus: "Complete English Python Data Structures & Algorithms roadmap — language internals, arrays, lists, trees, heaps, backtracking, graphs & dynamic programming.",
    level: "Beginner → Advanced",
    difficulty: "Beginner → Advanced",
    language: "Python",
    isDefault: false,
    isFeatured: true,
    topicTags: [
      "python",
      "big-o",
      "two-pointers",
      "sliding-window",
      "linked-lists",
      "stacks-queues",
      "trees",
      "heaps",
      "backtracking",
      "tries",
      "graphs",
      "dynamic-programming",
      "greedy"
    ],
    videoCount: allVideosFlat.length,
    totalDurationSeconds: totalEstimatedMinutes * 60,
    thumbnailUrl: `https://i.ytimg.com/vi/${allVideosFlat[0].youtubeVideoId}/hqdefault.jpg`,
    videos: allVideosFlat
  };

  // Check if python-dsa-mastery already exists, replace or append
  const existingIdx = playlists.findIndex((p) => p.slug === "python-dsa-mastery");
  if (existingIdx >= 0) {
    playlists[existingIdx] = pythonPlaylistEntry;
  } else {
    // Insert at index 1 (right after Striver A2Z as featured flagship)
    playlists.splice(1, 0, pythonPlaylistEntry);
  }

  fs.writeFileSync(playlistsManifestPath, JSON.stringify(playlists, null, 2), "utf-8");
  console.log(`Updated ${playlistsManifestPath} with Python DSA Mastery playlist (43 videos).`);
}

main();
