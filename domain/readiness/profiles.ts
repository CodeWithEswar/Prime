/**
 * PRIME Interview Readiness Engine — Canonical Profiles & Competency Catalog
 *
 * Defines verifiable interview competencies across DSA, Systems Fundamentals,
 * Aptitude, and Mock Interviews, along with target role requirements.
 */

import type {
  CompetencyDefinition,
  ReadinessTargetProfile,
} from "./types";

export const CANONICAL_COMPETENCIES: CompetencyDefinition[] = [
  // --- DSA DOMAIN ---
  {
    id: "dsa-arrays",
    slug: "arrays-hashing",
    name: "Arrays & Hashing",
    domain: "dsa",
    description: "Hash maps, frequency tables, prefix sums, and array transformations.",
    relatedTopicSlugs: ["arrays", "hashing", "arrays-hashing"],
  },
  {
    id: "dsa-two-pointers",
    slug: "two-pointers",
    name: "Two Pointers",
    domain: "dsa",
    description: "Converging pointers, left-right scans, and sorted pair matching.",
    relatedTopicSlugs: ["two-pointers", "two-pointers-sliding-window"],
    prerequisiteCompetencyIds: ["dsa-arrays"],
  },
  {
    id: "dsa-sliding-window",
    slug: "sliding-window",
    name: "Sliding Window",
    domain: "dsa",
    description: "Dynamic and fixed-size contiguous subarray and substring optimization.",
    relatedTopicSlugs: ["sliding-window", "two-pointers-sliding-window"],
    prerequisiteCompetencyIds: ["dsa-two-pointers"],
  },
  {
    id: "dsa-binary-search",
    slug: "binary-search",
    name: "Binary Search",
    domain: "dsa",
    description: "Logarithmic interval shrinking, search-on-answer, and boundary conditions.",
    relatedTopicSlugs: ["binary-search"],
    prerequisiteCompetencyIds: ["dsa-arrays"],
  },
  {
    id: "dsa-stack-queue",
    slug: "stack-queue",
    name: "Stacks & Queues",
    domain: "dsa",
    description: "Monotonic stacks, parenthetical matching, LIFO/FIFO buffer structures.",
    relatedTopicSlugs: ["stack", "queue", "stacks-queues"],
    prerequisiteCompetencyIds: ["dsa-arrays"],
  },
  {
    id: "dsa-linked-lists",
    slug: "linked-lists",
    name: "Linked Lists",
    domain: "dsa",
    description: "Pointer rewiring, fast & slow pointers, reversing, and cycle detection.",
    relatedTopicSlugs: ["linked-list", "linked-lists"],
  },
  {
    id: "dsa-trees",
    slug: "trees-bst",
    name: "Trees & Binary Search Trees",
    domain: "dsa",
    description: "DFS/BFS tree traversals, tree construction, BST properties, LCA.",
    relatedTopicSlugs: ["trees", "binary-trees", "tree"],
    prerequisiteCompetencyIds: ["dsa-stack-queue"],
  },
  {
    id: "dsa-graphs",
    slug: "graphs",
    name: "Graphs & Traversal",
    domain: "dsa",
    description: "Adjacency representations, BFS, DFS, topological sort, Dijkstra.",
    relatedTopicSlugs: ["graphs", "graph"],
    prerequisiteCompetencyIds: ["dsa-trees"],
  },
  {
    id: "dsa-dp",
    slug: "dynamic-programming",
    name: "Dynamic Programming",
    domain: "dsa",
    description: "Optimal substructure, overlapping subproblems, memoization, and tabulation.",
    relatedTopicSlugs: ["dynamic-programming", "dp"],
    prerequisiteCompetencyIds: ["dsa-trees"],
  },
  {
    id: "dsa-backtracking",
    slug: "backtracking",
    name: "Recursion & Backtracking",
    domain: "dsa",
    description: "Combinatorial generation, permutations, pruning, and state exploration.",
    relatedTopicSlugs: ["backtracking", "recursion"],
    prerequisiteCompetencyIds: ["dsa-trees"],
  },

  // --- FUNDAMENTALS DOMAIN ---
  {
    id: "fund-dbms",
    slug: "dbms-indexing",
    name: "DBMS & Indexing",
    domain: "fundamentals",
    description: "B-Tree indexes, ACID transactions, isolation levels, and storage engines.",
    relatedTopicSlugs: ["dbms", "database"],
  },
  {
    id: "fund-os",
    slug: "os-concurrency",
    name: "Operating Systems & Concurrency",
    domain: "fundamentals",
    description: "Processes, virtual memory, threads, synchronization primitives, deadlocks.",
    relatedTopicSlugs: ["os", "operating-systems"],
  },
  {
    id: "fund-networks",
    slug: "computer-networks",
    name: "Computer Networks & Protocols",
    domain: "fundamentals",
    description: "TCP/IP handshake, HTTP/HTTPS, DNS, latency, socket communication.",
    relatedTopicSlugs: ["networks", "networking"],
  },
  {
    id: "fund-oop",
    slug: "oop-design",
    name: "OOP & System Architecture",
    domain: "fundamentals",
    description: "SOLID principles, design patterns, interfaces, polymorphism, modularity.",
    relatedTopicSlugs: ["oop", "system-design"],
  },
  {
    id: "fund-sql",
    slug: "sql-modeling",
    name: "SQL & Relational Modeling",
    domain: "fundamentals",
    description: "Complex joins, window functions, aggregation, query plan analysis.",
    relatedTopicSlugs: ["sql", "queries"],
  },

  // --- APTITUDE DOMAIN ---
  {
    id: "apt-quant",
    slug: "quantitative-aptitude",
    name: "Quantitative Aptitude",
    domain: "aptitude",
    description: "Arithmetic, probability, permutations, ratios, speed-distance-time.",
    relatedTopicSlugs: ["aptitude-quant"],
  },
  {
    id: "apt-logic",
    slug: "logical-reasoning",
    name: "Logical Reasoning",
    domain: "aptitude",
    description: "Deductive logic, series completion, syllogisms, relational puzzles.",
    relatedTopicSlugs: ["aptitude-logic"],
  },

  // --- MOCK INTERVIEW DOMAIN ---
  {
    id: "mock-coding",
    slug: "coding-mock",
    name: "Live Coding Mock Interview",
    domain: "mock",
    description: "Real-time communication, edge-case discussion, clean syntax under timed conditions.",
    relatedTopicSlugs: ["mock-coding"],
  },
  {
    id: "mock-technical",
    slug: "technical-defense",
    name: "Technical Defense Mock",
    domain: "mock",
    description: "Defending time/space tradeoffs, architecture choices, and CS fundamentals in dialogue.",
    relatedTopicSlugs: ["mock-technical"],
  },
];

