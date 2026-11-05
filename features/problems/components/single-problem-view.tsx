"use client";
import { useState, useRef, useEffect, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  LinkSquare01Icon,
  Activity01Icon,
  ChartLineData01Icon,
  Clock01Icon,
  Calendar03Icon,
  Target02Icon,
  Layers01Icon,
  BookOpen01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { Icon, type IconSvgElement } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status";
import { ProblemMasteryEvidence } from "@/features/mastery/components/problem-mastery-evidence";
import { queryKeys } from "@/lib/query/keys";
import { INTERVAL_SEQUENCE } from "@/domain/attempts";
import { cleanProblemTitle } from "@/lib/utils";
import { getProblemDetailAction } from "../mutations/get-problem-detail-action";
import {
  safeCatalogReturn,
  readCatalogPosition,
  parseCatalogPosition,
  problemHref,
} from "../navigation";
import {
  practiceAnalytics,
  practiceProvider,
  formatPracticeDate,
  outcomeNames,
  reviewNames,
  windowNames,
} from "../selectors/intelligence";
import { AttemptDialog } from "./attempt-dialog";
import { RecordRevisionDialog } from "@/features/revision/components/record-revision-dialog";
import { ProblemAttemptTimeline } from "./problem-attempt-timeline";
import { CompanyRelevance } from "./company-relevance";
import type { ProblemDetail } from "../types";
import "./problem-intelligence.css";
import { LabLinks } from "@/features/algorithm-lab/components/lab-links";

const Charts = dynamic(() => import("./problem-charts").then((m) => m.ProblemCharts), {
  ssr: false,
  loading: () => (
    <div className="problem-chart-loading" role="status">
      Loading your performance chart…
    </div>
  ),
});
const subscribeStorage = (listener: () => void) => {
  window.addEventListener("storage", listener);
  return () => window.removeEventListener("storage", listener);
};
function SectionHeading({
  id,
  eyebrow,
  icon,
  children,
}: {
  id: string;
  eyebrow: string;
  icon: IconSvgElement;
  children: ReactNode;
}) {
  return (
    <div className="problem-card-heading">
      <span className="problem-card-icon" aria-hidden="true">
        <Icon icon={icon} size={20} />
      </span>
      <div>
        <span className="problem-eyebrow">{eyebrow}</span>
        <h2 id={id} tabIndex={-1}>
          {children}
        </h2>
      </div>
    </div>
  );
}
function SectionNav({ revisionFirst }: { revisionFirst: boolean }) {
  const [active, setActive] = useState("overview");
  const sections = revisionFirst
    ? ["overview", "revision", "performance", "attempts", "context"]
    : ["overview", "performance", "attempts", "revision", "context"];
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (entry) setActive(entry.target.id);
      },
      { rootMargin: "-125px 0px -50% 0px" }
    );
    document
      .querySelectorAll(".problem-intelligence section[id]")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return (
    <nav className="problem-section-nav" aria-label="Problem sections">
      {sections.map((section) => (
        <a
          key={section}
          href={`#${section}`}
          aria-current={active === section ? "location" : undefined}
          onClick={() => {
            setActive(section);
            requestAnimationFrame(() =>
              document
                .querySelector<HTMLElement>(`#${section} h2`)
                ?.focus({ preventScroll: true })
            );
          }}
        >
          {section[0].toUpperCase() + section.slice(1)}
        </a>
      ))}
    </nav>
  );
}
function RevisionSection({
  problem,
  onRecordRevision,
}: {
  problem: ProblemDetail;
  onRecordRevision?: () => void;
}) {
  const revision = problem.revision,
    provider = practiceProvider(problem.externalUrl),
    reviews = problem.reviewHistory;
  const stages = [
    ...new Set<number>([
      ...INTERVAL_SEQUENCE,
      ...(revision ? [revision.intervalDays] : []),
    ]),
  ].sort((a, b) => a - b);
  const completed = new Set(reviews.map((r) => r.previousIntervalDays));
  const latest = [...reviews].sort(
    (a, b) => Date.parse(b.reviewedAt) - Date.parse(a.reviewedAt)
  )[0];
  return (
    <section id="revision" className="problem-section" aria-labelledby="revision-title">
      <SectionHeading
        id="revision-title"
        eyebrow="Revision & retention"
        icon={Calendar03Icon}
      >
        {problem.isRevisionOverdue
          ? "Time to revisit this problem."
          : problem.isRevisionDue
            ? "Your next review is due."
            : "Keep what you learn."}
      </SectionHeading>
      {problem.unavailable.includes("revision") ? (
        <p className="problem-empty" role="status">
          Your revision schedule is temporarily unavailable.
        </p>
      ) : !revision ? (
        <p className="problem-empty">
          No revision scheduled. Your first review will be scheduled after you record an
          attempt.
        </p>
      ) : (
        <>
          <div className="problem-revision-state">
            <div>
              <span className="problem-meta-label">
                {revision.status === "active"
                  ? "Next revision"
                  : `Revision ${revision.status}`}
              </span>
              <strong>{formatPracticeDate(revision.nextReviewAt)}</strong>
            </div>
            <div>
              <span className="problem-meta-label">Current interval</span>
              <strong>{revision.intervalDays}-day review</strong>
            </div>
            {latest && (
              <div>
                <span className="problem-meta-label">Last review result</span>
                <strong>{reviewNames[latest.rating]}</strong>
              </div>
            )}
          </div>
          <ol className="problem-revision-path" aria-label="Review intervals">
            {stages.map((stage) => (
              <li
                key={stage}
                data-current={stage === revision.intervalDays}
                data-completed={completed.has(stage) && stage !== revision.intervalDays}
                aria-current={stage === revision.intervalDays ? "step" : undefined}
              >
                <span aria-hidden="true" />
                <strong>{stage}D</strong>
                <small>
                  {stage === revision.intervalDays
                    ? "Current"
                    : completed.has(stage)
                      ? "Reviewed"
                      : ""}
                </small>
              </li>
            ))}
          </ol>
          <p className="problem-footnote">
            Intervals reflect your saved schedule. Earlier intervals are marked reviewed
            only when review history supports them.
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {problem.isRevisionDue && provider && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full sm:w-auto h-11 sm:h-8 justify-center font-mono text-xs"
              >
                <a href={provider.url} target="_blank" rel="noopener noreferrer">
                  Review problem
                  <Icon icon={LinkSquare01Icon} size={14} aria-hidden="true" />
                </a>
              </Button>
            )}
            {problem.isRevisionDue && onRecordRevision && (
              <Button
                type="button"
                onClick={onRecordRevision}
                variant="primary"
                size="sm"
                className="w-full sm:w-auto h-11 sm:h-8 justify-center font-mono text-xs bg-[#FF0000] hover:bg-[#CC0000] text-white"
              >
                Record Review
              </Button>
            )}
          </div>
          {reviews.length >= 3 && (
            <Charts attempts={[]} total={0} estimatedMinutes={null} reviews={reviews} />
          )}
        </>
      )}
    </section>
  );
}

