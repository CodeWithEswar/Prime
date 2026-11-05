export * from "@/domain/dbms/types";

export type DBMSActiveTab = "roadmap" | "videos" | "sql" | "interview" | "analytics";

export interface VideoFilterState {
  dayNumber: number | "all";
  difficulty: "all" | "Easy" | "Medium" | "Hard";
  importance: "all" | "High" | "Critical" | "Medium" | "Low";
  status: "all" | "watched" | "unwatched" | "bookmarked" | "revision_due";
  searchQuery: string;
}

