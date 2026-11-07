"use client";

import {
  Component,
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type ComponentPropsWithoutRef,
} from "react";
import Markdown, { type Components, type ExtraProps } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

import { RichContentProvider, useRichContent, type RichContentMode } from "./rich-content-provider";
import { RichHeading } from "./typography/rich-heading";
import { RichParagraph } from "./typography/rich-paragraph";
import { RichLink } from "./typography/rich-link";
import { RichInlineCode } from "./typography/rich-inline-code";
import { RichQuote } from "./typography/rich-quote";
import { RichListUl, RichListOl, RichListLi, RichTaskCheckbox } from "./typography/rich-list";
import { RichTable } from "./tables/rich-table";
import { RichCodeBlock } from "./code/rich-code-block";
import { extractText, openFenceOffset, safeAILink } from "@/features/ai/markdown/utils";
import "./rich-content-theme.css";
import "@/features/ai/markdown/typography.css";

export interface RichContentRendererProps {
  content: string;
  streaming?: boolean;
  references?: { href: string; title?: string }[];
  mode?: RichContentMode;
  className?: string;
}

/**
 * Pre component wrapper that extracts code block metadata and delegates to RichCodeBlock.
 */
function CodeBlockPre({ children, node }: ComponentPropsWithoutRef<"pre"> & ExtraProps) {
  const { streaming, openFence } = useRichContent();
  const child = Array.isArray(children) ? children[0] : children;
  const props =
    child && typeof child === "object" && "props" in child
      ? (child.props as { className?: string; children?: ReactNode })
      : {};

  // Extract language from className (e.g. language-java or language-typescript:filename.ts)
  const fullLang = props.className?.match(/language-([^\s]+)/)?.[1] ?? "text";
  const [language, filename] = fullLang.includes(":") ? fullLang.split(":") : [fullLang, undefined];

  const source = extractText(props.children ?? children).replace(/\n$/, "");
  const offset = node?.position?.start.offset;
  const generating =
    streaming &&
    openFence !== null &&
    (offset === undefined || offset >= openFence);

  return (
    <RichCodeBlock
      source={source}
      language={language}
      generating={generating}
      filename={filename}
    />
  );
}

const richComponents: Components = {
  h1: ({ children }) => <RichHeading level={1}>{children}</RichHeading>,
  h2: ({ children }) => <RichHeading level={2}>{children}</RichHeading>,
  h3: ({ children }) => <RichHeading level={3}>{children}</RichHeading>,
  h4: ({ children }) => <RichHeading level={4}>{children}</RichHeading>,
  h5: ({ children }) => <RichHeading level={5}>{children}</RichHeading>,
  h6: ({ children }) => <RichHeading level={6}>{children}</RichHeading>,
  p: ({ children }) => <RichParagraph>{children}</RichParagraph>,
  ul: ({ children, className }) => <RichListUl className={className}>{children}</RichListUl>,
  ol: ({ children, start }) => <RichListOl start={start}>{children}</RichListOl>,
  li: ({ children }) => <RichListLi>{children}</RichListLi>,
  blockquote: ({ children }) => <RichQuote>{children}</RichQuote>,
  hr: () => <hr className="my-6 border-white/[0.08]" />,
  code: ({ children, className }) => <RichInlineCode className={className}>{children}</RichInlineCode>,
  pre: CodeBlockPre,
  table: ({ children }) => <RichTable>{children}</RichTable>,
  a: ({ href, children }) => <RichLink href={href}>{children}</RichLink>,
  img: () => null, // Security rule: strip model-injected image tags
  input: ({ checked }) => <RichTaskCheckbox checked={checked} />,
};

export class FormattingBoundary extends Component<
  { content: string; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidUpdate(previous: { content: string }) {
    if (this.state.failed && previous.content !== this.props.content) {
      this.setState({ failed: false });
    }
  }

  render() {
    return this.state.failed ? (
      <div className="prime-format-fallback p-4 rounded-xl border border-red-500/20 bg-red-950/10 text-xs font-mono text-neutral-300">
        <p role="status" className="text-red-400 font-bold mb-2">
          Formatting is unavailable. Showing the original response.
        </p>
        <pre className="overflow-x-auto whitespace-pre-wrap">{this.props.content}</pre>
      </div>
    ) : (
      this.props.children
    );
  }
}

function useStreamSource(content: string, streaming: boolean) {
  const [visible, setVisible] = useState(content);
  const latest = useRef(content);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    latest.current = content;
    if (streaming && !timer.current) {
      timer.current = setTimeout(() => {
        timer.current = null;
        setVisible(latest.current);
      }, 50);
    }
  }, [content, streaming]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  return streaming ? visible : content;
}

export function RichContentRenderer({
  content,
  streaming = false,
  references = [],
  mode = "auto",
  className,
}: RichContentRendererProps) {
  const source = useStreamSource(content, streaming);
  const fenceOffset = streaming ? openFenceOffset(source) : null;

  return (
    <FormattingBoundary content={content}>
      <RichContentProvider
        mode={mode}
        streaming={streaming}
        references={references}
        openFence={fenceOffset}
      >
        <div
          className={`prime-rich-content ai-prose prime-manuscript ${className ?? ""}`}
          data-streaming={streaming}
          data-mode={mode}
        >
          <Markdown
            skipHtml
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            urlTransform={safeAILink}
            components={richComponents}
          >
            {source}
          </Markdown>
          {streaming && <span className="prime-stream-terminal" aria-hidden="true" />}
        </div>
      </RichContentProvider>
    </FormattingBoundary>
  );
}

export default memo(
  RichContentRenderer,
  (a, b) =>
    a.content === b.content &&
    a.streaming === b.streaming &&
    a.mode === b.mode &&
    JSON.stringify(a.references ?? []) === JSON.stringify(b.references ?? [])
);

