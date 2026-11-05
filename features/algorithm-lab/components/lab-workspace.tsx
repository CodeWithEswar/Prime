"use client";
import {
  Component,
  useEffect,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import {
  Edit01Icon,
  CodeIcon,
  FullScreenIcon,
  Cancel01Icon,
  AiChat01Icon,
  BookOpen01Icon,
  ArrowLeft01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LabControl } from "./lab-control";
import { SceneRenderer } from "./scene-renderer";
import { ExecutionInspector, traceValue } from "./execution-inspector";
import { PlaybackControls } from "./playback-controls";
import { PracticePrompt } from "./practice-prompt";
import { loadAlgorithm } from "../registry/registry";
import { ALGORITHMS } from "../registry/metadata";
import {
  playback,
  initialPlayback,
  STEP_DURATION_MS,
  type PlaybackAction,
} from "../engine/playback";
import { initialPractice, pendingPrediction } from "../engine/practice";
import type { AlgorithmMetadata, AlgorithmModule, LabMode } from "../engine/types";
import { useAI } from "@/features/ai/ai-provider";
import "./lab.css";
const InputEditor = dynamic(() => import("./input-editor").then((m) => m.InputEditor));
const Code = dynamic(() => import("./algorithm-code"), {
  loading: () => <p role="status">Loading synchronized code…</p>,
});
const subscribeWide = (listener: () => void) => {
  const media = matchMedia("(min-width:1200px)");
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
};
class TraceBoundary extends Component<
  { children: ReactNode; onReset: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <section className="lab-error" role="alert">
        <h2>This visualization couldn’t be displayed.</h2>
        <p>Your PRIME progress has not changed.</p>
        <LabControl
          onClick={() => {
            this.setState({ failed: false });
            this.props.onReset();
          }}
        >
          Reset input
        </LabControl>
      </section>
    ) : (
      this.props.children
    );
  }
}
export function LabLoader({ metadata }: { metadata: AlgorithmMetadata }) {
  const [module, setModule] = useState<AlgorithmModule | null>(null),
    [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    loadAlgorithm(metadata.slug)
      .then((m) => {
        if (active) setModule(m);
      })
      .catch(() => {
        if (active)
          setError("This algorithm could not be loaded. Reload the page to try again.");
      });
    return () => {
      active = false;
    };
  }, [metadata.slug]);
  return error ? (
    <div className="lab-error" role="alert">
      {error}
    </div>
  ) : module ? (
    <LabWorkspace key={metadata.slug} metadata={metadata} module={module} />
  ) : (
    <div className="lab-loading" role="status">
      <span className="lab-overline">ALGORITHM LAB</span>
      <h1>{metadata.name}</h1>
      <p>Preparing the execution workbench…</p>
    </div>
  );
}
export function LabWorkspace({
  metadata,
  module,
}: {
  metadata: AlgorithmMetadata;
  module: AlgorithmModule;
}) {
  const query = useSearchParams(),
    modeParam = query.get("mode"),
    initialMode: LabMode =
      modeParam === "step" || modeParam === "practice" ? modeParam : "watch";
  const [session, setSession] = useState(() => ({
    input: module.defaultInput,
    trace: module.generateTrace(module.defaultInput),
  }));
  const [state, dispatch] = useReducer(
    (s: typeof initialPlayback, a: PlaybackAction) =>
      playback(s, a, session.trace.steps.length),
    { ...initialPlayback, mode: initialMode }
  );
  const [practice, setPractice] = useState(initialPractice),
    [inputOpen, setInputOpen] = useState(false),
    [codeOverride, setCodeOpen] = useState<boolean | null>(null),
    [focus, setFocus] = useState(false),
    [guided, setGuided] = useState(false);
  const wide = useSyncExternalStore(
      subscribeWide,
      () => matchMedia("(min-width:1200px)").matches,
      () => false
    ),
    codeOpen = codeOverride ?? wide;
  const ai = useAI(),
    root = useRef<HTMLElement>(null),
    step = session.trace.steps[state.index] ?? session.trace.steps[0];
  const blocked =
    state.mode === "practice" &&
    !!pendingPrediction(session.trace, state.index, practice);
  useEffect(() => {
    if (state.status !== "playing" || state.mode !== "watch") return;
    const timer = setTimeout(
      () => dispatch({ type: "tick" }),
      STEP_DURATION_MS / state.speed
    );
    return () => clearTimeout(timer);
  }, [state.status, state.mode, state.index, state.speed]);
  useEffect(() => {
    const pause = () => {
      if (document.hidden) dispatch({ type: "seek", index: state.index });
    };
    document.addEventListener("visibilitychange", pause);
    return () => document.removeEventListener("visibilitychange", pause);
  }, [state.index]);
  function action(a: PlaybackAction) {
    if (
      blocked &&
      (a.type === "next" || a.type === "tick" || a.type === "seek" || a.type === "toggle")
    )
      return;
    if (a.type === "mode") {
      setPractice(initialPractice);
      const url = new URL(location.href);
      url.searchParams.set("mode", a.mode);
      window.history.replaceState(null, "", url.pathname + url.search);
    }
    if (a.type === "restart") setPractice(initialPractice);
    dispatch(a);
  }
  function apply(input: unknown) {
    const trace = module.generateTrace(input);
    setSession({ input, trace });
    setPractice(initialPractice);
    dispatch({ type: "restart" });
  }
  function openInput() {
    dispatch({ type: "seek", index: state.index });
    setInputOpen(true);
  }
  const answering = Object.values(practice.answers),
    correct = answering.filter((v) => v === "correct").length;
  const related = ALGORITHMS.filter(
    (a) => a.slug !== metadata.slug && a.category === metadata.category
  ).slice(0, 3);
  return (
    <section
      className="lab-workspace"
      data-focus={focus}
      ref={root}
      tabIndex={0}
      aria-label={`${metadata.name} execution workbench`}
      onKeyDown={(e) => {
        if (e.key === "Escape" && focus) {
          setFocus(false);
          return;
        }
        if (
          e.altKey ||
          e.ctrlKey ||
          e.metaKey ||
          (e.target as HTMLElement).closest(
            "input,textarea,select,button,a,[role=button],[role=tab],[role=combobox],[contenteditable=true]"
          )
        )
          return;
        const a: PlaybackAction | undefined =
          e.key === " "
            ? { type: "toggle" }
            : e.key === "ArrowRight"
              ? { type: "next" }
              : e.key === "ArrowLeft"
                ? { type: "previous" }
                : e.key.toLowerCase() === "r"
                  ? { type: "restart" }
                  : undefined;
        if (a) {
          e.preventDefault();
          action(a);
        }
        if (e.key === "Escape") setFocus(false);
      }}
    >
      <header className="lab-header">
        <Link href="/lab" className="lab-back">
          <Icon icon={ArrowLeft01Icon} size={14} aria-hidden="true" /> Algorithm Lab
        </Link>
        <div className="lab-title-row">
          <div>
            <span className="lab-overline">
              {metadata.category.toUpperCase()} / EXECUTION WORKBENCH
            </span>
            <h1>{metadata.name}</h1>
            <p>{metadata.description}</p>
          </div>
          <LabControl
            icon={focus ? Cancel01Icon : FullScreenIcon}
            iconOnly
            label={focus ? "Exit focus view" : "Focus visualization"}
            aria-pressed={focus}
            onClick={() => setFocus(!focus)}
          />
        </div>
        <div className="lab-tools">
          <Tabs
            value={state.mode}
            onValueChange={(mode) => action({ type: "mode", mode: mode as LabMode })}
          >
            <TabsList variant="segmented" layoutId="lab-mode">
              <TabsTrigger value="watch">Watch</TabsTrigger>
              <TabsTrigger value="step">Step</TabsTrigger>
              <TabsTrigger value="practice">Practice</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="lab-tool-actions">
            <LabControl icon={Edit01Icon} onClick={openInput}>
              Input
            </LabControl>
            <LabControl
              icon={CodeIcon}
              aria-expanded={codeOpen}
              aria-controls="lab-synchronized-code"
              onClick={() => setCodeOpen(!codeOpen)}
            >
              {codeOpen ? "Hide code" : "View code"}
            </LabControl>
            <LabControl
              icon={BookOpen01Icon}
              iconOnly
              label="Guided learning"
              aria-pressed={guided}
              onClick={() => setGuided(!guided)}
            />
          </div>
        </div>
      </header>
      {guided && (
        <section className="lab-guided">
          <span className="lab-overline">GUIDED LEARNING / START WITH THE INVARIANT</span>
          <h2>What to notice</h2>
          <ul>
            {module.objectives.map((objective) => (
              <li key={objective}>{objective}</li>
            ))}
          </ul>
          <p>
            First watch one run. Then step through the decisions. Finally predict
            transitions in Practice.
          </p>
        </section>
      )}
      <TraceBoundary key={module.id} onReset={() => apply(module.defaultInput)}>
        <div className="lab-execution-grid">
          <section className="lab-visualization" aria-label="Visualization">
            <SceneRenderer key={JSON.stringify(session.input)} scene={step.scene} />
          </section>
          <ExecutionInspector step={step} />
        </div>
        <PlaybackControls
          state={state}
          length={session.trace.steps.length}
          blocked={blocked}
          onAction={action}
        />
        <div className="lab-reading-grid">
          <div>
            <section className="lab-state-trace" aria-labelledby="lab-step-title">
              <div className="lab-state-kicker">
                <span className="lab-overline">
                  STATE TRACE / {String(state.index + 1).padStart(2, "0")} OF{" "}
                  {session.trace.steps.length}
                </span>
                <span>{step.operation.replaceAll("_", " ")}</span>
              </div>
              <h2 id="lab-step-title">{step.title}</h2>
              <p>{step.explanation}</p>
              {state.index === session.trace.steps.length - 1 && (
                <p className="lab-result">
                  <span>RESULT</span>
                  <code>{traceValue(session.trace.result)}</code>
                </p>
              )}
            </section>
            {state.mode === "practice" && step.prediction && (
              <PracticePrompt
                key={`${step.id}-${state.mode}`}
                question={step.prediction}
                answered={practice.answers[state.index]}
                onAnswer={(isCorrect) =>
                  setPractice((p) => ({
                    ...p,
                    answers: isCorrect
                      ? { ...p.answers, [state.index]: "correct" }
                      : p.answers,
                    attempts: {
                      ...p.attempts,
                      [state.index]: (p.attempts[state.index] ?? 0) + 1,
                    },
                    incorrect: p.incorrect + (isCorrect ? 0 : 1),
                    retries: p.retries + ((p.attempts[state.index] ?? 0) > 0 ? 1 : 0),
                  }))
                }
                onReveal={() =>
                  setPractice((p) => ({
                    ...p,
                    answers: { ...p.answers, [state.index]: "revealed" },
                  }))
                }
              />
            )}
            {state.mode === "practice" && (
              <p className="lab-practice-summary">
                Session only · {answering.length} decisions · {correct} correct ·{" "}
                {practice.incorrect} incorrect attempts · {practice.retries} retries ·{" "}
                {answering.filter((v) => v === "revealed").length} revealed. Learning
                activity does not change Mastery.
              </p>
            )}
            <section className="lab-invariant">
              <span className="lab-overline">INVARIANT / WHAT MUST STAY TRUE</span>
              <p>{module.invariant}</p>
            </section>
            <section className="lab-complexity">
              <div>
                <span className="lab-overline">TIME</span>
                <strong>{module.complexity.time}</strong>
              </div>
              <div>
                <span className="lab-overline">SPACE</span>
                <strong>{module.complexity.space}</strong>
              </div>
              <p>{module.complexity.reason}</p>
            </section>
          </div>
          <section
            className="lab-code-panel"
            id="lab-synchronized-code"
            aria-label="Synchronized algorithm code"
            hidden={!codeOpen}
          >
            {codeOpen && <Code module={module} activeCode={step.code} />}
          </section>
        </div>
      </TraceBoundary>
      <div className="sr-only" role="status" aria-live="polite">
        Step {state.index + 1} of {session.trace.steps.length}. {step.title}.{" "}
        {Object.entries(step.variables)
          .map(([k, v]) => `${k}: ${traceValue(v)}.`)
          .join(" ")}
      </div>
      <footer className="lab-learning-footer">
        <div>
          <span className="lab-overline">TAKE THE NEXT STEP</span>
          <p>
            Use this pattern in a real problem. Recording an attempt remains a separate
            action.
          </p>
          <Link
            className="lab-learning-link"
            href={`/practice/dsa?topic=${encodeURIComponent(metadata.topics[0])}`}
          >
            Find related DSA problems
          </Link>
        </div>
        <Button asChild variant="secondary" size="sm">
          <Link href={"/plan?lab=" + encodeURIComponent(module.id)}>Plan a Lab session</Link>
        </Button>
        {ai?.enabled && (
          <LabControl
            icon={AiChat01Icon}
            disabled={[
              "connecting",
              "streaming",
              "tool_running",
              "tool_requested",
              "resuming",
              "confirmation_required",
            ].includes(ai.state)}
            onClick={(e) => {
              const ref = {
                type: "lab" as const,
                ref: module.id,
                lab: {
                  input: JSON.stringify(session.input),
                  step: state.index,
                  mode: state.mode,
                },
              };
              ai.newConversation(ref);
              ai.setOpen(true, e.currentTarget, ref);
              dispatch({ type: "seek", index: state.index });
            }}
          >
            Ask PRIME about this step
          </LabControl>
        )}
      </footer>
      {related.length > 0 && (
        <nav className="lab-related" aria-label="Related algorithms">
          <span className="lab-overline">EXPLORE THE FAMILY</span>
          {related.map((a) => (
            <Link key={a.slug} href={`/lab/${a.slug}`}>
              {a.name}
            </Link>
          ))}
        </nav>
      )}
      <p className="lab-keyboard-hint">
        Focus the workbench: Space to play/pause · ← / → to step · R to restart. Shortcuts
        stay off while editing.
      </p>
      {inputOpen && (
        <InputEditor
          module={module}
          input={session.input}
          onApply={apply}
          onClose={() => setInputOpen(false)}
        />
      )}
      {process.env.NODE_ENV !== "production" && (
        <details className="lab-debug">
          <summary>Development trace inspection</summary>
          <pre>{JSON.stringify(step, null, 2)}</pre>
        </details>
      )}
    </section>
  );
}
