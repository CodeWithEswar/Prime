"use client";

import * as React from "react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { QueryProvider } from "@/lib/query/provider";

export interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <NuqsAdapter>
      <QueryProvider>{children}</QueryProvider>
    </NuqsAdapter>
  );
}
