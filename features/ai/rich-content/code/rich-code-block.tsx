"use client";

import * as React from "react";
import {
  Copy01Icon,
  Tick02Icon,
  TextWrapIcon,
  UnfoldMoreIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { normalizeLanguage, languageLabel, looksLikeCode } from "@/features/ai/markdown/utils";
import type { CodeLines } from "@/features/ai/markdown/highlight";
import { RichMermaid } from "../diagrams/rich-mermaid";
import { RichComplexity } from "../learning/rich-complexity";
import { RichSteps } from "../learning/rich-steps";
import { cn } from "@/lib/utils";
import "@/features/ai/markdown/code-frame.css";
import "@/features/ai/markdown/syntax-colors.css";

export interface RichCodeBlockProps {
  source: string;
  language?: string;
  generating?: boolean;
  filename?: string;
  className?: string;
}

export function RichCodeBlock({
  source,
  language = "text",
  generating = false,
  filename,
  className,
}: RichCodeBlockProps) {
  const [highlighted, setHighlighted] = React.useState<{
    key: string;
    lines: CodeLines;
  } | null>(null);
  const [wrap, setWrap] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);
  const [override, setOverride] = React.useState<string | null>(null);

  const id = React.useId();
  const rawLang = language.toLowerCase().trim();

  // Special language handling: Mermaid
  if (rawLang === "mermaid") {
    return <RichMermaid source={source} className={className} />;
  }

  // Special language handling: Complexity
  if (rawLang === "complexity") {
    const lines = source.split("\n");
    let time = "";
    let space = "";
    let best = "";
    let worst = "";
    let explanation = "";

    lines.forEach((line) => {
      const [key, ...rest] = line.split(":");
      const val = rest.join(":").trim();
      const k = key.trim().toLowerCase();
      if (k === "time") time = val;
      else if (k === "space") space = val;
      else if (k === "best" || k === "best case") best = val;
      else if (k === "worst" || k === "worst case") worst = val;
      else if (k === "explanation" || k === "desc") explanation = val;
    });

    if (time || space) {
      return (
        <RichComplexity
          time={time}
          space={space}
          best={best}
          worst={worst}
          explanation={explanation}
          className={className}
        />
      );
    }
  }

  // Special language handling: Steps
  if (rawLang === "steps") {
    const lines = source.split("\n").filter((l) => l.trim().length > 0);
    const steps = lines.map((l, i) => {
      const clean = l.replace(/^\d+[\.\)]\s*/, "").trim();
      const parts = clean.split(":");
      if (parts.length > 1) {
        return { title: parts[0].trim(), detail: parts.slice(1).join(":").trim() };
      }
      return { title: clean || `Step ${i + 1}` };
    });

    if (steps.length > 0) {
      return <RichSteps steps={steps} className={className} />;
    }
  }

  // Standard code block handling
  const original = normalizeLanguage(language);
  const selection =
    override ??
    (original === "text" &&
    ["text", "plaintext", "txt", "plain", ""].includes(language.toLowerCase()) &&
    looksLikeCode(source)
      ? "auto"
      : original);
  const lang = normalizeLanguage(selection);
  const cacheKey = `${lang}\0${source}`;

  React.useEffect(() => {
    if (generating || lang === "text") return;
    let active = true;

    void import("@/features/ai/markdown/highlight")
      .then((mod) => mod.highlightCode(source, lang))
      .then((lines) => {
        if (active) setHighlighted({ key: cacheKey, lines });
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [source, lang, cacheKey, generating]);

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(source);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // fallback
    }
  };

  const lines =
    highlighted?.key === cacheKey && !generating
      ? highlighted.lines
      : source.split("\n").map((text) => [{ text, classes: [] as string[] }]);

  const isLong = lines.length > 40;
  const showLineNumbers = lines.length >= 4;

  return (
    <figure
      className={cn("prime-code-frame", className)}
      data-generating={generating}
      data-long={isLong && !expanded}
    >
      {/* Code Toolbar Header */}
      <figcaption className="prime-code-toolbar" id={id}>
        <div className="prime-code-caption flex items-center gap-2">
          {filename && (
            <span className="font-mono text-xs text-white font-bold bg-white/[0.08] px-2 py-0.5 rounded">
              {filename}
            </span>
          )}
          <Select value={selection} onValueChange={setOverride}>
            <SelectTrigger className="prime-code-language" aria-label="Code language">
              <SelectValue>
                {override
                  ? languageLabel(override)
                  : selection === "auto"
                    ? "AUTO"
                    : languageLabel(language)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="prime-code-language-menu">
              {[
                "auto",
                "text",
                "java",
                "typescript",
                "javascript",
                "python",
                "sql",
                "bash",
                "json",
                "cpp",
                "c",
                "css",
                "markdown",
                "yaml",
              ].map((l) => (
                <SelectItem key={l} value={l}>
                  {languageLabel(l)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isLong && (
            <span className="prime-code-line-count font-mono text-[11px] text-neutral-500">
              {lines.length} lines
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="prime-code-actions flex items-center gap-1">
          {generating && (
            <span className="prime-code-generating text-[11px] text-[#FF4D4D] font-mono">
              Generating…
            </span>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setWrap((w) => !w)}
            aria-pressed={wrap}
            className="h-7 w-7 p-0 text-neutral-400 hover:text-white hover:bg-white/[0.08]"
            title="Wrap code"
            aria-label="Wrap code"
          >
            <Icon icon={TextWrapIcon} size={13} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2 text-xs font-mono text-neutral-400 hover:text-white hover:bg-white/[0.08] gap-1"
            title="Copy code"
            aria-label="Copy code"
          >
            <Icon icon={copied ? Tick02Icon : Copy01Icon} size={13} className={copied ? "text-[#10B981]" : ""} />
            <span className="hidden sm:inline text-[11px]">{copied ? "Copied" : "Copy"}</span>
          </Button>

          <span role="status" aria-live="polite" className="sr-only">
            {copied ? "Code copied." : ""}
          </span>
        </div>
      </figcaption>

      {/* Code Body Area */}
      <div
        className="prime-code-scroll overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        tabIndex={0}
        role="region"
        aria-label="Code snippet"
      >
        <pre className={cn("prime-code-pre", wrap && "prime-code-wrap")}>
          <code className={`language-${lang}`}>
            {lines.map((line, lineIndex) => (
              <span key={lineIndex} className="prime-code-line">
                {showLineNumbers && (
                  <span className="prime-code-line-number" aria-hidden="true">
                    {lineIndex + 1}
                  </span>
                )}
                <span className="prime-code-line-content">
                  {line.map((token, tokenIndex) => (
                    <span
                      key={tokenIndex}
                      className={token.classes.join(" ")}
                    >
                      {token.text}
                    </span>
                  ))}
                  {"\n"}
                </span>
              </span>
            ))}
          </code>
        </pre>
      </div>

      {/* Long Code Expand / Collapse Footer */}
      {isLong && (
        <div className="prime-code-expand-footer p-2 text-center border-t border-white/[0.06] bg-[#0A0A0A]">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
            className="h-7 text-xs font-mono text-neutral-400 hover:text-white gap-1"
          >
            <Icon icon={UnfoldMoreIcon} size={13} />
            <span>{expanded ? "Compact view" : "Show full code"}</span>
          </Button>
        </div>
      )}
    </figure>
  );
}

