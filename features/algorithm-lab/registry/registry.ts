import type { AlgorithmModule } from "../engine/types";
const loaders: Record<string, () => Promise<AlgorithmModule>> = {
  "linear-search": () => import("../algorithms/arrays").then((m) => m.linearSearch),
  "binary-search": () => import("../algorithms/arrays").then((m) => m.binarySearch),
  "bubble-sort": () => import("../algorithms/arrays").then((m) => m.bubbleSort),
  "two-pointers": () => import("../algorithms/arrays").then((m) => m.twoPointers),
  "sliding-window": () => import("../algorithms/arrays").then((m) => m.slidingWindow),
  stack: () => import("../algorithms/sequences").then((m) => m.stack),
  queue: () => import("../algorithms/sequences").then((m) => m.queue),
  "linked-list": () => import("../algorithms/sequences").then((m) => m.linkedList),
  "tree-dfs": () => import("../algorithms/networks").then((m) => m.treeDFS),
  "tree-bfs": () => import("../algorithms/networks").then((m) => m.treeBFS),
  bfs: () => import("../algorithms/networks").then((m) => m.bfs),
  dfs: () => import("../algorithms/networks").then((m) => m.dfs),
};
export function loadAlgorithm(slug: string): Promise<AlgorithmModule> {
  const loader = Object.hasOwn(loaders, slug) ? loaders[slug] : undefined;
  return loader
    ? loader()
    : Promise.reject(new Error("This algorithm is not available."));
}
