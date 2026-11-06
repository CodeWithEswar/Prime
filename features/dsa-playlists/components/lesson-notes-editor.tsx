"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { NoteIcon, CheckmarkCircle01Icon, Time02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { saveLessonNoteAction } from "../server/playlist-actions";

interface LessonNotesEditorProps {
  videoId: string;
  initialNotes?: string;
}

export function LessonNotesEditor({ videoId, initialNotes = "" }: LessonNotesEditorProps) {
  const [content, setContent] = useState(initialNotes);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setContent(initialNotes);
    setSaveStatus("idle");
  }, [videoId, initialNotes]);

  const handleSave = async (textToSave: string) => {
    setSaveStatus("saving");
    try {
      const res = await saveLessonNoteAction(videoId, textToSave);
      if (res.success) {
        setSaveStatus("saved");
      } else {
        setSaveStatus("idle");
        toast.error("Failed to save note");
      }
    } catch {
      setSaveStatus("idle");
      toast.error("Network error saving note");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextText = e.target.value;
    setContent(nextText);
    setSaveStatus("idle");

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      void handleSave(nextText);
    }, 1200);
  };

  return (
    <div className="space-y-3 p-4 rounded-xl border border-white/[0.08] bg-[#0A0A0A]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon icon={NoteIcon} size={15} className="text-[#FF4D4D]" />
          <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
            Lesson Notes & Key Takeaways
          </h4>
        </div>

        {/* Save Status */}
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-neutral-400">
          {saveStatus === "saving" && (
            <span className="text-amber-400 animate-pulse">Saving...</span>
          )}
          {saveStatus === "saved" && (
            <span className="text-emerald-400 flex items-center gap-1">
              <Icon icon={CheckmarkCircle01Icon} size={12} />
              Saved
            </span>
          )}
        </div>
      </div>

      <Textarea
        value={content}
        onChange={handleChange}
        placeholder="Write important observations, time/space complexity notes, or edge cases for this lesson..."
        rows={4}
        className="text-xs font-mono bg-black/60 border-white/[0.08] text-white focus-visible:border-white/25 placeholder:text-neutral-600 resize-none"
      />

      <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pt-1">
        <span>Autosaves as you type</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void handleSave(content)}
          disabled={saveStatus === "saving"}
          className="h-7 px-2.5 text-xs font-mono text-neutral-300 hover:text-white"
        >
          Save Now
        </Button>
      </div>
    </div>
  );
}

