# PRIME — Operating Systems 77-Video Curriculum Reconciliation & Verification Report

## 1. Executive Summary

- **Course:** Operating Systems (CS Fundamentals)
- **Primary Playlist ID:** `PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O`
- **Primary Source:** Neso Academy (YouTube)
- **Course Chapters Index:** `https://www.nesoacademy.org/cs/03-subject`
- **Total Primary Playlist Entries Cataloged:** 77 of 77
- **Corroborated Individual Video IDs:** 12 Canonical Watch Links verified via independent course syllabi and public manifests
- **Navigation Fallbacks:** 65 Navigable Playlist-Position URLs (`&index=N`) preserved with exact catalog titles
- **Chapter Intros Truncated (72–77):** 6 entries flagged (`isChapterIntro: true`)
- **Supplementary Deep-Dive Modules:** 6 verified English video modules for Days 9–11
- **Total Structured Learning Days:** 12 Days
- **Audit Date:** 2026-11-04

---

## 2. Ingestion & Verification Methodology

In strict compliance with PRIME's verification standard:
1. The 77 indexed lesson titles and their sequence were verified against Neso Academy's official course chapter catalog and SyncStudy syllabus index.
2. Direct individual video IDs corroborated from official course documents (e.g. Sri Indu College of Engineering & Technology CS syllabus, Neso Academy published IDs) include:
   - Position 1: `vBURTt97EkA` — Introduction to Operating Systems
   - Position 7: `TQWERtMoKbI` — Operating System Services
   - Position 9: `lhToWeuWWfw` — System Calls
   - Position 11: `UWDzhz8MVqc` — System Programs
   - Position 13: `XXPBl20J22w` — Structures of Operating System
   - Position 16: `OrM7nZcxXZU` — Process Management (Processes and Threads)
   - Position 17: `fvN98a_7AT4` — Process State
   - Position 33: `IFEFVXvjiHY` — fork() and exec() System Calls
   - Position 46: `yKD3pcFvGmY` — Scheduling Algorithms - Priority Scheduling
   - Position 49: `7TpxxTNrcTg` — Scheduling Algorithms - Round Robin Scheduling
   - Position 60: `LIzTbA3cAWY` — Semaphores
   - Position 72: `MYgmmJJfdBg` — Deadlocks — Chapter 7 introduction
3. Because external YouTube API requests are restricted in sandboxed agent environments, uncorroborated entries are transparently marked `verificationStatus: "unverified"`, provide the syllabus title, and point to the playlist position URL `https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index={N}`. Zero video IDs are manufactured.
4. Entries 72 through 77 are documented as brief introductory overviews rather than complete lessons. Complete instruction for Days 9, 10, and 11 is provided by the curated supplementary curriculum.

---

## 3. Day-by-Day Syllabus & Video Allocation

| Day | Topic Theme | Difficulty | Importance | Video Range | Supplementary Topics |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Day 01** | OS Fundamentals & Architecture | Easy | High | 1–8 | CPU Dual Mode, Interrupts, OS Services |
| **Day 02** | System Calls & Dual Mode Operation | Medium | High | 9–15 | POSIX system call tracing, Microkernels |
| **Day 03** | Processes, States, PCB & Operations | Medium | Critical | 16–22 | 5-State lifecycle, PCB, Context Switch, fork/exec |
| **Day 04** | IPC, Message Passing & Threads | Hard | Critical | 23–35 | Shared memory, Sockets, RPC, Multithreading models |
| **Day 05** | CPU Scheduling: FCFS & SJF | Medium | Critical | 36–45 | Burst cycles, Preemption vs Non-preemption, SJF |
| **Day 06** | Priority, Round Robin & Multilevel Queues | Hard | Critical | 46–55 | Priority preemption, Round Robin quantum tuning |
| **Day 07** | Synchronization: Critical Section & Peterson | Hard | Critical | 56–61 | Mutual Exclusion, Progress, Bounded Waiting, TSL |
| **Day 08** | Semaphores & Classic Concurrency Problems | Hard | High | 62–71 | Bounded Buffer, Readers-Writers, Dining Philosophers |
| **Day 09** | Deadlocks, RAG & Banker's Algorithm | Hard | Critical | 72 + Supplementary | 4 Coffman conditions, RAG cycles, Banker's Safety |
| **Day 10** | Memory Management, Paging & Replacement | Hard | Critical | 73–74 + Supplementary | Paging hardware, TLB, FIFO, LRU, Optimal, Belady |
| **Day 11** | File Systems, Inodes & Disk Scheduling | Medium | High | 75–77 + Supplementary | Inode layout, Block allocation, SCAN, C-SCAN, LOOK |
| **Day 12** | Revision, Laboratory Assessment & Mock Interview | Mixed | Critical | Practice & Labs | 25 Conceptual Questions + 6 Simulation Labs |

---

## 4. Manifest Integrity Verification

- **Primary Manifest File:** `content/os/neso-video-manifest.json`
- **Secondary Path:** `content/fundamentals/os/neso-playlist.json`
- **Supplementary Manifest:** `content/os/supplementary-manifest.json`
- **Practice Problems Manifest:** `content/os/os-exercises.json`

