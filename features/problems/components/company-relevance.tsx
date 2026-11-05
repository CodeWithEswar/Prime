"use client";
import { useState } from "react";
import Image from "next/image";
import { Building03Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import logoRegistry from "../data/company-logos.json";
import { Button } from "@/components/ui/button";
import { companyRows, windowNames } from "../selectors/intelligence";
import type { CompanyWindow, ProblemCompanyContext } from "../types";
const logos: Record<string, { src: string; surface: string; wide?: boolean }> =
  logoRegistry;
export function CompanyIdentity({
  company,
}: {
  company: Pick<ProblemCompanyContext, "name" | "slug">;
}) {
  const [failed, setFailed] = useState(false);
  const logo = logos[company.slug];
  return (
    <span
      className="company-identity"
      data-surface={!failed ? logo?.surface : undefined}
      data-wide={logo?.wide}
      aria-hidden="true"
    >
      {logo && !failed ? (
        <Image
          src={logo.src}
          alt=""
          width={22}
          height={22}
          loading="lazy"
          unoptimized
          onError={() => setFailed(true)}
        />
      ) : (
        <Icon icon={Building03Icon} size={20} />
      )}
    </span>
  );
}
export function CompanyRelevance({
  companies,
  preferredCompany,
  preferredWindow,
}: {
  companies: ProblemCompanyContext[];
  preferredCompany?: string | null;
  preferredWindow?: string | null;
}) {
  const windows = (Object.keys(windowNames) as CompanyWindow[]).filter((w) =>
    companies.some((c) => c.windows.some((r) => r.window === w))
  );
  const [selected, setSelected] = useState<CompanyWindow>(
    windows.includes(preferredWindow as CompanyWindow)
      ? (preferredWindow as CompanyWindow)
      : windows.includes("all_time")
        ? "all_time"
        : windows[0]
  );
  const [expanded, setExpanded] = useState(false);
  if (!companies.length) return null;
  const rows = companyRows(companies, selected, preferredCompany),
    visible = expanded ? rows : rows.slice(0, 6);
  return (
    <div className="problem-company-section">
      <div className="problem-section-heading">
        <div>
          <span className="problem-eyebrow">Company relevance</span>
          <h3>Company connections</h3>
        </div>
        <div
          className="problem-window-switch"
          role="group"
          aria-label="Company source window"
        >
          {windows.map((window) => (
            <button
              key={window}
              type="button"
              aria-pressed={window === selected}
              onClick={() => {
                setSelected(window);
                setExpanded(false);
              }}
            >
              {windowNames[window]}
            </button>
          ))}
        </div>
      </div>
      <div className="problem-company-list">
        {visible.map(({ company, records }) => (
          <div
            className="problem-company-row"
            key={company.slug}
            data-context={company.slug === preferredCompany}
          >
            <CompanyIdentity company={company} />
            <div>
              <strong>{company.name}</strong>
              <span>
                {records.length === 1
                  ? (records[0].sourceName ?? "Source association")
                  : `${records.length} source records`}
              </span>
            </div>
            <div className="problem-company-value">
              {records.length === 1 && records[0].frequency !== null ? (
                <>
                  <strong>
                    {new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(
                      records[0].frequency
                    )}
                  </strong>
                  <small>Source frequency</small>
                </>
              ) : (
                <span>Associated</span>
              )}
            </div>
          </div>
        ))}
      </div>
      {rows.length > 6 && (
        <Button
          size="sm"
          variant="ghost"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
          className="w-full sm:w-auto h-11 sm:h-8 justify-center font-mono text-xs mt-3 border sm:border-0 border-[#1f1f1f] bg-[#080808] sm:bg-transparent"
        >
          {expanded ? "Show fewer companies" : `View all ${rows.length} companies`}
        </Button>
      )}
      <p className="problem-footnote">
        Source-provided relevance, not an interview probability. Time windows overlap and
        are not added.
      </p>
    </div>
  );
}
