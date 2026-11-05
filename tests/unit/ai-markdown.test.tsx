import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import MarkdownRenderer, { safeAILink } from "@/features/ai/components/markdown-renderer";
describe("AI Markdown renderer", () => {
  it("renders GFM tables, nested lists, code and safe external links", () => {
    render(
      <MarkdownRenderer
        content={
          "## Invariant\n\n**Keep** `left <= right`.\n\n- Outer\n  - Inner\n\n| Case | Cost |\n|---|---|\n| Search | O(log n) |\n\n```java\nint middle = left + (right - left) / 2;\n```\n\n[Reference](https://example.com/docs)"
        }
      />
    );
    expect(screen.getByRole("heading", { name: "Invariant" })).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy code" })).toBeInTheDocument();
    expect(screen.getByText("Inner")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Reference" })).toHaveAttribute(
      "rel",
      "noopener noreferrer"
    );
  });
  it("does not execute raw HTML or load model images", () => {
    const { container } = render(
      <MarkdownRenderer
        content={
          '<script>alert(1)</script>\n\n<img src=x onerror="alert(1)">\n\n![track](https://evil.example/track)\n\n[bad](javascript:alert%281%29)'
        }
      />
    );
    expect(container.querySelector("script,img,iframe")).toBeNull();
    expect(container.querySelector('a[href^="javascript"]')).toBeNull();
  });
  it("rejects unsafe protocols and accepts canonical internal routes", () => {
    expect(safeAILink("javascript:alert(1)")).toBe("");
    expect(safeAILink("data:text/html,x")).toBe("");
    expect(safeAILink("//evil.example")).toBe("");
    expect(safeAILink("/practice/dsa/two-sum")).toBe("/practice/dsa/two-sum");
  });
});
