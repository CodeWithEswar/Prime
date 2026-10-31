"use client";
import { useState } from "react";
import Link from "next/link";
import { usePrimeReducedMotion } from "@/lib/motion";
import { motion, useScroll, useTransform } from "motion/react";
import { PrimeLogo } from "@/components/branding";
import { Button } from "@/components/ui/button";

export function LandingHeader() {
  const [open, setOpen] = useState(false);
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
  return (
    <motion.header
      className="landing-header"
      style={{ backgroundColor: reduced ? "#000" : backgroundColor, borderColor }}
    >
      <div className="landing-container header-inner">
        <PrimeLogo href="/" />
        <nav aria-label="Main navigation" className="desktop-nav">
          {links.map(([label, id]) => (
            <a key={id} href={id}>
              {label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex text-[#aaa] hover:text-white"
          >
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/login">Explore PRIME</Link>
          </Button>
          <button
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? "Close navigation" : "Open navigation"}
            onClick={() => setOpen(!open)}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>
      <nav
        id="mobile-navigation"
        aria-label="Mobile navigation"
        className="mobile-nav"
        hidden={!open}
      >
        {links.map(([label, id]) => (
          <a key={id} href={id} onClick={() => setOpen(false)}>
            {label}
          </a>
        ))}
        <Link href="/login" onClick={() => setOpen(false)} className="mobile-sign-in">
          Sign in
        </Link>
      </nav>
    </motion.header>
  );
}
const links = [
  ["Features", "#features"],
  ["Method", "#method"],
  ["Roadmap", "#roadmap"],
  ["Progress", "#progress"],
];
