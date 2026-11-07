"use client";

import * as React from "react";

export type RichContentMode = "panel" | "workspace" | "auto";

interface RichContentContextValue {
  mode: RichContentMode;
  streaming: boolean;
  references: Set<string>;
  openFence: number | null;
  containerWidth: number;
  isNarrow: boolean;
}

const RichContentContext = React.createContext<RichContentContextValue>({
  mode: "auto",
  streaming: false,
  references: new Set<string>(),
  openFence: null,
  containerWidth: 600,
  isNarrow: false,
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
  const [containerWidth, setContainerWidth] = React.useState<number>(() =>
    mode === "panel" ? 380 : 800
  );

  const refSet = React.useMemo(
    () => new Set(references.map((r) => r.href).filter(Boolean)),
    [references]
  );

  // If explicitly declared as panel, always treat as narrow; otherwise check container threshold (< 520px)
  const isNarrow = mode === "panel" || (mode === "auto" && containerWidth < 520);

  const value = React.useMemo<RichContentContextValue>(
    () => ({
      mode,
      streaming,
      references: refSet,
      openFence,
      containerWidth,
      isNarrow,
    }),
    [mode, streaming, refSet, openFence, containerWidth, isNarrow]
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

