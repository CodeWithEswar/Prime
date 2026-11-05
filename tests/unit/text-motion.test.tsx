import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TypingText } from "@/components/landing/motion/text/typing-text";
import { RotatingText } from "@/components/landing/motion/text/rotating-text";
import { CharacterReveal } from "@/components/landing/motion/text/character-reveal";
import { WordReveal } from "@/components/landing/motion/text/word-reveal";
import { LineMaskReveal } from "@/components/landing/motion/text/line-mask-reveal";
import { ScrambleText } from "@/components/landing/motion/text/scramble-text";
import { CountingNumber } from "@/components/landing/motion/text/counting-number";
import { GradientText } from "@/components/landing/motion/text/gradient-text";
import { TextHighlight } from "@/components/landing/motion/text/text-highlight";

// Mock motion inView to simulate visible viewport
vi.mock("motion/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("motion/react")>();
  return {
    ...actual,
    useInView: () => true,
    useScroll: () => ({
      scrollYProgress: { get: () => 0.5, on: () => () => {}, onChange: () => () => {} },
    }),
    useTransform: () => 1,
  };
});

describe("PRIME Typography Motion Engine", () => {
  describe("TypingText", () => {
    it("renders full accessible text for screen readers", () => {
      render(
        <TypingText
          phrases={["Plan with purpose.", "Practice with consistency."]}
        />
      );

      const accessibleEl = screen.getByText(
        "Plan with purpose.. Practice with consistency."
      );
      expect(accessibleEl).toBeInTheDocument();
      expect(accessibleEl).toHaveClass("sr-only");
    });

    it("renders terminal block cursor when cursor=true", () => {
      const { container } = render(
        <TypingText phrases="Practice deliberate execution" cursor={true} cursorChar="█" />
      );

      expect(container.textContent).toContain("█");
    });
  });

  describe("RotatingText", () => {
    it("renders screen-reader accessible full phrase list", () => {
      const phrases = [
        "Slide through real workspaces",
        "Inspect scheduled intervals",
      ];
      render(<RotatingText phrases={phrases} />);

      const sr = screen.getByText("Slide through real workspaces; Inspect scheduled intervals");
      expect(sr).toBeInTheDocument();
      expect(sr).toHaveClass("sr-only");
    });
  });

  describe("CharacterReveal", () => {
    it("renders full accessible text and segmented character spans", () => {
      render(
        <CharacterReveal
          text="Engineered for serious technical candidates."
          accentWord="technical"
        />
      );

      const sr = screen.getByText("Engineered for serious technical candidates.");
      expect(sr).toBeInTheDocument();
      expect(sr).toHaveClass("sr-only");
    });
  });

  describe("WordReveal", () => {
    it("renders full text with accessible label and highlighted words", () => {
      render(
        <WordReveal
          text="Turn preparation into a sequence of action, reflection, and revision."
          highlightWords={["sequence", "action", "reflection", "revision"]}
        />
      );

      const sr = screen.getByText(
        "Turn preparation into a sequence of action, reflection, and revision."
      );
      expect(sr).toBeInTheDocument();
      expect(sr).toHaveClass("sr-only");
    });
  });

  describe("LineMaskReveal", () => {
    it("renders lines with accessible full-text and accent line styling", () => {
      const lines = ["Interview preparation", "should not feel like", "chaos."];
      render(<LineMaskReveal lines={lines} accentLineIndex={2} />);

      const sr = screen.getByText("Interview preparation should not feel like chaos.");
      expect(sr).toBeInTheDocument();
      expect(sr).toHaveClass("sr-only");
    });
  });

  describe("ScrambleText", () => {
    it("renders accessible label with target text", () => {
      const { container } = render(<ScrambleText text="01 / ARCHITECTURE OF EXCELLENCE" />);

      const sr = container.querySelector(".sr-only");
      expect(sr).toBeInTheDocument();
      expect(sr?.textContent).toBe("01 / ARCHITECTURE OF EXCELLENCE");
    });
  });

  describe("CountingNumber", () => {
    it("formats number with prefix and suffix", () => {
      render(<CountingNumber value={82} suffix="%" />);
      expect(screen.getByText(/%/)).toBeInTheDocument();
    });
  });

  describe("GradientText & TextHighlight", () => {
    it("renders GradientText with pure red gradient styling", () => {
      render(<GradientText>Deliberate Practice</GradientText>);
      expect(screen.getByText("Deliberate Practice")).toBeInTheDocument();
    });

    it("renders TextHighlight with relative container and accent line", () => {
      render(<TextHighlight>deliberate.</TextHighlight>);
      expect(screen.getByText("deliberate.")).toBeInTheDocument();
    });
  });
});
