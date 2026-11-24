export * from "@/domain/python";
import type { PythonDashboardData, PythonStageSchedule, PythonVideoItem, PythonExercise } from "@/domain/python";

export interface PythonWorkspaceProps {
  initialData: PythonDashboardData;
}

export interface PythonHeroProps {
  courseTitle: string;
  enrolled: boolean;
  progressPercentage: number;
  totalVideos: number;
  watchedVideos: number;
  completedStages: number;
  totalStages: number;
  onEnrollToggle?: () => void;
}

export interface StageProgressRailProps {
  stages: PythonStageSchedule[];
  activeStageNumber: number;
  onSelectStage: (stageNumber: number) => void;
  completedStages: Set<number>;
}

export interface StageWorkspaceProps {
  stage: PythonStageSchedule;
  videos: PythonVideoItem[];
  exercises: PythonExercise[];
  watchedVideoIds: Set<string>;
  onToggleWatchVideo: (videoId: string, watched: boolean) => void;
  onOpenVideoModal: (video: PythonVideoItem) => void;
}
