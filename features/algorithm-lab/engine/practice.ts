import type { AlgorithmTrace, Prediction } from "./types";
export type PracticeState = {
  answers: Record<number, "correct" | "revealed">;
  attempts: Record<number, number>;
  incorrect: number;
  retries: number;
};
export const initialPractice: PracticeState = {
  answers: {},
  attempts: {},
  incorrect: 0,
  retries: 0,
};
export function evaluatePrediction(question: Prediction, answer: string): boolean {
  return question.options.some((o) => o.id === answer) && question.correct === answer;
}
export function pendingPrediction(
  trace: AlgorithmTrace,
  index: number,
  practice: PracticeState
) {
  return trace.steps[index].prediction && !practice.answers[index]
    ? trace.steps[index].prediction
    : null;
}
