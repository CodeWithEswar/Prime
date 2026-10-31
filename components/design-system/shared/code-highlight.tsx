"use client";

import * as React from "react";
import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface CodeHighlightProps {
  code: string;
  language?: string;
  className?: string;
  showLineNumbers?: boolean;
}

type TokenType =
  | "comment"
  | "string"
  | "jsx_close_tag"
  | "jsx_open_tag"
  | "jsx_end"
  | "keyword"
  | "boolean"
  | "number"
  | "prop"
  | "type_ident"
  | "operator"
  | "punctuation"
  | "whitespace"
  | "text";

interface Token {
  type: TokenType;
  value: string;
}

// Universal Regex for tokenizing TSX/JSX lines
const JS_TOKEN_REGEX = new RegExp(
  [
    "(\\/\\/.*|\\/\\*[\\s\\S]*?\\*\\/)", // 1: comments
    "(\"(?:[^\"\\\\]|\\\\.)*\"|'(?:[^'\\\\]|\\\\.)*'|`(?:[^`\\\\]|\\\\.)*`)", // 2: strings
    "(<\\/[A-Za-z0-9_.-]+>)", // 3: jsx close tag
    "(<[A-Za-z0-9_.-]+(?=[\\s/>]))", // 4: jsx open tag
    "(\\/?>)", // 5: jsx end
    "\\b(import|export|default|from|const|let|var|function|return|if|else|for|while|switch|case|break|type|interface|extends|implements|as|new|async|await|typeof|instanceof)\\b", // 6: keywords
    "\\b(true|false|null|undefined)\\b", // 7: boolean
    "\\b(\\d+(?:\\.\\d+)?)\\b", // 8: number
    "\\b([a-zA-Z_][a-zA-Z0-9_-]*)(?=\\s*=)", // 9: prop
    "\\b([A-Z][A-Za-z0-9_]*)\\b", // 10: type ident
    "(=>|===|!==|==|!=|<=|>=|\\+=|-=|\\*=|/=|&&|\\|\\||[+\\-*/%&|^!~=<>?])", // 11: operator
    "([{}()[\\].,;:])", // 12: punctuation
  ].join("|"),
  "g"
);

function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // Reset regex state
  JS_TOKEN_REGEX.lastIndex = 0;

  while ((match = JS_TOKEN_REGEX.exec(line)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        type: "text",
        value: line.slice(lastIndex, match.index),
      });
    }

    const [
      ,
      comment,
      str,
      jsxClose,
      jsxOpen,
      jsxEnd,
      keyword,
      bool,
      num,
      prop,
      typeIdent,
      operator,
      punct,
    ] = match;

    if (comment) tokens.push({ type: "comment", value: comment });
    else if (str) tokens.push({ type: "string", value: str });
    else if (jsxClose) tokens.push({ type: "jsx_close_tag", value: jsxClose });
    else if (jsxOpen) tokens.push({ type: "jsx_open_tag", value: jsxOpen });
    else if (jsxEnd) tokens.push({ type: "jsx_end", value: jsxEnd });
    else if (keyword) tokens.push({ type: "keyword", value: keyword });
    else if (bool) tokens.push({ type: "boolean", value: bool });
    else if (num) tokens.push({ type: "number", value: num });
    else if (prop) tokens.push({ type: "prop", value: prop });
    else if (typeIdent) tokens.push({ type: "type_ident", value: typeIdent });
    else if (operator) tokens.push({ type: "operator", value: operator });
    else if (punct) tokens.push({ type: "punctuation", value: punct });
    else tokens.push({ type: "text", value: match[0] });

    lastIndex = JS_TOKEN_REGEX.lastIndex;
  }

  if (lastIndex < line.length) {
    tokens.push({
      type: "text",
      value: line.slice(lastIndex),
    });
  }

  return tokens;
}

const TOKEN_STYLES: Record<TokenType, string> = {
  comment: "text-white/35 italic font-mono",
  string: "text-[#4ade80] font-mono",
  jsx_close_tag: "text-[#ff0000] font-semibold",
  jsx_open_tag: "text-[#ff0000] font-semibold",
  jsx_end: "text-[#ff0000] font-semibold",
  keyword: "text-[#ff0000] font-semibold",
  boolean: "text-[#60a5fa] font-mono",
  number: "text-[#60a5fa] font-mono",
  prop: "text-[#f3f4f6] font-mono font-medium",
  type_ident: "text-white font-bold",
  operator: "text-white/60 font-mono",
  punctuation: "text-white/40 font-mono",
  whitespace: "",
  text: "text-white/90 font-mono",
};

export function CodeHighlight({
  code,
  language = "TSX",
  className,
  showLineNumbers = true,
}: CodeHighlightProps) {
  const [copied, setCopied] = React.useState(false);
  const lines = React.useMemo(() => code.trim().split("\n"), [code]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.08)] bg-[#020202] overflow-hidden text-xs font-mono shadow-elevation-1",
        className
      )}
    >
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-[rgba(255,255,255,0.06)] bg-[#060606]">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[3px] bg-[#000000] border border-[rgba(255,255,255,0.10)] text-[10px] font-mono font-semibold tracking-wider text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-prime-red animate-pulse" />
            {language.toUpperCase()}
          </div>
          <span className="text-[11px] text-white/40 font-mono">
            {lines.length} lines • {code.length} chars
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-xs)] border border-[rgba(255,255,255,0.12)] bg-[#090909] text-[11px] font-mono text-white/70 hover:text-white hover:border-white/25 hover:bg-[#0d0d0d] transition-all cursor-pointer shadow-xs active:scale-[0.98]"
          aria-label="Copy code"
        >
          <Icon
            icon={copied ? Tick02Icon : Copy01Icon}
            size={12}
            className={copied ? "text-prime-red" : "text-white/60"}
          />
          <span>{copied ? "Copied!" : "Copy Code"}</span>
        </button>
      </div>

      {/* Code Body with Syntax Highlighting and Tabular Line Numbers */}
      <div className="overflow-x-auto prime-scrollbar p-3.5">
        <pre className="font-mono text-xs leading-relaxed select-text">
          <code>
            {lines.map((line, idx) => {
              const tokens = tokenizeLine(line);
              return (
                <div
                  key={idx}
                  className="flex items-start group hover:bg-white/[0.03] -mx-3.5 px-3.5 rounded transition-colors"
                >
                  {showLineNumbers && (
                    <span className="select-none inline-block w-8 shrink-0 text-right pr-4 font-mono text-[11px] text-white/20 group-hover:text-white/50 transition-colors font-mono-numbers">
                      {idx + 1}
                    </span>
                  )}
                  <span className="flex-1 min-w-0">
                    {tokens.length === 0
                      ? "\u00A0"
                      : tokens.map((token, tIdx) => (
                          <span
                            key={tIdx}
                            className={TOKEN_STYLES[token.type] || TOKEN_STYLES.text}
                          >
                            {token.value}
                          </span>
                        ))}
                  </span>
                </div>
              );
            })}
          </code>
        </pre>
      </div>
    </div>
  );
}
