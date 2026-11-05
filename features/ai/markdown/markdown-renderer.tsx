"use client";
import {
  Component,
  createContext,
  createElement,
  memo,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type ComponentPropsWithoutRef,
} from "react";
import Markdown, { type Components, type ExtraProps } from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeFrame } from "./code-frame";
import { PrimeTable } from "./prime-table";
import { extractText, headingSlug, openFenceOffset, safeAILink } from "./utils";
import "./typography.css";
interface RendererProps {
  content: string;
  streaming?: boolean;
  references?: { href: string; title?: string }[];
}
const RenderContext = createContext({
  streaming: false,
  openFence: null as number | null,
  references: new Set<string>(),
});
function CodePre({ children, node }: ComponentPropsWithoutRef<"pre"> & ExtraProps) {
  const ctx = useContext(RenderContext);
  const child = Array.isArray(children) ? children[0] : children;
  const props =
    child && typeof child === "object" && "props" in child
      ? (child.props as { className?: string; children?: ReactNode })
      : {};
  const language = props.className?.match(/language-([^\s]+)/)?.[1] ?? "text",
    source = extractText(props.children ?? children).replace(/\n$/, "");
  const offset = node?.position?.start.offset;
  const generating =
    ctx.streaming &&
    ctx.openFence !== null &&
    (offset === undefined || offset >= ctx.openFence);
  return <CodeFrame source={source} language={language} generating={generating} />;
}
function Heading({ level, children }: { level: number; children: ReactNode }) {
  const id = useId().replace(/:/g, "");
  return createElement(
    `h${level}`,
    {
      className: `prime-md-heading prime-md-h${level}`,
      id: `${id}-${headingSlug(extractText(children))}`,
    },
    children
  );
}
function MarkdownLink({ href, children }: ComponentPropsWithoutRef<"a">) {
  const ctx = useContext(RenderContext);
  if (!href || (href.startsWith("/") && !ctx.references.has(href)))
    return <span>{children}</span>;
  return (
    <a
      className={href.startsWith("/") ? "prime-entity-link" : "prime-external-link"}
      href={href}
      target={href.startsWith("https:") ? "_blank" : undefined}
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}
const components: Components = {
  h1: ({ children }) => <Heading level={1}>{children}</Heading>,
  h2: ({ children }) => <Heading level={2}>{children}</Heading>,
  h3: ({ children }) => <Heading level={3}>{children}</Heading>,
  h4: ({ children }) => <Heading level={4}>{children}</Heading>,
  h5: ({ children }) => <Heading level={5}>{children}</Heading>,
  h6: ({ children }) => <Heading level={6}>{children}</Heading>,
  p: ({ children }) => <p className="prime-md-paragraph">{children}</p>,
  ul: ({ children, className }) => (
    <ul
      className={`prime-md-list ${className?.includes("contains-task-list") ? "prime-md-task-list" : ""}`}
    >
      {children}
    </ul>
  ),
  ol: ({ children, start }) => (
    <ol className="prime-md-list" start={start}>
      {children}
    </ol>
  ),
  li: ({ children }) => <li>{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="prime-md-quote">{children}</blockquote>
  ),
  hr: () => <hr className="prime-md-divider" />,
  code: ({ children, className }) => (
    <code className={className ?? "prime-inline-code"}>{children}</code>
  ),
  pre: CodePre,
  table: PrimeTable,
  th: ({ children, style }) => (
    <th scope="col" style={{ textAlign: style?.textAlign }}>
      {children}
    </th>
  ),
  a: MarkdownLink,
  img: () => null,
  input: ({ checked }) => (
    <input
      type="checkbox"
      checked={!!checked}
      disabled
      aria-label={checked ? "Completed checklist item" : "Incomplete checklist item"}
    />
  ),
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
    if (this.state.failed && previous.content !== this.props.content)
      this.setState({ failed: false });
  }
  render() {
    return this.state.failed ? (
      <div className="prime-format-fallback">
        <p role="status">Formatting is unavailable. Showing the original response.</p>
        <pre>{this.props.content}</pre>
      </div>
    ) : (
      this.props.children
    );
  }
}
function useStreamSource(content: string, streaming: boolean) {
  const [visible, setVisible] = useState(content),
    latest = useRef(content),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    latest.current = content;
    if (streaming && !timer.current)
      timer.current = setTimeout(() => {
        timer.current = null;
        setVisible(latest.current);
      }, 50);
  }, [content, streaming]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );
  return streaming ? visible : content;
}
function MarkdownRenderer({
  content,
  streaming = false,
  references = [],
}: RendererProps) {
  const source = useStreamSource(content, streaming);
  const ctx = useMemo(
    () => ({
      streaming,
      openFence: streaming ? openFenceOffset(source) : null,
      references: new Set(references.map((r) => safeAILink(r.href)).filter(Boolean)),
    }),
    [streaming, source, references]
  );
  return (
    <FormattingBoundary content={content}>
      <div className="ai-prose prime-manuscript" data-streaming={streaming}>
        <RenderContext.Provider value={ctx}>
          <Markdown
            skipHtml
            remarkPlugins={[remarkGfm]}
            urlTransform={safeAILink}
            components={components}
          >
            {source}
          </Markdown>
        </RenderContext.Provider>
        {streaming && <span className="prime-stream-terminal" aria-hidden="true" />}
      </div>
    </FormattingBoundary>
  );
}
export default memo(
  MarkdownRenderer,
  (a, b) =>
    a.content === b.content &&
    a.streaming === b.streaming &&
    JSON.stringify(a.references ?? []) === JSON.stringify(b.references ?? [])
);
