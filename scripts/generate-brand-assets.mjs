import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Ensure directories exist
const dirs = [
  path.join(rootDir, "public/brand/mark"),
  path.join(rootDir, "public/brand/logo"),
  path.join(rootDir, "public/brand/icons"),
  path.join(rootDir, "public/branding"),
];

for (const dir of dirs) {
  fs.mkdirSync(dir, { recursive: true });
}

// 1. Canonical SVG Path Definitions
// Mark (24x24): Two interlocking ribbons forming progression stair, hidden P, and upward peak
const MARK_PATH_LOWER = "M3 23V14L10.5 9.2H13.5V12.8L7.5 15.2V22L3 23Z";
const MARK_PATH_UPPER = "M16.5 1L9 7H16.5V14.2L10.5 16.6V20.4L21 15V4.5L16.5 1Z";

// Wordmark PRIME (109x20): Geometric tracked uppercase
const WORDMARK_PATH =
  "M0.0 0.0L0.0 19.59L4.08 19.59L4.08 13.88L4.9 13.06L17.96 13.06L20.41 11.43L21.22 9.8L21.22 3.67L19.59 0.82L17.96 0.0ZM4.08 4.49L4.9 3.67L15.92 3.67L16.73 4.49L16.33 9.39L4.08 8.98Z M26.12 0.0L26.12 19.59L30.61 19.59L30.2 13.88L31.02 13.06L37.55 13.47L42.45 19.59L47.35 19.59L44.08 15.51L43.27 13.06L45.71 12.24L47.35 9.39L47.35 4.08L45.71 0.82L44.08 0.0ZM30.2 4.49L31.02 3.67L42.04 3.67L42.86 4.49L42.45 9.39L31.02 9.39L30.2 8.57Z M53.06 0.0L53.06 19.59L57.14 19.59L57.14 0.0Z M62.45 0.0L62.45 19.59L66.53 19.59L67.35 6.94L73.47 13.88L80.0 7.35L81.22 7.35L81.22 19.59L85.31 19.59L85.31 0.0L81.22 0.0L73.88 8.16L66.94 0.0Z M90.61 0.0L90.61 19.59L108.57 19.59L108.57 15.92L94.69 15.51L94.69 12.24L95.92 11.43L106.94 11.43L106.94 7.76L94.69 7.35L95.1 3.67L108.57 3.67L108.57 0.0Z";

function renderMarkSvg(color) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
  <path d="${MARK_PATH_LOWER}" fill="${color}" />
  <path d="${MARK_PATH_UPPER}" fill="${color}" />
</svg>`;
}

function renderLogoSvg(markColor, wordmarkColor) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 143 24" fill="none" aria-label="PRIME Logo">
  <g transform="translate(0, 0)">
    <path d="${MARK_PATH_LOWER}" fill="${markColor}" />
    <path d="${MARK_PATH_UPPER}" fill="${markColor}" />
  </g>
  <g transform="translate(34, 2)">
    <path d="${WORDMARK_PATH}" fill="${wordmarkColor}" fill-rule="evenodd" />
  </g>
</svg>`;
}

