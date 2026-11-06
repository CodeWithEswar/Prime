"use client";

import { useState } from "react";
import { toast } from "sonner";
import { RepeatIcon, CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createLessonRevisionAction } from "../server/playlist-actions";
import type { DSALessonItem } from "../types";

export interface CreateRevisionDialogProps {
  lesson?: { videoDbId?: string; canonicalTopicSlug?: string; title: string } | null;
  videoId?: string;
  topicSlug?: string;
  title?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateRevisionDialog({
  lesson,
  videoId: propVideoId,
  topicSlug: propTopicSlug,
  title: propTitle,
  open,
  onOpenChange,
}: CreateRevisionDialogProps) {
  const [isPending, setIsPending] = useState(false);

  const targetVideoId = propVideoId || lesson?.videoDbId || "custom";
  const targetTopic = propTopicSlug || lesson?.canonicalTopicSlug || "dsa";
  const targetTitle = propTitle || lesson?.title || "DSA Revision Item";

  if (!open) return null;

  const handleCreate = async () => {
    setIsPending(true);
    try {
      const res = await createLessonRevisionAction(
        targetVideoId,
        targetTopic,
        targetTitle
      );
      if (res.success) {
        toast.success("Added to spaced repetition revision queue!");
        onOpenChange(false);
      } else {
        toast.error(res.error || "Failed to add to revision");
      }
    } catch {
      toast.error("Network error adding revision");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-[#0E0E0E] border-white/10 text-white font-mono">
        <DialogHeader className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Icon icon={RepeatIcon} size={16} className="text-[#FF4D4D]" />
            <DialogTitle className="text-sm font-bold uppercase tracking-wider text-white">
              Add to Revision Queue
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-neutral-400">
            PRIME's adaptive spaced repetition engine will schedule reviews (1d, 3d, 7d, 14d) to ensure long-term retention.
          </DialogDescription>
        </DialogHeader>

        <div className="py-3 px-3.5 my-2 rounded-lg bg-black/50 border border-white/[0.08] text-xs space-y-1">
          <p className="text-white font-medium line-clamp-2">{targetTitle}</p>
          <span className="text-[10px] text-neutral-500 uppercase">
            Topic: #{targetTopic}
          </span>
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
            type="button"
            disabled={isPending}
            onClick={handleCreate}
            size="sm"
            className="bg-[#FF0000] hover:bg-[#D90000] text-white text-xs font-semibold"
          >
            {isPending ? "Adding..." : "Add to Revision"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

