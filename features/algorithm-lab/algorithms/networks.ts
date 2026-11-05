import { defineAlgorithm } from "./define";
import { graphInput, treeInput } from "../engine/input";
import { prediction } from "../engine/trace";
import type { NetworkScene } from "../engine/types";
function treeScene(values: (number | null)[]): NetworkScene {
  const nodes = values.flatMap((v, i) => {
    if (v === null) return [];
    const depth = Math.floor(Math.log2(i + 1)),
      position = i - (2 ** depth - 1);
    return [
      {
        id: String(i),
        label: String(v),
        x: 40 + ((position + 0.5) / 2 ** depth) * 600,
        y: 40 + depth * 75,
      },
    ];
  });
  return {
    kind: "network",
    structure: "tree",
    nodes,
    edges: nodes
      .filter((n) => n.id !== "0")
      .map((n) => ({
        id: `${Math.floor((Number(n.id) - 1) / 2)}:${n.id}`,
        source: String(Math.floor((Number(n.id) - 1) / 2)),
        target: n.id,
      })),
    directed: false,
    current: null,
    visited: [],
    frontier: [],
    activeEdge: null,
  };
}
const treeDefault = {
  kind: "tree" as const,
  values: [7, 3, 10, 1, 5, 9, 12],
  order: "preorder" as const,
};
export const treeDFS = defineAlgorithm({
  id: "tree-dfs",
  defaultInput: treeDefault,
  parse: (raw) => treeInput.parse(raw),
  complexity: {
    time: "O(n)",
    space: "O(h)",
    reason:
      "Every node is entered and recorded once. The recursion path has at most the tree's height h frames.",
  },
  invariant:
    "The call stack is the current root-to-node path. Each node is recorded once at the position selected by the traversal order.",
  objectives: [
    "Separate entering a frame from recording a node.",
    "Explain pre/in/postorder using the position of visit relative to the children.",
  ],
  code: [
    ["init", "void dfs(Node node, String order) {", "Enter this node's recursive frame"],
    ["guard", "  if (node == null) return;", "An absent child needs no visit"],
    [
      "pre",
      '  if (order.equals("preorder")) visit(node);',
      "Preorder: record before both children",
    ],
    ["left", "  dfs(node.left, order);", "Recurse into the left subtree"],
    [
      "in",
      '  if (order.equals("inorder")) visit(node);',
      "Inorder: record between the children",
    ],
    ["right", "  dfs(node.right, order);", "Recurse into the right subtree"],
    [
      "post",
      '  if (order.equals("postorder")) visit(node);',
      "Postorder: record after both children",
    ],
    ["return", "}", "Return to the parent frame"],
  ],
  run(input, t) {
    const s = treeScene(input.values),
      stack: number[] = [],
      order: number[] = [];
    let entries = 0;
    t.emit(
      "INITIALIZE",
      `Tree DFS · ${input.order}`,
      "Slots use zero-based heap positions: children of i are 2i+1 and 2i+2; null means absent.",
      s,
      { order: input.order },
      "guard"
    );
    function visit(i: number) {
      if (i >= input.values.length || input.values[i] === null) return;
      stack.push(i);
      s.current = String(i);
      s.frontier = stack.map(String);
      entries++;
      t.emit(
        "CALL",
        `Enter node ${input.values[i]}`,
        "Keep this frame while its child calls execute.",
        s,
        { callStack: stack.map((j) => input.values[j]), order: input.order },
        "init",
        { entries },
        prediction(
          "When is this node recorded?",
          ["Before both children", "Between left and right", "After both children"],
          input.order === "preorder" ? 0 : input.order === "inorder" ? 1 : 2,
          `${input.order} fixes the recording position for every frame.`,
          "Pre means before, in means between, and post means after."
        )
      );
      const record = (key: "pre" | "in" | "post") => {
        s.current = String(i);
        s.visited.push(String(i));
        order.push(input.values[i]!);
        s.activeEdge = null;
        t.emit(
          "VISIT",
          `Record ${input.values[i]}`,
          `Visited order: ${order.join(", ")}.`,
          s,
          { callStack: stack.map((j) => input.values[j]), visitedOrder: [...order] },
          key,
          { entries, recorded: order.length }
        );
      };
      if (input.order === "preorder") record("pre");
      const child = (j: number, key: "left" | "right") => {
        if (j < input.values.length && input.values[j] !== null) {
          s.current = String(i);
          s.activeEdge = `${i}:${j}`;
          t.emit(
            "DESCEND",
            `Follow the ${key} child`,
            "The parent frame remains on the call stack.",
            s,
            { callStack: stack.map((n) => input.values[n]) },
            key,
            { entries }
          );
          visit(j);
        }
      };
      child(2 * i + 1, "left");
      if (input.order === "inorder") record("in");
      child(2 * i + 2, "right");
      if (input.order === "postorder") record("post");
      stack.pop();
      s.frontier = stack.map(String);
      s.current = stack.length ? String(stack.at(-1)) : null;
      s.activeEdge = null;
      t.emit(
        "RETURN",
        `Return from ${input.values[i]}`,
        stack.length
          ? "Resume the parent frame after this child call."
          : "All recursive frames have returned.",
        s,
        { callStack: stack.map((j) => input.values[j]), visitedOrder: [...order] },
        "return",
        { entries, recorded: order.length }
      );
    }
    visit(0);
    return order;
  },
});
export const treeBFS = defineAlgorithm({
  id: "tree-bfs",
  defaultInput: treeDefault,
  parse: (raw) => treeInput.parse(raw),
  complexity: {
    time: "O(n)",
    space: "O(w)",
    reason:
      "Each node enters and leaves the queue once. Its maximum size is proportional to the widest tree level w.",
  },
  invariant:
    "The queue contains discovered nodes in level order; a node is recorded only when removed from the front.",
  objectives: [
    "Predict which queued node comes next.",
    "Explain why children join behind all nodes already waiting.",
  ],
  code: [
    ["init", "void bfs(Node root) {", "Start level-order traversal"],
    ["guard", "  if (root == null) return;", "An empty tree has no visit"],
    [
      "queue",
      "  Deque<Node> queue = new ArrayDeque<>(); queue.addLast(root);",
      "Enqueue the root",
    ],
    ["pending", "  while (!queue.isEmpty()) {", "The next node is at the queue front"],
    [
      "visit",
      "    Node node = queue.removeFirst(); visit(node);",
      "Remove and record the front node",
    ],
    [
      "left",
      "    if (node.left != null) queue.addLast(node.left);",
      "Enqueue the left child if present",
    ],
    [
      "right",
      "    if (node.right != null) queue.addLast(node.right);",
      "Enqueue the right child if present",
    ],
    ["close", "  }", "Repeat until the queue is empty"],
    ["done", "}", "End"],
  ],
  run(input, t) {
    const s = treeScene(input.values),
      queue = [0],
      order: number[] = [];
    s.frontier = ["0"];
    t.emit(
      "ENQUEUE",
      "Root enters the queue",
      "A first-in, first-out queue preserves level order.",
      s,
      { queue: [input.values[0]] },
      "queue"
    );
    while (queue.length) {
      const labels = queue.map((i) => `${input.values[i]} (slot ${i})`);
      if (labels.length === 1) labels.push("No node; stop");
      t.emit(
        "DEQUEUE_PENDING",
        "Choose the queue front",
        "The earliest waiting node is processed next.",
        s,
        { queue: queue.map((i) => input.values[i]) },
        "pending",
        {},
        prediction(
          "Which node is visited next?",
          labels,
          0,
          "Breadth-first traversal removes the front of its queue.",
          "Look at the first queue entry."
        )
      );
      const i = queue.shift()!;
      s.current = String(i);
      s.frontier = queue.map(String);
      s.visited.push(String(i));
      order.push(input.values[i]!);
      t.emit(
        "VISIT",
        `Visit ${input.values[i]}`,
        `Level-order result: ${order.join(", ")}.`,
        s,
        { queue: queue.map((i) => input.values[i]), visitedOrder: [...order] },
        "visit",
        { visits: order.length }
      );
      for (const [j, key] of [
        [2 * i + 1, "left"],
        [2 * i + 2, "right"],
      ] as const)
        if (j < input.values.length && input.values[j] !== null) {
          queue.push(j);
          s.frontier = queue.map(String);
          s.activeEdge = `${i}:${j}`;
          t.emit(
            "ENQUEUE",
            `Queue ${input.values[j]}`,
            "The child joins behind every node already waiting.",
            s,
            { queue: queue.map((i) => input.values[i]) },
            key,
            { visits: order.length }
          );
        }
      s.activeEdge = null;
    }
    s.current = null;
    t.emit(
      "COMPLETE",
      "Every level has been visited",
      "The queue is empty. No tree node remains undiscovered.",
      s,
      { visitedOrder: order, queue: [] },
      "done",
      { visits: order.length }
    );
    return order;
  },
});
const graphDefault = {
  kind: "graph" as const,
  nodeCount: 6,
  edges: [
    [0, 1],
    [0, 2],
    [1, 3],
    [1, 4],
    [2, 4],
    [4, 5],
  ] as [number, number][],
  directed: false,
  source: 0,
};
function graphScene(input: ReturnType<typeof graphInput.parse>): NetworkScene {
  const count = input.nodeCount;
  return {
    kind: "network",
    structure: "graph",
    nodes: Array.from({ length: count }, (_, i) => ({
      id: String(i),
      label: String(i),
      x: 340 + Math.cos(-Math.PI / 2 + (2 * Math.PI * i) / count) * 235,
      y: 190 + Math.sin(-Math.PI / 2 + (2 * Math.PI * i) / count) * 145,
    })),
    edges: input.edges.map(([a, b], i) => ({
      id: `edge-${i}`,
      source: String(a),
      target: String(b),
      ...(input.weights ? { weight: input.weights[i] } : {}),
    })),
    directed: input.directed,
    current: null,
    visited: [],
    frontier: [],
    activeEdge: null,
  };
}
function graphTraversal(dfs: boolean) {
  return defineAlgorithm<ReturnType<typeof graphInput.parse>>({
    id: dfs ? "dfs" : "bfs",
    defaultInput: graphDefault,
    parse: (raw) => graphInput.parse(raw),
    complexity: {
      time: "O(V + E)",
      space: "O(V)",
      reason:
        "Each reachable vertex is discovered once and each outgoing adjacency is inspected once. The visited set and frontier need at most V entries.",
    },
    invariant: dfs
      ? "The call stack is the active search path. Mark on discovery so cycles cannot recurse into the same node again."
      : "Mark a node when it joins the queue so multiple edges cannot enqueue it twice.",
    objectives: [
      "Trace a deterministic traversal with ascending neighbor IDs.",
      "Separate discovered, waiting and processed nodes, including cycles and disconnected graphs.",
    ],
    code: dfs
      ? [
          [
            "init",
            "void dfs(int node, List<List<Integer>> adj, boolean[] seen) {",
            "Enter this vertex's frame (neighbors are sorted ascending)",
          ],
          [
            "visit",
            "  seen[node] = true; visit(node);",
            "Mark discovered and record the vertex",
          ],
          [
            "edge",
            "  for (int next : adj.get(node)) {",
            "Inspect each outgoing neighbor",
          ],
          [
            "check",
            "    if (!seen[next]) {",
            "Only unseen neighbors start a new recursive call",
          ],
          [
            "discover",
            "      dfs(next, adj, seen);",
            "Explore this branch before the next neighbor",
          ],
          ["close", "    }", "Already discovered vertices are skipped"],
          ["loop-end", "  }", "All neighbors have been inspected"],
          ["return", "}", "Return to the parent frame"],
          [
            "done",
            "// Traversal covers the source's reachable component.",
            "Stop when the source frame returns",
          ],
        ]
      : [
          [
            "init",
            "void bfs(int source, List<List<Integer>> adj) {",
            "Start with sorted ascending adjacency lists",
          ],
          [
            "seen",
            "  boolean[] seen = new boolean[adj.size()];",
            "No vertex is initially discovered",
          ],
          [
            "queue",
            "  Deque<Integer> queue = new ArrayDeque<>();",
            "Create a FIFO frontier",
          ],
          [
            "start",
            "  seen[source] = true; queue.addLast(source);",
            "Discover and enqueue the source",
          ],
          [
            "pending",
            "  while (!queue.isEmpty()) {",
            "The next vertex is at the queue front",
          ],
          [
            "visit",
            "    int node = queue.removeFirst(); visit(node);",
            "Remove and record the front vertex",
          ],
          [
            "edge",
            "    for (int next : adj.get(node)) {",
            "Inspect outgoing neighbors in ascending order",
          ],
          [
            "check",
            "      if (!seen[next]) {",
            "Already discovered vertices must not be queued again",
          ],
          [
            "discover",
            "        seen[next] = true; queue.addLast(next);",
            "Mark and enqueue an unseen neighbor",
          ],
          ["close", "      }", "Continue with the next neighbor"],
          ["inner-end", "    }", "All outgoing edges have been inspected"],
          ["outer-end", "  }", "Repeat while nodes remain queued"],
          ["done", "}", "Stop: the source's reachable component is complete"],
        ],
    run(input, t) {
      const s = graphScene(input),
        adj = Array.from(
          { length: input.nodeCount },
          () => [] as { node: number; edge: string }[]
        );
      input.edges.forEach(([a, b], i) => {
        adj[a].push({ node: b, edge: `edge-${i}` });
        if (!input.directed && a !== b) adj[b].push({ node: a, edge: `edge-${i}` });
      });
      adj.forEach((list) => list.sort((a, b) => a.node - b.node));
      const seen = new Set<number>(),
        order: number[] = [],
        frontier: number[] = [];
      let inspected = 0;
      const vars = () => ({
        [dfs ? "callStack" : "queue"]: [...frontier],
        visitedOrder: [...order],
        discovered: [...seen].sort((a, b) => a - b),
      });
      const inspect = (node: number, next: number, edge: string) => {
        s.current = String(node);
        s.activeEdge = edge;
        inspected++;
        const known = seen.has(next);
        t.emit(
          "INSPECT_EDGE",
          `Inspect ${node} ${input.directed ? "→" : "—"} ${next}`,
          known
            ? "This neighbor is already discovered. A cycle or second incoming edge must not repeat the visit."
            : "This neighbor has not been discovered yet.",
          s,
          vars(),
          "check",
          { vertices: order.length, edgesInspected: inspected },
          prediction(
            "What should happen to this neighbor?",
            [
              "Skip: already discovered",
              dfs ? "Start a recursive call" : "Mark and enqueue",
            ],
            known ? 0 : 1,
            known
              ? "The seen set prevents a duplicate visit."
              : dfs
                ? "DFS explores this unseen branch before returning to later neighbors."
                : "Mark before enqueueing so another edge cannot enqueue the same vertex.",
            "Check the discovered set, not just the processed list."
          )
        );
        return !known;
      };
      t.emit(
        "INITIALIZE",
        `${dfs ? "Depth" : "Breadth"}-first from node ${input.source}`,
        "Neighbors are considered in ascending numeric ID order. Unreachable components remain unvisited." +
          (input.weights
            ? " Edge weights are annotations only; BFS/DFS do not compute weighted shortest paths."
            : ""),
        s,
        { source: input.source },
        "init"
      );
      if (dfs) {
        function visit(node: number) {
          seen.add(node);
          frontier.push(node);
          order.push(node);
          s.current = String(node);
          s.visited = order.map(String);
          s.frontier = frontier.map(String);
          t.emit(
            "VISIT",
            `Enter vertex ${node}`,
            "Record the vertex once and keep its frame while exploring its neighbors.",
            s,
            vars(),
            "visit",
            { vertices: order.length, edgesInspected: inspected }
          );
          for (const { node: next, edge } of adj[node])
            if (inspect(node, next, edge)) visit(next);
          frontier.pop();
          s.frontier = frontier.map(String);
          s.current = frontier.length ? String(frontier.at(-1)) : null;
          s.activeEdge = null;
          t.emit(
            "RETURN",
            `Return from vertex ${node}`,
            "All outgoing neighbors are now handled. Resume the parent frame, if any.",
            s,
            vars(),
            "return",
            { vertices: order.length, edgesInspected: inspected }
          );
        }
        visit(input.source);
      } else {
        seen.add(input.source);
        frontier.push(input.source);
        s.frontier = frontier.map(String);
        t.emit(
          "ENQUEUE",
          `Discover source ${input.source}`,
          "Mark the source before it joins the queue.",
          s,
          vars(),
          "start"
        );
        while (frontier.length) {
          const next = frontier[0],
            options = [...frontier.map(String), "Stop"].slice(0, 5);
          t.emit(
            "DEQUEUE_PENDING",
            "Select the next vertex",
            "Remove the earliest queued vertex before inspecting its neighbors.",
            s,
            vars(),
            "pending",
            { vertices: order.length, edgesInspected: inspected },
            prediction(
              "Which vertex is processed next?",
              options,
              0,
              `Node ${next} is at the queue front.`,
              "Use FIFO order, not the smallest vertex ID globally."
            )
          );
          const node = frontier.shift()!;
          order.push(node);
          s.current = String(node);
          s.visited = order.map(String);
          s.frontier = frontier.map(String);
          s.activeEdge = null;
          t.emit(
            "VISIT",
            `Process vertex ${node}`,
            "Now inspect this vertex's outgoing neighbors.",
            s,
            vars(),
            "visit",
            { vertices: order.length, edgesInspected: inspected }
          );
          for (const { node: neighbor, edge } of adj[node])
            if (inspect(node, neighbor, edge)) {
              seen.add(neighbor);
              frontier.push(neighbor);
              s.frontier = frontier.map(String);
              t.emit(
                "ENQUEUE",
                `Discover vertex ${neighbor}`,
                "Append it to the rear and mark it immediately. It cannot join the queue twice.",
                s,
                vars(),
                "discover",
                { vertices: order.length, edgesInspected: inspected }
              );
            }
        }
      }
      s.current = null;
      s.activeEdge = null;
      t.emit(
        "COMPLETE",
        "Reachable component complete",
        `${order.length} of ${input.nodeCount} vertices were reachable from ${input.source}.`,
        s,
        vars(),
        "done",
        { vertices: order.length, edgesInspected: inspected }
      );
      return order;
    },
  });
}
export const bfs = graphTraversal(false);
export const dfs = graphTraversal(true);
