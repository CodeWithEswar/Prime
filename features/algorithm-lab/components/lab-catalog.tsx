"use client";
import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Search01Icon, PlayIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { ALGORITHMS, searchAlgorithms } from "../registry/metadata";
import "./lab.css";
import "./catalog.css";
const subscribe = () => () => {};
export function LabCatalog() {
  const [query, setQuery] = useState(""),
    ready = useSyncExternalStore(
      subscribe,
      () => true,
      () => false
    ),
    algorithms = searchAlgorithms(query),
    categories = [...new Set(ALGORITHMS.map((a) => a.category))];
  return (
    <div className="lab-catalog">
      <header className="lab-catalog-hero">
        <div>
          <span className="lab-overline">PRIME / ALGORITHM LAB</span>
          <h1>
            Watch the state.
            <br />
            Trace the logic.
          </h1>
          <p>
            Explore how algorithms work. Follow each decision, inspect the Java, and
            predict the next move.
          </p>
          <div className="lab-catalog-meta">
            <span>{ALGORITHMS.length} interactive modules</span>
            <span>Watch · Step · Practice</span>
          </div>
          <Button variant="primary" size="sm" asChild>
            <Link href="/lab/binary-search">
              <Icon icon={PlayIcon} size={15} />
              Start with Binary Search
            </Link>
          </Button>
        </div>
        <div
          className="lab-catalog-example"
          aria-label="Binary search preview: midpoint at index 3"
        >
          <span className="lab-overline">ONE COMPARISON. HALF THE SEARCH SPACE.</span>
          <div className="lab-example-values">
            {[2, 5, 7, 9, 15, 18, 23].map((value, i) => (
              <div key={i} data-current={i === 3}>
                <span>{i}</span>
                <strong>{value}</strong>
                <small>{i === 0 ? "L" : i === 3 ? "◆ M" : i === 6 ? "H" : " "}</small>
              </div>
            ))}
          </div>
          <p>
            9 is smaller than 15.
            <br />
            <strong>The next candidate must be to the right.</strong>
          </p>
          <span className="lab-overline">COMPARE → REASON → CHANGE</span>
        </div>
      </header>
      <section className="lab-catalog-discovery" aria-label="Algorithm catalog">
        <div className="lab-catalog-search">
          <Icon icon={Search01Icon} size={18} />
          <input
            aria-label="Search algorithms"
            placeholder="Search algorithms, patterns, or topics…"
            value={query}
            disabled={!ready}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span>{algorithms.length} results</span>
        </div>
        {algorithms.length === 0 ? (
          <p className="lab-catalog-empty" role="status">
            No matching module. Try “graph”, “window”, or “binary”.
          </p>
        ) : (
          categories.map((category, index) => {
            const group = algorithms.filter((a) => a.category === category);
            return group.length ? (
              <section
                key={category}
                className="lab-catalog-group"
                aria-labelledby={`lab-category-${index}`}
              >
                <div>
                  <span className="lab-overline">
                    {String(index + 1).padStart(2, "0")} /
                  </span>
                  <h2 id={`lab-category-${index}`}>{category}</h2>
                  <span>{group.length} modules</span>
                </div>
                <ul>
                  {group.map((algorithm) => (
                    <li key={algorithm.slug}>
                      <Link href={`/lab/${algorithm.slug}`}>
                        <div>
                          <h3>{algorithm.name}</h3>
                          <p>{algorithm.description}</p>
                        </div>
                        <span className="lab-catalog-family">
                          {algorithm.renderer === "array"
                            ? "Values & pointers"
                            : algorithm.renderer === "network"
                              ? "Nodes & edges"
                              : "State & operations"}
                        </span>
                        <span className="lab-catalog-open">Explore</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null;
          })
        )}
      </section>
      <footer className="lab-catalog-footer">
        <span className="lab-overline">UNDERSTAND → PREDICT → PRACTICE</span>
        <p>
          Lab practice builds understanding. Your DSA attempts and revisions remain the
          evidence for Mastery.
        </p>
        <Link href="/practice/dsa">Continue to DSA Practice</Link>
      </footer>
    </div>
  );
}
