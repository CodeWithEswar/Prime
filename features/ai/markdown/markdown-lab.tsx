"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import MarkdownRenderer from "./markdown-renderer";
import { CodeFrame } from "./code-frame";
import { HintTrace, TechnicalContent } from "./structured";
import {
  BASIC_MANUSCRIPT,
  DSA_MANUSCRIPT,
  TABLE_MANUSCRIPT,
  LANGUAGE_MANUSCRIPT,
  BROKEN_MANUSCRIPT,
  LONG_MANUSCRIPT,
} from "./fixtures";
import { AIControl } from "../components/ai-control";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { SentIcon, StopIcon } from "@hugeicons/core-free-icons";
import "./lab.css";
const fixtures = {
  Typography: BASIC_MANUSCRIPT,
  "DSA Java": DSA_MANUSCRIPT,
  Tables: TABLE_MANUSCRIPT,
  Languages: LANGUAGE_MANUSCRIPT,
  Streaming: DSA_MANUSCRIPT,
  "Broken Markdown": BROKEN_MANUSCRIPT,
  "Long response": LONG_MANUSCRIPT,
  Structured:
    "## Typed PRIME content\n\nThese components use explicit metadata; arbitrary prose does not become a special block.",
};
export function MarkdownLab() {
  const ready = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [name, setName] = useState<keyof typeof fixtures>("Typography"),
    [width, setWidth] = useState("full"),
    [cursor, setCursor] = useState<number | null>(null);
  const source = fixtures[name];
  const running = cursor !== null;
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(
      () =>
        setCursor((value) =>
          value === null ? null : value + 32 >= source.length ? null : value + 32
        ),
      80
    );
    return () => clearInterval(timer);
  }, [running, source]);
  return (
    <section className="prime-markdown-lab">
      <header>
        <span className="prime-technical-label">
          Development fixtures · AI / Markdown
        </span>
        <h1>PRIME Technical Manuscript</h1>
        <p>The shared reading system for the contextual panel and AI workspace.</p>
      </header>
      <div className="prime-lab-controls">
        <Select
          value={name}
          onValueChange={(value) => {
            setName(value as keyof typeof fixtures);
            setCursor(null);
          }}
        >
          <SelectTrigger aria-label="Markdown fixture" disabled={!ready}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(fixtures).map((key) => (
              <SelectItem value={key} key={key}>
                {key}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={width} onValueChange={setWidth}>
          <SelectTrigger aria-label="Preview width" disabled={!ready}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["full", "360", "400", "440", "800"].map((value) => (
              <SelectItem key={value} value={value}>
                {value === "full" ? "Available width" : `${value}px container`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <AIControl
          disabled={!ready}
          icon={cursor === null ? SentIcon : StopIcon}
          onClick={() => setCursor(cursor === null ? 0 : null)}
        >
          {cursor === null ? "Stream fixture" : "Stop preview"}
        </AIControl>
      </div>
      <div
        className="prime-lab-preview"
        style={{ width: width === "full" ? "100%" : `min(100%,${width}px)` }}
      >
        <MarkdownRenderer
          content={source.slice(0, cursor ?? source.length)}
          streaming={cursor !== null || name === "Broken Markdown"}
        />
        {name === "Structured" && (
          <>
            <HintTrace level={2}>
              <MarkdownRenderer content="What changes when the current window becomes invalid?" />
            </HintTrace>
            <TechnicalContent
              block={{
                kind: "algorithm",
                steps: [
                  {
                    title: "Expand the right boundary",
                    detail: "Include the new element.",
                  },
                  {
                    title: "Repair the invariant",
                    detail: "Move left only until the window becomes valid.",
                  },
                  { title: "Record the best result" },
                ],
              }}
            />
            <TechnicalContent
              block={{
                kind: "complexity",
                time: "O(n)",
                space: "O(k)",
                explanation: "Each pointer advances at most n times.",
              }}
            />
            <TechnicalContent
              block={{
                kind: "correction",
                statement: "HashMap lookup is always O(1).",
                correction:
                  "That describes expected behavior, not an unconditional worst-case guarantee.",
                improved:
                  "HashMap lookup is expected O(1); worst-case behavior depends on collisions and implementation.",
              }}
            />
            <TechnicalContent
              block={{
                kind: "callout",
                tone: "important",
                title: "Scheduling stays deterministic",
                body: "PRIME AI explains revision dates supplied by the Revision Engine.",
              }}
            />
            <CodeFrame
              source={Array.from(
                { length: 55 },
                (_, i) => `// Recall line ${i + 1}`
              ).join("\n")}
              language="java"
              title="Recall.java"
              highlightedLines={[4, 5, 6]}
            />
          </>
        )}
      </div>
    </section>
  );
}
