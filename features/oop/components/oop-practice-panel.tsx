"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OutputPredictionStudio } from "./practice/output-prediction-studio";
import { LLDCaseStudio } from "./practice/lld-case-studio";
import type {
  OOPLLDCase,
  OOPOutputPredictionQuestion,
  UserOOPDesignAttempt,
} from "@/domain/oop";

interface OOPPracticePanelProps {
  outputPredictions: OOPOutputPredictionQuestion[];
  lldCases: OOPLLDCase[];
  designAttempts: Record<string, UserOOPDesignAttempt>;
  activeCaseId: string;
  onSelectCase: (caseId: string) => void;
  onRecordDesignAttempt: (
    caseId: string,
    selfAssessment: "proficient" | "adequate" | "needs_review",
    notes: string
  ) => void;
}

export function OOPPracticePanel({
  outputPredictions,
  lldCases,
  designAttempts,
  activeCaseId,
  onSelectCase,
  onRecordDesignAttempt,
}: OOPPracticePanelProps) {
  const [activeSection, setActiveSection] = useState<"output_prediction" | "lld">("output_prediction");

  return (
    <div className="space-y-6">
      {/* Sub-navigation Tabs */}
      <div className="flex gap-2 border-b border-[#1A1A1A] pb-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setActiveSection("output_prediction")}
          className={`border-[#262626] font-mono text-xs ${
            activeSection === "output_prediction"
              ? "border-[#FF0000] bg-[#FF0000]/10 text-white font-bold"
              : "bg-[#141414] text-[#CCCCCC] hover:text-white"
          }`}
        >
          Java Output Prediction ({outputPredictions.length})
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setActiveSection("lld")}
          className={`border-[#262626] font-mono text-xs ${
            activeSection === "lld"
              ? "border-[#FF0000] bg-[#FF0000]/10 text-white font-bold"
              : "bg-[#141414] text-[#CCCCCC] hover:text-white"
          }`}
        >
          Low-Level Design (LLD) Cases ({lldCases.length})
        </Button>
      </div>

      {activeSection === "output_prediction" && (
        <OutputPredictionStudio questions={outputPredictions} />
      )}

      {activeSection === "lld" && (
        <LLDCaseStudio
          cases={lldCases}
          attempts={designAttempts}
          activeCaseId={activeCaseId}
          onSelectCase={onSelectCase}
          onRecordAttempt={onRecordDesignAttempt}
        />
      )}
    </div>
  );
}

