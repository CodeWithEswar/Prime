import { describe, expect, it } from "vitest";
import {
  ProcessStateSimulator,
  simulateCPUScheduling,
  createPetersonState,
  stepPeterson,
  createBoundedBuffer,
  produceItem,
  consumeItem,
  createDiningPhilosophers,
  pickForks,
  runBankersSafetyAlgorithm,
  requestResources,
  translateAddress,
  simulatePageReplacement,
  checkBeladysAnomaly,
  simulateDiskScheduling,
} from "@/domain/os";

describe("1. Process State Machine Simulator", () => {
  it("executes valid full process lifecycle from New to Terminated", () => {
    const sim = new ProcessStateSimulator();
    expect(sim.pcb.state).toBe("New");

    expect(sim.transition("admit").success).toBe(true);
    expect(sim.pcb.state).toBe("Ready");

    expect(sim.transition("dispatch").success).toBe(true);
    expect(sim.pcb.state).toBe("Running");

    expect(sim.transition("timeout").success).toBe(true);
    expect(sim.pcb.state).toBe("Ready");

    expect(sim.transition("dispatch").success).toBe(true);
    expect(sim.pcb.state).toBe("Running");

    expect(sim.transition("io_wait").success).toBe(true);
    expect(sim.pcb.state).toBe("Waiting");

    expect(sim.transition("io_completion").success).toBe(true);
    expect(sim.pcb.state).toBe("Ready");

    expect(sim.transition("dispatch").success).toBe(true);
    expect(sim.pcb.state).toBe("Running");

    expect(sim.transition("exit").success).toBe(true);
    expect(sim.pcb.state).toBe("Terminated");
  });

  it("rejects invalid direct transitions like Waiting -> Running", () => {
    const sim = new ProcessStateSimulator();
    sim.transition("admit"); // Ready
    sim.transition("dispatch"); // Running
    sim.transition("io_wait"); // Waiting

    // Attempt invalid direct dispatch from Waiting to Running
    const res = sim.transition("dispatch");
    expect(res.success).toBe(false);
    expect(sim.pcb.state).toBe("Waiting");
    expect(res.error).toContain("Cannot execute 'dispatch' from state 'Waiting'");
  });
});

describe("2. CPU Scheduling Simulator", () => {
  const textbookProcesses = [
    { pid: "P1", arrivalTime: 0, burstTime: 8, priority: 3 },
    { pid: "P2", arrivalTime: 1, burstTime: 4, priority: 1 },
    { pid: "P3", arrivalTime: 2, burstTime: 9, priority: 4 },
    { pid: "P4", arrivalTime: 3, burstTime: 5, priority: 2 },
  ];

  it("calculates exact FCFS metrics and timeline", () => {
    const res = simulateCPUScheduling(textbookProcesses, "FCFS");
    expect(res.algorithm).toBe("FCFS");
    expect(res.results.find((p) => p.pid === "P1")?.completionTime).toBe(8);
    expect(res.results.find((p) => p.pid === "P2")?.completionTime).toBe(12);
    expect(res.results.find((p) => p.pid === "P3")?.completionTime).toBe(21);
    expect(res.results.find((p) => p.pid === "P4")?.completionTime).toBe(26);

    // Turnaround times: P1: 8-0=8, P2: 12-1=11, P3: 21-2=19, P4: 26-3=23 -> Avg = 61/4 = 15.25
    expect(res.averageTurnaroundTime).toBe(15.25);
    // Waiting times: P1: 8-8=0, P2: 11-4=7, P3: 19-9=10, P4: 23-5=18 -> Avg = 35/4 = 8.75
    expect(res.averageWaitingTime).toBe(8.75);
    expect(res.cpuUtilization).toBe(100);
  });

  it("calculates exact SJF Non-Preemptive metrics", () => {
    const res = simulateCPUScheduling(textbookProcesses, "SJF_NON_PREEMPTIVE");
    // At t=0: P1 runs (0-8)
    // At t=8: P2(4), P3(9), P4(5) ready -> P2 runs (8-12)
    // At t=12: P4(5) vs P3(9) -> P4 runs (12-17)
    // At t=17: P3 runs (17-26)
    expect(res.results.find((p) => p.pid === "P1")?.completionTime).toBe(8);
    expect(res.results.find((p) => p.pid === "P2")?.completionTime).toBe(12);
    expect(res.results.find((p) => p.pid === "P4")?.completionTime).toBe(17);
    expect(res.results.find((p) => p.pid === "P3")?.completionTime).toBe(26);

    // Avg TAT: (8 + 11 + 24 + 14) / 4 = 57 / 4 = 14.25
    expect(res.averageTurnaroundTime).toBe(14.25);
    // Avg WT: (0 + 7 + 15 + 9) / 4 = 31 / 4 = 7.75
    expect(res.averageWaitingTime).toBe(7.75);
  });

  it("calculates SRTF preemptive scheduling correctly", () => {
    const srtfProcesses = [
      { pid: "P1", arrivalTime: 0, burstTime: 8 },
      { pid: "P2", arrivalTime: 1, burstTime: 4 },
      { pid: "P3", arrivalTime: 2, burstTime: 9 },
      { pid: "P4", arrivalTime: 3, burstTime: 5 },
    ];
    const res = simulateCPUScheduling(srtfProcesses, "SRTF");
    // At t=1: P1 ran 1 (rem 7). P2 arrives with burst 4 < 7 -> Preemption!
    expect(res.ganttChart[0]).toEqual({ pid: "P1", startTime: 0, endTime: 1 });
    expect(res.ganttChart[1]).toEqual({ pid: "P2", startTime: 1, endTime: 5 });
    expect(res.totalContextSwitches).toBeGreaterThan(0);
  });

  it("calculates Round Robin scheduling with time quantum", () => {
    const rrProcesses = [
      { pid: "P1", arrivalTime: 0, burstTime: 4 },
      { pid: "P2", arrivalTime: 1, burstTime: 5 },
      { pid: "P3", arrivalTime: 2, burstTime: 2 },
    ];
    const res = simulateCPUScheduling(rrProcesses, "ROUND_ROBIN", 2);
    expect(res.ganttChart.length).toBeGreaterThan(3);
    expect(res.results.every((r) => r.completionTime > 0)).toBe(true);
  });
});

