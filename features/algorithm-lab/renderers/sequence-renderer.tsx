"use client";
import { motion, useReducedMotion } from "motion/react";
import type { SequenceScene } from "../engine/types";
export default function SequenceRenderer({ scene }: { scene: SequenceScene }) {
  const reduced = useReducedMotion(),
    stack = scene.kind === "stack";
  return (
    <div className="lab-sequence-renderer" data-structure={scene.kind}>
      <div className="lab-visual-caption">
        <span>
          {scene.kind.toUpperCase()} /{" "}
          {stack
            ? "LAST IN, FIRST OUT"
            : scene.kind === "queue"
              ? "FIRST IN, FIRST OUT"
              : "NEXT LINKS"}
        </span>
        <span>{scene.cells.length} nodes</span>
      </div>
      <div
        className="lab-sequence-scroll"
        tabIndex={0}
        role="region"
        aria-label={`${scene.kind} visualization`}
      >
        <ol className="lab-sequence" aria-label={`${scene.kind} state`}>
          {scene.cells.map((cell, i) => (
            <motion.li
              layout={!reduced}
              transition={{ duration: reduced ? 0 : 0.2 }}
              key={cell.id}
              data-active={scene.active.includes(i)}
            >
              <small>
                {stack
                  ? i === scene.cells.length - 1
                    ? "TOP"
                    : " "
                  : scene.kind === "queue"
                    ? scene.cells.length === 1
                      ? "FRONT / REAR"
                      : i === 0
                        ? "FRONT"
                        : i === scene.cells.length - 1
                          ? "REAR"
                          : " "
                    : scene.cells.length === 1
                      ? "HEAD / TAIL"
                      : i === 0
                        ? "HEAD"
                        : i === scene.cells.length - 1
                          ? "TAIL"
                          : `NODE ${i}`}
              </small>
              <strong>{cell.value}</strong>
              <span className="lab-sequence-index">
                {scene.active.includes(i) ? "◆ " : ""}
                {i}
              </span>
              {scene.kind === "linked-list" && (
                <svg
                  className="lab-list-edge"
                  viewBox="0 0 32 20"
                  aria-label={i === scene.cells.length - 1 ? "next is null" : "next node"}
                >
                  <path d="M 0 10 H 27 M 22 5 L 27 10 L 22 15" />
                </svg>
              )}
            </motion.li>
          ))}
        </ol>
        {scene.cells.length === 0 ? (
          <p className="lab-empty-structure">
            {scene.kind === "linked-list" ? "head = null" : "Empty"}
          </p>
        ) : scene.kind === "linked-list" ? (
          <span className="lab-null">null</span>
        ) : null}
      </div>
      <p className="lab-visual-legend">
        ◆ Active node{" "}
        <span>
          {stack
            ? "Bottom → top"
            : scene.kind === "queue"
              ? "Front → rear"
              : "Follow next from head"}
        </span>
      </p>
    </div>
  );
}
