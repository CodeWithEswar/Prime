import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CinematicFinale } from "@/components/landing/cinematic-finale/cinematic-finale";
import { CinematicScene } from "@/components/landing/cinematic-finale/cinematic-scene";
import { PrimeMonument } from "@/components/landing/cinematic-finale/prime-monument";
import { CharacterSilhouette } from "@/components/landing/cinematic-finale/character-silhouette";
import { CinematicCTA } from "@/components/landing/cinematic-finale/cinematic-cta";
import { BridgeLights } from "@/components/landing/cinematic-finale/bridge-lights";
import { AtmosphericFog } from "@/components/landing/cinematic-finale/atmospheric-fog";

// Mock motion
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

describe("PRIME Cinematic Bridge Finale", () => {
  it("renders CinematicFinale section with id='cta' and aria-label", () => {
    const { container } = render(<CinematicFinale />);
    const section = container.querySelector("section#cta");
    expect(section).toBeInTheDocument();
    expect(section).toHaveAttribute("aria-label", "PRIME Cinematic Finale");
  });

  it("renders CinematicScene with role='img' and descriptive aria-label", () => {
    render(<CinematicScene />);
    const scene = screen.getByRole("img", {
      name: /Solitary figure standing on a dark metallic bridge gazing at the distant illuminated PRIME monument/i,
    });
    expect(scene).toBeInTheDocument();
  });

  it("renders PrimeMonument with official brand mark SVG paths", () => {
    const { container } = render(<PrimeMonument />);
    const svgPaths = container.querySelectorAll("svg path");
    expect(svgPaths.length).toBeGreaterThanOrEqual(2);
  });

  it("renders CharacterSilhouette with layered anatomy", () => {
    const { container } = render(<CharacterSilhouette />);
    expect(container.querySelector(".char-head")).toBeInTheDocument();
    expect(container.querySelector(".char-torso")).toBeInTheDocument();
    expect(container.querySelector(".char-legs")).toBeInTheDocument();
    expect(container.querySelector(".char-shoes")).toBeInTheDocument();
  });

  it("renders CinematicCTA with headline, supporting text, and link to /login", () => {
    render(<CinematicCTA />);
    expect(screen.getByText(/Your next chapter/i)).toBeInTheDocument();
    expect(screen.getByText(/Turn preparation into progress/i)).toBeInTheDocument();

    const startBtn = screen.getByRole("link", { name: /Start Preparing/i });
    expect(startBtn).toBeInTheDocument();
    expect(startBtn).toHaveAttribute("href", "/login");
  });

  it("renders BridgeLights with perspective coordinate lights", () => {
    const { container } = render(
      <svg>
        <BridgeLights />
      </svg>
    );
    expect(container.querySelector(".bridge-edge-lights")).toBeInTheDocument();
  });

  it("renders AtmosphericFog variants", () => {
    const { container: c1 } = render(<AtmosphericFog variant="distant" />);
    expect(c1.firstElementChild).toHaveAttribute("aria-hidden", "true");

    const { container: c2 } = render(<AtmosphericFog variant="foreground" />);
    expect(c2.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });
});
