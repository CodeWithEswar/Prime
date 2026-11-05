"use client";
import { memo, useEffect, useState, useId } from "react";
import {
  Copy01Icon,
  Tick02Icon,
  TextWrapIcon,
  UnfoldMoreIcon,
} from "@hugeicons/core-free-icons";
import { AIControl } from "../components/ai-control";
import { languageLabel, normalizeLanguage, looksLikeCode } from "./utils";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import type { CodeLines } from "./highlight";
import "./code-frame.css";
import "./syntax-colors.css";
export interface CodeFrameProps {
  source: string;
  language?: string;
  generating?: boolean;
  title?: string;
  highlightedLines?: number[];
}
export const CodeFrame = memo(function CodeFrame({
  source,
  language = "text",
  generating = false,
  title,
  highlightedLines = [],
}: CodeFrameProps) {
  const [highlighted, setHighlighted] = useState<{
      key: string;
      lines: CodeLines;
    } | null>(null),
    [wrap, setWrap] = useState(false),
    [copied, setCopied] = useState(false),
    [copyError, setCopyError] = useState(false),
    [expanded, setExpanded] = useState(false);
  const [override, setOverride] = useState<string | null>(null);
  const id = useId(),
    original = normalizeLanguage(language),
    selection =
      override ??
      (original === "text" &&
      ["text", "plaintext", "txt", "plain", ""].includes(language.toLowerCase()) &&
      looksLikeCode(source)
        ? "auto"
        : original),
    lang = normalizeLanguage(selection),
    key = lang + "\0" + source;
  useEffect(() => {
    if (generating || lang === "text") return;
    let active = true;
    void import("./highlight")
      .then((module) => module.highlightCode(source, lang))
      .then((lines) => {
        if (active) setHighlighted({ key, lines });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [source, lang, key, generating]);
  const lines =
    highlighted?.key === key && !generating
      ? highlighted.lines
      : source.split("\n").map((text) => [{ text, classes: [] }]);
  const numbers = lines.length >= 4,
    long = lines.length > 40;
  return (
    <figure
      className="prime-code-frame"
      data-generating={generating}
      data-long={long && !expanded}
    >
      <figcaption className="prime-code-toolbar" id={id}>
        <div className="prime-code-caption">
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
                "xml",
                "css",
                "markdown",
                "yaml",
                "diff",
              ].map((option) => (
                <SelectItem key={option} value={option}>
                  {languageLabel(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {title && <strong>{title}</strong>}
          {generating && <small>Generating…</small>}
        </div>
        <div className="prime-code-actions">
          <AIControl
            iconOnly
            icon={TextWrapIcon}
            onClick={() => setWrap(!wrap)}
            aria-pressed={wrap}
            aria-label="Wrap code"
            title="Wrap code"
          >
            Wrap
          </AIControl>
          <AIControl
            iconOnly
            icon={copied ? Tick02Icon : Copy01Icon}
            aria-label="Copy code"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(source);
                setCopied(true);
                setCopyError(false);
                setTimeout(() => setCopied(false), 1800);
              } catch {
                setCopyError(true);
              }
            }}
          >
            {copied ? "Copied" : "Copy"}
          </AIControl>
        </div>
      </figcaption>
      <pre tabIndex={0} aria-labelledby={id} data-wrap={wrap} data-numbers={numbers}>
        <code>
          {lines.map((line, index) => (
            <span
              key={index}
              className="prime-code-line"
              data-highlighted={highlightedLines.includes(index + 1)}
            >
              {numbers && (
                <span className="prime-code-number" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
              )}
              <span className="prime-code-line-content">
                {line.map((token, i) => (
                  <span key={i} className={token.classes.join(" ") || undefined}>
                    {token.text}
                  </span>
                ))}
              </span>
            </span>
          ))}
        </code>
      </pre>
      {long && (
        <div className="prime-code-footer">
          <span>{lines.length} lines</span>
          <AIControl
            iconOnly
            icon={UnfoldMoreIcon}
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
          >
            {expanded ? "Compact view" : "Show full code"}
          </AIControl>
        </div>
      )}
      <span className="sr-only" role="status">
        {copied
          ? "Code copied."
          : copyError
            ? "Copy failed. Select the code to copy it."
            : ""}
      </span>
    </figure>
  );
});
