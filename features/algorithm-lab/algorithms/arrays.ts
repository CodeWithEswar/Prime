import { defineAlgorithm } from "./define";
import { searchInput, sortInput, windowInput, sorted } from "../engine/input";
import { arrayScene, prediction } from "../engine/trace";

export const linearSearch = defineAlgorithm({
  id: "linear-search",
  defaultInput: { kind: "search" as const, values: [8, 3, 11, 6, 2, 9], target: 6 },
  parse: (input) => searchInput.parse(input),
  complexity: {
    time: "O(n)",
    space: "O(1)",
    reason: "A miss examines all n values; only an index is needed.",
  },
  invariant: "Every index before i has been checked and does not contain the target.",
  objectives: [
    "Distinguish a candidate from an eliminated value.",
    "Explain why a complete scan proves absence.",
  ],
  code: [
    ["init", "int linearSearch(int[] a, int target) {", "Start at the first value"],
    [
      "compare",
      "  for (int i = 0; i < a.length; i++) {",
      "For each index i, compare a[i] with target",
    ],
    ["found", "    if (a[i] == target) return i;", "If equal, return i"],
    ["advance", "  }", "Otherwise continue to the next index"],
    ["missing", "  return -1;", "If all candidates fail, return -1"],
    ["end", "}", "End"],
  ],
  run(input, t) {
    const s = arrayScene(input.values);
    let comparisons = 0;
    t.emit(
      "INITIALIZE",
      "Inspect each candidate",
      `Look for ${input.target} without assuming the values are sorted.`,
      s,
      { target: input.target },
      "init"
    );
    for (let i = 0; i < input.values.length; i++) {
      s.active = [i];
      s.pointers = { i };
      comparisons++;
      const match = input.values[i] === input.target;
      t.emit(
        "COMPARE",
        `Compare index ${i}`,
        `${input.values[i]} ${match ? "equals" : "does not equal"} ${input.target}.`,
        s,
        { i, value: input.values[i], target: input.target },
        "compare",
        { comparisons },
        prediction(
          "What should the scan do next?",
          ["Return this index", "Continue scanning"],
          match ? 0 : 1,
          match
            ? "A matching value proves this index is an answer."
            : "This value failed; later values remain candidates.",
          "Check equality with the target."
        )
      );
      if (match) {
        s.found = [i];
        t.emit(
          "FOUND",
          "Target found",
          `Return index ${i}. This is the first matching index.`,
          s,
          { result: i },
          "found",
          { comparisons }
        );
        return i;
      }
      s.inactive.push(i);
      s.active = [];
      t.emit(
        "ADVANCE",
        "Eliminate this candidate",
        `Index ${i} cannot answer the search. Continue in array order.`,
        s,
        { checked: i + 1 },
        "advance",
        { comparisons }
      );
    }
    s.pointers = {};
    t.emit(
      "NOT_FOUND",
      "No match remains",
      "Every value was checked, so return -1.",
      s,
      { result: -1 },
      "missing",
      { comparisons }
    );
    return -1;
  },
});

