"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SearchInput } from "@/components/ui/search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAI } from "@/features/ai/ai-provider";
import {
  analyticsViews,
  calendarWeeks,
  difficulties,
  independentChange,
  percent,
  type AnalyticsFilters,
  type PeriodProjection,
} from "./metrics";
import type { AnalyticsData } from "./service";

const Pulse = dynamic(() => import("./pulse"), {
  ssr: false,
  loading: () => (
    <div className="analytics-loading-plot" role="status">
      Loading chart…
    </div>
  ),
});

const count = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });
const number = (value: number | null | undefined) =>
  value == null ? "—" : count.format(value);
const rate = (value: number | null | undefined) =>
  value == null ? "—" : `${number(value)}%`;
const time = (seconds: number | null | undefined) => {
  if (seconds == null) return "—";
  if (seconds >= 3600) return `${number(seconds / 3600)} h`;
  return `${number(seconds / 60)} min`;
};
const sum = (
  days: PeriodProjection["daily"],
  key: "committed" | "fulfilled" | "carried" | "planned" | "completed"
) =>
  days.some((day) => day[key] === null)
    ? null
    : days.reduce((total, day) => total + (day[key] ?? 0), 0);
const titleCase = (label: string) =>
  label.replace(/_/g, " ").replace(/^./, (letter) => letter.toUpperCase());

