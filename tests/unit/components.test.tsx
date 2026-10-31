import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { StatusBadge } from "@/components/shared/status";
import { Metric } from "@/components/shared/metric";
import { MetricStrip } from "@/components/shared/metric-strip";
import { KeyboardKey } from "@/components/shared/keyboard-key";
import { TaskRow } from "@/components/shared/task-row";
import { ProblemRow } from "@/components/shared/problem-row";
import { RevisionRow } from "@/components/shared/revision-row";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";

describe("PRIME Design System Components", () => {
  describe("StatusBadge", () => {
    it("renders needs_revision with pure red accent class", () => {
      render(<StatusBadge status="needs_revision" />);
      const badge = screen.getByText("Needs Revision");
      expect(badge).toBeInTheDocument();
      expect(badge.closest("span")).toHaveClass("text-[var(--accent)]");
    });

    it("renders solved status with success styling", () => {
      render(<StatusBadge status="solved" />);
      const badge = screen.getByText("Solved");
      expect(badge).toBeInTheDocument();
      expect(badge.closest("span")).toHaveClass("text-[var(--success-foreground)]");
    });

    it("renders learning status with info styling", () => {
      render(<StatusBadge status="learning" />);
      const badge = screen.getByText("Learning");
      expect(badge).toBeInTheDocument();
    });
  });

  describe("Metric & MetricStrip", () => {
    it("renders metric label and tabular value with trend", () => {
      render(
        <Metric
          label="Problems Solved"
          value="142"
          unit="/ 450"
          trend={{ value: "+12", direction: "up" }}
        />
      );
      expect(screen.getByText("Problems Solved")).toBeInTheDocument();
      expect(screen.getByText("142")).toBeInTheDocument();
      expect(screen.getByText("/ 450")).toBeInTheDocument();
      expect(screen.getByText(/↑ \+12/)).toBeInTheDocument();
    });

    it("renders metric strip with all elements", () => {
      render(
        <MetricStrip
          items={[
            { id: "1", label: "Arrays", value: "24", unit: "solved" },
            { id: "2", label: "Trees", value: "18", unit: "solved" },
          ]}
        />
      );
      expect(screen.getByText("Arrays")).toBeInTheDocument();
      expect(screen.getByText("24")).toBeInTheDocument();
      expect(screen.getByText("Trees")).toBeInTheDocument();
      expect(screen.getByText("18")).toBeInTheDocument();
    });
  });

  describe("KeyboardKey", () => {
    it("renders tactile keyboard badge with kbd tag", () => {
      render(<KeyboardKey>⌘K</KeyboardKey>);
      const kbd = screen.getByText("⌘K");
      expect(kbd.tagName.toLowerCase()).toBe("kbd");
      expect(kbd).toHaveClass("font-mono");
    });
  });

  describe("TaskRow", () => {
    it("triggers onToggle callback when checked", () => {
      const handleToggle = vi.fn();
      render(
        <TaskRow
          title="Dynamic Programming Practice"
          category="DSA"
          duration="30m"
          completed={false}
          onToggle={handleToggle}
        />
      );
      expect(screen.getByText("Dynamic Programming Practice")).toBeInTheDocument();
      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);
      expect(handleToggle).toHaveBeenCalledWith(true);
    });

    it("renders active highlight styling", () => {
      const { container } = render(<TaskRow title="Active Task" active={true} />);
      const row = container.firstChild as HTMLElement;
      expect(row).toHaveClass("border-[var(--accent-border)]");
    });
  });

  describe("ProblemRow", () => {
    it("renders problem id, external link, and difficulty badge", () => {
      render(
        <ProblemRow
          id="001"
          title="Two Sum"
          difficulty="easy"
          topic="Arrays"
          platform="LeetCode"
          platformUrl="https://leetcode.com/problems/two-sum"
          status="solved"
        />
      );
      expect(screen.getByText("#001")).toBeInTheDocument();
      expect(screen.getByText("Two Sum")).toBeInTheDocument();
      expect(screen.getByText(/easy/i)).toBeInTheDocument();
      const link = screen.getByRole("link", { name: /two sum/i });
      expect(link).toHaveAttribute("href", "https://leetcode.com/problems/two-sum");
    });
  });

  describe("RevisionRow", () => {
    it("renders due today revision row with pure red highlight", () => {
      render(
        <RevisionRow
          topic="LRU Cache"
          interval="Day 7"
          dueDate="Due Today"
          status="due_today"
        />
      );
      expect(screen.getByText("LRU Cache")).toBeInTheDocument();
      expect(screen.getByText("Due Today")).toBeInTheDocument();
      expect(screen.getByText("Day 7")).toHaveClass("bg-[var(--accent)]");
    });
  });

  describe("Calendar Primitive", () => {
    it("renders calendar month and weekday headers", () => {
      const testDate = new Date(2026, 9, 15); // October 2026
      render(<Calendar selected={testDate} />);
      expect(screen.getByText(/October/i)).toBeInTheDocument();
      expect(screen.getByText("Su")).toBeInTheDocument();
      expect(screen.getByText("Sa")).toBeInTheDocument();
    });

    it("handles date selection", () => {
      const handleSelect = vi.fn();
      const testDate = new Date(2026, 9, 1);
      render(<Calendar selected={testDate} onSelect={handleSelect} />);
      const dayButton = screen.getByRole("button", { name: "15" });
      fireEvent.click(dayButton);
      expect(handleSelect).toHaveBeenCalled();
    });
  });

  describe("Badge Variants", () => {
    it("renders easy, medium, and hard difficulty badges", () => {
      const { rerender } = render(<Badge variant="easy">EASY</Badge>);
      expect(screen.getByText("EASY")).toHaveClass("text-[var(--success-foreground)]");

      rerender(<Badge variant="medium">MEDIUM</Badge>);
      expect(screen.getByText("MEDIUM")).toHaveClass("text-[var(--warning-foreground)]");

      rerender(<Badge variant="hard">HARD</Badge>);
      expect(screen.getByText("HARD")).toHaveClass("text-red-400");
    });
  });
});
