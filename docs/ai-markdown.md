# PRIME Technical Manuscript

The panel and `/ai` share one rendering subsystem under `features/ai/markdown/`. It extends the existing react-markdown/GFM and Highlight.js setup. There is one Markdown engine and one highlighter; Shiki/Prism, raw HTML, Mermaid, math rendering and export were not added.

## Pipeline and components

`react-markdown` with `remark-gfm` parses Markdown into controlled React components. Stable component mappings render headings, paragraphs, nested/read-only task lists, inline code, quotes, dividers, links, Code Frames and Data Strip tables. Formatting errors fall back to the original escaped text.

Paragraphs use Geist Sans at 15px in narrow containers and 16px in wide containers, with a controlled 1.72 reading rhythm and a roughly 74-character maximum measure. Headings are restrained (23–27px H1, 19–21px H2, 17–18px H3). Code/complexity/metadata use Geist Mono. Headings receive deterministic sanitized text suffixes and unique React IDs. User text remains selectable; short answers are not forced into a template.

The wrapper is an inline-size CSS container named `prime-manuscript`. Typography, code toolbars and tables adapt to the actual container width, including a 400px panel on a large monitor. The same components serve mobile, panel, tablet and desktop.

## Code Frame and syntax colors

Fenced blocks use a black frame with a compact language selector and icon-only Wrap/Copy controls. Multiline snippets can show non-selectable/assistive-hidden line numbers. Copy writes the exact source, preserving indentation and Unicode and excluding gutter/token markup. Feedback uses a check icon plus a restrained live status. Long blocks announce the line count and offer an expansion control; lines are not silently removed.

Highlight.js is reused through Lowlight's AST API. Source is rendered as React text/spans, not trusted model HTML. Grammars are loaded lazily only when a completed code block needs them. Supported languages are Java, TypeScript/TSX, JavaScript/JSX, Python, SQL, Bash, JSON, HTML/XML, CSS, C/C++, Markdown, YAML and diff, plus safe plain text. Common aliases normalize consistently.

The final user request enables readable syntax colors within the black Code Frame: lavender keywords, blue types/built-ins, warm function names, green strings, orange numbers, neutral comments and restrained diff colors. The surrounding application remains PRIME black/white/red. Unknown languages fall back safely. Code-like TEXT can use bounded auto detection across seven registered grammars; ordinary prose/ASCII diagrams remain text. A language selector always lets the reader correct the choice, including explicitly choosing TEXT.

Completed source/language pairs use a bounded forty-entry highlight cache. A memoized Code Frame keeps its DOM stable while later prose streams. Incomplete fences render lightweight source with a Generating indicator and finalize when closed. Code allows horizontal scrolling or optional wrap, with a reachable toolbar and independently scrolling long content. Structured callers may provide a filename and highlighted line numbers; comments are not guessed into filenames.

## Data Strip tables

GFM tables retain `table/thead/tbody/th/td` semantics with column-header associations. The header uses black, small mono labels and restrained rules. Rows have efficient readable padding, ordinary cells wrap, and code/complexity cells stay compact.

Narrow containers retain columns in a dedicated keyboard-focusable horizontal viewport. Measured left/right fades indicate overflow and disappear at the edge. Overscroll is contained horizontally while normal vertical reading remains available. Tables do not force page overflow. Automatic stacked-record transformation, sticky first columns and fullscreen table controls were evaluated but omitted to preserve comparisons and avoid clutter.

## Streaming and structured content

Visible Markdown updates are batched at 50ms during streaming; completed responses use the final source immediately. A small fence-boundary detector identifies unfinished code; remark remains the actual Markdown parser. The highlighter does not process the entire accumulated answer per token. Completed code stays memoized and cached.

Auto-follow stops when the reader scrolls up. Resize observation follows changes only while already following, including delayed highlighting/table layout. An icon-only Continue to latest control resumes the conversation scroll without moving the whole document. The composer has its own flex allocation, safe-area support and visual-viewport sizing; it does not overlay the final message lines.

Actual hint turns carry trusted persisted hint-level metadata and render a Hint Trace with a next-hint action. Typed, Zod-validated algorithm, complexity, correction and callout components are available to structured message parts. Their fixtures are in the workbench; ordinary Markdown is not heuristically converted into those structures. Tool status, canonical references and write confirmation remain separate React UI. Internal Markdown links are enabled only when matched by a validated application reference.

Response actions are icon-only. Narrow message containers keep Copy/Save and put secondary feedback/retry actions in a More menu. Visible controls have accessible names, hover titles, keyboard focus and comfortable hit areas. Copy remains available without horizontally scrolling code.

## Mobile and accessibility

The supported reading matrix includes 320px emergency width, 360/375/390/412/430px phones, 768/1024px tablets and 1280/1440/1920px desktops. Narrow layouts reduce indentation and optional metadata before reducing content width. Code uses 12.5px in narrow containers and 13px in wide containers. The workspace and modal panel follow the visual viewport; short/landscape views compact header/context/composer space. Select labels remain single-line and shrink/truncate inside their available width.

Screen readers receive language labels, table regions/headers, meaningful icon names and limited status announcements rather than every token. Checklists in AI output are read-only and do not imply task mutations. Focus outlines, native selection, reduced motion and forced-color overrides are preserved. No paragraph entrance animations or flashing cursor animation is used.

## Workbench, performance and tests

Development-only `/design-system/ai-markdown` appears as AI / Markdown in the existing workbench. It contains typography, nested lists, quotes, two/five-column tables, realistic Java/generics, TSX, SQL, other languages, long/broken content, streaming and structured components. Width presets include 360/400/440/800px. The route returns not found in production; no fixture answer is injected into live chat.

Markdown and code UI are lazy-loaded behind AI usage; highlighting is a further dynamic boundary. The old whole-response rehype-highlight stage was removed. No new highlighter engine, worker service, virtualization framework or renderer was introduced. History and message sizes remain bounded. Physical-device battery/keyboard measurements and a Lighthouse score are not claimed.

Verified on November 3, 2026:

- `pnpm test`: 361 tests passed in 33 files, including the migration lifecycle, rendering boundaries and technical manuscript tests.
- `pnpm typecheck`: passed. The production build also completed its TypeScript check after the final opener-readiness change.
- Focused AI/server/renderer/test ESLint: passed; the final opener/browser edits also passed lint.
- Playwright: all fifteen checks passed across Chromium, Firefox and WebKit. The matrix covers 320–1920px widths, short/landscape composition, panel/workspace continuity, confirmed note writes, cancellation, code copy, tables, and the actual computed keyword color.
- Production `pnpm build` with isolated `PRIME_AI_QA=1` output: passed using Turbopack. Mobile and 400px-container screenshots were visually inspected.
- All 79 emitted client JS/CSS assets were scanned for the configured Groq and Supabase service credentials; neither credential was present.

The two emitted JavaScript chunks identified by code-frame/highlighter markers measured 158,799 bytes (48,299 gzip) and 83,375 bytes (26,246 gzip). These are artifact sizes, not an incremental bundle comparison or a Lighthouse score. The highlighter remains a dynamic import; no whole-response highlighting transform runs per token.

Repository-wide lint still reports three existing `no-explicit-any` errors in reminder dispatch, the revision mailer and the problem-intelligence browser test, plus one unused-parameter warning in reminder dispatch. These are outside the AI changes. Live synthetic Groq streaming/tool checks passed, and the deployed Supabase lifecycle was checked in a rolled-back transaction. Logs and browser artifacts are in ignored `.generated/ai/`.
