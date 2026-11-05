"use client";

import { useId, useState } from "react";
import { motion } from "motion/react";
import {
  Route02Icon,
  SourceCodeIcon,
  RepeatIcon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Checkbox } from "@/components/ui/checkbox";
import { motionEase, usePrimeReducedMotion } from "@/lib/motion";
import "./editorial-previews.css";

const roadmap = [
  {
    name: "Arrays",
    state: "Foundation established",
    detail:
      "Traverse, compare, and transform. A foundation you’ll use across the patterns ahead.",
    action: "Keep the fundamentals fresh.",
    x: 12,
    y: 12,
  },
  {
    name: "Two Pointers",
    state: "Current topic",
    detail:
      "Learn how two positions can narrow a search. Trace the movement before trying a variation.",
    action: "Practice the pattern independently.",
    x: 36,
    y: 36,
  },
  {
    name: "Sliding Window",
    state: "Up next",
    detail: "Build on pointer movement to reason about a changing range of elements.",
    action: "Connect the pattern to what you already know.",
    x: 64,
    y: 60,
  },
  {
    name: "Binary Search",
    state: "Further ahead",
    detail: "Recognize a searchable range and explain how each decision reduces it.",
    action: "Focus on boundaries and the stopping condition.",
    x: 88,
    y: 84,
  },
];
function PreviewHeading({ title, icon }: { title: string; icon: typeof Route02Icon }) {
  return (
    <div className="fragment-heading">
      <span className="micro">{title}</span>
      <Icon icon={icon} size={20} aria-hidden="true" />
      <span className="fragment-fixture">SAMPLE</span>
    </div>
  );
}
export function RoadmapPreview() {
  const [selected, setSelected] = useState(1);
  const id = useId();
  const reduced = usePrimeReducedMotion();
  const topic = roadmap[selected];
  return (
    <div className="feature-fragment roadmap-fragment" aria-label="Sample roadmap">
      <PreviewHeading title="A PATH WITH A NEXT STEP" icon={Route02Icon} />
      <div className="roadmap-route">
        <svg
          viewBox="0 0 400 300"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M48 36H90L144 108H195L256 180H300L352 252"
            stroke="white"
            strokeOpacity=".18"
          />
          <motion.path
            d="M48 36H90L144 108"
            stroke="red"
            initial={false}
            whileInView={reduced ? {} : { pathLength: [0, 1] }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: motionEase.enter }}
          />
        </svg>
        <ol>
          {roadmap.map((item, index) => (
            <li key={item.name} style={{ left: `${item.x}%`, top: `${item.y}%` }}>
              <button
                type="button"
                className={`roadmap-topic ${index === 1 ? "current-topic" : index === 0 ? "completed-topic" : ""}`}
                aria-pressed={selected === index}
                aria-controls={`${id}-topic`}
                onClick={() => setSelected(index)}
              >
                <span className="roadmap-point" aria-hidden="true" />
                <span>{item.name}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
      <div className="fragment-insight" id={`${id}-topic`} aria-live="polite">
        <p className="micro">{topic.state}</p>
        <h3>{topic.name}</h3>
        <p>{topic.detail}</p>
        <span className="fragment-next">{topic.action}</span>
      </div>
    </div>
  );
}
const plans: Record<string, [string, string, string][]> = {
  "30": [
    ["Recall", "Binary Search", "10 min"],
    ["Practice", "Two Pointers", "20 min"],
  ],
  "60": [
    ["Learn", "Two Pointers", "15 min"],
    ["Practice", "Arrays", "30 min"],
    ["Revise", "Binary Search", "15 min"],
  ],
  "90": [
    ["Learn", "SQL joins", "20 min"],
    ["Practice", "Two Pointers", "45 min"],
    ["Revise", "Binary Search", "25 min"],
  ],
};
export function DailyPlanPreview() {
  const [budget, setBudget] = useState("60");
  const [completed, setCompleted] = useState<string[]>([]);
  const id = useId();
  return (
    <div className="feature-fragment daily-fragment" aria-label="Sample daily plan">
      <PreviewHeading title="MAKE ROOM FOR PROGRESS" icon={Clock01Icon} />
      <div className="daily-budget">
        <p>Time for preparation</p>
        <div role="group" aria-label="Sample study time">
          {["30", "60", "90"].map((value) => (
            <button
              type="button"
              key={value}
              aria-pressed={budget === value}
              onClick={() => {
                setBudget(value);
                setCompleted([]);
              }}
            >
              {value} min
            </button>
          ))}
        </div>
      </div>
      <div className="daily-rhythm" aria-hidden="true">
        <span>Learn</span>
        <span>Practice</span>
        <span>Retain</span>
      </div>
      <ol className="daily-agenda">
        {plans[budget].map(([type, name, time], index) => (
          <li key={`${budget}-${name}`}>
            <span className="agenda-number">0{index + 1}</span>
            <div>
              <span className="micro">{type}</span>
              <label
                htmlFor={`${id}-${index}`}
                className={completed.includes(name) ? "task-done" : ""}
              >
                {name}
              </label>
            </div>
            <small>{time}</small>
            <Checkbox
              id={`${id}-${index}`}
              aria-label={`Complete sample ${name}`}
              checked={completed.includes(name)}
              onCheckedChange={(checked) =>
                setCompleted((current) =>
                  checked ? [...current, name] : current.filter((item) => item !== name)
                )
              }
            />
          </li>
        ))}
      </ol>
      <p className="fragment-note" aria-live="polite">
        {completed.length} of {plans[budget].length} steps complete. A sample balance of
        new work and recall.
      </p>
    </div>
  );
}
const outcomes = ["Independently", "With a hint", "Reviewed solution", "Still difficult"];
const practiceProblems = [
  { name: "Two Sum", topic: "Arrays", result: 0 },
  { name: "Binary Search", topic: "Search patterns", result: 1 },
  { name: "Merge Intervals", topic: "Intervals", result: 2 },
];
const reflections = [
  "The approach came from you. Return later to check whether it stays.",
  "The hint helped you move forward. Revisit the key step without it.",
  "Understanding the solution is a starting point. Reproduce the approach independently.",
  "Keep the difficult step visible. Break it down before trying again.",
];
export function PracticePreview() {
  const [selected, setSelected] = useState(1);
  const [results, setResults] = useState(
    practiceProblems.map((problem) => problem.result)
  );
  const id = useId();
  const problem = practiceProblems[selected];
  return (
    <div
      className="feature-fragment practice-fragment"
      aria-label="Sample practice reflection"
    >
      <PreviewHeading title="THE ATTEMPT IS THE SIGNAL" icon={SourceCodeIcon} />
      <div className="practice-composition">
        <div className="practice-problems" role="group" aria-label="Sample problems">
          {practiceProblems.map((item, index) => (
            <button
              type="button"
              key={item.name}
              aria-pressed={selected === index}
              aria-controls={`${id}-reflection`}
              onClick={() => setSelected(index)}
            >
              <span className="micro">
                0{index + 1} / {item.topic}
              </span>
              <strong>{item.name}</strong>
              <small>{outcomes[results[index]]}</small>
            </button>
          ))}
        </div>
        <div className="practice-reflection" id={`${id}-reflection`}>
          <p className="micro">REFLECT ON THE APPROACH</p>
          <h3>{problem.name}</h3>
          <p>How did this attempt feel?</p>
          <div
            className="outcome-options"
            role="group"
            aria-label="Sample attempt outcome"
          >
            {outcomes.map((outcome, index) => (
              <button
                type="button"
                key={outcome}
                aria-pressed={results[selected] === index}
                onClick={() =>
                  setResults((current) =>
                    current.map((result, i) => (i === selected ? index : result))
                  )
                }
              >
                {outcome}
              </button>
            ))}
          </div>
          <p className="reflection-note" aria-live="polite">
            {reflections[results[selected]]}
          </p>
          <span className="fragment-note">
            Illustrative reflection. Changes stay in this preview.
          </span>
        </div>
      </div>
    </div>
  );
}
const revisions = [
  {
    day: "Today",
    name: "Binary Search",
    note: "The approach was familiar. The boundaries need another look.",
    focus: "Recall the invariant. Trace a small example. Try it unaided.",
  },
  {
    day: "Tomorrow",
    name: "Hashing",
    note: "Keep the lookup pattern available when a problem changes shape.",
    focus: "Explain the trade-off, then try a different example.",
  },
  {
    day: "In 3 days",
    name: "DBMS Normalization",
    note: "Return to the ideas after time away from your notes.",
    focus: "Recall the normal forms and explain an example in your own words.",
  },
];
export function RevisionPreview() {
  const [selected, setSelected] = useState(0);
  const id = useId();
  const review = revisions[selected];
  const reduced = usePrimeReducedMotion();
  return (
    <div
      className="feature-fragment revision-fragment"
      aria-label="Sample revision timeline"
    >
      <PreviewHeading title="RETURN WITH INTENTION" icon={RepeatIcon} />
      <div className="revision-horizon">
        <svg
          viewBox="0 0 400 70"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
        >
          <path d="M0 50H80L110 20H220L250 50H400" stroke="white" strokeOpacity=".18" />
          <motion.path
            d="M0 50H80L110 20"
            stroke="red"
            initial={false}
            whileInView={reduced ? {} : { pathLength: [0, 1] }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: motionEase.enter }}
          />
        </svg>
        <div role="group" aria-label="Sample revision day">
          {revisions.map((item, index) => (
            <button
              type="button"
              className={index === 0 ? "revision-due" : ""}
              key={item.day}
              aria-pressed={selected === index}
              aria-controls={`${id}-revision`}
              onClick={() => setSelected(index)}
            >
              <span className="revision-point" aria-hidden="true" />
              <span>{item.day}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="revision-focus" id={`${id}-revision`} aria-live="polite">
        <p className="micro">
          {selected === 0
            ? "NEEDS ATTENTION / DUE TODAY"
            : "NEXT RETURN / " + review.day.toUpperCase()}
        </p>
        <h3>{review.name}</h3>
        <p>{review.note}</p>
        <div className="recall-sequence">
          <span>Recall</span>
          <i />
          <span>Trace</span>
          <i />
          <span>Apply</span>
        </div>
        <p className="fragment-next">{review.focus}</p>
      </div>
      <p className="fragment-note">
        An illustrative revision sequence. Return to understanding, not just completion.
      </p>
    </div>
  );
}
