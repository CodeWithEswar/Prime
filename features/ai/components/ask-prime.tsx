"use client";
import { useSyncExternalStore } from "react";
import { AiChat01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { useAI } from "../ai-provider";
import { usePathname } from "next/navigation";
const subscribe = () => () => {};
export function AskPrime() {
  const ai = useAI();
  const pathname = usePathname();
  const ready = useSyncExternalStore(subscribe, () => true, () => false);
  if (!ai?.enabled) return null;
  return (
    <button
      type="button"
      className="shell-ask-prime"
      aria-label="Ask PRIME"
      aria-haspopup="dialog"
      aria-expanded={ai.open}
      disabled={!ready}
      onClick={(e) =>
        pathname === "/ai"
          ? document.getElementById("ai-workspace-prompt")?.focus()
          : ai.setOpen(!ai.open, e.currentTarget)
      }
    >
      <Icon icon={AiChat01Icon} size={17} />
      <span>Ask PRIME</span>
    </button>
  );
}
