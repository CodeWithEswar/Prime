"use client";

import { memo } from "react";
import Link from "next/link";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { Icon } from "@/components/ui/icon";
import {
  CheckmarkCircle02Icon,
  Clock01Icon,
  Award01Icon,
  LinkSquare01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  LockIcon,
  Layers01Icon,
  PlayIcon,
} from "@hugeicons/core-free-icons";
import type { VisPathNodeData } from "../types";

export type FigmaFlowNode = Node<VisPathNodeData, "figmaNode">;

function FigmaNodeComponent({ data, selected }: NodeProps<FigmaFlowNode>) {
  const { node, isExpanded = false, onExpandToggle, onSelect } = data;

  const trackBadgeColors: Record<string, { text: string }> = {
    "data-engineering": { text: "text-red-400" },
    "cs-fundamentals": { text: "text-blue-400" },
    dsa: { text: "text-emerald-400" },
  };

  const trackLabel: Record<string, string> = {
    "data-engineering": "DATA ENGINEERING",
    "cs-fundamentals": "CS FUNDAMENTALS",
    dsa: "DSA & PATTERNS",
  };

  const badgeStyle = trackBadgeColors[node.track] || trackBadgeColors["data-engineering"];
  const isNodeSelected = selected || data.isSelected;

  return (
    <div
      onClick={() => onSelect?.(node)}
      className="group relative cursor-pointer select-none transition-all duration-200"
      style={{ width: "340px" }}
    >
      {/* 1. Figma Frame Header Micro-Tag */}
      <div className="flex items-center justify-between pb-1 px-1">
        <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-wider uppercase font-semibold text-zinc-400">
          <span
            className="size-1.5 rounded-full"
            style={{ backgroundColor: node.color }}
          />
          <span className={badgeStyle.text}>
            #{trackLabel[node.track]} · STAGE {node.stage.toString().padStart(2, "0")}
          </span>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded-md border border-zinc-800">
          {node.difficulty}
        </span>
      </div>

      {/* 2. Main Figma Node Card Body */}
      <div
        className={`relative rounded-md border bg-zinc-950/95 backdrop-blur-xl p-4 shadow-2xl transition-all duration-200 ${
          isNodeSelected
            ? "border-zinc-400 ring-1 ring-zinc-400/50 shadow-[0_0_25px_rgba(255,255,255,0.08)]"
            : "border-zinc-800 hover:border-zinc-700 hover:shadow-[0_8px_24px_rgba(0,0,0,0.6)]"
        }`}
      >
        {/* Figma Selection 4-Corner Square Anchors */}
        {isNodeSelected && (
          <>
            <span className="absolute -top-1.5 -left-1.5 size-2 rounded-sm bg-white border border-zinc-950 pointer-events-none z-20" />
            <span className="absolute -top-1.5 -right-1.5 size-2 rounded-sm bg-white border border-zinc-950 pointer-events-none z-20" />
            <span className="absolute -bottom-1.5 -left-1.5 size-2 rounded-sm bg-white border border-zinc-950 pointer-events-none z-20" />
            <span className="absolute -bottom-1.5 -right-1.5 size-2 rounded-sm bg-white border border-zinc-950 pointer-events-none z-20" />
          </>
        )}

        {/* Card Header: Stage Number, Status Pill, Hours */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span
              className="flex size-6 items-center justify-center rounded-md font-mono text-xs font-bold text-white shadow-inner"
              style={{ backgroundColor: `${node.color}33`, border: `1px solid ${node.color}88` }}
            >
              {node.stage}
            </span>
            <div className="flex items-center gap-1.5">
              {node.status === "completed" && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-md">
                  <Icon icon={CheckmarkCircle02Icon} size={11} />
                  Mastered
                </span>
              )}
              {node.status === "in_progress" && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded-md">
                  <span className="size-1.5 rounded-full bg-amber-400 animate-ping" />
                  In Progress
                </span>
              )}
              {node.status === "available" && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-zinc-200 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-md">
                  <span className="size-1.5 rounded-full bg-zinc-400" />
                  Unlocked
                </span>
              )}
              {node.status === "locked" && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-md">
                  <Icon icon={LockIcon} size={11} />
                  Locked
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-800">
            <Icon icon={Clock01Icon} size={11} className="text-zinc-500" />
            <span>{node.estimatedHours}h</span>
          </div>
        </div>

        {/* Title and Subtitle */}
        <div className="space-y-1 mb-3">
          <h3 className="text-sm font-bold text-zinc-100 tracking-tight leading-snug group-hover:text-white">
            {node.title}
          </h3>
          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
            {node.subtitle}
          </p>
        </div>

        {/* Quick Metrics Bar: Labs & Videos */}
        <div className="flex items-center gap-3 pt-2 pb-1 border-t border-zinc-800/80 text-[11px] text-zinc-400">
          {node.videosCount && (
            <div className="flex items-center gap-1">
              <Icon icon={PlayIcon} size={12} className="text-zinc-500" />
              <span>{node.videosCount} lectures</span>
            </div>
          )}
          {node.labsCount && (
            <div className="flex items-center gap-1">
              <Icon icon={Award01Icon} size={12} className="text-zinc-500" />
              <span>{node.labsCount} labs</span>
            </div>
          )}
          {node.tools.length > 0 && (
            <div className="ml-auto flex items-center gap-1">
              <Icon icon={Layers01Icon} size={11} className="text-zinc-500" />
              <span className="font-mono text-[10px] text-zinc-500">{node.tools.length} tools</span>
            </div>
          )}
        </div>

        {/* Inline Expandable Topics Accordion */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-zinc-800 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
              Core Competencies
            </span>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {node.subtopics.map((sub, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-[11px] text-zinc-200 bg-zinc-900/60 px-2.5 py-1.5 rounded-md border border-zinc-800"
                >
                  <span
                    className="size-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: node.color }}
                  />
                  <span className="truncate">{sub}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Card Interactive Footer */}
        <div className="mt-3 pt-2.5 border-t border-zinc-800 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onExpandToggle?.(node.id);
            }}
            className="flex items-center gap-1 text-[11px] font-medium text-zinc-300 hover:text-white px-2 py-1 rounded-md bg-zinc-900 hover:bg-zinc-850 border border-zinc-800/80 transition-colors"
          >
            <Icon icon={isExpanded ? ArrowUp01Icon : ArrowDown01Icon} size={12} />
            <span>{isExpanded ? "Collapse" : `Topics (${node.subtopics.length})`}</span>
          </button>

          <Link
            href={node.href}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-[11px] font-medium text-zinc-300 hover:text-white transition-colors"
          >
            <span>Curriculum</span>
            <Icon icon={LinkSquare01Icon} size={12} />
          </Link>
        </div>
      </div>

      {/* 3. React Flow Connection Handles (Figma Blueprint Anchors) */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!size-2.5 !bg-zinc-900 !border-2 !border-zinc-600 hover:!border-white hover:!bg-zinc-200 transition-all"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!size-2.5 !bg-zinc-900 !border-2 !border-zinc-600 hover:!border-white hover:!bg-zinc-200 transition-all"
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="!size-2.5 !bg-zinc-900 !border-2 !border-zinc-600 hover:!border-white hover:!bg-zinc-200 transition-all"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!size-2.5 !bg-zinc-900 !border-2 !border-zinc-600 hover:!border-white hover:!bg-zinc-200 transition-all"
      />
    </div>
  );
}

export const FigmaNode = memo(FigmaNodeComponent);
