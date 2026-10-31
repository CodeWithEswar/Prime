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
import { PromptSection } from "@/components/design-system/prompt/prompt-section";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const foundations = getItemsByCategory("foundations");
  return foundations.map((item) => ({
    slug: item.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getItemBySlug(slug);
  if (!item || item.category !== "foundations") {
    return { title: "Foundation Not Found | PRIME" };
  }
  return {
    title: `${item.name} Foundation | PRIME Design System`,
    description: item.description,
  };
}

export default async function FoundationDocPage({ params }: PageProps) {
  const { slug } = await params;
  const item = getItemBySlug(slug);

  if (!item || item.category !== "foundations") {
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
            category="foundations"
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
            {item.primitive && (
              <span className="text-[11px] font-mono text-[rgba(255,255,255,0.46)]">
                Primitive: {item.primitive}
              </span>
            )}
          </div>

          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* 1. Live Demonstration Preview */}
        <PreviewRenderer slug={item.slug} />

        {/* 2. Detailed Technical Breakdown */}
        <section id="description" className="space-y-3 scroll-mt-20">
          <h2 className="text-lg font-bold text-white">Token Specification</h2>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            PRIME foundations define immutable geometric scales and color variables.
            Developers and agents should consume CSS tokens directly (
            <code className="font-mono text-white">var(--prime-*)</code>) rather than
            hardcoding ad-hoc arbitrary values.
          </p>
        </section>

        {/* 3. Reusable AI Agent Implementation Prompt */}
        <PromptSection
          prompt={item.aiPrompt}
          componentName={item.name}
          className="scroll-mt-20"
        />

        {/* 4. Prev / Next Navigation */}
        <DesignSystemPrevNext prev={prev} next={next} />
      </div>

      {/* Right Context Rail (Sticky TOC + Info Card) */}
      <div className="hidden xl:block w-56 shrink-0 sticky top-20">
        <DesignSystemContextRail item={item} />
      </div>
    </div>
  );
}
