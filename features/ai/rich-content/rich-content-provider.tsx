"use client";

import * as React from "react";

export type RichContentMode = "panel" | "workspace" | "auto";

export const MOBILE_MEDIA_QUERY = "(max-width: 768px)";

function subscribeMobile(callback: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) {
    return () => () => {};
  }
  const mql = window.matchMedia(MOBILE_MEDIA_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getMobileSnapshot(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) {
    return false;
  }
  return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
}

function getMobileServerSnapshot(): boolean {
  return false;
}

export function useIsMobile(): boolean {
  return React.useSyncExternalStore(
    subscribeMobile,
    getMobileSnapshot,
    getMobileServerSnapshot
  );
}

export interface RichContentContextValue {
  mode: RichContentMode;
  streaming: boolean;
  references: Set<string>;
  openFence: number | null;
  containerWidth: number;
  isNarrow: boolean;
  isMobile: boolean;
}

const RichContentContext = React.createContext<RichContentContextValue>({
  mode: "auto",
  streaming: false,
  references: new Set<string>(),
  openFence: null,
  containerWidth: 600,
  isNarrow: false,
  isMobile: false,
});

export interface RichContentProviderProps {
  children: React.ReactNode;
  mode?: RichContentMode;
  streaming?: boolean;
  references?: { href: string; title?: string }[];
  openFence?: number | null;
}

export function RichContentProvider({
  children,
  mode = "auto",
  streaming = false,
  references = [],
  openFence = null,
}: RichContentProviderProps) {
  const isMobile = useIsMobile();
  const [containerWidth, setContainerWidth] = React.useState<number>(() =>
    mode === "panel" || isMobile ? 380 : 800
  );

  const refSet = React.useMemo(
    () => new Set(references.map((r) => r.href).filter(Boolean)),
    [references]
  );

  // If explicitly declared as panel or mobile UI detected, treat as narrow; otherwise check container threshold (< 580px)
  const isNarrow = mode === "panel" || isMobile || (mode === "auto" && containerWidth < 580);

  const value = React.useMemo<RichContentContextValue>(
    () => ({
      mode,
      streaming,
      references: refSet,
      openFence,
      containerWidth,
      isNarrow,
      isMobile,
    }),
    [mode, streaming, refSet, openFence, containerWidth, isNarrow, isMobile]
  );

  return (
    <RichContentContext.Provider value={value}>
      {children}
    </RichContentContext.Provider>
  );
}

export function useRichContent(): RichContentContextValue {
  return React.useContext(RichContentContext);
}
