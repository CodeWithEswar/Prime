"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search01Icon,
  Menu01Icon,
  Cancel01Icon,
  Layers01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { KeyboardKey } from "@/components/shared/keyboard-key";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { getAllRegistryItems } from "@/lib/design-system/registry";

export interface HeaderProps {
  onToggleMobileNav?: () => void;
  isMobileNavOpen?: boolean;
}

export function DesignSystemHeader({ onToggleMobileNav, isMobileNavOpen }: HeaderProps) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const allItems = React.useMemo(() => getAllRegistryItems(), []);

  // Global ⌘K / Ctrl+K keyboard shortcut listener
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[var(--border-subtle)] bg-[#000000]/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1920px] items-center justify-between px-4 sm:px-6">
          {/* Logo & Product Identity */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleMobileNav}
              className="lg:hidden p-1.5 rounded-[var(--radius-xs)] text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-hover)] transition-colors"
              aria-label={isMobileNavOpen ? "Close menu" : "Open menu"}
            >
              <Icon icon={isMobileNavOpen ? Cancel01Icon : Menu01Icon} size={18} />
            </button>

            <Link href="/design-system" className="flex items-center gap-2.5 group">
              <div className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-xs)] bg-[#ff0000] text-white font-bold text-xs tracking-wider shadow-[0_0_8px_rgba(255,0,0,0.5)]">
                PR
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-wider text-white">PRIME</span>
                <span className="text-[rgba(255,255,255,0.28)] font-mono text-xs">/</span>
                <span className="text-xs font-mono text-[var(--text-secondary)] group-hover:text-white transition-colors">
                  DESIGN SYSTEM
                </span>
              </div>
            </Link>
          </div>

          {/* Quick Search Trigger & Identity Badge */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(true)}
              className="hidden sm:inline-flex gap-2 text-xs font-mono w-64 justify-between bg-[#000000] border-[rgba(255,255,255,0.10)] text-[rgba(255,255,255,0.46)] hover:border-[rgba(255,255,255,0.20)] hover:text-white"
            >
              <div className="flex items-center gap-2">
                <Icon icon={Search01Icon} size={13} />
                <span>Search components...</span>
              </div>
              <KeyboardKey>⌘K</KeyboardKey>
            </Button>

            <span className="hidden xl:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[var(--radius-xs)] bg-[var(--prime-accent-soft)] border border-[var(--prime-accent-border)] font-mono text-[11px] text-[#ff0000] font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ff0000]" />
              PURE BLACK × PURE RED × WHITE
            </span>
          </div>
        </div>
      </header>

      {/* Global Command Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search foundations, components, patterns..." />
        <CommandList className="prime-scrollbar">
          <CommandEmpty>No matching design system items found.</CommandEmpty>

          <CommandGroup heading="Foundations">
            {allItems
              .filter((i) => i.category === "foundations")
              .map((item) => (
                <CommandItem
                  key={item.slug}
                  onSelect={() => handleSelect(`/design-system/foundations/${item.slug}`)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Icon
                      icon={Layers01Icon}
                      size={14}
                      className="text-[var(--text-tertiary)]"
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-disabled)]">
                    Foundation
                  </span>
                </CommandItem>
              ))}
          </CommandGroup>

          <CommandGroup heading="Components">
            {allItems
              .filter((i) => i.category === "components")
              .map((item) => (
                <CommandItem
                  key={item.slug}
                  onSelect={() => handleSelect(`/design-system/components/${item.slug}`)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Icon icon={Tick02Icon} size={14} className="text-[#ff0000]" />
                    <span>{item.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-disabled)]">
                    {item.subcategory}
                  </span>
                </CommandItem>
              ))}
          </CommandGroup>

          <CommandGroup heading="Patterns">
            {allItems
              .filter((i) => i.category === "patterns")
              .map((item) => (
                <CommandItem
                  key={item.slug}
                  onSelect={() => handleSelect(`/design-system/patterns/${item.slug}`)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Icon
                      icon={Layers01Icon}
                      size={14}
                      className="text-[var(--text-tertiary)]"
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-disabled)]">
                    Pattern
                  </span>
                </CommandItem>
              ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
