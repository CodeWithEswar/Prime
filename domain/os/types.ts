/**
 * PRIME — Operating Systems Domain Types
 */

export type OSVideoDifficulty = "Easy" | "Medium" | "Hard";
export type OSVideoImportance = "Low" | "Medium" | "High" | "Critical";

export interface OSVideoItem {
  position: number;
  youtubeVideoId: string | null;
  /** Existing course progress key when playback metadata changes. */
  progressId?: string;
  title: string;
  channel: string;
  canonicalUrl: string | null;
  playlistUrl: string;
  dayNumber: number;
  difficulty: OSVideoDifficulty;
  importance: OSVideoImportance;
  topicSlug: string;
  estimatedMinutes: number;
  verificationStatus: "verified" | "unverified";
  isSupplementary?: boolean;
  isChapterIntro?: boolean;
  verifiedAt?: string | null;
  description?: string;
  language?: string;
}

export interface OSInterviewQuestion {
  id: string;
  question: string;
  answer: string;
  importance: OSVideoImportance;
  category: string;
}

export interface OSDaySchedule {
  dayNumber: number;
  title: string;
  subtitle: string;
  summary: string;
  focus: string;
  estimatedMinutes: number;
  videoPositions: number[];
  supplementaryIds?: string[];
  learningOutcomes: string[];
  deliverable: string;
  practicalAssignment: {
    title: string;
    description: string;
    problemId?: string;
  };
  interviewQuestions: OSInterviewQuestion[];
  labSlug?: string;
}

export interface UserOSVideoProgress {
  videoId: string;
  watched: boolean;
  watchedAt?: string | null;
  notes?: string | null;
  difficultyRating?: OSVideoDifficulty | null;
  isBookmarked?: boolean;
  revisionDue?: boolean;
}

export interface UserOSLabAttempt {
  labId: string;
  status: "attempted" | "completed" | "needs_revision";
  solutionNotes?: string | null;
  completedAt?: string | null;
  score?: number;
}

export interface UserOSDayProgress {
  dayNumber: number;
  assignmentCompleted: boolean;
  notes?: string | null;
  completedAt?: string | null;
}

export interface OSProgressMetrics {
  totalVideos: number;
  watchedVideos: number;
  totalDays: number;
  completedDays: number;
  completionPercentage: number;
  totalMinutes: number;
  watchedMinutes: number;
  revisionDueCount: number;
  labsCompletedCount: number;
  totalLabs: number;
}

// ==========================================
// SIMULATOR TYPES
// ==========================================

// 1. Process State Lab
export type ProcessState = "New" | "Ready" | "Running" | "Waiting" | "Terminated";

export type ProcessTransitionEvent =
  | "admit"
  | "dispatch"
  | "timeout"
  | "io_wait"
  | "io_completion"
  | "exit";

export interface ProcessControlBlock {
  pid: number;
  name: string;
  state: ProcessState;
  programCounter: number;
  cpuRegisters: Record<string, number>;
  memoryBase: number;
  memoryLimit: number;
  openFilesCount: number;
  priority: number;
}

export interface ProcessStateTransitionLog {
  timestamp: number;
  fromState: ProcessState;
  toState: ProcessState;
  event: ProcessTransitionEvent;
  reason: string;
  success: boolean;
}

// 2. CPU Scheduling
export type CPUSchedulingAlgorithm =
  | "FCFS"
  | "SJF_NON_PREEMPTIVE"
  | "SRTF"
  | "PRIORITY_NON_PREEMPTIVE"
  | "PRIORITY_PREEMPTIVE"
  | "ROUND_ROBIN";

export interface ProcessInput {
  pid: string;
  arrivalTime: number;
  burstTime: number;
  priority?: number;
}

export interface GanttBlock {
  pid: string | "IDLE";
  startTime: number;
  endTime: number;
}

export interface ProcessScheduleResult {
  pid: string;
  arrivalTime: number;
  burstTime: number;
  priority?: number;
  completionTime: number;
  turnaroundTime: number; // CT - AT
  waitingTime: number; // TAT - BT
  responseTime: number; // First scheduled time - AT
}

export interface CPUScheduleSimulation {
  algorithm: CPUSchedulingAlgorithm;
  timeQuantum?: number;
  ganttChart: GanttBlock[];
  results: ProcessScheduleResult[];
  averageTurnaroundTime: number;
  averageWaitingTime: number;
  averageResponseTime: number;
  cpuUtilization: number; // %
  totalContextSwitches: number;
  executionTrace: string[];
}

// 3. Synchronization
export type SyncProblemType =
  | "peterson"
  | "producer_consumer"
  | "readers_writers"
  | "dining_philosophers";

export interface SyncStep {
  stepIndex: number;
  action: string;
  threadId: string;
  stateSnapshot: Record<string, unknown>;
  criticalSectionOccupant: string | null;
  violation?: string | null;
  explanation: string;
}

// 4. Deadlock & Banker's Algorithm
export interface BankersInput {
  numProcesses: number;
  numResources: number;
  available: number[];
  allocation: number[][];
  max: number[][];
}

export interface BankersSafetyResult {
  isSafe: boolean;
  safeSequence: number[] | null;
  need: number[][];
  stepTrace: Array<{
    step: number;
    currentWork: number[];
    evaluatedProcess: number;
    canFinish: boolean;
    reason: string;
  }>;
  deadlockedProcesses?: number[];
}

export interface ResourceRequestResult {
  canGrant: boolean;
  reason: string;
  safetyCheck?: BankersSafetyResult;
}

// 5. Memory & Page Replacement
export type PageReplacementAlgorithm = "FIFO" | "LRU" | "OPTIMAL";

export interface PageReplacementStep {
  step: number;
  page: number;
  frames: (number | null)[];
  isFault: boolean;
  evictedPage: number | null;
}

export interface PageReplacementResult {
  algorithm: PageReplacementAlgorithm;
  numFrames: number;
  referenceString: number[];
  steps: PageReplacementStep[];
  totalPageFaults: number;
  totalPageHits: number;
  faultRatio: number;
  hitRatio: number;
}

export interface AddressTranslationResult {
  logicalAddress: number;
  pageSize: number;
  pageNumber: number;
  offset: number;
  frameNumber: number | null;
  physicalAddress: number | null;
  tlbHit: boolean;
  valid: boolean;
}

// 6. Disk Scheduling
export type DiskSchedulingAlgorithm =
  | "FCFS"
  | "SSTF"
  | "SCAN"
  | "C_SCAN"
  | "LOOK"
  | "C_LOOK";

export type DiskDirection = "UP" | "DOWN";

export interface DiskSchedulingResult {
  algorithm: DiskSchedulingAlgorithm;
  initialHead: number;
  direction: DiskDirection;
  maxCylinders: number;
  requests: number[];
  trajectory: number[]; // Sequence of head movements
  stepMovements: number[];
  totalHeadMovement: number;
  averageSeekDistance: number;
  stepTrace: string[];
}

