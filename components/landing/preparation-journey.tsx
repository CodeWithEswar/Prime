"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import {
  Route02Icon,
  SourceCodeIcon,
  FileSearchIcon,
  RepeatIcon,
  Diamond01Icon,
} from "@hugeicons/core-free-icons";
import { Icon, type IconSvgElement } from "@/components/ui/icon";
import {
  PRIME_MARK_PATH_LOWER,
  PRIME_MARK_PATH_UPPER,
} from "@/components/branding/prime-mark";
import { WordReveal } from "./motion/text/word-reveal";
import { motionDuration, motionEase, usePrimeReducedMotion } from "@/lib/motion";
import "./preparation-journey.css";

type Stage = {
  title: string;
  description: string;
  icon: IconSvgElement;
  href: string;
  destination: string;
  y: number;
};
const stages: Stage[] = [
  {
    title: "Plan",
    description: "Turn your target into a clear preparation path.",
    icon: Route02Icon,
    href: "#roadmap",
    destination: "the roadmap",
    y: 70,
  },
  {
    title: "Practice",
    description: "Work through problems and fundamentals with intent.",
    icon: SourceCodeIcon,
    href: "#practice",
    destination: "practice tracking",
    y: 110,
  },
  {
    title: "Review",
    description: "Understand what worked and where you struggled.",
    icon: FileSearchIcon,
    href: "#mastery",
    destination: "the mastery map",
    y: 70,
  },
  {
    title: "Revise",
    description: "Return to weak knowledge before it begins to fade.",
    icon: RepeatIcon,
    href: "#revision",
    destination: "revision",
    y: 110,
  },
  {
    title: "Master",
    description: "Build understanding you can reproduce under pressure.",
    icon: Diamond01Icon,
    href: "#progress",
    destination: "preparation readiness",
    y: 40,
  },
];
const desktopPaths = [
  "M0 70H100",
  "M100 70H220L260 110H300",
  "M300 110H420L460 70H500",
  "M500 70H620L660 110H700",
  "M700 110H790L860 40H900",
  "M900 40H925L960 5H985",
];
const mobilePaths = [
  "M22 0V44",
  "M22 44V90L38 106V138L22 154V200",
  "M22 200V246L38 262V294L22 310V356",
  "M22 356V402L38 418V450L22 466V512",
  "M22 512V558L38 574V606L22 622V668",
  "M22 668V698L40 716H58",
];
// Distance to each desktop node along the architectural path, normalized once.
const lengths = [
  100,
  160 + Math.hypot(40, 40),
  160 + Math.hypot(40, 40),
  160 + Math.hypot(40, 40),
  130 + Math.hypot(70, 70),
  50 + Math.hypot(35, 35),
];
const total = lengths.reduce((sum, length) => sum + length, 0);
const stops = [
  0,
  ...lengths.map(
    (_, index) =>
      lengths.slice(0, index + 1).reduce((sum, length) => sum + length, 0) / total
  ),
];
const activation = stops.slice(1, 6);

