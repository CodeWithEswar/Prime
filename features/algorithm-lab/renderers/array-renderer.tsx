"use client";
import { motion, useReducedMotion } from "motion/react";
import type { ArrayScene } from "../engine/types";
export default function ArrayRenderer({ scene }: { scene: ArrayScene }) {
  const reduced = useReducedMotion();
  return (
    <div className="lab-array-renderer">
      <div className="lab-visual-caption">
        <span>ARRAY / INDEXED VALUES</span>
        <span>{scene.cells.length} values</span>
      </div>
      <div
        className="lab-array-scroll"
        tabIndex={0}
        role="region"
        aria-label="Array visualization, scroll horizontally for more values"
      >
        <ol className="lab-array" aria-label="Array state">
          {scene.cells.map((cell, i) => (
            <motion.li
              layout={!reduced}
              transition={{ duration: reduced ? 0 : 0.2 }}
              key={cell.id}
              data-active={scene.active.includes(i)}
              data-inactive={scene.inactive.includes(i)}
              data-settled={scene.settled.includes(i)}
              data-found={scene.found.includes(i)}
              data-window={!!scene.range && i >= scene.range[0] && i <= scene.range[1]}
              aria-label={`Index ${i}: ${cell.value}${scene.active.includes(i) ? ", current comparison" : ""}${scene.found.includes(i) ? ", found" : ""}${scene.settled.includes(i) ? ", settled" : ""}${scene.inactive.includes(i) ? ", eliminated" : ""}`}
            >
              <span className="lab-cell-index" aria-hidden="true">
                {scene.found.includes(i) ? "✓ " : scene.active.includes(i) ? "◆ " : ""}
                {String(i).padStart(2, "0")}
              </span>
              <strong>{cell.value}</strong>
              <span className="lab-cell-pointer" aria-hidden="true">
                {Object.entries(scene.pointers)
                  .filter(([, index]) => index === i)
                  .map(([name]) => name)
                  .join(" / ") ||
                  (scene.found.includes(i) ? "✓" : scene.settled.includes(i) ? "✓" : " ")}
              </span>
            </motion.li>
          ))}
        </ol>
      </div>
      <div className="lab-pointer-summary" aria-label="Pointer positions">
        {Object.entries(scene.pointers).map(([name, index]) => (
          <span key={name}>
            <b>{name}</b> {index}
            {index < 0 || index >= scene.cells.length ? " · outside array" : ""}
          </span>
        ))}
      </div>
      <p className="lab-visual-legend">
        ◆ Current comparison <span>○ Candidate</span>
        <span>✓ Found / settled</span>
        <span className="lab-muted">Faded: eliminated</span>
      </p>
    </div>
  );
}
