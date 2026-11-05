# PRIME Algorithm Lab

Algorithm Lab is a visual learning layer between a PRIME Core topic and a recorded DSA attempt. It teaches state changes, invariants, code and decisions. Watching an animation or answering a prediction does not complete a revision, satisfy a curriculum requirement or create Mastery evidence.

The reference research was completed before implementation in [algorithm-lab-reference-analysis.md](algorithm-lab-reference-analysis.md). VisuAlgo informed interaction principles only. All shipped generators, explanations, questions, source examples, geometry and components are independently authored for PRIME.

## Routes and first-release scope

`/lab` is a locally searchable editorial catalog. `/lab/[algorithmSlug]` is one registry-driven workbench, with `?mode=watch`, `?mode=step` or `?mode=practice`. Unknown slugs return not found. The routes reuse the protected dashboard shell. Practice navigation, mobile More and command search expose Algorithm Lab.

Twelve supported modules:

| Group           | Modules                      | Scope                                                                        |
| --------------- | ---------------------------- | ---------------------------------------------------------------------------- |
| Search          | Linear Search, Binary Search | First scan match; any binary match in sorted input                           |
| Sorting         | Bubble Sort                  | Stable adjacent swaps, settled suffix, early stopping                        |
| Patterns        | Two Pointers, Sliding Window | Sorted pair sum; fixed-size maximum-sum window                               |
| Data Structures | Stack, Queue, Linked List    | Custom operation sequences; linked traversal/search/indexed insert/delete    |
| Trees           | Tree DFS, Tree BFS           | Pre/in/postorder; level order; sparse heap-position input                    |
| Graphs          | BFS, DFS                     | Directed/undirected reachability, cycles, self-loops, ascending neighbor IDs |

The first release deliberately prioritizes the requested minimum set and its reusable engine. Selection/insertion/merge sort, prefix sums, BST operations, Dijkstra, Union Find, recursion/DP scenes, advanced graph editing and side-by-side comparison are not advertised as functional. They can be authored against the same contracts. There is no arbitrary JavaScript/Java execution, cloud worker or course-authoring platform.

## Architecture

`features/algorithm-lab/registry/metadata.ts` is a lightweight catalog and topic mapping, with no algorithm execution imports. `registry/registry.ts` dynamically loads only the requested algorithm family. Definitions live in `algorithms/arrays.ts`, `sequences.ts` and `networks.ts`; they contain pure execution logic, never React or DOM access. The common definition factory connects validation, source lines and trace generation.

`engine/types.ts` defines a versioned serializable trace, steps, scenes, variables, metrics, predictions and source definitions. `engine/trace.ts` clones and recursively freezes each emitted snapshot. A step has:

- Stable identity and ordinal.
- Operation, title, deterministic explanation and stable source-line ID.
- Complete scene data plus variables and observed counters.
- Optional deterministic prediction about an upcoming transition.

Renderers consume scene data only. They never decide a comparison, reorder the source array or mutate graph traversal. Previous and seek render a stored snapshot immediately. The original input and result are part of the immutable trace. Runtime authoring validation in development checks step identity, active indices, graph references, code IDs, prediction answers and JSON-safe values. Production retains schema and trace-size guards.

`engine/playback.ts` owns the shared playback reducer. State includes index, idle/playing/paused/completed status, mode and speed. A single timeout advances Watch at a centralized 1,100ms base duration, with 0.5×/1×/1.5×/2× choices. It stops at the final snapshot, pauses when the document becomes hidden, and cleans up timers. Step mode never starts an automatic clock. Applying input resets playback and local practice state after validation succeeds.

## Input and limits

Custom input uses simple value/target/window fields, a tree-order Select, edge-list fields and one-operation-per-line editing. Advanced JSON is available as an explicit option. Both paths produce the same bounded data parsed with Zod; neither executes code. The bottom Sheet is also the mobile input drawer. It offers the module example, supported edge-case presets, a reset, and seeded array examples. Binary Search and Two Pointers reject unsorted values. The explicit **Sort values** command updates the visible draft; it never silently changes execution input.

| Input                  | Bound                                                                  |
| ---------------------- | ---------------------------------------------------------------------- |
| Numerical arrays       | 1–32 integer values, each −999…999                                     |
| Operation sequences    | 1–32 allowed structure-specific operations                             |
| Binary tree            | Up to 15 nodes in 31 heap-position slots; null marks an absent subtree |
| Graph                  | 1–12 nodes, up to 28 unique edges; endpoints/source must exist         |
| Serialized editor data | 12,000 characters                                                      |
| Generated trace        | 2,000 snapshots maximum                                                |

