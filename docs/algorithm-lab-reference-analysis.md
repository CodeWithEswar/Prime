# Algorithm Lab: reference analysis and implementation plan

Research completed November 3, 2026, before implementation. VisuAlgo is an interaction reference; PRIME will contain independent trace generators, explanations, questions, geometry and UI. No reference source, styles, assets, questions or educational passages are copied or rehosted.

## Observations

[VisuAlgo's overview](https://visualgo.net/en) organizes 24 visualization modules with searchable tags. It describes custom inputs, graph drawing, paired-window comparison and per-module training. These concepts suggest discoverable, reusable learning environments rather than one visualization per interview problem.

The [sorting interface](https://visualgo.net/en/sorting) exposes input presets/custom values, backward/forward frames, speed, status and code panels. Its lecture/exploration distinction gives a learner both instruction and experimentation. PRIME adopts reversible navigation and explicit custom input, but uses a single state-driven workbench with Watch, Step and Practice. Every state is a reproducible snapshot, never an inverse DOM animation.

[Graph traversal](https://visualgo.net/en/dfsbfs) separates drawing, structured graph input and examples. It also groups advanced traversal-derived algorithms. PRIME begins with bounded structured edge input and examples for BFS/DFS. Numeric node ordering is explicit. A shared SVG network renderer supports deterministic tree/graph layouts, labeled frontier and visited state, pan/zoom and a text alternative. Advanced graph algorithms can arrive through the registry without complicating the initial editor.

[BST](https://visualgo.net/en/bst) demonstrates why structural operations need stable geometry and accompanying state. PRIME initially teaches traversal with current node, visited order and queue/call stack. It does not need a balancing-tree implementation to validate the renderer contract.

[Recursion](https://visualgo.net/en/recursion) distinguishes repeated call trees from shared-subproblem DAGs. PRIME's contract allows additional scene families later. Arbitrary user code execution is excluded; bounded predefined generators will be required for future recursion/DP modules.

[Training](https://visualgo.net/training?diff=Medium&module=sorting&n=7&tl=0) offers module/difficulty/question-count/time choices and generated assessment. PRIME instead starts with deterministic prediction attached to the exact pending transition: decide first, inspect the result second. Session counts remain separate from canonical Mastery and revision evidence.

## PRIME audit and decisions

The repository already has a dashboard Command Frame, navigation registry, Radix-based Select/Tabs/Sheet primitives, Hugeicons, Motion, PRIME Core stages, dedicated DSA problem pages, revision queues and a shared Groq AI panel. Technical Manuscript already supplies syntax-colored code, source copy/wrap and highlighted line metadata. Reuse these boundaries; no second shell, chat, code frame or database progress system.

The Lab catalog uses interview-learning groups: Search, Sorting, Patterns, Data Structures, Trees and Graphs. Lightweight metadata is separate from lazy algorithm implementations. Topic/stage identifiers feed a central mapping for learning links; no new problem taxonomy is stored.

Initial release: linear/binary search, bubble sort, sorted pair-sum two pointers, fixed-size maximum-sum sliding window, stack, queue, linked-list operations, tree DFS (pre/in/postorder), tree BFS, graph BFS and graph DFS. The shared engine, not algorithm-specific React components, owns playback. Additional sorting/DP/shortest-path modules are deferred explicitly rather than advertised as functional.

## Architecture

Pure, bounded TypeScript generators produce immutable JSON snapshots, stable step IDs, variables, operation counts, explanations, code-line IDs and prediction metadata. Renderers consume only scene data. A shared reducer owns step, status, speed and mode; a single timer advances snapshots. Seek/previous are immediate. Practice blocks access to the pending state until an answer/reveal; answer evaluation does not call AI.

The workbench pairs a large visualization with an execution inspector at sufficient container width, then stacks on mobile. Code and input use collapsible/sheet surfaces. Container queries account for the sidebar and AI panel. Compact controls have labels or accessible icon names. Array indices, pointers, ranges, node labels, outlines and text summaries communicate state without relying on color. Reduced motion changes transitions, not results. Focus mode expands the learning workspace without a browser fullscreen requirement.

PRIME AI receives a bounded algorithm reference, input, mode and step. The trusted server validates and regenerates the canonical trace before explaining that step. AI never computes or mutates execution state. Lab remains fully functional when AI is disabled or unavailable. No new Supabase tables, viewing history or Mastery writes are needed.

## Improvements and boundaries

Adopt custom input, reversible playback, synchronized code, guided explanations and active prediction. Improve mobile geometry, code-line stability, keyboard behavior and explicit invariants. Avoid reference layouts, copied text/questions, arbitrary executable code, rainbow state palettes, giant catalogs of unavailable modules and automatic learning-progress claims. Comparison, advanced graph editors, recursion/DP families and persisted assessment require later validated additions.
