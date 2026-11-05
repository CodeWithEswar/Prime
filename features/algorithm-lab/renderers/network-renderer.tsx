"use client";
import { useId, useRef, useState } from "react";
import {
  ZoomInIcon,
  ZoomOutIcon,
  RefreshIcon,
  HandPointingRight01Icon,
} from "@hugeicons/core-free-icons";
import { LabControl } from "../components/lab-control";
import type { NetworkScene } from "../engine/types";
export default function NetworkRenderer({ scene }: { scene: NetworkScene }) {
  const id = useId().replace(/:/g, ""),
    [zoom, setZoom] = useState(1),
    [pan, setPan] = useState({ x: 0, y: 0 }),
    [panning, setPanning] = useState(false),
    [selected, setSelected] = useState<string | null>(null);
  const drag = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const nodeMap = new Map(scene.nodes.map((n) => [n.id, n]));
  return (
    <div className="lab-network-renderer">
      <div className="lab-visual-caption">
        <span>
          {scene.structure.toUpperCase()} / {scene.directed ? "DIRECTED" : "UNDIRECTED"}
        </span>
        <span>
          {scene.nodes.length} nodes · {scene.edges.length} edges
        </span>
      </div>
      <div className="lab-network-controls">
        <LabControl
          icon={ZoomOutIcon}
          iconOnly
          label="Zoom out"
          disabled={zoom <= 0.6}
          onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
        />
        <span>{Math.round(zoom * 100)}%</span>
        <LabControl
          icon={ZoomInIcon}
          iconOnly
          label="Zoom in"
          disabled={zoom >= 2.2}
          onClick={() => setZoom((z) => Math.min(2.2, z + 0.2))}
        />
        <LabControl
          icon={HandPointingRight01Icon}
          iconOnly
          label="Pan visualization"
          aria-pressed={panning}
          onClick={() => setPanning(!panning)}
        />
        <LabControl
          icon={RefreshIcon}
          iconOnly
          label="Fit visualization"
          onClick={() => {
            setPan({ x: 0, y: 0 });
            setZoom(1);
            setPanning(false);
          }}
        />
      </div>
      <svg
        className="lab-network-svg"
        viewBox="0 0 680 380"
        role="group"
        aria-label={`${scene.structure} diagram. Use node buttons to inspect, or enable Pan and drag.`}
        style={{ touchAction: panning ? "none" : "pan-y" }}
        onPointerDown={(e) => {
          if (!panning) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          const ratio = 680 / e.currentTarget.getBoundingClientRect().width;
          setPan({
            x: Math.max(
              -500,
              Math.min(500, drag.current.panX + (e.clientX - drag.current.x) * ratio)
            ),
            y: Math.max(
              -300,
              Math.min(300, drag.current.panY + (e.clientY - drag.current.y) * ratio)
            ),
          });
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
      >
        <defs>
          <marker
            id={`lab-edge-${id}`}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
          </marker>
        </defs>
        <g
          transform={`translate(${340 + pan.x} ${190 + pan.y}) scale(${zoom}) translate(-340 -190)`}
        >
          {scene.edges.map((edge) => {
            const a = nodeMap.get(edge.source)!,
              b = nodeMap.get(edge.target)!,
              distance = Math.hypot(a.x - b.x, a.y - b.y) || 1,
              dx = (b.x - a.x) / distance,
              dy = (b.y - a.y) / distance,
              loopDirection = a.y < 80 ? 1 : -1;
            return edge.source === edge.target ? (
              <path
                key={edge.id}
                className="lab-network-edge"
                data-active={scene.activeEdge === edge.id}
                d={`M ${a.x - 15} ${a.y + loopDirection * 18} C ${a.x - 55} ${a.y + loopDirection * 65}, ${a.x + 55} ${a.y + loopDirection * 65}, ${a.x + 15} ${a.y + loopDirection * 18}`}
                fill="none"
                markerEnd={scene.directed ? `url(#lab-edge-${id})` : undefined}
              />
            ) : (
              <line
                key={edge.id}
                className="lab-network-edge"
                data-active={scene.activeEdge === edge.id}
                x1={a.x + dx * 24}
                y1={a.y + dy * 24}
                x2={b.x - dx * 27}
                y2={b.y - dy * 27}
                markerEnd={scene.directed ? `url(#lab-edge-${id})` : undefined}
              />
            );
          })}
          {scene.edges
            .filter((edge) => edge.weight !== undefined)
            .map((edge) => {
              const a = nodeMap.get(edge.source)!,
                b = nodeMap.get(edge.target)!;
              return (
                <text
                  key={`weight-${edge.id}`}
                  className="lab-edge-weight"
                  textAnchor="middle"
                  x={(a.x + b.x) / 2}
                  y={a.id === b.id ? a.y + (a.y < 80 ? 70 : -45) : (a.y + b.y) / 2 - 8}
                >
                  {edge.weight}
                </text>
              );
            })}
          {scene.nodes.map((node) => (
            <g
              key={node.id}
              role="button"
              tabIndex={0}
              className="lab-network-node"
              data-current={scene.current === node.id}
              data-visited={scene.visited.includes(node.id)}
              data-frontier={scene.frontier.includes(node.id)}
              data-selected={selected === node.id}
              transform={`translate(${node.x} ${node.y})`}
              aria-label={`Node ${node.label}${scene.current === node.id ? ", current" : ""}${scene.visited.includes(node.id) ? ", visited" : ""}${scene.frontier.includes(node.id) ? ", in frontier" : ""}`}
              aria-pressed={selected === node.id}
              onClick={() => {
                if (!panning) setSelected(node.id);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelected(node.id);
                }
              }}
            >
              <circle r="23" />
              <text textAnchor="middle" dy="5">
                {node.label}
              </text>
              {scene.current === node.id ? (
                <text className="lab-node-mark" textAnchor="middle" y="-32">
                  ◆
                </text>
              ) : scene.visited.includes(node.id) ? (
                <text className="lab-node-mark" x="24" y="-21">
                  ✓
                </text>
              ) : null}
            </g>
          ))}
        </g>
      </svg>
      <p className="lab-visual-legend">
        ◆ Current <span>○ Frontier</span>
        <span>✓ Visited</span>
      </p>
      {selected !== null && (
        <p className="lab-selected-node" role="status">
          Node {nodeMap.get(selected)?.label} ·{" "}
          {scene.current === selected
            ? "current"
            : scene.visited.includes(selected)
              ? "visited"
              : scene.frontier.includes(selected)
                ? "in frontier"
                : "not visited"}
        </p>
      )}
      <details className="lab-graph-text">
        <summary>Inspect nodes and read structure</summary>
        <div className="lab-node-buttons">
          {scene.nodes.map((node) => (
            <LabControl
              key={node.id}
              label={`Inspect node ${node.label}`}
              aria-pressed={selected === node.id}
              onClick={() => setSelected(node.id)}
            >
              {node.label}
            </LabControl>
          ))}
        </div>
        <p>{scene.nodes.map((n) => `${n.label} (ID ${n.id})`).join(", ")}</p>
        <ul>
          {scene.edges.map((e) => (
            <li key={e.id}>
              {nodeMap.get(e.source)?.label} {scene.directed ? "to" : "connected with"}{" "}
              {nodeMap.get(e.target)?.label}
              {e.weight !== undefined ? ` · weight ${e.weight}` : ""}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
