"use client";

import * as React from "react";
import Link from "next/link";
import { usePrimeReducedMotion } from "@/lib/motion";
import { motion, useScroll, useTransform } from "motion/react";
import { PrimeLogo } from "@/components/branding";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Menu01Icon, Cancel01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/browser";

const links = [
  ["Features", "#features"],
  ["Method", "#method"],
  ["Roadmap", "#roadmap"],
  ["Progress", "#progress"],
];

export function LandingHeader() {
  const [open, setOpen] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    try {
      const supabase = createClient();
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setIsAuthenticated(true);
        }
      });
    } catch {
      // Ignore in mock or offline environments
    }
  }, []);
  const { scrollY } = useScroll();
  const backgroundColor = useTransform(
    scrollY,
    [0, 80],
    ["rgba(0,0,0,0)", "rgba(0,0,0,.94)"]
  );
  const borderColor = useTransform(
    scrollY,
    [0, 80],
    ["rgba(255,255,255,0)", "rgba(255,255,255,.12)"]
  );
  const reduced = usePrimeReducedMotion();

  // Lock body scroll when mobile navigation is open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <motion.header
        className={cn("landing-header", open && "mobile-nav-open")}
        style={{
          backgroundColor: open ? "#030303" : reduced ? "#000" : backgroundColor,
          borderColor: open ? "rgba(255,255,255,.12)" : borderColor,
        }}
      >
        <div className="landing-container header-inner">
          <PrimeLogo href="/" />

          {/* Desktop Navigation */}
          <nav aria-label="Main navigation" className="desktop-nav">
            {links.map(([label, id]) => (
              <a key={id} href={id}>
                {label}
              </a>
            ))}
          </nav>

          {/* Desktop & Mobile Actions */}
          <div className="header-actions">
            {isAuthenticated ? (
              <Button
                asChild
                variant="primary"
                size="sm"
                className="hidden xs:inline-flex text-xs font-mono"
              >
                <Link href="/today">Open App</Link>
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="hidden sm:inline-flex text-[#aaa] hover:text-white"
                >
                  <Link href="/login">Sign in</Link>
                </Button>

                <Button
                  asChild
                  variant="primary"
                  size="sm"
                  className={cn("hidden xs:inline-flex", open && "hidden")}
                >
                  <Link href="/login">Explore PRIME</Link>
                </Button>
              </>
            )}

            <button
              className="menu-toggle flex items-center justify-center rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.14)] bg-[var(--surface-base)] text-white hover:bg-[var(--surface-hover)] hover:border-[rgba(255,255,255,0.3)] transition-all cursor-pointer focus:outline-none focus-visible:shadow-[0_0_0_1px_#000,0_0_0_3px_rgba(255,0,0,0.7)]"
              aria-expanded={open}
              aria-controls="mobile-navigation"
              aria-label={open ? "Close navigation" : "Open navigation"}
              onClick={() => setOpen(!open)}
            >
              <Icon icon={open ? Cancel01Icon : Menu01Icon} size={18} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="mobile-nav"
          hidden={!open}
        >
          <div className="flex flex-col gap-1">
            {links.map(([label, id], idx) => (
              <a
                key={id}
                href={id}
                aria-label={label}
                onClick={() => setOpen(false)}
                className="group flex items-center justify-between py-3.5 px-3 border-b border-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.85)] hover:text-white hover:bg-[rgba(255,255,255,0.03)] rounded-[var(--radius-xs)] transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <span className="font-mono text-xs text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors">
                    0{idx + 1}
                  </span>
                  <span className="text-base font-medium tracking-tight group-hover:text-white transition-colors">
                    {label}
                  </span>
                </div>
                <Icon
                  icon={ArrowRight01Icon}
                  size={14}
                  className="text-[var(--text-tertiary)] opacity-60 group-hover:opacity-100 group-hover:text-white group-hover:translate-x-0.5 transition-all"
                />
              </a>
            ))}
          </div>

          <div className="pt-6 pb-2 flex flex-col gap-2.5">
            {isAuthenticated ? (
              <Button
                asChild
                variant="primary"
                size="default"
                className="w-full text-xs font-mono justify-center"
              >
                <Link href="/today" onClick={() => setOpen(false)}>
                  Open App
                </Link>
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  variant="outline"
                  size="default"
                  className="w-full text-xs font-mono justify-center border-[rgba(255,255,255,0.16)] text-white hover:bg-[var(--surface-hover)]"
                >
                  <Link href="/login" onClick={() => setOpen(false)}>
                    Sign in
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="primary"
                  size="default"
                  className="w-full text-xs font-mono justify-center"
                >
                  <Link href="/login" onClick={() => setOpen(false)}>
                    Explore PRIME
                  </Link>
                </Button>
              </>
            )}
          </div>

          <div className="pt-3 text-center text-[10px] font-mono tracking-widest uppercase text-[var(--text-tertiary)]">
            PRIME · Preparation Roadmap &amp; Spaced Retention
          </div>
        </nav>
      </motion.header>

      {/* Backdrop Scrim Overlay when mobile menu is open */}
      {open && (
        <div
          className="fixed inset-0 top-[72px] bg-black/80 backdrop-blur-sm z-40 transition-opacity animate-in fade-in-0 duration-200"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
