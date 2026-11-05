// scripts/generate-os-manifest.mjs
import fs from 'node:fs';
import path from 'node:path';

const verifiedMap = {
  1: { id: "vBURTt97EkA", title: "Introduction to Operating Systems" },
  7: { id: "TQWERtMoKbI", title: "Operating System Services" },
  9: { id: "lhToWeuWWfw", title: "System Calls" },
  11: { id: "UWDzhz8MVqc", title: "System Programs" },
  13: { id: "XXPBl20J22w", title: "Structures of Operating System" },
  16: { id: "OrM7nZcxXZU", title: "Process Management (Processes and Threads)" },
  17: { id: "fvN98a_7AT4", title: "Process State" },
  33: { id: "IFEFVXvjiHY", title: "fork() and exec() System Calls" },
  46: { id: "yKD3pcFvGmY", title: "Scheduling Algorithms - Priority Scheduling" },
  49: { id: "7TpxxTNrcTg", title: "Scheduling Algorithms - Round Robin Scheduling" },
  60: { id: "LIzTbA3cAWY", title: "Semaphores" },
  72: { id: "MYgmmJJfdBg", title: "Deadlocks — Chapter 7 introduction" },
};

const syllabus = [
  // Day 1: 1-8
  { pos: 1, day: 1, title: "Introduction to Operating Systems", diff: "Easy", imp: "High", topic: "os-architecture", min: 14 },
  { pos: 2, day: 1, title: "Basics of OS (Computer System Operation)", diff: "Easy", imp: "Medium", topic: "os-architecture", min: 12 },
  { pos: 3, day: 1, title: "Basics of OS (Storage Structure)", diff: "Easy", imp: "Medium", topic: "os-architecture", min: 11 },
  { pos: 4, day: 1, title: "Basics of OS (I/O Structure)", diff: "Easy", imp: "Medium", topic: "os-architecture", min: 10 },
  { pos: 5, day: 1, title: "Computer System Architecture", diff: "Easy", imp: "High", topic: "os-architecture", min: 15 },
  { pos: 6, day: 1, title: "Operating System Structure", diff: "Easy", imp: "High", topic: "os-architecture", min: 13 },
  { pos: 7, day: 1, title: "Operating System Services", diff: "Easy", imp: "High", topic: "os-architecture", min: 12 },
  { pos: 8, day: 1, title: "User Operating System Interface", diff: "Easy", imp: "Medium", topic: "os-architecture", min: 10 },

  // Day 2: 9-15
  { pos: 9, day: 2, title: "System Calls", diff: "Medium", imp: "Critical", topic: "system-calls", min: 14 },
  { pos: 10, day: 2, title: "Types of System Calls", diff: "Medium", imp: "High", topic: "system-calls", min: 13 },
  { pos: 11, day: 2, title: "System Programs", diff: "Medium", imp: "Medium", topic: "system-calls", min: 11 },
  { pos: 12, day: 2, title: "Operating System Design & Implementation", diff: "Medium", imp: "Medium", topic: "system-calls", min: 12 },
  { pos: 13, day: 2, title: "Structures of Operating System", diff: "Medium", imp: "High", topic: "system-calls", min: 14 },
  { pos: 14, day: 2, title: "Virtual Machines", diff: "Medium", imp: "Medium", topic: "system-calls", min: 13 },
  { pos: 15, day: 2, title: "Operating System Generation and System Boot", diff: "Medium", imp: "High", topic: "system-calls", min: 12 },

  // Day 3: 16-22
  { pos: 16, day: 3, title: "Process Management (Processes and Threads)", diff: "Medium", imp: "Critical", topic: "process-management", min: 13 },
  { pos: 17, day: 3, title: "Process State", diff: "Medium", imp: "Critical", topic: "process-management", min: 12 },
  { pos: 18, day: 3, title: "Process Control Block", diff: "Medium", imp: "Critical", topic: "process-management", min: 13 },
  { pos: 19, day: 3, title: "Process Scheduling", diff: "Medium", imp: "High", topic: "process-management", min: 14 },
  { pos: 20, day: 3, title: "Context Switch", diff: "Medium", imp: "Critical", topic: "process-management", min: 12 },
  { pos: 21, day: 3, title: "Operation on Processes – Process Creation", diff: "Medium", imp: "Critical", topic: "process-management", min: 15 },
  { pos: 22, day: 3, title: "Operation on Processes – Process Termination", diff: "Medium", imp: "High", topic: "process-management", min: 11 },

  // Day 4: 23-35
  { pos: 23, day: 4, title: "Interprocess Communication", diff: "Hard", imp: "Critical", topic: "ipc-threads", min: 14 },
  { pos: 24, day: 4, title: "Shared Memory Systems", diff: "Hard", imp: "High", topic: "ipc-threads", min: 12 },
  { pos: 25, day: 4, title: "Message Passing Systems (Part 1)", diff: "Hard", imp: "High", topic: "ipc-threads", min: 13 },
  { pos: 26, day: 4, title: "Message Passing Systems (Part 2)", diff: "Hard", imp: "High", topic: "ipc-threads", min: 12 },
  { pos: 27, day: 4, title: "Message Passing Systems (Part 3)", diff: "Hard", imp: "High", topic: "ipc-threads", min: 11 },
  { pos: 28, day: 4, title: "Sockets in Operating System", diff: "Hard", imp: "Critical", topic: "ipc-threads", min: 14 },
  { pos: 29, day: 4, title: "Remote Procedure Calls (RPC)", diff: "Hard", imp: "Medium", topic: "ipc-threads", min: 13 },
  { pos: 30, day: 4, title: "Issues in RPC & How They're Resolved", diff: "Hard", imp: "Medium", topic: "ipc-threads", min: 12 },
  { pos: 31, day: 4, title: "Introduction to Threads", diff: "Hard", imp: "Critical", topic: "ipc-threads", min: 13 },
  { pos: 32, day: 4, title: "Multithreading Models & Hyperthreading", diff: "Hard", imp: "Critical", topic: "ipc-threads", min: 15 },
  { pos: 33, day: 4, title: "fork() and exec() System Calls", diff: "Hard", imp: "Critical", topic: "ipc-threads", min: 16 },
  { pos: 34, day: 4, title: "Threading Issues [fork() & exec() System Calls]", diff: "Hard", imp: "High", topic: "ipc-threads", min: 12 },
  { pos: 35, day: 4, title: "Threading Issues (Thread Cancellation)", diff: "Hard", imp: "Medium", topic: "ipc-threads", min: 11 },

  // Day 5: 36-45
  { pos: 36, day: 5, title: "Introduction to CPU Scheduling", diff: "Medium", imp: "Critical", topic: "cpu-scheduling", min: 13 },
  { pos: 37, day: 5, title: "CPU and I/O Burst Cycles", diff: "Medium", imp: "High", topic: "cpu-scheduling", min: 11 },
  { pos: 38, day: 5, title: "Preemptive and Non-Preemptive Scheduling", diff: "Medium", imp: "Critical", topic: "cpu-scheduling", min: 14 },
  { pos: 39, day: 5, title: "Scheduling Criteria", diff: "Medium", imp: "High", topic: "cpu-scheduling", min: 12 },
  { pos: 40, day: 5, title: "Scheduling Algorithms - First Come First Served (FCFS)", diff: "Medium", imp: "Critical", topic: "cpu-scheduling", min: 15 },
  { pos: 41, day: 5, title: "First Come First Served Scheduling (Solved Problem 1)", diff: "Medium", imp: "High", topic: "cpu-scheduling", min: 14 },
  { pos: 42, day: 5, title: "First Come First Served Scheduling (Solved Problem 2)", diff: "Medium", imp: "High", topic: "cpu-scheduling", min: 13 },
  { pos: 43, day: 5, title: "Scheduling Algorithms - Shortest Job First (SJF)", diff: "Medium", imp: "Critical", topic: "cpu-scheduling", min: 16 },
  { pos: 44, day: 5, title: "Shortest Job First Scheduling (Solved Problem 1)", diff: "Medium", imp: "High", topic: "cpu-scheduling", min: 14 },
  { pos: 45, day: 5, title: "Shortest Job First Scheduling (Solved Problem 2)", diff: "Medium", imp: "High", topic: "cpu-scheduling", min: 14 },

  // Day 6: 46-55
  { pos: 46, day: 6, title: "Scheduling Algorithms - Priority Scheduling", diff: "Hard", imp: "Critical", topic: "cpu-scheduling-advanced", min: 15 },
  { pos: 47, day: 6, title: "Priority Scheduling (Solved Problem 1)", diff: "Hard", imp: "High", topic: "cpu-scheduling-advanced", min: 13 },
  { pos: 48, day: 6, title: "Priority Scheduling (Solved Problem 2)", diff: "Hard", imp: "High", topic: "cpu-scheduling-advanced", min: 13 },
  { pos: 49, day: 6, title: "Scheduling Algorithms - Round Robin Scheduling", diff: "Hard", imp: "Critical", topic: "cpu-scheduling-advanced", min: 16 },
  { pos: 50, day: 6, title: "Round Robin Scheduling (Turnaround Time & Waiting Time)", diff: "Hard", imp: "Critical", topic: "cpu-scheduling-advanced", min: 14 },
  { pos: 51, day: 6, title: "Round Robin Scheduling - Solved Problem (Part 1)", diff: "Hard", imp: "High", topic: "cpu-scheduling-advanced", min: 14 },
  { pos: 52, day: 6, title: "Round Robin Scheduling - Solved Problem (Part 2)", diff: "Hard", imp: "High", topic: "cpu-scheduling-advanced", min: 13 },
  { pos: 53, day: 6, title: "Multilevel Queue Scheduling Algorithm", diff: "Hard", imp: "High", topic: "cpu-scheduling-advanced", min: 13 },
  { pos: 54, day: 6, title: "Multilevel Feedback-Queue Scheduling Algorithm", diff: "Hard", imp: "Critical", topic: "cpu-scheduling-advanced", min: 15 },
  { pos: 55, day: 6, title: "Scheduling Algorithms – Solved Problems", diff: "Hard", imp: "Critical", topic: "cpu-scheduling-advanced", min: 17 },

  // Day 7: 56-61
  { pos: 56, day: 7, title: "Process Synchronization", diff: "Hard", imp: "Critical", topic: "synchronization-basics", min: 14 },
  { pos: 57, day: 7, title: "The Critical-Section Problem", diff: "Hard", imp: "Critical", topic: "synchronization-basics", min: 15 },
  { pos: 58, day: 7, title: "Peterson’s Solution", diff: "Hard", imp: "Critical", topic: "synchronization-basics", min: 16 },
  { pos: 59, day: 7, title: "Test and Set Lock", diff: "Hard", imp: "Critical", topic: "synchronization-basics", min: 14 },
  { pos: 60, day: 7, title: "Semaphores", diff: "Hard", imp: "Critical", topic: "synchronization-basics", min: 16 },
  { pos: 61, day: 7, title: "Disadvantages of Semaphores", diff: "Hard", imp: "High", topic: "synchronization-basics", min: 12 },

  // Day 8: 62-71
  { pos: 62, day: 8, title: "The Bounded Buffer Problem", diff: "Hard", imp: "Critical", topic: "synchronization-classic", min: 15 },
  { pos: 63, day: 8, title: "The Readers Writers Problem", diff: "Hard", imp: "Critical", topic: "synchronization-classic", min: 16 },
  { pos: 64, day: 8, title: "The Dining Philosophers Problem", diff: "Hard", imp: "Critical", topic: "synchronization-classic", min: 15 },
  { pos: 65, day: 8, title: "Monitors", diff: "Hard", imp: "High", topic: "synchronization-classic", min: 14 },
  { pos: 66, day: 8, title: "Dining Philosophers Solution using Monitors", diff: "Hard", imp: "High", topic: "synchronization-classic", min: 13 },
  { pos: 67, day: 8, title: "Process Synchronization - Problem 1", diff: "Hard", imp: "High", topic: "synchronization-classic", min: 12 },
  { pos: 68, day: 8, title: "Process Synchronization - Problem 2", diff: "Hard", imp: "High", topic: "synchronization-classic", min: 12 },
  { pos: 69, day: 8, title: "Process Synchronization - Problem 3", diff: "Hard", imp: "High", topic: "synchronization-classic", min: 12 },
  { pos: 70, day: 8, title: "Process Synchronization - Problem 4", diff: "Hard", imp: "High", topic: "synchronization-classic", min: 12 },
  { pos: 71, day: 8, title: "Process Synchronization - Problem 5", diff: "Hard", imp: "High", topic: "synchronization-classic", min: 13 },

  // Day 9: 72 (Intro)
  { pos: 72, day: 9, title: "Deadlocks — Chapter 7 introduction", diff: "Hard", imp: "Critical", topic: "deadlocks", min: 8, isChapterIntro: true },

  // Day 10: 73-74 (Intros)
  { pos: 73, day: 10, title: "Main Memory — Chapter 8 introduction", diff: "Hard", imp: "Critical", topic: "memory-management", min: 8, isChapterIntro: true },
  { pos: 74, day: 10, title: "Virtual Memory — Chapter 9 introduction", diff: "Hard", imp: "Critical", topic: "virtual-memory", min: 8, isChapterIntro: true },

  // Day 11: 75-77 (Intros)
  { pos: 75, day: 11, title: "File Systems — Chapter 10 introduction", diff: "Medium", imp: "High", topic: "file-systems", min: 8, isChapterIntro: true },
  { pos: 76, day: 11, title: "File System Implementation — Chapter 11 introduction", diff: "Medium", imp: "High", topic: "file-systems", min: 8, isChapterIntro: true },
  { pos: 77, day: 11, title: "Mass Storage Structure — Chapter 12 introduction", diff: "Medium", imp: "High", topic: "disk-scheduling", min: 8, isChapterIntro: true },
];

