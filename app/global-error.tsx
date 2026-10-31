"use client";

import * as React from "react";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#070707] text-[#f7f7f7] flex items-center justify-center p-6 font-sans antialiased">
        <div className="max-w-md w-full rounded-lg border border-[#242426] bg-[#101011] p-6 text-center space-y-4 shadow-xl">
          <h2 className="text-lg font-semibold text-[#f7f7f7]">
            Application Boundary Interruption
          </h2>
          <p className="text-sm text-[#71717a]">
            A critical unexpected error occurred at the root application boundary.
          </p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 text-sm font-semibold text-white bg-[#e5484d] rounded-md shadow hover:bg-[#f05257] active:translate-y-[0.5px] transition-colors"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
