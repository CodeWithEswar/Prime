/**
 * PRIME — Shortest Path Routing Algorithms Engine
 *
 * Implements Dijkstra's Algorithm (non-negative weights) and
 * Bellman-Ford Algorithm (supports negative weights and cycle detection).
 */

import type { GraphEdge, GraphNode, RoutingAlgorithmResult, ShortestPathStep } from "../types";

export const SAMPLE_TOPOLOGY_NODES: GraphNode[] = [
  { id: "Router-A", label: "A", name: "Router A" },
  { id: "Router-B", label: "B", name: "Router B" },
  { id: "Router-C", label: "C", name: "Router C" },
  { id: "Router-D", label: "D", name: "Router D" },
];

export const SAMPLE_TOPOLOGY_EDGES: GraphEdge[] = [
  { from: "Router-A", to: "Router-B", weight: 2 },
  { from: "Router-A", to: "Router-D", weight: 6 },
  { from: "Router-B", to: "Router-C", weight: 3 },
  { from: "Router-B", to: "Router-D", weight: 2 },
  { from: "Router-C", to: "Router-D", weight: 1 },
];

export function runDijkstra(
  nodes: GraphNode[],
  edges: GraphEdge[],
  sourceId: string
): RoutingAlgorithmResult {
  const distances: Record<string, number> = {};
  const previousHops: Record<string, string | null> = {};
  const visited: Set<string> = new Set();
  const stepTrace: ShortestPathStep[] = [];

  for (const n of nodes) {
    distances[n.id] = n.id === sourceId ? 0 : Infinity;
    previousHops[n.id] = null;
  }

  // Build adjacency list (undirected or directed based on edge list)
  const adj: Record<string, Array<{ to: string; weight: number }>> = {};
  for (const n of nodes) adj[n.id] = [];
  for (const e of edges) {
    adj[e.from]?.push({ to: e.to, weight: e.weight });
    // If not directed, also add reverse:
    adj[e.to]?.push({ to: e.from, weight: e.weight });
  }

  let stepCount = 1;

  while (visited.size < nodes.length) {
    // Find unvisited node with smallest distance
    let u: string | null = null;
    let minD = Infinity;

    for (const n of nodes) {
      if (!visited.has(n.id) && distances[n.id] < minD) {
        minD = distances[n.id];
        u = n.id;
      }
    }

    if (!u || minD === Infinity) break; // Remaining nodes unreachable

    visited.add(u);
    const uNeighbors = adj[u] || [];

    for (const neighbor of uNeighbors) {
      const v = neighbor.to;
      const weight = neighbor.weight;
      if (!visited.has(v)) {
        const alt = distances[u] + weight;
        if (alt < distances[v]) {
          distances[v] = alt;
          previousHops[v] = u;
        }
      }
    }

    stepTrace.push({
      step: stepCount++,
      currentNode: u,
      distances: { ...distances },
      visited: Array.from(visited),
      explanation: `Selected node '${u}' with current minimum distance ${minD}. Relaxed adjacent outgoing edges.`,
    });
  }

  return {
    algorithm: "DIJKSTRA",
    sourceNode: sourceId,
    shortestDistances: distances,
    previousHops,
    stepTrace,
  };
}

export function runBellmanFord(
  nodes: GraphNode[],
  edges: GraphEdge[],
  sourceId: string
): RoutingAlgorithmResult {
  const distances: Record<string, number> = {};
  const previousHops: Record<string, string | null> = {};
  const stepTrace: ShortestPathStep[] = [];

  for (const n of nodes) {
    distances[n.id] = n.id === sourceId ? 0 : Infinity;
    previousHops[n.id] = null;
  }

  const V = nodes.length;

  // Relax edges |V| - 1 times
  for (let i = 1; i < V; i++) {
    let changed = false;

    for (const e of edges) {
      if (distances[e.from] !== Infinity && distances[e.from] + e.weight < distances[e.to]) {
        distances[e.to] = distances[e.from] + e.weight;
        previousHops[e.to] = e.from;
        changed = true;
      }
    }

    stepTrace.push({
      step: i,
      currentNode: `Iteration ${i}/${V - 1}`,
      distances: { ...distances },
      visited: nodes.map((n) => n.id),
      explanation: `Pass ${i} complete. Relaxed all ${edges.length} edges across the network topology.`,
    });

    if (!changed) break; // Early termination if converged
  }

  // |V|-th pass to detect negative-weight cycle
  let hasNegativeCycle = false;
  for (const e of edges) {
    if (distances[e.from] !== Infinity && distances[e.from] + e.weight < distances[e.to]) {
      hasNegativeCycle = true;
      break;
    }
  }

  return {
    algorithm: "BELLMAN_FORD",
    sourceNode: sourceId,
    shortestDistances: distances,
    previousHops,
    stepTrace,
    hasNegativeCycle,
  };
}