export const binarySearch = defineAlgorithm({
  id: "binary-search",
  defaultInput: { kind: "search" as const, values: [2, 5, 7, 9, 15, 18, 23], target: 15 },
  examples: [
    {
      name: "Target absent",
      input: { kind: "search" as const, values: [2, 5, 7, 9, 15, 18, 23], target: 8 },
    },
    {
      name: "Duplicates",
      input: { kind: "search" as const, values: [1, 2, 2, 2, 5], target: 2 },
    },
  ],
  parse: (input) => sorted(searchInput.parse(input)),
  complexity: {
    time: "O(log n)",
    space: "O(1)",
    reason:
      "Each failed comparison removes at least half the candidate interval. Two bounds use constant space.",
  },
  invariant:
    "If the target exists, at least one match remains inside the inclusive interval [low, high]. Duplicates return any matching index.",
  objectives: [
    "Justify discarding a half using sorted order.",
    "Track inclusive bounds and termination when low exceeds high.",
  ],
  code: [
    [
      "init",
      "int binarySearch(int[] a, int target) {",
      "Initialize inclusive low and high bounds",
    ],
    ["bounds", "  int low = 0, high = a.length - 1;", "low = 0; high = length - 1"],
    ["loop", "  while (low <= high) {", "While the candidate interval is not empty"],
    [
      "mid",
      "    int mid = low + (high - low) / 2;",
      "mid = low + floor((high - low) / 2)",
    ],
    [
      "compare",
      "    if (a[mid] == target) return mid;",
      "Compare the middle value with the target",
    ],
    [
      "move-low",
      "    if (a[mid] < target) low = mid + 1;",
      "If middle is too small, low = mid + 1",
    ],
    ["move-high", "    else high = mid - 1;", "If middle is too large, high = mid - 1"],
    ["close", "  }", "Repeat on the remaining interval"],
    ["missing", "  return -1;", "Return -1 when no candidate remains"],
    ["end", "}", "End"],
  ],
  run(input, t) {
    const a = input.values,
      s = arrayScene(a);
    let low = 0,
      high = a.length - 1,
      comparisons = 0;
    const sync = () => {
      if (low <= high) s.range = [low, high];
      else delete s.range;
      s.inactive = a.map((_, i) => i).filter((i) => i < low || i > high);
      s.pointers = { L: low, H: high };
    };
    sync();
    t.emit(
      "INITIALIZE",
      "Keep the target in range",
      `Search for ${input.target} inside indices 0 through ${high}.`,
      s,
      { low, high, target: input.target },
      "bounds"
    );
    while (low <= high) {
      const mid = low + Math.floor((high - low) / 2),
        value = a[mid];
      sync();
      s.pointers.M = mid;
      s.active = [mid];
      t.emit(
        "MIDPOINT",
        `Choose midpoint ${mid}`,
        `low + floor((high - low) / 2) = ${mid}. This splits the remaining ${high - low + 1} candidates.`,
        s,
        { low, mid, high, target: input.target, midValue: value },
        "mid",
        { comparisons }
      );
      comparisons++;
      const relation =
        value === input.target
          ? "equals"
          : value < input.target
            ? "is smaller than"
            : "is larger than";
      const reason =
        value === input.target
          ? `Index ${mid} holds the target.`
          : value < input.target
            ? `Sorted order means indices ${low} through ${mid} are all too small. Low becomes ${mid + 1}.`
            : `Sorted order means indices ${mid} through ${high} are all too large. High becomes ${mid - 1}.`;
      t.emit(
        "COMPARE",
        `${value} ${relation} ${input.target}`,
        `Use this comparison to decide which candidates remain.`,
        s,
        { low, mid, high, midValue: value, target: input.target },
        "compare",
        { comparisons },
        prediction(
          "What should happen next?",
          ["Return mid", "Move low to mid + 1", "Move high to mid - 1"],
          value === input.target ? 0 : value < input.target ? 1 : 2,
          reason,
          "All values to the left are no larger; all to the right are no smaller."
        )
      );
      if (value === input.target) {
        s.found = [mid];
        t.emit(
          "FOUND",
          "A match is proven",
          reason,
          s,
          { low, mid, high, result: mid },
          "compare",
          { comparisons }
        );
        return mid;
      }
      const lower = value < input.target,
        old = lower ? low : high;
      if (lower) low = mid + 1;
      else high = mid - 1;
      sync();
      s.active = [];
      t.emit(
        lower ? "MOVE_LOW" : "MOVE_HIGH",
        `${lower ? "low" : "high"}: ${old} → ${lower ? low : high}`,
        reason,
        s,
        { low, high, previousBound: old, newBound: lower ? low : high },
        lower ? "move-low" : "move-high",
        { comparisons },
        low <= high
          ? prediction(
              "What is the next midpoint index?",
              [
                String(low + Math.floor((high - low) / 2) - 1),
                String(low + Math.floor((high - low) / 2)),
                String(low + Math.floor((high - low) / 2) + 1),
              ],
              1,
              `low + floor((high - low) / 2) = ${low + Math.floor((high - low) / 2)}.`,
              "Apply the midpoint formula to the new inclusive bounds."
            )
          : undefined
      );
    }
    s.active = [];
    t.emit(
      "NOT_FOUND",
      "The interval is empty",
      `Low ${low} exceeds high ${high}. No candidate remains; return -1.`,
      s,
      { low, high, result: -1 },
      "missing",
      { comparisons }
    );
    return -1;
  },
});

