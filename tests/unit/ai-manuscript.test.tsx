import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Manuscript, { FormattingBoundary } from "@/features/ai/markdown/markdown-renderer";
import { CodeFrame } from "@/features/ai/markdown/code-frame";
import {
  normalizeLanguage,
  looksLikeCode,
  openFenceOffset,
  extractText,
  headingSlug,
  safeAILink,
} from "@/features/ai/markdown/utils";
import { highlightCode } from "@/features/ai/markdown/highlight";
import {
  HintTrace,
  TechnicalContent,
  technicalBlockSchema,
} from "@/features/ai/markdown/structured";
import { LANGUAGE_FIXTURES } from "@/features/ai/markdown/fixtures";
describe("Technical Manuscript boundaries", () => {
  it("recognizes code-like text while leaving ordinary text and diagrams alone", () => {
    expect(
      looksLikeCode("for each c:\n  // coming from the top\n  dp[i][j] += dp[i-1][j]")
    ).toBe(true);
    expect(looksLikeCode("USER\n  |\nPRIME gateway")).toBe(false);
    expect(looksLikeCode("Return to the topic when you are ready.")).toBe(false);
    const code = "for each c:\n  // from above\n  dp[i][j] += dp[i-1][j]";
    expect(
      highlightCode(code, "auto")
        .flat()
        .some((token) => token.classes.length > 0)
    ).toBe(true);
  });
  it.each([
    ["js", "javascript"],
    ["ts", "typescript"],
    ["tsx", "typescript"],
    ["jsx", "javascript"],
    ["py", "python"],
    ["sh", "bash"],
    ["shell", "bash"],
    ["yml", "yaml"],
    ["plaintext", "text"],
    ["unsupported", "text"],
  ])("normalizes %s without executing it", (input, language) =>
    expect(normalizeLanguage(input)).toBe(language)
  );
  it("detects open and completed fenced blocks", () => {
    expect(openFenceOffset("Paragraph\n\n```java\nint value")).toBe(11);
    expect(openFenceOffset("```java\nint value;\n```\nText")).toBeNull();
    expect(openFenceOffset("~~~sql\nSELECT *\n```")).toBe(0);
  });
  it("extracts exact code text, preserving Unicode and indentation", () => {
    expect(
      extractText(
        <code>
          <span>{"  int π = 2;"}</span>
          {"\n"}
          <span>return π;</span>
        </code>
      )
    ).toBe("  int π = 2;\nreturn π;");
  });
  it("creates safe deterministic heading slugs", () => {
    expect(headingSlug("Complexity: O(n)!")).toBe("complexity-on");
    expect(headingSlug("సమీక్ష")).not.toBe("");
  });
  it("blocks credentials, unsafe protocols and normalized path escapes", () => {
    for (const url of [
      "javascript:alert(1)",
      "data:text/html,x",
      "https://user:password@example.com",
      "/practice/dsa/../../auth/google",
      "//evil.example",
    ]) {
      expect(safeAILink(url)).toBe("");
    }
  });
  it.each(LANGUAGE_FIXTURES.map(([language, source]) => [language, source]))(
    "highlights %s without altering source",
    (language, source) => {
      const tokens = highlightCode(source, language);
      expect(
        tokens.map((line) => line.map((token) => token.text).join("")).join("\n")
      ).toBe(source);
    }
  );
});
describe("Technical Manuscript components", () => {
  it("preserves semantic tables and read-only task lists", () => {
    render(
      <Manuscript
        content={
          "| Approach | Cost |\n|---|---|\n| Search | `O(log n)` |\n\n- [x] Check invariant\n- [ ] Explain update"
        }
      />
    );
    expect(screen.getByRole("table")).toHaveAccessibleName("Comparison table");
    expect(screen.getAllByRole("columnheader")[0]).toHaveAttribute("scope", "col");
    for (const checkbox of screen.getAllByRole("checkbox"))
      expect(checkbox).toBeDisabled();
  });
  it("requires supplied references for internal links", () => {
    const { rerender } = render(
      <Manuscript content="[Two Sum](/practice/dsa/two-sum)" />
    );
    expect(screen.queryByRole("link", { name: "Two Sum" })).toBeNull();
    rerender(
      <Manuscript
        content="[Two Sum](/practice/dsa/two-sum)"
        references={[{ href: "/practice/dsa/two-sum" }]}
      />
    );
    expect(screen.getByRole("link", { name: "Two Sum" })).toHaveAttribute(
      "href",
      "/practice/dsa/two-sum"
    );
  });
  it("gives repeated headings unique safe IDs", () => {
    const { container } = render(
      <Manuscript content={"## Recall\n\nText\n\n## Recall\n\nMore"} />
    );
    const ids = [...container.querySelectorAll("h2")].map((node) => node.id);
    expect(new Set(ids).size).toBe(2);
    expect(ids.every((id) => /recall$/.test(id))).toBe(true);
  });
  it("copies source without line numbers or highlighting markup", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    const source = "  int π = 2;\n  return π;\n\n// Keep indentation";
    render(<CodeFrame source={source} language="java" />);
    fireEvent.click(screen.getByRole("button", { name: "Copy code" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(source));
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Code copied.")
    );
    fireEvent.click(screen.getByRole("button", { name: "Wrap code" }));
    expect(screen.getByRole("button", { name: "Wrap code" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });
  it("shows partial code safely and finalizes without remounting completed code", async () => {
    const { rerender, container } = render(
      <Manuscript content={"```java\npublic class Answer {"} streaming />
    );
    expect(screen.getByText("Generating…")).toBeInTheDocument();
    rerender(
      <Manuscript content={"```java\npublic class Answer {}\n```\n\nCompleted."} />
    );
    await waitFor(() => expect(container.querySelector(".hljs-keyword")).not.toBeNull());
    const frame = container.querySelector(".prime-code-frame");
    rerender(
      <Manuscript
        content={"```java\npublic class Answer {}\n```\n\nCompleted. More explanation."}
      />
    );
    expect(container.querySelector(".prime-code-frame")).toBe(frame);
    expect(screen.queryByText("Generating…")).toBeNull();
  });
  it("announces long code and expands it without losing lines", () => {
    render(
      <CodeFrame
        source={Array.from({ length: 55 }, (_, i) => `line ${i + 1}`).join("\n")}
        language="text"
      />
    );
    expect(screen.getByText("55 lines")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Show full code" }));
    expect(screen.getByRole("button", { name: "Compact view" })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    expect(screen.getByText("line 55")).toBeInTheDocument();
  });
  it("uses explicit metadata for hints and technical blocks", () => {
    const next = vi.fn();
    render(
      <>
        <HintTrace level={2} onNext={next}>
          <p>What makes the window invalid?</p>
        </HintTrace>
        <TechnicalContent block={{ kind: "complexity", time: "O(n)", space: "O(k)" }} />
      </>
    );
    expect(screen.getByRole("region", { name: "Hint level 2" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reveal next hint" }));
    expect(next).toHaveBeenCalledOnce();
    expect(screen.getByText("O(k)")).toBeInTheDocument();
    expect(
      technicalBlockSchema.safeParse({ kind: "execute_sql", sql: "select 1" }).success
    ).toBe(false);
  });
  it("falls back to original escaped text after a formatting error", () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    function Broken() {
      throw new Error("fixture");
      return null;
    }
    const { container } = render(
      <FormattingBoundary content={"<script>not HTML</script>"}>
        <Broken />
      </FormattingBoundary>
    );
    expect(screen.getByRole("status")).toHaveTextContent("Showing the original response");
    expect(container.querySelector("script")).toBeNull();
    expect(screen.getByText("<script>not HTML</script>")).toBeInTheDocument();
    log.mockRestore();
  });
});
