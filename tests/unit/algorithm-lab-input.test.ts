import { describe, it, expect } from "vitest";
import {
  fieldsFromInput,
  inputFromFields,
} from "@/features/algorithm-lab/components/input-fields";
import { loadAlgorithm } from "@/features/algorithm-lab/registry/registry";
import { ALGORITHMS } from "@/features/algorithm-lab/registry/metadata";
describe("Approachable Lab input", () => {
  it.each(ALGORITHMS.map((a) => a.slug))(
    "preserves every default %s input",
    async (slug) => {
      const algorithm = await loadAlgorithm(slug);
      expect(
        algorithm.validateInput(inputFromFields(fieldsFromInput(algorithm.defaultInput)))
      ).toEqual(algorithm.defaultInput);
    }
  );
  it("parses numeric fields without silently evaluating expressions", async () => {
    const algorithm = await loadAlgorithm("binary-search"),
      fields = fieldsFromInput(algorithm.defaultInput);
    expect(
      algorithm.validateInput(
        inputFromFields({ ...fields, values: "-8, -3, 0, 5", target: "-3" })
      )
    ).toEqual({ kind: "search", values: [-8, -3, 0, 5], target: -3 });
    expect(() =>
      algorithm.validateInput(inputFromFields({ ...fields, values: "1, alert(1), 3" }))
    ).toThrow();
    expect(() => inputFromFields({ ...fields, target: "" })).toThrow("target");
  });
  it("retains tree null slots and traversal order", async () => {
    const algorithm = await loadAlgorithm("tree-dfs"),
      fields = fieldsFromInput(algorithm.defaultInput);
    expect(
      algorithm.validateInput(
        inputFromFields({ ...fields, values: "1, null, 2", order: "inorder" })
      )
    ).toEqual({ kind: "tree", values: [1, null, 2], order: "inorder" });
  });
  it("validates structured edges and optional weights", async () => {
    const algorithm = await loadAlgorithm("bfs"),
      fields = fieldsFromInput(algorithm.defaultInput);
    expect(
      algorithm.validateInput(
        inputFromFields({ ...fields, nodeCount: "3", edges: "0 1 4\n1 2 7" })
      )
    ).toMatchObject({
      edges: [
        [0, 1],
        [1, 2],
      ],
      weights: [4, 7],
    });
    expect(() => inputFromFields({ ...fields, edges: "0 1\n1 2 7" })).toThrow(
      "every edge"
    );
    expect(() => inputFromFields({ ...fields, edges: "0" })).toThrow("Each edge");
  });
  it("preserves indexed operations and rejects ambiguous argument counts", async () => {
    const algorithm = await loadAlgorithm("linked-list"),
      fields = fieldsFromInput(algorithm.defaultInput);
    expect(
      algorithm.generateTrace(
        inputFromFields({
          ...fields,
          operations: "insert 4\ninsert 9\ninsert 2 0\ndelete 1\ntraverse",
        })
      ).result
    ).toEqual([2, 9]);
    expect(() => inputFromFields({ ...fields, operations: "delete" })).toThrow(
      "needs an index"
    );
    expect(() => inputFromFields({ ...fields, operations: "insert 4 1 2" })).toThrow(
      "optional index"
    );
    expect(() => inputFromFields({ ...fields, operations: "traverse 4" })).toThrow(
      "takes no value"
    );
  });
});