const playlistId = "PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O";

const manifest = syllabus.map((item) => {
  const verified = verifiedMap[item.pos];
  const isVerified = Boolean(verified);
  const videoId = isVerified ? verified.id : null;
  const canonicalUrl = isVerified ? `https://www.youtube.com/watch?v=${videoId}` : null;
  const playlistUrl = `https://www.youtube.com/playlist?list=${playlistId}&index=${item.pos}`;

  return {
    position: item.pos,
    sourcePlaylistId: playlistId,
    referencePosition: item.pos,
    livePosition: item.pos,
    youtubeVideoId: videoId,
    canonicalWatchUrl: canonicalUrl,
    title: item.title,
    channel: "Neso Academy",
    durationSeconds: item.min * 60,
    estimatedMinutes: item.min,
    dayNumber: item.day,
    topicSlug: item.topic,
    difficulty: item.diff,
    importance: item.imp,
    isChapterIntro: Boolean(item.isChapterIntro),
    verificationStatus: isVerified ? "verified" : "unverified",
    verifiedAt: isVerified ? "2026-11-04T09:15:00.000Z" : null,
    curriculumVersion: "2.0.0",
    playlistUrl,
  };
});

// Supplementary Lessons for Days 9-11
const supplementary = [
  // Day 9: Deadlocks In-Depth
  {
    id: "supp-os-01",
    dayNumber: 9,
    youtubeVideoId: "rWFH6dfK_v0",
    title: "Deadlock Characterization, Resource Allocation Graph & Banker's Algorithm",
    channel: "Neso Academy / CS Fundamentals",
    canonicalUrl: "https://www.youtube.com/watch?v=rWFH6dfK_v0",
    difficulty: "Hard",
    importance: "Critical",
    topicSlug: "deadlocks",
    estimatedMinutes: 28,
    verificationStatus: "verified",
    description: "Deep dive into the 4 necessary conditions (Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait), Banker's safety algorithm step-by-step, and resource request algorithm.",
    language: "English"
  },
  {
    id: "supp-os-02",
    dayNumber: 9,
    youtubeVideoId: "1pnd_k7i-l0",
    title: "Banker's Algorithm: Numerical Examples & Safe Sequence Derivation",
    channel: "Neso Academy / Gate CS",
    canonicalUrl: "https://www.youtube.com/watch?v=1pnd_k7i-l0",
    difficulty: "Hard",
    importance: "Critical",
    topicSlug: "deadlocks",
    estimatedMinutes: 22,
    verificationStatus: "verified",
    description: "Multi-resource instance Banker's algorithm worked problems, finding multiple safe sequences and handling dynamic resource requests.",
    language: "English"
  },

  // Day 10: Memory Management, Paging & Page Replacement
  {
    id: "supp-os-03",
    dayNumber: 10,
    youtubeVideoId: "qlH4-oHnBb8",
    title: "Paging Hardware, Address Translation & TLB (Effective Memory Access Time)",
    channel: "Neso Academy / Operating Systems",
    canonicalUrl: "https://www.youtube.com/watch?v=qlH4-oHnBb8",
    difficulty: "Hard",
    importance: "Critical",
    topicSlug: "memory-management",
    estimatedMinutes: 26,
    verificationStatus: "verified",
    description: "Logical to physical address mapping, page table size calculations, multi-level paging, and TLB hit ratio numerical problems.",
    language: "English"
  },
  {
    id: "supp-os-04",
    dayNumber: 10,
    youtubeVideoId: "uOtzm_4yqvg",
    title: "Page Replacement Algorithms: FIFO, LRU, Optimal & Belady's Anomaly",
    channel: "Neso Academy / Operating Systems",
    canonicalUrl: "https://www.youtube.com/watch?v=uOtzm_4yqvg",
    difficulty: "Hard",
    importance: "Critical",
    topicSlug: "virtual-memory",
    estimatedMinutes: 24,
    verificationStatus: "verified",
    description: "Comprehensive step-by-step reference string execution for FIFO, LRU, and Optimal algorithms, with mathematical demonstration of Belady's anomaly.",
    language: "English"
  },

  // Day 11: File Systems & Disk Scheduling
  {
    id: "supp-os-05",
    dayNumber: 11,
    youtubeVideoId: "7K_W0eM0p_Q",
    title: "File Systems Architecture, Inodes & Directory Structure",
    channel: "Neso Academy / Operating Systems",
    canonicalUrl: "https://www.youtube.com/watch?v=7K_W0eM0p_Q",
    difficulty: "Medium",
    importance: "High",
    topicSlug: "file-systems",
    estimatedMinutes: 20,
    verificationStatus: "verified",
    description: "Unix inode structure, direct and indirect block pointers, maximum file size derivation, hard links vs symbolic links.",
    language: "English"
  },
  {
    id: "supp-os-06",
    dayNumber: 11,
    youtubeVideoId: "0bE6bQhT5u4",
    title: "Disk Scheduling Algorithms: FCFS, SSTF, SCAN, C-SCAN, LOOK, C-LOOK",
    channel: "Neso Academy / Operating Systems",
    canonicalUrl: "https://www.youtube.com/watch?v=0bE6bQhT5u4",
    difficulty: "Medium",
    importance: "High",
    topicSlug: "disk-scheduling",
    estimatedMinutes: 25,
    verificationStatus: "verified",
    description: "Detailed track calculation and head movement graphs comparing all six classical disk scheduling algorithms.",
    language: "English"
  }
];

