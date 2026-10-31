import { describe, it, expect } from "vitest";
import * as React from "react";
import { render, screen } from "@testing-library/react";
import fs from "node:fs";
import path from "node:path";
import {
  PrimeMark,
  PrimeWordmark,
  PrimeLogo,
  PRIME_MARK_PATH_LOWER,
  PRIME_MARK_PATH_UPPER,
  PRIME_WORDMARK_PATH,
} from "@/components/branding";
import { getItemBySlug, getItemsByCategory } from "@/lib/design-system/registry";

describe("PRIME Brand Components", () => {
  describe("PrimeMark", () => {
    it("renders with default 24x24 dimensions and canonical viewBox", () => {
      const { container } = render(<PrimeMark />);
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
      expect(svg).toHaveAttribute("width", "24");
      expect(svg).toHaveAttribute("height", "24");
    });

    it("renders both ascending progression and arrow peak ribbon paths", () => {
      const { container } = render(<PrimeMark />);
      const paths = container.querySelectorAll("path");
      expect(paths).toHaveLength(2);
      expect(paths[0]).toHaveAttribute("d", PRIME_MARK_PATH_LOWER);
      expect(paths[1]).toHaveAttribute("d", PRIME_MARK_PATH_UPPER);
    });

    it("applies the canonical Pure Red #FF0000 fill for brand variant", () => {
      const { container } = render(<PrimeMark variant="brand" />);
      const paths = container.querySelectorAll("path");
      expect(paths[0]).toHaveAttribute("fill", "#FF0000");
      expect(paths[1]).toHaveAttribute("fill", "#FF0000");
    });

    it("applies #FFFFFF for white variant and #000000 for black variant", () => {
      const { container: whiteContainer } = render(<PrimeMark variant="white" />);
      expect(whiteContainer.querySelector("path")).toHaveAttribute("fill", "#FFFFFF");

      const { container: blackContainer } = render(<PrimeMark variant="black" />);
      expect(blackContainer.querySelector("path")).toHaveAttribute("fill", "#000000");
    });

    it("is accessible when title is provided", () => {
      render(<PrimeMark title="PRIME System Mark" />);
      expect(screen.getByText("PRIME System Mark")).toBeInTheDocument();
    });
  });

  describe("PrimeWordmark", () => {
    it("renders the PRIME vector path with evenodd fill rule", () => {
      const { container } = render(<PrimeWordmark />);
      const pathEl = container.querySelector("path");
      expect(pathEl).toHaveAttribute("d", PRIME_WORDMARK_PATH);
      expect(pathEl).toHaveAttribute("fill-rule", "evenodd");
    });

    it("renders the full expansion when withExpansion is true", () => {
      render(<PrimeWordmark withExpansion />);
      expect(
        screen.getByText("Preparation Roadmap for Interviews, Mastery & Excellence")
      ).toBeInTheDocument();
    });

    it("renders the four-phase tagline with pure red punctuation when withTagline is true", () => {
      const { container } = render(<PrimeWordmark withTagline />);
      expect(screen.getByText(/Plan/)).toBeInTheDocument();
      expect(screen.getByText(/Practice/)).toBeInTheDocument();
      expect(screen.getByText(/Revise/)).toBeInTheDocument();
      expect(screen.getByText(/Master/)).toBeInTheDocument();

      const redDots = container.querySelectorAll(".text-prime-red");
      expect(redDots.length).toBe(4);
    });
  });

  describe("PrimeLogo Lockup", () => {
    it("renders both mark and wordmark in a horizontal layout by default", () => {
      const { container } = render(<PrimeLogo size="md" />);
      const svgs = container.querySelectorAll("svg");
      expect(svgs.length).toBeGreaterThanOrEqual(2);
      expect(container.firstChild).toHaveClass("flex-row");
    });

    it("renders stacked orientation when requested", () => {
      const { container } = render(<PrimeLogo orientation="stacked" />);
      expect(container.firstChild).toHaveClass("flex-col");
    });

    it("renders an accessible Next.js link when href is supplied", () => {
      render(<PrimeLogo href="/design-system" />);
      const link = screen.getByRole("link", { name: "PRIME Home" });
      expect(link).toHaveAttribute("href", "/design-system");
    });
  });
});

describe("Design System Registry Brand Integration", () => {
  it("registers branding foundation item with comprehensive metadata", () => {
    const item = getItemBySlug("branding");
    expect(item).toBeDefined();
    expect(item?.category).toBe("foundations");
    expect(item?.name).toBe("Brand Identity");
    expect(item?.dodont).toHaveLength(2);
    expect(item?.aiPrompt).toContain("PURE BLACK");
    expect(item?.aiPrompt).toContain("PURE RED");
  });

  it("foundations collection now includes exactly 9 canonical items", () => {
    const foundations = getItemsByCategory("foundations");
    expect(foundations).toHaveLength(9);
    expect(foundations.map((f) => f.slug)).toContain("branding");
    expect(foundations.map((f) => f.slug)).toContain("motion");
    expect(foundations.map((f) => f.slug)).toContain("colors");
  });
});

describe("Physical Brand Assets Verification", () => {
  const root = path.resolve(process.cwd());

  it("ensures all canonical vector SVGs exist and are non-empty", () => {
    const svgPaths = [
      "public/brand/mark/prime-mark-red.svg",
      "public/brand/mark/prime-mark-white.svg",
      "public/brand/mark/prime-mark-black.svg",
      "public/brand/mark/prime-mark-current.svg",
      "public/brand/logo/prime-logo-dark.svg",
      "public/brand/logo/prime-logo-light.svg",
      "public/brand/logo/prime-logo-white.svg",
      "public/brand/icons/favicon.svg",
      "public/branding/logo.svg",
    ];

    for (const rel of svgPaths) {
      const full = path.join(root, rel);
      expect(fs.existsSync(full), `Missing SVG: ${rel}`).toBe(true);
      const content = fs.readFileSync(full, "utf8");
      expect(content.length).toBeGreaterThan(50);
      expect(content).toContain("<svg");
    }
  });

  it("ensures all critical app icons and favicons exist with valid bytes", () => {
    const iconPaths = [
      "public/favicon.ico",
      "public/favicon-16.png",
      "public/favicon-32.png",
      "public/favicon-48.png",
      "public/apple-touch-icon.png",
      "public/icon-192.png",
      "public/icon-512.png",
      "public/icon-maskable-512.png",
      "public/app-icon-1024.png",
    ];

    for (const rel of iconPaths) {
      const full = path.join(root, rel);
      expect(fs.existsSync(full), `Missing Icon: ${rel}`).toBe(true);
      const stat = fs.statSync(full);
      expect(stat.size).toBeGreaterThan(100);
    }
  });

  it("ensures all social cards and web app manifest exist", () => {
    const socialPaths = [
      "public/og-default.png",
      "public/twitter-card.png",
      "public/github-social-preview.png",
      "public/social-square.png",
      "public/manifest.json",
      "public/brand/README.md",
    ];

    for (const rel of socialPaths) {
      const full = path.join(root, rel);
      expect(fs.existsSync(full), `Missing Social Asset: ${rel}`).toBe(true);
      const stat = fs.statSync(full);
      expect(stat.size).toBeGreaterThan(100);
    }
  });
});
