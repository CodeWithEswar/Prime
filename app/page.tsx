"use client";

import * as React from "react";
import { motion } from "motion/react";
import {
  FlashIcon,
  Configuration01Icon,
  ComputerTerminal01Icon,
  Database01Icon,
  CpuIcon,
  BadgeCheckIcon,
  Shield01Icon,
  BrowserIcon,
  AlarmClockIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { fadeInVariants, slideUpVariants } from "@/lib/motion";

export default function FoundationPreviewPage() {
  const [checked, setChecked] = React.useState(true);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-6 md:p-12">
      <motion.div
        className="max-w-4xl mx-auto space-y-10"
        initial="hidden"
        animate="visible"
        variants={fadeInVariants}
      >
        {/* Foundation Header */}
        <div className="border-b border-[var(--border)] pb-6 space-y-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--accent)] animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-wider text-[var(--accent)]">
              PRIME • Phase 0
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Engineering Foundation Verification
          </h1>
          <p className="text-sm text-[var(--foreground-muted)] max-w-2xl">
            This internal preview surface validates semantic design tokens, solid
            neumorphic controls, surface elevation hierarchy, Hugeicons, and motion
            timings. Zero product feature modules are active in Phase 0.
          </p>
        </div>

        {/* Section 1: Surface Elevation Philosophy */}
        <motion.section variants={slideUpVariants} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--foreground-secondary)]">
              1. Surface Elevation Hierarchy
            </h2>
            <Badge variant="secondary">Black-First</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card elevation="surface">
              <CardHeader>
                <span className="font-mono text-xs text-[var(--foreground-muted)]">
                  #0B0B0C
                </span>
                <CardTitle className="text-sm">Primary Surface</CardTitle>
                <CardDescription>
                  Default base surface for layout groupings
                </CardDescription>
              </CardHeader>
            </Card>

            <Card elevation="raised">
              <CardHeader>
                <span className="font-mono text-xs text-[var(--foreground-muted)]">
                  #101011
                </span>
                <CardTitle className="text-sm">Raised Surface</CardTitle>
                <CardDescription>Cards, modals, and raised containers</CardDescription>
              </CardHeader>
            </Card>

            <Card elevation="elevated">
              <CardHeader>
                <span className="font-mono text-xs text-[var(--foreground-muted)]">
                  #141415
                </span>
                <CardTitle className="text-sm">Elevated Surface</CardTitle>
                <CardDescription>
                  Interactive hover targets & active elements
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </motion.section>

        <Separator />

        {/* Section 2: Solid Neumorphic Button System */}
        <motion.section variants={slideUpVariants} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--foreground-secondary)]">
              2. Solid Neumorphic Controls (Precision Hardware Language)
            </h2>
            <Badge variant="accent">Restrained Red</Badge>
          </div>
          <p className="text-xs text-[var(--foreground-muted)]">
            Layered shadows: subtle upper inner highlight + solid accent surface + dark
            lower edge + tactile press compression.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">
              <Icon icon={FlashIcon} size={16} />
              Primary Hardware CTA
            </Button>
            <Button variant="secondary">
              <Icon icon={Configuration01Icon} size={16} />
              Secondary Control
            </Button>
            <Button variant="outline">Outline Action</Button>
            <Button variant="ghost">Ghost State</Button>
            <Button variant="destructive">Destructive Action</Button>
            <Button variant="primary" size="icon" aria-label="Terminal">
              <Icon icon={ComputerTerminal01Icon} size={16} />
            </Button>
          </div>
        </motion.section>

        <Separator />

        {/* Section 3: Typography, Metadata & Icons */}
        <motion.section variants={slideUpVariants} className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--foreground-secondary)]">
            3. Typography & Technical Metadata
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card elevation="raised">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Icon
                    icon={Database01Icon}
                    size={16}
                    className="text-[var(--accent)]"
                  />
                  Monospace Statistics (Geist Mono)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[var(--foreground-muted)] flex items-center gap-1.5">
                    <Icon icon={AlarmClockIcon} size={14} />
                    Response Latency
                  </span>
                  <span className="font-mono text-[var(--foreground)]">42ms (UTC)</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[var(--foreground-muted)] flex items-center gap-1.5">
                    <Icon icon={ComputerTerminal01Icon} size={14} />
                    Problem Hash
                  </span>
                  <span className="font-mono text-[var(--foreground)]">#dsa-8092</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[var(--foreground-muted)] flex items-center gap-1.5">
                    <Icon icon={BadgeCheckIcon} size={14} />
                    Interval Days
                  </span>
                  <span className="font-mono text-[var(--accent)] font-semibold">
                    +6d (SM-2)
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card elevation="raised">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Icon icon={CpuIcon} size={16} className="text-[var(--accent)]" />
                  Forms & Inputs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="search-input">Catalog Query</Label>
                  <Input
                    id="search-input"
                    placeholder="e.g. Dynamic Programming / Graph"
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Checkbox
                    id="sample-checkbox"
                    checked={checked}
                    onCheckedChange={setChecked}
                  />
                  <Label
                    htmlFor="sample-checkbox"
                    className="normal-case tracking-normal text-xs text-[var(--foreground)]"
                  >
                    Enforce pure domain separation
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        <Separator />

        {/* Section 4: Architectural Boundaries Status */}
        <motion.section variants={slideUpVariants} className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--foreground-secondary)]">
            4. Architecture Boundaries Verification
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] flex items-center gap-2">
              <Icon
                icon={BrowserIcon}
                size={16}
                className="text-[var(--accent)] shrink-0"
              />
              <span>Next.js 16 App Router</span>
            </div>
            <div className="p-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] flex items-center gap-2">
              <Icon
                icon={Database01Icon}
                size={16}
                className="text-[var(--accent)] shrink-0"
              />
              <span>Supabase SSR Auth</span>
            </div>
            <div className="p-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] flex items-center gap-2">
              <Icon icon={CpuIcon} size={16} className="text-[var(--accent)] shrink-0" />
              <span>Cloudflare Workers</span>
            </div>
            <div className="p-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] flex items-center gap-2">
              <Icon
                icon={Shield01Icon}
                size={16}
                className="text-[var(--accent)] shrink-0"
              />
              <span>Zod Trust Boundaries</span>
            </div>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}
