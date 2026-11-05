"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { PrimeMark } from "@/components/branding";
import {
  PRIME_MARK_PATH_LOWER,
  PRIME_MARK_PATH_UPPER,
} from "@/components/branding/prime-mark";
import { usePrimeReducedMotion, motionEase } from "@/lib/motion";

const signals = [
  { name: "DSA", status: "Building depth", width: "68%" },
  { name: "SQL", status: "Finding a rhythm", width: "56%" },
  { name: "Fundamentals", status: "Foundations in place", width: "74%" },
  { name: "Revision", status: "Needs another look", width: "38%" },
];
export function ProgressSignals() {
  const reduced = usePrimeReducedMotion();
  return (
    <div className="progress-signals" aria-label="Illustrative preparation signals">
      <p className="micro signals-caption">SAMPLE PREPARATION SIGNALS</p>
      {signals.map((signal, index) => (
        <div className={`preparation-signal signal-${index}`} key={signal.name}>
          <div>
            <h3>{signal.name}</h3>
            <span>{signal.status}</span>
          </div>
          <div className="signal-track" aria-hidden="true">
            <motion.span
              style={{ width: signal.width, transformOrigin: "left" }}
              initial={false}
              whileInView={reduced ? {} : { scaleX: [0, 1] }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.06, ease: motionEase.enter }}
            />
          </div>
        </div>
      ))}
      <p className="signals-footnote">
        A fuller picture than a solved count. A clearer place to focus.
      </p>
    </div>
  );
}
const dimensions = [
  {
    name: "DSA",
    state: "Building depth",
    detail:
      "Look at the quality of your attempts across patterns, beyond how many problems you have finished.",
  },
  {
    name: "Fundamentals",
    state: "Foundations in place",
    detail:
      "Bring core concepts back into focus and check whether you can explain them without your notes.",
  },
  {
    name: "SQL",
    state: "Practicing",
    detail:
      "Use varied query problems to see which concepts you can apply independently.",
  },
  {
    name: "Aptitude",
    state: "Developing",
    detail:
      "Connect coverage with the reasoning you can reproduce under time constraints.",
  },
  {
    name: "Retention",
    state: "Needs attention",
    detail:
      "Recent recall deserves a focused review. Strengthen what is fading before adding more material.",
  },
  {
    name: "Consistency",
    state: "Taking shape",
    detail:
      "Look at meaningful preparation across days, including revision and time to rest.",
  },
];
export function ReadinessPreview() {
  const [selected, setSelected] = useState(4);
  const id = useId();
  const reduced = usePrimeReducedMotion();
  return (
    <div className="readiness-composition" aria-label="Sample preparation readiness">
      <div className="readiness-constellation">
        <svg
          viewBox="0 0 600 360"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
        >
          {[
            "M60 54H174L300 180",
            "M300 54V180",
            "M540 54H426L300 180",
            "M60 306H174L300 180",
            "M300 306V180",
            "M540 306H426L300 180",
          ].map((d, index) => (
            <motion.path
              key={d}
              d={d}
              stroke={selected === index ? "#ff0000" : "rgba(255,255,255,.14)"}
              initial={false}
              whileInView={reduced ? {} : { pathLength: [0, 1] }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.035, ease: motionEase.enter }}
            />
          ))}
        </svg>
        <div className="readiness-center">
          <PrimeMark size={48} variant="white" />
          <span>
            Preparation
            <br />
            readiness
          </span>
        </div>
        <div
          className="readiness-dimensions"
          role="group"
          aria-label="Preparation dimensions"
        >
          {dimensions.map((item, index) => (
            <button
              type="button"
              key={item.name}
              style={{
                left: `${[10, 50, 90][index % 3]}%`,
                top: index < 3 ? "15%" : "85%",
              }}
              aria-pressed={selected === index}
              aria-controls={`${id}-dimension`}
              onClick={() => setSelected(index)}
            >
              <span>{item.name}</span>
              <small>{item.state}</small>
            </button>
          ))}
        </div>
      </div>
      <div
        className="readiness-dimension-detail"
        id={`${id}-dimension`}
        aria-live="polite"
      >
        <p className="micro">CURRENT FOCUS / {dimensions[selected].name.toUpperCase()}</p>
        <p>{dimensions[selected].detail}</p>
      </div>
      <p className="readiness-disclaimer">
        Illustrative preparation signals. Readiness reflects your tracked preparation, not
        a prediction of hiring outcomes.
      </p>
    </div>
  );
}

export function FooterGeometry() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrimeReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [24, 0]);
  return (
    <motion.div
      ref={ref}
      className="cinematic-footer-geometry footer-depth-field"
      aria-hidden="true"
      style={{ y: reduced ? 0 : y }}
    >
      <svg viewBox="0 0 1200 700" fill="none" preserveAspectRatio="xMidYMid slice">
        <path
          className="footer-far-path"
          d="M-120 360H90L250 200H440L610 370H770L1050 90H1320M-100 660H180L350 490H570L790 270H940L1210 0"
          stroke="white"
          strokeOpacity=".025"
        />
        <path
          d="M-100 510H155L330 335H535L680 480H830L1140 170H1300"
          stroke="red"
          strokeOpacity=".07"
        />
      </svg>
    </motion.div>
  );
}
export function FooterTerminal() {
  const reduced = usePrimeReducedMotion();
  return (
    <div className="footer-terminal">
      <div className="footer-terminal-ambient" aria-hidden="true" />
      <svg viewBox="0 0 600 340" fill="none" aria-hidden="true">
        <path
          className="footer-terminal-distant"
          d="M-60 200H160L205 155H285L352 222H434"
          stroke="white"
          strokeOpacity=".12"
        />
        <path d="M40 80H180L270 170H350L402 222H434" stroke="red" strokeOpacity=".16" />
        <motion.path
          d="M20 300H205L283 222H434"
          stroke="red"
          initial={false}
          whileInView={reduced ? {} : { pathLength: [0, 1] }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.85, ease: motionEase.enter }}
        />
        <g transform="translate(425 180) scale(3)" fill="red">
          <path d={PRIME_MARK_PATH_LOWER} />
          <path d={PRIME_MARK_PATH_UPPER} />
        </g>
      </svg>
      <div className="footer-terminal-caption">
        <span className="micro">PRIME TERMINAL</span>
        <p>PURE BLACK. PURE RED. PURE FOCUS.</p>
      </div>
    </div>
  );
}
export function FooterWordmark({ children }: { children: ReactNode }) {
  const reduced = usePrimeReducedMotion();
  return (
    <motion.div
      className="footer-wordmark-reveal"
      initial={false}
      whileInView={
        reduced
          ? {}
          : {
              opacity: [0.65, 1],
              y: [18, 0],
              clipPath: ["inset(8% 0 0 0)", "inset(0% 0 0 0)"],
            }
      }
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, ease: motionEase.enter }}
    >
      {children}
    </motion.div>
  );
}
