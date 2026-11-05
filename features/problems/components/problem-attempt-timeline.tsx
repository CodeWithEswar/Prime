"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getOlderProblemAttemptsAction } from "../mutations/get-problem-detail-action";
import {
  outcomeNames,
  formatMinutes,
  formatPracticeDate,
} from "../selectors/intelligence";
import type { ProblemDetail, ProblemAttemptRecord } from "../types";
export function ProblemAttemptTimeline({ problem }: { problem: ProblemDetail }) {
  const [older, setOlder] = useState<ProblemAttemptRecord[]>([]),
    [loading, setLoading] = useState(false),
    [error, setError] = useState("");
  const all = [
    ...new Map([...problem.attemptHistory, ...older].map((a) => [a.id, a])).values(),
  ].sort(
    (a, b) =>
      Date.parse(b.attemptedAt) - Date.parse(a.attemptedAt) || b.id.localeCompare(a.id)
  );
  async function loadOlder() {
    setLoading(true);
    setError("");
    try {
      const result = await getOlderProblemAttemptsAction({
        problemId: problem.id,
        offset: problem.attemptHistory.length + older.length,
      });
      setOlder([...older, ...result.attempts]);
    } catch {
      setError("Older attempts could not be loaded. Try again.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <>
      {problem.unavailable.includes("attempts") ? (
        <p role="status" className="problem-empty">
          Your attempt history is temporarily unavailable. Your saved history has not been
          changed.
        </p>
      ) : !all.length ? (
        <div className="problem-empty">
          <h3>No attempts yet.</h3>
          <p>
            Solve the problem on its practice platform, then record how it went. Your
            history and revision schedule will build here.
          </p>
        </div>
      ) : (
        <ol className="problem-attempt-timeline">
          {all.map((attempt, index) => (
            <li key={attempt.id} data-latest={index === 0}>
              <span className="problem-history-terminal" aria-hidden="true" />
              <div className="problem-history-heading">
                <strong>{outcomeNames[attempt.outcome]}</strong>
                <time dateTime={attempt.attemptedAt}>
                  {formatPracticeDate(attempt.attemptedAt, true)}
                </time>
              </div>
              <p className="problem-history-facts">
                {attempt.timeTakenSeconds > 0 && (
                  <span>{formatMinutes(attempt.timeTakenSeconds)} min</span>
                )}
                <span>Confidence {attempt.confidence}/5</span>
              </p>
              {attempt.notes && <p className="problem-history-note">{attempt.notes}</p>}
            </li>
          ))}
        </ol>
      )}
      {all.length > 0 && all.length < problem.attemptCount && (
        <Button variant="outline" size="sm" disabled={loading} onClick={loadOlder}>
          {loading ? "Loading attempts…" : "Load older attempts"}
        </Button>
      )}
      {error && (
        <p role="alert" className="problem-footnote">
          {error}
        </p>
      )}
    </>
  );
}