// 2. Write SVGs to public/brand/
const svgFiles = {
  "public/brand/mark/prime-mark-red.svg": renderMarkSvg("#FF0000"),
  "public/brand/mark/prime-mark-white.svg": renderMarkSvg("#FFFFFF"),
  "public/brand/mark/prime-mark-black.svg": renderMarkSvg("#000000"),
  "public/brand/mark/prime-mark-current.svg": renderMarkSvg("currentColor"),

  "public/brand/logo/prime-logo-dark.svg": renderLogoSvg("#FF0000", "#FFFFFF"),
  "public/brand/logo/prime-logo-light.svg": renderLogoSvg("#FF0000", "#000000"),
  "public/brand/logo/prime-logo-white.svg": renderLogoSvg("#FFFFFF", "#FFFFFF"),
  "public/brand/logo/prime-logo-black.svg": renderLogoSvg("#000000", "#000000"),
  "public/brand/logo/prime-logo-red.svg": renderLogoSvg("#FF0000", "#FF0000"),

  "public/brand/icons/favicon.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <rect width="32" height="32" rx="7" fill="#000000"/>
  <g transform="translate(4, 4)">
    <path d="${MARK_PATH_LOWER}" fill="#FF0000" />
    <path d="${MARK_PATH_UPPER}" fill="#FF0000" />
  </g>
</svg>`,

  "public/branding/logo.svg": renderLogoSvg("#FF0000", "#FFFFFF"),
};

for (const [relPath, content] of Object.entries(svgFiles)) {
  const fullPath = path.join(rootDir, relPath);
  fs.writeFileSync(fullPath, content.trim() + "\n", "utf8");
  console.log(`Wrote SVG: ${relPath}`);
}

// 3. Helper to create ICO from PNG buffer
function createIcoFromPng(pngBuffer) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // ICO format
  header.writeUInt16LE(1, 4); // 1 image

  const entry = Buffer.alloc(16);
  entry.writeUInt8(32, 0); // Width 32
  entry.writeUInt8(32, 1); // Height 32
  entry.writeUInt8(0, 2); // Color count
  entry.writeUInt8(0, 3); // Reserved
  entry.writeUInt16LE(1, 4); // Planes
  entry.writeUInt16LE(32, 6); // BPP
  entry.writeUInt32LE(pngBuffer.length, 8); // Image size in bytes
  entry.writeUInt32LE(22, 12); // Offset (6 + 16 = 22)

  return Buffer.concat([header, entry, pngBuffer]);
}

// 4. Generate Raster Assets using Headless Chromium
async function generateRasters() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // A. Favicons
  const faviconSizes = [16, 32, 48];
  for (const s of faviconSizes) {
    await page.setViewportSize({ width: s, height: s });
    const html = `<!DOCTYPE html><html><body style="margin:0;background:#000000;display:flex;align-items:center;justify-content:center;height:${s}px;overflow:hidden;">
      <svg viewBox="0 0 24 24" style="width:${Math.round(s * 0.75)}px;height:${Math.round(s * 0.75)}px;" fill="none">
        <path d="${MARK_PATH_LOWER}" fill="#FF0000" />
        <path d="${MARK_PATH_UPPER}" fill="#FF0000" />
      </svg>
    </body></html>`;
    await page.setContent(html);
    const dest = path.join(rootDir, `public/favicon-${s}.png`);
    await page.screenshot({ path: dest });
    console.log(`Generated: public/favicon-${s}.png`);

    if (s === 32) {
      const pngBuffer = fs.readFileSync(dest);
      const icoBuffer = createIcoFromPng(pngBuffer);
      fs.writeFileSync(path.join(rootDir, "public/favicon.ico"), icoBuffer);
      console.log("Generated: public/favicon.ico");
    }
  }

  // B. App Icons
  const appIcons = [
    { name: "apple-touch-icon.png", size: 180, radius: 0, markScale: 0.65 },
    { name: "icon-192.png", size: 192, radius: 0, markScale: 0.65 },
    { name: "icon-512.png", size: 512, radius: 0, markScale: 0.65 },
    { name: "icon-maskable-512.png", size: 512, radius: 0, markScale: 0.5 }, // 50% safe zone for Android
    { name: "app-icon-1024.png", size: 1024, radius: 0, markScale: 0.65 },
  ];

  for (const icon of appIcons) {
    const s = icon.size;
    await page.setViewportSize({ width: s, height: s });
    const markSize = Math.round(s * icon.markScale);
    const html = `<!DOCTYPE html><html><body style="margin:0;background:#000000;display:flex;align-items:center;justify-content:center;height:${s}px;overflow:hidden;">
      <svg viewBox="0 0 24 24" style="width:${markSize}px;height:${markSize}px;" fill="none">
        <path d="${MARK_PATH_LOWER}" fill="#FF0000" />
        <path d="${MARK_PATH_UPPER}" fill="#FF0000" />
      </svg>
    </body></html>`;
    await page.setContent(html);
    const dest = path.join(rootDir, `public/${icon.name}`);
    await page.screenshot({ path: dest });
    console.log(`Generated: public/${icon.name} (${s}x${s})`);
  }

  // C. Social Avatar Square (1080x1080)
  {
    const s = 1080;
    await page.setViewportSize({ width: s, height: s });
    const markSize = 640;
    const html = `<!DOCTYPE html><html><body style="margin:0;background:#000000;display:flex;align-items:center;justify-content:center;height:${s}px;overflow:hidden;">
      <div style="position:relative;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;width:400px;height:400px;background:radial-gradient(circle, rgba(255,0,0,0.25) 0%, transparent 70%);filter:blur(40px);"></div>
        <svg viewBox="0 0 24 24" style="width:${markSize}px;height:${markSize}px;position:relative;z-index:2;" fill="none">
          <path d="${MARK_PATH_LOWER}" fill="#FF0000" />
          <path d="${MARK_PATH_UPPER}" fill="#FF0000" />
        </svg>
      </div>
    </body></html>`;
    await page.setContent(html);
    await page.screenshot({ path: path.join(rootDir, "public/social-square.png") });
    console.log("Generated: public/social-square.png (1080x1080)");
  }

  // D. Transparent Email & Header Logo Fallbacks (PNG)
  {
    await page.setViewportSize({ width: 572, height: 96 });
    const htmlDark = `<!DOCTYPE html><html><body style="margin:0;background:transparent;display:flex;align-items:center;height:96px;padding:0 24px;overflow:hidden;">
      <svg viewBox="0 0 143 24" style="height:48px;" fill="none">
        <g transform="translate(0, 0)">
          <path d="${MARK_PATH_LOWER}" fill="#FF0000" />
          <path d="${MARK_PATH_UPPER}" fill="#FF0000" />
        </g>
        <g transform="translate(34, 2)">
          <path d="${WORDMARK_PATH}" fill="#FFFFFF" fill-rule="evenodd" />
        </g>
      </svg>
    </body></html>`;
    await page.setContent(htmlDark);
    await page.screenshot({
      path: path.join(rootDir, "public/brand/logo/prime-logo-dark.png"),
      omitBackground: true,
    });

    const htmlLight = `<!DOCTYPE html><html><body style="margin:0;background:transparent;display:flex;align-items:center;height:96px;padding:0 24px;overflow:hidden;">
      <svg viewBox="0 0 143 24" style="height:48px;" fill="none">
        <g transform="translate(0, 0)">
          <path d="${MARK_PATH_LOWER}" fill="#FF0000" />
          <path d="${MARK_PATH_UPPER}" fill="#FF0000" />
        </g>
        <g transform="translate(34, 2)">
          <path d="${WORDMARK_PATH}" fill="#000000" fill-rule="evenodd" />
        </g>
      </svg>
    </body></html>`;
    await page.setContent(htmlLight);
    await page.screenshot({
      path: path.join(rootDir, "public/brand/logo/prime-logo-light.png"),
      omitBackground: true,
    });
    console.log(
      "Generated: public/brand/logo/prime-logo-dark.png & prime-logo-light.png"
    );
  }

  // E. Social & Open Graph Assets (1200x630 & 1600x900)
  // Matching the brand board with mountain peak glowing path, lockup, subtitle, and tagline with red periods!
  const socialCards = [
    { file: "public/og-default.png", width: 1200, height: 630 },
    { file: "public/twitter-card.png", width: 1200, height: 630 },
    { file: "public/github-social-preview.png", width: 1600, height: 900 },
  ];

  for (const card of socialCards) {
    await page.setViewportSize({ width: card.width, height: card.height });
    const scale = card.width / 1200;
    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: ${card.width}px;
    height: ${card.height}px;
    background: #000000;
    color: #FFFFFF;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: ${80 * scale}px ${90 * scale}px;
  }
  
  /* Radial glow behind mountain */
  .bg-glow {
    position: absolute;
    right: 15%;
    top: 20%;
    width: ${500 * scale}px;
    height: ${500 * scale}px;
    background: radial-gradient(circle, rgba(255, 0, 0, 0.45) 0%, rgba(255, 0, 0, 0.1) 45%, transparent 70%);
    filter: blur(${60 * scale}px);
    pointer-events: none;
  }

  /* Grid overlay subtle texture */
  .grid-pattern {
    position: absolute;
    inset: 0;
    background-image: 
      linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: ${40 * scale}px ${40 * scale}px;
    mask-image: radial-gradient(circle at 75% 50%, black 20%, transparent 80%);
    pointer-events: none;
  }

  /* Mountain silhouette and glowing ascent vector */
  .mountain-container {
    position: absolute;
    right: 0;
    bottom: 0;
    width: ${650 * scale}px;
    height: ${550 * scale}px;
    pointer-events: none;
  }

  .content {
    position: relative;
    z-index: 10;
    max-width: ${720 * scale}px;
  }

  .logo-lockup {
    display: flex;
    align-items: center;
    gap: ${24 * scale}px;
    margin-bottom: ${24 * scale}px;
  }

  .logo-mark {
    width: ${88 * scale}px;
    height: ${88 * scale}px;
  }

  .wordmark-svg {
    height: ${46 * scale}px;
  }

  .expansion {
    font-size: ${16 * scale}px;
    font-weight: 600;
    letter-spacing: 0.18em;
    color: rgba(255, 255, 255, 0.7);
    text-transform: uppercase;
    margin-left: ${112 * scale}px;
    line-height: 1.5;
    max-width: ${520 * scale}px;
  }

  .tagline-bar {
    position: relative;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: ${36 * scale}px;
    font-size: ${22 * scale}px;
    font-weight: 500;
    letter-spacing: 0.04em;
    color: #FFFFFF;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
    padding-top: ${28 * scale}px;
  }

  .tagline-word span {
    color: #FF0000;
    font-weight: 700;
  }

  .readiness-badge {
    position: absolute;
    top: ${80 * scale}px;
    right: ${90 * scale}px;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: ${8 * scale}px;
    padding: ${8 * scale}px ${16 * scale}px;
    border-radius: 9999px;
    border: 1px solid rgba(255, 0, 0, 0.4);
    background: rgba(10, 0, 0, 0.8);
    backdrop-filter: blur(8px);
    font-size: ${13 * scale}px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #FFFFFF;
  }

  .status-dot {
    width: ${8 * scale}px;
    height: ${8 * scale}px;
    border-radius: 50%;
    background: #FF0000;
    box-shadow: 0 0 10px #FF0000;
  }
</style>
</head>
<body>
  <div class="bg-glow"></div>
  <div class="grid-pattern"></div>

  <div class="readiness-badge">
    <div class="status-dot"></div>
    Interview Readiness System
  </div>

  <svg class="mountain-container" viewBox="0 0 650 550" fill="none">
    <!-- Mountain Dark Silhouette -->
    <path d="M120 550L380 180L450 280L540 140L650 320V550H120Z" fill="#040404" />
    <path d="M220 550L380 180L420 230L340 550H220Z" fill="#080808" />
    
    <!-- Glowing Red Ascent Path to the Peak -->
    <path d="M0 550C80 520 180 490 260 410C320 350 350 260 380 180" stroke="#FF0000" stroke-width="${4 * scale}" stroke-linecap="round" filter="drop-shadow(0 0 12px #FF0000)" />
    <path d="M0 550C80 520 180 490 260 410C320 350 350 260 380 180" stroke="#FFFFFF" stroke-width="${1.5 * scale}" stroke-linecap="round" />
    
    <!-- Peak Starlight / Arrow Beacon -->
    <circle cx="380" cy="180" r="${6 * scale}" fill="#FFFFFF" filter="drop-shadow(0 0 16px #FF0000)" />
    <line x1="380" y1="140" x2="380" y2="220" stroke="#FF0000" stroke-width="${2 * scale}" filter="drop-shadow(0 0 8px #FF0000)" />
    <line x1="340" y1="180" x2="420" y2="180" stroke="#FF0000" stroke-width="${2 * scale}" filter="drop-shadow(0 0 8px #FF0000)" />
    
    <!-- Giant Ascent Arrow Motif (Matches board) -->
    <g transform="translate(480, 40) scale(1.6)" opacity="0.9">
      <path d="${MARK_PATH_UPPER}" fill="#FF0000" filter="drop-shadow(0 0 20px rgba(255,0,0,0.6))" />
    </g>
  </svg>

  <div class="content">
    <div class="logo-lockup">
      <svg class="logo-mark" viewBox="0 0 24 24" fill="none">
        <path d="${MARK_PATH_LOWER}" fill="#FF0000" />
        <path d="${MARK_PATH_UPPER}" fill="#FF0000" />
      </svg>
      <svg class="wordmark-svg" viewBox="0 0 109 20" fill="none">
        <path d="${WORDMARK_PATH}" fill="#FFFFFF" fill-rule="evenodd" />
      </svg>
    </div>
    <div class="expansion">
      Preparation Roadmap for Interviews, Mastery & Excellence
    </div>
  </div>

  <div class="tagline-bar">
    <div class="tagline-word">Plan<span>.</span></div>
    <div class="tagline-word">Practice<span>.</span></div>
    <div class="tagline-word">Revise<span>.</span></div>
    <div class="tagline-word">Master<span>.</span></div>
  </div>
</body>
</html>`;

    await page.setContent(html);
    await page.screenshot({ path: path.join(rootDir, card.file) });
    console.log(`Generated: ${card.file} (${card.width}x${card.height})`);
  }

  await browser.close();
  console.log("Finished generating all brand assets successfully!");
}

generateRasters().catch((err) => {
  console.error("Error generating rasters:", err);
  process.exit(1);
});
