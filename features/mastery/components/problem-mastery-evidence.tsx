import type { ProblemMasteryResult } from "@/domain/mastery";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const signals = {
  independence: "Independent solving",
  retention: "Spaced recall",
  repetition: "Repeat performance",
  timing: "Pacing",
  hintIndependence: "Working without hints",
  confidenceCalibration: "Confidence calibration",
  recency: "Recency",
} satisfies Record<keyof ProblemMasteryResult["evidence"], string>;

export function ProblemMasteryEvidence({ result }: { result: ProblemMasteryResult }) {
  const evidence = Object.entries(signals) as [keyof typeof signals, string][];
  return (
    <Card elevation="base" id="mastery-evidence">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>Mastery evidence</CardTitle>
          <span className="rounded border border-white/15 px-2 py-1 text-xs capitalize">
            {result.level} ·{" "}
            {result.lastEvidenceAt ? result.freshness : "No evidence yet"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm">
        <p>{result.nextEvidence}</p>
        <p className="text-xs text-[var(--text-secondary)]">
          {result.requirements.independentEvidenceCount} independent solves ·{" "}
          {result.requirements.successfulRevisionCount} successful reviews ·{" "}
          {result.requirements.longestSuccessfulIntervalDays}-day longest review interval
        </p>
        {result.blockers.length > 0 && (
          <div>
            <h4 className="mb-1.5 font-medium">Evidence still needed</h4>
            <ul className="grid gap-2 text-xs text-[var(--text-secondary)]">
              {result.blockers.map((blocker) => (
                <li key={blocker.code}>
                  <strong
                    className={
                      blocker.code === "RECENT_FORGOT" ? "text-red-400" : "text-white"
                    }
                  >
                    {blocker.label}
                  </strong>
                  <p>{blocker.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
        {result.strengths.length > 0 && (
          <div>
            <h4 className="mb-1.5 font-medium">Demonstrated strengths</h4>
            <ul className="list-disc space-y-1 pl-4 text-xs text-[var(--text-secondary)]">
              {result.strengths.map((strength) => (
                <li key={strength.code}>{strength.detail}</li>
              ))}
            </ul>
          </div>
        )}
        <details className="border-t border-white/10 pt-3">
          <summary className="cursor-pointer text-xs font-medium">
            Evidence breakdown
          </summary>
          <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
            {evidence.map(([key, label]) => (
              <div className="flex justify-between gap-3" key={key}>
                <dt className="text-[var(--text-secondary)]">{label}</dt>
                <dd className="tabular-nums">
                  {result.evidence[key] === null
                    ? "Unavailable"
                    : result.evidence[key] + " / 100"}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-[var(--text-secondary)]">
            Evidence score {result.score} / 100 · Policy v{result.policyVersion}
          </p>
        </details>
      </CardContent>
    </Card>
  );
}
