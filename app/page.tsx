import type { Metadata } from "next";
import { PrimeLogo } from "@/components/branding";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LandingHeader } from "@/components/landing/landing-header";
import {
  LandingCanvas,
  Reveal,
  StoryGeometry,
  JourneyPath,
} from "@/components/landing/landing-motion";
import { DemoRows, ProductShowcase } from "@/components/landing/product-showcase";
import { PreparationJourney } from "@/components/landing/preparation-journey";
import { MasteryDiagnostic } from "@/components/landing/mastery-diagnostic";
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
      <a href="#experience">{children}</a>
    </Button>
  );
}
function ProductPanel({
  type,
  title,
  subtitle,
}: {
  type: string;
  title: string;
  subtitle: string;
}) {
  return (
    <Card className="product-panel" elevation="raised">
      <div className="panel-title">
        <span>{title}</span>
      </div>
      <p className="panel-subtitle">{subtitle}</p>
      <DemoRows type={type} />
      <div className="panel-foot micro">PRIME / ILLUSTRATIVE PREVIEW</div>
    </Card>
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

        <section id="features" className="landing-section why-section">
          <div className="landing-container">
            <Reveal>
              <div className="why-heading">
                <p className="section-index">CLARITY AT EVERY STEP</p>
                <h2>
                  LESS SECOND-GUESSING.
                  <br />
                  MORE MOVING FORWARD.
                </h2>
              </div>
              <div className="why-grid">
                {[
                  [
                    "01",
                    "Know your next move.",
                    "See what to learn, what to practice, and what deserves another look.",
                  ],
                  [
                    "02",
                    "Make the work count.",
                    "Keep a record of how you solved a problem, not just whether you finished it.",
                  ],
                  [
                    "03",
                    "See what stays with you.",
                    "Connect practice and revision to a clearer picture of your strengths.",
                  ],
                ].map(([n, title, text]) => (
                  <div key={n}>
                    <span className="micro">{n} /</span>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section id="roadmap" className="landing-section story-section">
          <div className="landing-container story-grid">
            <Reveal className="story-copy">
              <p className="section-index">01 / STRUCTURED ROADMAP</p>
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
                  <a href="#experience">Explore the roadmap</a>
                </Button>
              </div>
            </Reveal>
            <Reveal>
              <ProductPanel
                type="roadmap"
                title="Your next steps"
                subtitle="DSA / Building the foundations"
              />
            </Reveal>
          </div>
        </section>

        <section className="landing-section story-section daily-section">
          <div className="landing-container story-grid reverse">
            <Reveal>
              <ProductPanel
                type="daily"
                title="A plan for today"
                subtitle="A little progress. A clear direction."
              />
            </Reveal>
            <Reveal className="story-copy">
              <p className="section-index">02 / DAILY PLANNING</p>
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
                <p className="section-index">03 / DELIBERATE PRACTICE</p>
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
              <ProductPanel
                type="practice"
                title="Every attempt tells you something"
                subtitle="Practice / More than a solved count"
              />
            </Reveal>
          </div>
        </section>

        <section id="revision" className="landing-section story-section revision-section">
          <StoryGeometry variant="revision" />
          <div className="landing-container story-grid">
            <Reveal className="story-copy">
              <p className="section-index">04 / REVISION &amp; RETENTION</p>
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
              <ProductPanel
                type="revision"
                title="Keep it fresh"
                subtitle="Your next revision sessions"
              />
            </Reveal>
          </div>
        </section>

        <section id="mastery" className="landing-section story-section mastery-section">
          <div className="landing-container">
            <MasteryDiagnostic>
              <Reveal className="story-copy">
                <p className="section-index">05 / WEAKNESS &amp; MASTERY</p>
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

        <section id="progress" className="landing-section progress-section">
          <div className="landing-container">
            <Reveal>
              <div className="editorial-grid">
                <p className="section-index">06 / PROGRESS &amp; READINESS</p>
                <div>
                  <h2>
                    SEE THE PROGRESS.
                    <br />
                    FIND YOUR FOCUS.
                  </h2>
                  <p className="section-copy">
                    Look across coverage, retention, consistency, and weak areas.
                    Understand how your preparation is moving, and where your next effort
                    matters most.
                  </p>
                </div>
              </div>
              <div className="readiness-visual">
                <div>
                  <span className="micro">PREPARATION SNAPSHOT / SAMPLE</span>
                  <h3>
                    Keep building.
                    <br />
                    You have a direction.
                  </h3>
                  <p>
                    A preparation indicator based on your tracked progress. It is not a
                    hiring prediction or guarantee.
                  </p>
                </div>
                <dl>
                  {[
                    ["Coverage", "Foundations in place", "68%"],
                    ["Retention", "Revision needs attention", "42%"],
                    ["Consistency", "A routine taking shape", "56%"],
                  ].map(([label, detail, width]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{detail}</dd>
                      <div className="demo-track" aria-hidden="true">
                        <span style={{ width }} />
                      </div>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="method" className="landing-section method-section">
          <div className="landing-container">
            <Reveal>
              <p className="section-index">FROM INTENTION TO ACTION</p>
              <h2>
                A SYSTEM YOU
                <br />
                CAN COME BACK TO.
              </h2>
            </Reveal>
            <JourneyPath
              steps={[
                "Set your target",
                "Follow the roadmap",
                "Practice & revise",
                "Measure mastery",
              ]}
            />
            <div className="method-details">
              {[
                "Start with your role, timeline, and available study time.",
                "Build understanding through a deliberate sequence of topics.",
                "Record your attempts. Return to what needs another look.",
                "Use your progress to decide where to focus next.",
              ].map((text) => (
                <p key={text}>{text}</p>
              ))}
            </div>
          </div>
        </section>

        <section id="experience" className="landing-section experience-section">
          <div className="landing-container">
            <Reveal>
              <div className="experience-heading">
                <div>
                  <p className="section-index">THE PREPARATION EXPERIENCE</p>
                  <h2>
                    ONE WORKSPACE.
                    <br />A CLEARER MIND.
                  </h2>
                </div>
                <p className="section-copy">
                  Move between your plan, roadmap, practice, and revision. Try a sample
                  day below.
                </p>
              </div>
              <ProductShowcase />
            </Reveal>
          </div>
        </section>

        <section className="landing-section final-section">
          <StoryGeometry variant="terminal" />
          <div className="landing-container">
            <Reveal>
              <p className="section-index">YOUR NEXT STEP STARTS HERE</p>
              <h2>
                YOUR PREPARATION
                <br />
                NEEDS A <span>SYSTEM.</span>
              </h2>
              <p className="section-copy">
                Build a clear plan. Practice with intent. Revise what matters.
                <br />
                See your progress toward interview readiness.
              </p>
              <StartButton>Try the preparation preview</StartButton>
            </Reveal>
          </div>
        </section>
      </main>
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="footer-top">
            <div>
              <PrimeLogo size="md" />
              <p>
                Preparation Roadmap for Interviews,
                <br />
                Mastery &amp; Excellence
              </p>
            </div>
            <nav aria-label="Footer navigation">
              <a href="#roadmap">Roadmap</a>
              <a href="#features">Practice</a>
              <a href="#progress">Progress</a>
              <a href="#experience">Explore PRIME</a>
            </nav>
          </div>
          <div className="footer-bottom">
            <span>© 2026 PRIME</span>
            <span>PURE BLACK. PURE RED. PURE FOCUS.</span>
            <a href="#main">Back to top</a>
          </div>
        </div>
      </footer>
    </LandingCanvas>
  );
}
