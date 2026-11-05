import type { AlgorithmMetadata } from "../engine/types";
export const ALGORITHMS: readonly AlgorithmMetadata[] = [
  {
    slug: "linear-search",
    name: "Linear Search",
    category: "Search",
    description: "Inspect one candidate at a time until a match appears.",
    aliases: ["scan", "traversal"],
    topics: ["arrays", "array", "foundations", "arrays-hashing"],
    renderer: "array",
  },
  {
    slug: "binary-search",
    name: "Binary Search",
    category: "Search",
    description: "Keep the answer inside a shrinking sorted interval.",
    aliases: ["sorted", "logarithmic"],
    topics: ["binary-search"],
    renderer: "array",
  },
  {
    slug: "bubble-sort",
    name: "Bubble Sort",
    category: "Sorting",
    description: "Compare neighbors and settle the largest remaining value.",
    aliases: ["sorting", "swap"],
    topics: ["sorting", "sorting-searching"],
    renderer: "array",
  },
  {
    slug: "two-pointers",
    name: "Two Pointers",
    category: "Patterns",
    description: "Find a target sum using the ends of a sorted array.",
    aliases: ["pair sum", "left right"],
    topics: ["two-pointers", "two-pointers-sliding-window"],
    renderer: "array",
  },
  {
    slug: "sliding-window",
    name: "Sliding Window",
    category: "Patterns",
    description: "Find a maximum fixed-size sum by reusing the previous window.",
    aliases: ["window sum", "subarray"],
    topics: ["sliding-window", "two-pointers-sliding-window"],
    renderer: "array",
  },
  {
    slug: "stack",
    name: "Stack",
    category: "Data Structures",
    description: "Trace push, pop and peek with last-in, first-out order.",
    aliases: ["lifo", "push", "pop"],
    topics: ["stack", "stacks-queues", "stack-queue"],
    renderer: "sequence",
  },
  {
    slug: "queue",
    name: "Queue",
    category: "Data Structures",
    description: "Follow enqueue, dequeue and front in arrival order.",
    aliases: ["fifo", "enqueue"],
    topics: ["queue", "stacks-queues", "stack-queue"],
    renderer: "sequence",
  },
  {
    slug: "linked-list",
    name: "Linked List",
    category: "Data Structures",
    description: "Inspect links while traversing, searching, inserting or deleting.",
    aliases: ["nodes", "list"],
    topics: ["linked-list", "linked-lists"],
    renderer: "sequence",
  },
  {
    slug: "tree-dfs",
    name: "Tree DFS",
    category: "Trees",
    description: "Trace preorder, inorder and postorder with a visible call stack.",
    aliases: ["tree traversal", "preorder", "inorder", "postorder"],
    topics: ["trees", "binary-tree", "binary-trees", "binary-search-trees", "trees-bst"],
    renderer: "network",
  },
  {
    slug: "tree-bfs",
    name: "Tree BFS",
    category: "Trees",
    description: "Visit a binary tree level by level using a queue.",
    aliases: ["level order", "tree traversal"],
    topics: ["trees", "binary-tree", "binary-trees", "trees-bst"],
    renderer: "network",
  },
  {
    slug: "bfs",
    name: "Graph BFS",
    category: "Graphs",
    description: "Discover reachable vertices through a first-in, first-out frontier.",
    aliases: ["breadth first search", "graph traversal", "queue"],
    topics: ["graphs", "graph", "bfs"],
    renderer: "network",
  },
  {
    slug: "dfs",
    name: "Graph DFS",
    category: "Graphs",
    description: "Explore one branch before returning to the previous call.",
    aliases: ["depth first search", "graph traversal", "recursion"],
    topics: ["graphs", "graph", "dfs"],
    renderer: "network",
  },
];
export function algorithmMetadata(slug: string) {
  return ALGORITHMS.find((a) => a.slug === slug);
}
export function searchAlgorithms(query: string) {
  const words = query.trim().toLowerCase().split(/\s+/);
  return ALGORITHMS.filter((a) =>
    words.every((word) =>
      [a.name, a.description, a.category, ...a.aliases, ...a.topics]
        .join(" ")
        .toLowerCase()
        .includes(word)
    )
  );
}
export function labsForTopics(topics: readonly string[]) {
  const keys = new Set(topics.map((t) => t.toLowerCase()));
  return ALGORITHMS.filter((a) => a.topics.some((t) => keys.has(t)));
}