export const TARGET_PROFILES: ReadinessTargetProfile[] = [
  {
    id: "general-sde",
    name: "General Software Development Engineer",
    description: "Standard top-tier tech interview benchmark focusing on algorithmic breadth and fundamental systems competence.",
    version: "1.0.0",
    competencies: [
      { competencyId: "dsa-arrays", importance: "core", targetProblemsCount: 6 },
      { competencyId: "dsa-two-pointers", importance: "core", targetProblemsCount: 4 },
      { competencyId: "dsa-sliding-window", importance: "core", targetProblemsCount: 4 },
      { competencyId: "dsa-binary-search", importance: "core", targetProblemsCount: 5 },
      { competencyId: "dsa-stack-queue", importance: "core", targetProblemsCount: 4 },
      { competencyId: "dsa-linked-lists", importance: "supporting", targetProblemsCount: 4 },
      { competencyId: "dsa-trees", importance: "core", targetProblemsCount: 6 },
      { competencyId: "dsa-graphs", importance: "core", targetProblemsCount: 6 },
      { competencyId: "dsa-dp", importance: "core", targetProblemsCount: 6 },
      { competencyId: "dsa-backtracking", importance: "supporting", targetProblemsCount: 4 },
      { competencyId: "fund-dbms", importance: "core" },
      { competencyId: "fund-os", importance: "core" },
      { competencyId: "fund-networks", importance: "supporting" },
      { competencyId: "fund-oop", importance: "core" },
      { competencyId: "fund-sql", importance: "supporting" },
      { competencyId: "apt-quant", importance: "supporting" },
      { competencyId: "apt-logic", importance: "supporting" },
      { competencyId: "mock-coding", importance: "core" },
      { competencyId: "mock-technical", importance: "supporting" },
    ],
  },
  {
    id: "backend-dev",
    name: "Backend Developer",
    description: "Heavy emphasis on distributed systems, databases, transactions, and robust data structure performance.",
    version: "1.0.0",
    competencies: [
      { competencyId: "dsa-arrays", importance: "core", targetProblemsCount: 6 },
      { competencyId: "dsa-two-pointers", importance: "core", targetProblemsCount: 4 },
      { competencyId: "dsa-binary-search", importance: "core", targetProblemsCount: 4 },
      { competencyId: "dsa-trees", importance: "core", targetProblemsCount: 5 },
      { competencyId: "dsa-graphs", importance: "core", targetProblemsCount: 5 },
      { competencyId: "dsa-dp", importance: "supporting", targetProblemsCount: 4 },
      { competencyId: "fund-dbms", importance: "core" },
      { competencyId: "fund-sql", importance: "core" },
      { competencyId: "fund-os", importance: "core" },
      { competencyId: "fund-networks", importance: "core" },
      { competencyId: "fund-oop", importance: "core" },
      { competencyId: "mock-coding", importance: "core" },
      { competencyId: "mock-technical", importance: "core" },
    ],
  },
  {
    id: "fullstack-dev",
    name: "Full-Stack Developer",
    description: "Balanced evaluation spanning algorithmic problem-solving, relational modeling, web networking, and architecture.",
    version: "1.0.0",
    competencies: [
      { competencyId: "dsa-arrays", importance: "core", targetProblemsCount: 6 },
      { competencyId: "dsa-two-pointers", importance: "core", targetProblemsCount: 4 },
      { competencyId: "dsa-sliding-window", importance: "core", targetProblemsCount: 4 },
      { competencyId: "dsa-binary-search", importance: "core", targetProblemsCount: 4 },
      { competencyId: "dsa-trees", importance: "supporting", targetProblemsCount: 4 },
      { competencyId: "fund-sql", importance: "core" },
      { competencyId: "fund-dbms", importance: "core" },
      { competencyId: "fund-networks", importance: "core" },
      { competencyId: "fund-oop", importance: "core" },
      { competencyId: "mock-coding", importance: "core" },
    ],
  },
  {
    id: "frontend-dev",
    name: "Frontend Developer",
    description: "Core algorithms, data transformations, asynchronous networking, and UI architecture.",
    version: "1.0.0",
    competencies: [
      { competencyId: "dsa-arrays", importance: "core", targetProblemsCount: 6 },
      { competencyId: "dsa-two-pointers", importance: "core", targetProblemsCount: 4 },
      { competencyId: "dsa-sliding-window", importance: "core", targetProblemsCount: 4 },
      { competencyId: "dsa-trees", importance: "supporting", targetProblemsCount: 4 },
      { competencyId: "fund-networks", importance: "core" },
      { competencyId: "fund-oop", importance: "supporting" },
      { competencyId: "mock-coding", importance: "core" },
    ],
  },
];

