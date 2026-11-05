"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { AppearancePreferences } from "../types";

export function SettingsAppearance({
  preferences,
}: {
  preferences: AppearancePreferences;
}) {
  const router = useRouter();
  useEffect(() => {
    document.documentElement.dataset.primeMotion = preferences.motionPreference;
    document.documentElement.dataset.primeDensity = preferences.uiDensity;
    window.dispatchEvent(new Event("prime:appearance"));
    return () => {
      delete document.documentElement.dataset.primeMotion;
      delete document.documentElement.dataset.primeDensity;
      window.dispatchEvent(new Event("prime:appearance"));
    };
  }, [preferences.motionPreference, preferences.uiDensity]);
  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel("prime-settings");
    channel.onmessage = () => router.refresh();
    return () => channel.close();
  }, [router]);

  const fontSize = preferences.fontScaling === "large" ? "110%" : "100%";
  const density =
    preferences.uiDensity === "compact"
      ? "--control-height:28px; --control-height-sm:26px; --control-height-lg:32px; --control-row-height:28px;"
      : "";
  const motion =
    preferences.motionPreference === "reduced"
      ? "*,*::before,*::after { animation-duration:0.01ms !important; animation-iteration-count:1 !important; transition-duration:0.01ms !important; scroll-behavior:auto !important; }"
      : "";
  return <style>{":root { font-size:" + fontSize + ";" + density + "}" + motion}</style>;
}
