import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { LandingHeader } from "@/components/landing/landing-header";
import {
  LandingCanvas,
  Reveal,
  StoryGeometry,
} from "@/components/landing/landing-motion";
import { PreparationJourney } from "@/components/landing/preparation-journey";
import { MasteryDiagnostic } from "@/components/landing/mastery-diagnostic";
import {
  RoadmapPreview,
  DailyPlanPreview,
  PracticePreview,
  RevisionPreview,
} from "@/components/landing/feature-previews";
import {
  ClaritySection,
  ProgressStory,
  ReadinessStory,
  PreparationMethod,
  QuietTransition,
  CinematicFooter,
} from "@/components/landing/editorial-sections";
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
      <a href="#main" className="landing-skip">
        Skip to content
      </a>
      <LandingHeader />
      <main id="main">
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

        <PreparationJourney />

        <ClaritySection />

        <section id="roadmap" className="landing-section story-section">
          <div className="landing-container story-grid">
            <Reveal className="story-copy">
              <p className="section-index">01 / ROADMAP</p>
              <h2>
                KNOW WHAT
                <br />
                TO LEARN NEXT.
              </h2>
              <p className="section-copy">
                Build understanding in a deliberate sequence. Move from fundamentals to
                harder concepts with a roadmap that gives every session a purpose.
              </p>
              <p className="topic-list">
                Programming · DSA · SQL · DBMS · OOP
                <br />
                Operating systems · Networks · Aptitude
                <br />
                System design · Interview preparation
              </p>
              <div className="mt-6">
                <Button asChild variant="secondary" size="default">
                  <a href="#roadmap">Explore the roadmap</a>
                </Button>
              </div>
            </Reveal>
            <Reveal>
              <RoadmapPreview />
            </Reveal>
          </div>
        </section>

        <section className="landing-section story-section daily-section">
          <div className="landing-container story-grid reverse">
            <Reveal>
              <DailyPlanPreview />
            </Reveal>
            <Reveal className="story-copy">
              <p className="section-index">02 / DAILY PLAN</p>
              <h2>
                TURN THE ROADMAP
                <br />
                INTO TODAY.
              </h2>
              <p className="section-copy">
                A long-term goal becomes a manageable daily plan. Balance new learning,
                practice, and revision around the time you have and the progress you’ve
                made.
              </p>
              <span className="quiet-detail">
                One day. A few deliberate steps. Forward.
              </span>
            </Reveal>
          </div>
        </section>

        <section id="practice" className="landing-section practice-section">
          <div className="landing-container">
            <Reveal>
              <div className="practice-heading">
                <p className="section-index">03 / PRACTICE</p>
                <h2>
                  SOLVING IS ONLY
                  <br />
                  PART OF THE SIGNAL.
                </h2>
                <p className="section-copy">
                  Independent solution or helpful hint? Reviewed approach or still
                  difficult? Capture the quality of each attempt, so your next session
                  starts with understanding.
                </p>
              </div>
              <PracticePreview />
            </Reveal>
          </div>
        </section>

        <section id="revision" className="landing-section story-section revision-section">
          <StoryGeometry variant="revision" />
          <div className="landing-container story-grid">
            <Reveal className="story-copy">
              <p className="section-index">04 / REVISION</p>
              <h2>
                REVIEW BEFORE
                <br />
                YOU FORGET.
              </h2>
              <p className="section-copy">
                Learning something once is a beginning. Bring topics and problems back
                when they need attention, so revision becomes part of your plan.
              </p>
              <p className="quiet-detail">
                Less starting over. More building on what you know.
              </p>
            </Reveal>
            <Reveal>
              <RevisionPreview />
            </Reveal>
          </div>
        </section>

        <section id="mastery" className="landing-section story-section mastery-section">
          <div className="landing-container">
            <MasteryDiagnostic>
              <Reveal className="story-copy">
                <p className="section-index">05 / MASTERY</p>
                <h2>
                  DONE IS A CHECK.
                  <br />
                  MASTERY IS
                  <br />A DIFFERENCE.
                </h2>
                <p className="section-copy">
                  Finishing a topic doesn’t mean it will stay with you. Bring practice
                  quality, revision performance, and confidence together to understand
                  what’s strong and what needs attention.
                </p>
              </Reveal>
            </MasteryDiagnostic>
          </div>
        </section>

        <ProgressStory />
        <ReadinessStory />

        <PreparationMethod />

        <QuietTransition />
        <section className="landing-section final-section">
          <StoryGeometry variant="terminal" />
          <div className="landing-container">
            <Reveal>
              <p className="section-index">YOUR NEXT STEP STARTS HERE</p>
              <h2>
                MAKE YOUR PREPARATION
                <br />
                <span>DELIBERATE.</span>
              </h2>
              <p className="section-copy">
                Build the roadmap. Do the work. Revise what matters.
                <br />
                Understand your preparation more clearly.
              </p>
              <StartButton>Start your preparation</StartButton>
            </Reveal>
          </div>
        </section>
      </main>
      <CinematicFooter />
    </LandingCanvas>
  );
}
