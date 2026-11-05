/**
 * PRIME — Process Synchronization Studio Engine
 *
 * Models classic concurrency and synchronization primitives:
 * - Peterson's Algorithm (Mutual Exclusion, Progress, Bounded Waiting)
 * - Bounded Buffer (Producer-Consumer with Semaphores)
 * - Readers-Writers (Reader preference vs Writer starvation)
 * - Dining Philosophers (Deadlock condition vs Deadlock-free solution)
 */

import type { SyncProblemType, SyncStep } from "../types";

// 1. Peterson's Algorithm State
export interface PetersonState {
  flags: [boolean, boolean];
  turn: 0 | 1;
  pc: [number, number]; // Step indices for P0 and P1
  criticalSection: 0 | 1 | null;
  violation: string | null;
}

export function createPetersonState(): PetersonState {
  return {
    flags: [false, false],
    turn: 0,
    pc: [0, 0],
    criticalSection: null,
    violation: null,
  };
}

// Peterson step for process i (0 or 1)
// Code structure:
// 0: flag[i] = true
// 1: turn = j
// 2: while (flag[j] && turn == j) wait
// 3: CRITICAL SECTION
// 4: flag[i] = false (Exit CS)
export function stepPeterson(
  state: PetersonState,
  processId: 0 | 1,
  invertedOrder = false
): { nextState: PetersonState; explanation: string; blocked: boolean } {
  const next = {
    ...state,
    flags: [...state.flags] as [boolean, boolean],
    pc: [...state.pc] as [number, number],
  };

  const i = processId;
  const j = (1 - processId) as 0 | 1;
  const pc = next.pc[i];

  if (invertedOrder) {
    // Buggy inverted order: turn = j first, then flag[i] = true
    if (pc === 0) {
      next.turn = j;
      next.pc[i] = 1;
      return {
        nextState: next,
        explanation: `P${i} executes: turn = ${j}`,
        blocked: false,
      };
    }
    if (pc === 1) {
      next.flags[i] = true;
      next.pc[i] = 2;
      return {
        nextState: next,
        explanation: `P${i} executes: flag[${i}] = true`,
        blocked: false,
      };
    }
  } else {
    // Standard correct Peterson algorithm
    if (pc === 0) {
      next.flags[i] = true;
      next.pc[i] = 1;
      return {
        nextState: next,
        explanation: `P${i} executes: flag[${i}] = true (signals interest)`,
        blocked: false,
      };
    }
    if (pc === 1) {
      next.turn = j;
      next.pc[i] = 2;
      return {
        nextState: next,
        explanation: `P${i} executes: turn = ${j} (gives priority to P${j})`,
        blocked: false,
      };
    }
  }

  if (pc === 2) {
    // check while (flag[j] && turn == j)
    const isWaiting = next.flags[j] && next.turn === j;
    if (isWaiting) {
      return {
        nextState: next,
        explanation: `P${i} is busy-waiting: flag[${j}] is TRUE and turn == ${j}`,
        blocked: true,
      };
    }
    // Enters critical section
    next.pc[i] = 3;
    if (next.criticalSection !== null && next.criticalSection !== i) {
      next.violation = `MUTUAL EXCLUSION VIOLATION! Both P${next.criticalSection} and P${i} entered Critical Section!`;
    }
    next.criticalSection = i;
    return {
      nextState: next,
      explanation: `P${i} enters CRITICAL SECTION! (while condition failed)`,
      blocked: false,
    };
  }

  if (pc === 3) {
    // Exit critical section
    next.flags[i] = false;
    next.pc[i] = 0;
    if (next.criticalSection === i) {
      next.criticalSection = null;
    }
    return {
      nextState: next,
      explanation: `P${i} exits Critical Section: flag[${i}] = false`,
      blocked: false,
    };
  }

  return { nextState: next, explanation: `P${i} is idle`, blocked: false };
}

// 2. Bounded Buffer State
export interface BoundedBufferState {
  bufferCapacity: number;
  buffer: number[]; // queue of item IDs
  mutex: number; // 0 or 1
  empty: number; // starts at capacity
  full: number; // starts at 0
  log: string[];
}

export function createBoundedBuffer(capacity = 5): BoundedBufferState {
  return {
    bufferCapacity: capacity,
    buffer: [],
    mutex: 1,
    empty: capacity,
    full: 0,
    log: [`Initialized Bounded Buffer with capacity ${capacity}`],
  };
}

export function produceItem(
  state: BoundedBufferState,
  itemId: number
): { nextState: BoundedBufferState; success: boolean; message: string } {
  if (state.empty <= 0) {
    return {
      nextState: state,
      success: false,
      message: "Producer blocked: Semaphore 'empty' is 0 (Buffer is completely full).",
    };
  }

  const next = { ...state, buffer: [...state.buffer], log: [...state.log] };
  next.empty -= 1; // wait(empty)
  next.mutex = 0; // wait(mutex)
  next.buffer.push(itemId);
  next.mutex = 1; // signal(mutex)
  next.full += 1; // signal(full)

  const msg = `Producer placed Item #${itemId} in buffer [Count: ${next.buffer.length}/${next.bufferCapacity}]. Empty=${next.empty}, Full=${next.full}`;
  next.log.push(msg);

  return { nextState: next, success: true, message: msg };
}

