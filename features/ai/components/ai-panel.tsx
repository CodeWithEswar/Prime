"use client";
import { useSyncExternalStore } from "react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useAI } from "../ai-provider";
import { AISurface } from "./ai-surface";
import "./ai.css";
const subscribe = (listener: () => void) => {
  const q = matchMedia("(min-width:1440px)");
  q.addEventListener("change", listener);
  return () => q.removeEventListener("change", listener);
};
export default function AIPanel() {
  const ai = useAI()!,
    wide = useSyncExternalStore(
      subscribe,
      () => matchMedia("(min-width:1440px)").matches,
      () => false
    );
  const content = (
    <>
      <AISurface panel />
    </>
  );
  return wide ? (
    <aside
      className="ai-panel"
      aria-label="PRIME AI panel"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          ai.setOpen(false);
          ai.restoreFocus();
        }
      }}
    >
      {content}
    </aside>
  ) : (
    <Sheet open={ai.open} onOpenChange={ai.setOpen}>
      <SheetContent
        className="ai-panel-sheet"
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          ai.restoreFocus();
        }}
      >
        <SheetTitle className="sr-only">PRIME AI</SheetTitle>
        <SheetDescription className="sr-only">
          Contextual preparation assistant
        </SheetDescription>
        {content}
      </SheetContent>
    </Sheet>
  );
}
