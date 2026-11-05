/**
 * PRIME — Process State Machine Simulator
 *
 * Deterministic model of the 5-state process lifecycle:
 * New -> Ready -> Running -> Waiting -> Terminated
 */

import type {
  ProcessControlBlock,
  ProcessState,
  ProcessStateTransitionLog,
  ProcessTransitionEvent,
} from "../types";

export interface ProcessStateEngine {
  pcb: ProcessControlBlock;
  logs: ProcessStateTransitionLog[];
  transition: (event: ProcessTransitionEvent, reason?: string) => { success: boolean; error?: string };
  reset: () => void;
  updatePCB: (updates: Partial<ProcessControlBlock>) => void;
}

const VALID_TRANSITIONS: Record<ProcessState, Partial<Record<ProcessTransitionEvent, ProcessState>>> = {
  New: {
    admit: "Ready",
  },
  Ready: {
    dispatch: "Running",
  },
  Running: {
    timeout: "Ready",
    io_wait: "Waiting",
    exit: "Terminated",
  },
  Waiting: {
    io_completion: "Ready",
  },
  Terminated: {},
};

export function createInitialPCB(pid = 101, name = "prime-worker"): ProcessControlBlock {
  return {
    pid,
    name,
    state: "New",
    programCounter: 0x00400000,
    cpuRegisters: {
      RAX: 0,
      RBX: 1,
      RCX: 0,
      RDX: 0,
      RSP: 0x7fff5fbff,
      RBP: 0x7fff5fbff,
    },
    memoryBase: 0x00400000,
    memoryLimit: 0x004fffff,
    openFilesCount: 3, // stdin, stdout, stderr
    priority: 1,
  };
}

export function validateProcessTransition(
  currentState: ProcessState,
  event: ProcessTransitionEvent
): { valid: boolean; targetState?: ProcessState; reason: string } {
  const allowed = VALID_TRANSITIONS[currentState];
  const target = allowed ? allowed[event] : undefined;

  if (target) {
    return {
      valid: true,
      targetState: target,
      reason: `Valid transition: ${currentState} -> ${target} via event '${event}'`,
    };
  }

  return {
    valid: false,
    reason: `Invalid transition: Cannot execute '${event}' from state '${currentState}'. Only valid transitions from '${currentState}' are: ${
      Object.keys(allowed || {}).join(", ") || "None (Terminal state)"
    }`,
  };
}

export class ProcessStateSimulator implements ProcessStateEngine {
  public pcb: ProcessControlBlock;
  public logs: ProcessStateTransitionLog[] = [];

  constructor(initialPCB?: ProcessControlBlock) {
    this.pcb = initialPCB ? { ...initialPCB } : createInitialPCB();
  }

  public transition(
    event: ProcessTransitionEvent,
    reason = ""
  ): { success: boolean; error?: string } {
    const check = validateProcessTransition(this.pcb.state, event);
    const fromState = this.pcb.state;
    const now = Date.now();

    if (!check.valid || !check.targetState) {
      this.logs.push({
        timestamp: now,
        fromState,
        toState: fromState,
        event,
        reason: reason ? `${reason} (${check.reason})` : check.reason,
        success: false,
      });
      return { success: false, error: check.reason };
    }

    const toState = check.targetState;
    this.pcb.state = toState;

    // Simulate state-dependent PCB register and counter mutations
    if (toState === "Running") {
      this.pcb.programCounter += 4;
      this.pcb.cpuRegisters.RAX = (this.pcb.cpuRegisters.RAX + 1) % 1000;
    } else if (toState === "Terminated") {
      this.pcb.openFilesCount = 0;
    }

    this.logs.push({
      timestamp: now,
      fromState,
      toState,
      event,
      reason: reason || check.reason,
      success: true,
    });

    return { success: true };
  }

  public updatePCB(updates: Partial<ProcessControlBlock>): void {
    this.pcb = { ...this.pcb, ...updates };
  }

  public reset(): void {
    this.pcb = createInitialPCB();
    this.logs = [];
  }
}

