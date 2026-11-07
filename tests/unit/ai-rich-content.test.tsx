import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { RichContentRenderer } from "@/features/ai/rich-content/rich-content-renderer";
import { RichComplexity } from "@/features/ai/rich-content/learning/rich-complexity";
import { RichSteps } from "@/features/ai/rich-content/learning/rich-steps";
import { RichComparison } from "@/features/ai/rich-content/learning/rich-comparison";

describe("PRIME Rich Content Engine & MDX Presentation", () => {
  describe("Intelligent Adaptive Tables", () => {
    const tableMarkdown = `
| Algorithm | Best | Worst | Space |
| --- | --- | --- | --- |
| Binary Search | O(1) | O(log n) | O(1) |
| Linear Search | O(1) | O(n) | O(1) |
`;

    it("renders in Table mode on desktop workspace with sort and export controls", async () => {
      render(<RichContentRenderer content={tableMarkdown} mode="workspace" />);

      // Verify desktop table markup
      expect(screen.getByRole("table")).toBeInTheDocument();
      expect(screen.getByText("Binary Search")).toBeInTheDocument();
      expect(screen.getByText("Linear Search")).toBeInTheDocument();

      // Verify toolbar controls
      expect(screen.getByRole("button", { name: /^records$/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^table$/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /copy table/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /export table as csv/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /expand table to modal/i })).toBeInTheDocument();
    });

    it("defaults to compact stacked records in side-chat panel mode", () => {
      render(<RichContentRenderer content={tableMarkdown} mode="panel" />);

      // In panel mode, visual representation is stacked record articles
      const recordsBtn = screen.getByRole("button", { name: /^records$/i });
      expect(recordsBtn).toHaveAttribute("aria-pressed", "true");

      // Verify card headers and attributes
      expect(screen.getByRole("heading", { name: "Binary Search" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Linear Search" })).toBeInTheDocument();
      expect(screen.getAllByText(/best/i).length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByText(/worst/i).length).toBeGreaterThanOrEqual(2);
    });

    it("allows user to toggle between Records and Table views on demand", () => {
      render(<RichContentRenderer content={tableMarkdown} mode="workspace" />);

      const recordsBtn = screen.getByRole("button", { name: /^records$/i });
      const tableBtn = screen.getByRole("button", { name: /^table$/i });

      // Click Records
      fireEvent.click(recordsBtn);
      expect(recordsBtn).toHaveAttribute("aria-pressed", "true");

      // Click Table
      fireEvent.click(tableBtn);
      expect(tableBtn).toHaveAttribute("aria-pressed", "true");
    });

    it("exports CSV file on export button click", () => {
      const appendSpy = vi.spyOn(document.body, "appendChild");
      const removeSpy = vi.spyOn(document.body, "removeChild");

      render(<RichContentRenderer content={tableMarkdown} mode="workspace" />);

      const exportBtn = screen.getByRole("button", { name: /export table as csv/i });
      fireEvent.click(exportBtn);

      expect(appendSpy).toHaveBeenCalled();
      expect(removeSpy).toHaveBeenCalled();

      appendSpy.mockRestore();
      removeSpy.mockRestore();
    });

    it("copies table markdown to clipboard", async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText },
      });

      render(<RichContentRenderer content={tableMarkdown} mode="workspace" />);

      const copyBtn = screen.getByRole("button", { name: /copy table/i });
      fireEvent.click(copyBtn);

      await waitFor(() => {
        expect(writeText).toHaveBeenCalled();
      });
    });

    it("opens full-screen expand dialog modal on expand click", async () => {
      render(<RichContentRenderer content={tableMarkdown} mode="workspace" />);

      const expandBtn = screen.getByRole("button", { name: /expand table to modal/i });
      fireEvent.click(expandBtn);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText(/Table Analysis/i)).toBeInTheDocument();
    });
  });

  describe("Semantic Callouts & GitHub Alerts", () => {
    it("renders Note, Tip, Warning, and Important callouts with semantic accents", () => {
      const calloutMarkdown = `
> [!NOTE]
> This is a crucial foundational concept.

> [!TIP]
> Keep the search interval inclusive to prevent off-by-one errors.

> [!WARNING]
> Integer overflow can occur with mid = (left + right) / 2.

> [!IMPORTANT]
> The array must be sorted before binary search.
`;

      render(<RichContentRenderer content={calloutMarkdown} />);

      expect(screen.getByRole("note", { name: /note callout/i })).toBeInTheDocument();
      expect(screen.getByRole("note", { name: /tip callout/i })).toBeInTheDocument();
      expect(screen.getByRole("note", { name: /warning callout/i })).toBeInTheDocument();
      expect(screen.getByRole("note", { name: /important callout/i })).toBeInTheDocument();

      expect(screen.getByText(/This is a crucial foundational concept/i)).toBeInTheDocument();
      expect(screen.getByText(/Integer overflow can occur/i)).toBeInTheDocument();
    });
  });

  describe("Mathematics with KaTeX", () => {
    it("renders inline and block LaTeX formulas safely", () => {
      const mathMarkdown = `
The time complexity is $O(\\log n)$.

$$
T(n) = 2T(n/2) + O(n)
$$
`;

      const { container } = render(<RichContentRenderer content={mathMarkdown} />);

      // KaTeX classes
      expect(container.querySelector(".katex")).not.toBeNull();
      expect(container.querySelector(".katex-display")).not.toBeNull();
    });
  });

  describe("Educational Learning Components", () => {
    it("renders RichComplexity card with semantic badges", () => {
      render(
        <RichComplexity
          time="O(log n)"
          space="O(1)"
          best="O(1)"
          worst="O(log n)"
          explanation="Each step discards half of the candidate space."
        />
      );

      expect(screen.getByText("Computational Complexity")).toBeInTheDocument();
      expect(screen.getAllByText("O(log n)").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("O(1)").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Each step discards half/i)).toBeInTheDocument();
    });

    it("renders RichSteps interactive stepper with navigation", () => {
      const steps = [
        { title: "Define Search Boundaries", detail: "Set left = 0 and right = n - 1" },
        { title: "Find Midpoint", detail: "mid = left + (right - left) / 2" },
        { title: "Compare with Target", detail: "Adjust boundaries according to comparison" },
      ];

      render(<RichSteps steps={steps} />);

      expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
      expect(screen.getByText("Define Search Boundaries")).toBeInTheDocument();

      // Click Next
      fireEvent.click(screen.getByRole("button", { name: /next/i }));
      expect(screen.getByText("Step 2 of 3")).toBeInTheDocument();
      expect(screen.getByText("Find Midpoint")).toBeInTheDocument();

      // Toggle View All
      fireEvent.click(screen.getByText("View All"));
      expect(screen.getByText("Compare with Target")).toBeInTheDocument();
    });

    it("renders RichComparison side-by-side entities", () => {
      render(
        <RichComparison
          entityA={{ name: "Binary Search", badge: "O(log n)" }}
          entityB={{ name: "Linear Search", badge: "O(n)" }}
          attributes={[
            { label: "Pre-condition", valueA: "Sorted array", valueB: "Any array" },
            { label: "Time Cost", valueA: "Logarithmic", valueB: "Linear" },
          ]}
        />
      );

      expect(screen.getByText("Binary Search")).toBeInTheDocument();
      expect(screen.getByText("Linear Search")).toBeInTheDocument();
      expect(screen.getByText("Pre-condition")).toBeInTheDocument();
      expect(screen.getByText("Sorted array")).toBeInTheDocument();
    });
  });

  describe("Security Boundaries", () => {
    it("strips scripts, iframes, and malicious image tags", () => {
      const malicious = `
<script>alert('pwned')</script>
<iframe src="https://evil.example"></iframe>
<img src="x" onerror="alert(1)" />
![evil](https://evil.example/track.png)
`;

      const { container } = render(<RichContentRenderer content={malicious} />);

      expect(container.querySelector("script")).toBeNull();
      expect(container.querySelector("iframe")).toBeNull();
      expect(container.querySelector("img")).toBeNull();
    });
  });
});
