import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import {
  getAllRegistryItems,
  getItemBySlug,
  getItemsByCategory,
  getGroupedNavigation,
  getPrevNext,
  searchRegistry,
} from "@/lib/design-system/registry";
import { ApiTable } from "@/components/design-system/api-table/api-table";
import { PromptSection } from "@/components/design-system/prompt/prompt-section";
import { DesignSystemBreadcrumb } from "@/components/design-system/shared/breadcrumb";
import { DesignSystemPrevNext } from "@/components/design-system/shared/prev-next";
import { DoDontSection } from "@/components/design-system/dodont/dodont-section";
import { AnatomySection } from "@/components/design-system/anatomy/anatomy-section";

describe("Design System Registry", () => {
  it("contains exactly 47 total registered items", () => {
    const items = getAllRegistryItems();
    expect(items.length).toBe(47);
  });

  it("contains 9 foundations, 26 components, and 12 patterns", () => {
    const foundations = getItemsByCategory("foundations");
    const components = getItemsByCategory("components");
    const patterns = getItemsByCategory("patterns");

    expect(foundations.length).toBe(9);
    expect(components.length).toBe(26);
    expect(patterns.length).toBe(12);
    expect(foundations.length + components.length + patterns.length).toBe(47);
  });

  it("finds components by slug correctly", () => {
    const button = getItemBySlug("button");
    expect(button).toBeDefined();
    expect(button?.name).toBe("Button");
    expect(button?.category).toBe("components");

    const colors = getItemBySlug("colors");
    expect(colors).toBeDefined();
    expect(colors?.name).toBe("Colors & Surfaces");
    expect(colors?.category).toBe("foundations");

    const nonExistent = getItemBySlug("does-not-exist");
    expect(nonExistent).toBeUndefined();
  });

  it("generates grouped navigation structure", () => {
    const groups = getGroupedNavigation();
    expect(groups.length).toBe(3);
    expect(groups.map((g) => g.category)).toEqual([
      "foundations",
      "components",
      "patterns",
    ]);

    const compGroup = groups.find((g) => g.category === "components");
    expect(compGroup).toBeDefined();
    expect(compGroup?.subcategories.length).toBeGreaterThan(0);
  });

  it("calculates prev/next navigation correctly", () => {
    const all = getAllRegistryItems();
    const first = all[0];
    const second = all[1];
    const last = all[all.length - 1];

    const firstNav = getPrevNext(first.slug);
    expect(firstNav.prev).toBeUndefined();
    expect(firstNav.next?.name).toBe(second.name);

    const secondNav = getPrevNext(second.slug);
    expect(secondNav.prev?.name).toBe(first.name);

    const lastNav = getPrevNext(last.slug);
    expect(lastNav.next).toBeUndefined();
  });

  it("performs keyword search across registry items", () => {
    const buttonResults = searchRegistry("button");
    expect(buttonResults.some((r) => r.slug === "button")).toBe(true);

    const colorResults = searchRegistry("pure black");
    expect(colorResults.some((r) => r.slug === "colors")).toBe(true);

    const emptyResults = searchRegistry("xyznonexistentterm1234");
    expect(emptyResults.length).toBe(0);
  });
});

describe("Design System Workbench Components", () => {
  it("renders ApiTable with props, types, and required indicators", () => {
    render(
      <ApiTable
        properties={[
          {
            name: "variant",
            type: '"default" | "secondary" | "danger"',
            default: '"default"',
            description: "Visual style variant of the button.",
          },
          {
            name: "onClick",
            type: "() => void",
            required: true,
            description: "Click handler function.",
          },
        ]}
      />
    );

    expect(screen.getByText("variant")).toBeInTheDocument();
    expect(screen.getByText("onClick")).toBeInTheDocument();
    expect(screen.getByTitle("Required property")).toBeInTheDocument();
  });

  it("renders PromptSection with the AI prompt and component label", () => {
    render(
      <PromptSection
        prompt="Use PRIME pure black and red button styling."
        componentName="Button"
      />
    );

    expect(screen.getByText(/AI Implementation Prompt/i)).toBeInTheDocument();
    expect(
      screen.getByText("Use PRIME pure black and red button styling.")
    ).toBeInTheDocument();
  });

  it("renders DesignSystemBreadcrumb correctly", () => {
    render(
      <DesignSystemBreadcrumb category="components" subcategory="Actions" name="Button" />
    );

    expect(screen.getByText("Design System")).toBeInTheDocument();
    expect(screen.getByText("components")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();
    expect(screen.getByText("Button")).toBeInTheDocument();
  });

  it("renders DesignSystemPrevNext links", () => {
    render(
      <DesignSystemPrevNext
        prev={{ name: "Colors & Surfaces", href: "/design-system/foundations/colors" }}
        next={{ name: "Input", href: "/design-system/components/input" }}
      />
    );

    expect(screen.getByText("Colors & Surfaces")).toBeInTheDocument();
    expect(screen.getByText("Input")).toBeInTheDocument();
  });

  it("renders DoDontSection cards", () => {
    render(
      <DoDontSection
        dodont={[
          {
            do: "Use pure red only for key actions",
            doDescription: "Keep it under 8% visual weight",
            dont: "Color all buttons red",
            dontDescription: "Causes visual fatigue and breaks hierarchy",
          },
        ]}
      />
    );

    expect(screen.getByText("DO")).toBeInTheDocument();
    expect(screen.getByText("Use pure red only for key actions")).toBeInTheDocument();
    expect(screen.getByText("DON'T")).toBeInTheDocument();
    expect(screen.getByText("Color all buttons red")).toBeInTheDocument();
  });

  it("renders AnatomySection numbered breakdown", () => {
    render(
      <AnatomySection
        anatomy={[
          { id: 1, label: "Leading Icon", description: "Visual indicator" },
          { id: 2, label: "Text Label", description: "Action text" },
        ]}
      />
    );

    expect(screen.getByText("Anatomy")).toBeInTheDocument();
    expect(screen.getByText("Leading Icon")).toBeInTheDocument();
    expect(screen.getByText("Text Label")).toBeInTheDocument();
  });
});
