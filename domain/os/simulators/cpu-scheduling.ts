/**
 * PRIME — CPU Scheduling Simulation Engine
 *
 * Deterministic scheduling algorithms:
 * - First Come First Served (FCFS)
 * - Shortest Job First (SJF Non-Preemptive)
 * - Shortest Remaining Time First (SRTF / SJF Preemptive)
 * - Priority Scheduling (Non-Preemptive & Preemptive)
 * - Round Robin (RR with configurable time quantum)
 *
 * Tie-breaking convention:
 * 1. Primary: Algorithm metric (Arrival Time, Burst Time, Priority, etc.)
 * 2. Secondary: Earliest Arrival Time
 * 3. Tertiary: Lexicographical PID order
 */

import type {
  CPUScheduleSimulation,
  CPUSchedulingAlgorithm,
  GanttBlock,
  ProcessInput,
  ProcessScheduleResult,
} from "../types";

export function simulateCPUScheduling(
  processes: ProcessInput[],
  algorithm: CPUSchedulingAlgorithm,
  timeQuantum = 2,
  priorityMode: "LOWER_NUMBER_HIGHER_PRIORITY" | "HIGHER_NUMBER_HIGHER_PRIORITY" = "LOWER_NUMBER_HIGHER_PRIORITY"
): CPUScheduleSimulation {
  if (processes.length === 0) {
    return {
      algorithm,
      timeQuantum,
      ganttChart: [],
      results: [],
      averageTurnaroundTime: 0,
      averageWaitingTime: 0,
      averageResponseTime: 0,
      cpuUtilization: 100,
      totalContextSwitches: 0,
      executionTrace: ["No processes provided."],
    };
  }

  // Validate inputs
  const validProcesses = processes.map((p) => ({
    pid: p.pid.trim() || "P?",
    arrivalTime: Math.max(0, p.arrivalTime),
    burstTime: Math.max(1, p.burstTime),
    priority: p.priority ?? 0,
  }));

  switch (algorithm) {
    case "FCFS":
      return runFCFS(validProcesses);
    case "SJF_NON_PREEMPTIVE":
      return runSJFNonPreemptive(validProcesses);
    case "SRTF":
      return runSRTF(validProcesses);
    case "PRIORITY_NON_PREEMPTIVE":
      return runPriorityNonPreemptive(validProcesses, priorityMode);
    case "PRIORITY_PREEMPTIVE":
      return runPriorityPreemptive(validProcesses, priorityMode);
    case "ROUND_ROBIN":
      return runRoundRobin(validProcesses, Math.max(1, timeQuantum));
    default:
      return runFCFS(validProcesses);
  }
}