export const CANONICAL_COMPANIES: import("./types").CompanyEmphasis[] = [
  {
    id: "amazon",
    name: "Amazon",
    slug: "amazon",
    logoUrl: "/brand/companies/amazon.svg",
    description: "Emphasis on scalable tree & graph structures, database storage, and leadership behavioral articulation.",
    priorityCompetencyIds: ["dsa-trees", "dsa-graphs", "fund-dbms", "mock-coding"],
  },
  {
    id: "google",
    name: "Google",
    slug: "google",
    logoUrl: "/brand/companies/google.svg",
    description: "High emphasis on dynamic programming, complex graph traversal, concurrency, and technical tradeoff defense.",
    priorityCompetencyIds: ["dsa-dp", "dsa-graphs", "fund-os", "mock-technical"],
  },
  {
    id: "microsoft",
    name: "Microsoft",
    slug: "microsoft",
    logoUrl: "/brand/companies/microsoft.svg",
    description: "Emphasis on foundational data structures, OOP architecture, relational modeling, and clean code communication.",
    priorityCompetencyIds: ["dsa-arrays", "dsa-binary-search", "fund-oop", "fund-sql"],
  },
  {
    id: "meta",
    name: "Meta",
    slug: "meta",
    logoUrl: "/brand/companies/meta.svg",
    description: "Emphasis on high-speed implementation, two-pointers, sliding window, and graph BFS/DFS under time constraints.",
    priorityCompetencyIds: ["dsa-two-pointers", "dsa-sliding-window", "dsa-graphs", "mock-coding"],
  },
];

export function getCompanyEmphasis(companyId?: string): import("./types").CompanyEmphasis | undefined {
  if (!companyId) return undefined;
  return CANONICAL_COMPANIES.find((c) => c.id === companyId.toLowerCase());
}

export function getTargetProfile(id: string): ReadinessTargetProfile {
  return (
    TARGET_PROFILES.find((p) => p.id === id) ??
    TARGET_PROFILES[0] // fallback to general-sde
  );
}

export function getCompetencyDefinition(id: string): CompetencyDefinition | undefined {
  return CANONICAL_COMPETENCIES.find((c) => c.id === id);
}

