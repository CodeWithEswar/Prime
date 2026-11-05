import type {
  CapacityDay,
  ControlPreview,
  ScheduledWork,
} from "@/domain/planning/control";
import type { PlanFeasibility } from "@/domain/planning/types";
import type { WorkRequest } from "./schema";

export type PlannerView = {
  today: string;
  target: string;
  start: string;
  role: string;
  timezone: string;
  hasPlan: boolean;
  bufferPercent: number;
  milestones: {
    slug: string;
    name: string;
    completed: number;
    total: number;
    estimate: string | null;
  }[];
  days: CapacityDay[];
  tasks: ScheduledWork[];
  backlog: { id: string; title: string; request: WorkRequest }[];
  rules: { weekday: number; minutes: number; rest: boolean }[];
  exceptions: { date: string; minutes: number; label: string }[];
  feasibility: PlanFeasibility | null;
};
export type ProposalView = ControlPreview & {
  id: string | null;
  title: string;
  expiresAt?: string;
  target?: string;
  bufferPercent?: number;
};
export type Choice = { id: string; label: string };
