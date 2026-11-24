"use client";

import { memo } from "react";
import { BaseEdge, getBezierPath, type EdgeProps, type Edge } from "@xyflow/react";
import type { VisPathEdgeData } from "../types";

export type FigmaFlowEdge = Edge<VisPathEdgeData, "figmaEdge">;

function FigmaEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  selected,
}: EdgeProps<FigmaFlowEdge>) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.25,
  });

  const trackColorMap: Record<string, string> = {
    "data-engineering": "#EF4444",
    "cs-fundamentals": "#3B82F6",
    dsa: "#10B981",
  };

  const track = data?.track || "data-engineering";
  const baseColor = data?.color || trackColorMap[track] || "#EF4444";
  const isFlowing = data?.isFlowing ?? true;

  return (
    <>
      {/* 1. Base Ambient Glow Path */}
      <path
        d={edgePath}
        fill="none"
        stroke={baseColor}
        strokeWidth={selected ? 4 : 2}
        strokeOpacity={selected ? 0.9 : 0.4}
        className="transition-all duration-200"
      />

      {/* 2. Interactive Base Edge */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: baseColor,
          strokeWidth: selected ? 2.5 : 1.75,
          strokeOpacity: selected ? 1 : 0.75,
        }}
      />

      {/* 3. Figma Flowing Dashes / Photons Animation */}
      {isFlowing && (
        <path
          d={edgePath}
          fill="none"
          stroke={selected ? "#FFFFFF" : baseColor}
          strokeWidth={selected ? 3 : 2}
          strokeDasharray="8 12"
          className="animate-figma-flow pointer-events-none"
          style={{
            filter: `drop-shadow(0 0 6px ${baseColor})`,
          }}
        />
      )}
    </>
  );
}

export const FigmaEdge = memo(FigmaEdgeComponent);
