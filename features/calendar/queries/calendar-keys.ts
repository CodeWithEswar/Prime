/**
 * PRIME Preparation Calendar — Query Keys Factory
 */

export const calendarKeys = {
  all: ["calendar"] as const,
  range: (userId: string, start: string, end: string) =>
    [...calendarKeys.all, "range", userId, start, end] as const,
  month: (userId: string, monthKey: string) =>
    [...calendarKeys.all, "month", userId, monthKey] as const,
  week: (userId: string, weekStart: string) =>
    [...calendarKeys.all, "week", userId, weekStart] as const,
  day: (userId: string, date: string) =>
    [...calendarKeys.all, "day", userId, date] as const,
};

