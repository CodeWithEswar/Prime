import {
  Route02Icon,
  FileSearchIcon,
  RepeatIcon,
  Target01Icon,
  Diamond01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { PrimeWordmark } from "@/components/branding";
import { Reveal } from "./landing-motion";
import {
  ProgressSignals,
  ReadinessPreview,
  FooterGeometry,
  FooterTerminal,
  FooterWordmark,
} from "./editorial-motion";
import "./editorial-previews.css";

export function ClaritySection() {
  return (
    <section id="features" className="landing-section clarity-section">
      <div className="landing-container">
        <Reveal>
          <div className="clarity-heading">
            <div>
              <p className="section-index">CLARITY AT EVERY STEP</p>
              <h2>
                LESS GUESSWORK.
                <br />
                MORE DIRECTION.
              </h2>
            </div>
            <p className="section-copy">
              Preparation makes more sense when you can see the next step, understand the
              last attempt, and know what deserves another look.
            </p>
          </div>
          <div className="clarity-principles">
            {[
              {
                n: "01",
                icon: Route02Icon,
                title: "Know your next move.",
                copy: "A deliberate sequence gives every session a direction.",
                label: "NEXT TOPIC",
                value: "Two Pointers",
                href: "#roadmap",
              },
              {
                n: "02",
                icon: FileSearchIcon,
                title: "Make the work count.",
                copy: "The way you reached a solution tells you what to do next.",
                label: "LAST ATTEMPT",
                value: "Needed a hint",
                href: "#practice",
              },
              {
                n: "03",
                icon: RepeatIcon,
                title: "Keep what you learn.",
                copy: "Return to familiar ideas and see what you can recall.",
                label: "RETURN TODAY",
                value: "Binary Search",
                href: "#revision",
              },
            ].map((item) => (
              <a href={item.href} key={item.n}>
                <div className="clarity-rule">
                  <span className="micro">{item.n} /</span>
                  <Icon icon={item.icon} size={25} aria-hidden="true" />
                </div>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
                <div className="clarity-fragment">
                  <span className="micro">{item.label}</span>
                  <span>{item.value}</span>
                </div>
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
export function ProgressStory() {
  return (
    <section id="progress" className="landing-section editorial-progress">
      <div className="landing-container">
        <Reveal>
          <div className="editorial-split">
            <div>
              <p className="section-index">06 / PROGRESS</p>
              <h2>
                SEE THE WORK.
                <br />
                BEYOND THE STREAK.
              </h2>
            </div>
            <p className="section-copy">
              See what is moving forward, what needs another look, and where your next
              hour matters most.
            </p>
          </div>
          <ProgressSignals />
        </Reveal>
      </div>
    </section>
  );
}
export function ReadinessStory() {
  return (
    <section id="readiness" className="landing-section editorial-readiness">
      <div className="landing-container story-grid">
        <Reveal className="story-copy">
          <p className="section-index">07 / READINESS</p>
          <h2>
            KNOW WHERE
            <br />
            YOU STAND.
          </h2>
          <p className="section-copy">
            Bring coverage, recall, and consistency into one view. Understand the
            preparation behind your confidence, and the areas that need more attention.
          </p>
          <p className="quiet-detail">
            Choose a dimension to explore a sample preparation signal.
          </p>
        </Reveal>
        <Reveal>
          <ReadinessPreview />
        </Reveal>
      </div>
    </section>
  );
}
const method = [
  {
    icon: Target01Icon,
    title: "Set the target",
    copy: "Start with your role, timeline, and the preparation time you can make room for.",
  },
  {
    icon: Route02Icon,
    title: "Follow the roadmap",
    copy: "Know what comes next. Build understanding through a deliberate sequence.",
  },
  {
    icon: RepeatIcon,
    title: "Practice & revise",
    copy: "Record the attempt. Revisit the difficult parts. Turn understanding into recall.",
  },
  {
    icon: Diamond01Icon,
    title: "Measure mastery",
    copy: "See what stays with you and use that evidence to choose your next focus.",
  },
];
export function PreparationMethod() {
  return (
    <section id="method" className="landing-section editorial-method">
      <div className="landing-container">
        <Reveal>
          <div className="editorial-split">
            <div>
              <p className="section-index">08 / METHOD</p>
              <h2>
                A SYSTEM YOU
                <br />
                CAN RETURN TO.
              </h2>
            </div>
            <p className="section-copy">
              Set a direction. Follow through. Learn from the work, then return with a
              clearer focus.
            </p>
          </div>
        </Reveal>
        <div className="method-open-grid">
          <svg
            viewBox="0 0 1000 500"
            preserveAspectRatio="none"
            aria-hidden="true"
            fill="none"
          >
            <path
              d="M100 35H440L500 95V405L560 465H900"
              stroke="red"
              strokeOpacity=".1"
            />
          </svg>
          {method.map((item, index) => (
            <Reveal key={item.title} className="method-open-step">
              <div className="method-step-top">
                <span className="micro">0{index + 1}</span>
                <Icon icon={item.icon} size={25} aria-hidden="true" />
              </div>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
export function QuietTransition() {
  return (
    <section
      className="landing-section quiet-transition"
      aria-label="Preparation with direction"
    >
      <div className="landing-container">
        <Reveal>
          <p>
            Build understanding.
            <br />
            <span>Make it last.</span>
          </p>
          <svg viewBox="0 0 400 60" fill="none" aria-hidden="true">
            <path d="M0 50H160L200 10H400" stroke="red" strokeOpacity=".25" />
          </svg>
        </Reveal>
      </div>
    </section>
  );
}

export function CinematicFooter() {
  return (
    <footer
      className="cinematic-footer footer-terminal-scene"
      aria-labelledby="footer-arrival-heading"
    >
      <FooterGeometry />
      <div className="landing-container">
        <div className="footer-arrival">
          <Reveal className="footer-arrival-copy">
            <p className="section-index">09 / PRIME</p>
            <h2 id="footer-arrival-heading">
              PREPARATION SHOULD
              <br />
              LEAD SOMEWHERE.
            </h2>
            <p>
              Plan deliberately. Practice with intent. Return to what needs attention.
              Build understanding you can rely on.
            </p>
          </Reveal>
          <FooterTerminal />
        </div>
        <FooterWordmark>
          <PrimeWordmark size={200} variant="white" className="cinematic-wordmark" />
        </FooterWordmark>
        <div className="footer-brand-definition">
          <p>
            Preparation Roadmap for Interviews,
            <br />
            Mastery &amp; Excellence.
          </p>
          <span className="micro">DIRECTION. UNDERSTANDING. MASTERY.</span>
        </div>
        <div className="cinematic-footer-navigation footer-navigation-rail">
          <p className="micro">EXPLORE PRIME</p>
          <nav aria-label="Footer navigation">
            <ol>
              {[
                ["Roadmap", "#roadmap"],
                ["Practice", "#practice"],
                ["Revision", "#revision"],
                ["Progress", "#progress"],
                ["Method", "#method"],
                ["System Status", "/status"],
              ].map(([name, href], index) => (
                <li key={href}>
                  <a href={href}>
                    <span className="footer-link-number">0{index + 1}</span>
                    <span>{name}</span>
                    <i aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
        <div className="cinematic-footer-bottom">
          <span>© 2026 PRIME</span>
          <a
            href="/status"
            className="footer-status-pill inline-flex items-center gap-2 text-xs text-neutral-400 transition-colors hover:text-white"
          >
            <span
              className="inline-block h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(34,197,94,0.6)] animate-pulse"
              aria-hidden="true"
            />
            <span>System Status</span>
          </a>
          <a href="/login" className="footer-sign-in">
            Sign in to PRIME
          </a>
          <a href="#main" className="footer-return">
            <span>Back to top</span>
            <i aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
