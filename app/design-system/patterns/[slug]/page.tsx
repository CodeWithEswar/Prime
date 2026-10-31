import * as React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getItemBySlug,
  getItemsByCategory,
  getPrevNext,
} from "@/lib/design-system/registry";
import { Badge } from "@/components/ui/badge";
import { DesignSystemBreadcrumb } from "@/components/design-system/shared/breadcrumb";
import { DesignSystemPrevNext } from "@/components/design-system/shared/prev-next";
import { DesignSystemContextRail } from "@/components/design-system/shell/context-rail";
import { PreviewRenderer } from "@/components/design-system/preview/preview-renderer";
import { ApiTable } from "@/components/design-system/api-table/api-table";
import { DoDontSection } from "@/components/design-system/dodont/dodont-section";
import { PromptSection } from "@/components/design-system/prompt/prompt-section";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const patterns = getItemsByCategory("patterns");
  return patterns.map((item) => ({
    slug: item.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getItemBySlug(slug);
  if (!item || item.category !== "patterns") {
    return { title: "Pattern Not Found | PRIME" };
  }
  return {
    title: `${item.name} Pattern | PRIME Design System`,
    description: item.description,
  };
}

export default async function PatternDocPage({ params }: PageProps) {
  const { slug } = await params;
  const item = getItemBySlug(slug);

  if (!item || item.category !== "patterns") {
    notFound();
  }

  const { prev, next } = getPrevNext(slug);

  return (
    <div className="flex gap-8 items-start">
      {/* Center Documentation Panel */}
      <div className="min-w-0 flex-1 max-w-4xl space-y-10 pb-16">
        {/* Breadcrumb & Header */}
        <div className="space-y-3">
          <DesignSystemBreadcrumb
            category="patterns"
            subcategory={item.subcategory}
            name={item.name}
          />

          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              {item.name}
            </h1>
            <Badge variant="outline" className="font-mono text-[10px] uppercase">
              {item.status}
            </Badge>
          </div>

          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* 1. Live Interactive Preview */}
        <PreviewRenderer slug={item.slug} />

        {/* 2. Composition / Architecture Overview */}
        <section id="description" className="space-y-3 scroll-mt-20">
          <h2 className="text-lg font-bold text-white">Pattern Architecture</h2>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            This pattern combines base UI primitives with domain logic (such as spaced
            repetition cues, external DSA platforms, or timer urgency). It ensures
            consistent layout and behavior across PRIME screens.
          </p>
        </section>

        {/* 3. API Reference Table */}
        {item.attributes && item.attributes.length > 0 && (
          <section id="attributes" className="space-y-3 scroll-mt-20">
            <h2 className="text-lg font-bold text-white">Props &amp; Configuration</h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Typed interface for this pattern component.
            </p>
            <ApiTable properties={item.attributes} />
          </section>
        )}

        {/* 4. Usage Guidelines */}
        {item.dodont && item.dodont.length > 0 && (
          <DoDontSection dodont={item.dodont} className="scroll-mt-20 space-y-3" />
        )}

        {/* 5. Reusable AI Agent Implementation Prompt */}
        <PromptSection
          prompt={item.aiPrompt}
          componentName={item.name}
          className="scroll-mt-20"
        />

        {/* 6. Prev / Next Navigation */}
        <DesignSystemPrevNext prev={prev} next={next} />
      </div>

      {/* Right Context Rail (Sticky TOC + Info Card) */}
      <div className="hidden xl:block w-56 shrink-0 sticky top-20">
        <DesignSystemContextRail item={item} />
      </div>
    </div>
  );
}
