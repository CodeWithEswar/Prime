import type {
  AlgorithmStep,
  AlgorithmTrace,
  ArrayScene,
  Complexity,
  Prediction,
  Scene,
  TraceValue,
} from "./types";
export const MAX_TRACE_STEPS = 2000;
function freeze<T>(value: T): T {
  if (value && typeof value === "object") {
    Object.freeze(value);
    Object.values(value).forEach(freeze);
  }
  return value;
}
export function arrayScene(values: number[]): ArrayScene {
  return {
    kind: "array",
    cells: values.map((value, i) => ({ id: `value-${i}`, value })),
    active: [],
    pointers: {},
    inactive: [],
    settled: [],
    found: [],
  };
}
export function prediction(
  prompt: string,
  labels: string[],
  answer: number,
  explanation: string,
  hint: string
): Prediction {
  return {
    prompt,
    options: labels.map((label, i) => ({ id: String(i), label })),
    correct: String(answer),
    explanation,
    hint,
  };
}
export function traceBuilder(id: string, input: unknown, complexity: Complexity) {
  const steps: AlgorithmStep[] = [];
  return {
    emit(
      operation: string,
      title: string,
      explanation: string,
      scene: Scene,
      variables: Record<string, TraceValue>,
      code: string,
      metrics: Record<string, number> = {},
      question?: Prediction
    ) {
      if (steps.length >= MAX_TRACE_STEPS)
        throw new Error("Visualization is too large. Reduce the input size.");
      const step: AlgorithmStep = {
        id: `${id}-${steps.length}`,
        index: steps.length,
        operation,
        title,
        explanation,
        scene: structuredClone(scene),
        variables: structuredClone(variables),
        metrics: { ...metrics },
        code: `${id}.${code}`,
        ...(question ? { prediction: structuredClone(question) } : {}),
      };
      steps.push(freeze(step));
    },
    finish(result: TraceValue): AlgorithmTrace {
      if (!steps.length) throw new Error("No execution steps were generated.");
      return freeze({
        version: 1,
        algorithmId: id,
        input: structuredClone(input),
        steps,
        result,
        complexity,
      });
    },
  };
}
/** Runs in tests and development to catch authoring mistakes, never guessed UI state. */
export function validateTrace(trace: AlgorithmTrace, codeIds: Set<string>): void {
  if (!trace.steps.length || trace.steps.length > MAX_TRACE_STEPS)
    throw new Error("Invalid trace size");
  const ids = new Set<string>();
  for (const [i, step] of trace.steps.entries()) {
    if (!step.id || ids.has(step.id) || step.index !== i)
      throw new Error("Invalid step identity");
    ids.add(step.id);
    if (!codeIds.has(step.code)) throw new Error(`Invalid code reference: ${step.code}`);
    const scene = step.scene;
    if (scene.kind === "network") {
      const nodes = new Set(scene.nodes.map((n) => n.id));
      if (
        scene.nodes.length > 15 ||
        nodes.size !== scene.nodes.length ||
        scene.edges.some((e) => !nodes.has(e.source) || !nodes.has(e.target)) ||
        [
          ...scene.visited,
          ...scene.frontier,
          ...(scene.current ? [scene.current] : []),
        ].some((n) => !nodes.has(n))
      )
        throw new Error("Invalid graph node reference");
    } else {
      if (
        scene.cells.length > 32 ||
        scene.active.some((n) => !Number.isInteger(n) || n < 0 || n >= scene.cells.length)
      )
        throw new Error("Invalid active index");
      if (
        scene.kind === "array" &&
        [...scene.settled, ...scene.found, ...scene.inactive].some(
          (n) => n < 0 || n >= scene.cells.length
        )
      )
        throw new Error("Invalid array reference");
    }
    if (
      step.prediction &&
      !step.prediction.options.some((o) => o.id === step.prediction!.correct)
    )
      throw new Error("Invalid prediction answer");
  }
  function jsonValue(value: unknown): void {
    if (value === null || typeof value === "string" || typeof value === "boolean") return;
    if (typeof value === "number" && Number.isFinite(value)) return;
    if (Array.isArray(value)) {
      value.forEach(jsonValue);
      return;
    }
    if (value && typeof value === "object") {
      Object.values(value).forEach(jsonValue);
      return;
    }
    throw new Error("Trace contains non-serializable state");
  }
  jsonValue(trace);
}
