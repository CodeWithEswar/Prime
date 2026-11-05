"use client";

import { useState } from "react";
import { Calendar03Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Icon } from "@/components/ui/icon";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { parseDateParts } from "@/domain/planning/capacity";

function calendarDate(value: string) {
  const { year, month, day } = parseDateParts(value);
  return new Date(year, month, day);
}

export function PlannerDateField({
  id,
  label,
  value,
  min,
  max,
  disabled,
  onChange,
}: {
  id?: string;
  label: string;
  value?: string;
  min: string;
  max: string;
  disabled?: boolean;
  onChange: (date: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = value ? calendarDate(value) : undefined;
  const display = selected?.toLocaleDateString("en", { dateStyle: "medium" });
  const minDate = calendarDate(min);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled || min > max}
          aria-label={display ? label + ", " + display : label}
          className="w-full min-w-0 justify-start gap-2.5 bg-[var(--prime-canvas)] px-2.5 text-left font-normal"
        >
          <Icon
            icon={Calendar03Icon}
            size={15}
            className="shrink-0 text-[var(--text-secondary)]"
          />
          <span className="truncate">{display ?? "Choose a date"}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        aria-label={label + " calendar"}
        align="start"
        sideOffset={6}
        collisionPadding={8}
        className="z-[60] w-72 max-w-[var(--radix-popover-content-available-width)] max-h-[var(--radix-popover-content-available-height)] overflow-y-auto overscroll-contain p-0"
      >
        <Calendar
          className="max-w-none rounded-none border-0 bg-transparent p-3 shadow-none"
          selected={value && value >= min && value <= max ? selected : undefined}
          minDate={minDate}
          maxDate={calendarDate(max)}
          today={minDate}
          onSelect={(date) => {
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            onChange(date.getFullYear() + "-" + month + "-" + day);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
