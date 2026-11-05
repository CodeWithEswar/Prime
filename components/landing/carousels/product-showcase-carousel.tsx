"use client";

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import {
  Calendar03Icon,
  SourceCodeIcon,
  RepeatIcon,
  Route02Icon,
  Alert02Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CarouselControls } from "./carousel-controls";
import { cn } from "@/lib/utils";

interface ShowcaseSlideData {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  icon: typeof Calendar03Icon;
  accent: string;
  renderPreview: (completed: string[], toggle: (id: string) => void) => React.ReactNode;
}

const SHOWCASE_SLIDES: ShowcaseSlideData[] = [
  {
    id: "today",
    badge: "01 / TODAY RUNWAY",
    title: "Daily Execution Engine",
    subtitle: "Calibrated to your exact bandwidth",
    description:
      "A distraction-free command strip that turns an ambitious 90-day goal into 3–4 deliberate tasks each morning.",
    icon: Calendar03Icon,
    accent: "#FF4D4D",
    renderPreview: (completed, toggle) => (
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF0000] animate-pulse" />
            <span className="font-mono text-white font-semibold">TODAY · NOV 05</span>
          </div>
          <span className="font-mono text-[#888888]">135m planned / 180m capacity</span>
        </div>

        <div className="space-y-2">
          {[
            { id: "task-1", label: "Solve: Two Sum & 3Sum (Array / Two Pointers)", time: "45m", cat: "DSA Core" },
            { id: "task-2", label: "Review: Invert Binary Tree & Lowest Common Ancestor", time: "30m", cat: "Revision" },
            { id: "task-3", label: "DBMS Day 3: Relational Normalization (3NF & BCNF)", time: "45m", cat: "Fundamentals" },
            { id: "task-4", label: "Aptitude Day 5: Time, Speed & Distance Practice Set", time: "15m", cat: "Aptitude" },
          ].map((t) => {
            const isDone = completed.includes(t.id);
            return (
              <div
                key={t.id}
                onClick={() => toggle(t.id)}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer text-xs select-none",
                  isDone
                    ? "bg-[#0A0A0A] border-[#1C1C1C] opacity-60"
                    : "bg-[#111111] border-[#222222] hover:border-[#333333] hover:bg-[#151515]"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <Checkbox checked={isDone} className="data-[state=checked]:bg-[#FF0000] data-[state=checked]:border-[#FF0000]" />
                  <span className={cn("truncate font-medium", isDone ? "line-through text-[#666666]" : "text-[#E0E0E0]")}>
                    {t.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 font-mono text-[11px] text-[#777777]">
                  <span className="px-1.5 py-0.5 rounded bg-[#1A1A1A] text-[#AAAAAA]">{t.cat}</span>
                  <span>{t.time}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 flex items-center justify-between text-xs font-mono text-[#888888]">
          <span>{completed.length} of 4 tasks completed</span>
          <span className="text-[#FF4D4D] font-semibold">{Math.round((completed.length / 4) * 100)}% resolved</span>
        </div>
      </div>
    ),
  },
  {
    id: "planner",
    badge: "02 / 90-DAY ADAPTIVE PLANNER",
    title: "Algorithmic Capacity Balancing",
    subtitle: "Automatic adjustment when life happens",
    description:
      "Missed a day? The planner automatically redistributes your study load across future days without cognitive debt or burnout.",
    icon: Route02Icon,
    accent: "#F59E0B",
    renderPreview: () => (
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3 text-xs">
          <span className="font-mono text-white font-semibold">CAPACITY ALLOCATION HORIZON</span>
          <Badge variant="outline" className="text-[10px] text-[#22C55E] border-[#22C55E]/30 bg-[#22C55E]/10">
            ON TRACK · 89 DAYS
          </Badge>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center font-mono text-[10px]">
          {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d) => (
            <div key={d} className="text-[#666666] py-1">{d}</div>
          ))}
          {[
            { d: "02", load: 0, status: "rest" },
            { d: "03", load: 0, status: "rest" },
            { d: "04", load: 85, status: "active" },
            { d: "05", load: 100, status: "today" },
            { d: "06", load: 90, status: "active" },
            { d: "07", load: 75, status: "active" },
            { d: "08", load: 0, status: "rest" },
          ].map((c) => (
            <div
              key={c.d}
              className={cn(
                "p-2 rounded border flex flex-col items-center justify-between min-h-[58px]",
                c.status === "today"
                  ? "border-[#FF0000] bg-[#141414] ring-1 ring-[#FF0000]"
                  : c.status === "rest"
                  ? "border-[#141414] bg-[#070707] opacity-50"
                  : "border-[#1A1A1A] bg-[#0E0E0E]"
              )}
            >
              <span className={cn(c.status === "today" ? "text-[#FF0000] font-bold" : "text-[#AAAAAA]")}>{c.d}</span>
              <div className="w-full bg-[#1A1A1A] h-1 rounded-full overflow-hidden my-1">
                <div
                  className={cn("h-full", c.status === "today" ? "bg-[#FF0000]" : "bg-[#888888]")}
                  style={{ width: `${c.load}%` }}
                />
              </div>
              <span className="text-[9px] text-[#555555]">{c.status === "rest" ? "REST" : `${Math.round((c.load * 180) / 100)}m`}</span>
            </div>
          ))}
        </div>

        <div className="p-3 rounded-lg bg-[#0E0E0E] border border-[#1A1A1A] text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon icon={Alert02Icon} size={14} className="text-[#F59E0B]" />
            <span className="text-[#CCCCCC]">Rebalance proposal: Move 30m carry-over to Saturday</span>
          </div>
          <span className="font-mono text-[#22C55E] text-[11px] font-semibold">APPLIED</span>
        </div>
      </div>
    ),
  },
  {
    id: "practice",
    badge: "03 / DSA PRACTICE LAB",
    title: "Algorithmic Mastery Studio",
    subtitle: "75+ pattern-based problem roadmap",
    description:
      "Step-by-step problem intelligence tracking your independent solutions, hints used, and time complexities across all interview patterns.",
    icon: SourceCodeIcon,
    accent: "#00E5FF",
    renderPreview: () => (
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 font-mono text-[10px]">
              ARRAY PATTERN
            </span>
            <span className="text-white font-semibold">Binary Search Simulator</span>
          </div>
          <span className="font-mono text-[#888888]">O(log N) Time</span>
        </div>

        {/* Array Search Visualizer */}
        <div className="p-4 rounded-lg bg-[#0E0E0E] border border-[#1A1A1A] space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#777777]">
            <span>TARGET: 42</span>
            <span>POINTERS: L=2, M=4, R=7</span>
          </div>
          <div className="flex items-center gap-1.5 justify-center overflow-x-auto py-2">
            {[4, 9, 15, 23, 42, 56, 78, 91].map((val, idx) => {
              const isMatch = val === 42;
              const isMid = idx === 4;
              return (
                <div
                  key={val}
                  className={cn(
                    "w-9 h-10 rounded border flex flex-col items-center justify-center font-mono text-xs transition-all",
                    isMatch
                      ? "border-[#22C55E] bg-[#22C55E]/15 text-[#22C55E] font-bold shadow-[0_0_8px_rgba(34,197,94,0.3)]"
                      : isMid
                      ? "border-[#FF0000] bg-[#FF0000]/10 text-[#FF0000]"
                      : "border-[#222222] bg-[#121212] text-[#888888]"
                  )}
                >
                  <span>{val}</span>
                  <span className="text-[8px] text-[#555555]">[{idx}]</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs font-mono text-[#888888] pt-1">
          <span>Search space reduced by 50% each step</span>
          <span className="text-white font-semibold">3 steps to target</span>
        </div>
      </div>
    ),
  },
  {
    id: "revision",
    badge: "04 / ADAPTIVE REVISION",
    title: "Retention & Spaced Recall",
    subtitle: "Protect against memory decay",
    description:
      "PRIME predicts when your algorithmic memory is about to fade and surfaces problems at exact spaced intervals (1, 3, 7, 14, 28 days).",
    icon: RepeatIcon,
    accent: "#EC4899",
    renderPreview: () => (
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3 text-xs">
          <span className="font-mono text-white font-semibold">REVISION OBLIGATIONS</span>
          <span className="font-mono text-[#EC4899] font-bold">2 ITEMS DUE TODAY</span>
        </div>

        <div className="space-y-2">
          {[
            { title: "LRU Cache (Doubly Linked List + Map)", interval: "Day 7 Recall", decay: "82% Retention", status: "Due" },
            { title: "Course Schedule (Topological Sort)", interval: "Day 14 Recall", decay: "71% Retention", status: "Due" },
          ].map((item, i) => (
            <div key={i} className="p-3 rounded-lg border border-[#242424] bg-[#0E0E0E] flex items-center justify-between text-xs">
              <div className="space-y-0.5 min-w-0 pr-2">
                <div className="text-white font-medium truncate">{item.title}</div>
                <div className="text-[10px] font-mono text-[#777777]">{item.interval} · {item.decay}</div>
              </div>
              <Button size="sm" variant="outline" className="h-7 text-[11px] font-mono border-[#FF0000]/40 text-[#FF0000] hover:bg-[#FF0000]/10">
                Review Now
              </Button>
            </div>
          ))}
        </div>

        <div className="p-2.5 rounded bg-[#0A0A0A] border border-[#161616] text-[11px] font-mono text-[#666666] flex items-center justify-between">
          <span>Forgetting curve algorithm: SuperMemo SM-2 adapted</span>
          <span className="text-[#22C55E]">✓ 94% Retention Rate</span>
        </div>
      </div>
    ),
  },
];

export function ProductShowcaseCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: "start" });
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);
  const [completedTasks, setCompletedTasks] = React.useState<string[]>(["task-1"]);

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

  const handleToggle = (id: string) => {
    setCompletedTasks((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") emblaApi?.scrollPrev();
    if (e.key === "ArrowRight") emblaApi?.scrollNext();
  };

  return (
    <div
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className="space-y-6 focus:outline-none"
      aria-roledescription="carousel"
      aria-label="PRIME Product Modules Showcase"
    >
      {/* Embla Viewport */}
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {SHOWCASE_SLIDES.map((slide) => (
            <div
              key={slide.id}
              className="min-w-0 flex-[0_0_100%] pr-4"
              role="group"
              aria-roledescription="slide"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center rounded-2xl border border-[#222222] bg-[#0A0A0A] p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden">
                {/* Left Description Column */}
                <div className="lg:col-span-5 space-y-4">
                  <span
                    className="font-mono text-xs uppercase tracking-widest block font-bold"
                    style={{ color: slide.accent }}
                  >
                    {slide.badge}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                    {slide.title}
                  </h3>
                  <p className="text-sm text-[#AAAAAA] font-mono">{slide.subtitle}</p>
                  <p className="text-xs sm:text-sm text-[#777777] leading-relaxed">
                    {slide.description}
                  </p>

                  <div className="pt-2">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="border-[#262626] bg-[#121212] text-white hover:bg-[#1A1A1A] font-mono text-xs cursor-pointer"
                    >
                      <a href="#features" className="flex items-center gap-1.5">
                        <span>Explore Module Specs</span>
                        <Icon icon={ArrowRight01Icon} size={13} />
                      </a>
                    </Button>
                  </div>
                </div>

                {/* Right Interactive Live Preview */}
                <div className="lg:col-span-7 rounded-xl border border-[#1E1E1E] bg-[#050505] p-5 sm:p-6 shadow-inner">
                  {slide.renderPreview(completedTasks, handleToggle)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Carousel Controls */}
      <CarouselControls
        totalSlides={SHOWCASE_SLIDES.length}
        activeIndex={selectedIndex}
        onPrev={() => emblaApi?.scrollPrev()}
        onNext={() => emblaApi?.scrollNext()}
        onSelect={(i) => emblaApi?.scrollTo(i)}
        canPrev={canScrollPrev}
        canNext={canScrollNext}
        labels={SHOWCASE_SLIDES.map((s) => s.title)}
      />
    </div>
  );
}

