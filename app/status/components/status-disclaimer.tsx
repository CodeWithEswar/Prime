export function StatusDisclaimer() {
  return (
    <div className="rounded-xl border border-neutral-800/60 bg-neutral-950/40 p-4 sm:p-5 text-xs text-neutral-400">
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-baseline sm:justify-between">
        <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-400">
          Telemetry &amp; Infrastructure Diagnostics
        </span>
        <span className="font-mono text-[10px] sm:text-[11px] text-neutral-500">
          5-minute probe cadence · 5000ms SLA timeout · 3-check failure gate
        </span>
      </div>
      <p className="mt-2 text-neutral-400 leading-relaxed text-[11px] sm:text-xs">
        PRIME executes continuous health observations from Cloudflare Workers edge nodes globally.
        These automated probes evaluate backend database and API availability, track response latency,
        and sustain database responsiveness. Status telemetry is published independently of the primary
        application backend to ensure real-time incident transparency at all times.
      </p>
    </div>
  );
}
