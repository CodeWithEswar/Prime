<USER_REQUEST>
PRIME â€” OPERATING SYSTEMS LEARNING INTELLIGENCE V2
Complete premium Codex implementation prompt, 12-day curriculum, 77-entry YouTube index, interactive OS laboratories
Product: PRIME â€” Preparation Roadmap for Interviews, Mastery & Excellence
Feature: Fundamentals â†’ Operating Systems
Goal: Build a production-quality, evidence-based, interview-oriented OS learning experience inside the existing PRIME product.
Primary playlist: https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O
Supplementary playlist (language must be checked): https://www.youtube.com/playlist?list=PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdP8p
Official course chapters: https://www.nesoacademy.org/cs/03-subject
Source integrity: The 77 lesson titles and their order below are based on the indexed course catalog (SyncStudy) and the user's OS roadmap. The links in the manifest are playlist-position navigation links, NOT individually verified watch?v=VIDEO_ID URLs. Their position parameters may not reliably open the intended lesson if YouTube reorders the playlist. The coding agent MUST retrieve and verify the actual videoId for each of the 77 entries before production publication. Do not present these navigation links as canonical individual watch URLs. The six entries 72â€“77 are brief chapter introductions, not complete lessons.
1. Agent role and non-negotiable mission
Act as Staff Full-Stack Engineer, Design Systems Engineer, OS Curriculum Architect, Interactive Simulation Engineer, Database/RLS Engineer, and Test Architect. Inspect the repository before coding. Reuse the existing PRIME fundamentals learning engine implemented for DBMS. Do not create a separate OS app, duplicate the course database, or change PRIME's brand identity. Deliver a working vertical slice with persistence, authorization, tests, and genuine learning functionality, not a static UI mockup.
2. Repository reconnaissance and reuse contract
Audit existing Next.js App Router routes, layouts, sidebar/topbar, PRIME design-system documentation, components/ui, shared course components, DBMS learning flow, Supabase migrations/RLS, query-key factories, curriculum imports, note editor, revision engine, Planner V2, Today, Analytics, Weakness, Mastery, PRIME AI, and testing setup. Write docs/fundamentals/os-implementation-audit.md with (a) reusable component inventory, (b) domain tables, (c) integration contracts, (d) missing capabilities, (e) migration risks. Never assume a planned feature is already implemented. Refactor DBMS-specific components into shared Fundamentals components only when justified; preserve all DBMS routes, records, and behavior.
3. PRIME design system â€” strict reuse
The entire experience must use existing PRIME tokens and primitives: pure black #000000 canvas, pure red #FF0000 active accent, white #FFFFFF primary typography, approved near-black elevations, Geist Sans/Mono, Hugeicons, solid tactile/neumorphic buttons, restrained borders, and existing Motion/Framer Motion patterns. Reuse installed shadcn/ui-based Button, Icon Button, Button Group, Tabs, Card/Surface, Separator, Table, Progress, Checkbox, Badge, Tooltip, Popover, Dropdown, Command, Select, Dialog, Sheet, Drawer, Calendar, Skeleton, Scroll Area, Form and Chart Container through actual repository exports. Do not import a second icon library or create shadow UI primitives. Map each needed interface control to an existing component and document exceptions.
Premium art direction: editorial course header, precise metric rail, thin dividers, structured learning timeline, high-quality typographic rhythm, context-sensitive controls, strong hover/focus affordances, subtle selected red strokes, no giant marketing hero, no rainbow charts, no indiscriminate glass effects, no floating cards within cards, no animated confetti, no generic template dashboard. Mobile UI is intentionally redesigned, not merely scaled down.
4. Routes and navigation
Use the repository's existing route conventions. Preferred conceptual structure: Fundamentals â†’ Operating Systems â†’ Overview / Roadmap / Videos / Practice / Simulators / Revision / Progress. Routes may be /fundamentals/os, /fundamentals/os/day/[day], /fundamentals/os/videos/[videoId], /fundamentals/os/lab/[simulation] where consistent with existing architecture. Use a single existing app shell. Internal section navigation uses PRIME Tabs; avoid a second permanent sidebar. Persist selected day/filter in URL where helpful. Deep links must restore the correct selection.
5. Page design and layout
Overview: compact course header, course facts, primary Continue Learning action, secondary Plan Course, contextual More menu, progress rail, next required activity, interview-critical topic coverage, due revisions, recent attempt evidence, and course analytics teaser. Show real user data only.
Roadmap: a twelve-stage progression rail; each day shows topic, difficulty, interview importance, count of indexed videos, required practice, actual progress, and planner date when scheduled. Selecting a stage opens the shared day workspace. On desktop use a main study column plus restrained contextual rail; on mobile use a day selector and Drawer for details.
Videos: searchable, filterable, compact Table/Data List with position, verified title, duration, topic, day, difficulty, importance, availability and user status. Primary Watch action opens a verified direct YouTube URL; disabled/unresolved entries explain why. Add watched, notes, revision, and planner actions. Avoid large thumbnails in every row.
Focused study: responsive YouTube embed only if embedding is permitted; otherwise external watch link. Add course outline, notes, learning objectives, timestamps if supported, practice links, and next video. Opening a video never auto-completes it. Track progress only through an explicit user action or a reliable, consented playback completion event.
Practice: concept questions, structured numericals, small Linux exercises, and simulation-based assessment. Distinguish attempted, independently solved, solved with hints, reviewed solution, and needs revision. No auto-grading claims for open-ended text without a valid grading implementation.
Progress: use shared PRIME Analytics chart frame, tooltip, legend, data table and evidence model; distinguish watching, practice, retention, and mastery.
6. Twelve-day curriculum â€” authoritative learning structure
Day
Focus
Indexed videos
Level
Interview priority
Deliverable
1
OS fundamentals, architecture, services
1â€“8
Easy
Mediumâ€“High
Explain kernel, interrupts, user/kernel modes; draw OS architecture
2
System calls, structures, booting, virtualization
9â€“15
Medium
High
Trace a system call; compare monolithic and microkernels
3
Processes, states, PCB, context switching
16â€“22
Medium
Critical
Draw process-state machine; explain fork and process lifecycle
4
IPC, message passing, sockets, RPC, threads
23â€“35
Hard
Critical
Compare IPC models; run fork/exec example where supported
5
CPU scheduling, FCFS, SJF
36â€“45
Medium
Critical
Solve Gantt chart and timing numericals
6
Priority, Round Robin, multilevel queues
46â€“55
Hard
Critical
Solve â‰¥10 scheduling cases; analyze starvation and quantum
7
Critical sections, Peterson, locks, semaphores
56â€“61
Hard
Critical
Explain mutual exclusion; implement safe counter
8
Producer-consumer, readers-writers, philosophers, monitors
62â€“71
Hard
High
Solve synchronization scenarios and identify race/deadlock risks
9
Deadlocks, RAG, Banker's algorithm
72 + verified supplementary
Hard
Critical
Solve â‰¥5 safe-sequence exercises
10
Paging, segmentation, virtual memory, page replacement
73â€“74 + verified supplementary
Hard
Critical
Solve address translation and page-fault numericals
11
File systems, inodes, allocation, disk scheduling
75â€“77 + verified supplementary
Medium
High
Solve disk head-movement problems and explain inode/file descriptor
12
Consolidated revision and mock interview
No new indexed videos required
Mixed
Critical
25 conceptual + 10 scheduling + 5 deadlock + 5 memory + 1 practical
Critical: Days 9â€“11 cannot be considered instructionally complete from Neso's short introduction clips. Build full supplementary lessons for deadlock prevention/avoidance/detection, memory allocation/paging/segmentation/TLB/page replacement, file systems/inodes, and disk scheduling. Verify every supplementary video for language, availability, content depth, and direct ID; keep them in a separate supplementary manifest. Prefer English-language materials for English-selected users. Do not claim Gate Smashers is English without verification.
7. Full indexed YouTube video manifest â€” all 77 entries
The manifest below gives all 77 indexed lesson titles and playlist-position links. These links are navigational references only. Replace with verified individual https://www.youtube.com/watch?v=<videoId> links before production publication.
#
Day
Indexed lesson title
Playlist-position link*
1
1
Introduction to Operating Systems
[Open position 1](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=1)
2
1
Basics of OS (Computer System Operation)
[Open position 2](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=2)
3
1
Basics of OS (Storage Structure)
[Open position 3](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=3)
4
1
Basics of OS (I/O Structure)
[Open position 4](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=4)
5
1
Computer System Architecture
[Open position 5](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=5)
6
1
Operating System Structure
[Open position 6](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=6)
7
1
Operating System Services
[Open position 7](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=7)
8
1
User Operating System Interface
[Open position 8](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=8)
9
2
System Calls
[Open position 9](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=9)
10
2
Types of System Calls
[Open position 10](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=10)
11
2
System Programs
[Open position 11](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=11)
12
2
Operating System Design & Implementation
[Open position 12](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=12)
13
2
Structures of Operating System
[Open position 13](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=13)
14
2
Virtual Machines
[Open position 14](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=14)
15
2
Operating System Generation and System Boot
[Open position 15](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=15)
16
3
Process Management (Processes and Threads)
[Open position 16](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=16)
17
3
Process State
[Open position 17](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=17)
18
3
Process Control Block
[Open position 18](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=18)
19
3
Process Scheduling
[Open position 19](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=19)
20
3
Context Switch
[Open position 20](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=20)
21
3
Operation on Processes â€“ Process Creation
[Open position 21](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=21)
22
3
Operation on Processes â€“ Process Termination
[Open position 22](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=22)
23
4
Interprocess Communication
[Open position 23](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=23)
24
4
Shared Memory Systems
[Open position 24](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=24)
25
4
Message Passing Systems (Part 1)
[Open position 25](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=25)
26
4
Message Passing Systems (Part 2)
[Open position 26](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=26)
27
4
Message Passing Systems (Part 3)
[Open position 27](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=27)
28
4
Sockets in Operating System
[Open position 28](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=28)
29
4
Remote Procedure Calls (RPC)
[Open position 29](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=29)
30
4
Issues in RPC & How They're Resolved
[Open position 30](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=30)
31
4
Introduction to Threads
[Open position 31](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=31)
32
4
Multithreading Models & Hyperthreading
[Open position 32](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=32)
33
4
fork() and exec() System Calls
[Open position 33](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=33)
34
4
Threading Issues [fork() & exec() System Calls]
[Open position 34](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=34)
35
4
Threading Issues (Thread Cancellation)
[Open position 35](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=35)
36
5
Introduction to CPU Scheduling
[Open position 36](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=36)
37
5
CPU and I/O Burst Cycles
[Open position 37](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=37)
38
5
Preemptive and Non-Preemptive Scheduling
[Open position 38](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=38)
39
5
Scheduling Criteria
[Open position 39](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=39)
40
5
Scheduling Algorithms - First Come First Served (FCFS)
[Open position 40](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=40)
41
5
First Come First Served Scheduling (Solved Problem 1)
[Open position 41](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=41)
42
5
First Come First Served Scheduling (Solved Problem 2)
[Open position 42](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=42)
43
5
Scheduling Algorithms - Shortest Job First (SJF)
[Open position 43](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=43)
44
5
Shortest Job First Scheduling (Solved Problem 1)
[Open position 44](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=44)
45
5
Shortest Job First Scheduling (Solved Problem 2)
[Open position 45](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=45)
46
6
Scheduling Algorithms - Priority Scheduling
[Open position 46](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=46)
47
6
Priority Scheduling (Solved Problem 1)
[Open position 47](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=47)
48
6
Priority Scheduling (Solved Problem 2)
[Open position 48](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=48)
49
6
Scheduling Algorithms - Round Robin Scheduling
[Open position 49](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=49)
50
6
Round Robin Scheduling (Turnaround Time & Waiting Time)
[Open position 50](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=50)
51
6
Round Robin Scheduling - Solved Problem (Part 1)
[Open position 51](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=51)
52
6
Round Robin Scheduling - Solved Problem (Part 2)
[Open position 52](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=52)
53
6
Multilevel Queue Scheduling Algorithm
[Open position 53](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=53)
54
6
Multilevel Feedback-Queue Scheduling Algorithm
[Open position 54](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=54)
55
6
Scheduling Algorithms â€“ Solved Problems
[Open position 55](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=55)
56
7
Process Synchronization
[Open position 56](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=56)
57
7
The Critical-Section Problem
[Open position 57](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=57)
58
7
Petersonâ€™s Solution
[Open position 58](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=58)
59
7
Test and Set Lock
[Open position 59](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=59)
60
7
Semaphores
[Open position 60](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=60)
61
7
Disadvantages of Semaphores
[Open position 61](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=61)
62
8
The Bounded Buffer Problem
[Open position 62](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=62)
63
8
The Readers Writers Problem
[Open position 63](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=63)
64
8
The Dining Philosophers Problem
[Open position 64](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=64)
65
8
Monitors
[Open position 65](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=65)
66
8
Dining Philosophers Solution using Monitors
[Open position 66](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=66)
67
8
Process Synchronization - Problem 1
[Open position 67](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=67)
68
8
Process Synchronization - Problem 2
[Open position 68](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=68)
69
8
Process Synchronization - Problem 3
[Open position 69](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=69)
70
8
Process Synchronization - Problem 4
[Open position 70](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=70)
71
8
Process Synchronization - Problem 5
[Open position 71](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=71)
72
9
Deadlocks â€” Chapter 7 introduction
[Open position 72](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=72)
73
10
Main Memory â€” Chapter 8 introduction
[Open position 73](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=73)
74
10
Virtual Memory â€” Chapter 9 introduction
[Open position 74](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=74)
75
11
File Systems â€” Chapter 10 introduction
[Open position 75](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=75)
76
11
File System Implementation â€” Chapter 11 introduction
[Open position 76](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=76)
77
11
Mass Storage Structure â€” Chapter 12 introduction
[Open position 77](https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O&index=77)
8. Mandatory canonical video-ID verification pipeline
Create scripts/import-neso-os-playlist.ts (or repository-equivalent) and versioned content/fundamentals/os/neso-playlist.json. Use an authorized YouTube Data API client, permitted playlist metadata extraction, or reliable verified publisher metadata. Fetch all pages of playlistItems.list, then batch videos.list for title, duration, status and channel. Never assume index identifies a video. Compare against the 77-entry reference manifest; record changes in order, deleted/private items, missing IDs, renamed lessons and newly inserted entries. Produce a human-readable report of 77 indexed positions: verified, missing, mismatched, unavailable. If the current playlist no longer matches the historical index, preserve the historical course mapping and explicitly report the divergence. No fake IDs, no generated guesses, no silently shifted days.
A verified record includes { sourcePlaylistId, referencePosition, livePosition, youtubeVideoId, canonicalWatchUrl, title, durationSeconds, channelId, availability, verifiedAt, assignedDay, topicId, difficulty, importance, isChapterIntro, curriculumVersion }. canonicalWatchUrl must be constructed only after validating a real YouTube video ID. Use unique constraints for (courseId, curriculumVersion, referencePosition) and stable video identity; import must be idempotent. Keep supplementary videos separate. Do not overwrite user progress when metadata changes. If verification is blocked by credentials/network, emit the complete unresolved manifest and instructions for configuring the API; do not claim the 77 links are verified.
9. Curriculum content depth and learning checkpoints
For every day author structured objectives, prerequisites, short conceptual explanations, terminology, diagrams, worked examples, 5â€“10 interview questions, at least one recall checkpoint, and relevant practice. Separate content consumption from demonstrated understanding. Require watched-state + mandatory practice/checkpoint criteria for day completion, but do not turn completion into Mastery automatically. Assign difficulty and interview priority at topic level and inherit/override at video level with documented editorial reasons.
10. Signature interactive laboratories â€” real deterministic algorithms
A. Process State Lab: New, Ready, Running, Waiting, Terminated; valid transition graph, transition reason, event log, accessible list view. Include suspended states only if explicitly modeled and explained.
B. CPU Scheduling Studio: FCFS, SJF non-preemptive, SRTF, Priority (preemptive/non-preemptive where implemented), Round Robin, multilevel queue if algorithmically supported. Editable process table with arrival, burst, priority, quantum. Produce deterministic execution trace, Gantt chart, per-process completion/turnaround/wait/response, averages, idle time, context-switch policy. Tie-breaking must be documented. Separate pure simulation engine from React renderer. Test simultaneous arrivals, zero/invalid bursts, idle CPU, preemption, equal priority, time quantum boundaries.
C. Synchronization Studio: race conditions, critical section, mutex, counting/binary semaphores, bounded buffer, readers-writers, dining philosophers. Show thread/event timelines and lock ownership; use pedagogically correct state machines, not arbitrary animations. Distinguish deadlock, starvation, livelock and fairness assumptions.
D. Deadlock & Banker's Studio: resource-allocation graph with single vs multi-instance semantics; cycle alone is not conclusive for general multi-instance systems. For Banker's algorithm accept Available, Allocation, Maximum; validate dimensions, nonnegativity, Maximum â‰¥ Allocation; derive Need, enumerate a safe sequence when available, explain safety check step by step. Never assert an unsafe state means deadlock is already present.
E. Memory & Page Replacement Studio: page tables, logical-to-physical translation, TLB basics, FIFO/LRU/Optimal reference traces, frame contents per step, hit/fault counts, ratios. Clarify Optimal is an offline theoretical benchmark. Test Belady anomaly examples and page/frame edge cases.
F. Disk Scheduling Studio: FCFS, SSTF, SCAN, C-SCAN, LOOK, C-LOOK with explicit cylinder range, initial head, direction, endpoint-travel conventions. Display head path, total head movement and step trace. Do not claim seek distance directly predicts real SSD performance.
Each simulator must use shared PRIME controls, pure tested computation, typed input schemas, Reset, Step, Play/Pause, speed control, explanatory trace, keyboard navigation, mobile-friendly rendering, and reduced-motion support. Simulation viewing is learning activity, not independent problem-solving evidence. For graded attempts, recompute answers server-side rather than trusting client scores.
11. Video library, notes and study mode â€” premium UX
Use compact PRIME Table on desktop, responsive row cards/list on mobile, consistent filter sheet, stable search, keyboard focus, empty/error states, and contextual action menus. Save timestamped notes only if the player API exposes trustworthy time; otherwise save normal notes without invented timestamps. Store private notes with RLS. Provide Resume, Watch on YouTube, Mark Watched, Needs Revision, Plan Practice, and Next. Use skeletons matching real layout. If YouTube embedding is blocked, fall back gracefully to external watch. Never download, mirror, or redistribute copyrighted videos.
12. Planner V2, Today, Revision, Mastery and Analytics integration
Planner V2: user clicks Plan Course â†’ planning intent â†’ capacity/prerequisite/rest-day checks â†’ non-mutating preview â†’ explicit confirm â†’ idempotent committed tasks. Respect locked tasks, revision obligations, target date, availability, carry-forward, pause/resume. Never auto-create tasks on page visit.
Today: render assigned lesson/practice with Continue deep link and reason. Completion must update course progress and Planner through authoritative services without double counting.
Revision: reuse existing intervals and policy (initial 1/3/7/14/30 only if configured); derive revision candidates from mistakes, low confidence, and difficult topics. Deduplicate; do not create an OS-only scheduler.
Mastery/Weakness: only use genuine assessment/attempt evidence; watching, notes, and simulations do not imply mastery. Consume existing engine outputs.
Analytics: share PRIME chart primitives. Provide 12-day learning rail, indexed-video completion, topic coverage, numerical attempt accuracy, scheduling problem trend, revision outcomes, critical-topic evidence, study time only when recorded, and insufficient-evidence states. No invented readiness or job-placement probabilities.
13. Data architecture and migrations
Reuse generalized DBMS course tables where possible. Model versioned published curriculum separately from user-owned enrollment, video status, notes, attempts, simulation submissions, and planner/revision references. If current tables are DBMS-specific, migrate toward shared courses / course_versions / course_days / course_topics / course_resources / user_course_enrollments / user_resource_progress / course_practice_attempts or repository-equivalent without breaking existing data. Add typed constraints, unique indexes, foreign keys, timestamps, optimistic concurrency where appropriate, and full RLS. Public curriculum read access must not imply public access to notes or progress. Regenerate Supabase types after migrations.
14. Data access and performance
Use server-scoped authorization, bounded Supabase queries, batch fetches, PostgreSQL aggregation where appropriate, TanStack Query keys separating curriculum version from user progress, optimistic updates with rollback, and targeted invalidation. Cache stable public curriculum separately from private records. Lazy-load simulators and YouTube player. Avoid N+1 per-video requests, huge D3 bundles in Overview, uncontrolled background polling, and page-wide rerenders on one checkbox toggle. Prefer existing infrastructure; no unnecessary Cloudflare D1/KV/Queues.
15. Accessibility and responsive contract
Test 360, 390, 430, 768, 1024, 1440, 1920 px. On desktop: existing sidebar + compact course header + content rail + contextual inspector. Tablet: stacked or adaptive two-column. Mobile: one-column, horizontal day selector where appropriate, full-width video rows, Drawer filters, touch-friendly simulation controls, no page-level horizontal overflow. WCAG 2.2 AA, keyboard operability, visible focus, accessible diagrams and data tables, reduced motion, screen-reader simulation trace announcements, no color-only status encoding.
16. Tests and acceptance criteria
Unit test all scheduling, Banker's, page replacement and disk scheduling algorithms using hand-verified fixtures and boundary cases. Test curriculum coverage of positions 1â€“77, day mapping, duplicate prevention, unavailable video handling, title/ID mismatch reporting, supplementary-content separation, and importer idempotency. Integration test course completion, note persistence, attempt recording, revision deduplication, planner preview/commit, analytics aggregation, and RLS isolation. E2E test a user: opens OS â†’ selects Day 3 â†’ watches verified video â†’ marks watched â†’ records note â†’ solves scheduling numerical â†’ schedules revision â†’ previews course plan â†’ confirms â†’ views progress. Test DBMS regression. Run actual pnpm lint, pnpm typecheck, pnpm test, pnpm build, Playwright and migration checks; report failures truthfully.
17. Phased execution plan
Audit + content verification: inspect repo; verify 77 videos; inventory shared components; record unresolved sources.
Generalized Fundamentals engine: safely reuse DBMS schema/UI; add OS curriculum without data loss.
Overview + roadmap + videos: complete real data and progress persistence.
Learning workspace + practice: notes, checkpoints, external watch, attempts.
Simulation laboratories: implement one deterministic engine at a time, with tests and accessible rendering; prioritize CPU Scheduling, Banker's, Page Replacement.
Planner + Revision + Today: full preview/commit flows and deduplication.
Analytics + polish: real evidence, performant charts, all viewport sizes.
QA + report: security, regression, build, unresolved video verification and supplementary coverage.
18. Final report format
Report: audited components reused; design-system compliance; all 77 manifest positions with verified direct video URL or explicit unresolved status; playlist divergence; supplementary lessons and their verified URLs; routes and UI; simulator correctness and test fixtures; migrations/RLS; Planner/Revision/Analytics integrations; responsive and accessibility checks; measured performance; test/build commands and actual results; deferred limitations. Do not claim completeness if individual URLs or mandatory supplementary coverage remain unresolved.
Final directive
Build a distinctive but unmistakably PRIME-native OS learning experience: Learn â†’ Watch â†’ Simulate â†’ Practice â†’ Revise â†’ Measure. Make the interface premium through precision, coherent composition, and genuine utility. PURE BLACK. PURE RED. PURE FOCUS.
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-11-04T13:38:27+05:30.

The user's current state is as follows:
Active Document: d:\Prime\lib\query\keys.ts (LANGUAGE_UNSPECIFIED)
Cursor is on line: 1
Other open documents:
- d:\Prime\domain\mastery\explain.ts (LANGUAGE_UNSPECIFIED)
- d:\Prime\.env.example (LANGUAGE_UNSPECIFIED)
- d:\Prime\tests\unit\practice-components.test.tsx (LANGUAGE_UNSPECIFIED)
- d:\Prime\docs\dsa-catalog-quality-report.md (LANGUAGE_UNSPECIFIED)
- d:\Prime\.env.local (LANGUAGE_UNSPECIFIED)
</ADDITIONAL_METADATA>