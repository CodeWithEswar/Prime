import { describe, expect, it } from "vitest";
import {
  ALGORITHMS,
  searchAlgorithms,
  labsForTopics,
} from "@/features/algorithm-lab/registry/metadata";
import { loadAlgorithm } from "@/features/algorithm-lab/registry/registry";
import {
  binarySearch,
  bubbleSort,
  linearSearch,
  slidingWindow,
  twoPointers,
} from "@/features/algorithm-lab/algorithms/arrays";
import { stack, queue, linkedList } from "@/features/algorithm-lab/algorithms/sequences";
import { bfs, dfs, treeBFS, treeDFS } from "@/features/algorithm-lab/algorithms/networks";
import { validateTrace, MAX_TRACE_STEPS } from "@/features/algorithm-lab/engine/trace";
import {
  initialPlayback,
  playback,
  SPEEDS,
} from "@/features/algorithm-lab/engine/playback";
import {
  initialPractice,
  evaluatePrediction,
  pendingPrediction,
} from "@/features/algorithm-lab/engine/practice";
import { parseInputJSON, seededValues } from "@/features/algorithm-lab/engine/input";

describe("Lab trace contracts", () => {
  it.each(ALGORITHMS.map((a) => a.slug))(
    "loads, validates and reproduces %s",
    async (slug) => {
      const algorithm = await loadAlgorithm(slug),
        input = structuredClone(algorithm.defaultInput),
        trace = algorithm.generateTrace(input);
      expect(trace).toEqual(algorithm.generateTrace(input));
      expect(JSON.parse(JSON.stringify(trace))).toEqual(trace);
      expect(trace.steps.length).toBeLessThanOrEqual(MAX_TRACE_STEPS);
      const ids = new Set(algorithm.java.lines.map((l) => l.id));
      expect(ids).toEqual(new Set(algorithm.pseudocode.lines.map((l) => l.id)));
      expect(() => validateTrace(trace, ids)).not.toThrow();
      expect(Object.isFrozen(trace.steps[0].scene)).toBe(true);
      expect(input).toEqual(algorithm.defaultInput);
      const questionIndex = trace.steps.findIndex((s) => s.prediction);
      expect(questionIndex).toBeGreaterThanOrEqual(0);
      const question = trace.steps[questionIndex].prediction!;
      expect(evaluatePrediction(question, question.correct)).toBe(true);
      expect(evaluatePrediction(question, "forged")).toBe(false);
      expect(pendingPrediction(trace, questionIndex, initialPractice)).toEqual(question);
      expect(
        pendingPrediction(trace, questionIndex, {
          ...initialPractice,
          answers: { [questionIndex]: "revealed" },
        })
      ).toBeNull();
    }
  );
  it("keeps metadata searchable without importing implementations", async () => {
    for (const slug of ["constructor", "__proto__", "toString"])
      await expect(loadAlgorithm(slug)).rejects.toThrow("not available");
    expect(searchAlgorithms("shortest path")).toHaveLength(0);
    expect(searchAlgorithms("breadth first").map((a) => a.slug)).toContain("bfs");
    expect(labsForTopics(["two-pointers-sliding-window"]).map((a) => a.slug)).toEqual([
      "two-pointers",
      "sliding-window",
    ]);
  });
  it("rejects missing code references and invalid element IDs", () => {
    const t = structuredClone(binarySearch.generateTrace(binarySearch.defaultInput));
    t.steps[0].code = "missing";
    expect(() => validateTrace(t, new Set())).toThrow("code reference");
    const s = structuredClone(binarySearch.generateTrace(binarySearch.defaultInput));
    if (s.steps[0].scene.kind === "array") s.steps[0].scene.active = [999];
    expect(() =>
      validateTrace(s, new Set(binarySearch.java.lines.map((l) => l.id)))
    ).toThrow("active index");
  });
});
describe("Search and window correctness", () => {
  it.each([
    [[1, 3, 5], 1, 0],
    [[1, 3, 5], 3, 1],
    [[1, 3, 5], 5, 2],
    [[1, 3, 5], 4, -1],
    [[4], 4, 0],
    [[4], 1, -1],
    [[1, 9], 9, 1],
    [[-8, -3, 0, 5], -3, 1],
  ])("binary search %j for %s", (values, target, index) => {
    expect(binarySearch.generateTrace({ kind: "search", values, target }).result).toBe(
      index
    );
  });
  it("documents duplicates as any matching index and linear search as first", () => {
    const input = { kind: "search", values: [1, 2, 2, 2, 5], target: 2 };
    const index = binarySearch.generateTrace(input).result as number;
    expect(input.values[index]).toBe(2);
    expect(linearSearch.generateTrace(input).result).toBe(1);
  });
  it("rejects unsorted binary/pair input and excessive values", () => {
    expect(() =>
      binarySearch.generateTrace({ kind: "search", values: [4, 1], target: 1 })
    ).toThrow("nondecreasing");
    expect(() =>
      twoPointers.generateTrace({ kind: "search", values: [4, 1], target: 5 })
    ).toThrow();
    expect(() =>
      binarySearch.generateTrace({ kind: "search", values: Array(33).fill(0), target: 1 })
    ).toThrow();
  });
  it("search generators agree with exhaustive small inputs", () => {
    for (let mask = 0; mask < 32; mask++) {
      const values = Array.from({ length: 5 }, (_, i) => ((mask >> i) & 1) + i).sort(
        (a, b) => a - b
      );
      for (let target = -1; target < 8; target++) {
        const input = { kind: "search", values, target },
          index = binarySearch.generateTrace(input).result as number;
        expect(index === -1 ? !values.includes(target) : values[index] === target).toBe(
          true
        );
        const pair = twoPointers.generateTrace(input).result as number[];
        const exists = values.some((v, i) =>
          values.some((w, j) => j > i && v + w === target)
        );
        expect(pair.length > 0).toBe(exists);
        if (pair.length) expect(values[pair[0]] + values[pair[1]]).toBe(target);
      }
    }
  });
  it.each([
    [[-4, -2, -7], 2, -6],
    [[2, 1, 5, 1, 3, 2], 3, 9],
    [[5], 1, 5],
    [[0, 0, 0], 3, 0],
  ])("window %j", (values, size, result) => {
    expect(slidingWindow.generateTrace({ kind: "window", values, size }).result).toBe(
      result
    );
  });
  it("validates size and handles all complete windows", () => {
    expect(() =>
      slidingWindow.generateTrace({ kind: "window", values: [1], size: 2 })
    ).toThrow();
    const values = seededValues(42, 20);
    for (let size = 1; size <= 20; size++) {
      const expected = Math.max(
        ...values
          .slice(0, values.length - size + 1)
          .map((_, i) => values.slice(i, i + size).reduce((a, b) => a + b, 0))
      );
      expect(slidingWindow.generateTrace({ kind: "window", values, size }).result).toBe(
        expected
      );
    }
  });
});
describe("Sorting and sequence behavior", () => {
  it.each([[3, 2, 1], [1, 2, 3], [2, 2, 1], [-4, 0, -9], [1]])(
    "sorts %j and records real swaps",
    (...values) => {
      const trace = bubbleSort.generateTrace({ kind: "sort", values });
      expect(trace.result).toEqual([...values].sort((a, b) => a - b));
      for (let i = 1; i < trace.steps.length; i++)
        if (trace.steps[i].operation === "SWAP") {
          const before = trace.steps[i - 1].scene,
            after = trace.steps[i].scene;
          if (before.kind === "array" && after.kind === "array") {
            const [a, b] = before.active;
            expect(after.cells[a]).toEqual(before.cells[b]);
            expect(after.cells[b]).toEqual(before.cells[a]);
          }
        }
    }
  );
  it("keeps maximum bubble input bounded", () => {
    expect(
      bubbleSort.generateTrace({
        kind: "sort",
        values: Array.from({ length: 32 }, (_, i) => 32 - i),
      }).steps.length
    ).toBeLessThan(1100);
  });
  it("handles empty operations, LIFO/FIFO and read-only peek", () => {
    const st = stack.generateTrace({
      kind: "operations",
      operations: [
        { type: "pop" },
        { type: "push", value: 4 },
        { type: "push", value: 9 },
        { type: "peek" },
        { type: "pop" },
      ],
    });
    expect(st.result).toEqual([4]);
    expect(st.steps.some((s) => s.operation === "EMPTY")).toBe(true);
    const q = queue.generateTrace({
      kind: "operations",
      operations: [
        { type: "enqueue", value: 4 },
        { type: "enqueue", value: 9 },
        { type: "front" },
        { type: "dequeue" },
      ],
    });
    expect(q.result).toEqual([9]);
    expect(() =>
      queue.generateTrace({
        kind: "operations",
        operations: [{ type: "push", value: 1 }],
      })
    ).toThrow();
    expect(() =>
      stack.generateTrace({ kind: "operations", operations: [{ type: "push" }] })
    ).toThrow("needs a value");
  });
  it("relinks head and interior list nodes and rejects impossible indices", () => {
    const input = {
      kind: "operations",
      operations: [
        { type: "insert", value: 4 },
        { type: "insert", value: 9 },
        { type: "insert", value: 1, index: 0 },
        { type: "delete", index: 1 },
        { type: "search", value: 9 },
      ],
    };
    expect(linkedList.generateTrace(input).result).toEqual([1, 9]);
    expect(
      linkedList.generateTrace(input).steps.some((s) => s.variables.result === 1)
    ).toBe(true);
    expect(() =>
      linkedList.generateTrace({
        kind: "operations",
        operations: [{ type: "delete", index: 0 }],
      })
    ).toThrow("outside");
  });
});
describe("Networks and tree call frames", () => {
  const graph = {
    kind: "graph",
    nodeCount: 6,
    edges: [
      [0, 1],
      [0, 2],
      [1, 3],
      [1, 4],
      [2, 4],
      [4, 5],
    ],
    directed: false,
    source: 0,
  };
  it("records deterministic BFS visit and queue states", () => {
    const trace = bfs.generateTrace(graph);
    expect(trace.result).toEqual([0, 1, 2, 3, 4, 5]);
    const visit = trace.steps.find(
      (s) =>
        s.operation === "VISIT" && s.scene.kind === "network" && s.scene.current === "1"
    )!;
    expect(visit.variables.queue).toEqual([2]);
    expect(
      trace.steps
        .filter((s) => s.operation === "ENQUEUE")
        .map((s) => (s.scene.kind === "network" ? s.scene.frontier.at(-1) : null))
    ).toEqual(["0", "1", "2", "3", "4", "5"]);
  });
  it("DFS uses ascending neighbor order and cycles do not duplicate visits", () => {
    expect(dfs.generateTrace(graph).result).toEqual([0, 1, 3, 4, 2, 5]);
    const cycle = {
      kind: "graph",
      nodeCount: 4,
      edges: [
        [0, 1],
        [1, 2],
        [2, 0],
        [2, 2],
      ],
      directed: true,
      source: 0,
    };
    expect(bfs.generateTrace(cycle).result).toEqual([0, 1, 2]);
    expect(dfs.generateTrace(cycle).result).toEqual([0, 1, 2]);
    expect(() => bfs.generateTrace({ ...cycle, edges: [[0, 8]] })).toThrow();
    expect(() =>
      bfs.generateTrace({
        ...graph,
        edges: [
          [0, 1],
          [1, 0],
        ],
      })
    ).toThrow();
  });
  it("keeps edge weights as visible annotations without inventing shortest paths", () => {
    const trace = bfs.generateTrace({ ...graph, weights: [4, 9, 1, 3, 7, 2] });
    expect(trace.result).toEqual(bfs.generateTrace(graph).result);
    expect(
      trace.steps[0].scene.kind === "network" && trace.steps[0].scene.edges[0].weight
    ).toBe(4);
    expect(trace.steps[0].explanation).toContain(
      "do not compute weighted shortest paths"
    );
    expect(() => bfs.generateTrace({ ...graph, weights: [1] })).toThrow();
  });
  it.each([
    ["preorder", [7, 3, 1, 5, 10, 9, 12]],
    ["inorder", [1, 3, 5, 7, 9, 10, 12]],
    ["postorder", [1, 5, 3, 9, 12, 10, 7]],
  ])("tree DFS %s", (order, result) => {
    expect(
      treeDFS.generateTrace({ kind: "tree", values: [7, 3, 10, 1, 5, 9, 12], order })
        .result
    ).toEqual(result);
  });
  it("tree BFS handles sparse heap slots and invalid parents", () => {
    expect(
      treeBFS.generateTrace({
        kind: "tree",
        values: [1, null, 2, null, null, 3],
        order: "preorder",
      }).result
    ).toEqual([1, 2, 3]);
    expect(() =>
      treeDFS.generateTrace({ kind: "tree", values: [1, null, 2, 3], order: "preorder" })
    ).toThrow();
    expect(() =>
      treeDFS.generateTrace({ kind: "tree", values: [null], order: "preorder" })
    ).toThrow();
  });
});
describe("Playback and input boundaries", () => {
  it("plays, pauses, seeks and navigates immutable snapshots", () => {
    let state = playback(initialPlayback, { type: "toggle" }, 4);
    expect(state.status).toBe("playing");
    state = playback(state, { type: "tick" }, 4);
    expect(state.index).toBe(1);
    state = playback(state, { type: "toggle" }, 4);
    expect(state.status).toBe("paused");
    expect(playback(state, { type: "tick" }, 4).index).toBe(1);
    state = playback(state, { type: "seek", index: 99 }, 4);
    expect(state.status).toBe("completed");
    expect(state.index).toBe(3);
    state = playback(state, { type: "previous" }, 4);
    expect(state.index).toBe(2);
    state = playback(state, { type: "restart" }, 4);
    expect(state.index).toBe(0);
    expect(playback(state, { type: "previous" }, 4).index).toBe(0);
    for (const speed of SPEEDS)
      expect(playback(state, { type: "speed", speed }, 4).speed).toBe(speed);
    expect(playback(state, { type: "speed", speed: 99 }, 4)).toEqual(state);
    expect(playback({ ...state, mode: "step" }, { type: "toggle" }, 4).status).toBe(
      "idle"
    );
    expect(playback(state, { type: "mode", mode: "practice" }, 4).status).toBe("paused");
  });
  it("rejects executable text and oversized JSON; random examples reproduce", () => {
    expect(() => parseInputJSON("(()=>{alert(1)})()")).toThrow("valid JSON");
    expect(() => parseInputJSON(" ".repeat(12001))).toThrow("too large");
    expect(seededValues(42)).toEqual(seededValues(42));
    expect(seededValues(42)).not.toEqual(seededValues(43));
  });
});