describe("3. Synchronization Simulator", () => {
  it("enforces mutual exclusion in Peterson's algorithm", () => {
    let state = createPetersonState();
    // P0 requests entry
    let res = stepPeterson(state, 0);
    state = res.nextState; // flag[0] = true
    res = stepPeterson(state, 0);
    state = res.nextState; // turn = 1
    res = stepPeterson(state, 0);
    state = res.nextState; // P0 enters CS

    expect(state.criticalSection).toBe(0);

    // P1 tries to enter CS
    res = stepPeterson(state, 1);
    state = res.nextState; // flag[1] = true
    res = stepPeterson(state, 1);
    state = res.nextState; // turn = 0
    res = stepPeterson(state, 1); // while (flag[0] && turn == 0) -> BLOCKED!

    expect(res.blocked).toBe(true);
    expect(state.criticalSection).toBe(0);
  });

  it("manages bounded buffer semaphores and prevents overflow/underflow", () => {
    let bb = createBoundedBuffer(3);
    expect(bb.empty).toBe(3);
    expect(bb.full).toBe(0);

    // Produce 3 items
    bb = produceItem(bb, 101).nextState;
    bb = produceItem(bb, 102).nextState;
    bb = produceItem(bb, 103).nextState;
    expect(bb.buffer.length).toBe(3);
    expect(bb.empty).toBe(0);

    // 4th produce must fail
    const overflow = produceItem(bb, 104);
    expect(overflow.success).toBe(false);

    // Consume items
    const c1 = consumeItem(bb);
    expect(c1.success).toBe(true);
    expect(c1.item).toBe(101);
    expect(c1.nextState.empty).toBe(1);
  });

  it("detects dining philosophers deadlock when all 5 pick left fork", () => {
    let dp = createDiningPhilosophers();
    for (let i = 0; i < 5; i++) {
      dp = pickForks(dp, i, "NAIVE_LEFT_FIRST").nextState;
    }
    expect(dp.isDeadlocked).toBe(true);

    // Asymmetric strategy prevents deadlock
    let dpAsym = createDiningPhilosophers();
    for (let i = 0; i < 4; i++) {
      dpAsym = pickForks(dpAsym, i, "ASYMMETRIC").nextState;
    }
    expect(dpAsym.isDeadlocked).toBe(false);
  });
});

