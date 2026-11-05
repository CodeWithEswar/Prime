import type { LabMode } from "./types";
export const STEP_DURATION_MS = 1100;
export const SPEEDS = [0.5, 1, 1.5, 2] as const;
export type Playback = {
  index: number;
  status: "idle" | "playing" | "paused" | "completed";
  speed: number;
  mode: LabMode;
};
export const initialPlayback: Playback = {
  index: 0,
  status: "idle",
  speed: 1,
  mode: "watch",
};
export type PlaybackAction =
  | { type: "next" | "previous" | "restart" | "toggle" | "tick" }
  | { type: "seek"; index: number }
  | { type: "speed"; speed: number }
  | { type: "mode"; mode: LabMode };
export function playback(
  state: Playback,
  action: PlaybackAction,
  length: number
): Playback {
  const last = Math.max(0, length - 1);
  const move = (index: number, auto = false): Playback => ({
    ...state,
    index: Math.max(0, Math.min(last, index)),
    status: index >= last ? "completed" : auto ? "playing" : "paused",
  });
  switch (action.type) {
    case "mode":
      return {
        ...state,
        mode: action.mode,
        status: "paused",
        index: action.mode === "practice" ? 0 : state.index,
      };
    case "speed":
      return SPEEDS.includes(action.speed as (typeof SPEEDS)[number])
        ? { ...state, speed: action.speed }
        : state;
    case "restart":
      return { ...state, index: 0, status: "idle" };
    case "previous":
      return move(state.index - 1);
    case "next":
      return move(state.index + 1);
    case "seek":
      return move(Number.isFinite(action.index) ? Math.floor(action.index) : state.index);
    case "toggle":
      return state.mode !== "watch"
        ? state
        : state.status === "playing"
          ? { ...state, status: "paused" }
          : {
              ...state,
              index: state.index === last ? 0 : state.index,
              status: "playing",
            };
    case "tick":
      return state.status === "playing" && state.mode === "watch"
        ? move(state.index + 1, true)
        : state;
  }
}
