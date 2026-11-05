"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAI } from "@/features/ai/ai-provider";
import { cn } from "@/lib/utils";
import { addDays, parseDateParts } from "@/domain/planning/capacity";
import { CalendarHeader } from "./calendar-header";
import { PreparationMonth } from "./preparation-month";
import { PreparationWeek } from "./preparation-week";
import { PreparationAgenda } from "./preparation-agenda";
import { DayLens } from "./day-lens";
import { MobileCalendarView } from "./mobile-calendar-view";
import { CalendarEmpty } from "./calendar-empty";
import { RebalancePreviewStrip } from "./rebalance-preview-strip";
import type { CalendarRangeSnapshot, CalendarViewMode } from "../types";

export interface CalendarViewProps {
  initialSnapshot: CalendarRangeSnapshot;
}

export function CalendarView({ initialSnapshot }: CalendarViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ai = useAI();

  // URL-driven or local state
  const [view, setView] = React.useState<CalendarViewMode>(
    (searchParams.get("view") as CalendarViewMode) || initialSnapshot.view || "month"
  );
  const [selectedDate, setSelectedDate] = React.useState<string>(
    searchParams.get("date") || initialSnapshot.selectedDate
  );
  const [monthKey, setMonthKey] = React.useState<string>(
    searchParams.get("month") || initialSnapshot.currentMonthKey
  );
  const [isLensOpen, setIsLensOpen] = React.useState<boolean>(true);

  // Derive active day detail for selected date
  const selectedDay =
    initialSnapshot.days.find((d) => d.date === selectedDate) ? initialSnapshot.selectedDay : null;

  // Month navigation: previous
  const handlePrevMonth = () => {
    const { year, month } = parseDateParts(`${monthKey}-01`);
    const prevDate = new Date(Date.UTC(year, month - 1, 1, 12, 0, 0));
    const newMonthKey = prevDate.toISOString().slice(0, 7);
    setMonthKey(newMonthKey);
    router.push(`/calendar?month=${newMonthKey}&view=${view}`);
  };

  // Month navigation: next
  const handleNextMonth = () => {
    const { year, month } = parseDateParts(`${monthKey}-01`);
    const nextDate = new Date(Date.UTC(year, month + 1, 1, 12, 0, 0));
    const newMonthKey = nextDate.toISOString().slice(0, 7);
    setMonthKey(newMonthKey);
    router.push(`/calendar?month=${newMonthKey}&view=${view}`);
  };

  // Jump to Today
  const handleJumpToday = () => {
    const today = initialSnapshot.todayDate;
    const todayMonth = today.slice(0, 7);
    setSelectedDate(today);
    setMonthKey(todayMonth);
    setIsLensOpen(true);
    router.push(`/calendar?month=${todayMonth}&date=${today}&view=${view}`);
  };

  // Select Date
  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setIsLensOpen(true);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("date", date);
    router.replace(`/calendar?${newParams.toString()}`);
  };

  // View Mode Change
  const handleViewChange = (newView: CalendarViewMode) => {
    setView(newView);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("view", newView);
    router.replace(`/calendar?${newParams.toString()}`);
  };

  // Ask PRIME AI Integration
  const isAIOpen = Boolean(ai?.open);
  const handleAskPrime = () => {
    if (ai) {
      ai.setOpen(true);
      ai.send(
        `Explain my preparation workload for ${selectedDate}. Tell me if today's planned tasks fit my capacity and what revisions are scheduled.`
      );
    }
  };

  // If completely empty without a plan or dates
  if (!initialSnapshot.plan && initialSnapshot.days.length === 0) {
    return <CalendarEmpty />;
  }

  return (
    <div className="w-full space-y-6">
      {/* 1. Header */}
      <CalendarHeader
        monthLabel={initialSnapshot.monthLabel}
        plan={initialSnapshot.plan}
        view={view}
        onViewChange={handleViewChange}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onJumpToday={handleJumpToday}
        onAskPrime={handleAskPrime}
        isAIOpen={isAIOpen}
      />

      {/* 2. Rebalance Diff Preview Banner (if active) */}
      {initialSnapshot.rebalancePreview && (
        <RebalancePreviewStrip diffs={initialSnapshot.rebalancePreview} />
      )}

      {/* 3. Main Responsive Calendar Surface */}
      <div
        className={cn(
          "w-full flex flex-col gap-6 items-start transition-all duration-300",
          isAIOpen ? "2xl:flex-row" : "xl:flex-row"
        )}
      >
        {/* Main Canvas Area */}
        <div className="flex-1 w-full min-w-0">
          {/* Mobile View (< 768px) */}
          <div className="block md:hidden">
            {view === "month" && (
              <MobileCalendarView
                days={initialSnapshot.days}
                selectedDate={selectedDate}
                todayDate={initialSnapshot.todayDate}
                selectedDay={selectedDay}
                onSelectDate={handleSelectDate}
              />
            )}
            {view === "week" && (
              <PreparationWeek
                weeks={initialSnapshot.weeks}
                selectedDate={selectedDate}
                todayDate={initialSnapshot.todayDate}
                onSelectDate={handleSelectDate}
              />
            )}
            {view === "agenda" && (
              <PreparationAgenda
                days={initialSnapshot.days}
                todayDate={initialSnapshot.todayDate}
                selectedDay={selectedDay}
                onSelectDate={handleSelectDate}
              />
            )}
          </div>

          {/* Desktop & Tablet View (>= 768px) */}
          <div className="hidden md:block">
            {view === "month" && (
              <PreparationMonth
                days={initialSnapshot.days}
                selectedDate={selectedDate}
                todayDate={initialSnapshot.todayDate}
                onSelectDate={handleSelectDate}
              />
            )}
            {view === "week" && (
              <PreparationWeek
                weeks={initialSnapshot.weeks}
                selectedDate={selectedDate}
                todayDate={initialSnapshot.todayDate}
                onSelectDate={handleSelectDate}
              />
            )}
            {view === "agenda" && (
              <PreparationAgenda
                days={initialSnapshot.days}
                todayDate={initialSnapshot.todayDate}
                selectedDay={selectedDay}
                onSelectDate={handleSelectDate}
              />
            )}
          </div>
        </div>

        {/* 4. Desktop Contextual Day Lens */}
        {isLensOpen && selectedDay && (
          <div
            className={cn(
              "w-full flex-shrink-0 transition-all duration-300 hidden md:block",
              isAIOpen
                ? "2xl:w-[360px] 3xl:w-[400px] 2xl:sticky 2xl:top-20"
                : "xl:w-[380px] 2xl:w-[420px] xl:sticky xl:top-20"
            )}
          >
            <DayLens
              day={selectedDay}
              onClose={() => setIsLensOpen(false)}
              className="w-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}

