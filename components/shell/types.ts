import type { IconSvgElement } from "@/components/ui/icon";

export interface ShellUserData {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface ShellPreparationContext {
  targetRole: string | null;
  targetDate: string | null;
  startDate: string | null;
  dailyStudyMinutes?: number;
}

export interface ShellDayContext {
  currentDay: number;
  totalDays: number;
}

export interface ShellData {
  user: ShellUserData | null;
  preparationContext: ShellPreparationContext | null;
  dayContext: ShellDayContext | null;
  revisionDueCount: number;
}

export type NavGroupId =
  | "prepare"
  | "practice"
  | "fundamentals"
  | "understand"
  | "workspace";

export interface PrimeNavItem {
  id: string;
  label: string;
  href: string;
  icon: IconSvgElement;
  group: NavGroupId;
  matchPrefixes?: string[];
  exact?: boolean;
  attention?: "revision";
  available?: boolean;
  aiOnly?: boolean;
}

export interface NavGroup {
  id: NavGroupId;
  label: string;
  items: PrimeNavItem[];
}
