/**
 * PRIME — Disk Scheduling Studio Engine
 *
 * Deterministic algorithms for hard disk arm movement:
 * - FCFS (First-Come, First-Served)
 * - SSTF (Shortest Seek Time First)
 * - SCAN (Elevator Algorithm)
 * - C-SCAN (Circular SCAN)
 * - LOOK
 * - C-LOOK
 */

import type { DiskDirection, DiskSchedulingAlgorithm, DiskSchedulingResult } from "../types";

export function simulateDiskScheduling(
  requests: number[],
  initialHead: number,
  algorithm: DiskSchedulingAlgorithm,
  direction: DiskDirection = "UP",
  maxCylinders = 200
): DiskSchedulingResult {
  if (requests.length === 0) {
    return {
      algorithm,
      initialHead,
      direction,
      maxCylinders,
      requests: [],
      trajectory: [initialHead],
      stepMovements: [],
      totalHeadMovement: 0,
      averageSeekDistance: 0,
      stepTrace: ["No track requests provided."],
    };
  }

  // Validate requests within bounds [0, maxCylinders - 1]
  const validRequests = requests
    .map((r) => Math.max(0, Math.min(maxCylinders - 1, Math.round(r))))
    .filter((r) => !isNaN(r));

  switch (algorithm) {
    case "FCFS":
      return runFCFS(validRequests, initialHead, direction, maxCylinders);
    case "SSTF":
      return runSSTF(validRequests, initialHead, direction, maxCylinders);
    case "SCAN":
      return runSCAN(validRequests, initialHead, direction, maxCylinders);
    case "C_SCAN":
      return runCSCAN(validRequests, initialHead, direction, maxCylinders);
    case "LOOK":
      return runLOOK(validRequests, initialHead, direction, maxCylinders);
    case "C_LOOK":
      return runCLOOK(validRequests, initialHead, direction, maxCylinders);
    default:
      return runFCFS(validRequests, initialHead, direction, maxCylinders);
  }
}

function finalizeDiskResult(
  algorithm: DiskSchedulingAlgorithm,
  initialHead: number,
  direction: DiskDirection,
  maxCylinders: number,
  requests: number[],
  trajectory: number[],
  stepTrace: string[]
): DiskSchedulingResult {
  const stepMovements: number[] = [];
  let total = 0;

  for (let i = 1; i < trajectory.length; i++) {
    const diff = Math.abs(trajectory[i] - trajectory[i - 1]);
    stepMovements.push(diff);
    total += diff;
  }

  return {
    algorithm,
    initialHead,
    direction,
    maxCylinders,
    requests,
    trajectory,
    stepMovements,
    totalHeadMovement: total,
    averageSeekDistance: requests.length > 0 ? Math.round((total / requests.length) * 100) / 100 : 0,
    stepTrace,
  };
}

// 1. FCFS
function runFCFS(
  requests: number[],
  initialHead: number,
  direction: DiskDirection,
  maxCylinders: number
): DiskSchedulingResult {
  const trajectory = [initialHead, ...requests];
  const trace: string[] = [`Initial head at cylinder ${initialHead}`];

  for (let i = 0; i < requests.length; i++) {
    const prev = trajectory[i];
    const curr = requests[i];
    trace.push(`Step ${i + 1}: Move from ${prev} to ${curr} (Seek: ${Math.abs(curr - prev)} cylinders)`);
  }

  return finalizeDiskResult("FCFS", initialHead, direction, maxCylinders, requests, trajectory, trace);
}

// 2. SSTF
function runSSTF(
  requests: number[],
  initialHead: number,
  direction: DiskDirection,
  maxCylinders: number
): DiskSchedulingResult {
  const remaining = [...requests];
  const trajectory = [initialHead];
  const trace: string[] = [`Initial head at cylinder ${initialHead}`];
  let current = initialHead;

  let step = 1;
  while (remaining.length > 0) {
    let nearestIndex = 0;
    let minDistance = Math.abs(remaining[0] - current);

    for (let i = 1; i < remaining.length; i++) {
      const dist = Math.abs(remaining[i] - current);
      if (dist < minDistance) {
        minDistance = dist;
        nearestIndex = i;
      }
    }

    const nextCylinder = remaining[nearestIndex];
    remaining.splice(nearestIndex, 1);
    trace.push(
      `Step ${step++}: Move from ${current} to ${nextCylinder} (Shortest seek: ${minDistance} cylinders)`
    );
    current = nextCylinder;
    trajectory.push(current);
  }

  return finalizeDiskResult("SSTF", initialHead, direction, maxCylinders, requests, trajectory, trace);
}

