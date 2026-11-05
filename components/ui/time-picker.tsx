"use client";

import * as React from "react";
import { Clock01Icon, Cancel01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface TimePickerProps {
  id?: string;
  name?: string;
  value?: string | null; // "HH:mm" (24-hour) e.g. "09:30", "18:00", or null
  onChange?: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
  required?: boolean;
}

export function parseTimeString(
  time?: string | null
): { hour: number; minute: number; period: "AM" | "PM" } | null {
  if (!time) return null;
  const match = time.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const h24 = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  if (
    Number.isNaN(h24) ||
    Number.isNaN(m) ||
    h24 < 0 ||
    h24 > 23 ||
    m < 0 ||
    m > 59
  ) {
    return null;
  }
  const period: "AM" | "PM" = h24 >= 12 ? "PM" : "AM";
  const hour = h24 % 12 === 0 ? 12 : h24 % 12;
  return { hour, minute: m, period };
}

export function formatTimeString(
  hour: number,
  minute: number,
  period: "AM" | "PM"
): string {
  let h24 = hour % 12;
  if (period === "PM") h24 += 12;
  return `${String(h24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function formatDisplayTime(
  hour: number,
  minute: number,
  period: "AM" | "PM"
): string {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`;
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
const PRESETS = [
  { label: "Morning", time: "09:00", display: "09:00 AM" },
  { label: "Afternoon", time: "14:00", display: "02:00 PM" },
  { label: "Evening", time: "18:00", display: "06:00 PM" },
  { label: "Night", time: "21:00", display: "09:00 PM" },
];

export const TimePicker = React.forwardRef<HTMLButtonElement, TimePickerProps>(
  (
    {
      id,
      name,
      value,
      onChange,
      placeholder = "--:-- --",
      disabled = false,
      className,
      "aria-label": ariaLabel,
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);
    const parsed = React.useMemo(() => parseTimeString(value), [value]);

    const [selectedHour, setSelectedHour] = React.useState<number>(
      parsed?.hour ?? 9
    );
    const [selectedMinute, setSelectedMinute] = React.useState<number>(
      parsed?.minute ?? 0
    );
    const [selectedPeriod, setSelectedPeriod] = React.useState<"AM" | "PM">(
      parsed?.period ?? "AM"
    );

    // Keep internal state in sync with controlled value
    React.useEffect(() => {
      if (parsed) {
        setSelectedHour(parsed.hour);
        setSelectedMinute(parsed.minute);
        setSelectedPeriod(parsed.period);
      }
    }, [parsed]);

    const handleSelectHour = (h: number) => {
      setSelectedHour(h);
      const newTime = formatTimeString(h, selectedMinute, selectedPeriod);
      onChange?.(newTime);
    };

    const handleSelectMinute = (m: number) => {
      setSelectedMinute(m);
      const newTime = formatTimeString(selectedHour, m, selectedPeriod);
      onChange?.(newTime);
    };

    const handleSelectPeriod = (p: "AM" | "PM") => {
      setSelectedPeriod(p);
      const newTime = formatTimeString(selectedHour, selectedMinute, p);
      onChange?.(newTime);
    };

    const handleClear = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      onChange?.(null);
    };

    const handlePreset = (timeStr: string) => {
      const p = parseTimeString(timeStr);
      if (p) {
        setSelectedHour(p.hour);
        setSelectedMinute(p.minute);
        setSelectedPeriod(p.period);
      }
      onChange?.(timeStr);
      setOpen(false);
    };

    const displayValue = parsed
      ? formatDisplayTime(parsed.hour, parsed.minute, parsed.period)
      : null;

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            ref={ref}
            id={id}
            name={name}
            type="button"
            disabled={disabled}
            aria-label={ariaLabel || (displayValue ? `Selected time: ${displayValue}` : "Choose time")}
            className={cn(
              "group relative flex h-9 w-full min-w-[130px] items-center justify-between rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.12)] bg-[#030303] px-3 text-left font-mono font-mono-numbers text-xs text-white transition-all hover:border-[rgba(255,255,255,0.24)] hover:bg-[#070707] focus:outline-none focus:ring-1 focus:ring-[#ff0000] focus:border-[#ff0000] disabled:cursor-not-allowed disabled:opacity-40",
              open && "border-[#ff0000] ring-1 ring-[#ff0000]",
              className
            )}
          >
            <span
              className={cn(
                "truncate tracking-wider",
                !displayValue && "text-[var(--text-tertiary)]"
              )}
            >
              {displayValue || placeholder}
            </span>

            <div className="flex items-center gap-1.5 pl-2 text-[var(--text-tertiary)] group-hover:text-white transition-colors">
              {displayValue && !disabled ? (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={handleClear}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleClear();
                    }
                  }}
                  title="Clear time"
                  aria-label="Clear time"
                  className="rounded p-0.5 hover:bg-[rgba(255,255,255,0.1)] hover:text-white transition-colors"
                >
                  <Icon icon={Cancel01Icon} size={12} />
                </span>
              ) : null}
              <Icon icon={Clock01Icon} size={14} className="shrink-0" />
            </div>
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={6}
          className="w-[280px] p-3 border border-[rgba(255,255,255,0.14)] bg-[#050505] shadow-[0_12px_40px_rgba(0,0,0,0.85)] rounded-[var(--radius-md)] text-white"
        >
          {/* Header & Presets */}
          <div className="border-b border-[rgba(255,255,255,0.08)] pb-2.5 mb-2.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
                Select Time
              </span>
              {displayValue && (
                <button
                  type="button"
                  onClick={() => handleClear()}
                  className="text-[10px] font-mono text-[var(--text-tertiary)] hover:text-[#ff0000] transition-colors"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Quick Presets */}
            <div className="grid grid-cols-2 gap-1.5">
              {PRESETS.map((preset) => {
                const isActive = value === preset.time;
                return (
                  <button
                    key={preset.time}
                    type="button"
                    onClick={() => handlePreset(preset.time)}
                    className={cn(
                      "flex items-center justify-between px-2 py-1 rounded-[var(--radius-xs)] text-[10px] font-mono border transition-all text-left",
                      isActive
                        ? "border-[#ff0000] bg-[#ff0000]/15 text-white"
                        : "border-[rgba(255,255,255,0.08)] bg-[#080808] text-[var(--text-secondary)] hover:border-[rgba(255,255,255,0.18)] hover:text-white hover:bg-[#0e0e0e]"
                    )}
                  >
                    <span>{preset.label}</span>
                    <span className="font-mono-numbers text-[9px] text-[var(--text-tertiary)]">
                      {preset.display.slice(0, 5)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Wheel / Columns */}
          <div className="grid grid-cols-3 gap-2 py-1">
            {/* Hours Column */}
            <div className="flex flex-col">
              <span className="text-[9px] font-mono uppercase text-center text-[var(--text-tertiary)] mb-1.5 tracking-wider">
                Hour
              </span>
              <div className="flex flex-col gap-0.5 max-h-40 overflow-y-auto pr-1 prime-scrollbar-thin">
                {HOURS.map((h) => {
                  const isSelected = selectedHour === h && parsed !== null;
                  return (
                    <button
                      key={h}
                      type="button"
                      onClick={() => handleSelectHour(h)}
                      className={cn(
                        "h-7 w-full rounded-[var(--radius-xs)] font-mono font-mono-numbers text-xs transition-all",
                        isSelected
                          ? "bg-[#ff0000] text-white font-bold shadow-[0_0_12px_rgba(255,0,0,0.35)]"
                          : "text-[rgba(255,255,255,0.7)] hover:bg-[#121212] hover:text-white"
                      )}
                    >
                      {String(h).padStart(2, "0")}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Minutes Column */}
            <div className="flex flex-col border-x border-[rgba(255,255,255,0.08)] px-2">
              <span className="text-[9px] font-mono uppercase text-center text-[var(--text-tertiary)] mb-1.5 tracking-wider">
                Minute
              </span>
              <div className="flex flex-col gap-0.5 max-h-40 overflow-y-auto pr-1 prime-scrollbar-thin">
                {MINUTES.map((m) => {
                  const isSelected = selectedMinute === m && parsed !== null;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleSelectMinute(m)}
                      className={cn(
                        "h-7 w-full rounded-[var(--radius-xs)] font-mono font-mono-numbers text-xs transition-all",
                        isSelected
                          ? "bg-[#ff0000] text-white font-bold shadow-[0_0_12px_rgba(255,0,0,0.35)]"
                          : "text-[rgba(255,255,255,0.7)] hover:bg-[#121212] hover:text-white"
                      )}
                    >
                      {String(m).padStart(2, "0")}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Period Column */}
            <div className="flex flex-col">
              <span className="text-[9px] font-mono uppercase text-center text-[var(--text-tertiary)] mb-1.5 tracking-wider">
                Period
              </span>
              <div className="flex flex-col gap-1.5 pt-1">
                {(["AM", "PM"] as const).map((p) => {
                  const isSelected = selectedPeriod === p && parsed !== null;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleSelectPeriod(p)}
                      className={cn(
                        "h-9 w-full rounded-[var(--radius-xs)] font-mono text-xs font-semibold uppercase tracking-wider transition-all",
                        isSelected
                          ? "bg-[#ff0000] text-white shadow-[0_0_12px_rgba(255,0,0,0.35)]"
                          : "border border-[rgba(255,255,255,0.08)] bg-[#090909] text-[rgba(255,255,255,0.6)] hover:border-[rgba(255,255,255,0.18)] hover:text-white"
                      )}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.08)] pt-2.5 mt-2.5">
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <span className="text-[var(--text-tertiary)]">Set:</span>
              <span className="font-mono-numbers font-medium text-white">
                {displayValue || "--:--"}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-xs)] bg-[#ff0000] px-3 py-1 text-xs font-medium text-white shadow-sm transition-all hover:bg-[#dd0000] active:scale-[0.98]"
            >
              <Icon icon={Tick02Icon} size={13} />
              <span>Done</span>
            </button>
          </div>
        </PopoverContent>
      </Popover>
    );
  }
);

TimePicker.displayName = "TimePicker";

