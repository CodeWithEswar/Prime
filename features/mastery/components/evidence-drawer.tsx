"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { TopicMasteryResult } from "@/domain/mastery";
import type { CoreProblemMetadata } from "../types";
import { EvidenceLens } from "./evidence-lens";

export interface EvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  topic: TopicMasteryResult | null;
  coreMetadata: Record<string, CoreProblemMetadata>;
  onRestoreFocus?: () => void;
  onAsk?: (trigger: HTMLElement) => void;
}

export function EvidenceDrawer({
  isOpen,
  onClose,
  topic,
  coreMetadata,
  onRestoreFocus,
  onAsk,
}: EvidenceDrawerProps) {
  if (!topic) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="bottom"
        className="flex h-[88dvh] flex-col gap-0 overflow-hidden rounded-t-xl p-0 sm:mx-auto sm:h-[80dvh] sm:max-w-2xl"
        onCloseAutoFocus={(event) => {
          if (onRestoreFocus) {
            event.preventDefault();
            onRestoreFocus();
          }
        }}
      >
        <SheetHeader className="shrink-0 border-b border-[var(--border-subtle)] px-4 py-3.5 pr-12">
          <SheetTitle>
            Skill details<span className="sr-only"> for {topic.topicName}</span>
          </SheetTitle>
          <SheetDescription className="sr-only">
            Practice and recall evidence for the selected skill.
          </SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]">
          <EvidenceLens
            topic={topic}
            coreMetadata={coreMetadata}
            onAsk={onAsk}
            className="rounded-none border-0 bg-transparent shadow-none"
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
