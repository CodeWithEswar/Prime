"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import {
  CodeIcon,
  CheckmarkBadge01Icon,
  AlertCircleIcon,
  ArrowRight01Icon,
  HelpCircleIcon,
} from "@hugeicons/core-free-icons";
import type { OOPOutputPredictionQuestion } from "@/domain/oop";

interface OutputPredictionStudioProps {
  questions: OOPOutputPredictionQuestion[];
  onRecordAttempt?: (questionId: string, isCorrect: boolean) => void;
}

export function OutputPredictionStudio({
  questions,
  onRecordAttempt,
}: OutputPredictionStudioProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [history, setHistory] = useState<Record<string, { isCorrect: boolean }>>({});

  const currentQ = questions[currentIndex] || questions[0];

  const handleCheck = () => {
    setRevealed(true);
    const isCorrect =
      userAnswer.trim().toLowerCase() === currentQ.expectedOutput.trim().toLowerCase();
    setHistory((prev) => ({ ...prev, [currentQ.id]: { isCorrect } }));
    if (onRecordAttempt) onRecordAttempt(currentQ.id, isCorrect);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setUserAnswer("");
      setRevealed(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setUserAnswer("");
      setRevealed(false);
    }
  };

  const isCurrentCorrect =
    userAnswer.trim().toLowerCase() === currentQ.expectedOutput.trim().toLowerCase();

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-[#1F1F1F] pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-[#FF0000]">
              Practice Section
            </span>
            <Badge variant="outline" className="border-[#262626] bg-[#141414] text-[#CCCCCC]">
              Java Output Prediction
            </Badge>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Code Output Prediction & Misconception Analysis
          </h2>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-[#888888]">
          Question {currentIndex + 1} of {questions.length}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Code Snippet (7 cols) */}
        <div className="space-y-4 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-5 lg:col-span-7">
          <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
            <span className="font-bold text-white">{currentQ.title}</span>
            <Badge variant="outline" className="text-[11px] text-[#FF4D4D]">
              {currentQ.javaVersion}
            </Badge>
          </div>

          <div className="rounded-lg border border-[#1F1F1F] bg-[#050505] p-4 font-mono text-xs text-[#CCCCCC] overflow-x-auto">
            <pre className="whitespace-pre">{currentQ.snippet}</pre>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {currentQ.misconceptionTags.map((tag) => (
              <Badge key={tag} variant="outline" className="border-[#262626] bg-[#121212] text-[10px] text-[#888888]">
                #{tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Right: Answer Submission & Verification (5 cols) */}
        <div className="space-y-4 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-5 lg:col-span-5">
          <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#AAAAAA]">
              Your Prediction
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <label className="text-[11px] text-[#888888]">What does this program print?</label>
              <textarea
                rows={3}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Enter exact expected console output..."
                disabled={revealed}
                className="mt-1.5 w-full rounded border border-[#262626] bg-[#121212] p-2.5 text-xs text-white placeholder:text-[#555555] focus:border-[#FF0000] focus:outline-none"
              />
            </div>

            {!revealed ? (
              <Button
                variant="primary"
                size="sm"
                onClick={handleCheck}
                disabled={!userAnswer.trim()}
                className="w-full bg-[#FF0000] text-white hover:bg-[#D90000]"
              >
                Submit & Verify Prediction
              </Button>
            ) : (
              <div className="space-y-3">
                <div
                  className={`rounded-lg border p-3 ${
                    isCurrentCorrect
                      ? "border-green-500/30 bg-green-500/10 text-green-300"
                      : "border-[#FF0000]/40 bg-[#FF0000]/10 text-[#FF8080]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon icon={isCurrentCorrect ? CheckmarkBadge01Icon : AlertCircleIcon} size={16} />
                    <span className="font-bold">
                      {isCurrentCorrect ? "Correct Prediction!" : "Incorrect Prediction"}
                    </span>
                  </div>
                  <div className="mt-2 text-[11px] text-white">
                    <span className="text-[#888888]">Expected Output:</span>{" "}
                    <span className="font-bold text-green-400">{currentQ.expectedOutput}</span>
                  </div>
                </div>

                <div className="rounded border border-[#1F1F1F] bg-[#121212] p-3 text-[11px] leading-relaxed text-[#CCCCCC]">
                  <span className="font-bold text-[#FF8080]">Step-by-Step Analysis:</span>
                  <p className="mt-1">{currentQ.explanation}</p>
                </div>
              </div>
            )}

            {/* Stepper Navigation */}
            <div className="flex items-center justify-between border-t border-[#1A1A1A] pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="border-[#262626] bg-[#141414] text-xs text-[#CCCCCC]"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={currentIndex === questions.length - 1}
                className="border-[#262626] bg-[#141414] text-xs text-white"
              >
                Next Problem
                <Icon icon={ArrowRight01Icon} size={14} className="ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

