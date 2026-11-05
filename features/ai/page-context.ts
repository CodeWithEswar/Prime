import type { ContextRef } from "./schema";
export function pageContext(pathname: string): ContextRef {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] === "lab")
    return parts[1] ? { type: "lab", ref: parts[1] } : { type: "lab" };
  if (parts[0] === "practice" && parts[1] === "dsa" && parts[2])
    return { type: "problem", ref: parts[2] };
  const types: Record<string, ContextRef["type"]> = {
    practice: "practice",
    roadmap: "roadmap",
    revision: "revision",
    today: "today",
    plan: "planner",
    mastery: "mastery",
    readiness: "readiness",
    notes: "notes",
    progress: "progress",
    analytics: "progress",
  };
  return { type: types[parts[0]] ?? "general" };
}
