/**
 * PRIME — Deadlock & Banker's Algorithm Engine
 *
 * Deterministic Safety Algorithm & Resource Request Algorithm
 * based on Edsger Dijkstra's Banker's Algorithm.
 */

import type { BankersInput, BankersSafetyResult, ResourceRequestResult } from "../types";

export function validateBankersInput(input: BankersInput): { valid: boolean; error?: string } {
  const { numProcesses, numResources, available, allocation, max } = input;

  if (numProcesses <= 0 || numResources <= 0) {
    return { valid: false, error: "Number of processes and resources must be > 0." };
  }

  if (available.length !== numResources) {
    return {
      valid: false,
      error: `Available vector size (${available.length}) does not match resource count (${numResources}).`,
    };
  }

  if (allocation.length !== numProcesses || max.length !== numProcesses) {
    return {
      valid: false,
      error: `Allocation/Max rows (${allocation.length}/${max.length}) do not match process count (${numProcesses}).`,
    };
  }

  for (let i = 0; i < numProcesses; i++) {
    if (allocation[i].length !== numResources || max[i].length !== numResources) {
      return {
        valid: false,
        error: `Matrix column dimensions at process P${i} do not match resource count (${numResources}).`,
      };
    }
    for (let j = 0; j < numResources; j++) {
      if (allocation[i][j] < 0 || max[i][j] < 0 || available[j] < 0) {
        return { valid: false, error: "All resource values must be non-negative integers." };
      }
      if (allocation[i][j] > max[i][j]) {
        return {
          valid: false,
          error: `Invalid state: Allocation[P${i}][R${j}] (${allocation[i][j]}) exceeds Maximum[P${i}][R${j}] (${max[i][j]}).`,
        };
      }
    }
  }

  return { valid: true };
}

export function computeNeedMatrix(max: number[][], allocation: number[][]): number[][] {
  return max.map((row, i) => row.map((mVal, j) => mVal - allocation[i][j]));
}

export function runBankersSafetyAlgorithm(input: BankersInput): BankersSafetyResult {
  const validation = validateBankersInput(input);
  if (!validation.valid) {
    return {
      isSafe: false,
      safeSequence: null,
      need: [],
      stepTrace: [
        {
          step: 0,
          currentWork: [],
          evaluatedProcess: -1,
          canFinish: false,
          reason: validation.error || "Invalid input matrices.",
        },
      ],
      deadlockedProcesses: [],
    };
  }

  const { numProcesses, numResources, available, allocation, max } = input;
  const need = computeNeedMatrix(max, allocation);
  const work = [...available];
  const finish = new Array(numProcesses).fill(false);
  const safeSequence: number[] = [];
  const stepTrace: BankersSafetyResult["stepTrace"] = [];

  let stepCount = 0;
  let progressMade = true;

  while (progressMade && safeSequence.length < numProcesses) {
    progressMade = false;

    for (let i = 0; i < numProcesses; i++) {
      if (!finish[i]) {
        stepCount++;
        // Check if Need[i] <= Work
        let canSatisfy = true;
        for (let j = 0; j < numResources; j++) {
          if (need[i][j] > work[j]) {
            canSatisfy = false;
            break;
          }
        }

        if (canSatisfy) {
          // Process can finish, releases its allocated resources to Work
          for (let j = 0; j < numResources; j++) {
            work[j] += allocation[i][j];
          }
          finish[i] = true;
          safeSequence.push(i);
          progressMade = true;

          stepTrace.push({
            step: stepCount,
            currentWork: [...work],
            evaluatedProcess: i,
            canFinish: true,
            reason: `Process P${i} satisfies Need <= Work. Work updated to [${work.join(
              ", "
            )}]. P${i} added to safe sequence.`,
          });
          break; // restart scan to favor lower PID indices
        } else {
          stepTrace.push({
            step: stepCount,
            currentWork: [...work],
            evaluatedProcess: i,
            canFinish: false,
            reason: `Process P${i} cannot finish: Need [${need[i].join(
              ", "
            )}] exceeds Work [${work.join(", ")}].`,
          });
        }
      }
    }
  }

  const isSafe = safeSequence.length === numProcesses;
  const deadlockedProcesses: number[] = [];
  if (!isSafe) {
    for (let i = 0; i < numProcesses; i++) {
      if (!finish[i]) {
        deadlockedProcesses.push(i);
      }
    }
  }

  return {
    isSafe,
    safeSequence: isSafe ? safeSequence : null,
    need,
    stepTrace,
    deadlockedProcesses: isSafe ? undefined : deadlockedProcesses,
  };
}

export function requestResources(
  input: BankersInput,
  processIndex: number,
  request: number[]
): ResourceRequestResult {
  const { numProcesses, numResources, available, allocation, max } = input;

  if (processIndex < 0 || processIndex >= numProcesses) {
    return { canGrant: false, reason: `Process index P${processIndex} is out of bounds.` };
  }

  if (request.length !== numResources) {
    return {
      canGrant: false,
      reason: `Request vector size (${request.length}) does not match resource count (${numResources}).`,
    };
  }

  const need = computeNeedMatrix(max, allocation);

  // 1. Check if Request <= Need
  for (let j = 0; j < numResources; j++) {
    if (request[j] > need[processIndex][j]) {
      return {
        canGrant: false,
        reason: `Error: Process P${processIndex} requested ${request[j]} of R${j}, which exceeds its declared maximum need (${need[processIndex][j]}).`,
      };
    }
  }

  // 2. Check if Request <= Available
  for (let j = 0; j < numResources; j++) {
    if (request[j] > available[j]) {
      return {
        canGrant: false,
        reason: `Process P${processIndex} must wait: Request for R${j} (${request[j]}) exceeds currently Available (${available[j]}).`,
      };
    }
  }

  // 3. Pretend allocation
  const nextAvailable = [...available];
  const nextAllocation = allocation.map((row) => [...row]);

  for (let j = 0; j < numResources; j++) {
    nextAvailable[j] -= request[j];
    nextAllocation[processIndex][j] += request[j];
  }

  const hypotheticalInput: BankersInput = {
    numProcesses,
    numResources,
    available: nextAvailable,
    allocation: nextAllocation,
    max,
  };

  const safetyCheck = runBankersSafetyAlgorithm(hypotheticalInput);

  if (safetyCheck.isSafe) {
    return {
      canGrant: true,
      reason: `Request granted! The system remains in a safe state with sequence <${safetyCheck.safeSequence
        ?.map((p) => `P${p}`)
        .join(", ")}>.`,
      safetyCheck,
    };
  } else {
    return {
      canGrant: false,
      reason: `Request denied: Granting this request would leave the system in an UNSAFE state (potential deadlock).`,
      safetyCheck,
    };
  }
}

