"use client";

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import {
  SourceCodeIcon,
  Brain02Icon,
  Database01Icon,
  Award01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { CarouselControls } from "./carousel-controls";
import { SpotlightCard } from "../cards/spotlight-card";

const SYLLABUS_DOMAINS = [
  {
    id: "dsa",
    category: "Data Structures & Algorithms",
    code: "DSA / 75+ PATTERNS",
    color: "#FF4D4D",
    icon: SourceCodeIcon,
    summary:
      "A complete curriculum from core arrays to complex dynamic programming and graph theory, ordered by pattern difficulty.",
    topics: [
      "Arrays, Two Pointers & Sliding Window",
      "Binary Search & Monotonic Stacks",
      "Linked Lists, Trees & Binary Search Trees",
      "Heap, Priority Queues & Graph Traversals",
      "Dynamic Programming & Interval Models",
    ],
  },
  {
    id: "aptitude",
    category: "Aptitude, Reasoning & Verbal",
    code: "APTITUDE / 132 TOPICS",
    color: "#F59E0B",
    icon: Brain02Icon,
    summary:
      "40-day intensive placement track engineered for TCS NQT, standard hiring tests, and cognitive assessments.",
    topics: [
      "Quantitative Aptitude (16 Days · 52 Topics)",
      "Deductive & Logical Reasoning (10 Days · 32 Topics)",
      "Verbal Ability & Grammar (7 Days · 24 Topics)",
      "Data Interpretation & Charts (5 Days · 16 Topics)",
      "Timed Sectional Diagnostics & Full Mocks",
    ],
  },
  {
    id: "fundamentals",
    category: "CS Core Fundamentals",
    code: "FUNDAMENTALS / 4 COURSES",
    color: "#00E5FF",
    icon: Database01Icon,
    summary:
      "Full video curricula paired with interactive browser simulators for deep computer science concept mastery.",
    topics: [
      "DBMS: Relational Model, 3NF/BCNF, SQL & ACID",
      "OS: CPU Scheduling, Deadlocks & Paging",
      "CN: OSI Model, TCP/IP Flow Control & Subnets",
      "OOP: Java Memory, Polymorphism & SOLID Principles",
      "Interactive Virtual Simulators & Laboratories",
    ],
  },
  {
    id: "mocks",
    category: "Assessments & Mocks",
    code: "EVALUATION / REAL PATTERNS",
    color: "#A855F7",
    icon: Award01Icon,
    summary:
      "Simulate real interview and assessment pressure with timed company-pattern drills and sectional benchmarks.",
    topics: [
      "TCS NQT Pattern 60-Question Mock",
      "Infosys & Wipro Logical Reasoning Drills",
      "Cognizant Speed Benchmark Tests",
      "System Design & Architecture Foundation",
      "Competency & Behavioral Interview Readiness",
    ],
  },
];

export function LearningCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    slidesToScroll: 1,
  });
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const onSelect = React.useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    queueMicrotask(() => {
      onSelect();
    });
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="space-y-6">
      {/* Embla Viewport */}
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex -ml-4">
          {SYLLABUS_DOMAINS.map((domain) => (
            <div
              key={domain.id}
              className="min-w-0 flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_25%] pl-4"
            >
              <SpotlightCard
                spotlightColor={`${domain.color}15`}
                borderColor={`${domain.color}40`}
                className="h-full p-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span
                      className="font-mono text-[11px] font-bold tracking-wider uppercase"
                      style={{ color: domain.color }}
                    >
                      {domain.code}
                    </span>
                    <Icon icon={domain.icon} size={18} style={{ color: domain.color }} />
                  </div>

                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {domain.category}
                  </h3>

                  <p className="text-xs text-[#888888] leading-relaxed">
                    {domain.summary}
                  </p>

                  <ul className="space-y-2 pt-2 border-t border-[#181818] text-xs font-mono text-[#CCCCCC]">
                    {domain.topics.map((t, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Icon icon={CheckmarkCircle02Icon} size={12} className="text-[#555555] flex-shrink-0 mt-0.5" />
                        <span className="truncate">{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </SpotlightCard>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <CarouselControls
        totalSlides={SYLLABUS_DOMAINS.length}
        activeIndex={selectedIndex}
        onPrev={() => emblaApi?.scrollPrev()}
        onNext={() => emblaApi?.scrollNext()}
        onSelect={(i) => emblaApi?.scrollTo(i)}
        canPrev={canScrollPrev}
        canNext={canScrollNext}
        labels={SYLLABUS_DOMAINS.map((d) => d.category)}
      />
    </div>
  );
}

