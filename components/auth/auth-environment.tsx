"use client";

import {
  createContext,
  useEffect,
  useContext,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type PointerEvent,
} from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { AuthBackControl } from "./auth-back-control";
import { PrimeLogo } from "@/components/branding";
import {
  PRIME_MARK_PATH_LOWER,
  PRIME_MARK_PATH_UPPER,
} from "@/components/branding/prime-mark";
import { motionEase, motionSpring, usePrimeReducedMotion } from "@/lib/motion";
import "./auth.css";

export type AuthPhase =
  "idle" | "email-focus" | "submitting" | "sent" | "success" | "error";
const AuthEnvironment = createContext<{
  phase: AuthPhase;
  setPhase: (phase: AuthPhase) => void;
}>({ phase: "idle", setPhase: () => {} });
export function useAuthEnvironment() {
  return useContext(AuthEnvironment);
}
function subscribeQuery(callback: () => void) {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
}
export function useAuthQuery() {
  const query = useSyncExternalStore(
    subscribeQuery,
    () => window.location.search,
    () => ""
  );
  return new URLSearchParams(query);
}

export function AuthEnvironmentShell({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<AuthPhase>("idle");
  const reduced = usePrimeReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const smoothX = useSpring(x, motionSpring.gentle);
  const smoothY = useSpring(y, motionSpring.gentle);
  const farX = useTransform(smoothX, [-1, 1], [-12, 12]);
  const farY = useTransform(smoothY, [-1, 1], [-10, 10]);
  const nearX = useTransform(smoothX, [-1, 1], [-5, 5]);
  const nearY = useTransform(smoothY, [-1, 1], [-4, 4]);
  const pointerX = useMotionValue(-1000);
  const pointerY = useMotionValue(-1000);
  const dotX = useSpring(pointerX, motionSpring.control);
  const dotY = useSpring(pointerY, motionSpring.control);
  const dotStrength = useMotionValue(0);
  const dotOpacity = useSpring(dotStrength, motionSpring.gentle);
  const dotMask = useMotionTemplate`radial-gradient(180px circle at ${dotX}px ${dotY}px, #000 0%, rgba(0,0,0,.7) 35%, transparent 100%)`;
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frozen = reduced || phase === "submitting" || phase === "success";
  const ref = useRef<HTMLDivElement>(null);
  function move(event: PointerEvent<HTMLDivElement>) {
    if (
      frozen ||
      event.pointerType !== "mouse" ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    )
      return;
    x.set((event.clientX / window.innerWidth) * 2 - 1);
    y.set((event.clientY / window.innerHeight) * 2 - 1);
    pointerX.set(event.clientX);
    pointerY.set(event.clientY);
    dotStrength.set(
      (event.target as Element).closest(".auth-surface,a,button,input") ? 0.35 : 1
    );
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => dotStrength.set(0), 2200);
  }
  function settle() {
    x.set(0);
    y.set(0);
    dotStrength.set(0);
    if (idleTimer.current) clearTimeout(idleTimer.current);
  }
  useEffect(() => {
    function hide() {
      x.set(0);
      y.set(0);
      dotStrength.set(0);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    }
    window.addEventListener("blur", hide);
    document.addEventListener("visibilitychange", hide);
    return () => {
      hide();
      window.removeEventListener("blur", hide);
      document.removeEventListener("visibilitychange", hide);
    };
  }, [x, y, dotStrength]);
  useEffect(() => {
    if (frozen) {
      x.set(0);
      y.set(0);
      dotStrength.set(0);
    }
  }, [frozen, x, y, dotStrength]);
  return (
    <AuthEnvironment.Provider value={{ phase, setPhase }}>
      <div
        ref={ref}
        className="prime-auth"
        data-phase={phase}
        onPointerMove={move}
        onPointerLeave={settle}
      >
        <div className="auth-spatial-field" aria-hidden="true">
          <motion.div
            className="auth-far-geometry"
            style={{ x: frozen ? 0 : farX, y: frozen ? 0 : farY }}
          >
            <svg viewBox="0 0 1440 1000" fill="none" preserveAspectRatio="xMidYMid slice">
              <g stroke="white" strokeOpacity=".035">
                <path d="M-100 220H90L250 60H460L620 -100M-100 300H130L290 140H500L660 -20M850 1100V870L1020 700H1220L1500 420" />
              </g>
              <g stroke="red" strokeOpacity=".09">
                <path d="M-130 750H100L280 570H410L570 410V250L710 110M-130 790H120L300 610H430L610 430V270L750 130" />
                <path d="M900 1000V820L1070 650H1210L1490 370" />
              </g>
              <g transform="translate(1120 -80) scale(16)" fill="red" opacity=".065">
                <path d={PRIME_MARK_PATH_LOWER} />
                <path d={PRIME_MARK_PATH_UPPER} />
              </g>
            </svg>
          </motion.div>
          <motion.div
            className="auth-cursor-field"
            style={{
              maskImage: dotMask,
              WebkitMaskImage: dotMask,
              opacity: frozen ? 0 : dotOpacity,
            }}
          >
            <div className="auth-dot-pattern" />
            <motion.svg
              className="auth-dot-intersections"
              viewBox="0 0 1440 1000"
              preserveAspectRatio="xMidYMid slice"
              style={{ x: frozen ? 0 : nearX, y: frozen ? 0 : nearY }}
              fill="#ff0000"
            >
              <rect x="349" y="499" width="2" height="2" />
              <rect x="569" y="499" width="2" height="2" />
              <rect x="669" y="399" width="2" height="2" />
              <rect x="1019" y="379" width="2" height="2" />
              <rect x="1119" y="379" width="2" height="2" />
              <rect x="1259" y="239" width="2" height="2" />
            </motion.svg>
          </motion.div>
          <motion.div
            className="auth-primary-geometry"
            style={{ x: frozen ? 0 : nearX, y: frozen ? 0 : nearY }}
          >
            <svg viewBox="0 0 1440 1000" fill="none" preserveAspectRatio="xMidYMid slice">
              <motion.path
                className="auth-entry-path"
                d="M-100 680H170L350 500H570L670 400H760"
                stroke="red"
                initial={false}
                animate={{
                  opacity: phase === "email-focus" ? 0.5 : 0.23,
                  pathLength: reduced ? 1 : phase === "success" ? 1 : 0.83,
                }}
                transition={{ duration: 0.7, ease: motionEase.enter }}
              />
              <motion.path
                className="auth-exit-path"
                d="M750 520H880L1020 380H1120L1260 240V100"
                stroke="red"
                initial={false}
                animate={{
                  opacity: phase === "success" ? 0.65 : 0.12,
                  pathLength: reduced ? 1 : phase === "success" ? 1 : 0.3,
                }}
                transition={{ duration: 0.55, ease: motionEase.enter }}
              />
            </svg>
          </motion.div>
          <motion.div
            className="auth-ambient"
            style={{ x: frozen ? 0 : nearX, y: frozen ? 0 : nearY }}
            animate={{
              opacity: phase === "email-focus" ? 0.15 : phase === "success" ? 0.2 : 0.1,
            }}
            transition={{ duration: 0.24 }}
          />
        </div>
        <header className="auth-utility">
          <AuthBackControl />
          <PrimeLogo href="/" size="sm" />
        </header>
        <main className="auth-main" id="auth-main">
          {children}
        </main>
        <footer className="auth-legal">
          <span>© 2026 PRIME</span>
          <span>Preparation, with purpose.</span>
        </footer>
      </div>
    </AuthEnvironment.Provider>
  );
}
