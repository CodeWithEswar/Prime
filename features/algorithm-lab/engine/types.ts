export type LabMode = "watch" | "step" | "practice";
export type TraceValue =
  string | number | boolean | null | TraceValue[] | { [key: string]: TraceValue };
export type ArrayScene = {
  kind: "array";
  cells: { id: string; value: number }[];
  active: number[];
  pointers: Record<string, number>;
  range?: [number, number];
  inactive: number[];
  settled: number[];
  found: number[];
};
export type SequenceScene = {
  kind: "stack" | "queue" | "linked-list";
  cells: { id: string; value: number }[];
  active: number[];
};
export type NetworkScene = {
  kind: "network";
  structure: "tree" | "graph";
  nodes: { id: string; label: string; x: number; y: number }[];
  edges: { id: string; source: string; target: string; weight?: number }[];
  directed: boolean;
  current: string | null;
  visited: string[];
  frontier: string[];
  activeEdge: string | null;
};
export type Scene = ArrayScene | SequenceScene | NetworkScene;
export type Prediction = {
  prompt: string;
  options: { id: string; label: string }[];
  correct: string;
  explanation: string;
  hint: string;
};
export type AlgorithmStep = {
  id: string;
  index: number;
  operation: string;
  title: string;
  explanation: string;
  scene: Scene;
  variables: Record<string, TraceValue>;
  metrics: Record<string, number>;
  code: string;
  prediction?: Prediction;
};
export type CodeDefinition = { lines: { id: string; text: string }[] };
export type Complexity = { time: string; space: string; reason: string };
export type AlgorithmTrace = {
  version: 1;
  algorithmId: string;
  input: unknown;
  steps: readonly AlgorithmStep[];
  result: TraceValue;
  complexity: Complexity;
};
export type AlgorithmModule = {
  id: string;
  defaultInput: unknown;
  examples: { name: string; input: unknown }[];
  validateInput: (input: unknown) => unknown;
  generateTrace: (input: unknown) => AlgorithmTrace;
  java: CodeDefinition;
  pseudocode: CodeDefinition;
  invariant: string;
  objectives: string[];
  complexity: Complexity;
};
export type AlgorithmMetadata = {
  slug: string;
  name: string;
  category: string;
  description: string;
  aliases: string[];
  topics: string[];
  renderer: "array" | "sequence" | "network";
};
