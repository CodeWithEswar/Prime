"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { usePrimeReducedMotion } from "@/lib/motion";
import type { WeatherScene } from "@/lib/weather/conditions";
const mediaVersion = "2";
type Connection = EventTarget & { saveData?: boolean };
const motionQuery =
  "(min-width: 1100px) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
function subscribe(listener: () => void) {
  const media = matchMedia(motionQuery),
    data = matchMedia("(prefers-reduced-data: reduce)"),
    connection = (navigator as Navigator & { connection?: Connection }).connection;
  media.addEventListener("change", listener);
  data.addEventListener("change", listener);
  connection?.addEventListener("change", listener);
  return () => {
    media.removeEventListener("change", listener);
    data.removeEventListener("change", listener);
    connection?.removeEventListener("change", listener);
  };
}
function canPlay() {
  return (
    matchMedia(motionQuery).matches &&
    !matchMedia("(prefers-reduced-data: reduce)").matches &&
    !(navigator as Navigator & { connection?: Connection }).connection?.saveData
  );
}
function Layer({ scene, animate }: { scene: WeatherScene; animate: boolean }) {
  const [failed, setFailed] = useState(false),
    video = useRef<HTMLVideoElement>(null),
    layer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const target = layer.current;
    if (!target) return;
    let visible = true;
    const sync = () => {
      if (!video.current) return;
      if (visible && !document.hidden) video.current.play().catch(() => setFailed(true));
      else video.current.pause();
    };
    const observer = new IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? false;
      sync();
    });
    observer.observe(target);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [animate]);
  return (
    <motion.div
      ref={layer}
      className="weather-atmosphere-layer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: animate ? 1.1 : 0 }}
      style={{
        backgroundImage: `url(/weather/posters/${scene.asset}.jpg?v=${mediaVersion})`,
      }}
    >
      {animate && !failed && (
        <video
          ref={video}
          src={`/weather/video/${scene.asset}.webm?v=${mediaVersion}`}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster={`/weather/posters/${scene.asset}.jpg?v=${mediaVersion}`}
          aria-hidden="true"
          onError={() => setFailed(true)}
        />
      )}
    </motion.div>
  );
}
export function WeatherAtmosphere({ scene }: { scene: WeatherScene }) {
  const animate = useSyncExternalStore(subscribe, canPlay, () => false),
    reduced = usePrimeReducedMotion();
  return (
    <div
      className="weather-atmosphere"
      data-scene={scene.kind}
      data-period={scene.isDay ? "day" : "night"}
      aria-hidden="true"
    >
      <AnimatePresence initial={false}>
        <Layer key={scene.id} scene={scene} animate={animate && !reduced} />
      </AnimatePresence>
      <div className="weather-scrim" />
    </div>
  );
}
