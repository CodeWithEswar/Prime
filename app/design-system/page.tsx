"use client";

import * as React from "react";
import {
  SparklesIcon,
  Search01Icon,
  DashboardSquare01Icon,
  Clock01Icon,
  BookOpen01Icon,
  Layers01Icon,
  Settings01Icon,
  Notification01Icon,
  Tick02Icon,
  ChartLineData01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchInput } from "@/components/ui/search-input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "@/components/ui/sonner";

// Shared domain visual primitives
import {
  PageHeader,
  SectionHeader,
  StatusBadge,
  Metric,
  MetricStrip,
  TaskRow,
  ProblemRow,
  RevisionRow,
  ActivityRow,
  KeyboardKey,
  EmptyState,
  ErrorState,
  NavItem,
} from "@/components/shared";

export default function DesignSystemPage() {
  // Interactive state fixtures
  const [searchValue, setSearchValue] = React.useState("");
  const [btnLoading, setBtnLoading] = React.useState(false);
  const [radioValue, setRadioValue] = React.useState("option-1");
  const [switchChecked, setSwitchChecked] = React.useState(true);
  const [checkboxChecked, setCheckboxChecked] = React.useState(true);
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  const [commandOpen, setCommandOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("all");

  // Keyboard shortcut listener for Command Palette (⌘K)
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const sections = [
    { id: "foundations", label: "1. Foundations" },
    { id: "controls", label: "2. Controls & Forms" },
    { id: "navigation", label: "3. Navigation & Structure" },
    { id: "status-metrics", label: "4. Status, Badges & Metrics" },
    { id: "data-display", label: "5. Data Display Patterns" },
    { id: "calendar", label: "6. Calendar Primitive" },
    { id: "overlays", label: "7. Overlays & Feedback" },
    { id: "a11y", label: "8. Responsive & Accessibility" },
  ];

  return (
    <div className="min-h-screen bg-[var(--prime-canvas)] text-[var(--foreground)] selection:bg-[var(--accent-soft)] selection:text-white">
      {/* Top Header Workbench Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-[var(--border-subtle)] bg-[var(--prime-canvas)]/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-xs)] bg-[var(--accent)] text-white shadow-[0_0_10px_rgba(255,0,0,0.5)] font-bold text-xs tracking-wider">
              PR
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wider text-white">PRIME</span>
              <span className="text-[var(--text-disabled)] font-mono text-xs">/</span>
              <span className="text-xs font-mono text-[var(--text-secondary)]">
                DESIGN SYSTEM WORKBENCH
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[var(--radius-xs)] bg-[var(--accent-soft)] border border-[var(--accent-border)] font-mono text-[11px] text-[var(--accent)] font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
              PURE BLACK & PURE RED
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCommandOpen(true)}
              className="gap-2 text-xs font-mono"
            >
              <Icon icon={Search01Icon} size={13} />
              <span>Quick Jump</span>
              <KeyboardKey>⌘K</KeyboardKey>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container with Sidebar Navigation */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sticky Navigation Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-20 space-y-1 p-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-base)]">
            <div className="px-2 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--text-tertiary)] font-bold">
              Design Specifications
            </div>
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="block px-2.5 py-1.5 rounded-[var(--radius-xs)] text-xs text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-hover)] transition-colors font-medium"
              >
                {s.label}
              </a>
            ))}
            <div className="pt-3 border-t border-[var(--border-subtle)]">
              <div className="px-2 text-[10px] font-mono text-[var(--text-disabled)]">
                Phase 1 Delivery • Clean Tree
              </div>
            </div>
          </aside>

          {/* Workbench Content Area */}
          <main className="lg:col-span-9 space-y-16">
            {/* Page Header */}
            <PageHeader
              title="Visual Design Language"
              description="Canonical engineering foundation and component system for PRIME. Pure true black (#000000) canvas with pure high-intensity red (#FF0000) performance accent, solid precision neumorphic controls, and Geist typography."
              badge={<Badge variant="accent">PHASE 1 COMPLETE</Badge>}
              actions={
                <Button
                  variant="primary"
                  onClick={() =>
                    toast.success("Design system tokens verified and active!")
                  }
                >
                  <Icon icon={SparklesIcon} size={15} />
                  Test Feedback Toast
                </Button>
              }
            />

            {/* =========================================================================
             * Section 1: Foundations
             * ========================================================================= */}
            <section id="foundations" className="space-y-8 scroll-mt-20">
              <SectionHeader
                title="1. Foundations"
                description="Core primitives: Pure Black canvas, luminance-stepped surfaces, Pure Red accent, typography, spacing, and layered elevation shadows."
                count="01"
              />

              {/* Surface Architecture Nested Demonstration */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">
                  Surface Hierarchy & Luminance Layering (Against Pure Canvas #000000)
                </h3>
                <div className="p-6 rounded-[var(--radius-lg)] bg-[var(--prime-canvas)] border border-[var(--border-subtle)] space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono text-[var(--text-tertiary)]">
                    <span>--prime-canvas: #000000 (Pure True Black)</span>
                    <span className="text-[10px] text-[var(--text-disabled)]">
                      Canvas Level 0
                    </span>
                  </div>

                  {/* Level 1: Base */}
                  <div className="p-5 rounded-[var(--radius-md)] bg-[var(--prime-surface-1)] border border-[var(--prime-border-subtle)] shadow-elevation-1 space-y-4">
                    <div className="flex items-center justify-between text-xs font-mono text-[var(--text-tertiary)]">
                      <span className="text-white font-medium">
                        --prime-surface-1: #070708 (Base Grouping)
                      </span>
                      <span>Level 1</span>
                    </div>

                    {/* Level 2: Raised */}
                    <div className="p-4 rounded-[var(--radius-md)] bg-[var(--prime-surface-2)] border border-[var(--prime-border-default)] shadow-elevation-2 space-y-4">
                      <div className="flex items-center justify-between text-xs font-mono text-[var(--text-tertiary)]">
                        <span className="text-white font-medium">
                          --prime-surface-2: #0C0C0D (Raised Card)
                        </span>
                        <span>Level 2</span>
                      </div>

                      {/* Level 3: Elevated */}
                      <div className="p-4 rounded-[var(--radius-sm)] bg-[var(--prime-surface-3)] border border-[var(--prime-border-strong)] shadow-elevation-3 space-y-3">
                        <div className="flex items-center justify-between text-xs font-mono text-[var(--text-tertiary)]">
                          <span className="text-white font-medium">
                            --prime-surface-3: #111113 (Elevated Dropdown / Popover)
                          </span>
                          <span>Level 3</span>
                        </div>

                        {/* Level 4: Modal Overlay */}
                        <div className="p-3 rounded-[var(--radius-xs)] bg-[var(--prime-surface-4)] border border-[var(--prime-border-strong)] shadow-elevation-4 flex items-center justify-between">
                          <span className="text-xs font-mono text-white font-medium">
                            --prime-surface-4: #161619 (Modal Overlay)
                          </span>
                          <span className="text-[10px] font-mono text-[var(--accent)] font-semibold">
                            Level 4 Top
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Color Swatches Grid */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">
                  Performance Red & Semantic Feedback
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--surface-base)] border border-[var(--border-subtle)] space-y-2">
                    <div className="h-8 rounded-[var(--radius-xs)] bg-[var(--prime-red)] shadow-[0_0_12px_rgba(255,0,0,0.5)]" />
                    <div>
                      <div className="text-xs font-mono font-semibold text-white">
                        Pure Red
                      </div>
                      <div className="text-[10px] font-mono text-[var(--text-tertiary)]">
                        #FF0000 (100% Core)
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--surface-base)] border border-[var(--border-subtle)] space-y-2">
                    <div className="h-8 rounded-[var(--radius-xs)] bg-[var(--prime-red-hover)]" />
                    <div>
                      <div className="text-xs font-mono font-semibold text-white">
                        Red Hover
                      </div>
                      <div className="text-[10px] font-mono text-[var(--text-tertiary)]">
                        #FF2626
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--surface-base)] border border-[var(--border-subtle)] space-y-2">
                    <div className="h-8 rounded-[var(--radius-xs)] bg-[var(--prime-red-active)]" />
                    <div>
                      <div className="text-xs font-mono font-semibold text-white">
                        Red Active
                      </div>
                      <div className="text-[10px] font-mono text-[var(--text-tertiary)]">
                        #D60000
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--surface-base)] border border-[var(--border-subtle)] space-y-2">
                    <div className="h-8 rounded-[var(--radius-xs)] bg-[var(--success)]" />
                    <div>
                      <div className="text-xs font-mono font-semibold text-white">
                        Success
                      </div>
                      <div className="text-[10px] font-mono text-[var(--text-tertiary)]">
                        #30A46C (Muted)
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--surface-base)] border border-[var(--border-subtle)] space-y-2">
                    <div className="h-8 rounded-[var(--radius-xs)] bg-[var(--warning)]" />
                    <div>
                      <div className="text-xs font-mono font-semibold text-white">
                        Warning
                      </div>
                      <div className="text-[10px] font-mono text-[var(--text-tertiary)]">
                        #F5A524 (Muted)
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--surface-base)] border border-[var(--border-subtle)] space-y-2">
                    <div className="h-8 rounded-[var(--radius-xs)] bg-[var(--info)]" />
                    <div>
                      <div className="text-xs font-mono font-semibold text-white">
                        Info
                      </div>
                      <div className="text-[10px] font-mono text-[var(--text-tertiary)]">
                        #3B82F6 (Muted)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Typography Scale */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">
                  Typography System: Geist Sans & Geist Mono Numbers
                </h3>
                <div className="p-5 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-base)] space-y-4">
                  <div className="flex items-baseline justify-between border-b border-[var(--border-subtle)] pb-2">
                    <span className="text-2xl font-bold tracking-tight text-white">
                      Display Title (24px - 32px Bold)
                    </span>
                    <span className="font-mono text-xs text-[var(--text-tertiary)]">
                      Geist Sans
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between border-b border-[var(--border-subtle)] pb-2">
                    <span className="text-base font-semibold text-white">
                      Section Header (16px SemiBold)
                    </span>
                    <span className="font-mono text-xs text-[var(--text-tertiary)]">
                      Geist Sans
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between border-b border-[var(--border-subtle)] pb-2">
                    <span className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      Body & Description text (14px Regular, secondary luminance #A3A3A8)
                    </span>
                    <span className="font-mono text-xs text-[var(--text-tertiary)]">
                      Geist Sans
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-lg font-bold text-white font-mono-numbers">
                      45 / 150 Solved • 00:45:20 Elapsed • Day 14 Revision
                    </span>
                    <span className="font-mono text-xs text-[var(--accent)] font-semibold">
                      Geist Mono Tabular Numbers
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* =========================================================================
             * Section 2: Controls & Forms
             * ========================================================================= */}
            <section id="controls" className="space-y-8 scroll-mt-20">
              <SectionHeader
                title="2. Controls & Forms"
                description="Solid neumorphic tactile controls, sharp borders, pure red focus rings, and developer-grade input primitives."
                count="02"
              />

              {/* Buttons Demonstration */}
              <div className="p-6 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-base)] space-y-6">
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)] mb-3">
                    Button Variants (Solid Instrument Precision)
                  </h4>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button variant="primary">Primary Neumorphic (Pure Red)</Button>
                    <Button variant="secondary">Secondary Surface Control</Button>
                    <Button variant="outline">Minimal Outline</Button>
                    <Button variant="ghost">Ghost Control</Button>
                    <Button variant="destructive">Destructive Action</Button>
                    <Button variant="link">Subtle Link</Button>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)] mb-3">
                    Button Sizing & Interactive Loading
                  </h4>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button size="lg" variant="primary">
                      Large (10)
                    </Button>
                    <Button size="default" variant="primary">
                      Default (9)
                    </Button>
                    <Button size="sm" variant="primary">
                      Small (8)
                    </Button>
                    <Button size="icon" variant="secondary" aria-label="Settings">
                      <Icon icon={Settings01Icon} size={16} />
                    </Button>
                    <Button size="icon-sm" variant="outline" aria-label="Notifications">
                      <Icon icon={Notification01Icon} size={14} />
                    </Button>
                    <Button
                      variant="primary"
                      loading={btnLoading}
                      onClick={() => {
                        setBtnLoading(true);
                        setTimeout(() => setBtnLoading(false), 1500);
                      }}
                    >
                      {btnLoading ? "Processing..." : "Click For Loading State"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Form Input Primitives */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-base)]">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[var(--text-secondary)]">
                      Search Input with Shortcut & Clear
                    </label>
                    <SearchInput
                      placeholder="Search DSA sheets, roadmaps, problems..."
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      onClear={() => setSearchValue("")}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[var(--text-secondary)]">
                      Standard Input (Pure Black Canvas Surface)
                    </label>
                    <Input placeholder="Enter custom roadmap target..." />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[var(--text-secondary)]">
                      Select Dropdown (Elevated Menu Surface)
                    </label>
                    <Select defaultValue="takeuforward">
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="takeuforward">
                          TakeUForward Striver A2Z
                        </SelectItem>
                        <SelectItem value="leetcode">LeetCode Top 150</SelectItem>
                        <SelectItem value="neetcode">NeetCode 150 Blind</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[var(--text-secondary)]">
                      Textarea Primitive
                    </label>
                    <Textarea placeholder="Add personal revision notes or algorithmic approach notes..." />
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-6">
                    {/* Checkbox */}
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="chk-sample"
                        checked={checkboxChecked}
                        onCheckedChange={setCheckboxChecked}
                      />
                      <label
                        htmlFor="chk-sample"
                        className="text-xs text-[var(--text-secondary)] cursor-pointer select-none"
                      >
                        Pure Red Checkbox
                      </label>
                    </div>

                    {/* Switch */}
                    <div className="flex items-center gap-2">
                      <Switch
                        id="sw-sample"
                        checked={switchChecked}
                        onCheckedChange={setSwitchChecked}
                      />
                      <label
                        htmlFor="sw-sample"
                        className="text-xs text-[var(--text-secondary)] cursor-pointer select-none"
                      >
                        Hardware Switch
                      </label>
                    </div>
                  </div>

                  {/* Radio Group */}
                  <div className="pt-2">
                    <label className="text-xs font-medium text-[var(--text-secondary)] block mb-2">
                      Radio Group (Pure Red Dot Indicator)
                    </label>
                    <RadioGroup
                      value={radioValue}
                      onValueChange={setRadioValue}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="option-1" id="r1" />
                        <label
                          htmlFor="r1"
                          className="text-xs text-[var(--text-secondary)] cursor-pointer"
                        >
                          Immediate
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="option-2" id="r2" />
                        <label
                          htmlFor="r2"
                          className="text-xs text-[var(--text-secondary)] cursor-pointer"
                        >
                          Spaced Repetition
                        </label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            </section>

            {/* =========================================================================
             * Section 3: Navigation & Structure
             * ========================================================================= */}
            <section id="navigation" className="space-y-8 scroll-mt-20">
              <SectionHeader
                title="3. Navigation & Structure"
                description="Line tabs with pure red active indicators, segmented tabs, and sidebar navigation items."
                count="03"
              />

              <div className="p-6 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-base)] space-y-6">
                {/* Line Tabs */}
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)] mb-3">
                    Line Tabs with Pure Red Glowing Underline
                  </h4>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList variant="line">
                      <TabsTrigger value="all">All Topics (42)</TabsTrigger>
                      <TabsTrigger value="due">Due for Revision (6)</TabsTrigger>
                      <TabsTrigger value="mastered">Mastered (18)</TabsTrigger>
                    </TabsList>
                    <TabsContent
                      value="all"
                      className="p-4 rounded-[var(--radius-sm)] bg-[var(--surface-raised)] text-xs text-[var(--text-secondary)]"
                    >
                      Showing complete curriculum topics with unified tracking.
                    </TabsContent>
                    <TabsContent
                      value="due"
                      className="p-4 rounded-[var(--radius-sm)] bg-[var(--surface-raised)] text-xs text-red-300"
                    >
                      Spaced repetition queue: 6 problems require revision today.
                    </TabsContent>
                    <TabsContent
                      value="mastered"
                      className="p-4 rounded-[var(--radius-sm)] bg-[var(--surface-raised)] text-xs text-emerald-300"
                    >
                      18 topics successfully completed with high confidence.
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Segmented Tabs */}
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)] mb-3">
                    Segmented Tabs (Elevated Pill Controls)
                  </h4>
                  <Tabs defaultValue="day">
                    <TabsList variant="segmented">
                      <TabsTrigger value="day">Day View</TabsTrigger>
                      <TabsTrigger value="week">Week View</TabsTrigger>
                      <TabsTrigger value="month">Month View</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Sidebar Nav Items */}
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)] mb-3">
                    Sidebar Navigation Items (Pure Red Active Accent Line)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <NavItem
                      icon={DashboardSquare01Icon}
                      label="Today Plan"
                      active={true}
                      badge="3"
                    />
                    <NavItem icon={Layers01Icon} label="DSA Sheets" active={false} />
                    <NavItem
                      icon={Clock01Icon}
                      label="Revision Queue"
                      active={false}
                      badge="5"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* =========================================================================
             * Section 4: Status, Badges & Metrics
             * ========================================================================= */}
            <section id="status-metrics" className="space-y-8 scroll-mt-20">
              <SectionHeader
                title="4. Status, Badges & Metrics"
                description="Preparation states, DSA difficulty badges, Geist Mono tabular metric cards, and physical keycaps."
                count="04"
              />

              {/* Status & Badges Showcase */}
              <div className="p-6 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-base)] space-y-6">
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)] mb-3">
                    Preparation Status Lifecycle
                  </h4>
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge status="not_started" />
                    <StatusBadge status="learning" />
                    <StatusBadge status="solved" />
                    <StatusBadge status="needs_revision" />
                    <StatusBadge status="mastered" />
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)] mb-3">
                    DSA Problem Difficulty Badges
                  </h4>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="easy">EASY</Badge>
                    <Badge variant="medium">MEDIUM</Badge>
                    <Badge variant="hard">HARD</Badge>
                    <Badge variant="accent">PRIME ACCENT</Badge>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)] mb-3">
                    Physical Keycaps Primitive
                  </h4>
                  <div className="flex flex-wrap items-center gap-2">
                    <KeyboardKey>⌘</KeyboardKey>
                    <KeyboardKey>K</KeyboardKey>
                    <span className="text-xs text-[var(--text-tertiary)]">
                      Quick Search
                    </span>
                    <span className="mx-2 text-[var(--text-disabled)]">•</span>
                    <KeyboardKey>Esc</KeyboardKey>
                    <span className="text-xs text-[var(--text-tertiary)]">Dismiss</span>
                    <span className="mx-2 text-[var(--text-disabled)]">•</span>
                    <KeyboardKey>Enter</KeyboardKey>
                    <span className="text-xs text-[var(--text-tertiary)]">Execute</span>
                  </div>
                </div>
              </div>

              {/* Tabular Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Metric
                  label="Problems Solved"
                  value="128"
                  unit="/ 450"
                  helper="28% of target curriculum"
                  trend={{ value: "+14 this week", direction: "up" }}
                />
                <Metric
                  label="Due For Revision"
                  value="7"
                  unit="due"
                  helper="Spaced intervals active"
                  highlight={true}
                  trend={{ value: "Action required", direction: "down" }}
                />
                <Metric
                  label="Current Streak"
                  value="18"
                  unit="days"
                  helper="Target: 30 days unbroken"
                  trend={{ value: "On track", direction: "up" }}
                />
                <Metric
                  label="Readiness Index"
                  value="76"
                  unit="%"
                  helper="Calculated interview readiness"
                  trend={{ value: "+4.2%", direction: "up" }}
                />
              </div>

              {/* Lower-Chrome Metric Strip */}
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                  Minimal-Chrome Metric Strip (Single Line Overview)
                </h4>
                <MetricStrip
                  items={[
                    {
                      id: "1",
                      label: "Arrays & Hashing",
                      value: "24",
                      unit: "solved",
                      change: "+3",
                    },
                    {
                      id: "2",
                      label: "Two Pointers",
                      value: "16",
                      unit: "solved",
                      change: "+2",
                    },
                    { id: "3", label: "Sliding Window", value: "11", unit: "solved" },
                    {
                      id: "4",
                      label: "Trees & Graphs",
                      value: "19",
                      unit: "solved",
                      change: "+5",
                    },
                  ]}
                />
              </div>
            </section>

            {/* =========================================================================
             * Section 5: Data Display Patterns
             * ========================================================================= */}
            <section id="data-display" className="space-y-8 scroll-mt-20">
              <SectionHeader
                title="5. Data Display Patterns"
                description="Interactive fixture rows: tasks, DSA problems with external platform badges, spaced repetition rows, and tables."
                count="05"
              />

              {/* Task Rows */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">
                  Task Item States (Default, Active/In-Progress, Completed)
                </h4>
                <div className="space-y-2">
                  <TaskRow
                    title="Solve 3 Hard Dynamic Programming problems on Grid Paths"
                    category="DSA Sheet"
                    duration="45 min"
                    active={true}
                    action={
                      <Button size="sm" variant="secondary">
                        Open Sheet
                      </Button>
                    }
                  />
                  <TaskRow
                    title="Review Day 7 Spaced Repetition on Binary Tree Inorder Traversal"
                    category="Revision"
                    duration="15 min"
                    completed={false}
                  />
                  <TaskRow
                    title="Complete Mock System Design notes for Rate Limiter"
                    category="Architecture"
                    duration="30 min"
                    completed={true}
                  />
                </div>
              </div>

              {/* DSA Problem Rows */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">
                  DSA Problem Rows with External Platform Indicator
                </h4>
                <div className="space-y-2">
                  <ProblemRow
                    id="001"
                    title="Two Sum"
                    difficulty="easy"
                    topic="Arrays & Hashing"
                    platform="LeetCode"
                    status="solved"
                  />
                  <ProblemRow
                    id="015"
                    title="3Sum (Unique Triplets)"
                    difficulty="medium"
                    topic="Two Pointers"
                    platform="TakeUForward"
                    status="needs_revision"
                  />
                  <ProblemRow
                    id="042"
                    title="Trapping Rain Water"
                    difficulty="hard"
                    topic="Dynamic Programming / Monotonic Stack"
                    platform="LeetCode"
                    status="learning"
                  />
                </div>
              </div>

              {/* Spaced Repetition Revision Rows */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">
                  Spaced Repetition Review Queue (Due Today in Pure Red)
                </h4>
                <div className="space-y-2">
                  <RevisionRow
                    topic="LRU Cache Design & Doubly Linked List Invariants"
                    interval="D-7"
                    dueDate="Due Today"
                    status="due_today"
                    onReview={() => toast.info("Opening revision modal...")}
                  />
                  <RevisionRow
                    topic="Graph Topological Sort (Kahn's Algorithm & DFS)"
                    interval="D-14"
                    dueDate="Due Tomorrow"
                    status="upcoming"
                  />
                </div>
              </div>

              {/* Activity Feed Rows */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">
                  Chronological Activity Feed Primitive
                </h4>
                <div className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-base)] divide-y divide-[var(--border-subtle)]">
                  <ActivityRow
                    icon={Tick02Icon}
                    title="Problem Solved: 3Sum"
                    description="TakeUForward Sheet • Two Pointers"
                    timestamp="10m ago"
                    iconClassName="text-[var(--success-foreground)]"
                  />
                  <ActivityRow
                    icon={Clock01Icon}
                    title="Spaced Repetition Completed: Day 3 Revision"
                    description="Invert Binary Tree"
                    timestamp="2h ago"
                    iconClassName="text-[var(--accent)]"
                  />
                  <ActivityRow
                    icon={ChartLineData01Icon}
                    title="Weekly Target Met: 20 problems solved"
                    description="Progress index recalculated to 76%"
                    timestamp="1d ago"
                  />
                </div>
              </div>

              {/* Progress Bars */}
              <div className="space-y-4 p-5 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-base)]">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">
                  Progress Indicators (Linear, Segmented & Labeled)
                </h4>
                <div className="space-y-4 max-w-xl">
                  <Progress value={65} showLabel={true} />
                  <Progress
                    variant="segmented"
                    segments={6}
                    value={50}
                    showLabel={true}
                  />
                </div>
              </div>

              {/* Data Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">
                  Data Table Primitive
                </h4>
                <div className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-base)] overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Problem</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>Platform</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium text-white">
                          Merge Intervals
                        </TableCell>
                        <TableCell>
                          <Badge variant="medium">MEDIUM</Badge>
                        </TableCell>
                        <TableCell className="text-xs font-mono text-[var(--text-tertiary)]">
                          LeetCode #56
                        </TableCell>
                        <TableCell>
                          <StatusBadge status="solved" size="sm" />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-white">
                          Course Schedule
                        </TableCell>
                        <TableCell>
                          <Badge variant="medium">MEDIUM</Badge>
                        </TableCell>
                        <TableCell className="text-xs font-mono text-[var(--text-tertiary)]">
                          LeetCode #207
                        </TableCell>
                        <TableCell>
                          <StatusBadge status="needs_revision" size="sm" />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-white">
                          Alien Dictionary
                        </TableCell>
                        <TableCell>
                          <Badge variant="hard">HARD</Badge>
                        </TableCell>
                        <TableCell className="text-xs font-mono text-[var(--text-tertiary)]">
                          GeeksforGeeks
                        </TableCell>
                        <TableCell>
                          <StatusBadge status="learning" size="sm" />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </section>

            {/* =========================================================================
             * Section 6: Calendar Primitive
             * ========================================================================= */}
            <section id="calendar" className="space-y-8 scroll-mt-20">
              <SectionHeader
                title="6. Calendar Primitive"
                description="Custom monthly preparation calendar demonstrating Today (pure red ring), Selected (pure red solid fill), completed days, and streaks."
                count="06"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <Calendar
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    toast.info(`Selected date: ${date.toDateString()}`);
                  }}
                  completedDates={[
                    new Date(new Date().getFullYear(), new Date().getMonth(), 2),
                    new Date(new Date().getFullYear(), new Date().getMonth(), 5),
                    new Date(new Date().getFullYear(), new Date().getMonth(), 8),
                  ]}
                  streakDates={[
                    new Date(new Date().getFullYear(), new Date().getMonth(), 10),
                    new Date(new Date().getFullYear(), new Date().getMonth(), 11),
                    new Date(new Date().getFullYear(), new Date().getMonth(), 12),
                  ]}
                />

                <div className="space-y-4 p-5 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-base)] text-xs text-[var(--text-secondary)]">
                  <h4 className="text-sm font-semibold text-white">
                    Calendar Visual States
                  </h4>
                  <ul className="space-y-2.5">
                    <li className="flex items-center gap-2.5">
                      <span className="h-6 w-6 rounded-[var(--radius-xs)] border border-[var(--accent)] bg-[var(--accent-subtle)] text-white font-mono text-xs flex items-center justify-center font-bold">
                        15
                      </span>
                      <span>
                        <strong>Today:</strong> Outlined with pure red border and subtle
                        tint
                      </span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="h-6 w-6 rounded-[var(--radius-xs)] bg-[var(--accent)] text-white font-mono text-xs flex items-center justify-center font-bold shadow-[0_0_8px_rgba(255,0,0,0.5)]">
                        15
                      </span>
                      <span>
                        <strong>Selected:</strong> Solid pure red neumorphic fill
                      </span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="h-2 w-2 rounded-full bg-[var(--success)] shadow-[0_0_4px_rgba(48,164,108,0.8)]" />
                      <span>
                        <strong>Green Dot:</strong> Completed study target achieved
                      </span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="h-2 w-2 rounded-full bg-[var(--accent)] shadow-[0_0_4px_rgba(255,0,0,0.8)]" />
                      <span>
                        <strong>Pure Red Dot:</strong> Active streak maintained
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* =========================================================================
             * Section 7: Overlays & Feedback
             * ========================================================================= */}
            <section id="overlays" className="space-y-8 scroll-mt-20">
              <SectionHeader
                title="7. Overlays & Feedback"
                description="Dialogs, Alert Dialogs, Sheets, Popovers, Dropdowns, Command Palette, Toasts, Empty states, and Skeletons."
                count="07"
              />

              {/* Overlay Trigger Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-6 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-base)]">
                {/* Dialog Trigger */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="secondary" className="w-full">
                      Open Dialog
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Standard Modal Dialog</DialogTitle>
                      <DialogDescription>
                        This is a Level 4 modal overlay surface with tactile close and
                        backdrop blur.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-2 text-xs text-[var(--text-secondary)]">
                      Dialog body content formatted with high-contrast readable elements.
                    </div>
                    <DialogFooter>
                      <Button variant="primary">Confirm Action</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Alert Dialog Trigger */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      Alert Dialog
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reset Preparation Progress?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. All local progress indicators will
                        be reset to default.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => toast.error("Action executed")}>
                        Yes, Reset
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Sheet Trigger */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="secondary" className="w-full">
                      Open Sheet
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right">
                    <SheetHeader>
                      <SheetTitle>Detail Drawer</SheetTitle>
                      <SheetDescription>
                        Docked right sheet drawer for deep inspection without navigating
                        away.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="py-4 space-y-3 text-xs text-[var(--text-secondary)]">
                      <p>Full drawer content rendered cleanly.</p>
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Dropdown Menu Trigger */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" className="w-full">
                      Dropdown Menu
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => toast.info("Marked as Solved")}>
                      Mark Solved
                      <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => toast.info("Scheduled for Revision")}
                    >
                      Add to Revision
                      <DropdownMenuShortcut>⌘R</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem destructive onClick={() => toast.error("Removed")}>
                      Remove Problem
                      <DropdownMenuShortcut>⌫</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Popover Trigger */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full">
                      Popover
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <div className="space-y-2 text-xs">
                      <h4 className="font-semibold text-white">Popover Title</h4>
                      <p className="text-[var(--text-secondary)]">
                        Targeted contextual card overlay for inline settings or filters.
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Tooltip Trigger */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" className="w-full">
                      Hover Tooltip
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Tactile tooltip on elevated surface</TooltipContent>
                </Tooltip>

                {/* Command Palette Trigger */}
                <Button
                  variant="outline"
                  onClick={() => setCommandOpen(true)}
                  className="w-full"
                >
                  Command (⌘K)
                </Button>

                {/* Toast Triggers */}
                <Button
                  variant="primary"
                  onClick={() => toast.success("Spaced repetition revision recorded!")}
                  className="w-full"
                >
                  Trigger Toast
                </Button>
              </div>

              {/* Command Palette Component */}
              <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
                <CommandInput placeholder="Type a command or jump to section..." />
                <CommandList>
                  <CommandEmpty>No matching results found.</CommandEmpty>
                  <CommandGroup heading="Design Sections">
                    {sections.map((s) => (
                      <CommandItem
                        key={s.id}
                        onSelect={() => {
                          setCommandOpen(false);
                          window.location.hash = s.id;
                        }}
                      >
                        <Icon icon={Layers01Icon} size={14} className="mr-2" />
                        <span>{s.label}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandGroup heading="Quick Actions">
                    <CommandItem
                      onSelect={() => {
                        setCommandOpen(false);
                        toast.success("Command executed!");
                      }}
                    >
                      <Icon icon={Tick02Icon} size={14} className="mr-2" />
                      <span>Test Action Confirmation</span>
                      <CommandShortcut>↵</CommandShortcut>
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </CommandDialog>

              {/* Empty & Error States */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EmptyState
                  icon={BookOpen01Icon}
                  title="No Revision Tasks Due"
                  description="All spaced repetition intervals are currently up to date. Continue your new problem sheet or take a rest."
                  action={
                    <Button size="sm" variant="secondary">
                      Browse Curriculum
                    </Button>
                  }
                />

                <ErrorState
                  title="Failed to Load External Sheet"
                  message="Could not synchronize with external platform metadata. Please check connection and retry."
                  onRetry={() => toast.info("Retrying fetch...")}
                />
              </div>

              {/* Skeleton Pulse */}
              <div className="p-5 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-base)] space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">
                  Loading Skeleton Fallback
                </h4>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </section>

            {/* =========================================================================
             * Section 8: Responsive & Accessibility
             * ========================================================================= */}
            <section id="a11y" className="space-y-8 scroll-mt-20">
              <SectionHeader
                title="8. Responsive & Accessibility"
                description="Responsive layout behaviors, pure red high-visibility focus indicators, and reduced-motion standards."
                count="08"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card elevation="raised">
                  <CardHeader>
                    <CardTitle className="text-sm">Keyboard Focus Rings</CardTitle>
                    <CardDescription>
                      Every interactive control implements high-contrast focus rings in
                      Pure Red:
                      <code className="block mt-1 font-mono text-[10px] text-white">
                        ring-2 ring-[var(--accent)]/50
                      </code>
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card elevation="raised">
                  <CardHeader>
                    <CardTitle className="text-sm">Reduced-Motion Compliance</CardTitle>
                    <CardDescription>
                      Full global media query disables animations and transitions
                      automatically when
                      <code className="block mt-1 font-mono text-[10px] text-white">
                        prefers-reduced-motion: reduce
                      </code>
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card elevation="raised">
                  <CardHeader>
                    <CardTitle className="text-sm">Responsive Fluid Grid</CardTitle>
                    <CardDescription>
                      Mobile-first architecture: switches from horizontal strips to
                      stacked cards, full touch targets (minimum 36px-40px).
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