export function consumeItem(
  state: BoundedBufferState
): { nextState: BoundedBufferState; item: number | null; success: boolean; message: string } {
  if (state.full <= 0 || state.buffer.length === 0) {
    return {
      nextState: state,
      item: null,
      success: false,
      message: "Consumer blocked: Semaphore 'full' is 0 (Buffer is empty).",
    };
  }

  const next = { ...state, buffer: [...state.buffer], log: [...state.log] };
  next.full -= 1; // wait(full)
  next.mutex = 0; // wait(mutex)
  const item = next.buffer.shift()!;
  next.mutex = 1; // signal(mutex)
  next.empty += 1; // signal(empty)

  const msg = `Consumer removed Item #${item} from buffer [Count: ${next.buffer.length}/${next.bufferCapacity}]. Empty=${next.empty}, Full=${next.full}`;
  next.log.push(msg);

  return { nextState: next, item, success: true, message: msg };
}

// 3. Dining Philosophers State
export type PhilosopherStatus = "THINKING" | "HUNGRY" | "EATING";

export interface DiningPhilosophersState {
  philosophers: PhilosopherStatus[];
  forks: (number | null)[]; // fork[i] is null if free, or philosopher index who holds it
  isDeadlocked: boolean;
  log: string[];
}

export function createDiningPhilosophers(): DiningPhilosophersState {
  return {
    philosophers: ["THINKING", "THINKING", "THINKING", "THINKING", "THINKING"],
    forks: [null, null, null, null, null],
    isDeadlocked: false,
    log: ["Initialized 5 Philosophers and 5 Forks in THINKING state."],
  };
}

export function pickForks(
  state: DiningPhilosophersState,
  philosopherIndex: number,
  strategy: "NAIVE_LEFT_FIRST" | "ASYMMETRIC"
): { nextState: DiningPhilosophersState; success: boolean; message: string } {
  const i = philosopherIndex;
  const n = 5;
  const next = {
    ...state,
    philosophers: [...state.philosophers],
    forks: [...state.forks],
    log: [...state.log],
  };

  const leftFork = i;
  const rightFork = (i + 1) % n;

  if (strategy === "NAIVE_LEFT_FIRST") {
    // If thinking, become hungry and pick left fork
    if (next.philosophers[i] === "THINKING") {
      if (next.forks[leftFork] === null) {
        next.forks[leftFork] = i;
        next.philosophers[i] = "HUNGRY";
        let msg = `Philosopher ${i} picked up Left Fork ${leftFork} (State: HUNGRY).`;

        // Check if all 5 philosophers hold their left fork -> DEADLOCK!
        const allHoldingLeft = next.forks.every((owner, fIdx) => owner === fIdx);
        if (allHoldingLeft) {
          next.isDeadlocked = true;
          msg += " DEADLOCK OCCURRED! All 5 philosophers hold left fork; waiting indefinitely for right fork!";
        }
        next.log.push(msg);
        return { nextState: next, success: true, message: msg };
      } else {
        return {
          nextState: state,
          success: false,
          message: `Philosopher ${i} could not pick Left Fork ${leftFork} (held by P${next.forks[leftFork]}).`,
        };
      }
    } else if (next.philosophers[i] === "HUNGRY") {
      // Try to pick right fork
      if (next.forks[rightFork] === null) {
        next.forks[rightFork] = i;
        next.philosophers[i] = "EATING";
        const msg = `Philosopher ${i} picked up Right Fork ${rightFork} and is now EATING!`;
        next.log.push(msg);
        return { nextState: next, success: true, message: msg };
      } else {
        return {
          nextState: state,
          success: false,
          message: `Philosopher ${i} cannot eat: Right Fork ${rightFork} is held by P${next.forks[rightFork]}.`,
        };
      }
    }
  } else {
    // Asymmetric strategy: Even philosophers pick left then right; Odd philosophers pick right then left.
    // Breaks circular wait condition!
    const firstFork = i % 2 === 0 ? leftFork : rightFork;
    const secondFork = i % 2 === 0 ? rightFork : leftFork;

    if (next.philosophers[i] === "THINKING") {
      if (next.forks[firstFork] === null) {
        next.forks[firstFork] = i;
        next.philosophers[i] = "HUNGRY";
        const msg = `Philosopher ${i} (Asymmetric) picked first fork ${firstFork}.`;
        next.log.push(msg);
        return { nextState: next, success: true, message: msg };
      }
    } else if (next.philosophers[i] === "HUNGRY") {
      if (next.forks[secondFork] === null) {
        next.forks[secondFork] = i;
        next.philosophers[i] = "EATING";
        const msg = `Philosopher ${i} picked second fork ${secondFork} and is now EATING!`;
        next.log.push(msg);
        return { nextState: next, success: true, message: msg };
      }
    }
  }

  return { nextState: state, success: false, message: `Philosopher ${i} is already eating or blocked.` };
}

export function releaseForks(
  state: DiningPhilosophersState,
  philosopherIndex: number
): { nextState: DiningPhilosophersState; success: boolean; message: string } {
  const i = philosopherIndex;
  const n = 5;
  const leftFork = i;
  const rightFork = (i + 1) % n;

  if (state.philosophers[i] === "THINKING") {
    return { nextState: state, success: false, message: `Philosopher ${i} is not holding forks.` };
  }

  const next = {
    ...state,
    philosophers: [...state.philosophers],
    forks: [...state.forks],
    log: [...state.log],
  };

  if (next.forks[leftFork] === i) next.forks[leftFork] = null;
  if (next.forks[rightFork] === i) next.forks[rightFork] = null;
  next.philosophers[i] = "THINKING";
  next.isDeadlocked = false;

  const msg = `Philosopher ${i} put down forks and resumed THINKING.`;
  next.log.push(msg);

  return { nextState: next, success: true, message: msg };
}