function Choice({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly (readonly [string, string])[];
  onChange: (value: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map(([id, name]) => (
          <SelectItem key={id} value={id}>
            {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card elevation="raised" className="analytics-panel">
      <header className="analytics-section-heading">
        <h2>{title}</h2>
        <p>{description}</p>
      </header>
      {children}
    </Card>
  );
}

function Metric({
  label,
  value,
  context,
  delta,
  unit = "",
}: {
  label: string;
  value: string;
  context: string;
  delta?: number | null;
  unit?: string;
}) {
  return (
    <div className="analytics-metric">
      <dt>{label}</dt>
      <dd>{value}</dd>
      <small>{context}</small>
      {delta != null && (
        <span className="analytics-delta">
          {delta > 0 ? "+" : ""}
          {number(delta)}
          {unit} vs previous
        </span>
      )}
    </div>
  );
}

function OverviewMetrics({
  current,
  previous,
}: {
  current: PeriodProjection;
  previous: PeriodProjection | null;
}) {
  const a = current.attempt;
  const p = previous?.attempt;
  return (
    <dl className="analytics-metrics" aria-label="Period metrics">
      <Metric
        label="Problems solved"
        value={number(a?.distinctSolved)}
        context="Distinct problems"
        delta={a && p ? a.distinctSolved - p.distinctSolved : null}
      />
      <Metric
        label="Independent solve rate"
        value={rate(a?.rate)}
        context={
          a
            ? `${a.independent} of ${a.eligible} eligible attempts`
            : "Attempt evidence unavailable"
        }
        delta={a?.rate != null && p?.rate != null ? a.rate - p.rate : null}
        unit=" pp"
      />
      <Metric
        label="Recorded study"
        value={time(current.studySeconds)}
        context={`${current.sessionCount} timed sessions`}
        delta={
          current.studySeconds != null && previous?.studySeconds != null
            ? (current.studySeconds - previous.studySeconds) / 60
            : null
        }
        unit=" min"
      />
      <Metric
        label="Active days"
        value={number(current.activeDays)}
        context={`Across ${current.daily.length} local days`}
        delta={
          current.activeDays != null && previous?.activeDays != null
            ? current.activeDays - previous.activeDays
            : null
        }
      />
    </dl>
  );
}

function Allocation({
  current,
  previous,
}: {
  current: PeriodProjection;
  previous: PeriodProjection | null;
}) {
  const [work, setWork] = useState("");
  const selected = current.domains.find((row) => row.name === work);
  return (
    <Panel
      title="Preparation Mix"
      description="Logged study time by work type. Custom work has no recorded subject classification."
    >
      {current.studySeconds && current.domains.length ? (
        <>
          <div className="analytics-allocation" aria-hidden="true">
            {current.domains.map(({ name, seconds }, i) => (
              <span
                key={name}
                style={{
                  flexGrow: seconds,
                  background:
                    name === work
                      ? "var(--accent)"
                      : `color-mix(in srgb, var(--foreground) ${92 - i * 16}%, var(--prime-canvas))`,
                }}
              />
            ))}
          </div>
          <ul className="analytics-ranked">
            {current.domains.map(({ name, seconds }, i) => {
              const before = previous?.domains.find((row) => row.name === name)?.seconds;
              return (
                <li key={name}>
                  <button
                    type="button"
                    aria-pressed={work === name}
                    onClick={() => setWork(work === name ? "" : name)}
                  >
                    <span>
                      <small>{String(i + 1).padStart(2, "0")}</small> {name}
                    </span>
                    <strong>
                      {time(seconds)} · {rate(percent(seconds, current.studySeconds!))}
                    </strong>
                  </button>
                  {before != null && <small>{time(before)} in previous period</small>}
                </li>
              );
            })}
          </ul>
          {selected && (
            <p className="analytics-note">
              {selected.name} recorded {selected.count}{" "}
              {selected.count === 1 ? "session" : "sessions"}, averaging{" "}
              {time(selected.seconds / selected.count)}.
            </p>
          )}
        </>
      ) : (
        <p className="analytics-note">
          No closed sessions with a recorded duration in this period.
        </p>
      )}
    </Panel>
  );
}

function Landscape({
  data,
  compact = false,
}: {
  data: AnalyticsData;
  compact?: boolean;
}) {
  return (
    <Panel
      title="Mastery Landscape"
      description="Current PRIME Core evidence, independent of the selected date range."
    >
      {data.masteryCounts && (
        <dl className="analytics-mini-metrics">
          {Object.entries(data.masteryCounts).map(([label, amount]) => (
            <div key={label}>
              <dt>{titleCase(label)}</dt>
              <dd>{amount}</dd>
            </div>
          ))}
        </dl>
      )}
      {data.stages?.length ? (
        <div className="analytics-stages">
          {data.stages.map((stage) => (
            <details key={stage.id}>
              <summary>
                <strong>{stage.name}</strong>
                <span>
                  {titleCase(stage.level)} · {stage.total} Core
                </span>
              </summary>
              <ul>
                {stage.topics.map((topic) => (
                  <li key={topic.id}>
                    <Link href={`/mastery?topic=${encodeURIComponent(topic.slug)}`}>
                      <strong>{topic.name}</strong>
                      <span>
                        {topic.coverage.practicedCount}/{topic.coverage.totalCount}{" "}
                        practiced · {titleCase(topic.level)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      ) : (
        <p className="analytics-note">
          The authoritative mastery projection is unavailable.
        </p>
      )}
      {!compact && (
        <Button asChild variant="outline" size="sm">
          <Link href="/mastery">Open Mastery</Link>
        </Button>
      )}
    </Panel>
  );
}

function Rhythm({
  days,
  previous,
}: {
  days: PeriodProjection["daily"];
  previous?: PeriodProjection["daily"];
}) {
  const [selected, setSelected] = useState(days.length - 1);
  const day = days[selected] ?? days.at(-1)!;
  const level = (row: typeof day) => {
    if (row.rest && !row.active) return "Rest";
    if (row.active === null) return "Unknown";
    if (!row.active) return "Quiet";
    const events = row.activityEvents;
    return events >= 5 ? "High" : events >= 2 ? "Moderate" : "Light";
  };
  return (
    <Panel
      title="Preparation Rhythm"
      description="A calendar of recorded activity and planned rest. Select any day to inspect it."
    >
      <div className="analytics-rhythm" role="group" aria-label="Activity calendar">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((name) => (
          <span aria-hidden="true" key={name}>
            {name}
          </span>
        ))}
        {days.map((row, i) => (
          <button
            key={row.date}
            type="button"
            data-level={level(row)}
            style={
              i === 0
                ? {
                    gridColumnStart:
                      ((new Date(`${row.date}T00:00:00Z`).getUTCDay() + 6) % 7) + 1,
                  }
                : undefined
            }
            aria-label={`${row.date}, ${level(row)}${row.rest && row.active ? ", planned rest" : ""}`}
            aria-pressed={i === selected}
            onClick={() => setSelected(i)}
          >
            {row.date.slice(8)}
          </button>
        ))}
      </div>
      <div className="analytics-legend">
        {["Quiet", "Light", "Moderate", "High", "Rest", "Unknown"].map((item) => (
          <span key={item}>
            <b className="analytics-swatch" data-level={item} />
            {item}
          </span>
        ))}
      </div>
      <div className="analytics-inspection">
        <div>
          <span className="analytics-kicker">
            {day.rest ? "Planned rest" : level(day)}
          </span>
          <div className="analytics-date">{day.date}</div>
        </div>
        <dl className="analytics-readings">
          <div>
            <dt>Committed</dt>
            <dd>{number(day.committed)}</dd>
          </div>
          <div>
            <dt>Completed</dt>
            <dd>{number(day.completed)}</dd>
          </div>
          <div>
            <dt>Carried placements</dt>
            <dd>{number(day.carried)}</dd>
          </div>
          <div>
            <dt>Recorded</dt>
            <dd>{day.recorded == null ? "—" : time(day.recorded * 60)}</dd>
          </div>
          <div>
            <dt>Reviews</dt>
            <dd>{number(day.reviews)}</dd>
          </div>
          {previous && (
            <div>
              <dt>Prior · {previous[selected]?.date}</dt>
              <dd>{number(previous[selected]?.completed)} completed</dd>
            </div>
          )}
        </dl>
        <Button asChild variant="outline" size="sm">
          <Link href={`/calendar?date=${day.date}`}>Open calendar</Link>
        </Button>
      </div>
    </Panel>
  );
}

function Insights({ data, brief = false }: { data: AnalyticsData; brief?: boolean }) {
  const current = data.current.attempt;
  const prior = data.previous?.attempt;
  const difference = independentChange(current, prior ?? null);
  const sufficient = current && prior && difference !== null;
  const overloaded = data.current.daily.filter(
    (day) => day.available != null && day.planned != null && day.planned > day.available
  );
  const cards = [
    sufficient && Math.abs(difference) >= 8
      ? {
          title: `Independent solve rate ${difference > 0 ? "increased" : "decreased"} by ${Math.abs(difference)} points`,
          body: `${current.independent}/${current.eligible} current vs ${prior.independent}/${prior.eligible} previous. Topic and difficulty mix can affect the comparison.`,
          label: "Inspect DSA",
          href: "/analytics?view=dsa&compare=previous",
        }
      : {
          title: sufficient
            ? "Independent solve rate stayed within 8 points"
            : "A comparable solve-rate trend needs more evidence",
          body: sufficient
            ? `${current.eligible} current and ${prior.eligible} previous eligible attempts.`
            : "Enable the previous-period comparison and record at least 10 classified attempts in each period.",
          label: "Open practice",
          href: "/practice/dsa",
        },
    ...(overloaded.length
      ? [
          {
            title: `${overloaded.length} ${overloaded.length === 1 ? "day exceeded" : "days exceeded"} recorded capacity`,
            body: "The current committed workload exceeded the saved capacity on these days. Use Planner to review upcoming workloads.",
            label: "Review plan",
            href: "/plan",
          },
        ]
      : []),
    ...(data.current.reviewCount === 0
      ? [
          {
            title: "Retention evidence is limited",
            body: "No revision outcomes were recorded in this period. Record a review to add recall evidence.",
            label: "Open revision",
            href: "/revision",
          },
        ]
      : []),
    ...(data.current.sessionCount === 0
      ? [
          {
            title: "Study time has no measured sample",
            body: "Close a focus session with a recorded duration to begin comparing planned and recorded time.",
            label: "Open Today",
            href: "/today",
          },
        ]
      : []),
  ];
  return (
    <Panel
      title={brief ? "Key insights" : "Preparation insights"}
      description="Observations linked to their recorded evidence."
    >
      <ul className="analytics-insights">
        {cards.slice(0, brief ? 2 : 4).map((item) => (
          <li key={item.title}>
            <div>
              <strong>{item.title}</strong>
              <p>{item.body}</p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href={item.href}>{item.label}</Link>
            </Button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function TopicMatrix({
  data,
  filters,
}: {
  data: AnalyticsData;
  filters: AnalyticsFilters;
}) {
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("all");
  const [sort, setSort] = useState("curriculum");
  const [selected, setSelected] = useState<string | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const sheetTitle = useRef<HTMLHeadingElement | null>(null);
  const names = new Map(data.topics.map(({ slug, name }) => [slug, name]));
  const measured = new Map(data.current.topics.map((row) => [row.id, row]));
  const core =
    data.stages?.flatMap((section) =>
      section.topics.map((topic) => ({
        id: topic.id,
        slug: topic.slug,
        name: topic.name,
        stage: section.id,
        stageName: section.name,
        mastery: topic,
      }))
    ) ?? [];
  const coreIds = new Set(core.map(({ id }) => id));
  const other = data.current.topics
    .filter(({ id }) => !coreIds.has(id))
    .map(({ id, slug }) => ({
      id,
      slug,
      name: names.get(slug) ?? "Unclassified",
      stage: "",
      stageName: data.stages ? "Outside Core" : "Catalog topic",
      mastery: null,
    }));
  const topics = [...core, ...other].filter(
    (item) =>
      (stage === "all" || item.stage === stage) &&
      (!filters.topic || filters.topic === item.slug) &&
      item.name.toLowerCase().includes(search.toLowerCase().trim())
  );
  if (sort === "attempts")
    topics.sort(
      (a, b) => (measured.get(b.id)?.attempts ?? 0) - (measured.get(a.id)?.attempts ?? 0)
    );
  if (sort === "independence")
    topics.sort(
      (a, b) => (measured.get(b.id)?.rate ?? -1) - (measured.get(a.id)?.rate ?? -1)
    );
  const topic = topics.find(({ id }) => id === selected);
  const metrics = topic ? measured.get(topic.id) : null;
  const hasAttemptData = data.current.attempt !== null;
  const emptyCount = hasAttemptData ? 0 : null;
  const mastery = topic?.mastery;
  const coverage = mastery?.coverage;
  const days = data.current.daily;
  return (
    <Panel
      title="Topic Performance Matrix"
      description="Period performance by primary catalog topic, alongside current curriculum evidence."
    >
      <div className="analytics-controls analytics-filter-row">
        <SearchInput
          aria-label="Search topics"
          placeholder="Search topics"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Choice
          label="Curriculum stage"
          value={stage}
          options={[
            ["all", "All stages"],
            ...(data.stages ?? []).map(({ id, name }) => [id, name] as const),
          ]}
          onChange={setStage}
        />
        <Choice
          label="Sort topics"
          value={sort}
          options={[
            ["curriculum", "Curriculum order"],
            ["attempts", "Most attempts"],
            ["independence", "Independent solve rate"],
          ]}
          onChange={setSort}
        />
      </div>
      {topics.length ? (
        <div className="analytics-matrix" role="group" aria-label="Topic performance">
          {topics.map((item) => {
            const row = measured.get(item.id);
            return (
              <button
                type="button"
                key={item.id}
                aria-haspopup="dialog"
                aria-pressed={selected === item.id}
                onClick={(event) => {
                  trigger.current = event.currentTarget;
                  setSelected(item.id);
                }}
              >
                <span>
                  <strong>{item.name}</strong>
                  <small>{item.stageName}</small>
                </span>
                <span>
                  <small>Attempts</small>
                  <strong>
                    {number(row?.attempts ?? (data.current.attempt ? 0 : null))}
                  </strong>
                </span>
                <span>
                  <small>Independent</small>
                  <strong>{rate(row?.rate)}</strong>
                </span>
                <span>
                  <small>Core practiced</small>
                  <strong>
                    {item.mastery
                      ? `${item.mastery.coverage.practicedCount}/${item.mastery.coverage.totalCount}`
                      : "—"}
                  </strong>
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="analytics-note">No topics match these filters.</p>
      )}
      <Sheet
        open={!!topic}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        {topic && (
          <SheetContent
            className="analytics-topic-sheet flex h-dvh w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-md"
            onOpenAutoFocus={(event) => {
              event.preventDefault();
              sheetTitle.current?.focus();
            }}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              trigger.current?.focus();
            }}
          >
            <SheetHeader className="analytics-topic-header">
              <Badge variant="outline" className="analytics-eyebrow self-start">
                <span className="analytics-beacon" aria-hidden="true" />
                Topic evidence
              </Badge>
              <SheetTitle
                ref={sheetTitle}
                tabIndex={-1}
                className="analytics-topic-title"
              >
                {topic.name}
              </SheetTitle>
              <SheetDescription>{topic.stageName}</SheetDescription>
            </SheetHeader>
            <div className="analytics-topic-body">
              <Card elevation="raised" className="analytics-topic-card">
                <div>
                  <h3>Period performance</h3>
                  <p className="analytics-topic-range">
                    {days[0].date} – {days.at(-1)?.date}
                  </p>
                </div>
                <dl className="analytics-topic-metrics">
                  <div>
                    <dt>Problems attempted</dt>
                    <dd>{number(metrics?.distinctAttempted ?? emptyCount)}</dd>
                  </div>
                  <div>
                    <dt>Independently solved</dt>
                    <dd>{number(metrics?.distinctIndependent ?? emptyCount)}</dd>
                  </div>
                </dl>
                {metrics?.attempts ? (
                  <dl className="analytics-topic-breakdown">
                    <div>
                      <dt>Hint-assisted</dt>
                      <dd>{number(metrics.assisted)}</dd>
                    </div>
                    <div>
                      <dt>Unsolved</dt>
                      <dd>{number(metrics.failed)}</dd>
                    </div>
                    <div>
                      <dt>Solutions viewed</dt>
                      <dd>{number(metrics.viewed)}</dd>
                    </div>
                    <div>
                      <dt>Median solve</dt>
                      <dd>
                        {metrics.medianSeconds == null
                          ? "No timed solves"
                          : time(metrics.medianSeconds)}
                      </dd>
                    </div>
                  </dl>
                ) : (
                  <p className="analytics-note">
                    {hasAttemptData
                      ? "No attempts match this topic and the current filters."
                      : "Attempt data is unavailable for this period."}
                  </p>
                )}
              </Card>
              {mastery && coverage && (
                <Card elevation="raised" className="analytics-topic-card">
                  <div className="analytics-topic-card-heading">
                    <h3>Current mastery</h3>
                    <Badge variant="secondary">{titleCase(mastery.level)}</Badge>
                  </div>
                  <div className="analytics-topic-coverage">
                    <p>
                      <strong>
                        {coverage.practicedCount} / {coverage.totalCount}
                      </strong>{" "}
                      Core problems practiced
                    </p>
                    <Progress value={coverage.percentage} size="sm" aria-hidden="true" />
                  </div>
                  <p className="analytics-note">
                    {mastery.withRetentionEvidence} Core{" "}
                    {mastery.withRetentionEvidence === 1 ? "problem" : "problems"} with
                    successful reviews
                  </p>
                  {mastery.blockers[0] && (
                    <p className="analytics-topic-blocker analytics-note">
                      {mastery.blockers[0]}
                    </p>
                  )}
                </Card>
              )}
            </div>
            <SheetFooter className="analytics-topic-footer sm:space-x-0">
              {mastery && (
                <Button asChild variant="outline">
                  <Link href={`/mastery?topic=${encodeURIComponent(topic.id)}`}>
                    Open mastery
                  </Link>
                </Button>
              )}
              <Button asChild variant="primary">
                <Link
                  href={
                    topic.slug
                      ? `/practice/dsa?topic=${encodeURIComponent(topic.slug)}`
                      : "/practice/dsa"
                  }
                >
                  Open practice
                </Link>
              </Button>
            </SheetFooter>
          </SheetContent>
        )}
      </Sheet>
    </Panel>
  );
}

export function AnalyticsWorkspace({
  data,
  filters,
}: {
  data: AnalyticsData;
  filters: AnalyticsFilters;
}) {
  const router = useRouter();
  const ai = useAI();
  const [pending, startTransition] = useTransition();
  const { current, previous } = data;
  const { view } = filters;
  const href = (changes: Partial<AnalyticsFilters> = {}) => {
    const next = { ...filters, ...changes };
    const params = new URLSearchParams({ days: String(next.days) });
    if (next.view !== "overview") params.set("view", next.view);
    if (next.compare) params.set("compare", "previous");
    if (next.group === "week") params.set("group", "week");
    if (next.view === "dsa" && next.topic) params.set("topic", next.topic);
    if (next.view === "dsa" && next.difficulty) params.set("difficulty", next.difficulty);
    return `/analytics?${params}`;
  };
  const update = (changes: Partial<AnalyticsFilters>) =>
    startTransition(() => router.push(href(changes), { scroll: false }));
  const pulseProps = {
    days: current.daily,
    previous: previous?.daily,
    group: filters.group,
  };
  const range = `${current.daily[0].date} – ${current.daily.at(-1)?.date}`;
  const a = current.attempt;
  const aiRef = `${filters.days}-${filters.compare ? "previous" : "current"}`;
  return (
    <Tabs
      className="analytics-workspace"
      aria-busy={pending}
      value={view}
      activationMode="manual"
      onValueChange={(value) => update({ view: value as AnalyticsFilters["view"] })}
    >
      <header className="analytics-header">
        <div>
          <Badge variant="outline" className="analytics-eyebrow">
            <span className="analytics-beacon" aria-hidden="true" />
            Preparation intelligence
          </Badge>
          <h1>Analytics</h1>
          <p>
            Understand how your practice translates into independent performance and
            retention.
          </p>
        </div>
        <Card elevation="base" className="analytics-header-tools">
          <div className="analytics-period-controls">
            <Choice
              label="Date range"
              value={String(filters.days)}
              options={[
                ["7", "Last 7 days"],
                ["30", "Last 30 days"],
                ["90", "Last 90 days"],
              ]}
              onChange={(days) => update({ days: Number(days) })}
            />
            <Choice
              label="Compare periods"
              value={filters.compare ? "previous" : "off"}
              options={[
                ["off", "No comparison"],
                ["previous", "Previous period"],
              ]}
              onChange={(compare) => update({ compare: compare === "previous" })}
            />
          </div>
          <p className="analytics-date">
            {range} <span>· {data.timezone}</span>
          </p>
          {previous && (
            <p className="analytics-date analytics-muted">
              vs {previous.daily[0].date} – {previous.daily.at(-1)?.date}
            </p>
          )}
        </Card>
      </header>
      <TabsList
        className="analytics-navigation"
        aria-label="Analytics views"
        layoutId="analytics-views"
      >
        {Object.entries(analyticsViews).map(([key, label]) => (
          <TabsTrigger key={key} value={key}>
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
      {data.unavailable.length > 0 && (
        <p role="status" className="analytics-note">
          Some data could not be loaded ({data.unavailable.join(", ")}).{" "}
          <button type="button" onClick={() => router.refresh()}>
            Retry
          </button>
        </p>
      )}
      {Object.keys(analyticsViews).map((key) => (
        <TabsContent key={key} value={key} className="analytics-tab-panel">
          {view === key && (
            <div className="analytics-body" key={href()}>
              {view === "overview" && (
                <>
                  <OverviewMetrics current={current} previous={previous} />
                  <Pulse {...pulseProps} />
                  <div className="analytics-pair">
                    <Allocation current={current} previous={previous} />
                    <Landscape data={data} compact />
                  </div>
                  <Insights data={data} brief />
                </>
              )}
              {view === "dsa" && (
                <>
                  <div
                    className="analytics-filter-row analytics-dsa-filters"
                    role="group"
                    aria-label="DSA filters"
                  >
                    <Choice
                      label="DSA topic"
                      value={filters.topic || "all"}
                      options={[
                        ["all", "All topics"],
                        ...data.topics.map(({ slug, name }) => [slug, name] as const),
                      ]}
                      onChange={(topic) =>
                        update({ topic: topic === "all" ? "" : topic })
                      }
                    />
                    <Choice
                      label="Difficulty"
                      value={filters.difficulty || "all"}
                      options={[
                        ["all", "All difficulties"],
                        ...difficulties.map(
                          (level) => [level, titleCase(level.toLowerCase())] as const
                        ),
                      ]}
                      onChange={(difficulty) =>
                        update({
                          difficulty:
                            difficulties.find((level) => level === difficulty) ?? "",
                        })
                      }
                    />
                    <Choice
                      label="Time grouping"
                      value={filters.group}
                      options={[
                        ["day", "Daily"],
                        ["week", "7-day intervals"],
                      ]}
                      onChange={(group) =>
                        update({ group: group === "week" ? "week" : "day" })
                      }
                    />
                  </div>
                  <Pulse {...pulseProps} title="Performance trajectory" />
                  <dl className="analytics-metrics">
                    <Metric
                      label="Independent"
                      value={rate(a?.rate)}
                      context={
                        a ? `${a.independent} of ${a.eligible} eligible` : "Unavailable"
                      }
                    />
                    <Metric
                      label="Hint-assisted"
                      value={rate(a?.hints)}
                      context={a ? `${a.assisted} successful attempts` : "Unavailable"}
                    />
                    <Metric
                      label="Median solve time"
                      value={time(a?.medianSeconds)}
                      context={`${a?.timed ?? 0} timed successes`}
                    />
                    <Metric
                      label="Other outcomes"
                      value={number(a ? a.failed + a.viewed : null)}
                      context={
                        a
                          ? `${a.failed} unsolved · ${a.viewed} solutions viewed`
                          : "Unavailable"
                      }
                    />
                  </dl>
                  <TopicMatrix data={data} filters={filters} />
                  <div className="analytics-pair">
                    <Panel
                      title="Difficulty analysis"
                      description="Outcome counts and measured time by catalog difficulty."
                    >
                      <ul className="analytics-ranked">
                        {current.difficulties.map(({ level, metrics }) => (
                          <li key={level}>
                            <strong>{titleCase(level.toLowerCase())}</strong>
                            <small>
                              {number(metrics?.attempts)} attempts ·{" "}
                              {number(metrics?.solves)} solved ·{" "}
                              {number(metrics?.independent)} independent ·{" "}
                              {time(metrics?.medianSeconds)} median
                              {metrics?.rate != null &&
                                ` · ${rate(metrics.rate)} independent solve rate`}
                            </small>
                            {metrics?.rate != null && (
                              <Progress
                                size="sm"
                                value={metrics.rate}
                                aria-hidden="true"
                              />
                            )}
                          </li>
                        ))}
                      </ul>
                    </Panel>
                    <Panel
                      title="Reattempt evidence"
                      description="An earlier non-independent outcome followed by an independent solve in the same period."
                    >
                      {current.reattempts.length ? (
                        <ul className="analytics-ranked">
                          {current.reattempts.slice(0, 12).map((row) => (
                            <li key={row.slug || row.title}>
                              {row.slug ? (
                                <Link href={`/practice/dsa/${row.slug}`}>
                                  {row.title}
                                </Link>
                              ) : (
                                row.title
                              )}
                              <small>{titleCase(row.outcome)} → independent</small>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="analytics-note">
                          No qualifying reattempt sequence in this period.
                        </p>
                      )}
                    </Panel>
                  </div>
                </>
              )}
              {view === "time" && (
                <>
                  <div className="analytics-controls analytics-filter-row">
                    <Choice
                      label="Time grouping"
                      value={filters.group}
                      options={[
                        ["day", "Daily"],
                        ["week", "7-day intervals"],
                      ]}
                      onChange={(group) =>
                        update({ group: group === "week" ? "week" : "day" })
                      }
                    />
                  </div>
                  <Pulse
                    {...pulseProps}
                    title="Planned vs recorded"
                    initialMode="execution"
                    fixed
                  />
                  <dl className="analytics-metrics">
                    <Metric
                      label="Planned workload"
                      value={time(
                        sum(current.daily, "planned") == null
                          ? null
                          : sum(current.daily, "planned")! * 60
                      )}
                      context="Current committed placements"
                    />
                    <Metric
                      label="Recorded study"
                      value={time(current.studySeconds)}
                      context={`${current.sessionCount} closed timed sessions`}
                    />
                    <Metric
                      label="Median session"
                      value={time(current.medianSession)}
                      context="Measured sessions only"
                    />
                    <Metric
                      label="Completed work"
                      value={number(sum(current.daily, "completed"))}
                      context="Tasks by recorded completion day"
                    />
                  </dl>
                  <Allocation current={current} previous={previous} />
                </>
              )}
              {view === "consistency" && (
                <>
                  <Rhythm days={current.daily} previous={previous?.daily} />
                  <Panel
                    title="Committed work"
                    description="Current placements for these dates. Historical adherence requires an immutable commitment log."
                  >
                    <dl className="analytics-mini-metrics">
                      <div>
                        <dt>Active days</dt>
                        <dd>{number(current.activeDays)}</dd>
                      </div>
                      <div>
                        <dt>Committed tasks</dt>
                        <dd>{number(sum(current.daily, "committed"))}</dd>
                      </div>
                      <div>
                        <dt>Completed on this plan</dt>
                        <dd>{number(sum(current.daily, "fulfilled"))}</dd>
                      </div>
                      <div>
                        <dt>Carried placements</dt>
                        <dd>{number(sum(current.daily, "carried"))}</dd>
                      </div>
                    </dl>
                  </Panel>
                  <Panel
                    title="Weekly execution"
                    description="Calendar weeks in the selected period. Boundary weeks may be partial."
                  >
                    <div
                      className="analytics-table-scroll"
                      role="region"
                      aria-label="Weekly execution data"
                      tabIndex={0}
                    >
                      <table>
                        <thead>
                          <tr>
                            <th scope="col">Week of</th>
                            <th scope="col">Active days</th>
                            <th scope="col">Committed</th>
                            <th scope="col">Completed</th>
                            <th scope="col">Carried</th>
                          </tr>
                        </thead>
                        <tbody>
                          {calendarWeeks(current.daily).map(
                            ({ start, rows, active, committed, completed, carried }) => (
                              <tr key={start}>
                                <th scope="row">
                                  {start}
                                  {rows.length < 7 && " (partial)"}
                                </th>
                                <td>{number(active)}</td>
                                <td>{number(committed)}</td>
                                <td>{number(completed)}</td>
                                <td>{number(carried)}</td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Panel>
                </>
              )}
              {view === "skills" && (
                <>
                  <Landscape data={data} />
                  <Panel
                    title="Retention evidence"
                    description="Review outcomes in the period, alongside the current revision queue."
                  >
                    <dl className="analytics-mini-metrics">
                      <div>
                        <dt>Recorded reviews</dt>
                        <dd>{number(current.reviewCount)}</dd>
                      </div>
                      <div>
                        <dt>Due now</dt>
                        <dd>{number(data.due)}</dd>
                      </div>
                      <div>
                        <dt>Overdue</dt>
                        <dd>{number(data.overdue)}</dd>
                      </div>
                      {["forgot", "hard", "okay", "easy"].map((rating) => (
                        <div key={rating}>
                          <dt>{titleCase(rating)}</dt>
                          <dd>
                            {number(
                              current.reviews ? (current.reviews[rating] ?? 0) : null
                            )}
                          </dd>
                        </div>
                      ))}
                    </dl>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/revision">Open revision queue</Link>
                    </Button>
                  </Panel>
                </>
              )}
              {view === "insights" && (
                <>
                  <Insights data={data} />
                  <Panel
                    title="Preparation target"
                    description="Current role, target date, and feasibility from Planner."
                  >
                    {data.target ? (
                      <dl className="analytics-mini-metrics">
                        <div>
                          <dt>Role</dt>
                          <dd>{data.target.target_role}</dd>
                        </div>
                        <div>
                          <dt>Target date</dt>
                          <dd>{data.target.target_date}</dd>
                        </div>
                        <div>
                          <dt>Feasibility</dt>
                          <dd>{titleCase(data.target.feasibility_status)}</dd>
                        </div>
                      </dl>
                    ) : (
                      <p className="analytics-note">
                        No active target plan is available.
                      </p>
                    )}
                    <Button asChild variant="outline" size="sm">
                      <Link href="/plan">Open Planner</Link>
                    </Button>
                  </Panel>
                </>
              )}
              <footer className="analytics-footer">
                <span>
                  {filters.compare
                    ? "Complete days only · Today is excluded from comparisons"
                    : "Includes today · The current day is in progress"}
                </span>
                {ai?.enabled && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(event) => {
                      const ref = { type: "progress", ref: aiRef } as const;
                      if (ai.reference.type !== ref.type || ai.reference.ref !== ref.ref)
                        ai.newConversation(ref);
                      ai.setOpen(true, event.currentTarget, ref);
                    }}
                  >
                    Explain my progress
                  </Button>
                )}
              </footer>
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
