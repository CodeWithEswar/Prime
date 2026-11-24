"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  Cancel01Icon,
  Clock01Icon,
  CheckmarkCircle02Icon,
  LinkSquare01Icon,
  NeuralNetworkIcon,
  Award01Icon,
} from "@hugeicons/core-free-icons";
import type { VisPathNode } from "../types";

interface NodeDetailDrawerProps {
  node: VisPathNode | null;
  onClose: () => void;
  onFocusNode: (node: VisPathNode) => void;
}

export function NodeDetailDrawer({
  node,
  onClose,
  onFocusNode,
}: NodeDetailDrawerProps) {
  if (!node) return null;

  return (
    <div className="absolute top-4 right-4 bottom-4 w-[calc(100%-2rem)] sm:w-[440px] z-30 pointer-events-auto flex flex-col rounded-2xl border border-[#272730] bg-[#0A0A0C]/95 backdrop-blur-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-right-6 duration-300">
      {/* Top ambient color accent line */}
      <div
        className="h-1 w-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${node.color}, transparent)`,
        }}
      />

      {/* Drawer Header */}
      <div className="p-4 sm:p-5 border-b border-[#1A1A20] flex items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge
              variant="outline"
              className="font-mono text-[10px] font-bold uppercase tracking-wider"
              style={{
                borderColor: node.color,
                color: node.color,
                backgroundColor: `${node.color}15`,
              }}
            >
              STAGE {String(node.stage).padStart(2, "0")}
            </Badge>

            <Badge
              variant="secondary"
              className="bg-[#141418] text-[#A1A1AA] text-[10px] uppercase font-mono"
            >
              {node.track.replace("-", " ")}
            </Badge>

            {node.status === "completed" && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/50">
                <Icon icon={CheckmarkCircle02Icon} size={11} />
                Mastered
              </span>
            )}
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
            {node.title}
          </h3>
          <p className="text-xs font-medium text-[#A1A1AA]">{node.subtitle}</p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="size-8 rounded-lg border border-[#222228] text-[#71717A] hover:text-white hover:bg-[#181820] shrink-0"
          aria-label="Close details"
        >
          <Icon icon={Cancel01Icon} size={15} />
        </Button>
      </div>

      {/* Drawer Body (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
        {/* Metric stats grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-[#1C1C22] bg-[#0E0E12] p-2.5 text-center">
            <span className="text-[10px] text-[#71717A] block font-mono">ESTIMATED</span>
            <span className="font-mono text-sm font-bold text-white flex items-center justify-center gap-1 mt-0.5">
              <Icon icon={Clock01Icon} size={13} className="text-[#A1A1AA]" />
              {node.estimatedHours}h
            </span>
          </div>

          <div className="rounded-xl border border-[#1C1C22] bg-[#0E0E12] p-2.5 text-center">
            <span className="text-[10px] text-[#71717A] block font-mono">DIFFICULTY</span>
            <span className="text-xs font-bold text-white block mt-0.5">
              {node.difficulty}
            </span>
          </div>

          <div className="rounded-xl border border-[#1C1C22] bg-[#0E0E12] p-2.5 text-center">
            <span className="text-[10px] text-[#71717A] block font-mono">CONTENT</span>
            <span className="font-mono text-xs font-bold text-white block mt-0.5">
              {node.videosCount ?? 0} vids • {node.labsCount ?? 0} labs
            </span>
          </div>
        </div>

        {/* Overview description */}
        <div className="space-y-1.5">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#71717A]">
            Architectural Focus
          </h4>
          <p className="text-xs leading-relaxed text-[#D4D4D8] bg-[#08080A] p-3.5 rounded-xl border border-[#18181E]">
            {node.description}
          </p>
        </div>

        {/* Subtopics Checklist */}
        {node.subtopics.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#71717A] flex items-center gap-1.5">
              <Icon icon={Award01Icon} size={13} className="text-white" />
              Core Competencies & Modules
            </h4>
            <ul className="space-y-1.5">
              {node.subtopics.map((sub, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-2 text-xs text-[#E4E4E7] bg-[#0E0E12] px-3 py-2 rounded-lg border border-[#1A1A20]"
                >
                  <span
                    className="size-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: node.color }}
                  />
                  <span>{sub}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Technology & Tool Stack */}
        {node.tools.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#71717A]">
              Technology & Platform Ecosystem
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {node.tools.map((tool, idx) => (
                <span
                  key={idx}
                  className="rounded-md border border-[#222228] bg-[#121216] px-2.5 py-1 text-[11px] font-mono text-[#D4D4D8]"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Drawer Action Footer */}
      <div className="p-4 border-t border-[#1A1A20] bg-[#0E0E12] flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onFocusNode(node)}
          className="h-9 px-3 text-xs border-[#26262E] bg-[#141418] text-[#D4D4D8] hover:text-white"
        >
          <Icon icon={NeuralNetworkIcon} size={14} className="mr-1.5 text-[#A1A1AA]" />
          Re-Center
        </Button>

        <Button
          asChild
          size="sm"
          className="h-9 px-4 text-xs font-semibold flex-1 bg-white text-black hover:bg-neutral-200"
        >
          <Link href={node.href}>
            <span>Enter Curriculum</span>
            <Icon icon={LinkSquare01Icon} size={14} className="ml-1.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
