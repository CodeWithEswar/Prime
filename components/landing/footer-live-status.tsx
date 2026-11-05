"use client";

import { useEffect, useState } from "react";

type ServiceHealth = "operational" | "degraded" | "outage" | "unknown";

let cachedStatus: ServiceHealth | null = null;
let statusFetchPromise: Promise<ServiceHealth> | null = null;

function fetchLiveStatus(): Promise<ServiceHealth> {
  if (cachedStatus) return Promise.resolve(cachedStatus);
  if (statusFetchPromise) return statusFetchPromise;

  statusFetchPromise = fetch("/api/status")
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      let result: ServiceHealth = "operational";
      if (!data) result = "unknown";
      else if (data.status === "operational") result = "operational";
      else if (data.status === "degraded") result = "degraded";
      else if (data.status === "major_outage" || data.status === "partial_outage") result = "outage";
      else result = "unknown";

      cachedStatus = result;
      return result;
    })
    .catch(() => "operational" as ServiceHealth)
    .finally(() => {
      statusFetchPromise = null;
    });

  return statusFetchPromise;
}

export function FooterLiveStatus() {
  const [status, setStatus] = useState<ServiceHealth>(cachedStatus || "operational");

  useEffect(() => {
    let isMounted = true;
    fetchLiveStatus().then((s) => {
      if (isMounted) setStatus(s);
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
        status === "operational" ? "shadow-[0_0_6px_rgba(34,197,94,0.6)] animate-pulse" : ""
      }`}
      aria-hidden="true"
    />
  );
}
