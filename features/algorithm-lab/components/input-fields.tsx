"use client";
import type { LabInput } from "../engine/input";
import { labInputSchema } from "../engine/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
export type InputFields = {
  kind: LabInput["kind"];
  values: string;
  target: string;
  size: string;
  nodeCount: string;
  source: string;
  directed: boolean;
  edges: string;
  operations: string;
  order: "preorder" | "inorder" | "postorder";
};
export function fieldsFromInput(raw: unknown): InputFields {
  const input = labInputSchema.parse(raw),
    fields: InputFields = {
      kind: input.kind,
      values: "",
      target: "",
      size: "",
      nodeCount: "",
      source: "",
      directed: false,
      edges: "",
      operations: "",
      order: "preorder",
    };
  if ("values" in input)
    fields.values = input.values.map((v) => (v === null ? "null" : String(v))).join(", ");
  if (input.kind === "search") fields.target = String(input.target);
  if (input.kind === "window") fields.size = String(input.size);
  if (input.kind === "tree") fields.order = input.order;
  if (input.kind === "graph") {
    fields.nodeCount = String(input.nodeCount);
    fields.source = String(input.source);
    fields.directed = input.directed;
    fields.edges = input.edges
      .map((edge, i) => [...edge, ...(input.weights ? [input.weights[i]] : [])].join(" "))
      .join("\n");
  }
  if (input.kind === "operations")
    fields.operations = input.operations
      .map((op) =>
        [
          op.type,
          ...(op.value !== undefined ? [op.value] : []),
          ...(op.index !== undefined ? [op.index] : []),
        ].join(" ")
      )
      .join("\n");
  return fields;
}
function number(text: string, label: string) {
  if (!text.trim()) throw new Error(`Enter ${label}.`);
  return Number(text);
}
export function inputFromFields(fields: InputFields): unknown {
  const tokens = fields.values
    .trim()
    .replace(/^\[([\s\S]*)\]$/, "$1")
    .trim();
  const values = tokens
    ? tokens
        .split(/[,\s]+/)
        .map((v) =>
          fields.kind === "tree" && v.toLowerCase() === "null" ? null : Number(v)
        )
    : [];
  switch (fields.kind) {
    case "search":
      return { kind: "search", values, target: number(fields.target, "a target") };
    case "sort":
      return { kind: "sort", values };
    case "window":
      return { kind: "window", values, size: number(fields.size, "a window size") };
    case "tree":
      return { kind: "tree", values, order: fields.order };
    case "graph": {
      const rows = fields.edges
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => line.split(/[,\s]+/));
      if (rows.some((row) => row.length < 2 || row.length > 3))
        throw new Error("Each edge needs: from to, with an optional weight.");
      if (rows.some((row) => row.length === 3) && rows.some((row) => row.length !== 3))
        throw new Error("Use a weight on every edge, or omit all weights.");
      return {
        kind: "graph",
        nodeCount: number(fields.nodeCount, "a node count"),
        source: number(fields.source, "a source node"),
        directed: fields.directed,
        edges: rows.map((row) => [Number(row[0]), Number(row[1])]),
        ...(rows.some((row) => row.length === 3)
          ? { weights: rows.map((row) => Number(row[2])) }
          : {}),
      };
    }
    case "operations": {
      const operations = fields.operations
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line, i) => {
          const [type, ...args] = line.split(/[,\s]+/);
          if (["push", "enqueue", "insert", "search"].includes(type)) {
            if (args.length < 1 || args.length > (type === "insert" ? 2 : 1))
              throw new Error(
                `Line ${i + 1}: ${type} needs a value${type === "insert" ? " and optional index" : ""}.`
              );
            return {
              type,
              value: Number(args[0]),
              ...(args[1] !== undefined ? { index: Number(args[1]) } : {}),
            };
          }
          if (type === "delete") {
            if (args.length !== 1)
              throw new Error(`Line ${i + 1}: delete needs an index.`);
            return { type, index: Number(args[0]) };
          }
          if (args.length) throw new Error(`Line ${i + 1}: ${type} takes no value.`);
          return { type };
        });
      return { kind: "operations", operations };
    }
  }
}
export function LabInputFields({
  value,
  onChange,
}: {
  value: InputFields;
  onChange: (value: InputFields) => void;
}) {
  const set = (key: keyof InputFields, text: string | boolean) =>
    onChange({ ...value, [key]: text });
  return (
    <div className="lab-input-fields">
      {["search", "sort", "window", "tree"].includes(value.kind) && (
        <label className="lab-field-wide">
          {value.kind === "tree" ? "Tree values" : "Array values"}
          <textarea
            aria-label={value.kind === "tree" ? "Tree values" : "Array values"}
            className="lab-values-input"
            value={value.values}
            maxLength={2048}
            spellCheck={false}
            onChange={(e) => set("values", e.target.value)}
          />
          <small>
            {value.kind === "tree"
              ? "Level-order heap slots; use null for an absent node."
              : "Comma-separated integers. The order you enter is the order we execute."}
          </small>
        </label>
      )}
      {value.kind === "search" && (
        <label>
          Target
          <input
            type="number"
            value={value.target}
            onChange={(e) => set("target", e.target.value)}
          />
        </label>
      )}
      {value.kind === "window" && (
        <label>
          Window size
          <input
            type="number"
            min="1"
            max="32"
            value={value.size}
            onChange={(e) => set("size", e.target.value)}
          />
        </label>
      )}
      {value.kind === "tree" && (
        <label>
          DFS traversal order
          <Select value={value.order} onValueChange={(order) => set("order", order)}>
            <SelectTrigger aria-label="DFS traversal order">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["preorder", "inorder", "postorder"].map((order) => (
                <SelectItem key={order} value={order}>
                  {order}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      )}
      {value.kind === "graph" && (
        <>
          <label>
            Number of nodes
            <input
              type="number"
              min="1"
              max="12"
              value={value.nodeCount}
              onChange={(e) => set("nodeCount", e.target.value)}
            />
          </label>
          <label>
            Source node
            <input
              type="number"
              min="0"
              max="11"
              value={value.source}
              onChange={(e) => set("source", e.target.value)}
            />
          </label>
          <label className="lab-field-wide lab-directed">
            <input
              type="checkbox"
              checked={value.directed}
              onChange={(e) => set("directed", e.target.checked)}
            />
            Directed edges
          </label>
          <label className="lab-field-wide">
            Edges
            <textarea
              aria-label="Edges"
              value={value.edges}
              maxLength={4096}
              spellCheck={false}
              onChange={(e) => set("edges", e.target.value)}
            />
            <small>
              One edge per line: from to. Add a third number for a weight on every edge.
            </small>
          </label>
        </>
      )}
      {value.kind === "operations" && (
        <label className="lab-field-wide">
          Operations
          <textarea
            aria-label="Operations"
            value={value.operations}
            maxLength={4096}
            spellCheck={false}
            onChange={(e) => set("operations", e.target.value)}
          />
          <small>
            One operation per line. Examples: push 4; enqueue 9; insert 5 0; delete 0. Use
            only the operations listed above for this structure.
          </small>
        </label>
      )}
    </div>
  );
}
