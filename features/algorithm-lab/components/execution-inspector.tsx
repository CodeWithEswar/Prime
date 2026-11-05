import type { AlgorithmStep, TraceValue } from "../engine/types";
export function traceValue(value: TraceValue): string {
  if (value === null) return "null";
  if (Array.isArray(value))
    return value.length ? `[${value.map(traceValue).join(", ")}]` : "[]";
  if (typeof value === "object")
    return Object.entries(value)
      .map(([key, v]) => `${key}: ${traceValue(v)}`)
      .join(" · ");
  return String(value);
}
export function ExecutionInspector({ step }: { step: AlgorithmStep }) {
  return (
    <aside className="lab-inspector" aria-label="Execution inspector">
      <span className="lab-overline">EXECUTION / STATE</span>
      <dl className="lab-variables">
        {Object.entries(step.variables).map(([name, value]) => (
          <div key={name}>
            <dt>{name}</dt>
            <dd>{traceValue(value)}</dd>
          </div>
        ))}
      </dl>
      {Object.keys(step.metrics).length > 0 && (
        <div className="lab-operation-counts">
          <span className="lab-overline">OBSERVED OPERATIONS</span>
          <dl>
            {Object.entries(step.metrics).map(([name, value]) => (
              <div key={name}>
                <dt>{name.replace(/([A-Z])/g, " $1")}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <p>Counts describe this input, not asymptotic complexity.</p>
        </div>
      )}
    </aside>
  );
}