export const bubbleSort = defineAlgorithm({
  id: "bubble-sort",
  defaultInput: { kind: "sort" as const, values: [8, 4, 2, 9, 1, 7] },
  parse: (input) => sortInput.parse(input),
  complexity: {
    time: "O(n²) worst; O(n) best",
    space: "O(1)",
    reason:
      "Nested passes compare adjacent values. An unchanged pass stops early; swaps use constant extra space.",
  },
  invariant:
    "After each pass, the suffix beyond end is sorted and contains the largest settled values.",
  objectives: [
    "Predict when a neighboring pair swaps.",
    "Connect each pass to the growing sorted suffix.",
  ],
  code: [
    ["init", "void bubbleSort(int[] a) {", "Begin with an unsettled array"],
    [
      "pass",
      "  for (int end = a.length - 1; end > 0; end--) {",
      "For each remaining end boundary",
    ],
    ["flag", "    boolean changed = false;", "No swap has happened in this pass"],
    [
      "compare",
      "    for (int j = 0; j < end; j++) {",
      "Compare each adjacent pair before end",
    ],
    ["swap", "      if (a[j] > a[j + 1]) {", "If the pair is descending, swap it"],
    [
      "temp",
      "        int temp = a[j]; a[j] = a[j+1]; a[j+1] = temp;",
      "Exchange the two values",
    ],
    ["changed", "        changed = true;", "Record that the pass changed the order"],
    ["inner-end", "      }", "Continue to the next pair"],
    ["loop-end", "    }", "The largest remaining value is now at end"],
    [
      "settle",
      "    if (!changed) break;",
      "If no pair swapped, the entire array is sorted",
    ],
    ["done", "  }", "Finish all passes"],
    ["end", "}", "End"],
  ],
  run(input, t) {
    const s = arrayScene(input.values);
    let comparisons = 0,
      swaps = 0;
    t.emit(
      "INITIALIZE",
      "Settle one value per pass",
      "Compare adjacent values; swap only when the left value is larger.",
      s,
      {},
      "init"
    );
    for (let end = s.cells.length - 1; end > 0; end--) {
      let changed = false;
      for (let j = 0; j < end; j++) {
        s.active = [j, j + 1];
        s.pointers = { j };
        comparisons++;
        const swap = s.cells[j].value > s.cells[j + 1].value;
        t.emit(
          "COMPARE",
          `Compare ${s.cells[j].value} and ${s.cells[j + 1].value}`,
          "A strict comparison preserves the order of equal values.",
          s,
          { j, end },
          "compare",
          { comparisons, swaps },
          prediction(
            "Will this pair swap?",
            ["Swap the pair", "Keep this order"],
            swap ? 0 : 1,
            swap
              ? "The left value is larger, so exchanging them removes this local inversion."
              : "The pair is already nondecreasing, including equal values.",
            "Compare the left value with its right neighbor."
          )
        );
        if (swap) {
          [s.cells[j], s.cells[j + 1]] = [s.cells[j + 1], s.cells[j]];
          changed = true;
          swaps++;
          t.emit(
            "SWAP",
            "Exchange neighboring values",
            "The larger value moves one place toward the end of the unsettled interval.",
            s,
            { j, end },
            "temp",
            { comparisons, swaps }
          );
        }
      }
      s.active = [];
      s.settled.push(end);
      s.pointers = {};
      t.emit(
        "SETTLE",
        `Index ${end} is settled`,
        "No smaller value in this pass could remain to its right.",
        s,
        { end, changed },
        "loop-end",
        { comparisons, swaps }
      );
      if (!changed) break;
    }
    s.settled = s.cells.map((_, i) => i);
    s.active = [];
    s.pointers = {};
    t.emit(
      "COMPLETE",
      "The array is sorted",
      "Every adjacent pair is in nondecreasing order.",
      s,
      {},
      "done",
      { comparisons, swaps }
    );
    return s.cells.map((c) => c.value);
  },
});

