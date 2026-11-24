import { describe, it, expect } from "vitest";
import { VISPATH_NODES, VISPATH_EDGES } from "@/features/vispath/data/roadmap-nodes";
import { AVAILABLE_NAVIGATION_ITEMS } from "@/components/shell/navigation-config";

describe("VisPath Roadmap Canvas & Hive Integration Tests", () => {
  it("registers /vispath in shell navigation under prepare with correct attributes", () => {
    const vispathNav = AVAILABLE_NAVIGATION_ITEMS.find((item) => item.id === "vispath");
    expect(vispathNav).toBeDefined();
    expect(vispathNav?.label).toBe("VisPath");
    expect(vispathNav?.href).toBe("/vispath");
    expect(vispathNav?.group).toBe("prepare");
    expect(vispathNav?.matchPrefixes).toContain("/vispath");
  });

  it("contains 16 interconnected nodes across 3 strategic engineering tracks", () => {
    expect(VISPATH_NODES).toHaveLength(16);

    const deNodes = VISPATH_NODES.filter((n) => n.track === "data-engineering");
    const csNodes = VISPATH_NODES.filter((n) => n.track === "cs-fundamentals");
    const dsaNodes = VISPATH_NODES.filter((n) => n.track === "dsa");

    expect(deNodes).toHaveLength(8);
    expect(csNodes).toHaveLength(4);
    expect(dsaNodes).toHaveLength(4);
  });

  it("ensures every node has unique IDs and valid geometric coordinates", () => {
    const seenIds = new Set<string>();

    for (const node of VISPATH_NODES) {
      expect(seenIds.has(node.id)).toBe(false);
      seenIds.add(node.id);

      expect(node.title.trim().length).toBeGreaterThan(0);
      expect(node.subtitle.trim().length).toBeGreaterThan(0);
      expect(typeof node.x).toBe("number");
      expect(typeof node.y).toBe("number");
      expect(node.radius).toBeGreaterThan(20);
      expect(node.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(node.glowColor).toContain("rgba");
      expect(node.subtopics.length).toBeGreaterThan(0);
      expect(node.tools.length).toBeGreaterThan(0);
      expect(node.description.length).toBeGreaterThan(20);
      expect(node.estimatedHours).toBeGreaterThan(0);
      expect(["Beginner", "Intermediate", "Advanced"]).toContain(node.difficulty);
      expect(["completed", "in_progress", "available", "locked"]).toContain(node.status);
      expect(node.href.startsWith("/")).toBe(true);
    }
  });

  it("validates that all edges form a connected hive network without broken references", () => {
    const nodeMap = new Map(VISPATH_NODES.map((n) => [n.id, n]));
    const edgeIds = new Set<string>();

    expect(VISPATH_EDGES.length).toBeGreaterThanOrEqual(18);

    for (const edge of VISPATH_EDGES) {
      expect(edgeIds.has(edge.id)).toBe(false);
      edgeIds.add(edge.id);

      // Verify source and target exist
      expect(nodeMap.has(edge.from)).toBe(true);
      expect(nodeMap.has(edge.to)).toBe(true);
      expect(edge.from).not.toBe(edge.to);

      // Verify track classification
      expect(["data-engineering", "cs-fundamentals", "dsa"]).toContain(edge.track);
    }

    // Verify cross-track synaptic connections
    const crossTrackEdges = VISPATH_EDGES.filter((edge) => {
      const fromNode = nodeMap.get(edge.from)!;
      const toNode = nodeMap.get(edge.to)!;
      return fromNode.track !== toNode.track;
    });

    expect(crossTrackEdges.length).toBeGreaterThanOrEqual(5);
  });

  it("exports React Flow Figma-style canvas, custom node, edge, toolbar, and inspector", async () => {
    const vispathModule = await import("@/features/vispath");
    expect(typeof vispathModule.VisPathWorkspace).toBe("function");
    expect(typeof vispathModule.VisPathFlow).toBe("function");
    expect(typeof vispathModule.FigmaNode).toBe("object"); // memoized component
    expect(typeof vispathModule.FigmaEdge).toBe("object"); // memoized component
    expect(typeof vispathModule.FigmaToolbar).toBe("function");
    expect(typeof vispathModule.FigmaInspector).toBe("function");
  });
});
