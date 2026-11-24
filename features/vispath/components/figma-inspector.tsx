"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
  LinkSquare01Icon,
  NeuralNetworkIcon,
  ArrowRight01Icon,
  LockIcon,
} from "@hugeicons/core-free-icons";
import type { VisPathNode } from "../types";

interface FigmaInspectorProps {
  node: VisPathNode | null;
  onClose: () => void;
  onFocusNode: (node: VisPathNode) => void;
  allNodes: VisPathNode[];
}

export function FigmaInspector({
  node,
  onClose,
  onFocusNode,
  allNodes,
}: FigmaInspectorProps) {
  const [completedTopics, setCompletedTopics] = useState<Record<string, boolean>>({});

  if (!node) return null;

  const toggleTopic = (sub: string) => {
    setCompletedTopics((prev) => ({
      ...prev,
      [sub]: !prev[sub],
    }));
  };

  const prerequisiteNodes = allNodes.filter((n) => node.prerequisites.includes(n.id));

  return (
    <div className="absolute right-3 top-3 bottom-3 w-80 sm:w-96 z-40 flex flex-col rounded-2xl border border-[#27272A] bg-[#0A0A0E]/95 backdrop-blur-2xl shadow-[0_16px_50px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-right-4 duration-200 overflow-hidden">
      {/* 1. Figma Header: Frame & Inspect Properties */}
      <div className="p-3.5 border-b border-[#1F1F26] bg-[#0E0E14] flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="size-2.5 rounded-full shrink-0"
            style={{ backgroundColor: node.color }}
          />
          <div className="min-w-0">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#71717A] block truncate">
              FRAME #{node.id} · {node.track}
            </span>
            <h3 className="text-sm font-bold text-white truncate">{node.title}</h3>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="size-7 flex items-center justify-center rounded-lg text-[#71717A] hover:text-white hover:bg-[#1A1A22] transition-colors shrink-0"
        >
          <Icon icon={Cancel01Icon} size={15} />
        </button>
      </div>

      {/* 2. Figma Coordinate & Dimension Box */}
      <div className="px-4 py-2.5 border-b border-[#1A1A22] bg-[#0B0B10] grid grid-cols-4 gap-2 text-center text-xs font-mono shrink-0">
        <div className="bg-[#121218] py-1 px-1.5 rounded border border-[#1E1E26]">
          <span className="text-[9px] text-[#71717A] block">STAGE</span>
          <span className="font-semibold text-white">#{node.stage}</span>
        </div>
        <div className="bg-[#121218] py-1 px-1.5 rounded border border-[#1E1E26]">
          <span className="text-[9px] text-[#71717A] block">HOURS</span>
          <span className="font-semibold text-[#E4E4E7]">{node.estimatedHours}h</span>
        </div>
        <div className="bg-[#121218] py-1 px-1.5 rounded border border-[#1E1E26]">
          <span className="text-[9px] text-[#71717A] block">LABS</span>
          <span className="font-semibold text-white">{node.labsCount ?? 0}</span>
        </div>
        <div className="bg-[#121218] py-1 px-1.5 rounded border border-[#1E1E26]">
          <span className="text-[9px] text-[#71717A] block">VIDEOS</span>
          <span className="font-semibold text-white">{node.videosCount ?? 0}</span>
        </div>
      </div>

      {/* 3. Scrollable Inspector Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 prime-scrollbar-thin text-xs">
        {/* Status & Difficulty Badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {node.status === "completed" && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full">
                <Icon icon={CheckmarkCircle02Icon} size={12} />
                Mastered
              </span>
            )}
            {node.status === "in_progress" && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2.5 py-1 rounded-full">
                <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
                In Progress
              </span>
            )}
            {node.status === "available" && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-blue-400 bg-blue-950/60 border border-blue-800/60 px-2.5 py-1 rounded-full">
                <span className="size-1.5 rounded-full bg-blue-400" />
                Ready to Start
              </span>
            )}
            {node.status === "locked" && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-[#71717A] bg-[#16161C] border border-[#27272A] px-2.5 py-1 rounded-full">
                <Icon icon={LockIcon} size={12} />
                Prerequisites Required
              </span>
            )}
          </div>

          <span className="font-mono text-[10px] text-[#A1A1AA] bg-[#141418] px-2 py-0.5 rounded border border-[#222228]">
            {node.difficulty} Tier
          </span>
        </div>

        {/* Architectural Overview */}
        <div className="space-y-1.5">
          <h4 className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">
            Architectural Synopsis
          </h4>
          <p className="text-xs text-[#D4D4D8] leading-relaxed bg-[#111116] p-3 rounded-xl border border-[#1E1E26]">
            {node.description}
          </p>
        </div>

        {/* Prerequisites Jump Links */}
        {prerequisiteNodes.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">
              Prerequisite Dependencies
            </h4>
            <div className="space-y-1.5">
              {prerequisiteNodes.map((pre) => (
                <button
                  key={pre.id}
                  type="button"
                  onClick={() => onFocusNode(pre)}
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-[#111116] border border-[#1E1E26] hover:border-[#32323E] hover:bg-[#181822] text-left transition-all group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="size-2 rounded-full shrink-0"
                      style={{ backgroundColor: pre.color }}
                    />
                    <span className="text-xs text-[#E4E4E7] group-hover:text-white truncate">
                      {pre.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#0D99FF] flex items-center gap-0.5 shrink-0">
                    Inspect
                    <Icon icon={ArrowRight01Icon} size={11} />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Interactive Competency Checklist */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">
              Curriculum Checklist ({node.subtopics.length})
            </h4>
            <span className="text-[10px] font-mono text-[#71717A]">
              Click to track
            </span>
          </div>

          <div className="space-y-1.5">
            {node.subtopics.map((sub, idx) => {
              const isDone = completedTopics[sub];
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleTopic(sub)}
                  className="w-full flex items-center gap-2.5 p-2 rounded-lg bg-[#111116] border border-[#1E1E26] hover:bg-[#16161E] text-left transition-all"
                >
                  <span
                    className={`size-3.5 rounded flex items-center justify-center border transition-all ${
                      isDone
                        ? "bg-[#0D99FF] border-[#0D99FF] text-white"
                        : "border-[#3F3F46] bg-[#18181F]"
                    }`}
                  >
                    {isDone && <Icon icon={CheckmarkCircle02Icon} size={11} />}
                  </span>
                  <span
                    className={`text-xs flex-1 truncate transition-all ${
                      isDone ? "line-through text-[#71717A]" : "text-[#E4E4E7]"
                    }`}
                  >
                    {sub}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Technology Ecosystem */}
        {node.tools.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">
              Technology & Platform Ecosystem
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {node.tools.map((tool, idx) => (
                <span
                  key={idx}
                  className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-[#13131A] text-[#D4D4D8] border border-[#22222A]"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. Figma Inspector Footer Actions */}
      <div className="p-3.5 border-t border-[#1F1F26] bg-[#0E0E14] flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onFocusNode(node)}
          className="h-9 px-3 text-xs border-[#27272A] bg-[#141418] text-[#D4D4D8] hover:text-white"
        >
          <Icon icon={NeuralNetworkIcon} size={14} className="mr-1.5 text-[#A1A1AA]" />
          Center
        </Button>

        <Link href={node.href} className="flex-1">
          <Button
            variant="primary"
            size="sm"
            className="w-full h-9 text-xs bg-red-600 hover:bg-red-500 text-white font-medium shadow-[0_0_15px_rgba(239,68,68,0.3)]"
          >
            <span>Launch Roadmap</span>
            <Icon icon={LinkSquare01Icon} size={13} className="ml-1.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
