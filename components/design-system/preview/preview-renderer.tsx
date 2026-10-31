"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SearchInput } from "@/components/ui/search-input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Command,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { Icon } from "@/components/ui/icon";
import { toast } from "sonner";
import {
  SparklesIcon,
  Search01Icon,
  CodeIcon,
  CheckmarkCircle02Icon,
  Timer02Icon,
  Fire02Icon,
  Layers01Icon,
} from "@hugeicons/core-free-icons";

// Shared pattern components
import { TaskRow } from "@/components/shared/task-row";
import { ProblemRow } from "@/components/shared/problem-row";
import { RevisionRow } from "@/components/shared/revision-row";
import { ActivityRow } from "@/components/shared/activity-row";
import { StatusBadge } from "@/components/shared/status";
import { Metric } from "@/components/shared/metric";
import { MetricStrip } from "@/components/shared/metric-strip";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { SectionHeader } from "@/components/shared/section-header";
import { NavItem } from "@/components/shared/nav-item";
import { ComponentPreview } from "./component-preview";
import { MotionPlayground } from "./motion-playground";

export interface PreviewRendererProps {
  slug: string;
}

export function PreviewRenderer({ slug }: PreviewRendererProps) {
  // Foundations
  if (slug === "colors") {
    const code = `<div className="space-y-4">
  {/* Pure Black Canvas & Surfaces */}
  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
    <div className="p-3 bg-[#000000] border border-[rgba(255,255,255,0.12)] rounded">#000000 Canvas</div>
    <div className="p-3 bg-[#030303] border border-[rgba(255,255,255,0.12)] rounded">#030303 Raised</div>
    <div className="p-3 bg-[#060606] border border-[rgba(255,255,255,0.12)] rounded">#060606 Elevated</div>
    <div className="p-3 bg-[#090909] border border-[rgba(255,255,255,0.12)] rounded">#090909 Interactive</div>
    <div className="p-3 bg-[#0d0d0d] border border-[rgba(255,255,255,0.12)] rounded">#0D0D0D Hover</div>
  </div>
  {/* Pure Red Accent */}
  <div className="p-3 bg-[#ff0000] text-white font-mono font-bold rounded">#FF0000 Pure Red Accent</div>
</div>`;

    return (
      <ComponentPreview code={code} title="Pure Black × Pure Red Tokens">
        <div className="w-full space-y-6">
          <div>
            <div className="text-xs font-mono uppercase text-[var(--text-tertiary)] mb-2">
              Black Surface Hierarchy
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { name: "Canvas", hex: "#000000", bg: "bg-[#000000]" },
                { name: "Raised", hex: "#030303", bg: "bg-[#030303]" },
                { name: "Elevated", hex: "#060606", bg: "bg-[#060606]" },
                { name: "Interactive", hex: "#090909", bg: "bg-[#090909]" },
                { name: "Hover", hex: "#0D0D0D", bg: "bg-[#0D0D0D]" },
              ].map((s) => (
                <div
                  key={s.name}
                  className={`p-3.5 rounded-[var(--radius-xs)] border border-[rgba(255,255,255,0.12)] ${s.bg}`}
                >
                  <div className="text-xs font-semibold text-white">{s.name}</div>
                  <div className="font-mono text-[11px] text-[rgba(255,255,255,0.46)] mt-1">
                    {s.hex}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-mono uppercase text-[var(--text-tertiary)] mb-2">
              Pure Red Brand Accent
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-[var(--radius-xs)] bg-[#ff0000] text-white">
                <div className="text-xs font-bold">Pure Red Primary</div>
                <div className="font-mono text-[11px] opacity-80">#FF0000</div>
              </div>
              <div className="p-3.5 rounded-[var(--radius-xs)] bg-[#ff0000]/15 border border-[#ff0000]/30 text-[#ff0000]">
                <div className="text-xs font-bold">Accent Soft (Badges/Tags)</div>
                <div className="font-mono text-[11px] opacity-80">rgba(255,0,0,0.15)</div>
              </div>
              <div className="p-3.5 rounded-[var(--radius-xs)] bg-[#030303] border-l-2 border-l-[#ff0000] border-y border-r border-[rgba(255,255,255,0.08)] text-white">
                <div className="text-xs font-bold">Active Signal Bar</div>
                <div className="font-mono text-[11px] text-[var(--text-tertiary)]">
                  Sidebar &amp; row indicator
                </div>
              </div>
            </div>
          </div>
        </div>
      </ComponentPreview>
    );
  }

  if (slug === "typography") {
    const code = `<div className="space-y-3 font-sans">
  <h1 className="text-3xl font-bold tracking-tight">Display Headline</h1>
  <p className="text-sm text-[var(--text-secondary)]">Editorial interface typography using Geist Sans.</p>
  <span className="font-mono font-mono-numbers text-sm text-[#ff0000]">38/45 (84.4%)</span>
</div>`;

    return (
      <ComponentPreview code={code} title="Dual Font Architecture">
        <div className="w-full space-y-4">
          <div className="p-4 rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.08)] bg-[#030303] space-y-2">
            <span className="text-[10px] font-mono uppercase text-[#ff0000]">
              Geist Sans — Editorial
            </span>
            <div className="text-2xl font-bold tracking-tight text-white">
              Preparation Roadmap for Interviews
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-xl">
              High contrast, pristine rendering at every resolution, with calibrated
              letter spacing for developer focus.
            </p>
          </div>
          <div className="p-4 rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.08)] bg-[#030303] space-y-2 font-mono">
            <span className="text-[10px] uppercase text-[#ff0000]">
              Geist Mono — Tabular Figures
            </span>
            <div className="text-xl font-bold text-white font-mono-numbers">
              1,248 SOLVED &bull; 04:12:59 TIMER &bull; 98.2% MASTERY
            </div>
          </div>
        </div>
      </ComponentPreview>
    );
  }

  if (slug === "spacing") {
    const code = `<div className="flex items-center gap-3">
  <div className="h-4 w-4 bg-[#ff0000]" />
  <div className="h-6 w-6 bg-[#ff0000]" />
  <div className="h-8 w-8 bg-[#ff0000]" />
</div>`;
    return (
      <ComponentPreview code={code} title="4px Geometric Spacing Scale">
        <div className="w-full space-y-2">
          {[
            { token: "space-1", px: "4px", w: "w-1" },
            { token: "space-2", px: "8px", w: "w-2" },
            { token: "space-3", px: "12px", w: "w-3" },
            { token: "space-4", px: "16px", w: "w-4" },
            { token: "space-6", px: "24px", w: "w-6" },
            { token: "space-8", px: "32px", w: "w-8" },
            { token: "space-12", px: "48px", w: "w-12" },
          ].map((sp) => (
            <div
              key={sp.token}
              className="flex items-center justify-between text-xs font-mono py-1 border-b border-[rgba(255,255,255,0.06)]"
            >
              <span className="text-white">{sp.token}</span>
              <div className="flex items-center gap-2">
                <span className="text-[var(--text-tertiary)]">{sp.px}</span>
                <div className={`h-2 bg-[#ff0000] ${sp.w}`} />
              </div>
            </div>
          ))}
        </div>
      </ComponentPreview>
    );
  }

  if (slug === "radius") {
    const code = `<div className="flex gap-3">
  <div className="rounded-[var(--radius-xs)] p-4 border border-[rgba(255,255,255,0.12)]">radius-xs (4px)</div>
  <div className="rounded-[var(--radius-sm)] p-4 border border-[rgba(255,255,255,0.12)]">radius-sm (6px)</div>
  <div className="rounded-[var(--radius-md)] p-4 border border-[rgba(255,255,255,0.12)]">radius-md (8px)</div>
</div>`;
    return (
      <ComponentPreview code={code} title="Border Radius Scale">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
          {[
            { label: "radius-none", px: "0px", cls: "rounded-none" },
            { label: "radius-xs", px: "4px", cls: "rounded-[var(--radius-xs)]" },
            { label: "radius-sm", px: "6px", cls: "rounded-[var(--radius-sm)]" },
            { label: "radius-md", px: "8px", cls: "rounded-[var(--radius-md)]" },
          ].map((r) => (
            <div
              key={r.label}
              className={`p-4 border border-[rgba(255,255,255,0.12)] bg-[#030303] text-center ${r.cls}`}
            >
              <div className="text-xs font-semibold text-white">{r.label}</div>
              <div className="text-[10px] font-mono text-[var(--text-tertiary)] mt-1">
                {r.px}
              </div>
            </div>
          ))}
        </div>
      </ComponentPreview>
    );
  }

  if (slug === "motion") {
    const code = `import { motionDuration, motionEase, motionSpring } from "@/lib/motion";

// 1. Dialog entrance & exit
<motion.div
  initial={{ opacity: 0, scale: 0.98, y: 8 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.985, y: 4 }}
  transition={{ duration: motionDuration.moderate, ease: motionEase.emphasized }}
/>

// 2. Shared Tab indicator gliding
<motion.span
  layoutId="prime-ds-active-tab"
  transition={motionSpring.control}
/>

// 3. Directional Sheet panel entrance
<motion.div
  initial={{ x: "100%" }}
  animate={{ x: 0 }}
  exit={{ x: "100%" }}
  transition={motionSpring.panel}
/>`;
    return (
      <ComponentPreview code={code} title="PRIME Centralized Motion System">
        <MotionPlayground />
      </ComponentPreview>
    );
  }

  if (slug === "elevation" || slug === "borders" || slug === "icons") {
    const code = `// ${slug} foundation token`;
    return (
      <ComponentPreview code={code} title={`${slug.toUpperCase()} Tokens`}>
        <div className="p-6 rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.12)] bg-[#030303] text-center space-y-2">
          <div className="text-sm font-semibold text-white capitalize">{slug} Scale</div>
          <p className="text-xs text-[var(--text-secondary)]">
            Canonical tokens calibrated for strict Pure Black and Pure Red visual rhythm.
          </p>
        </div>
      </ComponentPreview>
    );
  }

  // UI Components
  if (slug === "button") {
    const code = `<div className="flex flex-wrap gap-3">
  <Button variant="primary">Primary Action</Button>
  <Button variant="secondary">Secondary</Button>
  <Button variant="outline">Outline</Button>
  <Button variant="ghost">Ghost</Button>
  <Button variant="destructive">Destructive</Button>
</div>`;

    return (
      <ComponentPreview code={code} title="Button Variants & Sizes">
        <div className="space-y-6 w-full">
          <div>
            <div className="text-[10px] font-mono uppercase text-[var(--text-tertiary)] mb-2.5">
              Variants
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <Button variant="primary">Primary Action</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-mono uppercase text-[var(--text-tertiary)] mb-2.5">
              Sizes &amp; States
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <Button size="sm">Small (32px)</Button>
              <Button size="default">Default (36px)</Button>
              <Button size="lg">Large (40px)</Button>
              <Button size="icon" aria-label="Quick search">
                <Icon icon={Search01Icon} size={15} />
              </Button>
              <Button loading>Loading...</Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>
        </div>
      </ComponentPreview>
    );
  }

  if (slug === "input") {
    const code = `<div className="space-y-3 max-w-sm">
  <Input placeholder="Search problem or pattern..." />
  <Input defaultValue="Invalid URL" className="border-[#ff0000]" />
  <Input disabled placeholder="Disabled field" />
</div>`;
    return (
      <ComponentPreview code={code} title="Text Inputs">
        <div className="space-y-3 max-w-md w-full">
          <Input placeholder="Enter topic title or problem tag..." />
          <Input defaultValue="Invalid value" className="border-[#ff0000]" />
          <Input disabled placeholder="Disabled input state..." />
        </div>
      </ComponentPreview>
    );
  }

  if (slug === "textarea") {
    const code = `<Textarea placeholder="Add interview notes or solution approach..." rows={3} />`;
    return (
      <ComponentPreview code={code} title="Textarea">
        <div className="max-w-md w-full">
          <Textarea
            placeholder="Document time complexity, edge cases, and recurrence relation..."
            rows={3}
          />
        </div>
      </ComponentPreview>
    );
  }

  if (slug === "search-input") {
    const code = `<SearchInput placeholder="Filter 450 DSA problems..." />`;
    return (
      <ComponentPreview code={code} title="Search Input">
        <div className="max-w-md w-full">
          <SearchInput placeholder="Filter problems, patterns, or tags..." />
        </div>
      </ComponentPreview>
    );
  }

  if (slug === "checkbox") {
    const code = `<div className="flex items-center space-x-2">
  <Checkbox id="terms" defaultChecked />
  <label htmlFor="terms" className="text-xs text-white">Mark problem as solved</label>
</div>`;
    return (
      <ComponentPreview code={code} title="Checkbox">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="cb1" defaultChecked />
            <label
              htmlFor="cb1"
              className="text-xs text-white cursor-pointer select-none"
            >
              Mark problem as completed today
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="cb2" />
            <label
              htmlFor="cb2"
              className="text-xs text-[var(--text-secondary)] cursor-pointer select-none"
            >
              Flag for 48h spaced revision
            </label>
          </div>
        </div>
      </ComponentPreview>
    );
  }

  if (slug === "switch") {
    const code = `<div className="flex items-center justify-between max-w-xs">
  <span className="text-xs text-white">Daily Email Reminders</span>
  <Switch defaultChecked />
</div>`;
    return (
      <ComponentPreview code={code} title="Switch Toggle">
        <div className="flex items-center justify-between max-w-sm w-full p-3 rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.08)] bg-[#030303]">
          <div>
            <div className="text-xs font-semibold text-white">
              Spaced Repetition Prompts
            </div>
            <div className="text-[11px] text-[var(--text-secondary)]">
              Send revision alert at 08:00 AM
            </div>
          </div>
          <Switch defaultChecked />
        </div>
      </ComponentPreview>
    );
  }

  if (slug === "radio-group") {
    const code = `<RadioGroup defaultValue="easy">
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="easy" id="r-easy" />
    <label htmlFor="r-easy" className="text-xs text-white">Easy</label>
  </div>
</RadioGroup>`;
    return (
      <ComponentPreview code={code} title="Radio Group">
        <RadioGroup defaultValue="medium" className="space-y-1.5">
          {["Easy (10 min)", "Medium (25 min)", "Hard (45 min)"].map((opt, i) => (
            <div key={opt} className="flex items-center space-x-2">
              <RadioGroupItem value={["easy", "medium", "hard"][i]} id={`rg-${i}`} />
              <label htmlFor={`rg-${i}`} className="text-xs text-white cursor-pointer">
                {opt}
              </label>
            </div>
          ))}
        </RadioGroup>
      </ComponentPreview>
    );
  }

  if (slug === "select") {
    const code = `<Select defaultValue="leetcode">
  <SelectTrigger className="w-56">
    <SelectValue placeholder="Select platform" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="leetcode">LeetCode</SelectItem>
    <SelectItem value="takeuforward">TakeUForward</SelectItem>
  </SelectContent>
</Select>`;
    return (
      <ComponentPreview code={code} title="Select Dropdown">
        <Select defaultValue="leetcode">
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="leetcode">LeetCode</SelectItem>
            <SelectItem value="takeuforward">TakeUForward</SelectItem>
            <SelectItem value="geeksforgeeks">GeeksforGeeks</SelectItem>
          </SelectContent>
        </Select>
      </ComponentPreview>
    );
  }

  if (slug === "badge") {
    const code = `<div className="flex gap-2">
  <Badge variant="default">Default</Badge>
  <Badge variant="outline">Outline</Badge>
  <Badge variant="accent">Active Pulse</Badge>
</div>`;
    return (
      <ComponentPreview code={code} title="Badges">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="default">Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="accent">Active / Accent</Badge>
        </div>
      </ComponentPreview>
    );
  }

  if (slug === "avatar") {
    const code = `<div className="flex gap-3">
  <Avatar><AvatarFallback>ES</AvatarFallback></Avatar>
  <Avatar><AvatarFallback className="text-[#ff0000]">PR</AvatarFallback></Avatar>
</div>`;
    return (
      <ComponentPreview code={code} title="Avatar">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>ES</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback className="border-[#ff0000]/40 text-[#ff0000]">
              PR
            </AvatarFallback>
          </Avatar>
        </div>
      </ComponentPreview>
    );
  }

  if (slug === "card") {
    const code = `<Card className="max-w-md">
  <CardHeader>
    <CardTitle>Dynamic Programming</CardTitle>
    <CardDescription>24 problems scheduled for this sprint</CardDescription>
  </CardHeader>
  <CardContent><p className="text-xs text-[var(--text-secondary)]">Mastery rating: 78%</p></CardContent>
</Card>`;
    return (
      <ComponentPreview code={code} title="Card">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Dynamic Programming Roadmap</CardTitle>
            <CardDescription>24 structured problems across 5 subpatterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--text-secondary)]">Target completion</span>
              <span className="font-mono font-bold text-white">4 DAYS</span>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-[rgba(255,255,255,0.06)] pt-3">
            <span className="text-[11px] font-mono text-[var(--text-tertiary)]">
              Pattern #04
            </span>
            <Button size="sm" variant="outline">
              View Roadmap
            </Button>
          </CardFooter>
        </Card>
      </ComponentPreview>
    );
  }

  if (slug === "separator") {
    const code = `<Separator className="my-4" />`;
    return (
      <ComponentPreview code={code} title="Separator">
        <div className="w-full max-w-sm space-y-3">
          <div className="text-xs text-white">Top section</div>
          <Separator />
          <div className="text-xs text-[var(--text-secondary)]">Bottom section</div>
        </div>
      </ComponentPreview>
    );
  }

  if (slug === "skeleton") {
    const code = `<div className="space-y-2">
  <Skeleton className="h-4 w-48" />
  <Skeleton className="h-3 w-64" />
</div>`;
    return (
      <ComponentPreview code={code} title="Skeleton">
        <div className="space-y-2 max-w-sm w-full">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-64" />
          <Skeleton className="h-8 w-full" />
        </div>
      </ComponentPreview>
    );
  }

  if (slug === "progress") {
    const code = `<Progress value={68} variant="segmented" />`;
    return (
      <ComponentPreview code={code} title="Progress Indicator">
        <div className="space-y-4 max-w-md w-full">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[var(--text-secondary)]">
                Daily Target (Segmented)
              </span>
              <span className="text-white">68%</span>
            </div>
            <Progress value={68} variant="segmented" />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[var(--text-secondary)]">Standard Track</span>
              <span className="text-white">45%</span>
            </div>
            <Progress value={45} />
          </div>
        </div>
      </ComponentPreview>
    );
  }

  if (slug === "table") {
    const code = `<Table>
  <TableHeader><TableRow><TableHead>Problem</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
</Table>`;
    return (
      <ComponentPreview code={code} title="Data Table">
        <div className="w-full border border-[rgba(255,255,255,0.08)] rounded-[var(--radius-sm)] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Problem</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead className="text-right">Solved</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium text-white">Two Sum</TableCell>
                <TableCell>
                  <Badge variant="outline">EASY</Badge>
                </TableCell>
                <TableCell className="text-right font-mono font-mono-numbers text-[#ff0000]">
                  YES
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-white">3Sum</TableCell>
                <TableCell>
                  <Badge variant="outline">MED</Badge>
                </TableCell>
                <TableCell className="text-right font-mono font-mono-numbers text-[var(--text-tertiary)]">
                  PENDING
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </ComponentPreview>
    );
  }

  if (slug === "tabs") {
    const code = `<Tabs defaultValue="dsa">
  <TabsList>
    <TabsTrigger value="dsa">DSA Practice</TabsTrigger>
    <TabsTrigger value="system">System Design</TabsTrigger>
  </TabsList>
</Tabs>`;
    return (
      <ComponentPreview code={code} title="Tabs">
        <Tabs defaultValue="dsa" className="w-full max-w-md">
          <TabsList>
            <TabsTrigger value="dsa">DSA Practice</TabsTrigger>
            <TabsTrigger value="revision">Revision (4)</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
          </TabsList>
          <TabsContent value="dsa" className="p-3 text-xs text-[var(--text-secondary)]">
            Active view: 12 problems queued for today.
          </TabsContent>
          <TabsContent
            value="revision"
            className="p-3 text-xs text-[var(--text-secondary)]"
          >
            Active view: 4 spaced repetition reviews due.
          </TabsContent>
        </Tabs>
      </ComponentPreview>
    );
  }

  if (slug === "dialog") {
    const code = `<Dialog>
  <DialogTrigger asChild><Button variant="primary">Open Dialog</Button></DialogTrigger>
  <DialogContent><DialogTitle>Edit Schedule</DialogTitle></DialogContent>
</Dialog>`;
    return (
      <ComponentPreview code={code} title="Dialog Modal">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="primary">Launch Schedule Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configure Revision Interval</DialogTitle>
              <DialogDescription>
                Set spaced repetition triggers for dynamic programming algorithms.
              </DialogDescription>
            </DialogHeader>
            <div className="py-2 text-xs text-[var(--text-secondary)]">
              Dialog modal rendered with Pure Black surface and subtle white-alpha border.
            </div>
            <DialogFooter>
              <Button variant="primary">Save Schedule</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </ComponentPreview>
    );
  }

  if (slug === "alert-dialog") {
    const code = `<AlertDialog>
  <AlertDialogTrigger asChild><Button variant="destructive">Reset Progress</Button></AlertDialogTrigger>
  <AlertDialogContent><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogContent>
</AlertDialog>`;
    return (
      <ComponentPreview code={code} title="Alert Dialog">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Reset Topic Progress</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset Topic Progress?</AlertDialogTitle>
              <AlertDialogDescription>
                This action resets your mastery score for this subpattern back to 0%. This
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Reset Progress</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </ComponentPreview>
    );
  }

  if (slug === "sheet") {
    const code = `<Sheet>
  <SheetTrigger asChild><Button variant="outline">Open Drawer</Button></SheetTrigger>
  <SheetContent><SheetTitle>Problem Filters</SheetTitle></SheetContent>
</Sheet>`;
    return (
      <ComponentPreview code={code} title="Sheet Drawer">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">Open Filters Sheet</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filter Problems</SheetTitle>
              <SheetDescription>Filter by platform, tag, or difficulty</SheetDescription>
            </SheetHeader>
            <div className="py-4 text-xs text-[var(--text-secondary)]">
              Slide-over drawer component with pure black surface and backdrop blur.
            </div>
          </SheetContent>
        </Sheet>
      </ComponentPreview>
    );
  }

  if (slug === "popover") {
    const code = `<Popover>
  <PopoverTrigger asChild><Button variant="outline">Info</Button></PopoverTrigger>
  <PopoverContent>Popover details</PopoverContent>
</Popover>`;
    return (
      <ComponentPreview code={code} title="Popover">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Open Popover</Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 text-xs space-y-1">
            <div className="font-semibold text-white">Algorithm Complexity</div>
            <div className="text-[var(--text-secondary)]">
              Time: O(N log N) &bull; Space: O(1)
            </div>
          </PopoverContent>
        </Popover>
      </ComponentPreview>
    );
  }

  if (slug === "tooltip") {
    const code = `<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild><Button variant="ghost">Hover me</Button></TooltipTrigger>
    <TooltipContent>Tooltip message</TooltipContent>
  </Tooltip>
</TooltipProvider>`;
    return (
      <ComponentPreview code={code} title="Tooltip">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm">
                Hover For Shortcut
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <span>Press ⌘P to quickly jump to problem</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </ComponentPreview>
    );
  }

  if (slug === "dropdown-menu") {
    const code = `<DropdownMenu>
  <DropdownMenuTrigger asChild><Button variant="outline">Actions</Button></DropdownMenuTrigger>
  <DropdownMenuContent><DropdownMenuItem>Edit</DropdownMenuItem></DropdownMenuContent>
</DropdownMenu>`;
    return (
      <ComponentPreview code={code} title="Dropdown Menu">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Options Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            <DropdownMenuLabel>Problem Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Mark as Mastered</DropdownMenuItem>
            <DropdownMenuItem>Add Spaced Revision</DropdownMenuItem>
            <DropdownMenuItem>Copy External Link</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ComponentPreview>
    );
  }

  if (slug === "command") {
    const code = `<Command className="rounded-lg border">
  <CommandInput placeholder="Type a command..." />
  <CommandList><CommandItem>Two Sum</CommandItem></CommandList>
</Command>`;
    return (
      <ComponentPreview code={code} title="Command Palette">
        <div className="max-w-md w-full border border-[rgba(255,255,255,0.12)] rounded-[var(--radius-sm)] bg-[#030303] overflow-hidden">
          <Command>
            <CommandInput placeholder="Search commands, problems, or tags..." />
            <CommandList>
              <CommandGroup heading="Recent Problems">
                <CommandItem>Two Sum (LeetCode #1)</CommandItem>
                <CommandItem>Trapping Rain Water (LeetCode #42)</CommandItem>
                <CommandItem>LRU Cache (LeetCode #146)</CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      </ComponentPreview>
    );
  }

  if (slug === "calendar") {
    const code = `<Calendar className="rounded-md border" />`;
    return (
      <ComponentPreview code={code} title="Calendar">
        <div className="flex justify-center w-full">
          <Calendar className="border border-[rgba(255,255,255,0.08)] rounded-[var(--radius-sm)] bg-[#030303]" />
        </div>
      </ComponentPreview>
    );
  }

  if (slug === "icon") {
    const code = `<div className="flex gap-4">
  <Icon icon={SparklesIcon} size={16} />
  <Icon icon={Timer02Icon} size={20} className="text-[#ff0000]" />
</div>`;
    return (
      <ComponentPreview code={code} title="Icon Primitive">
        <div className="flex items-center gap-4">
          <Icon icon={SparklesIcon} size={18} />
          <Icon icon={Timer02Icon} size={20} className="text-[#ff0000]" />
          <Icon icon={CodeIcon} size={20} />
          <Icon icon={Fire02Icon} size={20} className="text-[#ff0000]" />
          <Icon icon={Layers01Icon} size={20} />
        </div>
      </ComponentPreview>
    );
  }

  if (slug === "sonner") {
    const code = `<Button onClick={() => toast.success("Problem marked as solved!")}>Show Toast</Button>`;
    return (
      <ComponentPreview code={code} title="Sonner Toast Notifications">
        <div className="flex flex-wrap gap-2.5">
          <Button
            variant="outline"
            onClick={() =>
              toast.success("Problem marked as solved!", {
                description: "Spaced repetition scheduled for 3 days from now.",
              })
            }
          >
            Trigger Success Toast
          </Button>
          <Button
            variant="destructive"
            onClick={() =>
              toast.error("Failed to sync status", {
                description: "Please check your network connection.",
              })
            }
          >
            Trigger Error Toast
          </Button>
        </div>
      </ComponentPreview>
    );
  }

  // Patterns
  if (slug === "status-badge") {
    const code = `<div className="flex gap-2">
  <StatusBadge status="needs_revision" />
  <StatusBadge status="solved" />
  <StatusBadge status="learning" />
</div>`;
    return (
      <ComponentPreview code={code} title="Status Indicators">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status="needs_revision" />
          <StatusBadge status="solved" />
          <StatusBadge status="learning" />
          <StatusBadge status="not_started" />
          <StatusBadge status="mastered" />
        </div>
      </ComponentPreview>
    );
  }

  if (slug === "metric-card" || slug === "metric") {
    const code = `<Metric
  label="Solved Today"
  value="8"
  trend={{ value: "+2 over quota", direction: "up" }}
/>`;
    return (
      <ComponentPreview code={code} title="Metric Card">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
          <Metric
            label="Solved Today"
            value="8"
            trend={{ value: "+2 over quota", direction: "up" }}
          />
          <Metric
            label="Current Streak"
            value="14"
            trend={{ value: "Personal best", direction: "neutral" }}
          />
        </div>
      </ComponentPreview>
    );
  }

  if (slug === "metric-strip") {
    const code = `<MetricStrip
  items={[
    { id: "1", label: "Total Solved", value: "342" },
    { id: "2", label: "Daily Quota", value: "8/10" },
    { id: "3", label: "Pending Revisions", value: "4" },
    { id: "4", label: "Readiness Rating", value: "86%" },
  ]}
/>`;
    return (
      <ComponentPreview code={code} title="Metric Strip">
        <MetricStrip
          className="w-full"
          items={[
            { id: "1", label: "Total Solved", value: "342" },
            { id: "2", label: "Daily Quota", value: "8/10" },
            { id: "3", label: "Pending Revisions", value: "4" },
            { id: "4", label: "Readiness Rating", value: "86%" },
          ]}
        />
      </ComponentPreview>
    );
  }

  if (slug === "task-row") {
    const code = `<TaskRow
  title="Solve 3 Hard Dynamic Programming Problems"
  category="DSA"
  duration="45 min"
  completed={false}
/>`;
    return (
      <ComponentPreview code={code} title="Task Row">
        <div className="space-y-2 w-full max-w-xl">
          <TaskRow
            title="Complete 3 Sliding Window DSA Problems"
            category="Practice"
            duration="45m"
            completed={false}
          />
          <TaskRow
            title="Review Binary Search Spaced Repetition"
            category="Revision"
            duration="20m"
            completed={true}
          />
        </div>
      </ComponentPreview>
    );
  }

  if (slug === "problem-row") {
    const code = `<ProblemRow
  id="1"
  title="Two Sum"
  difficulty="easy"
  topic="Arrays & Hashing"
  platform="LeetCode"
  platformUrl="https://leetcode.com/problems/two-sum"
  status="solved"
/>`;
    return (
      <ComponentPreview code={code} title="Problem Row">
        <div className="space-y-2 w-full max-w-xl">
          <ProblemRow
            id="1"
            title="Two Sum"
            difficulty="easy"
            topic="Arrays & Hashing"
            platform="LeetCode"
            platformUrl="https://leetcode.com/problems/two-sum"
            status="solved"
          />
          <ProblemRow
            id="42"
            title="Trapping Rain Water"
            difficulty="hard"
            topic="Two Pointers"
            platform="LeetCode"
            platformUrl="https://leetcode.com/problems/trapping-rain-water"
            status="not_started"
          />
        </div>
      </ComponentPreview>
    );
  }

  if (slug === "revision-row") {
    const code = `<RevisionRow
  topic="LRU Cache"
  interval="Day 3"
  dueDate="Today"
  status="due_today"
/>`;
    return (
      <ComponentPreview code={code} title="Revision Row">
        <div className="space-y-2 w-full max-w-xl">
          <RevisionRow
            topic="LRU Cache (Double Linked List + Hash Table)"
            interval="Day 3"
            dueDate="Today"
            status="due_today"
          />
          <RevisionRow
            topic="Merge K Sorted Lists"
            interval="Day 7"
            dueDate="In 2 days"
            status="upcoming"
          />
        </div>
      </ComponentPreview>
    );
  }

  if (slug === "activity-row") {
    const code = `<ActivityRow
  icon={CodeIcon}
  title="Course Schedule II"
  description="Solved on LeetCode"
  timestamp="14m ago"
/>`;
    return (
      <ComponentPreview code={code} title="Activity Row">
        <div className="space-y-2 w-full max-w-xl">
          <ActivityRow
            icon={CheckmarkCircle02Icon}
            title="Course Schedule II"
            description="Solved on LeetCode"
            timestamp="14m ago"
          />
          <ActivityRow
            icon={CodeIcon}
            title="Word Break (DP)"
            description="Revised on TakeUForward"
            timestamp="2h ago"
          />
        </div>
      </ComponentPreview>
    );
  }

  if (slug === "empty-state") {
    const code = `<EmptyState
  title="No Revisions Due Today"
  description="You have completed all scheduled spaced repetitions for today. Excellent consistency."
  action={<Button size="sm">Browse Practice Sheet</Button>}
/>`;
    return (
      <ComponentPreview code={code} title="Empty State">
        <div className="w-full max-w-md border border-[rgba(255,255,255,0.08)] rounded-[var(--radius-sm)] p-6 bg-[#030303]">
          <EmptyState
            title="No Revisions Due Today"
            description="All spaced repetitions are up to date. Keep maintaining this streak."
            action={<Button size="sm">Browse Practice Sheet</Button>}
          />
        </div>
      </ComponentPreview>
    );
  }

  if (slug === "error-state") {
    const code = `<ErrorState
  title="Failed to Sync Progress"
  message="Encountered an error while connecting. Click retry to refresh."
  onRetry={() => {}}
/>`;
    return (
      <ComponentPreview code={code} title="Error State">
        <div className="w-full max-w-md border border-[rgba(255,255,255,0.08)] rounded-[var(--radius-sm)] p-6 bg-[#030303]">
          <ErrorState
            title="Failed to Sync Progress"
            message="Encountered an error while connecting. Click retry to refresh."
            onRetry={() => {}}
          />
        </div>
      </ComponentPreview>
    );
  }

  if (slug === "page-header") {
    const code = `<PageHeader
  title="Today's Preparation"
  description="Tuesday &bull; 8 problems queued &bull; 2 revisions pending"
/>`;
    return (
      <ComponentPreview code={code} title="Page Header">
        <div className="w-full border-b border-[rgba(255,255,255,0.08)] pb-4">
          <PageHeader
            title="Today's Preparation"
            description="Tuesday &bull; 8 problems queued &bull; 2 revisions pending"
          />
        </div>
      </ComponentPreview>
    );
  }

  if (slug === "section-header") {
    const code = `<SectionHeader
  title="Active Revision Queue"
  count={4}
  action={<Button size="sm" variant="outline">Review All</Button>}
/>`;
    return (
      <ComponentPreview code={code} title="Section Header">
        <div className="w-full">
          <SectionHeader
            title="Active Revision Queue"
            count={4}
            action={
              <Button size="sm" variant="outline">
                Review All
              </Button>
            }
          />
        </div>
      </ComponentPreview>
    );
  }

  if (slug === "nav-item") {
    const code = `<NavItem
  label="Practice"
  href="/practice"
  icon={CodeIcon}
  badge="450"
  active={true}
/>`;
    return (
      <ComponentPreview code={code} title="Navigation Item">
        <div className="w-64 space-y-1 p-2 rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.08)] bg-[#030303]">
          <NavItem
            label="Practice"
            href="/practice"
            icon={CodeIcon}
            badge="450"
            active={true}
          />
          <NavItem
            label="Revision"
            href="/revision"
            icon={Timer02Icon}
            badge="4"
            active={false}
          />
        </div>
      </ComponentPreview>
    );
  }

  // Fallback for any other item
  return (
    <ComponentPreview code={`// ${slug}`} title={slug}>
      <div className="p-8 text-center text-xs text-[var(--text-secondary)]">
        Interactive preview for <span className="text-white font-mono">{slug}</span>
      </div>
    </ComponentPreview>
  );
}