// Helper: build metrics and simulation envelope
function finalizeSimulation(
  algorithm: CPUSchedulingAlgorithm,
  rawGantt: GanttBlock[],
  originalProcesses: ProcessInput[],
  completionTimes: Map<string, number>,
  firstResponseTimes: Map<string, number>,
  executionTrace: string[],
  timeQuantum?: number
): CPUScheduleSimulation {
  // Compress contiguous gantt blocks of the same PID
  const compressedGantt: GanttBlock[] = [];
  for (const block of rawGantt) {
    if (block.startTime === block.endTime) continue;
    if (
      compressedGantt.length > 0 &&
      compressedGantt[compressedGantt.length - 1].pid === block.pid &&
      compressedGantt[compressedGantt.length - 1].endTime === block.startTime
    ) {
      compressedGantt[compressedGantt.length - 1].endTime = block.endTime;
    } else {
      compressedGantt.push({ ...block });
    }
  }

  const results: ProcessScheduleResult[] = originalProcesses.map((p) => {
    const ct = completionTimes.get(p.pid) ?? 0;
    const tat = ct - p.arrivalTime;
    const wt = tat - p.burstTime;
    const rt = (firstResponseTimes.get(p.pid) ?? p.arrivalTime) - p.arrivalTime;

    return {
      pid: p.pid,
      arrivalTime: p.arrivalTime,
      burstTime: p.burstTime,
      priority: p.priority,
      completionTime: ct,
      turnaroundTime: Math.max(0, tat),
      waitingTime: Math.max(0, wt),
      responseTime: Math.max(0, rt),
    };
  });

  const totalTAT = results.reduce((sum, r) => sum + r.turnaroundTime, 0);
  const totalWT = results.reduce((sum, r) => sum + r.waitingTime, 0);
  const totalRT = results.reduce((sum, r) => sum + r.responseTime, 0);

  const totalTime = compressedGantt.length > 0 ? compressedGantt[compressedGantt.length - 1].endTime : 0;
  const busyTime = compressedGantt
    .filter((b) => b.pid !== "IDLE")
    .reduce((sum, b) => sum + (b.endTime - b.startTime), 0);

  const cpuUtilization = totalTime > 0 ? Math.round((busyTime / totalTime) * 1000) / 10 : 100;

  // Context switches = transitions from one process to another distinct process (excluding IDLE transitions)
  let contextSwitches = 0;
  for (let i = 1; i < compressedGantt.length; i++) {
    const prev = compressedGantt[i - 1].pid;
    const curr = compressedGantt[i].pid;
    if (prev !== curr && prev !== "IDLE" && curr !== "IDLE") {
      contextSwitches++;
    }
  }

  return {
    algorithm,
    timeQuantum,
    ganttChart: compressedGantt,
    results,
    averageTurnaroundTime: Math.round((totalTAT / results.length) * 100) / 100,
    averageWaitingTime: Math.round((totalWT / results.length) * 100) / 100,
    averageResponseTime: Math.round((totalRT / results.length) * 100) / 100,
    cpuUtilization,
    totalContextSwitches: contextSwitches,
    executionTrace,
  };
}

// 1. FCFS
function runFCFS(processes: ProcessInput[]): CPUScheduleSimulation {
  const sorted = [...processes].sort((a, b) => {
    if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
    return a.pid.localeCompare(b.pid);
  });

  let currentTime = 0;
  const gantt: GanttBlock[] = [];
  const completionTimes = new Map<string, number>();
  const firstResponseTimes = new Map<string, number>();
  const trace: string[] = [];

  for (const p of sorted) {
    if (currentTime < p.arrivalTime) {
      trace.push(`t=${currentTime}: CPU idle until t=${p.arrivalTime}`);
      gantt.push({ pid: "IDLE", startTime: currentTime, endTime: p.arrivalTime });
      currentTime = p.arrivalTime;
    }

    firstResponseTimes.set(p.pid, currentTime);
    trace.push(`t=${currentTime}: Process ${p.pid} scheduled (FCFS, burst=${p.burstTime})`);
    gantt.push({ pid: p.pid, startTime: currentTime, endTime: currentTime + p.burstTime });
    currentTime += p.burstTime;
    completionTimes.set(p.pid, currentTime);
    trace.push(`t=${currentTime}: Process ${p.pid} completed`);
  }

  return finalizeSimulation("FCFS", gantt, processes, completionTimes, firstResponseTimes, trace);
}

// 2. SJF Non-Preemptive
function runSJFNonPreemptive(processes: ProcessInput[]): CPUScheduleSimulation {
  const pending = [...processes];
  let currentTime = 0;
  const gantt: GanttBlock[] = [];
  const completionTimes = new Map<string, number>();
  const firstResponseTimes = new Map<string, number>();
  const trace: string[] = [];

  while (pending.length > 0) {
    const available = pending.filter((p) => p.arrivalTime <= currentTime);

    if (available.length === 0) {
      // Find next arrival time
      const nextArrival = Math.min(...pending.map((p) => p.arrivalTime));
      trace.push(`t=${currentTime}: CPU idle until next arrival t=${nextArrival}`);
      gantt.push({ pid: "IDLE", startTime: currentTime, endTime: nextArrival });
      currentTime = nextArrival;
      continue;
    }

    // Select shortest burst time, break ties with arrival time, then pid
    available.sort((a, b) => {
      if (a.burstTime !== b.burstTime) return a.burstTime - b.burstTime;
      if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
      return a.pid.localeCompare(b.pid);
    });

    const chosen = available[0];
    const index = pending.findIndex((p) => p.pid === chosen.pid);
    pending.splice(index, 1);

    firstResponseTimes.set(chosen.pid, currentTime);
    trace.push(`t=${currentTime}: Process ${chosen.pid} selected (Shortest burst=${chosen.burstTime})`);
    gantt.push({ pid: chosen.pid, startTime: currentTime, endTime: currentTime + chosen.burstTime });
    currentTime += chosen.burstTime;
    completionTimes.set(chosen.pid, currentTime);
    trace.push(`t=${currentTime}: Process ${chosen.pid} completed`);
  }

  return finalizeSimulation("SJF_NON_PREEMPTIVE", gantt, processes, completionTimes, firstResponseTimes, trace);
}

