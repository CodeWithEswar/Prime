"use client";
import { useState } from "react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { RefreshIcon, ShuffleIcon } from "@hugeicons/core-free-icons";
import { LabControl } from "./lab-control";
import { inputError, parseInputJSON, seededValues } from "../engine/input";
import type { AlgorithmModule } from "../engine/types";
import { LabInputFields, fieldsFromInput, inputFromFields } from "./input-fields";
export function InputEditor({
  module,
  input,
  onApply,
  onClose,
}: {
  module: AlgorithmModule;
  input: unknown;
  onApply: (input: unknown) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState(JSON.stringify(input, null, 2)),
    [fields, setFields] = useState(() => fieldsFromInput(input)),
    [jsonMode, setJSONMode] = useState(false),
    [error, setError] = useState(""),
    [seed, setSeed] = useState(42);
  function preset(value: unknown) {
    setFields(fieldsFromInput(value));
    setText(JSON.stringify(value, null, 2));
    setError("");
  }
  function sortValues() {
    try {
      const raw = jsonMode ? parseInputJSON(text) : inputFromFields(fields);
      if (
        raw &&
        typeof raw === "object" &&
        "values" in raw &&
        Array.isArray(raw.values) &&
        raw.values.every((v) => typeof v === "number")
      )
        preset({ ...raw, values: [...raw.values].sort((a, b) => a - b) });
      else throw new Error("Use an input with a numeric values array.");
    } catch (e) {
      setError(inputError(e));
    }
  }
  const defaults = module.defaultInput as { kind: string };
  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent side="bottom" className="lab-input-sheet">
        <SheetTitle>Custom input</SheetTitle>
        <SheetDescription>
          Apply data to generate a fresh, reproducible trace. Existing PRIME progress is
          unaffected.
        </SheetDescription>
        <div className="lab-input-presets">
          <LabControl icon={RefreshIcon} onClick={() => preset(module.defaultInput)}>
            Example
          </LabControl>
          {module.examples.map((example) => (
            <LabControl key={example.name} onClick={() => preset(example.input)}>
              {example.name}
            </LabControl>
          ))}
          {["search", "sort", "window"].includes(defaults.kind) && (
            <>
              <label className="lab-seed">
                Seed
                <input
                  aria-label="Random seed"
                  type="number"
                  min="0"
                  max="999999"
                  value={seed}
                  onChange={(e) =>
                    setSeed(Math.max(0, Math.min(999999, Number(e.target.value) || 0)))
                  }
                />
              </label>
              <LabControl
                icon={ShuffleIcon}
                onClick={() => {
                  const raw = module.defaultInput as {
                    kind: string;
                    target?: number;
                    size?: number;
                  };
                  const values = seededValues(seed);
                  if (["binary-search", "two-pointers"].includes(module.id))
                    values.sort((a, b) => a - b);
                  preset({ ...raw, values });
                }}
              >
                Seeded random
              </LabControl>
            </>
          )}
          {["binary-search", "two-pointers"].includes(module.id) && (
            <LabControl onClick={sortValues}>Sort values explicitly</LabControl>
          )}
        </div>
        <p className="lab-input-help">
          {defaults.kind === "graph"
            ? "Node IDs: 0 to nodeCount − 1. Edges are [from, to]. Optional weights: one integer per edge. Up to 12 nodes and 28 edges; neighbors visit in ascending order. Weights are annotations; BFS/DFS do not compute weighted shortest paths."
            : defaults.kind === "tree"
              ? "Heap-position slots: children of i are 2i+1 and 2i+2. Use null for missing nodes. Up to 15 nodes / 31 slots. DFS order: preorder, inorder or postorder."
              : defaults.kind === "operations"
                ? "Up to 32 operations. Stack: push(value), pop, peek. Queue: enqueue(value), dequeue, front. List: insert(value, optional index), delete(index), search(value), traverse. Indices start at 0."
                : "Up to 32 integers, each between −999 and 999. Binary Search and Two Pointers require nondecreasing order. No automatic input sorting."}
        </p>
        <LabControl
          aria-pressed={jsonMode}
          onClick={() => {
            try {
              if (jsonMode) setFields(fieldsFromInput(parseInputJSON(text)));
              else setText(JSON.stringify(inputFromFields(fields), null, 2));
              setJSONMode(!jsonMode);
              setError("");
            } catch (e) {
              setError(inputError(e));
            }
          }}
        >
          {jsonMode ? "Use simple fields" : "Advanced JSON"}
        </LabControl>
        {jsonMode ? (
          <>
            <label htmlFor="lab-input-json" className="lab-overline">
              INPUT / JSON
            </label>
            <textarea
              id="lab-input-json"
              spellCheck={false}
              value={text}
              maxLength={12001}
              onChange={(e) => setText(e.target.value)}
              aria-describedby={error ? "lab-input-error" : "lab-input-limit"}
            />
            <p id="lab-input-limit" className="lab-muted">
              Input is data. JavaScript expressions and executable code are not accepted.
            </p>
          </>
        ) : (
          <LabInputFields value={fields} onChange={setFields} />
        )}
        {error && (
          <p role="alert" id="lab-input-error">
            {error}
          </p>
        )}
        <div className="lab-input-footer">
          <LabControl onClick={() => preset(input)}>Reset edits</LabControl>
          <LabControl
            variant="primary"
            onClick={() => {
              try {
                const parsed = module.validateInput(
                  jsonMode ? parseInputJSON(text) : inputFromFields(fields)
                );
                onApply(parsed);
                onClose();
              } catch (e) {
                setError(inputError(e));
              }
            }}
          >
            Generate trace
          </LabControl>
        </div>
      </SheetContent>
    </Sheet>
  );
}
