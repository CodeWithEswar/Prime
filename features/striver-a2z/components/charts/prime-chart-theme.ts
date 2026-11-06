export const primeChartColors = {
  // Brand
  primary: "#FF0000",
  primaryGradientStart: "rgba(255, 0, 0, 0.45)",
  primaryGradientEnd: "rgba(255, 0, 0, 0.0)",

  // Semantics
  easy: "#10B981", // Emerald
  medium: "#F59E0B", // Amber
  hard: "#EF4444", // Rose
  video: "#FF0000", // Red
  practice: "#10B981", // Emerald
  revision: "#F59E0B", // Amber

  // Multi-series accents
  cyan: "#06B6D4",
  purple: "#8B5CF6",
  blue: "#3B82F6",

  // Surfaces & Grids
  grid: "rgba(255, 255, 255, 0.07)",
  tickText: "#737373",
  cursorLine: "rgba(255, 255, 255, 0.2)",
  barCursorBg: "rgba(0, 0, 0, 0.45)",
  cardBg: "#0A0A0A",
  cardBorder: "rgba(255, 255, 255, 0.08)",
  tooltipBg: "#0E0E0E",
  tooltipBorder: "rgba(255, 255, 255, 0.12)",
} as const;

export const primeChartFont = {
  familyMono: "var(--font-mono), monospace",
  familySans: "var(--font-sans), sans-serif",
  sizeXs: 10,
  sizeSm: 11,
  sizeMd: 12,
} as const;