// 3. SRTF (Preemptive SJF)
function runSRTF(processes: ProcessInput[]): CPUScheduleSimulation {
  const remaining = new Map<string, number>();
  processes.forEach((p) => remaining.set(p.pid, p.burstTime));

  const completionTimes = new Map<string, number>();
  const firstResponseTimes = new Map<string, number>();
  const gantt: GanttBlock[] = [];
  const trace: string[] = [];

  let currentTime = 0;
  let completed = 0;
  const n = processes.length;
  let currentRunningPid: string | null = null;
  let currentBlockStart = 0;

  const maxTotalTime = Math.max(...processes.map((p) => p.arrivalTime)) +
    processes.reduce((sum, p) => sum + p.burstTime, 0) + 100;

  while (completed < n && currentTime < maxTotalTime) {
    const ready = processes.filter(
      (p) => p.arrivalTime <= currentTime && (remaining.get(p.pid) ?? 0) > 0
    );

    if (ready.length === 0) {
      if (currentRunningPid !== null) {
        gantt.push({ pid: currentRunningPid, startTime: currentBlockStart, endTime: currentTime });
        currentRunningPid = null;
      }
      const pendingArrivals = processes
        .filter((p) => (remaining.get(p.pid) ?? 0) > 0)
        .map((p) => p.arrivalTime);

      const nextArrival = Math.min(...pendingArrivals);
      gantt.push({ pid: "IDLE", startTime: currentTime, endTime: nextArrival });
      trace.push(`t=${currentTime}: CPU idle until t=${nextArrival}`);
      currentTime = nextArrival;
      continue;
    }

    ready.sort((a, b) => {
      const remA = remaining.get(a.pid) ?? 0;
      const remB = remaining.get(b.pid) ?? 0;
      if (remA !== remB) return remA - remB;
      if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
      return a.pid.localeCompare(b.pid);
    });

    const chosen = ready[0];

    if (!firstResponseTimes.has(chosen.pid)) {
      firstResponseTimes.set(chosen.pid, currentTime);
    }

    if (currentRunningPid !== chosen.pid) {
      if (currentRunningPid !== null) {
        gantt.push({ pid: currentRunningPid, startTime: currentBlockStart, endTime: currentTime });
        trace.push(`t=${currentTime}: Process ${currentRunningPid} preempted by ${chosen.pid}`);
      }
      currentRunningPid = chosen.pid;
      currentBlockStart = currentTime;
      trace.push(`t=${currentTime}: Process ${chosen.pid} starts running (rem=${remaining.get(chosen.pid)})`);
    }

    // Step 1 unit of time
    currentTime++;
    const rem = (remaining.get(chosen.pid) ?? 0) - 1;
    remaining.set(chosen.pid, rem);

    if (rem === 0) {
      gantt.push({ pid: chosen.pid, startTime: currentBlockStart, endTime: currentTime });
      completionTimes.set(chosen.pid, currentTime);
      trace.push(`t=${currentTime}: Process ${chosen.pid} completed`);
      currentRunningPid = null;
      completed++;
    }
  }

  return finalizeSimulation("SRTF", gantt, processes, completionTimes, firstResponseTimes, trace);
}

