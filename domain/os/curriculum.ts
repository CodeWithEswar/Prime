/**
 * PRIME — 12-Day Operating Systems Learning Curriculum
 *
 * Full course specification matching Neso Academy structure,
 * laboratory assignments, practical deliverables, and interview questions.
 */

import type { OSDaySchedule } from "./types";

export const OS_12_DAY_CURRICULUM: OSDaySchedule[] = [
  {
    dayNumber: 1,
    title: "OS Fundamentals & Architecture",
    subtitle: "Kernel, System Hardware & Dual-Mode Operation",
    summary:
      "Core operating system abstractions: kernel vs user space, privileged instructions, dual-mode execution, trap/interrupt vector tables, and core OS services.",
    focus: "OS Architecture & Dual-Mode Mechanics",
    estimatedMinutes: 95,
    videoPositions: [1, 2, 3, 4, 5, 6, 7, 8],
    deliverable: "Explain kernel, interrupts, user/kernel modes; draw OS architecture",
    practicalAssignment: {
      title: "Operating System Dual Mode Operation & Architecture",
      description:
        "Explain how the hardware mode bit protects RAM and hardware devices, and write the sequence of events during a hardware timer interrupt.",
      problemId: "os-ex-01",
    },
    learningOutcomes: [
      "Understand the dual role of the OS: Extended Machine (Abstraction) and Resource Manager.",
      "Trace user mode (mode bit 1) to kernel mode (mode bit 0) transitions via software traps.",
      "Analyze interrupt handling: interrupt vector table, context save, and return from interrupt (RTI).",
      "Differentiate monolithic, layered, and microkernel structural designs.",
    ],
    interviewQuestions: [
      {
        id: "os-q-01",
        question: "What is the dual-mode operation in modern CPUs, and why is it essential?",
        answer:
          "Dual-mode operation separates CPU execution into unprivileged User Mode and privileged Kernel Mode. It ensures user applications cannot execute privileged instructions (like disabling interrupts, modifying page tables, or accessing raw I/O registers) directly, preventing system crashes and security compromise.",
        importance: "Critical",
        category: "Architecture",
      },
      {
        id: "os-q-02",
        question: "What is the difference between a trap, an interrupt, and an exception?",
        answer:
          "An Interrupt is an asynchronous hardware signal from an external device (e.g. keyboard press, network packet). A Trap (or software interrupt) is a synchronous instruction executed intentionally by software (e.g., a system call `syscall` or `int 0x80`). An Exception is an unintentional synchronous CPU event caused by an error (e.g., divide-by-zero, page fault).",
        importance: "High",
        category: "Architecture",
      },
    ],
    labSlug: "process-state",
  },
  {
    dayNumber: 2,
    title: "System Calls & Operating System Structure",
    subtitle: "Interface, Booting, System Programs & Microkernels",
    summary:
      "Programmatic interface between user applications and the kernel. Types of system calls, parameter passing, system boots, and virtualization architectures.",
    focus: "System Calls & System Boot Sequence",
    estimatedMinutes: 90,
    videoPositions: [9, 10, 11, 12, 13, 14, 15],
    deliverable: "Trace a system call; compare monolithic and microkernels",
    practicalAssignment: {
      title: "System Call Tracing: File Copy Operation",
      description:
        "Trace the exact sequence of POSIX system calls executed when copying a file from source to destination.",
      problemId: "os-ex-02",
    },
    learningOutcomes: [
      "Understand the 5 major system call categories: Process Control, File Management, Device Management, Information Maintenance, and Communications.",
      "Compare system call parameter passing methods: CPU Registers, In-Memory Blocks/Tables, and System Stack.",
      "Analyze Monolithic vs Microkernel tradeoffs (Mach/QNX vs Linux) regarding modularity, IPC latency, and crash isolation.",
      "Understand System Generation and the multi-stage bootstrap loader sequence (BIOS/UEFI -> Bootloader -> Kernel init).",
    ],
    interviewQuestions: [
      {
        id: "os-q-03",
        question: "How are parameters passed from user programs to system calls in the kernel?",
        answer:
          "Parameters are passed in three ways: 1) In CPU registers (fastest, but limited by register count); 2) In a memory block/table, with a single pointer to that block passed in a register (most common for complex calls); 3) Pushed onto the program stack by user code and popped by the kernel.",
        importance: "High",
        category: "System Calls",
      },
      {
        id: "os-q-04",
        question: "Monolithic Kernel vs Microkernel: What are the primary trade-offs?",
        answer:
          "Monolithic kernels run all OS services (file systems, networking, device drivers, scheduler) in kernel space. They offer high performance due to direct function calls without IPC context switches, but a bug in any driver can panic the entire OS. Microkernels run only bare essentials in kernel space (IPC, minimal memory, CPU scheduling) and move file systems/drivers to user-space servers. They provide superior fault isolation and modularity at the cost of IPC message-passing overhead.",
        importance: "Critical",
        category: "Architecture",
      },
    ],
  },
  {
    dayNumber: 3,
    title: "Process Concept, PCB & Process Lifecycle",
    subtitle: "5-State Machine, Context Switching & Process Creation",
    summary:
      "Process abstraction, Process Control Block (PCB) fields, 5-state lifecycle, context switch costs, and parent-child hierarchy via fork().",
    focus: "Process State Machine & Context Switching",
    estimatedMinutes: 88,
    videoPositions: [16, 17, 18, 19, 20, 21, 22],
    deliverable: "Draw process-state machine; explain fork and process lifecycle",
    practicalAssignment: {
      title: "Process State Transitions & PCB Analysis",
      description:
        "Analyze PCB fields and explain why uniprocessor OSes forbid direct Waiting -> Running state transitions.",
      problemId: "os-ex-03",
    },
    learningOutcomes: [
      "Model the 5-state process lifecycle: New, Ready, Running, Waiting, and Terminated.",
      "Examine Process Control Block (PCB) structure: PID, PC, Registers, Memory limits, Open files, CPU scheduling state.",
      "Evaluate CPU context switch latency: saving registers, restoring PCB, cache misses, and TLB flushes.",
      "Trace UNIX process creation: fork(), address space duplication, COW (Copy-On-Write), and wait() / exit().",
    ],
    interviewQuestions: [
      {
        id: "os-q-05",
        question: "What exactly happens during a CPU context switch?",
        answer:
          "During a context switch: 1) The OS saves the CPU register state and Program Counter of the running process into its PCB; 2) It updates the process state (e.g. from Running to Ready or Waiting); 3) It places the PCB on the appropriate queue; 4) The scheduler selects the next process; 5) The OS loads the new process's register context, PC, and memory map (updating CR3/page directory on x86, which flushes TLB); 6) The CPU resumes execution of the new process.",
        importance: "Critical",
        category: "Process Management",
      },
      {
        id: "os-q-06",
        question: "What are Zombie and Orphan processes in UNIX?",
        answer:
          "A Zombie process has terminated execution, but its exit status remains in the process table because its parent has not yet called wait(). An Orphan process is still actively running after its parent has terminated; it is reparented to init/systemd (PID 1), which periodically calls wait() to reap terminating orphans.",
        importance: "Critical",
        category: "Process Management",
      },
    ],
    labSlug: "process-state",
  },
  {
    dayNumber: 4,
    title: "IPC, Sockets, RPC & Multithreading",
    subtitle: "Shared Memory vs Message Passing, Sockets, pthreads",
    summary:
      "Inter-Process Communication mechanisms (pipes, shared memory, sockets, RPC) and thread architectures: user vs kernel threads, 1:1, M:1, and M:N models.",
    focus: "Inter-Process Communication & Thread Models",
    estimatedMinutes: 165,
    videoPositions: [23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35],
    deliverable: "Compare IPC models; run fork/exec example where supported",
    practicalAssignment: {
      title: "fork() System Call Tree & Execution Count",
      description: "Derive the exact number of processes created by nested fork invocations.",
      problemId: "os-ex-04",
    },
    learningOutcomes: [
      "Compare Shared Memory (fastest, requires sync) vs Message Passing (pipes/queues, kernel-mediated).",
      "Understand Socket programming primitives and Remote Procedure Call (RPC) stub/skeleton semantics.",
      "Differentiate User-Level Threads (ULT, lightweight, blocking I/O halts all) from Kernel-Level Threads (KLT, parallel multicore execution).",
      "Analyze Threading issues: fork() with threads, thread cancellation (asynchronous vs deferred), and signal delivery.",
    ],
    interviewQuestions: [
      {
        id: "os-q-07",
        question: "What is the fundamental difference between a Process and a Thread?",
        answer:
          "A process is an execution unit with its own independent virtual address space, memory segments (code, data, heap, stack), file descriptors, and security context. A thread is a lightweight execution flow inside a process. Threads of the same process share the text, data, heap, and open files, but possess their own private Program Counter, register set, and stack.",
        importance: "Critical",
        category: "Threads",
      },
      {
        id: "os-q-08",
        question: "What is Copy-on-Write (COW) and how does fork() use it?",
        answer:
          "Copy-on-Write is an optimization where the OS delays copying physical memory pages during fork(). Instead, the child's page table points to the parent's physical frames, and the pages are marked read-only. If either process attempts to write, a page fault occurs, and the kernel duplicates only that modified frame, marking it writable. This makes fork() nearly instantaneous.",
        importance: "Critical",
        category: "Memory & Processes",
      },
    ],
  },
  {
    dayNumber: 5,
    title: "CPU Scheduling: FCFS & Shortest Job First",
    subtitle: "Burst Cycles, Preemption, FCFS & SJF Derivations",
    summary:
      "CPU scheduler goals (throughput, turnaround, waiting, response time). Detailed mechanics and Gantt chart derivations for FCFS and non-preemptive SJF.",
    focus: "CPU Scheduling Metrics & SJF Optimality",
    estimatedMinutes: 135,
    videoPositions: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
    deliverable: "Solve Gantt chart and timing numericals",
    practicalAssignment: {
      title: "FCFS and SJF CPU Scheduling Numerical",
      description:
        "Compute Completion Time, Turnaround Time, and Waiting Time for 4 arriving processes under FCFS and SJF.",
      problemId: "os-ex-05",
    },
    learningOutcomes: [
      "Master scheduling criteria: CPU Utilization, Throughput, Turnaround Time (TAT = CT - AT), Waiting Time (WT = TAT - BT), and Response Time.",
      "Identify the Convoy Effect in FCFS when CPU-bound processes delay short I/O-bound processes.",
      "Understand why SJF is provably optimal for minimizing average waiting time.",
      "Analyze SJF estimation of future CPU bursts via exponential moving average: tau_{n+1} = alpha * t_n + (1 - alpha) * tau_n.",
    ],
    interviewQuestions: [
      {
        id: "os-q-09",
        question: "What is the Convoy Effect in CPU scheduling, and which algorithm suffers from it?",
        answer:
          "The Convoy Effect occurs in FCFS scheduling when a CPU-intensive process with a large burst time holds the CPU, while multiple short I/O-intensive jobs queue behind it in the Ready queue, resulting in poor CPU and device utilization.",
        importance: "High",
        category: "CPU Scheduling",
      },
      {
        id: "os-q-10",
        question: "Why is Shortest Job First (SJF) optimal for average waiting time, and why is it hard to implement in practice?",
        answer:
          "SJF is mathematically optimal because scheduling shorter jobs first clears them from the wait queue rapidly, reducing accumulated wait time. However, it cannot be implemented perfectly in general-purpose OSes because the exact duration of the next CPU burst cannot be known in advance and must be approximated.",
        importance: "Critical",
        category: "CPU Scheduling",
      },
    ],
    labSlug: "cpu-scheduling",
  },
  {
    dayNumber: 6,
    title: "Preemptive Scheduling: SRTF, Priority & Round Robin",
    subtitle: "Round Robin Quantum, Priority Starvation & Multilevel Queues",
    summary:
      "Preemptive CPU scheduling algorithms: Shortest Remaining Time First (SRTF), Priority Preemptive/Non-preemptive, Round Robin, time quantum trade-offs, and Multilevel Feedback Queues.",
    focus: "Round Robin & Preemptive CPU Algorithms",
    estimatedMinutes: 145,
    videoPositions: [46, 47, 48, 49, 50, 51, 52, 53, 54, 55],
    deliverable: "Solve >= 10 scheduling cases; analyze starvation and quantum",
    practicalAssignment: {
      title: "Round Robin & SRTF Preemptive Scheduling",
      description:
        "Simulate Round Robin with time quantum q = 2 ms, trace the ready queue at context switches, and compute average waiting time.",
      problemId: "os-ex-06",
    },
    learningOutcomes: [
      "Trace Shortest Remaining Time First (SRTF) preemption when a new process arrives with a shorter burst.",
      "Analyze Priority scheduling starvation (indefinite blocking) and its remediation via Aging.",
      "Master Round Robin time quantum tuning: high quantum degrades into FCFS; tiny quantum wastes CPU in context switch overhead (thumb rule: 80% of bursts should finish in 1 quantum).",
      "Understand Multilevel Feedback-Queue (MLFQ) scheduling: dynamic priority promotion/demotion.",
    ],
    interviewQuestions: [
      {
        id: "os-q-11",
        question: "How does the choice of time quantum affect Round Robin scheduling?",
        answer:
          "If the time quantum is too large, Round Robin degenerates into FCFS. If it is too small, context switch overhead dominates, drastically lowering CPU utilization. The ideal quantum should be slightly greater than the typical interactive CPU burst so that ~80% of bursts complete within a single quantum.",
        importance: "Critical",
        category: "CPU Scheduling",
      },
      {
        id: "os-q-12",
        question: "What is Priority Inversion and how is it resolved?",
        answer:
          "Priority Inversion occurs when a high-priority task is blocked waiting for a shared lock held by a low-priority task, while a medium-priority task preempts the low-priority task, indirectly starving the high-priority task. It is resolved using Priority Inheritance Protocol, where the low-priority task temporarily inherits the high priority until it releases the resource.",
        importance: "Critical",
        category: "Concurrency & Scheduling",
      },
    ],
    labSlug: "cpu-scheduling",
  },
  {
    dayNumber: 7,
    title: "Process Synchronization: Critical Section & Locks",
    subtitle: "Mutual Exclusion, Peterson's Solution & Hardware Test-and-Set",
    summary:
      "Race conditions in concurrent systems. The three critical section requirements: Mutual Exclusion, Progress, and Bounded Waiting. Peterson's 2-process solution, Test-and-Set (TSL), and Compare-and-Swap (CAS).",
    focus: "Critical Section Problem & Software Solutions",
    estimatedMinutes: 89,
    videoPositions: [56, 57, 58, 59, 60, 61],
    deliverable: "Explain mutual exclusion; implement safe counter",
    practicalAssignment: {
      title: "Peterson's Algorithm Correctness & Hardware Locks",
      description:
        "Prove why Peterson's solution satisfies Mutual Exclusion, Progress, and Bounded Waiting, and show how instruction reordering breaks it.",
      problemId: "os-ex-07",
    },
    learningOutcomes: [
      "Identify race conditions where output depends on non-deterministic thread execution order.",
      "Define the 3 non-negotiable Critical Section requirements: Mutual Exclusion, Progress, and Bounded Waiting.",
      "Prove correctness of Peterson's algorithm: flag[i] = true, turn = j, while (flag[j] && turn == j).",
      "Understand Hardware Atomic instructions: TestAndSetLock (TSL) and CompareAndSwap (CAS).",
    ],
    interviewQuestions: [
      {
        id: "os-q-13",
        question: "What are the three essential requirements for any valid solution to the critical-section problem?",
        answer:
          "1. Mutual Exclusion: If process Pi is executing in its critical section, no other processes can be executing in theirs.\n2. Progress: If no process is in its CS and some processes wish to enter, only those not in their remainder section can participate in deciding who enters next, and this selection cannot be postponed indefinitely.\n3. Bounded Waiting: A bound must exist on the number of times other processes are allowed to enter their CS after a process has requested entry before its request is granted (preventing starvation).",
        importance: "Critical",
        category: "Synchronization",
      },
      {
        id: "os-q-14",
        question: "What is a Spinlock? When is it preferred over a Mutex?",
        answer:
          "A Spinlock busy-waits in a tight CPU loop checking an atomic lock without putting the thread to sleep. It is preferred in multi-core systems when the expected wait duration in the critical section is less than the time required to perform two context switches (sleep and wake). In uniprocessor systems, spinlocks are completely wasteful.",
        importance: "High",
        category: "Synchronization",
      },
    ],
    labSlug: "synchronization",
  },
  {
    dayNumber: 8,
    title: "Semaphores & Classic Concurrency Problems",
    subtitle: "Producer-Consumer, Readers-Writers & Dining Philosophers",
    summary:
      "Counting and Binary Semaphores (wait/P and signal/V operations). Classic synchronization challenges: Bounded Buffer, Readers-Writers with writer starvation prevention, and Dining Philosophers.",
    focus: "Semaphores & Classic Synchronization Problems",
    estimatedMinutes: 139,
    videoPositions: [62, 63, 64, 65, 66, 67, 68, 69, 70, 71],
    deliverable: "Solve synchronization scenarios and identify race/deadlock risks",
    practicalAssignment: {
      title: "Classic Synchronization: Readers-Writers with Semaphores",
      description: "Implement fair readers-writers synchronization that prevents writer starvation.",
      problemId: "os-ex-08",
    },
    learningOutcomes: [
      "Understand Semaphore primitives: wait(S) / P(S) [atomic decrement & block] and signal(S) / V(S) [atomic increment & unblock].",
      "Implement Bounded Buffer using three semaphores: mutex (binary), empty (counting), and full (counting).",
      "Model Readers-Writers problem and implement a fair entry turnstile to eliminate writer starvation.",
      "Solve the Dining Philosophers problem avoiding circular wait deadlock via asymmetric pickup or monitors.",
    ],
    interviewQuestions: [
      {
        id: "os-q-15",
        question: "What is the difference between a Mutex and a Binary Semaphore?",
        answer:
          "A Mutex is a locking mechanism with strict ownership: only the thread that acquired the mutex is permitted to release it. A Semaphore is a signaling mechanism: any thread can signal a semaphore to unblock another waiting thread. Mutexes often support priority inheritance to solve priority inversion, which semaphores do not.",
        importance: "Critical",
        category: "Synchronization",
      },
      {
        id: "os-q-16",
        question: "How do you solve the Dining Philosophers problem without deadlocks?",
        answer:
          "Deadlock can be prevented by breaking the circular wait condition: 1) Asymmetric solution: odd philosophers pick right fork then left; even philosophers pick left fork then right; 2) Limit diners: allow at most 4 philosophers to sit at the table simultaneously; 3) Atomic pickup (Monitors): a philosopher can pick up forks only if both left and right are simultaneously free.",
        importance: "High",
        category: "Synchronization",
      },
    ],
    labSlug: "synchronization",
  },
  {
    dayNumber: 9,
    title: "Deadlocks, RAG & Banker's Algorithm",
    subtitle: "Coffman Conditions, Prevention, Avoidance & Detection",
    summary:
      "Deadlock characterization: 4 Coffman conditions. Resource Allocation Graph (RAG) analysis. Banker's Algorithm for deadlock avoidance (Need = Max - Allocation) and safety derivations.",
    focus: "Deadlock Avoidance & Banker's Safety Algorithm",
    estimatedMinutes: 80,
    videoPositions: [72],
    supplementaryIds: ["supp-os-01", "supp-os-02"],
    deliverable: "Solve >= 5 safe-sequence exercises",
    practicalAssignment: {
      title: "Banker's Algorithm: Safe Sequence & Resource Request",
      description:
        "Compute Need matrix, verify system safety, derive safe sequences, and evaluate whether dynamic resource requests can be granted immediately.",
      problemId: "os-ex-09",
    },
    learningOutcomes: [
      "Master the 4 Coffman Conditions for Deadlock: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.",
      "Interpret Resource Allocation Graphs: understand why a cycle is necessary AND sufficient for single-instance resources, but only necessary for multi-instance resources.",
      "Execute Banker's Safety Algorithm step-by-step: Work = Available, Need = Max - Allocation.",
      "Simulate Resource Request Algorithm: grant request only if remaining state has a verified safe execution sequence.",
    ],
    interviewQuestions: [
      {
        id: "os-q-17",
        question: "What are the four necessary conditions for a deadlock to occur (Coffman conditions)?",
        answer:
          "1. Mutual Exclusion: At least one resource must be held in a non-shareable mode.\n2. Hold and Wait: A process must be holding at least one resource and waiting to acquire additional resources held by others.\n3. No Preemption: Resources cannot be forcibly preempted; they are released only voluntarily by the holding process.\n4. Circular Wait: A closed chain of processes exists such that P0 waits for a resource held by P1, P1 waits for P2, ..., and Pn waits for P0.",
        importance: "Critical",
        category: "Deadlocks",
      },
      {
        id: "os-q-18",
        question: "Does an Unsafe State in Banker's Algorithm guarantee that a deadlock will occur?",
        answer:
          "No. An Unsafe state does NOT mean deadlock has occurred; it means the operating system cannot guarantee that a deadlock will not occur if every process suddenly requests its declared maximum resource claim. Some unsafe states execute to completion without deadlock if processes request fewer resources than their maximum.",
        importance: "Critical",
        category: "Deadlocks",
      },
    ],
    labSlug: "bankers",
  },
  {
    dayNumber: 10,
    title: "Main Memory, Paging, TLB & Virtual Memory",
    subtitle: "Logical to Physical Address Translation & Page Replacement",
    summary:
      "Contiguous memory allocation vs Paging. Hardware MMU, multi-level page tables, Translation Lookaside Buffer (TLB), Effective Access Time, and Page Replacement algorithms (FIFO, LRU, Optimal).",
    focus: "Paging Hardware, TLB & Page Replacement Algorithms",
    estimatedMinutes: 90,
    videoPositions: [73, 74],
    supplementaryIds: ["supp-os-03", "supp-os-04"],
    deliverable: "Solve address translation and page-fault numericals",
    practicalAssignment: {
      title: "Paging & Page Replacement: FIFO, LRU, Optimal & Belady",
      description:
        "Compute page faults across FIFO, LRU, and Optimal algorithms on reference strings and verify Belady's Anomaly.",
      problemId: "os-ex-10",
    },
    learningOutcomes: [
      "Trace Logical to Physical address translation: Page Number (p) and Offset (d).",
      "Calculate Effective Memory Access Time (EMAT) with TLB hit ratio: EMAT = h * (t_tlb + t_mem) + (1 - h) * (t_tlb + 2 * t_mem).",
      "Compare FIFO, LRU, and Optimal (Bélády's MIN) page replacement algorithms on reference strings.",
      "Demonstrate Bélády's Anomaly where increasing FIFO frames from 3 to 4 increases page faults from 9 to 10.",
    ],
    interviewQuestions: [
      {
        id: "os-q-19",
        question: "What is the Translation Lookaside Buffer (TLB), and what is a TLB miss penalty?",
        answer:
          "The TLB is a high-speed associative hardware cache in the MMU that stores recent virtual-to-physical page table mappings. On a TLB hit, the physical address is produced in ~1 clock cycle without accessing RAM. On a TLB miss, the MMU must perform a page table walk across memory levels (accessing RAM 2 to 4 times), adding significant latency before filling the TLB.",
        importance: "Critical",
        category: "Memory Management",
      },
      {
        id: "os-q-20",
        question: "What is Thrashing in Virtual Memory, and how does the OS detect and cure it?",
        answer:
          "Thrashing occurs when a computer's virtual memory subsystem is in a constant state of paging: the CPU spends more time swapping pages in and out of swap space than executing application instructions, causing CPU utilization to plummet. The OS cures thrashing using the Working Set Model (Peter Denning) by monitoring process working sets and suspending/swapping out processes whose working set exceeds available memory frames.",
        importance: "Critical",
        category: "Virtual Memory",
      },
    ],
    labSlug: "page-replacement",
  },
  {
    dayNumber: 11,
    title: "File Systems, Inodes & Disk Scheduling",
    subtitle: "File Architecture, Allocation Methods & Disk Arm Algorithms",
    summary:
      "File system structures: Unix Inodes, direct/indirect blocks, file allocation methods (contiguous, linked, indexed), and hard disk scheduling algorithms (FCFS, SSTF, SCAN, C-SCAN, LOOK, C-LOOK).",
    focus: "Inode Structure & Disk Scheduling Algorithms",
    estimatedMinutes: 95,
    videoPositions: [75, 76, 77],
    supplementaryIds: ["supp-os-05", "supp-os-06"],
    deliverable: "Solve disk head-movement problems and explain inode/file descriptor",
    practicalAssignment: {
      title: "Disk Scheduling: FCFS, SSTF, SCAN, LOOK Total Head Movement",
      description: "Compute total cylinder movements for FCFS, SSTF, SCAN, and LOOK algorithms on a 200-cylinder disk.",
      problemId: "os-ex-11",
    },
    learningOutcomes: [
      "Understand UNIX Inode architecture: file type, permissions, owner, timestamps, direct pointers, single/double/triple indirect block pointers.",
      "Calculate maximum file size supported by an inode based on block size and pointer width.",
      "Compare Contiguous, Linked List, and Indexed file allocation strategies.",
      "Simulate disk scheduling algorithms: FCFS, SSTF, SCAN (Elevator), C-SCAN, LOOK, and C-LOOK.",
    ],
    interviewQuestions: [
      {
        id: "os-q-21",
        question: "How does a Unix Inode store pointers to file data blocks, and how does it support massive files?",
        answer:
          "A standard Unix inode contains ~12 direct block pointers (pointing directly to data blocks for small files), 1 single indirect pointer (pointing to a block filled with data block pointers), 1 double indirect pointer (points to a block of indirect pointer blocks), and 1 triple indirect pointer. This hierarchical design allows small files to be accessed with zero overhead while supporting multi-gigabyte or terabyte files.",
        importance: "Critical",
        category: "File Systems",
      },
      {
        id: "os-q-22",
        question: "What is the difference between SCAN and LOOK disk scheduling?",
        answer:
          "In SCAN (the elevator algorithm), the disk arm moves in one direction servicing requests until it reaches the physical end of the disk (e.g. cylinder 0 or 199), before reversing direction. In LOOK, the arm sweeps in one direction but only travels as far as the final request in that direction; it reverses immediately without traveling to the physical disk boundary.",
        importance: "High",
        category: "Storage Management",
      },
    ],
    labSlug: "disk-scheduling",
  },
  {
    dayNumber: 12,
    title: "Consolidated Revision, Synthesis & Mock Interview",
    subtitle: "Full OS Mastery, 6 Simulation Studios & Interview Evaluation",
    summary:
      "Comprehensive synthesis across all 11 days: 25 conceptual questions, 10 CPU scheduling scenarios, 5 deadlock problems, 5 memory problems, and full interactive laboratory assessment.",
    focus: "Interview Readiness & OS Laboratory Synthesis",
    estimatedMinutes: 120,
    videoPositions: [],
    deliverable: "25 conceptual + 10 scheduling + 5 deadlock + 5 memory + 1 practical",
    practicalAssignment: {
      title: "Operating Systems Comprehensive Interview Synthesis",
      description: "Synthesize key OS tradeoffs across processes, memory, concurrency, and file systems.",
      problemId: "os-ex-12",
    },
    learningOutcomes: [
      "Integrate concepts across all 11 core operating system domains.",
      "Demonstrate proficiency in CPU scheduling Gantt chart derivation and context switch analysis.",
      "Verify safety states and resource requests using Banker's Algorithm.",
      "Evaluate page replacement traces and explain Belady's anomaly.",
      "Calculate total head movement across FCFS, SSTF, SCAN, and LOOK disk algorithms.",
    ],
    interviewQuestions: [
      {
        id: "os-q-23",
        question: "What is the difference between a Hard Link and a Soft (Symbolic) Link?",
        answer:
          "A Hard Link is an additional directory entry pointing directly to the existing file's inode number; both entries share the same inode and file contents, and deleting one does not delete the file until the inode link count reaches 0. A Soft Link is a separate file with its own inode whose data block contains the pathname string of target file; if the original file is deleted, the symlink becomes a dangling pointer.",
        importance: "Critical",
        category: "File Systems",
      },
      {
        id: "os-q-24",
        question: "Explain what happens from typing a URL in a browser to rendering, from an OS and system call perspective.",
        answer:
          "1. Browser calls `getaddrinfo()` (syscall `socket()`, `connect()` to DNS resolver over UDP).\n2. Browser issues `socket()`, `connect()` (TCP 3-way handshake SYN/ACK).\n3. TLS handshake via cryptographic library.\n4. Browser calls `write()` or `send()` to transmit HTTP GET request.\n5. OS handles NIC interrupt, wakes browser process from Waiting to Ready, calls `read()` or `recv()`.\n6. OS allocates memory via `mmap()` or `brk()` for rendering buffer.\n7. Browser renders graphics via GPU driver through system graphics calls (`ioctl()` / DRM).",
        importance: "Critical",
        category: "System Calls & Networking",
      },
    ],
  },
];

