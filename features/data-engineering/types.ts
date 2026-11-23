export * from "@/domain/data-engineering/types";

export interface DataEngineeringFiltersState {
  stageNumber: number | "all";
  difficulty: "all" | "Easy" | "Medium" | "Hard";
  importance: "all" | "Critical" | "High" | "Medium" | "Low";
  status: "all" | "watched" | "unwatched" | "bookmarked" | "revision_due";
  searchQuery: string;
}