// 4. Priority Non-Preemptive
function runPriorityNonPreemptive(
  processes: ProcessInput[],
  mode: "LOWER_NUMBER_HIGHER_PRIORITY" | "HIGHER_NUMBER_HIGHER_PRIORITY"
): CPUScheduleSimulation {
  const pending = [...processes];
  let currentTime = 0;
  const gantt: GanttBlock[] = [];
  const completionTimes = new Map<string, number>();
  const firstResponseTimes = new Map<string, number>();
  const trace: string[] = [];

  while (pending.length > 0) {
    const available = pending.filter((p) => p.arrivalTime <= currentTime);

    if (available.length === 0) {
      const nextArrival = Math.min(...pending.map((p) => p.arrivalTime));
      gantt.push({ pid: "IDLE", startTime: currentTime, endTime: nextArrival });
      trace.push(`t=${currentTime}: CPU idle until t=${nextArrival}`);
      currentTime = nextArrival;
      continue;
    }

    available.sort((a, b) => {
      const prioA = a.priority ?? 0;
      const prioB = b.priority ?? 0;
      if (prioA !== prioB) {
        return mode === "LOWER_NUMBER_HIGHER_PRIORITY" ? prioA - prioB : prioB - prioA;
      }
      if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
      return a.pid.localeCompare(b.pid);
    });

    const chosen = available[0];
    const index = pending.findIndex((p) => p.pid === chosen.pid);
    pending.splice(index, 1);

    firstResponseTimes.set(chosen.pid, currentTime);
    trace.push(`t=${currentTime}: Process ${chosen.pid} selected (priority=${chosen.priority})`);
    gantt.push({ pid: chosen.pid, startTime: currentTime, endTime: currentTime + chosen.burstTime });
    currentTime += chosen.burstTime;
    completionTimes.set(chosen.pid, currentTime);
    trace.push(`t=${currentTime}: Process ${chosen.pid} completed`);
  }

  return finalizeSimulation("PRIORITY_NON_PREEMPTIVE", gantt, processes, completionTimes, firstResponseTimes, trace);
}

// 5. Priority Preemptive
function runPriorityPreemptive(
  processes: ProcessInput[],
  mode: "LOWER_NUMBER_HIGHER_PRIORITY" | "HIGHER_NUMBER_HIGHER_PRIORITY"
): CPUScheduleSimulation {
  const remaining = new Map<string, number>();
  processes.forEach((p) => remaining.set(p.pid, p.burstTime));

  const completionTimes = new Map<string, number>();
  const firstResponseTimes = new Map<string, number>();
  const gantt: GanttBlock[] = [];
  const trace: string[] = [];

  let currentTime = 0;
  let completed = 0;
  const n = processes.length;
  let currentRunningPid: string | null = null;
  let currentBlockStart = 0;

  const maxTotalTime = Math.max(...processes.map((p) => p.arrivalTime)) +
    processes.reduce((sum, p) => sum + p.burstTime, 0) + 100;

  while (completed < n && currentTime < maxTotalTime) {
    const ready = processes.filter(
      (p) => p.arrivalTime <= currentTime && (remaining.get(p.pid) ?? 0) > 0
    );

    if (ready.length === 0) {
      if (currentRunningPid !== null) {
        gantt.push({ pid: currentRunningPid, startTime: currentBlockStart, endTime: currentTime });
        currentRunningPid = null;
      }
      const pendingArrivals = processes
        .filter((p) => (remaining.get(p.pid) ?? 0) > 0)
        .map((p) => p.arrivalTime);

      const nextArrival = Math.min(...pendingArrivals);
      gantt.push({ pid: "IDLE", startTime: currentTime, endTime: nextArrival });
      trace.push(`t=${currentTime}: CPU idle until t=${nextArrival}`);
      currentTime = nextArrival;
      continue;
    }

    ready.sort((a, b) => {
      const prioA = a.priority ?? 0;
      const prioB = b.priority ?? 0;
      if (prioA !== prioB) {
        return mode === "LOWER_NUMBER_HIGHER_PRIORITY" ? prioA - prioB : prioB - prioA;
      }
      if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
      return a.pid.localeCompare(b.pid);
    });

    const chosen = ready[0];

    if (!firstResponseTimes.has(chosen.pid)) {
      firstResponseTimes.set(chosen.pid, currentTime);
    }

    if (currentRunningPid !== chosen.pid) {
      if (currentRunningPid !== null) {
        gantt.push({ pid: currentRunningPid, startTime: currentBlockStart, endTime: currentTime });
        trace.push(`t=${currentTime}: Process ${currentRunningPid} preempted by ${chosen.pid} (higher priority)`);
      }
      currentRunningPid = chosen.pid;
      currentBlockStart = currentTime;
      trace.push(`t=${currentTime}: Process ${chosen.pid} running (priority=${chosen.priority})`);
    }

    currentTime++;
    const rem = (remaining.get(chosen.pid) ?? 0) - 1;
    remaining.set(chosen.pid, rem);

    if (rem === 0) {
      gantt.push({ pid: chosen.pid, startTime: currentBlockStart, endTime: currentTime });
      completionTimes.set(chosen.pid, currentTime);
      trace.push(`t=${currentTime}: Process ${chosen.pid} completed`);
      currentRunningPid = null;
      completed++;
    }
  }

  return finalizeSimulation("PRIORITY_PREEMPTIVE", gantt, processes, completionTimes, firstResponseTimes, trace);
}

