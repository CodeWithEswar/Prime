"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft01Icon,
  PlayIcon,
  PauseIcon,
  CheckmarkCircle02Icon,
  ArrowExpand02Icon,
  ArrowShrink02Icon,
} from "@hugeicons/core-free-icons";
import type { FocusState } from "../types";

interface FocusHeaderProps {
  state: FocusState;
  onBack: () => void;
  onPause: () => void;
  onResume: () => void;
  onFinishRequest: () => void;
  isPending?: boolean;
}

export function FocusHeader({
  state,
  onBack,
  onPause,
  onResume,
  onFinishRequest,
  isPending = false,
}: FocusHeaderProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isRunning = state === "running";

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }

  return (
    <header className="relative z-40 w-full flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 select-none">
      {/* Top Left: Back Navigation */}
      <div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-2 text-xs font-mono font-medium text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors"
        >
          <Icon icon={ArrowLeft01Icon} size={15} />
          <span>Back</span>
        </Button>
      </div>

      {/* Top Right: Controls (Pause/Resume, Finish, Fullscreen) */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Fullscreen toggle button */}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={toggleFullscreen}
          className="text-neutral-400 hover:text-white hover:bg-white/[0.06] hidden sm:inline-flex"
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          <Icon icon={isFullscreen ? ArrowShrink02Icon : ArrowExpand02Icon} size={15} />
        </Button>

        {/* Pause / Resume Control */}
        {isRunning ? (
          <Button
            type="button"
            variant="secondary"
            size="default"
            disabled={isPending}
            onClick={onPause}
            className="gap-2 text-xs font-mono"
          >
            <Icon icon={PauseIcon} size={13} />
            <span>Pause</span>
            <kbd className="hidden sm:inline-block font-mono text-[10px] text-neutral-500 bg-neutral-900 px-1 rounded border border-neutral-800">
              Space
            </kbd>
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            size="default"
            disabled={isPending}
            onClick={onResume}
            className="gap-2 text-xs font-mono"
          >
            <Icon icon={PlayIcon} size={13} />
            <span>Resume</span>
            <kbd className="hidden sm:inline-block font-mono text-[10px] text-white/70 bg-black/30 px-1 rounded border border-white/20">
              Space
            </kbd>
          </Button>
        )}

        {/* Finish Control */}
        <Button
          type="button"
          variant="outline"
          size="default"
          disabled={isPending}
          onClick={onFinishRequest}
          className="gap-2 text-xs font-mono border-white/[0.12] hover:border-emerald-500/50 hover:text-emerald-400"
        >
          <Icon icon={CheckmarkCircle02Icon} size={14} />
          <span>Finish</span>
        </Button>
      </div>
    </header>
  );
}

