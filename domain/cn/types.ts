/**
 * PRIME — Computer Networks Domain Types
 */

export type CNDifficulty = "easy" | "medium" | "hard";
export type CNImportance = "critical" | "high" | "medium" | "low";

export interface CNVideoItem {
  playlistPosition: number;
  youtubeVideoId: string | null;
  /** Existing course progress key when playback metadata changes. */
  progressId?: string;
  verifiedTitle: string | null;
  canonicalWatchUrl: string | null;
  playlistContextUrl: string;
  durationSeconds: number | null;
  assignedStudyDay: number | null;
  topicIds: string[];
  difficulty: CNDifficulty | null;
  interviewImportance: CNImportance | null;
  contentKind: "full_lesson" | "chapter_preview" | "unknown";
  verificationStatus: "verified" | "unverified" | "unavailable";
  verifiedAt: string | null;
  isSupplementary?: boolean;
  channel?: string;
  coverageRationale?: string;
  language?: string;
}

export interface CNInterviewQuestion {
  id: string;
  question: string;
  answer: string;
  importance: CNImportance;
  category: string;
}

export interface CNDaySchedule {
  dayNumber: number;
  title: string;
  subtitle: string;
  summary: string;
  focus: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "All";
  difficulty: CNDifficulty;
  importance: CNImportance;
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
  interviewQuestions: CNInterviewQuestion[];
  labSlug?: string;
}

export interface UserCNVideoProgress {
  videoId: string;
  watched: boolean;
  watchedAt?: string | null;
  notes?: string | null;
  difficultyRating?: CNDifficulty | null;
  isBookmarked?: boolean;
  revisionDue?: boolean;
}

export interface UserCNLabAttempt {
  labId: string;
  status: "attempted" | "completed" | "needs_revision";
  solutionNotes?: string | null;
  completedAt?: string | null;
  score?: number;
}

export interface UserCNDayProgress {
  dayNumber: number;
  assignmentCompleted: boolean;
  notes?: string | null;
  completedAt?: string | null;
}

export interface CNProgressMetrics {
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
// 10 SIMULATOR INTERFACES
// ==========================================

// 1. OSI / TCP-IP
export type OSILayerNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export interface OSILayerInfo {
  layer: OSILayerNumber;
  name: string;
  tcpipEquivalent: string;
  pdu: string;
  responsibilities: string[];
  protocols: string[];
  devices: string[];
}

export interface EncapsulationStep {
  layer: OSILayerNumber;
  layerName: string;
  pdu: string;
  headerAdded: string;
  payloadDescription: string;
}

// 2. Packet Journey
export interface JourneyHop {
  id: string;
  stageName: string;
  component: string;
  protocol: string;
  layer: string;
  description: string;
  action: string;
  sourceAddress: string;
  destAddress: string;
}

// 3. IPv4 Subnet Calculator
export interface SubnetCalculationResult {
  ipAddress: string;
  cidrPrefix: number;
  subnetMask: string;
  wildcardMask: string;
  networkAddress: string;
  broadcastAddress: string;
  firstUsableIp: string;
  lastUsableIp: string;
  totalAddresses: number;
  usableHosts: number;
  ipClass: "A" | "B" | "C" | "D" | "E" | "Classless";
  isPrivate: boolean;
  isSpecialRoute: boolean; // /31 or /32
  binarySubnetMask: string;
  binaryIpAddress: string;
}

// 4. VLSM Allocator
export interface VLSMDemand {
  name: string;
  requiredHosts: number;
}

export interface VLSMSubnetAllocation {
  name: string;
  requiredHosts: number;
  allocatedHosts: number;
  prefixLength: number;
  networkAddress: string;
  subnetMask: string;
  firstUsableIp: string;
  lastUsableIp: string;
  broadcastAddress: string;
}

export interface VLSMResult {
  baseNetwork: string;
  basePrefix: number;
  allocations: VLSMSubnetAllocation[];
  remainingCapacityHosts: number;
  overflow: boolean;
  errorMessage?: string;
}

// 5. TCP Handshake
export type TCPConnectionState =
  | "CLOSED"
  | "LISTEN"
  | "SYN_SENT"
  | "SYN_RECEIVED"
  | "ESTABLISHED"
  | "FIN_WAIT_1"
  | "FIN_WAIT_2"
  | "CLOSE_WAIT"
  | "LAST_ACK"
  | "TIME_WAIT";

export interface TCPHandshakeStep {
  step: number;
  sender: "client" | "server";
  receiver: "client" | "server";
  flags: { SYN?: boolean; ACK?: boolean; FIN?: boolean; RST?: boolean };
  seq: number;
  ack: number;
  clientState: TCPConnectionState;
  serverState: TCPConnectionState;
  explanation: string;
}

// 6. Sliding Window / ARQ
export type ARQProtocolType = "STOP_AND_WAIT" | "GO_BACK_N" | "SELECTIVE_REPEAT";

export interface ARQPacketEvent {
  step: number;
  type: "SEND" | "ACK" | "LOST_PACKET" | "LOST_ACK" | "TIMEOUT_RETRANSMIT";
  packetSeq: number;
  senderWindow: [number, number]; // [start, end]
  receiverWindow: [number, number];
  description: string;
}

export interface ARQSimulationResult {
  protocol: ARQProtocolType;
  windowSize: number;
  totalPackets: number;
  trace: ARQPacketEvent[];
  efficiencyPercentage: number;
}

// 7. DNS Resolution
export type DNSRecordType = "A" | "AAAA" | "CNAME" | "MX" | "NS" | "TXT";

export interface DNSStep {
  step: number;
  serverName: string;
  serverType: "BROWSER_CACHE" | "RECURSIVE_RESOLVER" | "ROOT_SERVER" | "TLD_SERVER" | "AUTHORITATIVE";
  query: string;
  response: string;
  isCacheHit: boolean;
  ttlRemainingSeconds: number;
}

// 8. Routing Algorithms (Dijkstra & Bellman-Ford)
export interface GraphNode {
  id: string;
  label?: string;
  name?: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  weight: number;
}

export interface ShortestPathStep {
  step: number;
  currentNode: string;
  distances: Record<string, number>;
  visited: string[];
  explanation: string;
}

export interface RoutingAlgorithmResult {
  algorithm: "DIJKSTRA" | "BELLMAN_FORD";
  sourceNode: string;
  shortestDistances: Record<string, number>;
  previousHops: Record<string, string | null>;
  stepTrace: ShortestPathStep[];
  hasNegativeCycle?: boolean;
}

// 9. HTTP Lifecycle
export interface HTTPLifecycleStage {
  stageNumber: number;
  name: string;
  protocol: string;
  durationMs: number;
  summary: string;
  details: Record<string, string>;
}

// 10. Troubleshooting Workspace
export interface DiagnosticCommandOutput {
  command: string;
  output: string;
}

export interface TroubleshootingScenario {
  id: string;
  title: string;
  symptoms: string;
  topologyDescription: string;
  availableDiagnostics: Record<string, DiagnosticCommandOutput>;
  options: string[];
  correctCauseIndex: number;
  explanation: string;
}
