import type { AlgorithmModule, Complexity, TraceValue } from "../engine/types";
import { traceBuilder, validateTrace } from "../engine/trace";
export type Builder = ReturnType<typeof traceBuilder>;
type Definition<T> = {
  id: string;
  defaultInput: T;
  examples?: { name: string; input: T }[];
  parse: (input: unknown) => T;
  complexity: Complexity;
  invariant: string;
  objectives: string[];
  code: [key: string, java: string, pseudocode: string][];
  run: (input: T, trace: Builder) => TraceValue;
};
export function defineAlgorithm<T>(definition: Definition<T>): AlgorithmModule {
  const lines = (language: 1 | 2) => ({
    lines: definition.code.map((line) => ({
      id: `${definition.id}.${line[0]}`,
      text: line[language],
    })),
  });
  return {
    id: definition.id,
    defaultInput: definition.defaultInput,
    examples: definition.examples ?? [],
    complexity: definition.complexity,
    invariant: definition.invariant,
    objectives: definition.objectives,
    java: lines(1),
    pseudocode: lines(2),
    validateInput: definition.parse,
    generateTrace(raw) {
      const input = definition.parse(raw),
        trace = traceBuilder(definition.id, input, definition.complexity);
      const result = definition.run(input, trace),
        complete = trace.finish(result);
      if (process.env.NODE_ENV !== "production")
        validateTrace(
          complete,
          new Set(definition.code.map((c) => `${definition.id}.${c[0]}`))
        );
      return complete;
    },
  };
}