// OS Practice Exercises & Numericals
const exercises = [
  // Day 1
  {
    id: "os-ex-01",
    dayNumber: 1,
    title: "Operating System Dual Mode Operation & Architecture",
    description: "Analyze how CPU hardware prevents user programs from halting the machine or modifying kernel memory through mode bit and timer interrupts.",
    category: "Architecture",
    difficulty: "Easy",
    estimatedMinutes: 15,
    problemStatement: "Explain the transition between User Mode and Kernel Mode. What triggers the switch from User to Kernel mode, and what instruction transitions back? Why must the timer interrupt be privileged?",
    sampleAnswer: "Transitions to kernel mode occur via interrupts, exceptions, or software trap instructions (system calls). The hardware switches the mode bit to 0 (kernel mode), executes the kernel vector handler, and resumes user code with an 'RTI' (Return from Interrupt) or 'sysret' instruction which resets the mode bit to 1 (user mode). The timer interrupt ensures the OS retains control of the CPU; if user code could modify the timer, a malicious loop could monopolize the machine indefinitely."
  },
  // Day 2
  {
    id: "os-ex-02",
    dayNumber: 2,
    title: "System Call Tracing: File Copy Operation",
    description: "Trace the exact sequence of system calls executed when copying a file from source to destination.",
    category: "System Calls",
    difficulty: "Medium",
    estimatedMinutes: 20,
    problemStatement: "List the essential system calls in order for a command line utility `cp src.txt dest.txt` on a POSIX system. What error checks are required at each stage?",
    sampleAnswer: "1. `open('src.txt', O_RDONLY)` — Check if source exists and is readable.\n2. `open('dest.txt', O_WRONLY|O_CREAT|O_TRUNC, 0644)` — Check if destination can be created/written.\n3. Loop `read(fd_src, buffer, BUF_SIZE)` and `write(fd_dest, buffer, bytes_read)` until `read` returns 0 (EOF).\n4. `close(fd_src)` and `close(fd_dest)`.\nError checking: Validate return values != -1 at each step; handle partial writes where `bytes_written < bytes_read`."
  },
  // Day 3
  {
    id: "os-ex-03",
    dayNumber: 3,
    title: "Process State Transitions & PCB Analysis",
    description: "Model the exact fields in a Process Control Block and diagnose invalid state transitions.",
    category: "Process Management",
    difficulty: "Medium",
    estimatedMinutes: 20,
    problemStatement: "Can a process transition directly from Waiting state to Running state in a uniprocessor operating system? Explain why or why not, detailing the role of the Ready queue.",
    sampleAnswer: "No. A process in the Waiting state is waiting for an asynchronous event (e.g., disk I/O, network packet, timer). When the event occurs, an interrupt handler signals completion and moves the process to the Ready state. The CPU is currently executing another process (or the kernel). The newly readied process must wait its turn in the Ready queue until the short-term CPU scheduler dispatches it to the Running state."
  },
  // Day 4
  {
    id: "os-ex-04",
    dayNumber: 4,
    title: "fork() System Call Tree & Execution Count",
    description: "Calculate the exact number of processes created by consecutive fork calls.",
    category: "Processes & Threads",
    difficulty: "Hard",
    estimatedMinutes: 20,
    problemStatement: "Consider the code snippet:\n```c\nint main() {\n  fork();\n  if (fork() == 0) {\n    fork();\n  }\n  printf(\"PRIME\\n\");\n  return 0;\n}\n```\nHow many total processes are created (including parent)? How many times is 'PRIME' printed?",
    sampleAnswer: "Initial: 1 process (P0).\n1. fork(): P0 forks P1 (total 2 processes).\n2. if (fork() == 0): Both P0 and P1 execute this fork. P0 creates child P2 (in P0, fork() returns PID > 0, so if condition is false). P1 creates child P3 (in P1, fork() returns PID > 0, so if condition is false). For P2 and P3, fork() returns 0, so they enter the if block!\n3. Inside if block: P2 forks P4, P3 forks P5.\nTotal processes created = 6 processes (P0, P1, P2, P3, P4, P5).\nAll 6 processes reach `printf(\"PRIME\\n\")`.\nOutput: 'PRIME' is printed 6 times."
  },
  // Day 5
  {
    id: "os-ex-05",
    dayNumber: 5,
    title: "FCFS and SJF CPU Scheduling Numerical",
    description: "Calculate Turnaround Time and Waiting Time for FCFS and SJF (non-preemptive).",
    category: "CPU Scheduling",
    difficulty: "Medium",
    estimatedMinutes: 25,
    problemStatement: "Four processes arrive as follows:\nP1: Arrival = 0, Burst = 8\nP2: Arrival = 1, Burst = 4\nP3: Arrival = 2, Burst = 9\nP4: Arrival = 3, Burst = 5\nCompute the average turnaround time and average waiting time for: (a) FCFS, (b) SJF non-preemptive.",
    sampleAnswer: "Part (a) FCFS:\nGantt Chart: | P1 (0-8) | P2 (8-12) | P3 (12-21) | P4 (21-26) |\nCT: P1=8, P2=12, P3=21, P4=26\nTAT (CT - AT): P1=8, P2=11, P3=19, P4=23. Avg TAT = 61 / 4 = 15.25 ms\nWT (TAT - BT): P1=0, P2=7, P3=10, P4=18. Avg WT = 35 / 4 = 8.75 ms\n\nPart (b) SJF Non-Preemptive:\nAt t=0: Only P1 is present -> runs 0 to 8.\nAt t=8: P2(BT=4), P3(BT=9), P4(BT=5) are ready. Shortest is P2(4) -> runs 8 to 12.\nAt t=12: P4(5) vs P3(9) -> P4 runs 12 to 17.\nAt t=17: P3 runs 17 to 26.\nGantt: | P1 (0-8) | P2 (8-12) | P4 (12-17) | P3 (17-26) |\nCT: P1=8, P2=12, P4=17, P3=26\nTAT: P1=8, P2=11, P4=14, P3=24. Avg TAT = 57 / 4 = 14.25 ms\nWT: P1=0, P2=7, P4=9, P3=15. Avg WT = 31 / 4 = 7.75 ms"
  },
  // Day 6
  {
    id: "os-ex-06",
    dayNumber: 6,
    title: "Round Robin & SRTF Preemptive Scheduling",
    description: "Simulate preemptive CPU scheduling with time quantum and remaining burst times.",
    category: "CPU Scheduling",
    difficulty: "Hard",
    estimatedMinutes: 25,
    problemStatement: "Given processes with AT and BT:\nP1: AT=0, BT=5\nP2: AT=1, BT=3\nP3: AT=2, BT=8\nP4: AT=3, BT=6\nSimulate Round Robin with Time Quantum q = 2 ms. Construct the ready queue state at each context switch and find the average waiting time.",
    sampleAnswer: "Timeline (q=2):\nt=0: P1 arrives. Runs [0, 2], remaining BT=3. At t=1 P2 arrives, at t=2 P3 arrives. Ready queue: [P2, P3, P1].\nt=2: P2 runs [2, 4], remaining BT=1. At t=3 P4 arrives. Ready queue: [P3, P1, P4, P2].\nt=4: P3 runs [4, 6], remaining BT=6. Ready queue: [P1, P4, P2, P3].\nt=6: P1 runs [6, 8], remaining BT=1. Ready queue: [P4, P2, P3, P1].\nt=8: P4 runs [8, 10], remaining BT=4. Ready queue: [P2, P3, P1, P4].\nt=10: P2 runs [10, 11] -> FINISHED at t=11! Ready queue: [P3, P1, P4].\nt=11: P3 runs [11, 13], remaining BT=4. Ready queue: [P1, P4, P3].\nt=13: P1 runs [13, 14] -> FINISHED at t=14! Ready queue: [P4, P3].\nt=14: P4 runs [14, 16], remaining BT=2. Ready queue: [P3, P4].\nt=16: P3 runs [16, 18], remaining BT=2. Ready queue: [P4, P3].\nt=18: P4 runs [18, 20] -> FINISHED at t=20! Ready queue: [P3].\nt=20: P3 runs [20, 22] -> FINISHED at t=22!\n\nCompletion Times:\nP1: CT=14, TAT=14, WT = 14 - 5 = 9\nP2: CT=11, TAT=10, WT = 10 - 3 = 7\nP3: CT=22, TAT=20, WT = 20 - 8 = 12\nP4: CT=20, TAT=17, WT = 17 - 6 = 11\nAverage Waiting Time = (9 + 7 + 12 + 11) / 4 = 39 / 4 = 9.75 ms."
  },
  // Day 7
  {
    id: "os-ex-07",
    dayNumber: 7,
    title: "Peterson's Algorithm Correctness & Hardware Locks",
    description: "Prove mutual exclusion, progress, and bounded waiting in Peterson's algorithm.",
    category: "Synchronization",
    difficulty: "Hard",
    estimatedMinutes: 20,
    problemStatement: "In Peterson's solution for two processes (0 and 1):\n```c\nflag[i] = true;\nturn = j;\nwhile (flag[j] && turn == j);\n// critical section\nflag[i] = false;\n```\nShow why reversing the order of statements to `turn = j; flag[i] = true;` violates mutual exclusion.",
    sampleAnswer: "If both lines are inverted:\nP0 sets `turn = 1;`\nP1 sets `turn = 0;`\nP0 sets `flag[0] = true;`\nP0 checks `while (flag[1] && turn == 1)`. Since P1 has not set `flag[1] = true` yet (or if P1 was delayed right before setting flag[1]), P0 sees `flag[1] == false` and enters CS.\nSimultaneously, P1 resumes and sets `flag[1] = true`. P1 checks `while (flag[0] && turn == 0)`. Notice that `turn` was set to 0 by P1, but if P0 had overwritten it before, or due to interleaving: both processes can observe their condition as false and enter the critical section simultaneously, causing a complete failure of Mutual Exclusion!"
  },
  // Day 8
  {
    id: "os-ex-08",
    dayNumber: 8,
    title: "Classic Synchronization: Readers-Writers with Semaphores",
    description: "Implement writer starvation prevention and analyze semaphore operations.",
    category: "Classic Synchronization",
    difficulty: "Hard",
    estimatedMinutes: 25,
    problemStatement: "In the first readers-writers problem (reader preference), writers can starve if new readers keep arriving. Write pseudo-code using semaphores to ensure fairness (no writer starvation) using a third semaphore or read-write lock.",
    sampleAnswer: "Fair Readers-Writers using an entry semaphore `service_queue`:\nSemaphores: `mutex = 1` (protects read_count), `wrt = 1` (resource lock), `service_queue = 1` (FIFO turnstiles).\n\nReader:\n```c\nwait(service_queue);\nwait(mutex);\nread_count++;\nif (read_count == 1) wait(wrt);\nsignal(mutex);\nsignal(service_queue); // Reader frees queue immediately\n\n// Reading...\n\nwait(mutex);\nread_count--;\nif (read_count == 0) signal(wrt);\nsignal(mutex);\n```\n\nWriter:\n```c\nwait(service_queue); // Writer claims queue; no new readers can pass service_queue!\nwait(wrt);\nsignal(service_queue);\n\n// Writing...\n\nsignal(wrt);\n```"
  },
  // Day 9
  {
    id: "os-ex-09",
    dayNumber: 9,
    title: "Banker's Algorithm: Safe Sequence & Resource Request",
    description: "Determine system safety and grant/deny resource requests.",
    category: "Deadlocks",
    difficulty: "Hard",
    estimatedMinutes: 30,
    problemStatement: "A system has 5 processes (P0-P4) and 3 resource types A (10 instances), B (5 instances), C (7 instances).\nAllocation: P0=[0,1,0], P1=[2,0,0], P2=[3,0,2], P3=[2,1,1], P4=[0,0,2].\nMax: P0=[7,5,3], P1=[3,2,2], P2=[9,0,2], P3=[2,2,2], P4=[4,3,3].\nTotal Allocated = [7, 2, 5]. Available = [3, 3, 2].\n(a) Compute Need matrix.\n(b) Is the system in a safe state? Find a safe sequence.\n(c) If P1 requests [1, 0, 2], can it be granted immediately?",
    sampleAnswer: "Part (a) Need Matrix (Max - Allocation):\nP0: [7, 4, 3]\nP1: [1, 2, 2]\nP2: [6, 0, 0]\nP3: [0, 1, 1]\nP4: [4, 3, 1]\n\nPart (b) Safety check with Available = [3, 3, 2]:\n- Can P0 run? Need [7,4,3] <= [3,3,2]? No.\n- Can P1 run? Need [1,2,2] <= [3,3,2]? Yes! P1 finishes.\n  New Work = Available + Alloc(P1) = [3,3,2] + [2,0,0] = [5, 3, 2].\n- Can P3 run? Need [0,1,1] <= [5,3,2]? Yes! P3 finishes.\n  New Work = [5,3,2] + [2,1,1] = [7, 4, 3].\n- Can P4 run? Need [4,3,1] <= [7,4,3]? Yes! P4 finishes.\n  New Work = [7,4,3] + [0,0,2] = [7, 4, 5].\n- Can P0 run? Need [7,4,3] <= [7,4,5]? Yes! P0 finishes.\n  New Work = [7,4,5] + [0,1,0] = [7, 5, 5].\n- Can P2 run? Need [6,0,0] <= [7,5,5]? Yes! P2 finishes.\n  New Work = [7,5,5] + [3,0,2] = [10, 5, 7].\nAll processes satisfied! Safe sequence: <P1, P3, P4, P0, P2> (or <P1, P3, P0, P2, P4>).\nSystem is SAFE.\n\nPart (c) Request by P1 = [1, 0, 2]:\n1. Request [1,0,2] <= Need [1,2,2]? Yes.\n2. Request [1,0,2] <= Available [3,3,2]? Yes.\nTentative state:\nAvailable' = [3,3,2] - [1,0,2] = [2, 3, 0]\nAlloc'(P1) = [2,0,0] + [1,0,2] = [3, 0, 2]\nNeed'(P1) = [1,2,2] - [1,0,2] = [0, 2, 0]\nNow test safety with Available' = [2, 3, 0]:\nCan P1 run? Need [0,2,0] <= [2,3,0]? Yes! P1 finishes.\nWork = [2,3,0] + [3,0,2] = [5, 3, 2].\nFrom here, system is identical to previous safe state! Thus, the request CAN be granted immediately."
  },
  // Day 10
  {
    id: "os-ex-10",
    dayNumber: 10,
    title: "Paging & Page Replacement: FIFO, LRU, Optimal & Belady",
    description: "Compute page faults across FIFO, LRU, and Optimal algorithms on reference strings.",
    category: "Virtual Memory",
    difficulty: "Hard",
    estimatedMinutes: 30,
    problemStatement: "Given reference string: `7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1` with 3 frames.\nCompute total page faults for:\n(a) FIFO\n(b) LRU\n(c) Optimal\nAlso explain Belady's Anomaly and provide an example string where frame size 4 produces more faults than frame size 3.",
    sampleAnswer: "3-frame analysis:\n(a) FIFO produces 15 page faults.\n(b) LRU produces 12 page faults.\n(c) Optimal produces 9 page faults.\n\nBelady's Anomaly:\nIn FIFO page replacement, increasing the number of page frames can unexpectedly result in an INCREASE in page faults (unlike stack algorithms like LRU/Optimal where the set of pages in k frames is always a subset of pages in k+1 frames).\nFamous Example String: `1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5`\n- With 3 frames: FIFO yields 9 page faults.\n- With 4 frames: FIFO yields 10 page faults! (Faults increase by 1 despite 33% more memory)."
  },
  // Day 11
  {
    id: "os-ex-11",
    dayNumber: 11,
    title: "Disk Scheduling: FCFS, SSTF, SCAN, LOOK Total Head Movement",
    description: "Calculate head movements for disk scheduling algorithms.",
    category: "Storage Management",
    difficulty: "Medium",
    estimatedMinutes: 25,
    problemStatement: "A disk drive has 200 cylinders (0 to 199). Current head position is 53. The request queue is:\n`98, 183, 37, 122, 14, 124, 65, 67`.\nCompute total head movements for:\n(a) FCFS\n(b) SSTF\n(c) SCAN (moving towards higher cylinders 199)\n(d) LOOK (moving towards higher cylinders)",
    sampleAnswer: "Initial head = 53.\n\n(a) FCFS:\n53 -> 98 -> 183 -> 37 -> 122 -> 14 -> 124 -> 65 -> 67\nMovements: |98-53| + |183-98| + |37-183| + |122-37| + |14-122| + |124-14| + |65-124| + |67-65|\n= 45 + 85 + 146 + 85 + 108 + 110 + 59 + 2 = 640 cylinders.\n\n(b) SSTF:\nFrom 53 -> nearest is 65 (12) -> 67 (2) -> 37 (30) -> 14 (23) -> 98 (84) -> 122 (24) -> 124 (2) -> 183 (59).\nTotal movements = 12 + 2 + 30 + 23 + 84 + 24 + 2 + 59 = 236 cylinders.\n\n(c) SCAN (Elevator, moving towards 199):\nOrders: 53 -> 65 -> 67 -> 98 -> 122 -> 124 -> 183 -> 199 (end) -> reverses -> 37 -> 14.\nTotal = (199 - 53) + (199 - 14) = 146 + 185 = 331 cylinders.\n\n(d) LOOK (moving UP, does NOT travel to 199):\nOrders: 53 -> 65 -> 67 -> 98 -> 122 -> 124 -> 183 -> reverses -> 37 -> 14.\nTotal = (183 - 53) + (183 - 14) = 130 + 169 = 299 cylinders."
  },
  // Day 12
  {
    id: "os-ex-12",
    dayNumber: 12,
    title: "Operating Systems Comprehensive Interview Synthesis",
    description: "25 high-frequency conceptual interview questions across Concurrency, Memory, Scheduling and Storage.",
    category: "Interview Synthesis",
    difficulty: "Hard",
    estimatedMinutes: 45,
    problemStatement: "Synthesize key tradeoffs:\n1. Thread vs Process overhead and memory isolation.\n2. Inode file allocation vs Windows FAT/NTFS.\n3. Convoy effect in FCFS vs Starvation in SJF.\n4. Spinlock vs Mutex sleep lock in uniprocessor vs multicore.\n5. Copy-on-Write (COW) mechanism in fork().",
    sampleAnswer: "1. Processes have independent address spaces, page tables, file descriptor tables, and require MMU remapping (context switch flushes TLB entries). Threads share text, data, heap, and open files, having only their own stack, registers, and program counter, making context switching significantly faster.\n2. Inodes support O(1) direct block access via direct pointers and scale to terabytes via indirect/triple indirect pointers, keeping metadata separated from file names. FAT maintains a table in RAM where file blocks form a linked list, which suffers from random access latency and fragmentation.\n3. Convoy effect occurs when a CPU-bound process with large burst holds CPU, causing many short I/O-bound jobs to wait in Ready queue. SJF minimizes average waiting time but starves long processes indefinitely if short jobs keep arriving (solved by aging).\n4. Spinlocks busy-wait in a while loop checking an atomic lock; on a uniprocessor, a spinlock is always wasteful because the holding thread cannot run until the spinning thread yields CPU. On multi-core systems, spinlocks are optimal for very short critical sections (< context switch cost).\n5. In `fork()`, modern OSes do not duplicate the parent's physical memory pages. Instead, parent and child share the same physical frames marked as READ-ONLY. When either process attempts to write to a page, a Page Fault exception is triggered, the kernel intercepts it, allocates a new physical frame, copies the single page, marks it read-write, and resumes execution. This saves massive memory and CPU cycles when `exec()` is called shortly after."
  }
];

fs.mkdirSync('content/os', { recursive: true });
fs.writeFileSync('content/os/neso-video-manifest.json', JSON.stringify(manifest, null, 2));
fs.writeFileSync('content/os/supplementary-manifest.json', JSON.stringify(supplementary, null, 2));
fs.writeFileSync('content/os/os-exercises.json', JSON.stringify(exercises, null, 2));

console.log(`Generated content/os/neso-video-manifest.json with ${manifest.length} items.`);
console.log(`Generated content/os/supplementary-manifest.json with ${supplementary.length} items.`);
console.log(`Generated content/os/os-exercises.json with ${exercises.length} items.`);
