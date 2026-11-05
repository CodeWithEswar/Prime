"use client";
import { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ALGORITHMS } from "../registry/metadata";
import { LabLoader } from "./lab-workspace";
export function RendererLab() {
  const [slug, setSlug] = useState("binary-search"),
    metadata = ALGORITHMS.find((a) => a.slug === slug)!;
  return (
    <div>
      <div style={{ padding: 24 }}>
        <h1 style={{ fontSize: 24, marginBottom: 16 }}>
          Algorithm Lab / Component Workbench
        </h1>
        <p style={{ fontSize: 13, color: "#999", marginBottom: 16 }}>
          Live array/pointer, structure, network, playback, State Trace, prediction and
          code-sync components. Use Custom input to inspect edge cases.
        </p>
        <Select value={slug} onValueChange={setSlug}>
          <SelectTrigger aria-label="Workbench algorithm" style={{ maxWidth: 300 }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ALGORITHMS.map((a) => (
              <SelectItem key={a.slug} value={a.slug}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <LabLoader key={slug} metadata={metadata} />
    </div>
  );
}