// 6. Round Robin
function runRoundRobin(processes: ProcessInput[], timeQuantum: number): CPUScheduleSimulation {
  const remaining = new Map<string, number>();
  processes.forEach((p) => remaining.set(p.pid, p.burstTime));

  const sortedArrivals = [...processes].sort((a, b) => {
    if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
    return a.pid.localeCompare(b.pid);
  });

  const completionTimes = new Map<string, number>();
  const firstResponseTimes = new Map<string, number>();
  const gantt: GanttBlock[] = [];
  const trace: string[] = [];

  let currentTime = 0;
  const readyQueue: string[] = [];
  const inQueue = new Set<string>();

  const checkNewArrivals = (upToTime: number) => {
    for (const p of sortedArrivals) {
      if (
        p.arrivalTime <= upToTime &&
        (remaining.get(p.pid) ?? 0) > 0 &&
        !inQueue.has(p.pid) &&
        !readyQueue.includes(p.pid)
      ) {
        readyQueue.push(p.pid);
        inQueue.add(p.pid);
        trace.push(`t=${p.arrivalTime}: Process ${p.pid} arrived and added to ready queue`);
      }
    }
  };

  checkNewArrivals(currentTime);

  let iterations = 0;
  const maxIterations = 5000;

  while (
    (readyQueue.length > 0 || processes.some((p) => (remaining.get(p.pid) ?? 0) > 0)) &&
    iterations++ < maxIterations
  ) {
    if (readyQueue.length === 0) {
      // Find next arrival
      const unarrived = processes.filter((p) => (remaining.get(p.pid) ?? 0) > 0);
      const nextArrival = Math.min(...unarrived.map((p) => p.arrivalTime));
      gantt.push({ pid: "IDLE", startTime: currentTime, endTime: nextArrival });
      trace.push(`t=${currentTime}: CPU idle until next arrival t=${nextArrival}`);
      currentTime = nextArrival;
      checkNewArrivals(currentTime);
      continue;
    }

    const currentPid = readyQueue.shift()!;
    inQueue.delete(currentPid);

    if (!firstResponseTimes.has(currentPid)) {
      firstResponseTimes.set(currentPid, currentTime);
    }

    const rem = remaining.get(currentPid) ?? 0;
    const runDuration = Math.min(timeQuantum, rem);
    const start = currentTime;
    const end = currentTime + runDuration;

    gantt.push({ pid: currentPid, startTime: start, endTime: end });
    trace.push(`t=${start}: Process ${currentPid} runs for ${runDuration} units (remaining=${rem - runDuration})`);

    currentTime = end;
    remaining.set(currentPid, rem - runDuration);

    // Any processes arriving DURING this time slice enter ready queue first
    checkNewArrivals(currentTime);

    if (rem - runDuration > 0) {
      // Re-queue process
      readyQueue.push(currentPid);
      inQueue.add(currentPid);
      trace.push(`t=${currentTime}: Time quantum expired for ${currentPid}. Re-queued.`);
    } else {
      completionTimes.set(currentPid, currentTime);
      trace.push(`t=${currentTime}: Process ${currentPid} finished execution.`);
    }
  }

  return finalizeSimulation(
    "ROUND_ROBIN",
    gantt,
    processes,
    completionTimes,
    firstResponseTimes,
    trace,
    timeQuantum
  );
}

