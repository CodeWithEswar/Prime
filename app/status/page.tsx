import type { Metadata } from "next";
import { connection } from "next/server";
import { StatusClient } from "./status-client";
import { getPublicStatusSnapshot } from "@/lib/status/snapshot";

export const metadata: Metadata = {
  title: "System Status",
  description:
    "Real-time infrastructure health, uptime tracking, and service history for PRIME.",
};

export const instant = false;

export default async function StatusPage() {
  await connection();
  const initialSnapshot = await getPublicStatusSnapshot();

  return <StatusClient initialSnapshot={initialSnapshot} />;
}