Tree slot i has children 2i+1 and 2i+2. A populated slot cannot have a null parent. Graph adjacency is sorted by numeric node ID; disconnected components remain unvisited unless reached from the chosen source. Undirected duplicate reverse edges are rejected. Stack/queue empty reads or removals return null in the teaching model. Linked-list indexed updates validate the index against the current list after earlier operations.

## Rendering and synchronized code

The shared Scene Renderer dispatches to array, sequence or SVG network families. Array cells support indices, pointers, active comparisons, window ranges, eliminated candidates, settled values and matches. Stack/queue/list scenes share stable cell identity; the linked-list view renders SVG next links and a null terminator. Network scenes share deterministic node/edge geometry and structural state for current, frontier, visited and active edge.

SVG graph/tree controls provide bounded zoom, opt-in pan and fit/reset. Panning captures a pointer only when enabled; normal touch gestures continue to scroll the page. Node buttons, selected-node details and a textual adjacency view offer keyboard and touch alternatives. Optional per-edge integer weights are rendered as annotations and included in the text view. BFS/DFS order ignores weights and explicitly makes no weighted shortest-path claim. No Canvas, WebGL, physics layout or third-party graph engine was added.

The State Trace pairs the visual with a readable title, reason, variable inspector and input-specific metrics. The invariant and complexity panels explain why the method works; observed counts are labeled separately from asymptotic complexity. Complexity describes the underlying Java algorithm, excluding the visualization's snapshot/copy costs. ArrayDeque insertion is labeled amortized O(1), including its occasional resize cost. Variable formatting handles arrays, records and null without `[object Object]`.

Java and pseudocode contain matching stable line IDs. Steps refer to those IDs; the UI maps them to current line positions. The shared Technical Manuscript Code Frame supplies syntax colors, wrap, raw-source copy, line numbers and highlighted active lines. It is loaded only when code is visible. There is no competing code renderer. A visible active-line summary remains available even when the full source needs horizontal scrolling.

Guided Learning reveals the module objectives, learning order and invariant around the same execution. It is intentionally a small teaching layer, not an authored course platform.

## Prediction practice

Predictions are authored with the generator and evaluated by `engine/practice.ts`. The learner sees the pre-transition state and options. Next and keyboard advancing are blocked until a correct answer or explicit reveal. Incorrect responses give a hint and allow retry. Revealing shows the deterministic answer explanation without counting as correct. Practice disables timeline seeking; Previous can revisit earlier snapshots. Restart, mode changes and new input reset the session.

The session tracks answered decisions, correct decisions, incorrect attempts, retries and reveals. Results stay in React state. No database table, viewing history, analytics write, revision completion or Mastery update is created.

## PRIME and AI integration

`labsForTopics()` maps existing topic and Core-stage slugs to supported algorithms. The shared read-only learning link appears on supported Roadmap stages, DSA problem pages and revision rows. Hard/forgotten reviews can suggest rebuilding the pattern visually. The problem page remains responsible for recording an attempt, and revision actions remain explicit. A pattern is visualized once through the registry; there is no custom visualizer per LeetCode problem. The standalone Mastery/Progress destination is not implemented elsewhere in this repository; Lab does not invent one.

The **Ask PRIME about this step** action pauses playback, attaches a snapshot and opens the existing AI panel. The panel offers step/invariant/beginner/Java/complexity explanations and quiz/prediction prompts. It uses the existing Groq transport, conversation persistence, history and confirmation controls. An in-flight conversation cannot be replaced by the Lab entry action.

The attachment contains only algorithm slug, mode, bounded JSON input and zero-based step index. `ai/context.ts` validates the algorithm and input and regenerates the trace on the trusted server. It derives scene, variables, operation, active Java line, invariant and complexity from that trace. Browser-provided state, code, explanations or predicted answers are rejected. The context is an explicitly labeled attached snapshot, not a live claim that chat follows every subsequent step. AI explains; it never selects a canonical next step or changes progress. The Lab runs fully when AI is disabled or unavailable. Existing authenticated AI endpoints and account isolation remain in force. No Supabase migration is required.

## Accessibility and responsive behavior

The workspace uses a large visual plus inspector at sufficient container width; narrow containers stack them. It never squeezes three equal columns into a laptop layout. Code is collapsible and defaults closed on narrow screens. The input Sheet and compact controls fit phone widths. Arrays have independently keyboard-scrollable viewports; neither code nor graph content should cause page overflow. Playback stays sticky near the top, clear of the app's bottom navigation. Focus view expands within the application without a browser fullscreen API.

