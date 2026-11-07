"use client";

import * as React from "react";
import {
  Copy01Icon,
  Tick02Icon,
  Maximize01Icon,
  Search01Icon,
  RotateRight01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface RichMermaidProps {
  source: string;
  className?: string;
}

export function RichMermaid({ source, className }: RichMermaidProps) {
  const [svg, setSvg] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [zoom, setZoom] = React.useState(1);
  const [expandOpen, setExpandOpen] = React.useState(false);
  const uniqueId = React.useId().replace(/:/g, "_");

  React.useEffect(() => {
    let active = true;

    async function renderMermaid() {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          themeVariables: {
            darkMode: true,
            background: "#080808",
            primaryColor: "#FF0000",
            primaryTextColor: "#FFFFFF",
            primaryBorderColor: "rgba(255, 0, 0, 0.4)",
            lineColor: "rgba(255, 255, 255, 0.45)",
            secondaryColor: "#141414",
            tertiaryColor: "#0F0F0F",
          },
          securityLevel: "strict",
        });

        const id = `mermaid_${uniqueId}_${Date.now()}`;
        const { svg: renderedSvg } = await mermaid.render(id, source.trim());

        if (active) {
          setSvg(renderedSvg);
          setError(null);
        }
      } catch (err: unknown) {
        if (active) {
          setError(err instanceof Error ? err.message : "Diagram rendering failed");
          setSvg(null);
        }
      }
    }

    renderMermaid();

    return () => {
      active = false;
    };
  }, [source, uniqueId]);

  const handleCopy = async () => {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // If diagram failed or is still streaming an incomplete block, render source gracefully
  if (error || !svg) {
    return (
      <figure className="my-4 rounded-xl border border-white/[0.08] bg-[#080808] overflow-hidden font-mono text-xs">
        <figcaption className="flex items-center justify-between px-3 py-1.5 border-b border-white/[0.06] bg-[#0A0A0A] text-neutral-400 text-[11px]">
          <span>Mermaid Diagram {error ? "(Syntax Fallback)" : "Rendering…"}</span>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 hover:text-white"
          >
            <Icon icon={copied ? Tick02Icon : Copy01Icon} size={12} className={copied ? "text-[#10B981]" : ""} />
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </figcaption>
        <pre className="p-3 text-neutral-300 overflow-x-auto text-xs leading-relaxed">
          <code>{source}</code>
        </pre>
      </figure>
    );
  }

  return (
    <figure
      className={cn(
        "my-4 rounded-xl border border-white/[0.08] bg-[#050505] overflow-hidden shadow-md",
        className
      )}
    >
      {/* Diagram Toolbar */}
      <figcaption className="flex items-center justify-between px-3 py-1.5 border-b border-white/[0.06] bg-[#0A0A0A] font-mono text-xs">
        <span className="text-[11px] font-semibold text-neutral-300 uppercase tracking-wider">
          Architecture & Flow Diagram
        </span>

        <div className="flex items-center gap-1">
          {/* Zoom controls */}
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
            className="h-6 w-6 rounded flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/[0.06]"
            title="Zoom out"
            aria-label="Zoom out diagram"
          >
            -
          </button>
          <span className="text-[10px] text-neutral-500 w-8 text-center">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(2.0, z + 0.2))}
            className="h-6 w-6 rounded flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/[0.06]"
            title="Zoom in"
            aria-label="Zoom in diagram"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setZoom(1)}
            className="h-6 w-6 rounded flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/[0.06]"
            title="Reset zoom"
            aria-label="Reset diagram zoom"
          >
            <Icon icon={RotateRight01Icon} size={11} />
          </button>

          <span className="w-px h-3.5 bg-white/10 mx-1" />

          {/* Copy Source */}
          <button
            type="button"
            onClick={handleCopy}
            className="h-6 px-1.5 rounded flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white hover:bg-white/[0.06]"
            title="Copy diagram source"
            aria-label="Copy diagram source code"
          >
            <Icon icon={copied ? Tick02Icon : Copy01Icon} size={12} className={copied ? "text-[#10B981]" : ""} />
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
          </button>

          {/* Expand Modal */}
          <button
            type="button"
            onClick={() => setExpandOpen(true)}
            className="h-6 w-6 rounded flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/[0.06]"
            title="Expand diagram to modal"
            aria-label="Expand diagram modal"
          >
            <Icon icon={Maximize01Icon} size={12} />
          </button>
        </div>
      </figcaption>

      {/* Diagram Canvas */}
      <div className="overflow-auto p-4 flex justify-center items-center min-h-[180px] bg-black">
        <div
          style={{ transform: `scale(${zoom})`, transformOrigin: "center center", transition: "transform 150ms ease" }}
          dangerouslySetInnerHTML={{ __html: svg }}
          className="max-w-full select-none"
        />
      </div>

      {/* Expanded Modal Dialog */}
      <Dialog open={expandOpen} onOpenChange={setExpandOpen}>
        <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] p-0 bg-[#080808] border border-white/10 text-white flex flex-col overflow-hidden">
          <DialogHeader className="p-4 border-b border-white/[0.08] bg-[#0A0A0A] flex flex-row items-center justify-between">
            <DialogTitle className="font-mono text-sm sm:text-base font-bold text-white tracking-tight">
              Expanded Diagram View
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="h-7 px-2 text-xs font-mono border-white/10 bg-white/[0.04] text-neutral-200 hover:text-white mr-6"
            >
              <Icon icon={copied ? Tick02Icon : Copy01Icon} size={12} className={copied ? "text-[#10B981]" : ""} />
              <span>{copied ? "Copied" : "Copy"}</span>
            </Button>
          </DialogHeader>
          <div className="flex-1 overflow-auto p-6 flex justify-center items-center bg-black">
            <div dangerouslySetInnerHTML={{ __html: svg }} className="w-full max-w-full" />
          </div>
        </DialogContent>
      </Dialog>
    </figure>
  );
}

