import { createLowlight } from "lowlight";
import java from "highlight.js/lib/languages/java";
import typescript from "highlight.js/lib/languages/typescript";
import javascript from "highlight.js/lib/languages/javascript";
import python from "highlight.js/lib/languages/python";
import sql from "highlight.js/lib/languages/sql";
import bash from "highlight.js/lib/languages/bash";
import json from "highlight.js/lib/languages/json";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import cpp from "highlight.js/lib/languages/cpp";
import c from "highlight.js/lib/languages/c";
import markdown from "highlight.js/lib/languages/markdown";
import yaml from "highlight.js/lib/languages/yaml";
import diff from "highlight.js/lib/languages/diff";
import { normalizeLanguage } from "./utils";
export interface CodeToken {
  text: string;
  classes: string[];
}
export type CodeLines = CodeToken[][];
const highlighter = createLowlight({
  java,
  typescript,
  javascript,
  python,
  sql,
  bash,
  json,
  xml,
  css,
  cpp,
  c,
  markdown,
  yaml,
  diff,
});
const cache = new Map<string, CodeLines>();
export function highlightCode(source: string, language: string): CodeLines {
  const lang = normalizeLanguage(language),
    key = lang + "\0" + source;
  const cached = cache.get(key);
  if (cached) return cached;
  const lines: CodeLines = [[]];
  type Node = {
    type: string;
    value?: string;
    properties?: { className?: unknown };
    children?: Node[];
  };
  function walk(node: Node, classes: string[] = []) {
    if (node.type === "text") {
      const split = (node.value ?? "").split("\n");
      split.forEach((text, index) => {
        if (index) lines.push([]);
        if (text) lines.at(-1)!.push({ text, classes });
      });
    } else {
      const own = Array.isArray(node.properties?.className)
        ? node.properties!.className.filter(
            (v): v is string => typeof v === "string" && /^[\w-]+$/.test(v)
          )
        : [];
      for (const child of node.children ?? []) walk(child, [...classes, ...own]);
    }
  }
  try {
    if (lang === "text") walk({ type: "text", value: source });
    else if (lang === "auto")
      walk(
        highlighter.highlightAuto(source, {
          subset: ["java", "javascript", "typescript", "python", "cpp", "sql", "bash"],
        }) as Node
      );
    else walk(highlighter.highlight(lang, source) as Node);
  } catch {
    walk({ type: "text", value: source });
  }
  if (cache.size >= 40) cache.delete(cache.keys().next().value!);
  cache.set(key, lines);
  return lines;
}
