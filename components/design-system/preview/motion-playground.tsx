"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { motionDuration, motionEase, usePrimeReducedMotion } from "@/lib/motion";
import { Icon } from "@/components/ui/icon";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";

export function MotionPlayground() {
  const isReducedMotion = usePrimeReducedMotion();
  const [accordionOpen, setAccordionOpen] = React.useState(false);
  const [simulatedReduced, setSimulatedReduced] = React.useState(false);

  const effectiveReduced = isReducedMotion || simulatedReduced;

  return (
    <div className="space-y-8 w-full text-white">
      {/* 5 Principles Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {[
          { name: "FAST", desc: "120–240ms duration ceiling" },
          { name: "PHYSICAL", desc: "Tactile spring response" },
          { name: "DIRECTIONAL", desc: "Spatially continuous origin" },
          { name: "CONSISTENT", desc: "Shared centralized tokens" },
          { name: "INTENTIONAL", desc: "State and focus clarity" },
        ].map((p) => (
          <div
            key={p.name}
            className="p-3 rounded-[var(--radius-xs)] border border-[rgba(255,255,255,0.08)] bg-[#030303] space-y-1"
          >
            <div className="text-[11px] font-mono font-bold text-[#ff0000]">{p.name}</div>
            <div className="text-[10px] text-[var(--text-secondary)] leading-tight">
              {p.desc}
            </div>
          </div>
        ))}
      </div>

      {/* 1. Interactive Button Motion (Demo 89) */}
      <div className="p-4 rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.08)] bg-[#030303] space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-xs font-semibold text-white">
              1. Tactile Button Physics
            </h4>
            <p className="text-[11px] text-[var(--text-secondary)]">
              Hover lifts 1px; press physically compresses scale 0.985 + y 1px.
            </p>
          </div>
          <Badge variant="outline" className="font-mono text-[9px]">
            press spring (520/32)
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button variant="primary">Solid Red Primary</Button>
          <Button variant="secondary">Black Neumorphic</Button>
          <Button variant="outline">Subtle Outline</Button>
          <Button variant="ghost">Restrained Ghost</Button>
          <Button loading>Loading State</Button>
        </div>
      </div>

      {/* 2. Dialog Modal Motion (Demo 90) */}
      <div className="p-4 rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.08)] bg-[#030303] space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-xs font-semibold text-white">
              2. Dialog Modal Coordinates
            </h4>
            <p className="text-[11px] text-[var(--text-secondary)]">
              Backdrop 0 to 0.84; dialog scale 0.98 to 1, y 8px to 0 (200ms in, 140ms
              out).
            </p>
          </div>
          <Badge variant="outline" className="font-mono text-[9px]">
            emphasized ease
          </Badge>
        </div>

        <div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="primary">Launch Test Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Coordinated Dialog Motion</DialogTitle>
                <DialogDescription>
                  Notice how the backdrop fades to pure black-alpha without blur, while
                  the modal gently scales and settles without overshoot. Focus is captured
                  instantly.
                </DialogDescription>
              </DialogHeader>
              <div className="py-2 text-xs text-[var(--text-secondary)]">
                Press <code className="font-mono text-white">Escape</code> to observe the
                slightly faster closing animation.
              </div>
              <DialogFooter>
                <Button variant="primary">Confirm Action</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 3. Directional Sheets (Demo 91) */}
      <div className="p-4 rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.08)] bg-[#030303] space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-xs font-semibold text-white">
              3. Directional Sheet Physics
            </h4>
            <p className="text-[11px] text-[var(--text-secondary)]">
              Enters and exits from its origin edge using panel spring (340/36).
            </p>
          </div>
          <Badge variant="outline" className="font-mono text-[9px]">
            panel spring (340/36)
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          {(["left", "right", "bottom"] as const).map((side) => (
            <Sheet key={side}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  Open {side.charAt(0).toUpperCase() + side.slice(1)} Sheet
                </Button>
              </SheetTrigger>
              <SheetContent side={side}>
                <SheetHeader>
                  <SheetTitle className="capitalize">{side} Panel</SheetTitle>
                  <SheetDescription>
                    Spatial continuity: enters from {side} and slides back toward {side}{" "}
                    on exit.
                  </SheetDescription>
                </SheetHeader>
                <div className="py-4 text-xs text-[var(--text-secondary)]">
                  Weighted physical movement with zero excessive oscillation.
                </div>
              </SheetContent>
            </Sheet>
          ))}
        </div>
      </div>

      {/* 4. Direction-Aware Tooltips (Demo 92) */}
      <div className="p-4 rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.08)] bg-[#030303] space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-xs font-semibold text-white">4. Directional Tooltips</h4>
            <p className="text-[11px] text-[var(--text-secondary)]">
              Snappy 100ms entrance with 3px directional offset originating from trigger.
            </p>
          </div>
          <Badge variant="outline" className="font-mono text-[9px]">
            100–140ms
          </Badge>
        </div>

        <TooltipProvider delayDuration={150}>
          <div className="flex flex-wrap items-center gap-4 pt-1">
            {(["top", "right", "bottom", "left"] as const).map((side) => (
              <Tooltip key={side}>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="capitalize">
                    Hover {side}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side={side}>
                  <span>Emerging from {side}</span>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </div>

      {/* 5. Popover Spatial Relationship (Demo 93) */}
      <div className="p-4 rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.08)] bg-[#030303] space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-xs font-semibold text-white">
              5. Popover Spatial Relationship
            </h4>
            <p className="text-[11px] text-[var(--text-secondary)]">
              Directional 5px offset + scale 0.98 to 1, anchored directly to trigger
              position.
            </p>
          </div>
          <Badge variant="outline" className="font-mono text-[9px]">
            140–180ms
          </Badge>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                Open Popover
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 text-xs space-y-1">
              <div className="font-semibold text-white">Spatial Continuity</div>
              <div className="text-[var(--text-secondary)]">
                The popover emerges directly from its trigger with coordinated easing.
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* 6. Shared Active Indicator Tabs (Demo 94) */}
      <div className="p-4 rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.08)] bg-[#030303] space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-xs font-semibold text-white">
              6. Shared Indicator Gliding
            </h4>
            <p className="text-[11px] text-[var(--text-secondary)]">
              Shared layout indicator glides smoothly across active selections without
              teleporting.
            </p>
          </div>
          <Badge variant="outline" className="font-mono text-[9px]">
            layoutId=&quot;prime-ds-active-tab&quot;
          </Badge>
        </div>

        <div className="space-y-4 pt-1">
          {/* Line variant */}
          <div>
            <div className="text-[10px] font-mono text-[var(--text-tertiary)] mb-1 uppercase">
              Line Variant
            </div>
            <Tabs defaultValue="practice" className="w-full max-w-md">
              <TabsList variant="line" layoutId="demo-line-tabs">
                <TabsTrigger value="practice">Practice</TabsTrigger>
                <TabsTrigger value="revision">Revision (4)</TabsTrigger>
                <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
              </TabsList>
              <TabsContent
                value="practice"
                className="text-xs text-[var(--text-secondary)]"
              >
                Dynamic programming and graph problems queued.
              </TabsContent>
              <TabsContent
                value="revision"
                className="text-xs text-[var(--text-secondary)]"
              >
                4 spaced repetition items due today.
              </TabsContent>
              <TabsContent
                value="roadmap"
                className="text-xs text-[var(--text-secondary)]"
              >
                Full-stack system architecture mastery.
              </TabsContent>
            </Tabs>
          </div>

          {/* Segmented variant */}
          <div>
            <div className="text-[10px] font-mono text-[var(--text-tertiary)] mb-1 uppercase">
              Segmented Surface Variant
            </div>
            <Tabs defaultValue="day" className="w-full max-w-sm">
              <TabsList variant="segmented" layoutId="demo-segmented-tabs">
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* 7. Accordion Smooth Expansion (Demo 95) */}
      <div className="p-4 rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.08)] bg-[#030303] space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-xs font-semibold text-white">
              7. Smooth Accordion Expansion
            </h4>
            <p className="text-[11px] text-[var(--text-secondary)]">
              Clean height 0 to auto and opacity transition with rotating chevron.
            </p>
          </div>
          <Badge variant="outline" className="font-mono text-[9px]">
            height auto (180ms)
          </Badge>
        </div>

        <div className="border border-[rgba(255,255,255,0.08)] rounded-[var(--radius-sm)] overflow-hidden max-w-lg">
          <button
            type="button"
            onClick={() => setAccordionOpen((prev) => !prev)}
            className="flex items-center justify-between w-full p-3 bg-[#000000] text-xs font-semibold text-white hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
          >
            <span>Interview Readiness Algorithm Specifications</span>
            <motion.span
              animate={{ rotate: accordionOpen ? 180 : 0 }}
              transition={{ duration: motionDuration.fast }}
            >
              <Icon
                icon={ArrowDown01Icon}
                size={14}
                className="text-[var(--text-tertiary)]"
              />
            </motion.span>
          </button>

          <AnimatePresence initial={false}>
            {accordionOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: motionDuration.normal, ease: motionEase.enter }}
                className="overflow-hidden bg-[#020202]"
              >
                <div className="p-3.5 text-xs text-[var(--text-secondary)] leading-relaxed border-t border-[rgba(255,255,255,0.06)]">
                  The readiness index calculates topic coverage, retention intervals, and
                  weakness signals without heavy background bloat. Every calculation
                  settles instantaneously.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 8. Toast Motion (Demo 96) */}
      <div className="p-4 rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.08)] bg-[#030303] space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-xs font-semibold text-white">
              8. Toast Stacking &amp; Reflow
            </h4>
            <p className="text-[11px] text-[var(--text-secondary)]">
              Enters with directional offset; remaining toasts reflow smoothly with layout
              animation.
            </p>
          </div>
          <Badge variant="outline" className="font-mono text-[9px]">
            sonner
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2.5 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toast.success("Problem marked as solved", {
                description: "Spaced repetition scheduled for 3 days from now.",
              })
            }
          >
            Show Success Toast
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              toast("Sync in progress", {
                description: "Updating local mastery scores.",
              })
            }
          >
            Show Notice Toast
          </Button>
        </div>
      </div>

      {/* 9. Reduced Motion Simulation (Demo 78 & 79) */}
      <div className="p-4 rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.08)] bg-[#030303] space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-xs font-semibold text-white">
              9. Prefers-Reduced-Motion Compliance
            </h4>
            <p className="text-[11px] text-[var(--text-secondary)]">
              When reduced motion is requested, translations and scales are stripped,
              preserving instantaneous opacity changes and immediate focus.
            </p>
          </div>
          <Button
            size="sm"
            variant={effectiveReduced ? "primary" : "outline"}
            onClick={() => setSimulatedReduced((prev) => !prev)}
            className="text-xs font-mono"
          >
            {effectiveReduced ? "Reduced Motion: ACTIVE" : "Simulate Reduced Motion"}
          </Button>
        </div>

        <div className="p-3 rounded-[var(--radius-xs)] bg-[#000000] border border-[rgba(255,255,255,0.06)] text-xs font-mono text-[var(--text-secondary)] flex items-center justify-between">
          <span>Current Client Preference:</span>
          <span className="text-white font-bold">
            {effectiveReduced
              ? "REDUCE (No spatial transforms)"
              : "STANDARD (Full physics active)"}
          </span>
        </div>
      </div>
    </div>
  );
}
