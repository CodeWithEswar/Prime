"use client";

import * as React from "react";

const emptySubscribe = () => () => {};

/**
 * Idiomatic React 18/19 SSR-safe hydration hook using useSyncExternalStore.
 * Avoids setState-in-effect and cascading re-renders during hydration.
 */
export function useMounted(): boolean {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
