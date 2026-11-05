"use client";
import { useState } from "react";
import { LabControl } from "./lab-control";
import type { Prediction } from "../engine/types";
import { evaluatePrediction } from "../engine/practice";
export function PracticePrompt({
  question,
  answered,
  onAnswer,
  onReveal,
}: {
  question: Prediction;
  answered?: "correct" | "revealed";
  onAnswer: (correct: boolean) => void;
  onReveal: () => void;
}) {
  const [wrong, setWrong] = useState(false);
  return (
    <section
      className="lab-practice"
      aria-labelledby="lab-prediction-title"
      data-result={answered ?? (wrong ? "incorrect" : "pending")}
    >
      <span className="lab-overline">YOUR MOVE / PREDICT THE TRANSITION</span>
      <h2 id="lab-prediction-title">{question.prompt}</h2>
      <div className="lab-answer-options">
        {question.options.map((option) => (
          <LabControl
            key={option.id}
            disabled={!!answered}
            onClick={() => {
              const correct = evaluatePrediction(question, option.id);
              setWrong(!correct);
              onAnswer(correct);
            }}
          >
            {option.label}
          </LabControl>
        ))}
      </div>
      <div role="status" className="lab-answer-feedback">
        {answered ? (
          <>
            <strong>{answered === "correct" ? "✓ Correct" : "Answer revealed"}</strong>
            <p>{question.explanation}</p>
            <span>Use Next to inspect the resulting state.</span>
          </>
        ) : wrong ? (
          <>
            <strong>Not quite. Try again.</strong>
            <p>{question.hint}</p>
          </>
        ) : (
          <p>The next state stays hidden until you answer or reveal.</p>
        )}
      </div>
      {!answered && <LabControl onClick={onReveal}>Reveal answer</LabControl>}
    </section>
  );
}
