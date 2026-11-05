"use client";
import { useState } from "react";
import { RepeatIcon, Calendar03Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { RoadmapPreview, PracticePreview, RevisionPreview } from "./feature-previews";

const tasks = [
  ["Arrays practice", "3 problems · Practice"],
  ["Normalization", "Review your notes · DBMS"],
  ["SQL queries", "5 queries · Practice"],
  ["Binary Search", "Due today · Revision"],
];
const views = ["Today", "Roadmap", "Practice", "Revision"] as const;
export function ProductShowcase() {
  const [view, setView] = useState<(typeof views)[number]>("Today");
  const [completed, setCompleted] = useState<string[]>([]);
  return (
    <div className="workspace-fragments">
      <nav className="workspace-preview-nav" aria-label="Product preview">
        {views.map((item) => (
          <button
            type="button"
            key={item}
            aria-pressed={view === item}
            onClick={() => setView(item)}
          >
            {item}
          </button>
        ))}
        <span className="micro">INTERACTIVE SAMPLE</span>
      </nav>
      <div className="workspace-content">
        {view === "Today" ? (
          <div className="workspace-day-fragments">
            <div className="workspace-day">
              <div className="fragment-heading">
                <span className="micro">TODAY / A FEW DELIBERATE STEPS</span>
                <Icon icon={Calendar03Icon} size={20} aria-hidden="true" />
              </div>
              <h3>Make today count.</h3>
              <div className="task-summary">
                <span>
                  {completed.length} of {tasks.length} tasks complete
                </span>
                <span>Sample plan</span>
              </div>
              <div className="demo-track">
                <span style={{ width: `${(completed.length / tasks.length) * 100}%` }} />
              </div>
              <div className="task-list">
                {tasks.map(([name, detail]) => (
                  <div className="demo-task" key={name}>
                    <Checkbox
                      id={`demo-${name}`}
                      aria-label={`Complete ${name}`}
                      checked={completed.includes(name)}
                      onCheckedChange={(checked) =>
                        setCompleted((current) =>
                          checked
                            ? [...current, name]
                            : current.filter((task) => task !== name)
                        )
                      }
                    />
                    <label
                      htmlFor={`demo-${name}`}
                      className={completed.includes(name) ? "task-done" : ""}
                    >
                      {name}
                      <small>{detail}</small>
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <aside className="workspace-return">
              <Icon icon={RepeatIcon} size={30} aria-hidden="true" />
              <p className="micro">RETURN TODAY</p>
              <h3>Binary Search</h3>
              <p>
                Make time for the idea that needs another look. Recall the boundaries
                before moving on.
              </p>
              <Button asChild variant="secondary">
                <a href="#revision">Explore revision</a>
              </Button>
            </aside>
          </div>
        ) : view === "Roadmap" ? (
          <RoadmapPreview />
        ) : view === "Practice" ? (
          <PracticePreview />
        ) : (
          <RevisionPreview />
        )}
        <p className="preview-note">
          Illustrative preview. Your changes stay here for this visit.
        </p>
      </div>
    </div>
  );
}