// 3. SCAN (Elevator)
function runSCAN(
  requests: number[],
  initialHead: number,
  direction: DiskDirection,
  maxCylinders: number
): DiskSchedulingResult {
  const trajectory = [initialHead];
  const trace: string[] = [`Initial head at cylinder ${initialHead}, sweeping ${direction}`];

  const left = requests.filter((r) => r < initialHead).sort((a, b) => b - a); // descending
  const right = requests.filter((r) => r >= initialHead).sort((a, b) => a - b); // ascending

  if (direction === "UP") {
    // Service right, go to max cylinder limit (maxCylinders - 1), then reverse and service left
    for (const r of right) trajectory.push(r);
    // If there are left requests, arm travels to end boundary
    if (left.length > 0) {
      const endBoundary = maxCylinders - 1;
      if (trajectory[trajectory.length - 1] !== endBoundary) {
        trajectory.push(endBoundary);
        trace.push(`Arm reaches upper disk boundary ${endBoundary} and reverses direction to DOWN`);
      }
      for (const r of left) trajectory.push(r);
    }
  } else {
    // Service left, go to 0 boundary, reverse, service right
    for (const r of left) trajectory.push(r);
    if (right.length > 0) {
      if (trajectory[trajectory.length - 1] !== 0) {
        trajectory.push(0);
        trace.push(`Arm reaches lower disk boundary 0 and reverses direction to UP`);
      }
      for (const r of right) trajectory.push(r);
    }
  }

  return finalizeDiskResult("SCAN", initialHead, direction, maxCylinders, requests, trajectory, trace);
}

// 4. C-SCAN (Circular SCAN)
function runCSCAN(
  requests: number[],
  initialHead: number,
  direction: DiskDirection,
  maxCylinders: number
): DiskSchedulingResult {
  const trajectory = [initialHead];
  const trace: string[] = [`Initial head at cylinder ${initialHead}, C-SCAN sweeping ${direction}`];

  const left = requests.filter((r) => r < initialHead).sort((a, b) => a - b); // ascending
  const right = requests.filter((r) => r >= initialHead).sort((a, b) => a - b); // ascending

  if (direction === "UP") {
    for (const r of right) trajectory.push(r);
    if (left.length > 0) {
      const endBoundary = maxCylinders - 1;
      if (trajectory[trajectory.length - 1] !== endBoundary) trajectory.push(endBoundary);
      // Fast return jump to cylinder 0 without servicing
      trajectory.push(0);
      trace.push(`Arm reaches boundary ${endBoundary}, circular jumps directly to 0`);
      for (const r of left) trajectory.push(r);
    }
  } else {
    const leftDesc = requests.filter((r) => r <= initialHead).sort((a, b) => b - a);
    const rightDesc = requests.filter((r) => r > initialHead).sort((a, b) => b - a);

    for (const r of leftDesc) trajectory.push(r);
    if (rightDesc.length > 0) {
      if (trajectory[trajectory.length - 1] !== 0) trajectory.push(0);
      trajectory.push(maxCylinders - 1);
      trace.push(`Arm reaches boundary 0, circular jumps to ${maxCylinders - 1}`);
      for (const r of rightDesc) trajectory.push(r);
    }
  }

  return finalizeDiskResult("C_SCAN", initialHead, direction, maxCylinders, requests, trajectory, trace);
}

// 5. LOOK
function runLOOK(
  requests: number[],
  initialHead: number,
  direction: DiskDirection,
  maxCylinders: number
): DiskSchedulingResult {
  const trajectory = [initialHead];
  const trace: string[] = [`Initial head at cylinder ${initialHead}, LOOK sweeping ${direction}`];

  const left = requests.filter((r) => r < initialHead).sort((a, b) => b - a); // descending
  const right = requests.filter((r) => r >= initialHead).sort((a, b) => a - b); // ascending

  if (direction === "UP") {
    for (const r of right) trajectory.push(r);
    if (left.length > 0) {
      trace.push(`Arm reaches highest requested cylinder ${trajectory[trajectory.length - 1]} and reverses to DOWN`);
      for (const r of left) trajectory.push(r);
    }
  } else {
    for (const r of left) trajectory.push(r);
    if (right.length > 0) {
      trace.push(`Arm reaches lowest requested cylinder ${trajectory[trajectory.length - 1]} and reverses to UP`);
      for (const r of right) trajectory.push(r);
    }
  }

  return finalizeDiskResult("LOOK", initialHead, direction, maxCylinders, requests, trajectory, trace);
}

// 6. C-LOOK
function runCLOOK(
  requests: number[],
  initialHead: number,
  direction: DiskDirection,
  maxCylinders: number
): DiskSchedulingResult {
  const trajectory = [initialHead];
  const trace: string[] = [`Initial head at cylinder ${initialHead}, C-LOOK sweeping ${direction}`];

  const left = requests.filter((r) => r < initialHead).sort((a, b) => a - b); // ascending
  const right = requests.filter((r) => r >= initialHead).sort((a, b) => a - b); // ascending

  if (direction === "UP") {
    for (const r of right) trajectory.push(r);
    if (left.length > 0) {
      trace.push(
        `Arm reaches highest request ${trajectory[trajectory.length - 1]}, jumps to lowest request ${left[0]}`
      );
      for (const r of left) trajectory.push(r);
    }
  } else {
    const leftDesc = requests.filter((r) => r <= initialHead).sort((a, b) => b - a);
    const rightDesc = requests.filter((r) => r > initialHead).sort((a, b) => b - a);

    for (const r of leftDesc) trajectory.push(r);
    if (rightDesc.length > 0) {
      trace.push(
        `Arm reaches lowest request ${trajectory[trajectory.length - 1]}, jumps to highest request ${rightDesc[0]}`
      );
      for (const r of rightDesc) trajectory.push(r);
    }
  }

  return finalizeDiskResult("C_LOOK", initialHead, direction, maxCylinders, requests, trajectory, trace);
}

