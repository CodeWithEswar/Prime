"use client";

import * as React from "react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export interface CarouselControlsProps {
  totalSlides: number;
  activeIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
  canPrev: boolean;
  canNext: boolean;
  className?: string;
  labels?: string[];
}

export function CarouselControls({
  totalSlides,
  activeIndex,
  onPrev,
  onNext,
  onSelect,
  canPrev,
  canNext,
  className,
  labels,
}: CarouselControlsProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4 pt-4 select-none", className)}>
      {/* Indicator Pills */}
      <div className="flex items-center gap-1.5" role="tablist" aria-label="Slides">
        {Array.from({ length: totalSlides }).map((_, i) => {
          const isActive = i === activeIndex;
          const label = labels?.[i] ?? `Slide ${i + 1}`;
          return (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={label}
              onClick={() => onSelect(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-[#FF0000]",
                isActive
                  ? "w-7 bg-[#FF0000]"
                  : "w-2 bg-[#222222] hover:bg-[#444444]"
              )}
            />
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onPrev}
          disabled={!canPrev}
          aria-label="Previous slide"
          className="h-8 w-8 p-0 rounded-full border-[#242424] bg-[#0E0E0E] text-[#AAAAAA] hover:text-white hover:border-[#3A3A3A] disabled:opacity-30 disabled:pointer-events-none"
        >
          <Icon icon={ArrowLeft01Icon} size={15} />
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={!canNext}
          aria-label="Next slide"
          className="h-8 w-8 p-0 rounded-full border-[#242424] bg-[#0E0E0E] text-[#AAAAAA] hover:text-white hover:border-[#3A3A3A] disabled:opacity-30 disabled:pointer-events-none"
        >
          <Icon icon={ArrowRight01Icon} size={15} />
        </Button>
      </div>
    </div>
  );
}

