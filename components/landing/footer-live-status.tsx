"use client";

import { useEffect, useState } from "react";

export function FooterLiveStatus() {
  const [status, setStatus] = useState<"operational" | "degraded" | "outage" | "unknown">("unknown");

  useEffect(() => {
    let isMounted = true;
    fetch("/api/status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data) return;
        if (data.status === "operational") {
          setStatus("operational");
        } else if (data.status === "degraded") {
          setStatus("degraded");
        } else if (data.status === "major_outage" || data.status === "partial_outage") {
          setStatus("outage");
        } else {
          setStatus("unknown");
        }
      })
      .catch(() => {
        if (isMounted) setStatus("unknown");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const dotColor = {
    operational: "bg-emerald-500",
    degraded: "bg-amber-500",
    outage: "bg-red-500",
    unknown: "bg-neutral-500",
  }[status];

  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${dotColor} ${
        status === "operational" ? "shadow-[0_0_6px_rgba(34,197,94,0.6)]" : ""
      }`}
      aria-hidden="true"
    />
  );
}
