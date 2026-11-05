import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { LandingHeader } from "@/components/landing/landing-header";
import {
  LandingCanvas,
  StoryGeometry,
} from "@/components/landing/landing-motion";
import { PreparationJourney } from "@/components/landing/preparation-journey";
import { ProductIntroduction } from "@/components/landing/sections/product-introduction";
import { CoreFeatures } from "@/components/landing/sections/core-features";
import { InteractiveProductShowcase } from "@/components/landing/sections/product-showcase";
import { LearningExperience } from "@/components/landing/sections/learning-experience";
import { ProgressAnalytics } from "@/components/landing/sections/progress-analytics";
import { AdaptiveRevisionSection } from "@/components/landing/sections/adaptive-revision";
import { PricingSection } from "@/components/landing/sections/pricing-section";
import { CinematicFinale } from "@/components/landing/cinematic-finale";
import { CinematicFooter } from "@/components/landing/editorial-sections";
import { CursorGlow } from "@/components/landing/effects/cursor-glow";
import "./landing.css";

export const metadata: Metadata = {
  title: { absolute: "PRIME — Preparation Roadmap for Interviews, Mastery & Excellence" },
  description:
    "Prepare with purpose. Follow a structured interview roadmap, plan each day, track practice, revisit weak areas, and understand your progress toward mastery.",
  alternates: { canonical: "/" },
};

function StartButton({ children = "Start Preparing" }: { children?: React.ReactNode }) {
  return (
    <Button asChild size="default">
      <Link href="/login">{children}</Link>
    </Button>
  );
}

export default function LandingPage() {
  return (
    <LandingCanvas>
      <CursorGlow size={420} color="rgba(255, 0, 0, 0.05)" />
      <a href="#main" className="landing-skip">
        Skip to content
      </a>
      <LandingHeader />
      <main id="main">
        {/* HERO SECTION — 100% STRICTLY PRESERVED */}
        <section className="landing-hero" aria-labelledby="hero-title">
          <StoryGeometry />
          <StoryGeometry side="left" />
          <div className="hero-scrim" aria-hidden="true" />
          <div className="landing-container hero-inner">
            <div className="hero-copy">
              <p className="hero-eyebrow">
                Preparation Roadmap for Interviews,
                <br />
                Mastery &amp; Excellence
              </p>
              <h1 id="hero-title">
                Prepare with
                <br />
                <span>purpose.</span>
              </h1>
              <p className="hero-description">
                A clear roadmap for interview preparation. Plan your study, practice
                consistently, and build lasting mastery.
              </p>
              <div className="hero-actions">
                <StartButton />
                <Button asChild variant="secondary" size="default">
                  <a href="#method">See how it works</a>
                </Button>
              </div>
              <p className="hero-capabilities">
                Roadmap planning <i /> Adaptive revision <i /> Mastery tracking
              </p>
            </div>
            <div className="hero-baseline">
              <a href="#journey">SCROLL TO FIND YOUR PATH</a>
              <span>PREPARATION / MASTERY</span>
            </div>
          </div>
        </section>

        {/* SECTION 01 — PRODUCT INTRODUCTION */}
        <ProductIntroduction />

        {/* SECTION 02 — PREPARATION WORKFLOW */}
        <PreparationJourney />

        {/* SECTION 03 — CORE FEATURES & BENTO GRID */}
        <CoreFeatures />

        {/* SECTION 04 — INTERACTIVE PRODUCT SHOWCASE */}
        <InteractiveProductShowcase />

        {/* SECTION 05 — LEARNING EXPERIENCE & SYLLABUS */}
        <LearningExperience />

        {/* SECTION 06 — OBSERVABILITY & ANALYTICS */}
        <ProgressAnalytics />

        {/* SECTION 07 — ADAPTIVE SPACED REVISION */}
        <AdaptiveRevisionSection />

        {/* SECTION 08 — HONEST TRANSPARENT ACCESS */}
        <PricingSection />

        {/* SECTION 09 — CINEMATIC BRIDGE FINALE & DESTINATION */}
        <CinematicFinale />
      </main>

      {/* SECTION 10 — CINEMATIC FOOTER */}
      <CinematicFooter />
    </LandingCanvas>
  );
}
