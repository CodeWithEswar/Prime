import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Button } from "@/components/ui/button";

describe("Button Primitive & Solid Neumorphic Language", () => {
  it("renders an anchor through asChild without passing sibling nodes to Slot", () => {
    render(
      <Button asChild>
        <a href="#roadmap">Explore PRIME</a>
      </Button>
    );
    expect(screen.getByRole("link", { name: "Explore PRIME" })).toHaveAttribute(
      "href",
      "#roadmap"
    );
  });
  it("renders with primary neumorphic classes by default", () => {
    render(<Button>Start Practice</Button>);
    const button = screen.getByRole("button", { name: /start practice/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("btn-neumorphic-primary");
  });

  it("renders secondary neumorphic variant correctly", () => {
    render(<Button variant="secondary">Configure</Button>);
    const button = screen.getByRole("button", { name: /configure/i });
    expect(button).toHaveClass("btn-neumorphic-secondary");
  });

  it("renders outline variant correctly", () => {
    render(<Button variant="outline">Cancel</Button>);
    const button = screen.getByRole("button", { name: /cancel/i });
    expect(button).toHaveClass("border");
  });

  it("disables correctly with appropriate aria attributes and opacity classes", () => {
    render(<Button disabled>Disabled Action</Button>);
    const button = screen.getByRole("button", { name: /disabled action/i });
    expect(button).toBeDisabled();
    expect(button).toHaveClass("disabled:pointer-events-none");
  });
});
