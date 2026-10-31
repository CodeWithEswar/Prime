import * as React from "react";
import type { ApiProperty } from "@/lib/design-system/types";

export interface ApiTableProps {
  properties: ApiProperty[];
}

export function ApiTable({ properties }: ApiTableProps) {
  if (!properties || properties.length === 0) return null;

  return (
    <div className="overflow-x-auto prime-scrollbar rounded-[var(--radius-md)] border border-[rgba(255,255,255,0.08)] bg-[#000000]">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-[rgba(255,255,255,0.08)] bg-[#030303] text-[11px] font-mono uppercase tracking-wider text-[var(--text-tertiary)]">
            <th className="py-2.5 px-4 font-semibold">Property</th>
            <th className="py-2.5 px-4 font-semibold">Type</th>
            <th className="py-2.5 px-4 font-semibold">Default</th>
            <th className="py-2.5 px-4 font-semibold">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[rgba(255,255,255,0.06)] font-mono text-[11px]">
          {properties.map((prop) => (
            <tr
              key={prop.name}
              className="hover:bg-[rgba(255,255,255,0.02)] transition-colors"
            >
              <td className="py-3 px-4 font-bold text-white whitespace-nowrap align-top">
                <span>{prop.name}</span>
                {prop.required && (
                  <span
                    className="text-[#ff0000] ml-1 font-bold"
                    title="Required property"
                  >
                    *
                  </span>
                )}
              </td>
              <td className="py-3 px-4 text-[#ff0000] whitespace-pre-wrap break-words max-w-[240px] align-top opacity-90">
                {prop.type}
              </td>
              <td className="py-3 px-4 text-[var(--text-tertiary)] whitespace-nowrap align-top">
                {prop.default || "—"}
              </td>
              <td className="py-3 px-4 text-[rgba(255,255,255,0.68)] font-sans text-xs leading-relaxed align-top">
                {prop.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