export function PreparationJourney() {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrimeReducedMotion();
  const [active, setActive] = useState(0);
  const current = useRef(0);
  const [preview, setPreview] = useState<number | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 22%", "end 85%"],
  });
  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ["#000000", "#050000", "#000000"]
  );
  const ambientX = useTransform(scrollYProgress, [0, 1], ["0%", "70%"]);
  const ambientOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.1, 0.3, 0.08]);
  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    let next = 0;
    for (let index = 1; index < stages.length; index++)
      if (progress >= activation[index]) next = index;
    const boundary = activation[Math.max(current.current, next)];
    // A narrow dead band avoids flickering when a trackpad rests on a threshold.
    if (
      next !== current.current &&
      (next > current.current ? progress > boundary + 0.006 : progress < boundary - 0.006)
    ) {
      current.current = next;
      setActive(next);
    }
  });
  return (
    <motion.section
      ref={ref}
      id="journey"
      className="preparation-journey"
      aria-labelledby="preparation-journey-heading"
      style={{ backgroundColor: reduced ? "#000" : backgroundColor }}
    >
      <div className="preparation-journey-sticky landing-container">
        <header className="preparation-journey-heading">
          <p className="section-index">THE PRIME JOURNEY</p>
          <h2 id="preparation-journey-heading">
            FROM A PLAN
            <br className="journey-heading-break" /> TO MASTERY.
          </h2>
          <WordReveal
            text="Turn preparation into a clear sequence of action, reflection, and revision. Every step makes the next one clearer."
            highlightWords={["sequence", "action", "reflection", "revision"]}
          />
        </header>
        <motion.div
          className="preparation-journey-ambient"
          aria-hidden="true"
          style={{ x: reduced ? 0 : ambientX, opacity: reduced ? 0.1 : ambientOpacity }}
        />
        <svg
          className="preparation-journey-backdrop"
          viewBox="0 0 1200 500"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M-200 250H50L200 100H325L475 -50M1200 300H1080L980 400H850L750 500"
            stroke="#ff0000"
          />
        </svg>
        <div
          className="preparation-journey-track"
          onMouseLeave={() => setPreview(null)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setPreview(null);
          }}
        >
          <JourneyPaths
            progress={scrollYProgress}
            active={active}
            preview={preview}
            reduced={reduced}
            mobile={false}
          />
          <JourneyPaths
            progress={scrollYProgress}
            active={active}
            preview={preview}
            reduced={reduced}
            mobile
          />
          <ol className="preparation-journey-stages" aria-label="Preparation stages">
            {stages.map((stage, index) => {
              const state =
                index < active ? "completed" : index === active ? "active" : "future";
              return (
                <li
                  key={stage.title}
                  className={`preparation-stage ${index === 4 ? "preparation-stage-master" : ""}`}
                  data-state={state}
                  data-preview={preview === index}
                  style={
                    { "--stage-y": `${(stage.y / 300) * 100}%` } as React.CSSProperties
                  }
                >
                  <span className="preparation-stage-number">0{index + 1}</span>
                  <a
                    className="preparation-stage-node"
                    href={stage.href}
                    aria-label={`${stage.title}: explore ${stage.destination}`}
                    aria-current={state === "active" ? "step" : undefined}
                    onMouseEnter={() => setPreview(index)}
                    onFocus={() => setPreview(index)}
                  >
                    <motion.span
                      className="preparation-stage-icon"
                      initial={false}
                      animate={
                        reduced
                          ? {}
                          : {
                              scale: state === "future" ? 0.96 : 1,
                              opacity: state === "future" ? 0.65 : 1,
                              rotate: index === 3 && state === "future" ? -20 : 0,
                            }
                      }
                      transition={{
                        duration: motionDuration.moderate,
                        ease: motionEase.enter,
                      }}
                    >
                      <Icon
                        icon={stage.icon}
                        size={21}
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                    </motion.span>
                    {index === 4 && (
                      <svg
                        className="preparation-master-terminal"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d={PRIME_MARK_PATH_LOWER} />
                        <path d={PRIME_MARK_PATH_UPPER} />
                      </svg>
                    )}
                  </a>
                  <div className="preparation-stage-copy">
                    <h3>{stage.title}</h3>
                    <p>{stage.description}</p>
                    <span className="preparation-stage-status">
                      {state === "active"
                        ? "Current stage"
                        : state === "completed"
                          ? "Earlier stage"
                          : "Ahead on the path"}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
        <p className="preparation-journey-caption">
          <span className="micro">FOLLOW THE PATH</span>
          <span>Action. Reflection. Retention. Repeatable understanding.</span>
        </p>
      </div>
    </motion.section>
  );
}
function JourneyPaths({
  progress,
  active,
  preview,
  reduced,
  mobile,
}: {
  progress: MotionValue<number>;
  active: number;
  preview: number | null;
  reduced: boolean;
  mobile: boolean;
}) {
  const paths = mobile ? mobilePaths : desktopPaths;
  return (
    <svg
      className={`preparation-journey-path ${mobile ? "journey-path-mobile" : "journey-path-desktop"}`}
      viewBox={mobile ? "0 0 72 730" : "0 0 1000 300"}
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
    >
      {paths.map((path, index) => (
        <JourneySegment
          key={path}
          path={path}
          index={index}
          progress={progress}
          active={active}
          preview={preview}
          reduced={reduced}
        />
      ))}
    </svg>
  );
}
function JourneySegment({
  path,
  index,
  progress,
  active,
  preview,
  reduced,
}: {
  path: string;
  index: number;
  progress: MotionValue<number>;
  active: number;
  preview: number | null;
  reduced: boolean;
}) {
  const length = useTransform(progress, [stops[index], stops[index + 1]], [0, 1]);
  const finished = index <= active;
  return (
    <g>
      <path d={path} stroke="white" strokeOpacity=".12" />
      <motion.path
        className="preparation-progress-path"
        d={path}
        stroke={finished ? "rgba(255,255,255,.28)" : reduced ? "transparent" : "#ff0000"}
        style={{ pathLength: reduced ? 1 : length }}
      />
      <path d={path} stroke="white" strokeOpacity={preview === index - 1 ? 0.5 : 0} />
    </g>
  );
}
