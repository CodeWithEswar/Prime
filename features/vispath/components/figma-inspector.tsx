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
    <div className="absolute right-2 sm:right-3 top-2 sm:top-3 bottom-2 sm:bottom-3 w-[calc(100%-1rem)] sm:w-88 md:w-96 z-40 flex flex-col rounded-md border border-zinc-800 bg-zinc-950/95 backdrop-blur-2xl shadow-[0_16px_50px_rgba(0,0,0,0.85)] animate-in fade-in slide-in-from-right-4 duration-200 overflow-hidden">
      {/* 1. Figma Header: Frame & Inspect Properties */}
      <div className="p-3.5 border-b border-zinc-800 bg-black/60 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="size-2.5 rounded-full shrink-0"
            style={{ backgroundColor: node.color }}
          />
          <div className="min-w-0">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 block truncate">
              FRAME #{node.id} · {node.track}
            </span>
            <h3 className="text-sm font-bold text-zinc-100 truncate">{node.title}</h3>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="size-7 flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors shrink-0"
        >
          <Icon icon={Cancel01Icon} size={15} />
        </button>
      </div>

      {/* 2. Figma Coordinate & Dimension Box */}
      <div className="px-4 py-2.5 border-b border-zinc-800 bg-zinc-950/60 grid grid-cols-4 gap-2 text-center text-xs font-mono shrink-0">
        <div className="bg-zinc-900/60 py-1.5 px-1.5 rounded-md border border-zinc-800">
          <span className="text-[9px] text-zinc-500 block">STAGE</span>
          <span className="font-semibold text-zinc-100">#{node.stage}</span>
        </div>
        <div className="bg-zinc-900/60 py-1.5 px-1.5 rounded-md border border-zinc-800">
          <span className="text-[9px] text-zinc-500 block">HOURS</span>
          <span className="font-semibold text-zinc-300">{node.estimatedHours}h</span>
        </div>
        <div className="bg-zinc-900/60 py-1.5 px-1.5 rounded-md border border-zinc-800">
          <span className="text-[9px] text-zinc-500 block">LABS</span>
          <span className="font-semibold text-zinc-100">{node.labsCount ?? 0}</span>
        </div>
        <div className="bg-zinc-900/60 py-1.5 px-1.5 rounded-md border border-zinc-800">
          <span className="text-[9px] text-zinc-500 block">VIDEOS</span>
          <span className="font-semibold text-zinc-100">{node.videosCount ?? 0}</span>
        </div>
      </div>

      {/* 3. Scrollable Inspector Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 prime-scrollbar-thin text-xs">
        {/* Status & Difficulty Badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {node.status === "completed" && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-md">
                <Icon icon={CheckmarkCircle02Icon} size={12} />
                Mastered
              </span>
            )}
            {node.status === "in_progress" && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2.5 py-1 rounded-md">
                <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
                In Progress
              </span>
            )}
            {node.status === "available" && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-zinc-200 bg-zinc-800 border border-zinc-700 px-2.5 py-1 rounded-md">
                <span className="size-1.5 rounded-full bg-zinc-400" />
                Ready to Start
              </span>
            )}
            {node.status === "locked" && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-md">
                <Icon icon={LockIcon} size={12} />
                Prerequisites Required
              </span>
            )}
          </div>

          <span className="font-mono text-[10px] text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-800">
            {node.difficulty} Tier
          </span>
        </div>

        {/* Architectural Overview */}
        <div className="space-y-1.5">
          <h4 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            Architectural Synopsis
          </h4>
          <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/40 p-3 rounded-md border border-zinc-800/80">
            {node.description}
          </p>
        </div>

        {/* Prerequisites Jump Links */}
        {prerequisiteNodes.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              Prerequisite Dependencies
            </h4>
            <div className="space-y-1.5">
              {prerequisiteNodes.map((pre) => (
                <button
                  key={pre.id}
                  type="button"
                  onClick={() => onFocusNode(pre)}
                  className="w-full flex items-center justify-between p-2 rounded-md bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-left transition-all group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="size-2 rounded-full shrink-0"
                      style={{ backgroundColor: pre.color }}
                    />
                    <span className="text-xs text-zinc-200 group-hover:text-white truncate">
                      {pre.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 group-hover:text-zinc-200 flex items-center gap-0.5 shrink-0">
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
            <h4 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              Curriculum Checklist ({node.subtopics.length})
            </h4>
            <span className="text-[10px] font-mono text-zinc-500">
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
                  className="w-full flex items-center gap-2.5 p-2 rounded-md bg-zinc-900/40 border border-zinc-800 hover:bg-zinc-900 text-left transition-all"
                >
                  <span
                    className={`size-3.5 rounded-sm flex items-center justify-center border transition-all ${
                      isDone
                        ? "bg-zinc-100 border-zinc-100 text-zinc-950 font-bold"
                        : "border-zinc-700 bg-zinc-900"
                    }`}
                  >
                    {isDone && <Icon icon={CheckmarkCircle02Icon} size={11} />}
                  </span>
                  <span
                    className={`text-xs flex-1 truncate transition-all ${
                      isDone ? "line-through text-zinc-500" : "text-zinc-200"
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
            <h4 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              Technology & Platform Ecosystem
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {node.tools.map((tool, idx) => (
                <span
                  key={idx}
                  className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-300 border border-zinc-800"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. Figma Inspector Footer Actions */}
      <div className="p-3 border-t border-zinc-800 bg-black/60 flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onFocusNode(node)}
          className="h-9 px-3 text-xs rounded-md border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-850"
        >
          <Icon icon={NeuralNetworkIcon} size={14} className="mr-1.5 text-zinc-400" />
          Center
        </Button>

        <Link href={node.href} className="flex-1">
          <Button
            variant="primary"
            size="sm"
            className="w-full h-9 text-xs rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-semibold shadow-sm transition-colors"
          >
            <span>Launch Roadmap</span>
            <Icon icon={LinkSquare01Icon} size={13} className="ml-1.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