export function SingleProblemView({
  initialProblem,
  userId = "",
}: {
  initialProblem: ProblemDetail;
  userId?: string;
}) {
  const query = useSearchParams(),
    router = useRouter(),
    client = useQueryClient();
  const detailKey = queryKeys.problems.detail(initialProblem.id, userId);
  const {
    data: problem = initialProblem,
    isFetching,
    isError,
  } = useQuery({
    queryKey: detailKey,
    queryFn: async () => {
      const detail = await getProblemDetailAction(initialProblem.slug);
      if (!detail) throw new Error("Problem unavailable");
      return detail;
    },
    initialData: initialProblem,
    staleTime: 60000,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [revisionDialogOpen, setRevisionDialogOpen] = useState(false);
  const opener = useRef<HTMLElement | null>(null);
  const rawFrom = query.get("from");
  const isFromRoadmap = rawFrom === "roadmap" || rawFrom === "/roadmap" || rawFrom?.startsWith("/roadmap");
  const isFromRevision = rawFrom === "revision" || rawFrom === "/revision";
  const returnHref = isFromRoadmap
    ? "/roadmap/dsa"
    : isFromRevision
      ? "/revision"
      : safeCatalogReturn(rawFrom);
  const from = new URL(returnHref, "https://prime.invalid").searchParams;
  const company = problem.companies.find((c) => c.slug === from.get("company")),
    collection = problem.collections?.find((c) => c.slug === from.get("collection"));
  const provider = practiceProvider(problem.externalUrl),
    analytics = practiceAnalytics(problem.attemptHistory, problem.attemptCount);
  const rawPosition = useSyncExternalStore(
    subscribeStorage,
    () => readCatalogPosition(returnHref),
    () => ""
  );
  const position = parseCatalogPosition(rawPosition),
    index = position?.items.findIndex((i) => i.slug === problem.slug) ?? -1;
  const previous = index > 0 ? position!.items[index - 1] : null,
    next = index >= 0 ? position!.items[index + 1] : null;
  function openAttempt(trigger: HTMLElement) {
    opener.current = trigger;
    setDialogOpen(true);
  }
  async function refreshAttempt() {
    await Promise.all([
      client.invalidateQueries({ queryKey: detailKey }),
      client.invalidateQueries({ queryKey: ["problems", "list"] }),
      client.invalidateQueries({ queryKey: queryKeys.problems.attempts(problem.id) }),
      client.invalidateQueries({ queryKey: queryKeys.problems.summary() }),
      client.invalidateQueries({ queryKey: queryKeys.revision.all }),
      client.invalidateQueries({ queryKey: queryKeys.progress.summary() }),
    ]);
    router.refresh();
  }
  const companySection = (
    <div id="companies">
      <CompanyRelevance
        key={problem.id}
        companies={problem.companies}
        preferredCompany={company?.slug}
        preferredWindow={from.get("window")}
      />
    </div>
  );
  return (
    <article className="problem-intelligence">
      <div className="problem-workspace-grid">
        <div className="problem-main">
          <Link href={returnHref} className="problem-back">
            <Icon icon={ArrowLeft01Icon} size={15} aria-hidden="true" />
            {isFromRoadmap
              ? "Back to DSA Roadmap"
              : isFromRevision
                ? "Back to Revision Queue"
                : "Back to DSA Practice"}
          </Link>
          <header className="problem-page-header">
            <div className="problem-title-line">
              <div>
                <span className="problem-eyebrow">
                  DSA
                  {problem.primaryTopic
                    ? ` / ${problem.primaryTopic.name}`
                    : " / Practice"}
                </span>
                <h1>{cleanProblemTitle(problem.title)}</h1>
              </div>
              <span className="problem-difficulty">{problem.difficulty}</span>
            </div>
            <div className="problem-header-meta">
              {!problem.unavailable.includes("progress") && (
                <StatusBadge status={problem.status} size="sm" />
              )}
              {problem.primaryTopic && <span>{problem.primaryTopic.name}</span>}
              {problem.collectionCount > 0 && (
                <a href="#context">
                  {problem.collectionCount} curated{" "}
                  {problem.collectionCount === 1 ? "collection" : "collections"}
                </a>
              )}
              {problem.isRevisionDue && (
                <a href="#revision" className="problem-due">
                  {problem.isRevisionOverdue ? "Revision overdue" : "Revision due"}
                </a>
              )}
            </div>
            {(company || collection || isFromRoadmap) && (
              <div className="problem-entry-context">
                {isFromRoadmap && (
                  <span className="font-mono text-xs text-[#FF4D4D] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF0000]" />
                    PRIME Core Curriculum Roadmap
                  </span>
                )}
                {company && (
                  <span>
                    From {company.name}
                    {from.get("window") &&
                    windowNames[from.get("window") as keyof typeof windowNames]
                      ? ` · ${windowNames[from.get("window") as keyof typeof windowNames]} source context`
                      : ""}
                  </span>
                )}
                {collection && (
                  <span>
                    From {collection.name}
                    {collection.position !== null && collection.position !== undefined
                      ? ` · Item ${collection.position + 1}`
                      : ""}
                  </span>
                )}
              </div>
            )}
            <div className="problem-actions flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 w-full">
              {provider ? (
                <Button
                  asChild
                  variant="outline"
                  className="w-full sm:w-auto h-[var(--control-height)] justify-center font-mono text-xs"
                >
                  <a href={provider.url} target="_blank" rel="noopener noreferrer">
                    Open on {provider.name}
                    <Icon icon={LinkSquare01Icon} size={15} aria-hidden="true" />
                  </a>
                </Button>
              ) : (
                <span className="problem-link-pending text-xs text-[var(--text-tertiary)] py-1">
                  Practice link pending verification
                </span>
              )}
              <Button
                onClick={(event) => openAttempt(event.currentTarget)}
                className="w-full sm:w-auto h-[var(--control-height)] justify-center font-mono text-xs"
              >
                Record Attempt
              </Button>
              <Button asChild variant="secondary" className="w-full sm:w-auto">
                <Link href={"/plan?problem=" + encodeURIComponent(problem.slug)}><Icon icon={Calendar03Icon} size={15} />Plan practice</Link>
              </Button>
            </div>
          </header>
          <LabLinks topics={problem.allTopics.map(topic=>topic.slug)} label="Visualize the underlying pattern"/>
          <SectionNav revisionFirst={problem.isRevisionDue} />
          {(isFetching || isError) && (
            <p className="problem-refresh" role="status">
              {isError
                ? "Your latest history could not be refreshed. Saved information is still shown."
                : "Refreshing your preparation history…"}
            </p>
          )}
          <section
            id="overview"
            className="problem-section"
            aria-labelledby="overview-title"
          >
            <SectionHeading
              id="overview-title"
              eyebrow="Preparation snapshot"
              icon={Activity01Icon}
            >
              {problem.attemptCount
                ? "Your preparation at a glance."
                : "Your starting point."}
            </SectionHeading>
            <dl className="problem-snapshot">
              {!problem.unavailable.includes("progress") && (
                <div>
                  <dt>
                    <Icon icon={CheckmarkCircle02Icon} size={14} aria-hidden="true" />
                    Status
                  </dt>
                  <dd className="problem-snapshot-text capitalize">
                    {problem.status.replaceAll("_", " ")}
                  </dd>
                </div>
              )}
              <div>
                <dt>
                  <Icon icon={Layers01Icon} size={14} aria-hidden="true" />
                  Attempts
                </dt>
                <dd>
                  {problem.unavailable.includes("attempts")
                    ? "Unavailable"
                    : problem.attemptCount}
                </dd>
              </div>
              {problem.estimatedMinutes !== null && problem.estimatedMinutes > 0 && (
                <div>
                  <dt>
                    <Icon icon={Clock01Icon} size={14} aria-hidden="true" />
                    Suggested target
                  </dt>
                  <dd>
                    {problem.estimatedMinutes}
                    <small> min</small>
                  </dd>
                </div>
              )}
              <div>
                <dt>
                  <Icon icon={Calendar03Icon} size={14} aria-hidden="true" />
                  Next revision
                </dt>
                <dd className="problem-snapshot-text">
                  {problem.unavailable.includes("revision")
                    ? "Unavailable"
                    : problem.nextRevisionAt
                      ? formatPracticeDate(problem.nextRevisionAt)
                      : "Not scheduled"}
                </dd>
              </div>
              {analytics.latest && (
                <div>
                  <dt>
                    <Icon icon={Target02Icon} size={14} aria-hidden="true" />
                    Latest confidence
                  </dt>
                  <dd>
                    {analytics.latest.confidence ?? "Unavailable"}
                    {analytics.latest.confidence && <small> / 5</small>}
                  </dd>
                </div>
              )}
            </dl>
            {!problem.attemptCount && !problem.unavailable.includes("attempts") && (
              <p className="problem-intro">
                Practice on the original platform. Record the outcome, time, and
                confidence here to build an honest picture of your progress.
              </p>
            )}
            {problem.unavailable.includes("progress") && (
              <p className="problem-footnote">
                Personal status is temporarily unavailable.
              </p>
            )}
          </section>
          {problem.mastery && <ProblemMasteryEvidence result={problem.mastery} />}
          {company && companySection}
          {problem.isRevisionDue && (
            <RevisionSection
              problem={problem}
              onRecordRevision={() => setRevisionDialogOpen(true)}
            />
          )}
          <section
            id="performance"
            className="problem-section"
            aria-labelledby="performance-title"
          >
            <SectionHeading
              id="performance-title"
              eyebrow="Performance"
              icon={ChartLineData01Icon}
            >
              {problem.attemptCount
                ? "Practice performance."
                : "Build your performance history."}
            </SectionHeading>
            {problem.unavailable.includes("attempts") ? (
              <p className="problem-empty">
                Performance will return when your attempt history is available.
              </p>
            ) : !analytics.points.length ? (
              <div className="problem-empty">
                <p>
                  Record attempts to understand solve quality, time taken, and confidence.
                  Trends appear when there is enough history to make them useful.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(event) => openAttempt(event.currentTarget)}
                  className="w-full sm:w-auto h-11 sm:h-8 justify-center font-mono text-xs"
                >
                  Record your first attempt
                </Button>
              </div>
            ) : (
              <>
                <div className="problem-performance-facts">
                  {analytics.best !== null && (
                    <div>
                      <span>
                        Best independent
                        {problem.attemptCount > problem.attemptHistory.length
                          ? " in this history"
                          : ""}
                      </span>
                      <strong>
                        {analytics.best.toFixed(1)}
                        <small> min</small>
                      </strong>
                    </div>
                  )}
                  <div>
                    <span>Latest outcome</span>
                    <strong className="problem-outcome-name">
                      {outcomeNames[analytics.latest!.outcome]}
                    </strong>
                  </div>
                </div>
                {problem.attemptCount > problem.attemptHistory.length && (
                  <p className="problem-footnote">
                    Charts summarize the latest {problem.attemptHistory.length} of{" "}
                    {problem.attemptCount} attempts. Load older entries in Attempt
                    History.
                  </p>
                )}
                {analytics.showTime || analytics.showConfidence ? (
                  <Charts
                    attempts={problem.attemptHistory}
                    total={problem.attemptCount}
                    estimatedMinutes={problem.estimatedMinutes}
                  />
                ) : (
                  <p className="problem-footnote">
                    Your first attempt is recorded. Time and confidence trends appear
                    after two usable observations.
                  </p>
                )}
                <div
                  className="problem-outcome-strip"
                  aria-label="Recent attempt outcomes"
                >
                  {analytics.points.slice(-6).map((point) => (
                    <span key={point.id}>
                      <small>#{point.number}</small>
                      {outcomeNames[point.outcome]}
                    </span>
                  ))}
                </div>
              </>
            )}
          </section>
          <section
            id="attempts"
            className="problem-section"
            aria-labelledby="attempts-title"
          >
            <SectionHeading
              id="attempts-title"
              eyebrow="Attempt history"
              icon={Layers01Icon}
            >
              Every attempt, in context.
            </SectionHeading>
            <ProblemAttemptTimeline
              key={`${problem.id}:${problem.attemptHistory[0]?.id ?? "empty"}`}
              problem={problem}
            />
          </section>
          {!problem.isRevisionDue && (
            <RevisionSection
              problem={problem}
              onRecordRevision={() => setRevisionDialogOpen(true)}
            />
          )}
          <section
            id="context"
            className="problem-section"
            aria-labelledby="context-title"
          >
            <SectionHeading
              id="context-title"
              eyebrow="Preparation context"
              icon={BookOpen01Icon}
            >
              Topics & collections.
            </SectionHeading>
            {problem.allTopics.length > 0 && (
              <div className="problem-context-block">
                <h3>Topics</h3>
                <div className="problem-topic-list">
                  {problem.allTopics.map((topic) => (
                    <Link
                      key={topic.id}
                      href={`/practice/dsa?topic=${encodeURIComponent(topic.slug)}`}
                    >
                      {topic.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {!!problem.collections?.length && (
              <div className="problem-context-block">
                <h3>Curated collections</h3>
                <ul className="problem-collection-list">
                  {problem.collections.map((item) => (
                    <li key={item.id} data-context={item.slug === collection?.slug}>
                      <Link
                        href={`/practice/dsa?collection=${encodeURIComponent(item.slug)}`}
                      >
                        {item.name}
                      </Link>
                      <span>
                        {item.position === null || item.position === undefined
                          ? "Included"
                          : `Item ${item.position + 1}`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {problem.unavailable.includes("companies") ? (
              <p className="problem-footnote">
                Company context is temporarily unavailable. Your personal workspace is
                unaffected.
              </p>
            ) : (
              !company && companySection
            )}
            {problem.acceptanceRate !== null && (
              <p className="problem-footnote">
                Provider acceptance rate: {problem.acceptanceRate}% · This is not your
                personal accuracy.
              </p>
            )}
          </section>
          {(previous || next) && (
            <nav className="problem-neighbors" aria-label="Current catalog results">
              {previous ? (
                <Link
                  href={problemHref(previous.slug, from)}
                  className="problem-neighbor-card problem-neighbor-prev"
                >
                  <div className="problem-neighbor-icon" aria-hidden="true">
                    <Icon icon={ArrowLeft01Icon} size={15} />
                  </div>
                  <div className="problem-neighbor-content">
                    <span className="problem-neighbor-eyebrow">Previous in results</span>
                    <strong className="problem-neighbor-title" title={cleanProblemTitle(previous.title)}>
                      {cleanProblemTitle(previous.title)}
                    </strong>
                  </div>
                </Link>
              ) : (
                <div className="problem-neighbor-placeholder" aria-hidden="true" />
              )}
              {next ? (
                <Link
                  href={problemHref(next.slug, from)}
                  className="problem-neighbor-card problem-neighbor-next"
                >
                  <div className="problem-neighbor-content">
                    <span className="problem-neighbor-eyebrow">Next in results</span>
                    <strong className="problem-neighbor-title" title={cleanProblemTitle(next.title)}>
                      {cleanProblemTitle(next.title)}
                    </strong>
                  </div>
                  <div className="problem-neighbor-icon" aria-hidden="true">
                    <Icon icon={ArrowRight01Icon} size={15} />
                  </div>
                </Link>
              ) : (
                <div className="problem-neighbor-placeholder" aria-hidden="true" />
              )}
            </nav>
          )}
        </div>
        <aside className="problem-context-rail" aria-label="Problem preparation context">
          <div className="problem-rail-card">
            <h2>
              <Icon icon={Activity01Icon} size={19} aria-hidden="true" />
              Your state
            </h2>
            <dl>
              <div>
                <dt>Current state</dt>
                <dd>
                  {problem.unavailable.includes("progress")
                    ? "Unavailable"
                    : problem.status.replaceAll("_", " ")}
                </dd>
              </div>
              {problem.lastAttemptAt && (
                <div>
                  <dt>Last practiced</dt>
                  <dd>{formatPracticeDate(problem.lastAttemptAt)}</dd>
                </div>
              )}
              <div>
                <dt>Attempts</dt>
                <dd>
                  {problem.unavailable.includes("attempts")
                    ? "Unavailable"
                    : problem.attemptCount}
                </dd>
              </div>
              {problem.nextRevisionAt && (
                <div>
                  <dt>Next revision</dt>
                  <dd>{formatPracticeDate(problem.nextRevisionAt)}</dd>
                </div>
              )}
            </dl>
          </div>
          <div className="problem-rail-card">
            <h2>
              <Icon icon={BookOpen01Icon} size={19} aria-hidden="true" />
              Problem context
            </h2>
            <dl>
              <div>
                <dt>Difficulty</dt>
                <dd className="capitalize">{problem.difficulty}</dd>
              </div>
              {problem.estimatedMinutes !== null && problem.estimatedMinutes > 0 && (
                <div>
                  <dt>Suggested target</dt>
                  <dd>{problem.estimatedMinutes} min</dd>
                </div>
              )}
              <div>
                <dt>Practice source</dt>
                <dd>{provider?.name ?? "Link under review"}</dd>
              </div>
              {problem.primaryTopic && (
                <div>
                  <dt>Primary topic</dt>
                  <dd>{problem.primaryTopic.name}</dd>
                </div>
              )}
              {problem.collectionCount > 0 && (
                <div>
                  <dt>Collections</dt>
                  <dd>
                    <a href="#context">{problem.collectionCount} collections</a>
                  </dd>
                </div>
              )}
              {problem.companies.length > 0 && (
                <div>
                  <dt>Company context</dt>
                  <dd>
                    <a href="#companies">{problem.companies.length} companies</a>
                  </dd>
                </div>
              )}
            </dl>
          </div>
          <p>Build mastery through repeatable practice, not a completion check.</p>
        </aside>
      </div>
      <AttemptDialog
        problemId={problem.id}
        problemTitle={problem.title}
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => {
          void refreshAttempt();
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          opener.current?.focus();
        }}
      />
      <RecordRevisionDialog
        item={{
          id: problem.revision?.id ?? problem.id,
          problemId: problem.id,
          title: problem.title,
          slug: problem.slug,
          difficulty: problem.difficulty.toUpperCase() as any,
          platform: provider?.name ?? "DSA",
          platformUrl: problem.externalUrl,
          topics: (problem.allTopics ?? []).map((t) => ({ id: t.id, name: t.name, slug: t.slug })),
          intervalDays: problem.revision?.intervalDays ?? 1,
          nextReviewAt: problem.revision?.nextReviewAt ?? new Date().toISOString(),
          snoozedUntil: null,
          bookmarked: false,
          category: problem.isRevisionOverdue ? "overdue" : "due_today",
          timingLabel: "Due Today",
          isOverdue: problem.isRevisionOverdue,
          stageLabel: `Stage ${problem.revision?.intervalDays ?? 1}-day`,
          lastAttempt: null,
          lastReview: null,
          status: problem.status,
        }}
        open={revisionDialogOpen}
        onOpenChange={setRevisionDialogOpen}
        onSuccess={() => {
          void refreshAttempt();
          client.invalidateQueries({ queryKey: queryKeys.revision.all });
        }}
      />
    </article>
  );
}
