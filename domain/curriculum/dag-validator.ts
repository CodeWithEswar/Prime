import type {
  CurriculumItem,
  CurriculumDependency,
  DAGValidationResult,
} from "./types";

/**
 * Validates that curriculum prerequisites form a strict Directed Acyclic Graph (DAG).
 * Performs cycle detection, verifies item existence, and checks for self-dependencies.
 */
export function validateCurriculumDAG(
  items: CurriculumItem[],
  dependencies: CurriculumDependency[]
): DAGValidationResult {
  const itemMap = new Map<string, CurriculumItem>();
  for (const item of items) {
    itemMap.set(item.id, item);
  }

  const errors: string[] = [];
  const selfDependencies: string[] = [];
  const missingPrerequisites: Array<{ dependentId: string; prerequisiteId: string }> = [];
  const invertedSequences: Array<{ dependentId: string; prerequisiteId: string }> = [];

  // Graph adjacency list: prerequisite -> dependents
  const adjacencyList = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const item of items) {
    adjacencyList.set(item.id, []);
    inDegree.set(item.id, 0);
  }

  for (const dep of dependencies) {
    // 1. Self-dependency check
    if (dep.prerequisiteItemId === dep.dependentItemId) {
      selfDependencies.push(dep.prerequisiteItemId);
      errors.push(`Item ${dep.prerequisiteItemId} cannot depend on itself.`);
      continue;
    }

    // 2. Existence check
    const prereq = itemMap.get(dep.prerequisiteItemId);
    const dependent = itemMap.get(dep.dependentItemId);

    if (!prereq) {
      missingPrerequisites.push({
        dependentId: dep.dependentItemId,
        prerequisiteId: dep.prerequisiteItemId,
      });
      errors.push(
        `Prerequisite item ${dep.prerequisiteItemId} referenced by ${dep.dependentItemId} does not exist.`
      );
      continue;
    }

    if (!dependent) {
      errors.push(
        `Dependent item ${dep.dependentItemId} referenced in dependency does not exist.`
      );
      continue;
    }

    // 3. Sequence inversion check (prerequisites should precede dependents)
    if (prereq.sequence >= dependent.sequence) {
      invertedSequences.push({
        dependentId: dep.dependentItemId,
        prerequisiteId: dep.prerequisiteItemId,
      });
      errors.push(
        `Prerequisite item "${prereq.title || prereq.id}" (seq ${prereq.sequence}) has sequence >= dependent item "${dependent.title || dependent.id}" (seq ${dependent.sequence}).`
      );
    }

    // Add edge
    const edges = adjacencyList.get(dep.prerequisiteItemId) ?? [];
    edges.push(dep.dependentItemId);
    adjacencyList.set(dep.prerequisiteItemId, edges);

    inDegree.set(dep.dependentItemId, (inDegree.get(dep.dependentItemId) ?? 0) + 1);
  }

  // 4. Cycle Detection using Kahn's algorithm (Topological Sort)
  const queue: string[] = [];
  for (const [id, deg] of inDegree.entries()) {
    if (deg === 0) {
      queue.push(id);
    }
  }

  let visitedCount = 0;
  const processedOrder: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    visitedCount++;
    processedOrder.push(current);

    const neighbors = adjacencyList.get(current) ?? [];
    for (const neighbor of neighbors) {
      const currentDeg = inDegree.get(neighbor) ?? 0;
      const nextDeg = currentDeg - 1;
      inDegree.set(neighbor, nextDeg);
      if (nextDeg === 0) {
        queue.push(neighbor);
      }
    }
  }

  const cycles: string[][] = [];
  if (visitedCount < items.length) {
    // Collect nodes that are in cycles (inDegree > 0)
    const cycleNodes = Array.from(inDegree.entries())
      .filter(([, deg]) => deg > 0)
      .map(([id]) => id);

    // Find cycle paths via DFS
    const visited = new Set<string>();
    const stack: string[] = [];

    const dfs = (nodeId: string): boolean => {
      visited.add(nodeId);
      stack.push(nodeId);

      const neighbors = adjacencyList.get(nodeId) ?? [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) return true;
        } else if (stack.includes(neighbor)) {
          const cyclePath = stack.slice(stack.indexOf(neighbor));
          cyclePath.push(neighbor);
          cycles.push(cyclePath);
          return true;
        }
      }

      stack.pop();
      return false;
    };

    for (const node of cycleNodes) {
      if (!visited.has(node)) {
        dfs(node);
      }
    }

    if (cycles.length === 0 && cycleNodes.length > 0) {
      cycles.push(cycleNodes);
    }

    errors.push(
      `Detected dependency cycle involving items: ${cycleNodes.join(", ")}`
    );
  }

  return {
    isValid: errors.length === 0,
    cycles,
    missingPrerequisites,
    selfDependencies,
    invertedSequences,
    errors,
  };
}

