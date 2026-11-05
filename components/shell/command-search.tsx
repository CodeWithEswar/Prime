"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { AVAILABLE_NAVIGATION_ITEMS } from "./navigation-config";
import { useAI } from "@/features/ai/ai-provider";

export function isEditableTarget(target: EventTarget | null) {
  return (
    target instanceof Element &&
    !!target.closest(
      'input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"]'
    )
  );
}
export function CommandSearch({
  open = false,
  onOpenChange,
  onCloseAutoFocus,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCloseAutoFocus?: (event: Event) => void;
  className?: string;
}) {
  const [query, setQuery] = useState("");
  const ai = useAI();
  const router = useRouter();
  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.isComposing ||
        event.altKey ||
        isEditableTarget(event.target) ||
        document.querySelector('[role="dialog"][data-state="open"]')
      )
        return;
      const command = event.key.toLowerCase() === "k" && (event.ctrlKey || event.metaKey);
      const slash = event.key === "/" && !event.ctrlKey && !event.metaKey;
      if (command || slash) {
        event.preventDefault();
        onOpenChange?.(true);
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [onOpenChange]);
  function navigate(href: string) {
    onOpenChange?.(false);
    setQuery("");
    router.push(href);
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        onOpenChange?.(value);
        if (!value) setQuery("");
      }}
    >
      <DialogContent className="shell-command-dialog" onCloseAutoFocus={onCloseAutoFocus}>
        <DialogTitle className="sr-only">Search PRIME</DialogTitle>
        <DialogDescription className="sr-only">
          Find a page or search the question catalog. Use the arrow keys to select a
          result.
        </DialogDescription>
        <div className="shell-command-caption">PRIME / COMMAND</div>
        <Command className="shell-command">
          <CommandInput
            placeholder="Find a page or search questions…"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>No matching pages. Try a question title.</CommandEmpty>
            {query.trim() && (
              <CommandGroup heading="Question catalog">
                <CommandItem
                  value={`Search questions ${query}`}
                  onSelect={() =>
                    navigate(`/practice/dsa?q=${encodeURIComponent(query.trim())}`)
                  }
                >
                  <Icon icon={Search01Icon} size={18} aria-hidden="true" />
                  <span>
                    Search questions for <strong>“{query.trim()}”</strong>
                  </span>
                </CommandItem>
              </CommandGroup>
            )}
            <CommandGroup heading="Your workspace">
              {AVAILABLE_NAVIGATION_ITEMS.filter(
                (item) => !item.aiOnly || ai?.enabled
              ).map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.label}
                  onSelect={() => navigate(item.href)}
                >
                  <Icon icon={item.icon} size={18} aria-hidden="true" />
                  <span>{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          <div className="shell-command-footer">
            <span>Navigate with your keyboard</span>
            <span>
              <kbd>Esc</kbd> to close
            </span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