describe("4. Deadlock & Banker's Algorithm", () => {
  const textbookBankersInput = {
    numProcesses: 5,
    numResources: 3,
    available: [3, 3, 2],
    allocation: [
      [0, 1, 0], // P0
      [2, 0, 0], // P1
      [3, 0, 2], // P2
      [2, 1, 1], // P3
      [0, 0, 2], // P4
    ],
    max: [
      [7, 5, 3], // P0
      [3, 2, 2], // P1
      [9, 0, 2], // P2
      [2, 2, 2], // P3
      [4, 3, 3], // P4
    ],
  };

  it("determines system is SAFE and derives valid safe sequence", () => {
    const res = runBankersSafetyAlgorithm(textbookBankersInput);
    expect(res.isSafe).toBe(true);
    expect(res.safeSequence).not.toBeNull();
    expect(res.safeSequence?.length).toBe(5);
    // Typical safe sequence starts with P1
    expect(res.safeSequence?.[0]).toBe(1);
    expect(res.need[0]).toEqual([7, 4, 3]);
    expect(res.need[1]).toEqual([1, 2, 2]);
  });

  it("approves safe resource request for P1 [1, 0, 2]", () => {
    const res = requestResources(textbookBankersInput, 1, [1, 0, 2]);
    expect(res.canGrant).toBe(true);
    expect(res.safetyCheck?.isSafe).toBe(true);
  });

  it("rejects resource request exceeding declared maximum", () => {
    // P1 Need is [1, 2, 2], request [2, 0, 0] exceeds need
    const res = requestResources(textbookBankersInput, 1, [2, 0, 0]);
    expect(res.canGrant).toBe(false);
    expect(res.reason).toContain("exceeds its declared maximum need");
  });
});

describe("5. Page Replacement Simulator", () => {
  const refString = [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1];

  it("calculates exact FIFO, LRU, and Optimal faults for 3 frames", () => {
    const fifo = simulatePageReplacement(refString, 3, "FIFO");
    expect(fifo.totalPageFaults).toBe(15);

    const lru = simulatePageReplacement(refString, 3, "LRU");
    expect(lru.totalPageFaults).toBe(12);

    const opt = simulatePageReplacement(refString, 3, "OPTIMAL");
    expect(opt.totalPageFaults).toBe(9);
  });

  it("verifies Bélády's Anomaly where 4 frames produce more faults than 3 frames", () => {
    const beladyString = [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5];
    const check = checkBeladysAnomaly(beladyString, 3, 4);
    expect(check.smallerFaults).toBe(9);
    expect(check.largerFaults).toBe(10);
    expect(check.isAnomaly).toBe(true);
  });

  it("translates logical to physical address with TLB lookup", () => {
    const pageTable = { 2: 7 }; // Page 2 -> Frame 7
    const tlb = { 2: 7 }; // In TLB
    const res = translateAddress(2 * 4096 + 120, 4096, pageTable, tlb);
    expect(res.pageNumber).toBe(2);
    expect(res.offset).toBe(120);
    expect(res.frameNumber).toBe(7);
    expect(res.physicalAddress).toBe(7 * 4096 + 120);
    expect(res.tlbHit).toBe(true);
  });
});

describe("6. Disk Scheduling Simulator", () => {
  const requests = [98, 183, 37, 122, 14, 124, 65, 67];
  const initialHead = 53;

  it("calculates exact FCFS disk head movements (640 cylinders)", () => {
    const fcfs = simulateDiskScheduling(requests, initialHead, "FCFS");
    expect(fcfs.totalHeadMovement).toBe(640);
  });

  it("calculates SSTF disk head movements (236 cylinders)", () => {
    const sstf = simulateDiskScheduling(requests, initialHead, "SSTF");
    expect(sstf.totalHeadMovement).toBe(236);
  });

  it("calculates SCAN (Elevator) disk head movements sweeping UP (331 cylinders)", () => {
    const scan = simulateDiskScheduling(requests, initialHead, "SCAN", "UP", 200);
    expect(scan.totalHeadMovement).toBe(331);
    expect(scan.trajectory).toContain(199); // reaches end boundary
  });

  it("calculates LOOK disk head movements sweeping UP (299 cylinders)", () => {
    const look = simulateDiskScheduling(requests, initialHead, "LOOK", "UP", 200);
    expect(look.totalHeadMovement).toBe(299);
    expect(look.trajectory).not.toContain(199); // stops at 183
  });
});

