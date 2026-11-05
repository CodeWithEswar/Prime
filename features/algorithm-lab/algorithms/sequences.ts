import { defineAlgorithm } from "./define";
import { operationInput } from "../engine/input";
import { prediction } from "../engine/trace";
import type { SequenceScene } from "../engine/types";
function operationsFor(kind: "stack" | "queue" | "linked-list", raw: unknown) {
  const input = operationInput.parse(raw),
    allowed =
      kind === "stack"
        ? ["push", "pop", "peek"]
        : kind === "queue"
          ? ["enqueue", "dequeue", "front"]
          : ["insert", "delete", "search", "traverse"];
  input.operations.forEach((op, i) => {
    if (!allowed.includes(op.type))
      throw new Error(
        `Operation ${i + 1}: use ${allowed.join(", ")} for this structure.`
      );
    if (
      ["push", "enqueue", "insert", "search"].includes(op.type) &&
      op.value === undefined
    )
      throw new Error(`Operation ${i + 1} needs a value.`);
    if (op.type === "delete" && op.index === undefined)
      throw new Error(`Delete operation ${i + 1} needs an index.`);
  });
  return input;
}
function sequence(kind: "stack" | "queue") {
  const isStack = kind === "stack",
    add = isStack ? "push" : "enqueue",
    remove = isStack ? "pop" : "dequeue",
    read = isStack ? "peek" : "front";
  return defineAlgorithm({
    id: kind,
    defaultInput: {
      kind: "operations" as const,
      operations: [
        { type: add, value: 4 },
        { type: add, value: 9 },
        { type: read },
        { type: remove },
        { type: add, value: 2 },
      ],
    },
    parse: (raw) => operationsFor(kind, raw),
    complexity: {
      time: "O(1) amortized per operation",
      space: "O(n)",
      reason: isStack
        ? "A deque-backed stack changes or reads only its top. ArrayDeque insertions are amortized O(1); occasional resizing costs O(n). Stored values need O(n) space."
        : "A deque-backed queue changes only its head or tail. ArrayDeque insertions are amortized O(1); occasional resizing costs O(n). Stored values need O(n) space.",
    },
    invariant: isStack
      ? "The most recently pushed remaining value is at the top."
      : "The earliest enqueued remaining value is at the front.",
    objectives: [
      isStack
        ? "Predict last-in, first-out removal."
        : "Predict first-in, first-out removal.",
      "Distinguish reading a value from removing it; recognize an empty structure.",
    ],
    code: [
      [
        "init",
        "Deque<Integer> values = new ArrayDeque<>();",
        "Start with an empty structure",
      ],
      [
        "operation-loop",
        "for (Operation op : operations) {",
        "Apply each selected operation in order",
      ],
      [
        "check",
        "  switch (op.type()) {",
        "Choose the requested operation; reads and removals are alternatives",
      ],
      [
        "add",
        `    case "${add}" -> values.addLast(op.value());`,
        `Add value at the ${isStack ? "top" : "rear"}`,
      ],
      [
        "read",
        isStack
          ? '    case "peek" -> { Integer result = values.peekLast(); }'
          : '    case "front" -> { Integer result = values.peekFirst(); }',
        `Read the ${isStack ? "top" : "front"} without removing it`,
      ],
      [
        "remove",
        isStack
          ? '    case "pop" -> { Integer result = values.pollLast(); }'
          : '    case "dequeue" -> { Integer result = values.pollFirst(); }',
        `Remove the ${isStack ? "top" : "front"}`,
      ],
      ["close", "  }", "End the selected operation (empty reads/removals return null)"],
      ["done", "}", "Keep the remaining order"],
    ],
    run(input, t) {
      const s: SequenceScene = { kind, cells: [], active: [] };
      let count = 0;
      t.emit(
        "INITIALIZE",
        `An empty ${kind}`,
        isStack
          ? "Push and pop use the same end."
          : "Values join at the rear and leave from the front.",
        s,
        { size: 0 },
        "init"
      );
      for (const [i, op] of input.operations.entries()) {
        const index = isStack ? s.cells.length - 1 : 0,
          expected = s.cells[index]?.value ?? null;
        if (op.type === add) {
          s.active = [];
          t.emit(
            "ADD_PENDING",
            `${add} ${op.value}`,
            "The new value joins without removing existing values.",
            s,
            { size: s.cells.length, value: op.value! },
            "add",
            { operations: count },
            prediction(
              "Where does this value enter?",
              ["At the front", "At the rear / top"],
              1,
              isStack
                ? "Push appends to the top of the stack."
                : "Enqueue appends at the rear; the existing front stays first.",
              "Think about which end is used for insertion."
            )
          );
          s.cells.push({ id: `node-${i}`, value: op.value! });
          s.active = [s.cells.length - 1];
          count++;
          t.emit(
            "ADD",
            `${op.value} joins the ${isStack ? "top" : "rear"}`,
            "Existing values retain their order.",
            s,
            { size: s.cells.length },
            "add",
            { operations: count }
          );
        } else {
          s.active = expected === null ? [] : [index];
          const labels = Array.from(
            new Set([
              expected === null ? "Empty" : String(expected),
              ...s.cells.map((c) => String(c.value)),
              "Empty",
              "A new value",
            ])
          ).slice(0, 4);
          if (i % 2 === 0) labels.reverse();
          const correct = labels.indexOf(expected === null ? "Empty" : String(expected));
          t.emit(
            "READ_PENDING",
            `${op.type}: inspect the ${isStack ? "top" : "front"}`,
            "Predict the returned value before applying the operation.",
            s,
            { size: s.cells.length },
            "check",
            { operations: count },
            prediction(
              `What does ${op.type} return?`,
              labels,
              correct,
              expected === null
                ? "An empty structure has no value to return."
                : `${expected} is at the ${isStack ? "top, because it arrived last" : "front, because it arrived first"}.`,
              isStack
                ? "Look at the last remaining insertion."
                : "Look at the earliest remaining insertion."
            )
          );
          if (expected === null) {
            count++;
            t.emit(
              "EMPTY",
              "No value is available",
              "The empty check prevents an invalid removal. State stays empty.",
              s,
              { returned: null, size: 0 },
              "check",
              { operations: count }
            );
            continue;
          }
          if (op.type === remove) {
            s.cells.splice(index, 1);
            s.active = [];
          }
          count++;
          t.emit(
            op.type.toUpperCase(),
            `${op.type} returns ${expected}`,
            op.type === remove
              ? "The selected value is removed; the others keep their relative order."
              : "Reading does not change the structure.",
            s,
            { returned: expected, size: s.cells.length },
            op.type === remove ? "remove" : "read",
            { operations: count }
          );
        }
      }
      s.active = [];
      t.emit(
        "COMPLETE",
        "Operation sequence complete",
        "These are the values still stored, in insertion order from front/bottom to rear/top.",
        s,
        { size: s.cells.length },
        "done",
        { operations: count }
      );
      return s.cells.map((c) => c.value);
    },
  });
}
export const stack = sequence("stack");
export const queue = sequence("queue");
export const linkedList = defineAlgorithm({
  id: "linked-list",
  defaultInput: {
    kind: "operations" as const,
    operations: [
      { type: "insert", value: 4 },
      { type: "insert", value: 9 },
      { type: "insert", value: 2, index: 1 },
      { type: "search", value: 9 },
      { type: "delete", index: 1 },
      { type: "traverse" },
    ],
  },
  parse: (raw) => operationsFor("linked-list", raw),
  complexity: {
    time: "O(n) search / indexed update",
    space: "O(n)",
    reason:
      "Finding an indexed predecessor or matching value may visit every node. Once located, changing one link is O(1). Stored nodes use O(n).",
  },
  invariant:
    "Following next from head visits each remaining node exactly once and ends at null.",
  objectives: [
    "Distinguish index lookup from constant-time relinking.",
    "Handle head insertion/deletion and preserve the rest of the chain.",
  ],
  code: [
    [
      "init",
      "class Node { int value; Node next; Node(int v) { value = v; } }",
      "A node stores a value and a next link",
    ],
    ["helper", "Node at(Node head, int index) {", "Find an indexed predecessor"],
    [
      "walk",
      "  for (int i = 0; i < index; i++) head = head.next;",
      "Follow next until the requested index",
    ],
    ["helper-return", "  return head;", "Return this node"],
    ["helper-end", "}", "End lookup"],
    [
      "insert",
      "Node insert(Node head, int index, int value) {",
      "Insert at a validated index in [0, size]",
    ],
    ["new", "  Node node = new Node(value);", "Create a new node"],
    [
      "insert-head",
      "  if (index == 0) { node.next = head; return node; }",
      "At index 0, link the new node to the old head",
    ],
    [
      "predecessor",
      "  Node prev = at(head, index - 1);",
      "Otherwise find the predecessor",
    ],
    [
      "insert-next",
      "  node.next = prev.next; prev.next = node;",
      "Splice the new node after its predecessor",
    ],
    ["insert-return", "  return head;", "Keep the existing head"],
    ["insert-end", "}", "End insertion"],
    [
      "delete",
      "Node delete(Node head, int index) {",
      "Delete a validated index in [0, size - 1]",
    ],
    [
      "delete-head",
      "  if (index == 0) return head.next;",
      "At index 0, advance head to its next node",
    ],
    [
      "delete-prev",
      "  Node prev = at(head, index - 1);",
      "Otherwise find the predecessor",
    ],
    ["delete-next", "  prev.next = prev.next.next;", "Bypass the removed node"],
    ["delete-return", "  return head;", "Keep the existing head"],
    ["delete-end", "}", "End deletion"],
    [
      "search",
      "int find(Node head, int target) {",
      "Search for the first matching value",
    ],
    [
      "traverse",
      "  int index = 0; for (Node n = head; n != null; n = n.next, index++) {",
      "Visit each node by following next",
    ],
    [
      "compare",
      "    if (n.value == target) return index;",
      "Return this index if the value matches",
    ],
    ["advance", "  }", "Continue to next"],
    ["missing", "  return -1;", "No match found"],
    ["done", "}", "End"],
  ],
  run(input, t) {
    const s: SequenceScene = { kind: "linked-list", cells: [], active: [] };
    let visits = 0;
    t.emit(
      "INITIALIZE",
      "Start from head = null",
      "An empty list contains no nodes. Inserts create links; deletes bypass nodes.",
      s,
      { head: null, size: 0 },
      "init"
    );
    for (const [opIndex, op] of input.operations.entries()) {
      if (op.type === "insert" || op.type === "delete") {
        const index = op.index ?? s.cells.length,
          insert = op.type === "insert";
        if (index > (insert ? s.cells.length : s.cells.length - 1))
          throw new Error(
            `Operation ${opIndex + 1}: index ${index} is outside this list (size ${s.cells.length}).`
          );
        for (let j = 0; j < index; j++) {
          s.active = [j];
          visits++;
          t.emit(
            "FOLLOW_LINK",
            `Find predecessor: index ${j}`,
            "Indexed access requires following next links; it is not constant-time random access.",
            s,
            { index: j, value: s.cells[j].value },
            "walk",
            { visits }
          );
        }
        t.emit(
          "RELINK_PENDING",
          `${op.type} at index ${index}`,
          index === 0
            ? "This operation changes head."
            : "The predecessor is located. Now update the next link.",
          s,
          { index, size: s.cells.length },
          insert ? "new" : "delete",
          { visits },
          prediction(
            "Which structural change is needed?",
            ["Change head", "Relink the predecessor's next"],
            index === 0 ? 0 : 1,
            index === 0
              ? "Index zero is the head, so no predecessor exists."
              : "A non-head update preserves head and changes the predecessor's next link.",
            "Check whether the requested index is zero."
          )
        );
        if (insert) {
          s.cells.splice(index, 0, { id: `node-${opIndex}`, value: op.value! });
          s.active = [index];
        } else {
          s.cells.splice(index, 1);
          s.active = [];
        }
        t.emit(
          "RELINK",
          `${insert ? "Inserted" : "Deleted"} node at ${index}`,
          insert
            ? "The new node points to its successor, and head/predecessor now points to it."
            : "Head/predecessor bypasses the removed node. All remaining next links still form one chain.",
          s,
          { size: s.cells.length, head: s.cells[0]?.value ?? null },
          insert
            ? index === 0
              ? "insert-head"
              : "insert-next"
            : index === 0
              ? "delete-head"
              : "delete-next",
          { visits }
        );
      } else {
        let result = -1;
        for (let j = 0; j < s.cells.length; j++) {
          s.active = [j];
          visits++;
          t.emit(
            "VISIT",
            `Visit index ${j}`,
            `Following links reaches value ${s.cells[j].value}.`,
            s,
            {
              index: j,
              value: s.cells[j].value,
              ...(op.value !== undefined ? { target: op.value } : {}),
            },
            "traverse",
            { visits }
          );
          if (op.type === "search" && s.cells[j].value === op.value) {
            result = j;
            break;
          }
        }
        s.active = result >= 0 ? [result] : [];
        t.emit(
          op.type === "search" ? "SEARCH_RESULT" : "TRAVERSED",
          op.type === "search" ? `Search result: ${result}` : "Reached null",
          op.type === "search"
            ? result >= 0
              ? "The first matching node was found."
              : "All reachable nodes were checked; no match exists."
            : "Traversal stops at the null link after the last node.",
          s,
          { result: op.type === "search" ? result : s.cells.map((c) => c.value) },
          result >= 0 ? "compare" : "missing",
          { visits }
        );
      }
    }
    s.active = [];
    t.emit(
      "COMPLETE",
      "List operations complete",
      "Follow the next links from head to inspect the final order.",
      s,
      { size: s.cells.length },
      "done",
      { visits }
    );
    return s.cells.map((c) => c.value);
  },
});
