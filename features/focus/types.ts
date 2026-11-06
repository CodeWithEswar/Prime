/**
 * PRIME Focus Mode — Authoritative Types
 * Defines states, configuration, particle physics, and session telemetry.
 */

export type FocusState =
  | "ready"
  | "starting"
  | "running"
  | "paused"
  | "finishing"
  | "completed"
  | "finished_early"
  | "error";

export type { ActiveStudySession } from "@/features/today/types";

export interface FocusSessionTask {
  id: string;
  title: string;
  taskType: "revision" | "dsa_problem" | "custom";
  plannedMinutes: number;
  topicName?: string | null;
  problemDifficulty?: "EASY" | "MEDIUM" | "HARD" | null;
  problemSlug?: string | null;
  stageName?: string | null;
  reasonExplanation?: string | null;
}

export interface FocusSessionMetadata {
  id: string;
  taskId: string;
  taskTitle: string;
  startedAt: string;
  durationSeconds: number; // accumulated focused time prior to current run
  status: "running" | "paused";
  targetMinutes: number;
}

export type RayLayer = "outer" | "mid" | "inner";

export interface MagneticRay {
  id: number;
  angle: number;
  radius: number;
  baseLength: number;
  length: number;
  baseSpeed: number;
  speed: number;
  width: number;
  opacity: number;
  energy: number;
  phase: number;
  angularDrift: number;
  layer: RayLayer;
}

export interface MagneticParticle {
  id: number;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  radius: number;
  opacity: number;
  baseOpacity: number;
  energy: number;
  orbitDirection: -1 | 1;
  angle: number;
  distance: number;
  speed: number;
}
