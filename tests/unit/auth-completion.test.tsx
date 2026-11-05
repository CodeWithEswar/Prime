import { render, screen, act } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({ replace: vi.fn(), phase: vi.fn(), reduced: false }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: state.replace }) }));
vi.mock("@/lib/motion", () => ({ usePrimeReducedMotion: () => state.reduced }));
vi.mock("@/components/auth/auth-environment", () => ({
  useAuthEnvironment: () => ({ setPhase: state.phase }),
  useAuthQuery: () => new URLSearchParams("next=%2Fdesign-system"),
}));
import { AuthCompletion } from "@/components/auth/auth-form";
afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
  state.reduced = false;
});
describe("verified auth completion presentation", () => {
  it("settles the path before continuing to the safe return destination", () => {
    vi.useFakeTimers();
    render(<AuthCompletion />);
    expect(screen.getByRole("heading", { name: "You’re signed in." })).toBeVisible();
    expect(state.phase).toHaveBeenCalledWith("success");
    expect(state.replace).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(500));
    expect(state.replace).toHaveBeenCalledWith("/design-system");
  });
  it("does not delay navigation for reduced-motion visitors", () => {
    vi.useFakeTimers();
    state.reduced = true;
    render(<AuthCompletion />);
    act(() => vi.advanceTimersByTime(0));
    expect(state.replace).toHaveBeenCalledWith("/design-system");
  });
});
