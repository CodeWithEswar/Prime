"use client";
import { useEffect, useRef, type ReactNode } from "react";
import "./table.css";
export function PrimeTable({ children }: { children?: ReactNode }) {
  const frame = useRef<HTMLDivElement>(null),
    viewport = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = viewport.current,
      target = frame.current;
    if (!node || !target) return;
    const sync = () => {
      target.dataset.left = String(node.scrollLeft > 2);
      target.dataset.right = String(
        node.scrollWidth - node.clientWidth - node.scrollLeft > 2
      );
    };
    const observer =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(sync) : null;
    observer?.observe(node);
    if (node.firstElementChild) observer?.observe(node.firstElementChild);
    node.addEventListener("scroll", sync, { passive: true });
    sync();
    return () => {
      observer?.disconnect();
      node.removeEventListener("scroll", sync);
    };
  }, [children]);
  return (
    <div className="prime-data-strip" ref={frame}>
      <div
        className="prime-table-viewport"
        ref={viewport}
        tabIndex={0}
        role="region"
        aria-label="Scrollable comparison table"
      >
        <table aria-label="Comparison table">{children}</table>
      </div>
    </div>
  );
}
