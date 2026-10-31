"use client";

import * as React from "react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export interface CalendarProps {
  className?: string;
  selected?: Date;
  onSelect?: (date: Date) => void;
  completedDates?: Date[];
  streakDates?: Date[];
  disabledDates?: Date[];
}

export function Calendar({
  className,
  selected,
  onSelect,
  completedDates = [],
  streakDates = [],
  disabledDates = [],
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(
    () => selected || new Date()
  );

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const today = new Date();

  return (
    <div
      className={cn(
        "p-4 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-base)] select-none w-full max-w-sm",
        className
      )}
    >
      {/* Month Navigation */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-[var(--border-subtle)]">
        <h4 className="text-sm font-semibold text-white tracking-wide">
          {monthNames[month]}{" "}
          <span className="text-[var(--text-tertiary)] font-mono">{year}</span>
        </h4>
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1 rounded-[var(--radius-xs)] text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-hover)] transition-colors"
            aria-label="Previous month"
          >
            <Icon icon={ArrowLeft01Icon} size={16} />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1 rounded-[var(--radius-xs)] text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-hover)] transition-colors"
            aria-label="Next month"
          >
            <Icon icon={ArrowRight01Icon} size={16} />
          </button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div
            key={day}
            className="text-[11px] font-mono text-[var(--text-tertiary)] uppercase py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day Cells */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {/* Leading empty spaces */}
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} className="h-8" />
        ))}

        {/* Month days */}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const dayNumber = index + 1;
          const date = new Date(year, month, dayNumber);

          const isSelected = selected && isSameDay(date, selected);
          const isToday = isSameDay(date, today);
          const isCompleted = completedDates.some((d) => isSameDay(d, date));
          const isStreak = streakDates.some((d) => isSameDay(d, date));
          const isDisabled = disabledDates.some((d) => isSameDay(d, date));

          return (
            <button
              key={dayNumber}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelect?.(date)}
              className={cn(
                "relative h-8 w-8 mx-auto flex items-center justify-center rounded-[var(--radius-xs)] text-xs font-mono transition-all duration-100 cursor-pointer disabled:pointer-events-none disabled:opacity-20",
                isSelected
                  ? "bg-[var(--accent)] text-white font-semibold shadow-[0_0_8px_rgba(255,0,0,0.5)]"
                  : isToday
                    ? "border border-[var(--accent)] text-white font-medium bg-[var(--accent-subtle)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-white",
                isDisabled && "cursor-not-allowed"
              )}
            >
              {dayNumber}

              {/* Status Indicator Dots */}
              {!isSelected && (
                <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-0.5">
                  {isCompleted && (
                    <span className="h-1 w-1 rounded-full bg-[var(--success)] shadow-[0_0_3px_rgba(48,164,108,0.8)]" />
                  )}
                  {isStreak && (
                    <span className="h-1 w-1 rounded-full bg-[var(--accent)] shadow-[0_0_3px_rgba(255,0,0,0.8)]" />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