export const twoPointers = defineAlgorithm({
  id: "two-pointers",
  defaultInput: { kind: "search" as const, values: [1, 3, 4, 6, 8, 10], target: 12 },
  parse: (input) => sorted(searchInput.parse(input)),
  complexity: {
    time: "O(n)",
    space: "O(1)",
    reason:
      "Each comparison moves one pointer inward; neither pointer moves back. Input must already be sorted.",
  },
  invariant:
    "Any pair not yet eliminated lies between L and R; the two indices must be distinct.",
  objectives: [
    "Use sorted order to eliminate all pairs involving one endpoint.",
    "Distinguish pair-sum reasoning from arbitrary pointer movement.",
  ],
  code: [
    ["init", "int[] pairSum(int[] a, int target) {", "Initialize the two endpoints"],
    ["bounds", "  int left = 0, right = a.length - 1;", "L = 0; R = length - 1"],
    ["loop", "  while (left < right) {", "While L and R refer to distinct indices"],
    ["compare", "    int sum = a[left] + a[right];", "Compare a[L] + a[R] with target"],
    [
      "found",
      "    if (sum == target) return new int[]{left, right};",
      "If equal, return the index pair",
    ],
    ["move-low", "    if (sum < target) left++;", "If too small, move L inward"],
    ["move-high", "    else right--;", "Otherwise move R inward"],
    ["close", "  }", "Repeat"],
    ["missing", "  return new int[0];", "No pair remains"],
    ["end", "}", "End"],
  ],
  run(input, t) {
    const a = input.values,
      s = arrayScene(a);
    let left = 0,
      right = a.length - 1,
      comparisons = 0;
    t.emit(
      "INITIALIZE",
      "Start at the two ends",
      "Sorted order lets a sum comparison eliminate one endpoint.",
      s,
      { left, right, target: input.target },
      "bounds"
    );
    while (left < right) {
      s.pointers = { L: left, R: right };
      s.range = [left, right];
      s.active = [left, right];
      const sum = a[left] + a[right];
      comparisons++;
      const why =
        sum === input.target
          ? "These distinct indices produce the target sum."
          : sum < input.target
            ? `Even the largest partner for ${a[left]} is too small. Eliminate the left endpoint.`
            : `Even the smallest partner for ${a[right]} is too large. Eliminate the right endpoint.`;
      t.emit(
        "COMPARE",
        `${a[left]} + ${a[right]} = ${sum}`,
        "Compare the endpoint sum with the target.",
        s,
        { left, right, sum, target: input.target },
        "compare",
        { comparisons },
        prediction(
          "Which decision preserves possible answers?",
          ["Return the pair", "Move L inward", "Move R inward"],
          sum === input.target ? 0 : sum < input.target ? 1 : 2,
          why,
          "Use sorted order and the size of the sum."
        )
      );
      if (sum === input.target) {
        s.found = [left, right];
        t.emit("FOUND", "Pair found", why, s, { result: [left, right] }, "found", {
          comparisons,
        });
        return [left, right];
      }
      const moveLeft = sum < input.target;
      if (moveLeft) s.inactive.push(left++);
      else s.inactive.push(right--);
      s.active = [];
      s.pointers = { L: left, R: right };
      s.range = [left, right];
      t.emit(
        moveLeft ? "MOVE_LEFT" : "MOVE_RIGHT",
        "Shrink the candidate interval",
        why,
        s,
        { left, right },
        moveLeft ? "move-low" : "move-high",
        { comparisons }
      );
    }
    s.active = [];
    t.emit(
      "NOT_FOUND",
      "No distinct pair remains",
      "The pointers met. Return an empty index pair.",
      s,
      { left, right },
      "missing",
      { comparisons }
    );
    return [];
  },
});

