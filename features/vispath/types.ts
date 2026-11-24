export type VisPathTrackId =
  | "all"
  | "data-engineering"
  | "cs-fundamentals"
  | "dsa";

export type VisPathNodeStatus =
  | "completed"
  | "in_progress"
  | "available"
  | "locked";

export interface VisPathNode {
  id: string;
  title: string;
  subtitle: string;
  track: "data-engineering" | "cs-fundamentals" | "dsa";
  stage: number;
  x: number;
  y: number;
  radius: number;
  status: VisPathNodeStatus;
  color: string;
  glowColor: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedHours: number;
  description: string;
  subtopics: string[];
  tools: string[];
  prerequisites: string[];
  href: string;
  labsCount?: number;
  videosCount?: number;
}

export interface VisPathEdge {
  id: string;
  from: string;
  to: string;
  track: "data-engineering" | "cs-fundamentals" | "dsa";
  curvature?: number;
}

export interface VisPathNodeData extends Record<string, unknown> {
  node: VisPathNode;
  isExpanded?: boolean;
  isSelected?: boolean;
  onExpandToggle?: (nodeId: string) => void;
  onSelect?: (node: VisPathNode) => void;
}

export interface VisPathEdgeData extends Record<string, unknown> {
  edge: VisPathEdge;
  track: "data-engineering" | "cs-fundamentals" | "dsa";
  isFlowing?: boolean;
  color?: string;
}

export interface CameraState {
  x: number;
  y: number;
  zoom: number;
}

export interface PhotonParticle {
  edgeId: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  controlX: number;
  controlY: number;
  progress: number;
  speed: number;
  color: string;
  size: number;
}

export interface AmbientStar {
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  opacity: number;
  twinklePhase: number;
  twinkleSpeed: number;
}

export interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  opacity: number;
}
