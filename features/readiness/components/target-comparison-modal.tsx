"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { TargetComparisonItem } from "@/domain/readiness";
import { ReadinessStatusBadge } from "./readiness-status";

interface TargetComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfileId: string;
  comparisons?: TargetComparisonItem[];
  onSelectProfile: (profileId: string) => void;
  onRestoreFocus?: () => void;
}

export function TargetComparisonModal({
  isOpen,
  onClose,
  currentProfileId,
  comparisons = [],
  onSelectProfile,
  onRestoreFocus,
}: TargetComparisonModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="flex max-h-[min(85dvh,44rem)] w-[calc(100%_-_1.5rem)] max-w-2xl flex-col gap-0 overflow-hidden bg-[var(--surface-raised)] p-0"
        onCloseAutoFocus={(event) => {
          if (onRestoreFocus) {
            event.preventDefault();
            onRestoreFocus();
          }
        }}
      >
        <DialogHeader className="shrink-0 border-b border-[var(--border-subtle)] p-4 pr-12 sm:pl-5">
          <DialogTitle>Compare targets</DialogTitle>
          <DialogDescription>
            See how your practice evidence applies across interview profiles.
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 space-y-2 overflow-y-auto overscroll-contain p-3 sm:p-5">
          {comparisons.length === 0 && (
            <p className="text-sm text-[var(--text-secondary)]">
              Comparison data is unavailable for this profile.
            </p>
          )}
          {comparisons.map((item) => {
            const isCurrent = item.profileId === currentProfileId;

            return (
              <Card
                key={item.profileId}
                elevation="base"
                className={`grid gap-3 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center ${isCurrent ? "border-[var(--accent-border)]" : ""}`}
              >
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold">{item.profileName}</h3>
                    {isCurrent && (
                      <Badge
                        variant="outline"
                        className="border-[var(--accent-border)] bg-[var(--accent-muted)] text-white"
                      >
                        Current target
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--text-secondary)]">
                    <span>
                      Core:{" "}
                      <strong className="font-mono text-white">{item.alignedCore}</strong>{" "}
                      / {item.totalCore}
                    </span>
                    <span>
                      Coverage:{" "}
                      <strong className="font-mono text-white">
                        {item.coveragePercent}%
                      </strong>
                    </span>
                  </div>

                  <Progress value={item.coveragePercent} size="sm" aria-hidden="true" />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 sm:flex-col sm:items-end">
                  <ReadinessStatusBadge status={item.overallAlignment} />

                  {!isCurrent && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        onSelectProfile(item.profileId);
                        onClose();
                      }}
                    >
                      Switch Target
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
