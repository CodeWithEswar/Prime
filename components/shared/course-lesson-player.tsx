"use client";

import { useId, useRef, useState } from "react";
import { LinkSquare01Icon, PlayIcon, Tick02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { Textarea } from "@/components/ui/textarea";

export function CourseLessonPlayer({
  title,
  position,
  channel,
  videoId,
  fallbackUrl,
  watched,
  notes: savedNotes,
  revisionDue: savedRevision,
  showRevision = true,
  onClose,
  onToggleWatched,
  onSave,
}: {
  title: string;
  position?: number;
  channel: string;
  videoId: string | null;
  fallbackUrl?: string | null;
  watched: boolean;
  notes?: string | null;
  revisionDue?: boolean;
  showRevision?: boolean;
  onClose: () => void;
  onToggleWatched: () => void;
  onSave: (notes: string, revisionDue: boolean) => void;
}) {
  const [notes, setNotes] = useState(savedNotes ?? "");
  const [revisionDue, setRevisionDue] = useState(Boolean(savedRevision));
  const notesId = useId();
  const opener = useRef<HTMLElement | null>(null);
  const directId = videoId && /^[\w-]{11}$/.test(videoId) ? videoId : null;
  const watchUrl = directId ? `https://www.youtube.com/watch?v=${directId}` : fallbackUrl;

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className="flex max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-3xl flex-col gap-0 overflow-hidden p-0"
        onOpenAutoFocus={() => {
          opener.current =
            document.activeElement instanceof HTMLElement ? document.activeElement : null;
        }}
        onCloseAutoFocus={(event) => {
          if (opener.current?.isConnected) {
            event.preventDefault();
            opener.current.focus();
          }
        }}
      >
        <DialogHeader className="border-b border-[var(--border-subtle)] p-3 pr-12 sm:p-4 sm:pr-12">
          <DialogDescription>
            {position == null ? "Deep dive" : "Lesson " + position} · {channel}
          </DialogDescription>
          <DialogTitle className="leading-snug [overflow-wrap:anywhere]">
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="min-h-0 space-y-4 overflow-y-auto overscroll-contain p-3 sm:p-4">
          {directId ? (
            <div className="space-y-1.5">
              <iframe
                className="aspect-video w-full rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-black"
                title={title}
                src={`https://www.youtube-nocookie.com/embed/${directId}?rel=0&enablejsapi=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
              <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-[#222222] bg-[#111111] px-3 py-1.5 text-[11px] text-[#888888]">
                <span>Content blocked or video restricted by browser?</span>
                {watchUrl && (
                  <a
                    href={watchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-[#FF4D4D] hover:underline"
                  >
                    Watch directly on YouTube
                    <Icon icon={LinkSquare01Icon} size={11} />
                  </a>
                )}
              </div>
            </div>
          ) : (
            <p className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] p-4 text-sm text-[var(--text-secondary)]">
              {watchUrl ? "This lesson opens on YouTube." : "Video unavailable."}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant={watched ? "outline" : "primary"}
              aria-pressed={watched}
              onClick={onToggleWatched}
            >
              <Icon icon={Tick02Icon} size={14} />
              {watched ? "Watched" : "Mark as watched"}
            </Button>
            {watchUrl && (
              <Button asChild size="sm" variant="outline">
                <a href={watchUrl} target="_blank" rel="noreferrer">
                  <Icon icon={PlayIcon} size={14} />
                  Open on YouTube
                </a>
              </Button>
            )}
          </div>
          <div className="space-y-2 border-t border-[var(--border-subtle)] pt-3">
            <label htmlFor={notesId} className="text-sm font-medium">
              Lesson notes
            </label>
            <Textarea
              id={notesId}
              value={notes}
              rows={3}
              onChange={(event) => setNotes(event.target.value)}
            />
            <div className="flex flex-wrap items-center justify-end gap-2 has-[input]:justify-between">
              {showRevision && (
                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <Checkbox
                    id={notesId + "-revision"}
                    checked={revisionDue}
                    onCheckedChange={setRevisionDue}
                  />
                  <label htmlFor={notesId + "-revision"} className="cursor-pointer">
                    Review later
                  </label>
                </div>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => onSave(notes, revisionDue)}
              >
                Save notes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
