"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Copy01Icon,
  Tick02Icon,
  CheckmarkCircle02Icon,
  CancelCircleIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PrimeLogo,
  PrimeMark,
  PRIME_MARK_PATH_LOWER,
  PRIME_MARK_PATH_UPPER,
  PRIME_WORDMARK_PATH,
  type PrimeLogoSize,
  type PrimeLogoVariant,
  type PrimeLogoOrientation,
} from "@/components/branding";

export function BrandingPlayground() {
  const [size, setSize] = React.useState<PrimeLogoSize>("lg");
  const [variant, setVariant] = React.useState<PrimeLogoVariant>("brand");
  const [orientation, setOrientation] =
    React.useState<PrimeLogoOrientation>("horizontal");
  const [withExpansion, setWithExpansion] = React.useState(true);
  const [withTagline, setWithTagline] = React.useState(true);
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, label: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const rawMarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width="24" height="24">
  <path d="${PRIME_MARK_PATH_LOWER}" fill="#FF0000" />
  <path d="${PRIME_MARK_PATH_UPPER}" fill="#FF0000" />
</svg>`;

  const rawLogoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 143 24" fill="none" width="143" height="24">
  <g transform="translate(0, 0)">
    <path d="${PRIME_MARK_PATH_LOWER}" fill="#FF0000" />
    <path d="${PRIME_MARK_PATH_UPPER}" fill="#FF0000" />
  </g>
  <g transform="translate(34, 2)">
    <path d="${PRIME_WORDMARK_PATH}" fill="#FFFFFF" fill-rule="evenodd" />
  </g>
</svg>`;

  const isLight = variant === "light" || variant === "black";

  return (
    <div className="space-y-12 w-full text-left">
      {/* 1. Core Meaning & Geometry Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-white tracking-wide">
              Brand Concept &amp; Architectural Geometry
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              The PRIME mark represents structured progression — from preparation through
              a clear roadmap to mastery and reaching the prime state.
            </p>
          </div>
          <Badge
            variant="outline"
            className="font-mono text-[11px] border-prime-red/40 text-prime-red"
          >
            PURE BLACK × PURE RED × WHITE
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.08)] bg-[#030303] space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-prime-red uppercase tracking-wider font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-prime-red" />
              1. Upward Path
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Ascending lower ribbon symbolizing relentless forward momentum, day-wise
              preparation discipline, and incremental mastery.
            </p>
          </div>

          <div className="p-4 rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.08)] bg-[#030303] space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-white uppercase tracking-wider font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              2. Structured Steps
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Interlocking geometric stair-steps representing structured curriculum
              roadmaps, DSA milestones, and spaced repetition phases.
            </p>
          </div>

          <div className="p-4 rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.08)] bg-[#030303] space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-white uppercase tracking-wider font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              3. Hidden &apos;P&apos;
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Negative space inner counter naturally subtends the clean silhouette of the
              letter <span className="text-white font-bold">P</span> for PRIME without
              forced ornament.
            </p>
          </div>

          <div className="p-4 rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.08)] bg-[#030303] space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-prime-red uppercase tracking-wider font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-prime-red" />
              4. The Prime Peak
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Terminal upward-right arrowhead symbolizing summit attainment, interview
              readiness, and arriving at the pinnacle state of excellence.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Interactive Logo Workbench */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-white tracking-wide">
              Interactive Component Lockup Workbench
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Test size, orientation, typography extensions, and color variants with live
              feedback.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(rawMarkSvg, "Mark SVG", "mark-svg")}
              className="gap-1.5 font-mono text-[11px] h-7 px-2.5"
            >
              <Icon icon={copiedKey === "mark-svg" ? Tick02Icon : Copy01Icon} size={12} />
              Copy Mark SVG
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(rawLogoSvg, "Logo Lockup SVG", "logo-svg")}
              className="gap-1.5 font-mono text-[11px] h-7 px-2.5"
            >
              <Icon icon={copiedKey === "logo-svg" ? Tick02Icon : Copy01Icon} size={12} />
              Copy Logo SVG
            </Button>
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-4 p-3 rounded-[var(--radius-sm)] bg-[#060606] border border-[rgba(255,255,255,0.08)]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[var(--text-secondary)]">Size:</span>
            {(["sm", "md", "lg", "xl"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`px-2 py-1 text-xs font-mono rounded ${
                  size === s
                    ? "bg-white text-black font-bold"
                    : "bg-[#090909] text-white/60 hover:text-white"
                }`}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-white/10" />

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[var(--text-secondary)]">
              Orientation:
            </span>
            {(["horizontal", "stacked"] as const).map((o) => (
              <button
                key={o}
                onClick={() => setOrientation(o)}
                className={`px-2 py-1 text-xs font-mono rounded capitalize ${
                  orientation === o
                    ? "bg-white text-black font-bold"
                    : "bg-[#090909] text-white/60 hover:text-white"
                }`}
              >
                {o}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-white/10" />

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[var(--text-secondary)]">
              Variant:
            </span>
            {(["brand", "light", "white", "black", "red"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setVariant(v)}
                className={`px-2 py-1 text-xs font-mono rounded capitalize ${
                  variant === v
                    ? "bg-white text-black font-bold"
                    : "bg-[#090909] text-white/60 hover:text-white"
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-white/10" />

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs font-mono text-white/80 cursor-pointer">
              <input
                type="checkbox"
                checked={withExpansion}
                onChange={(e) => setWithExpansion(e.target.checked)}
                className="rounded accent-prime-red"
              />
              Expansion
            </label>
            <label className="flex items-center gap-1.5 text-xs font-mono text-white/80 cursor-pointer">
              <input
                type="checkbox"
                checked={withTagline}
                onChange={(e) => setWithTagline(e.target.checked)}
                className="rounded accent-prime-red"
              />
              Tagline
            </label>
          </div>
        </div>

        {/* Live Preview Stage */}
        <div
          className={`p-10 rounded-[var(--radius-md)] border flex items-center justify-center min-h-[220px] transition-colors duration-200 ${
            isLight
              ? "bg-[#FFFFFF] border-black/10 text-black shadow-lg"
              : "bg-[#000000] border-[rgba(255,255,255,0.12)] text-white shadow-2xl"
          }`}
        >
          <PrimeLogo
            size={size}
            variant={variant}
            orientation={orientation}
            withExpansion={withExpansion}
            withTagline={withTagline}
          />
        </div>
      </div>

      {/* 3. Scale & Sharpness Inspection Matrix */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-white tracking-wide">
            Scale &amp; Raster Sharpness Matrix
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Verified crisp legibility from 16px micro-favicons up to 64px display headers
            with 0 subpixel blurring.
          </p>
        </div>

        <div className="p-6 rounded-[var(--radius-sm)] bg-[#030303] border border-[rgba(255,255,255,0.08)]">
          <div className="flex flex-wrap items-end justify-around gap-8">
            {[16, 20, 24, 32, 48, 64].map((s) => (
              <div key={s} className="flex flex-col items-center gap-3">
                <div className="p-3 rounded bg-black border border-white/10 flex items-center justify-center">
                  <PrimeMark size={s} variant="brand" />
                </div>
                <div className="text-center">
                  <span className="font-mono text-xs text-white font-bold">{s}px</span>
                  <p className="font-mono text-[10px] text-white/40">
                    {s === 16
                      ? "Favicon"
                      : s === 20
                        ? "Header"
                        : s === 24
                          ? "Default"
                          : s === 32
                            ? "App Icon"
                            : "Display"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Production Asset Inventory & File Mapping */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-white tracking-wide">
            Generated Production Brand Assets
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Every SVG and deterministic raster asset is compiled directly into the root
            directory.
          </p>
        </div>

        <div className="rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.08)] overflow-hidden">
          <div className="overflow-x-auto prime-scrollbar">
            <table className="w-full text-xs font-mono text-left">
              <thead className="bg-[#060606] text-white/60 uppercase text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="p-3">File Path</th>
                  <th className="p-3">Format</th>
                  <th className="p-3">Dimensions</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-[#000000]">
                {[
                  {
                    path: "/brand/mark/prime-mark-red.svg",
                    format: "SVG",
                    size: "24×24",
                    role: "Canonical Brand Mark",
                    status: "Active",
                  },
                  {
                    path: "/brand/logo/prime-logo-dark.svg",
                    format: "SVG",
                    size: "143×24",
                    role: "Primary Horizontal Lockup",
                    status: "Active",
                  },
                  {
                    path: "/brand/logo/prime-logo-light.svg",
                    format: "SVG",
                    size: "143×24",
                    role: "Light Theme Lockup",
                    status: "Active",
                  },
                  {
                    path: "/brand/icons/favicon.svg",
                    format: "SVG",
                    size: "32×32",
                    role: "Scalable Browser Favicon",
                    status: "Active",
                  },
                  {
                    path: "/favicon-16.png",
                    format: "PNG",
                    size: "16×16",
                    role: "Browser Tab Favicon",
                    status: "Active",
                  },
                  {
                    path: "/favicon-32.png",
                    format: "PNG",
                    size: "32×32",
                    role: "High-DPI Browser Favicon",
                    status: "Active",
                  },
                  {
                    path: "/favicon.ico",
                    format: "ICO",
                    size: "32×32",
                    role: "Multi-Resolution Favicon",
                    status: "Active",
                  },
                  {
                    path: "/apple-touch-icon.png",
                    format: "PNG",
                    size: "180×180",
                    role: "iOS Home Screen Icon",
                    status: "Active",
                  },
                  {
                    path: "/icon-192.png",
                    format: "PNG",
                    size: "192×192",
                    role: "PWA Standard App Icon",
                    status: "Active",
                  },
                  {
                    path: "/icon-512.png",
                    format: "PNG",
                    size: "512×512",
                    role: "PWA Splash Screen Icon",
                    status: "Active",
                  },
                  {
                    path: "/icon-maskable-512.png",
                    format: "PNG",
                    size: "512×512",
                    role: "PWA Android Maskable Icon",
                    status: "Active",
                  },
                  {
                    path: "/app-icon-1024.png",
                    format: "PNG",
                    size: "1024×1024",
                    role: "Master App Store Icon",
                    status: "Active",
                  },
                  {
                    path: "/social-square.png",
                    format: "PNG",
                    size: "1080×1080",
                    role: "Social Avatar & Community",
                    status: "Active",
                  },
                  {
                    path: "/og-default.png",
                    format: "PNG",
                    size: "1200×630",
                    role: "Open Graph Social Preview",
                    status: "Active",
                  },
                  {
                    path: "/twitter-card.png",
                    format: "PNG",
                    size: "1200×630",
                    role: "Twitter / X Large Image Card",
                    status: "Active",
                  },
                  {
                    path: "/github-social-preview.png",
                    format: "PNG",
                    size: "1600×900",
                    role: "GitHub Repository Preview",
                    status: "Active",
                  },
                ].map((item) => (
                  <tr key={item.path} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3 text-white font-medium">{item.path}</td>
                    <td className="p-3 text-white/60">{item.format}</td>
                    <td className="p-3 text-white/60">{item.size}</td>
                    <td className="p-3 text-[var(--text-secondary)]">{item.role}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#22c55e]">
                        <Icon icon={CheckmarkCircle02Icon} size={13} />
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 5. Brand Do's & Don'ts */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-white tracking-wide">
          Brand Integrity Guidelines
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-[var(--radius-sm)] border border-[#22c55e]/20 bg-[#22c55e]/[0.02] space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#22c55e]">
              <Icon icon={CheckmarkCircle02Icon} size={16} />
              Approved Usage
            </div>
            <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
              <li className="flex items-start gap-2">
                <span className="text-[#22c55e] font-bold">✓</span>
                Use the canonical pure red{" "}
                <span className="font-mono text-white">#FF0000</span> against pure black{" "}
                <span className="font-mono text-white">#000000</span>.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#22c55e] font-bold">✓</span>
                Keep the precise interlocking ribbon coordinates to preserve the hidden
                &apos;P&apos;.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#22c55e] font-bold">✓</span>
                Style the periods in &apos;Plan. Practice. Revise. Master.&apos; with pure
                red.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#22c55e] font-bold">✓</span>
                Consume the centralized{" "}
                <span className="font-mono text-white">&lt;PrimeLogo /&gt;</span> React
                component.
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-[var(--radius-sm)] border border-[#ff0000]/20 bg-[#ff0000]/[0.02] space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#ff0000]">
              <Icon icon={CancelCircleIcon} size={16} />
              Prohibited Usage
            </div>
            <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
              <li className="flex items-start gap-2">
                <span className="text-[#ff0000] font-bold">✕</span>
                Do NOT substitute Pure Black with washed charcoal, zinc, or slate
                palettes.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#ff0000] font-bold">✕</span>
                Do NOT substitute Pure Red with burgundy, muted crimson, or pink-red.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#ff0000] font-bold">✕</span>
                Do NOT add drop shadow halos, 3D chrome, or gradient fills inside the
                vector mark.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#ff0000] font-bold">✕</span>
                Do NOT distort, rotate, stretch, or alter the ribbon thickness or angles.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
