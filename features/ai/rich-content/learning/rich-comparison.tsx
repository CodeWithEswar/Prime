"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ComparisonEntity {
  name: string;
  badge?: string;
  tags?: string[];
}

export interface ComparisonAttribute {
  label: string;
  valueA: React.ReactNode;
  valueB: React.ReactNode;
}

export interface RichComparisonProps {
  entityA: ComparisonEntity;
  entityB: ComparisonEntity;
  attributes: ComparisonAttribute[];
  className?: string;
}

export function RichComparison({
  entityA,
  entityB,
  attributes,
  className,
}: RichComparisonProps) {
  return (
    <div
      className={cn(
        "my-4 rounded-xl border border-white/[0.08] bg-[#0A0A0A] overflow-hidden shadow-md font-mono text-xs",
        className
      )}
    >
      {/* Header comparison row */}
      <div className="grid grid-cols-2 divide-x divide-white/[0.08] border-b border-white/[0.08] bg-[#0E0E0E]">
        <div className="p-3 text-center space-y-1">
          <span className="text-sm font-bold text-white tracking-tight">{entityA.name}</span>
          {entityA.badge && (
            <span className="block text-[10px] text-[#6EE7B7]">{entityA.badge}</span>
          )}
        </div>
        <div className="p-3 text-center space-y-1">
          <span className="text-sm font-bold text-white tracking-tight">{entityB.name}</span>
          {entityB.badge && (
            <span className="block text-[10px] text-[#93C5FD]">{entityB.badge}</span>
          )}
        </div>
      </div>

      {/* Comparison Attribute Rows */}
      <div className="divide-y divide-white/[0.04]">
        {attributes.map((attr, idx) => (
          <div key={idx} className="p-3 space-y-1 hover:bg-white/[0.02] transition-colors">
            <span className="block text-center text-[10px] uppercase tracking-wider text-neutral-500 font-semibold mb-1">
              {attr.label}
            </span>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="text-neutral-200 font-sans text-xs break-words">{attr.valueA}</div>
              <div className="text-neutral-200 font-sans text-xs break-words">{attr.valueB}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

