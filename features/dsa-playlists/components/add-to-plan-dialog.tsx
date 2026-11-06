"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CalendarAdd01Icon, Time02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { scheduleLessonPlanAction } from "../server/playlist-actions";
import type { DSALessonItem } from "../types";

export interface AddToPlanDialogProps {
  lesson?: { title: string; durationSeconds?: number } | null;
  videoId?: string;
  title?: string;
  durationSeconds?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddToPlanDialog({
  lesson,
  videoId: propVideoId,
  title: propTitle,
  durationSeconds: propDuration,
  open,
  onOpenChange,
}: AddToPlanDialogProps) {
  const itemTitle = propTitle || lesson?.title || "DSA Study Item";
  const itemDuration = propDuration || lesson?.durationSeconds || 1800;

  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = tomorrowDate.toISOString().split("T")[0];

  const [date, setDate] = useState(todayStr);
  const [minutes, setMinutes] = useState(
    Math.max(15, Math.round(itemDuration / 60))
  );
  const [isPending, setIsPending] = useState(false);

  if (!open) return null;

  const targetVideoId = propVideoId || (lesson as { videoDbId?: string })?.videoDbId || "custom";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      const res = await scheduleLessonPlanAction(
        targetVideoId,
        date,
        itemTitle,
        minutes
      );
      if (res.success) {
        toast.success(`Scheduled lesson for ${date}!`);
        onOpenChange(false);
      } else {
        toast.error(res.error || "Failed to schedule lesson");
      }
    } catch {
      toast.error("Network error scheduling lesson");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] bg-[#0E0E0E] border-white/10 text-white font-mono">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Icon icon={CalendarAdd01Icon} size={16} className="text-[#FF4D4D]" />
              <DialogTitle className="text-sm font-bold uppercase tracking-wider text-white">
                Add Lesson to Study Plan
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-neutral-400 line-clamp-1">
              {itemTitle}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {/* Quick date pills */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-neutral-400 uppercase font-semibold">
                Scheduled Date
              </label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={date === todayStr ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setDate(todayStr)}
                  className={`text-xs h-8 flex-1 font-mono ${
                    date === todayStr
                      ? "bg-[#FF0000] text-white"
                      : "bg-[#141414] border-white/10 text-neutral-300"
                  }`}
                >
                  Today
                </Button>
                <Button
                  type="button"
                  variant={date === tomorrowStr ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setDate(tomorrowStr)}
                  className={`text-xs h-8 flex-1 font-mono ${
                    date === tomorrowStr
                      ? "bg-[#FF0000] text-white"
                      : "bg-[#141414] border-white/10 text-neutral-300"
                  }`}
                >
                  Tomorrow
                </Button>
              </div>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-2 h-8 text-xs bg-black/60 border-white/10 text-white"
              />
            </div>

            {/* Target Duration */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-neutral-400 uppercase font-semibold">
                Study Budget (Minutes)
              </label>
              <Input
                type="number"
                min={5}
                max={240}
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                className="h-8 text-xs bg-black/60 border-white/10 text-white"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs text-neutral-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              size="sm"
              className="bg-[#FF0000] hover:bg-[#D90000] text-white text-xs font-semibold"
            >
              {isPending ? "Scheduling..." : "Add to Daily Plan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