export const slidingWindow = defineAlgorithm({
  id: "sliding-window",
  defaultInput: { kind: "window" as const, values: [2, 1, 5, 1, 3, 2], size: 3 },
  parse: (input) => windowInput.parse(input),
  complexity: {
    time: "O(n)",
    space: "O(1)",
    reason:
      "Build one window, then remove one outgoing value and add one incoming value per shift.",
  },
  invariant:
    "sum equals exactly the values in the current fixed-size window. best is the largest complete window seen so far.",
  objectives: [
    "Reuse a previous sum instead of rescanning the whole window.",
    "Handle negative values without assuming the best sum starts at zero.",
  ],
  code: [
    ["init", "int maxWindow(int[] a, int k) {", "Begin a fixed-size window"],
    ["sum", "  int sum = 0;", "sum = 0"],
    ["build", "  for (int i = 0; i < k; i++) sum += a[i];", "Add the first k values"],
    ["best", "  int best = sum;", "best = first complete window sum"],
    ["loop", "  for (int r = k; r < a.length; r++) {", "For each new right endpoint"],
    [
      "compare",
      "    // Remove the outgoing value, then add the incoming value.",
      "Identify the outgoing and incoming values",
    ],
    ["shift", "    sum = sum - a[r-k] + a[r];", "sum = sum - outgoing + incoming"],
    ["update", "    best = Math.max(best, sum);", "Keep the maximum complete window sum"],
    ["close", "  }", "Repeat until the last window"],
    ["done", "  return best;", "Return best"],
    ["end", "}", "End"],
  ],
  run(input, t) {
    const a = input.values,
      k = input.size,
      s = arrayScene(a);
    let sum = 0,
      best: number | null = null,
      shifts = 0;
    t.emit(
      "INITIALIZE",
      "Build the first complete window",
      `Each window contains exactly ${k} values.`,
      s,
      { size: k, sum, best },
      "sum"
    );
    for (let i = 0; i < k; i++) {
      sum += a[i];
      s.active = [i];
      s.range = [0, i];
      s.pointers = { L: 0, R: i };
      t.emit(
        "ADD",
        `Include ${a[i]}`,
        `The partial window sum is ${sum}. It becomes a candidate only after ${k} values.`,
        s,
        { sum, size: k, included: i + 1 },
        "build"
      );
    }
    best = sum;
    s.active = [];
    t.emit(
      "BEST",
      "Record the first candidate",
      `The first complete window sums to ${sum}; initialize best from this value, even if negative.`,
      s,
      { sum, best },
      "best"
    );
    for (let r = k; r < a.length; r++) {
      const outgoing = a[r - k],
        incoming = a[r];
      s.active = [r - k, r];
      t.emit(
        "SHIFT_PENDING",
        `Move the window one place`,
        `The outgoing value is ${outgoing}; the incoming value is ${incoming}.`,
        s,
        { sum, best, outgoing, incoming, L: r - k, R: r - 1 },
        "compare",
        { shifts },
        prediction(
          "How should the sum change?",
          [
            "Subtract outgoing, add incoming",
            "Add outgoing, subtract incoming",
            "Keep the old sum",
          ],
          0,
          "Only the two boundary values change; all interior values remain included.",
          "The left boundary leaves the window and the right boundary enters it."
        )
      );
      sum = sum - outgoing + incoming;
      shifts++;
      s.range = [r - k + 1, r];
      s.pointers = { L: r - k + 1, R: r };
      s.active = [r];
      s.inactive = a.map((_, i) => i).filter((i) => i < r - k + 1);
      t.emit(
        "SHIFT",
        `New sum: ${sum}`,
        `${sum - incoming + outgoing} - (${outgoing}) + (${incoming}) = ${sum}.`,
        s,
        { sum, best, L: r - k + 1, R: r },
        "shift",
        { shifts }
      );
      best = Math.max(best, sum);
      t.emit(
        "BEST",
        `Best so far: ${best}`,
        "Compare this complete window with the previous best.",
        s,
        { sum, best },
        "update",
        { shifts }
      );
    }
    s.active = [];
    t.emit(
      "COMPLETE",
      `Maximum window sum: ${best}`,
      "Every complete window was considered once.",
      s,
      { best, size: k },
      "done",
      { shifts }
    );
    return best;
  },
});