Every step exposes a restrained screen-reader summary and readable variables. Pointer names, outlines, check marks, text and line patterns supplement color. Graph nodes have accessible names, keyboard activation and an alternate set of 44px inspection controls. Focus is visible; modal sheets restore the triggering control. Keyboard shortcuts are scoped to a focused workbench: Space, Left/Right and R. They do not intercept inputs, buttons, tabs, links, comboboxes or editable content. Motion transitions are disabled with reduced-motion preferences; execution order and learning behavior remain the same.

## Authoring another algorithm

For a future `/lab/topological-sort`:

1. Add lightweight metadata and aliases, using existing PRIME topic slugs.
2. Define a bounded schema in the input layer, or reuse the graph schema with appropriate cycle validation.
3. Author a pure generator with the shared builder. Every emitted scene must be complete, deterministic and JSON safe.
4. Reuse the network renderer; add a scene capability only if the algorithm needs a reusable structural feature.
5. Write original Java and pseudocode with matching stable line IDs.
6. Explain decisions, invariants and complexity; add observed counts where useful.
7. Attach deterministic prediction metadata to pre-transition steps.
8. Test results, intermediate state, invalid inputs, code references, bounds and determinism.
9. Add one lazy registry loader and a catalog entry.

The routing, workspace, timeline, input drawer, playback and AI boundary do not need per-algorithm rewrites. A future comparison controller can drive two independent traces from a shared clock without altering either generator.

## Workbench and verification

Development-only `/design-system/algorithm-lab` exposes the live families, playback, pointers, State Trace, inspector, practice and code-sync components. It returns not found in production. Development trace inspection is hidden from production users. Visualization error boundaries offer a reset without changing PRIME progress.

Verified November 3, 2026:

- Repository suite: **440 tests passed in 37 files**, using `pnpm test --maxWorkers=4`. The existing reminder cron unit test was isolated from live HTTP and now asserts its dispatch URL/method/authorization; production worker behavior was not changed.
- Lab engine, schemas and input forms: **66 tests passed**. A final Lab/AI authority and orchestration run passed **91 tests**. Cases cover deterministic snapshots, immutable history, search edges/duplicates, intermediate swaps, negative window sums, LIFO/FIFO, indexed relinking, traversal orders, cycles, weighted annotations, invalid inputs, prototype-named module rejection and trusted AI snapshot reconstruction.
- Browser matrix: **15 checks passed** across Chromium/Firefox/WebKit at 360/390/430/768/1024/1440/1920px. Six additional focused runs verified the final simple-input and advanced-JSON flows; three final runs checked weighted self-loops remain within the SVG. There are six distinct test flows across three engines; focused reruns are not additional unique flows. Keyboard, playback, timeline/speed, source sync, practice gates/retries, graph pan/zoom/inspection, responsive containment and AI focus/context are covered.
- Production `pnpm build` with `PRIME_LAB_QA=1`: **passed**, including its full TypeScript check and generation of 103 pages. The Lab routes have registry-generated parameters, a scoped Suspense boundary, loading state and an error boundary.
- Focused Lab/integration ESLint and the isolated Lab TypeScript check: **passed**. Repository-wide lint still reports unrelated issues: an unescaped apostrophe in Calendar's error page; explicit `any` in reminder dispatch, the revision mailer and the problem-intelligence browser test; unused variables in reminder dispatch and the shared browser fixture backend. No lint suppression or build-type bypass was added.
- Desktop, phone, code and input screenshots were visually inspected. The emitted **112 client assets** were scanned for the configured Groq and Supabase service credentials; neither credential was present.

Synthetic production-mode generation measurements on this machine showed default-input p95 times up to **6.2ms** across the twelve modules. The maximum reverse-sorted 32-value Bubble Sort input produced **1,025 snapshots**, approximately **1.50MB serialized**, in roughly **113ms including serialization measurement**. Stepping renders only the current bounded scene. These are local observations, not physical-phone or 60fps guarantees.

Marker-identified production artifacts keep catalog metadata separate from execution generators: the catalog chunk measured **9,756 bytes / 3,740 gzip** and contained none of the array/sequence/network generator markers. Lazy algorithm-family chunks measured roughly **5.5–6.9KB gzip** each. Shared dependencies/runtime assets are additional; this is not an incremental bundle comparison or Lighthouse score. No performance claim is made from development navigation timings.

Run `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build` and `pnpm test:e2e:lab` for normal project verification. Browser tests use a dedicated fixture backend and `.next-lab-qa` output; they do not change real user progress or spend provider quota. Local logs, traces, benchmark data and client-asset audit results are in ignored `.generated/lab/`.
