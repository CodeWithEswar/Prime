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

export type RayType = "primary" | "secondary" | "micro";
export type RayLayer = RayType;

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
  type: RayType;
}

export type EmberColorType = "crimson" | "hot_red" | "orange_red" | "golden_ember";

export interface FlamingEmber {
  id: number;
  angle: number;
  radius: number;
  size: number;
  baseSpeed: number;
  speed: number;
  swirlRate: number;
  swirlPhase: number;
  opacity: number;
  baseOpacity: number;
  colorType: EmberColorType;
  trailLength: number;
  hasTrail: boolean;
}

export interface MagneticBlazeConfig {
  speedMultiplier: number;
  attractionStrength: number;
  angularDrift: number;
  trailLengthMultiplier: number;
  glowIntensity: number;
}

export const magneticBlazeConfig: MagneticBlazeConfig = {
  speedMultiplier: 0.65,
  attractionStrength: 0.8,
  angularDrift: 0.12,
  trailLengthMultiplier: 1.25,
  glowIntensity: 0.7,
};

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
