import * as React from "react";
import Link from "next/link";
import { getAllRegistryItems, getItemsByCategory } from "@/lib/design-system/registry";
import { Badge } from "@/components/ui/badge";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";

export const metadata = {
  title: "Design System Workbench | PRIME",
  description:
    "Component documentation, live previews, API references, and AI implementation prompts for the PRIME design system.",
};

export default function DesignSystemOverviewPage() {
  const allItems = getAllRegistryItems();
  const foundations = getItemsByCategory("foundations");
  const components = getItemsByCategory("components");
  const patterns = getItemsByCategory("patterns");

  return (
    <div className="space-y-12 pb-16 max-w-5xl">
      {/* Workbench Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[var(--radius-xs)] border border-[#ff0000]/30 bg-[#ff0000]/10 text-xs font-mono text-[#ff0000]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#ff0000] animate-pulse" />
          <span>PRODUCTION DESIGN SYSTEM WORKBENCH</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          PRIME Design System
        </h1>

        <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-3xl">
          Preparation Roadmap for Interviews, Mastery &amp; Excellence. Built on a strict{" "}
          <strong className="text-white">Pure Black (#000000)</strong> canvas with solid
          surfaces, razor-thin white-alpha borders, and an authoritative{" "}
          <strong className="text-[#ff0000]">Pure Red (#FF0000)</strong> brand accent.
        </p>

        {/* System Metric Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
          {[
            { label: "Total Catalog", count: allItems.length, sub: "Typed entities" },
            {
              label: "Foundations",
              count: foundations.length,
              sub: "Primitives & scales",
            },
            { label: "Components", count: components.length, sub: "UI controls" },
            { label: "Patterns", count: patterns.length, sub: "Domain templates" },
          ].map((m) => (
            <div
              key={m.label}
              className="p-3.5 rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.08)] bg-[#030303]"
            >
              <div className="text-[11px] font-mono text-[var(--text-tertiary)] uppercase">
                {m.label}
              </div>
              <div className="text-2xl font-bold font-mono font-mono-numbers text-white mt-1">
                {m.count}
              </div>
              <div className="text-[10px] text-[rgba(255,255,255,0.40)]">{m.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 1. Foundations Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-2.5">
          <div>
            <h2 className="text-lg font-bold text-white">1. Design Foundations</h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Core tokens, color primitives, dual-typography, spacing, and elevation.
            </p>
          </div>
          <Badge variant="outline" className="font-mono text-[10px]">
            {foundations.length} items
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {foundations.map((item) => (
            <Link
              key={item.slug}
              href={`/design-system/foundations/${item.slug}`}
              className="group p-4 rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.08)] bg-[#030303] hover:border-[rgba(255,255,255,0.20)] hover:bg-[#070707] transition-all flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-[#ff0000]">
                    {item.subcategory}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[10px] uppercase font-mono py-0"
                  >
                    {item.status}
                  </Badge>
                </div>
                <div className="text-sm font-semibold text-white group-hover:text-white transition-colors">
                  {item.name}
                </div>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-1 text-[11px] font-mono text-[var(--text-tertiary)] group-hover:text-white transition-colors">
                <span>Inspect tokens</span>
                <Icon
                  icon={ArrowRight01Icon}
                  size={12}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 2. Components Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-2.5">
          <div>
            <h2 className="text-lg font-bold text-white">2. UI Components</h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Interactive primitives, inputs, controls, dialogs, drawers, and overlays.
            </p>
          </div>
          <Badge variant="outline" className="font-mono text-[10px]">
            {components.length} items
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {components.map((item) => (
            <Link
              key={item.slug}
              href={`/design-system/components/${item.slug}`}
              className="group p-4 rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.08)] bg-[#030303] hover:border-[rgba(255,255,255,0.20)] hover:bg-[#070707] transition-all flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-[#ff0000]">
                    {item.subcategory}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[10px] uppercase font-mono py-0"
                  >
                    {item.status}
                  </Badge>
                </div>
                <div className="text-sm font-semibold text-white group-hover:text-white transition-colors">
                  {item.name}
                </div>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-1 text-[11px] font-mono text-[var(--text-tertiary)] group-hover:text-white transition-colors">
                <span>View docs &amp; preview</span>
                <Icon
                  icon={ArrowRight01Icon}
                  size={12}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Patterns Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-2.5">
          <div>
            <h2 className="text-lg font-bold text-white">3. Application Patterns</h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Domain-specific task rows, problem rows, revision cards, metrics, and empty
              states.
            </p>
          </div>
          <Badge variant="outline" className="font-mono text-[10px]">
            {patterns.length} items
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {patterns.map((item) => (
            <Link
              key={item.slug}
              href={`/design-system/patterns/${item.slug}`}
              className="group p-4 rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.08)] bg-[#030303] hover:border-[rgba(255,255,255,0.20)] hover:bg-[#070707] transition-all flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-[#ff0000]">
                    {item.subcategory}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[10px] uppercase font-mono py-0"
                  >
                    {item.status}
                  </Badge>
                </div>
                <div className="text-sm font-semibold text-white group-hover:text-white transition-colors">
                  {item.name}
                </div>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-1 text-[11px] font-mono text-[var(--text-tertiary)] group-hover:text-white transition-colors">
                <span>View pattern</span>
                <Icon
                  icon={ArrowRight01Icon}
                  size={12}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
