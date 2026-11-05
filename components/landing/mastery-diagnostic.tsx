"use client";

import { useRef, useState, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { motionDuration, motionEase, usePrimeReducedMotion } from "@/lib/motion";

type MasteryState = "mastered" | "strong" | "practicing" | "learning" | "needs-revision";
type Topic = {
  id: string;
  label: string;
  state: MasteryState;
  x: number;
  y: number;
  practice: string;
  revision: string;
  confidence: string;
  next: string;
  insight: string;
};

// Presentation fixtures only: no account, scores, or preparation logic.
const topics: Topic[] = [
  {
    id: "arrays",
    label: "Arrays",
    state: "mastered",
    x: 65,
    y: 215,
    practice: "Independent",
    revision: "Recalled clearly",
    confidence: "Confident",
    next: "Maintain with revision",
    insight:
      "The approach holds up across practice and revision. Keep it fresh as you move forward.",
  },
  {
    id: "two-pointers",
    label: "Two Pointers",
    state: "strong",
    x: 165,
    y: 295,
    practice: "Independent",
    revision: "Recalled clearly",
    confidence: "Comfortable",
    next: "Try a new variation",
    insight:
      "The core pattern is strong. A different problem variation can help check that understanding transfers.",
  },
  {
    id: "binary-search",
    label: "Binary Search",
    state: "needs-revision",
    x: 225,
    y: 135,
    practice: "Needed a hint",
    revision: "Hard to recall",
    confidence: "Uncertain",
    next: "Focused revision",
    insight:
      "Recent revision was difficult, despite completing the topic. Revisit the search boundaries before moving on.",
  },
  {
    id: "hashing",
    label: "Hashing",
    state: "practicing",
    x: 310,
    y: 235,
    practice: "With some hints",
    revision: "Partly recalled",
    confidence: "Building",
    next: "Practice independently",
    insight:
      "The idea is familiar. Try another problem without a hint to see which parts of the approach stay with you.",
  },
  {
    id: "trees",
    label: "Trees",
    state: "learning",
    x: 350,
    y: 50,
    practice: "Exploring patterns",
    revision: "Not reviewed yet",
    confidence: "Developing",
    next: "Build the foundations",
    insight:
      "Start with traversals and explain the steps in your own words before taking on more complex patterns.",
  },
  {
    id: "graphs",
    label: "Graphs",
    state: "learning",
    x: 455,
    y: 140,
    practice: "Getting started",
    revision: "Not reviewed yet",
    confidence: "Developing",
    next: "Learn the representations",
    insight:
      "Build a clear picture of nodes, edges, and representations. Mastery will develop through practice and revision.",
  },
];
const stateLabels: Record<MasteryState, string> = {
  mastered: "Mastered",
  strong: "Strong",
  practicing: "Practicing",
  learning: "Learning",
  "needs-revision": "Needs revision",
};
const connections = [
  "M65 215L105 175H185L225 135",
  "M65 215L105 255H125L165 295",
  "M65 215H180L200 235H310",
  "M225 135L270 90H310L350 50",
  "M350 50L395 95H410L455 140",
  "M225 135H305L310 140H455",
  "M225 135L270 180H280L310 235",
];

export function MasteryDiagnostic({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState("binary-search");
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const reduced = usePrimeReducedMotion();
  const active = topics.find((topic) => topic.id === (hovered ?? focused ?? selected))!;
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const backgroundX = useTransform(scrollYProgress, [0, 0.5, 1], [-16, 0, 8]);
  const backgroundOpacity = useTransform(
    scrollYProgress,
    [0, 0.45, 1],
    [0.03, 0.1, 0.03]
  );
  const select = (id: string) => {
    setSelected(id);
    setReviewOpen(false);
  };
  return (
    <div
      ref={ref}
      className="mastery-diagnostic"
      aria-label="Illustrative mastery diagnostic"
    >
      <div className="mastery-map-column">
        <motion.svg
          className="mastery-backdrop"
          viewBox="0 0 600 650"
          fill="none"
          aria-hidden="true"
          style={{
            x: reduced ? 0 : backgroundX,
            opacity: reduced ? 0.06 : backgroundOpacity,
          }}
        >
          <path
            d="M-180 490H-30L120 340H185L330 195V105L400 35V260L215 445H150L-10 605H-180"
            stroke="#ff0000"
          />
          <path d="M-200 550H0L150 400H215L360 255V165L430 95" stroke="#ff0000" />
        </motion.svg>
        <div className="mastery-map-heading">
          <span className="micro">MASTERY MAP</span>
          <span className="micro">ILLUSTRATIVE EXAMPLE</span>
        </div>
        <p className="mastery-map-intro">
          Completion is a step. Understanding is the signal.
        </p>
        <p id="mastery-map-relationships" className="sr-only">
          Arrays connects to Two Pointers, Hashing, and Binary Search. Binary Search
          connects to Trees, Hashing, and Graphs. Trees also connects to Graphs. Binary
          Search is the example revision focus. Select a topic to inspect its practice,
          revision, confidence, and next focus.
        </p>
        <div
          className="mastery-network"
          onMouseLeave={() => setHovered(null)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setFocused(null);
          }}
        >
          <svg
            className="mastery-connections"
            viewBox="0 0 520 350"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <g stroke="white" strokeOpacity=".1" fill="none">
              {connections.map((d) => (
                <path key={d} d={d} />
              ))}
            </g>
            {connections.slice(1).map((d, i) => (
              <motion.path
                key={d}
                d={d}
                stroke="white"
                strokeOpacity={i === 0 ? 0.24 : 0.14}
                fill="none"
                initial={false}
                whileInView={reduced ? {} : { pathLength: [0, 1] }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.45, delay: i * 0.035, ease: motionEase.enter }}
              />
            ))}
            <motion.path
              className="mastery-focus-path"
              d={connections[0]}
              stroke="#ff0000"
              fill="none"
              initial={false}
              whileInView={reduced ? {} : { pathLength: [0, 1] }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.45, delay: 0.25, ease: motionEase.enter }}
            />
            <motion.path
              className="mastery-insight-path"
              d="M225 135V163L240 178V330L220 350"
              stroke="#ff0000"
              strokeOpacity=".45"
              fill="none"
              initial={false}
              whileInView={reduced ? {} : { pathLength: [0, 1] }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.3, delay: 0.6, ease: motionEase.enter }}
            />
          </svg>
          <ol
            className="mastery-topics"
            aria-label="Topic mastery relationships"
            aria-describedby="mastery-map-relationships"
          >
            {topics.map((topic, index) => (
              <motion.li
                key={topic.id}
                className={`mastery-topic state-${topic.state}`}
                style={
                  {
                    "--topic-x": `${(topic.x / 520) * 100}%`,
                    "--topic-y": `${(topic.y / 350) * 100}%`,
                  } as React.CSSProperties
                }
                initial={false}
                whileInView={reduced ? {} : { opacity: [0.6, 1], scale: [0.94, 1] }}
                viewport={{ once: true }}
                transition={{
                  duration: motionDuration.moderate,
                  delay: 0.35 + index * 0.035,
                  ease: motionEase.enter,
                }}
              >
                <button
                  type="button"
                  className="mastery-node"
                  aria-pressed={selected === topic.id}
                  aria-controls="mastery-topic-insight"
                  aria-label={`${topic.label} — ${stateLabels[topic.state]}`}
                  onMouseEnter={() => setHovered(topic.id)}
                  onFocus={() => setFocused(topic.id)}
                  onClick={() => select(topic.id)}
                >
                  <span className="mastery-node-target" aria-hidden="true">
                    <span className="mastery-node-dot" />
                  </span>
                  <span className="mastery-node-label">{topic.label}</span>
                  <span className="mastery-node-state">{stateLabels[topic.state]}</span>
                </button>
              </motion.li>
            ))}
          </ol>
        </div>
        <div className="mastery-map-key" aria-label="Map legend">
          <span>
            <i className="key-solid" />
            Mastered / strong
          </span>
          <span>
            <i className="key-outline" />
            Practicing / learning
          </span>
          <span>
            <i className="key-attention" />
            Needs revision
          </span>
        </div>
      </div>
      <div className="mastery-detail-column">
        {children}
        <motion.div
          className={`mastery-insight ${active.state === "needs-revision" ? "insight-attention" : ""}`}
          id="mastery-topic-insight"
          initial={false}
          whileInView={reduced ? {} : { opacity: [0.6, 1] }}
          viewport={{ once: true }}
          transition={{ delay: 0.7, duration: 0.2 }}
        >
          <p className="micro">
            {active.state === "needs-revision" ? "NEEDS ATTENTION" : "TOPIC INSIGHT"}
            <span>{stateLabels[active.state]}</span>
          </p>
          <h3>{active.label}</h3>
          <p className="mastery-insight-copy">{active.insight}</p>
          <dl className="mastery-evidence">
            <div>
              <dt>Practice</dt>
              <dd>{active.practice}</dd>
            </div>
            <div>
              <dt>Recent revision</dt>
              <dd>{active.revision}</dd>
            </div>
            <div>
              <dt>Confidence</dt>
              <dd>{active.confidence}</dd>
            </div>
          </dl>
          <p className="mastery-next">
            <span className="micro">NEXT FOCUS</span>
            {active.next}
          </p>
          {active.id === "binary-search" && (
            <>
              <button
                type="button"
                className="mastery-review"
                aria-expanded={reviewOpen}
                aria-controls="mastery-review-preview"
                onClick={() => setReviewOpen(!reviewOpen)}
              >
                {reviewOpen ? "Close review preview" : "Review next"}
              </button>
              <div
                id="mastery-review-preview"
                hidden={!reviewOpen}
                className="mastery-review-preview"
              >
                <p className="micro">SAMPLE REVIEW PLAN</p>
                <ol>
                  <li>Recall the search boundaries without your notes.</li>
                  <li>Trace a small example and explain why the range shrinks.</li>
                  <li>Try a variation independently, then record what felt difficult.</li>
                </ol>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
