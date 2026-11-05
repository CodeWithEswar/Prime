"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import {
  CodeIcon,
  CheckmarkBadge01Icon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons";
import {
  INTERFACE_VS_ABSTRACT_MATRIX,
  evaluateDiamondResolution,
  type DiamondResolutionScenario,
} from "@/domain/oop";

interface InterfaceStudioProps {
  onComplete?: () => void;
}

export function InterfaceStudio({ onComplete }: InterfaceStudioProps) {
  const [resolutionChoice, setResolutionChoice] = useState<
    "override_custom" | "delegate_left" | "delegate_right" | "no_resolution"
  >("delegate_left");

  const scenario: DiamondResolutionScenario = {
    leftInterface: "AudioPlayer",
    rightInterface: "VideoPlayer",
    methodSignature: "play()",
    resolutionChoice,
  };

  const result = evaluateDiamondResolution(scenario);

  const handleSelectChoice = (
    choice: "override_custom" | "delegate_left" | "delegate_right" | "no_resolution"
  ) => {
    setResolutionChoice(choice);
    if (onComplete) onComplete();
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#1F1F1F] pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-[#FF0000]">
              Laboratory 06
            </span>
            <Badge variant="outline" className="border-[#262626] bg-[#141414] text-[#CCCCCC]">
              Interfaces & Default Methods
            </Badge>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Abstract Class vs Interface & Diamond Resolution
          </h2>
        </div>
      </div>

      {/* Main Grid: Comparison Table vs Diamond Resolution Studio */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Capability Matrix (6 cols) */}
        <div className="space-y-4 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-5 lg:col-span-6">
          <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#AAAAAA]">
              Language Capabilities
            </span>
            <Badge variant="outline" className="text-xs text-[#FF4D4D]">
              Java 8+ Spec
            </Badge>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {INTERFACE_VS_ABSTRACT_MATRIX.map((row) => (
              <div key={row.feature} className="rounded-lg border border-[#1F1F1F] bg-[#121212] p-3">
                <div className="font-bold text-white">{row.feature}</div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded bg-[#161616] p-2">
                    <span className="text-[#888888]">abstract class:</span>{" "}
                    <span className={row.abstractClass.supported ? "text-green-400 font-bold" : "text-[#FF8080]"}>
                      {row.abstractClass.supported ? "YES" : "NO"}
                    </span>
                    <div className="mt-1 text-[10px] text-[#666666]">{row.abstractClass.note}</div>
                  </div>
                  <div className="rounded bg-[#161616] p-2">
                    <span className="text-[#888888]">interface:</span>{" "}
                    <span className={row.interfaceType.supported ? "text-green-400 font-bold" : "text-[#FF8080]"}>
                      {row.interfaceType.supported ? "YES" : "NO"}
                    </span>
                    <div className="mt-1 text-[10px] text-[#666666]">{row.interfaceType.note}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Diamond Problem Studio (6 cols) */}
        <div className="space-y-4 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-5 lg:col-span-6">
          <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#AAAAAA]">
              Default Method Diamond Resolution
            </span>
            <Badge
              variant="outline"
              className={result.compiles ? "border-green-500/40 text-green-400" : "border-[#FF0000]/40 text-[#FF8080]"}
            >
              {result.compiles ? "Compiles OK" : "Compilation Error"}
            </Badge>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="rounded border border-[#1F1F1F] bg-[#050505] p-3 text-[11px] text-[#888888]">
              <div>interface AudioPlayer &#123; default void play() &#123; log("Audio"); &#125; &#125;</div>
              <div className="mt-1">interface VideoPlayer &#123; default void play() &#123; log("Video"); &#125; &#125;</div>
            </div>

            <label className="text-[11px] text-[#888888]">Select Conflict Resolution Strategy:</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectChoice("no_resolution")}
                className={`border-[#262626] text-xs ${
                  resolutionChoice === "no_resolution" ? "border-[#FF0000] bg-[#FF0000]/10 text-white" : "bg-[#141414] text-[#CCCCCC]"
                }`}
              >
                No Override (Crash)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectChoice("delegate_left")}
                className={`border-[#262626] text-xs ${
                  resolutionChoice === "delegate_left" ? "border-[#FF0000] bg-[#FF0000]/10 text-white" : "bg-[#141414] text-[#CCCCCC]"
                }`}
              >
                AudioPlayer.super.play()
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectChoice("delegate_right")}
                className={`border-[#262626] text-xs ${
                  resolutionChoice === "delegate_right" ? "border-[#FF0000] bg-[#FF0000]/10 text-white" : "bg-[#141414] text-[#CCCCCC]"
                }`}
              >
                VideoPlayer.super.play()
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectChoice("override_custom")}
                className={`border-[#262626] text-xs ${
                  resolutionChoice === "override_custom" ? "border-[#FF0000] bg-[#FF0000]/10 text-white" : "bg-[#141414] text-[#CCCCCC]"
                }`}
              >
                Custom Implementation
              </Button>
            </div>

            {/* Generated Code */}
            <div className="rounded border border-[#1F1F1F] bg-[#121212] p-3">
              <pre className="whitespace-pre-wrap text-[11px] text-[#CCCCCC]">{result.generatedCode}</pre>
            </div>

            {/* Compiler / Explanation */}
            <div
              className={`rounded border p-3 text-[11px] ${
                result.compiles
                  ? "border-green-500/30 bg-green-500/10 text-green-300"
                  : "border-[#FF0000]/40 bg-[#FF0000]/10 text-[#FF8080]"
              }`}
            >
              <div className="flex items-start gap-1.5">
                <Icon icon={result.compiles ? CheckmarkBadge01Icon : AlertCircleIcon} size={16} className="mt-0.5 shrink-0" />
                <span>{result.explanation}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

