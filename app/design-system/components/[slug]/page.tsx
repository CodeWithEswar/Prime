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
import { AnatomySection } from "@/components/design-system/anatomy/anatomy-section";
import { ApiTable } from "@/components/design-system/api-table/api-table";
import { DoDontSection } from "@/components/design-system/dodont/dodont-section";
import { PromptSection } from "@/components/design-system/prompt/prompt-section";
import { DocPageSkeleton } from "@/components/design-system/shared/doc-skeleton";

export const instant = false;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const components = getItemsByCategory("components");
  return components.map((item) => ({
    slug: item.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getItemBySlug(slug);
  if (!item || item.category !== "components") {
    return { title: "Component Not Found | PRIME" };
  }
  return {
    title: `${item.name} Component | PRIME Design System`,
    description: item.description,
  };
}

async function ComponentDocContent({ params }: PageProps) {
  const { slug } = await params;
  const item = getItemBySlug(slug);

  if (!item || item.category !== "components") {
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
            category="components"
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

        {/* 1. Live Interactive Preview */}
        <PreviewRenderer slug={item.slug} />

        {/* 2. Detailed Description / Overview */}
        <section id="description" className="space-y-3 scroll-mt-20">
          <h2 className="text-lg font-bold text-white">Overview</h2>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {item.name} is built as a core interactive building block within PRIME. It
            strictly adheres to the Pure Black (#000000) canvas philosophy, using
            elevation borders and focused Pure Red (#FF0000) accents to indicate
            relevance, focus, and preparation progress.
          </p>
        </section>

        {/* 3. Anatomy Section */}
        {item.anatomy && item.anatomy.length > 0 && (
          <AnatomySection anatomy={item.anatomy} className="scroll-mt-20 space-y-3" />
        )}

        {/* 4. API / Attributes Reference Table */}
        {item.attributes && item.attributes.length > 0 && (
          <section id="attributes" className="space-y-3 scroll-mt-20">
            <h2 className="text-lg font-bold text-white">Component API</h2>
            <p className="text-xs text-[var(--text-secondary)]">
              TypeScript interfaces, attributes, and prop options.
            </p>
            <ApiTable properties={item.attributes} />
          </section>
        )}

        {/* 5. Accessibility & Keyboard Support */}
        <section id="accessibility" className="space-y-3 scroll-mt-20">
          <h2 className="text-lg font-bold text-white">Accessibility &amp; Keyboard</h2>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Fully compliant with WAI-ARIA authoring practices. Employs visible 2px Pure
            Red focus rings when navigating via keyboard (
            <code className="font-mono text-white">focus-visible:ring-2</code>) without
            distracting mouse users.
          </p>

          {item.keyboard && item.keyboard.length > 0 && (
            <div className="border border-[rgba(255,255,255,0.08)] rounded-[var(--radius-sm)] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#030303] border-b border-[rgba(255,255,255,0.08)] text-[var(--text-tertiary)] font-mono text-[10px] uppercase">
                  <tr>
                    <th className="p-2.5">Key</th>
                    <th className="p-2.5">Behavior</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(255,255,255,0.06)] font-mono text-[11px]">
                  {item.keyboard.map((k) => (
                    <tr key={k.key}>
                      <td className="p-2.5 text-white font-bold">{k.key}</td>
                      <td className="p-2.5 text-[var(--text-secondary)]">{k.behavior}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* 6. Usage Guidelines (DO / DON'T) */}
        {item.dodont && item.dodont.length > 0 && (
          <DoDontSection dodont={item.dodont} className="scroll-mt-20 space-y-3" />
        )}

        {/* 7. Reusable AI Agent Implementation Prompt */}
        <PromptSection
          prompt={item.aiPrompt}
          componentName={item.name}
          className="scroll-mt-20"
        />

        {/* 8. Prev / Next Navigation */}
        <DesignSystemPrevNext prev={prev} next={next} />
      </div>

      {/* Right Context Rail (Sticky TOC + Info Card) */}
      <DesignSystemContextRail item={item} />
    </div>
  );
}

export default function ComponentDocPage({ params }: PageProps) {
  return (
    <React.Suspense fallback={<DocPageSkeleton />}>
      <ComponentDocContent params={params} />
    </React.Suspense>
  );
}
