"use client";
import {
  PauseIcon,
  PlayIcon,
  PreviousIcon,
  NextIcon,
  RepeatIcon,
} from "@hugeicons/core-free-icons";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { LabControl } from "./lab-control";
import { SPEEDS, type Playback, type PlaybackAction } from "../engine/playback";
export function PlaybackControls({
  state,
  length,
  blocked,
  onAction,
}: {
  state: Playback;
  length: number;
  blocked: boolean;
  onAction: (action: PlaybackAction) => void;
}) {
  return (
    <section className="lab-playback" aria-label="Algorithm playback">
      <div className="lab-playback-buttons">
        <LabControl
          iconOnly
          icon={RepeatIcon}
          label="Restart trace"
          onClick={() => onAction({ type: "restart" })}
        />
        <LabControl
          iconOnly
          icon={PreviousIcon}
          label="Previous step"
          disabled={state.index === 0}
          onClick={() => onAction({ type: "previous" })}
        />
        {state.mode === "watch" && (
          <LabControl
            iconOnly
            icon={state.status === "playing" ? PauseIcon : PlayIcon}
            label={state.status === "playing" ? "Pause playback" : "Play trace"}
            variant={state.status === "playing" ? "secondary" : "primary"}
            onClick={() => onAction({ type: "toggle" })}
          />
        )}
        <LabControl
          iconOnly
          icon={NextIcon}
          label="Next step"
          disabled={state.index >= length - 1 || blocked}
          onClick={() => onAction({ type: "next" })}
        />
        <span
          className="lab-playback-position"
          aria-label={`Step ${state.index + 1} of ${length}`}
        >
          {String(state.index + 1).padStart(2, "0")} <span>/ {length}</span>
        </span>
      </div>
      <label className="lab-timeline">
        <span className="sr-only">Execution timeline</span>
        <input
          type="range"
          min="0"
          max={length - 1}
          step="1"
          value={state.index}
          disabled={state.mode === "practice"}
          onChange={(e) => onAction({ type: "seek", index: Number(e.target.value) })}
        />
      </label>
      <Select
        value={String(state.speed)}
        onValueChange={(value) => onAction({ type: "speed", speed: Number(value) })}
      >
        <SelectTrigger className="lab-speed" aria-label="Playback speed">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SPEEDS.map((speed) => (
            <SelectItem key={speed} value={String(speed)}>
              {speed}×
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="sr-only" role="status">
        {state.status === "completed"
          ? "Trace complete."
          : blocked
            ? "Answer the prediction before advancing."
            : ""}
      </span>
    </section>
  );
}
