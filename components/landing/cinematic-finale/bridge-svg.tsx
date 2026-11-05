"use client";

import { BridgeLights } from "./bridge-lights";

/**
 * Original SVG illustration of a powerful metallic bridge at night with dense foggy backlight.
 * Strong perspective geometry leading directly toward the illuminated PRIME apex.
 */
export function BridgeSvg() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full select-none pointer-events-none"
      aria-hidden="true"
    >
      <defs>
        {/* Deep Night Atmospheric Sky */}
        <linearGradient id="bridgeSkyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#000000" />
          <stop offset="35%" stopColor="#020000" />
          <stop offset="55%" stopColor="#080202" />
          <stop offset="80%" stopColor="#030000" />
          <stop offset="100%" stopColor="#000000" />
        </linearGradient>

        {/* Dense Foggy Backlight radiating from the distant vanishing point */}
        <radialGradient id="denseFoggyBacklight" cx="50%" cy="46%" r="50%">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.22)" />
          <stop offset="18%" stopColor="rgba(255, 0, 0, 0.45)" />
          <stop offset="42%" stopColor="rgba(160, 0, 0, 0.22)" />
          <stop offset="70%" stopColor="rgba(30, 0, 0, 0.08)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>

        {/* Wet Metallic Deck Surface */}
        <linearGradient id="deckSurfaceGrad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#020202" />
          <stop offset="35%" stopColor="#070606" />
          <stop offset="75%" stopColor="#100707" />
          <stop offset="100%" stopColor="#080202" />
        </linearGradient>

        {/* Centerline Red Wet Mirror Reflection from distant monument */}
        <linearGradient id="centerDeckReflection" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.4)" />
          <stop offset="15%" stopColor="rgba(255, 0, 0, 0.5)" />
          <stop offset="45%" stopColor="rgba(255, 0, 0, 0.25)" />
          <stop offset="80%" stopColor="rgba(255, 30, 30, 0.08)" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>

        {/* Left Metallic Truss Gradient */}
        <linearGradient id="leftTrussMetal" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#070707" />
          <stop offset="60%" stopColor="#121212" />
          <stop offset="100%" stopColor="#1A1A1A" />
        </linearGradient>

        {/* Right Metallic Truss Gradient */}
        <linearGradient id="rightTrussMetal" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#070707" />
          <stop offset="60%" stopColor="#121212" />
          <stop offset="100%" stopColor="#1A1A1A" />
        </linearGradient>

        {/* Metallic Rim Lighting Glint */}
        <linearGradient id="rimGlint" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.35)" />
          <stop offset="50%" stopColor="rgba(255, 60, 60, 0.3)" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>

      {/* 1. Deep Black Sky */}
      <rect width="1200" height="800" fill="url(#bridgeSkyGrad)" />

      {/* 2. Massive Atmospheric Foggy Backlight */}
      <rect x="0" y="50" width="1200" height="550" fill="url(#denseFoggyBacklight)" />

      {/* 3. Distant Suspension Towers & Horizon Silhouette */}
      <g className="distant-horizon-towers" fill="#050505" stroke="#0E0E0E" strokeWidth="0.8">
        {/* Left Horizon Tower */}
        <path d="M 465 360 L 492 140 L 506 140 L 490 360 Z" />
        {/* Right Horizon Tower */}
        <path d="M 735 360 L 708 140 L 694 140 L 710 360 Z" />
        {/* Upper Cross Strut between Horizon Towers */}
        <rect x="495" y="175" width="210" height="8" fill="#080808" />
        {/* Distant industrial silhouettes on horizon */}
        <path d="M 0 360 L 150 360 L 170 338 L 220 338 L 235 352 L 320 352 L 340 330 L 410 330 L 425 360 Z" />
        <path d="M 775 360 L 790 330 L 860 330 L 880 352 L 965 352 L 980 338 L 1030 338 L 1050 360 L 1200 360 Z" />
      </g>

      {/* 4. The Powerful Metallic Overhead Truss Superstructure */}
      {/* Heavy Industrial Arches, Vertical Posts, and Criss-Crossing X Bracing */}
      <g className="metallic-superstructure">
        {/* Overhead Transverse Portal Arches (Connecting Left & Right sides) */}
        {/* Portal 1: Mid-Foreground Arch */}
        <path
          d="M 230 310 Q 600 160 970 310 L 970 330 Q 600 180 230 330 Z"
          fill="#080808"
          stroke="rgba(255, 255, 255, 0.18)"
          strokeWidth="1"
        />
        {/* Portal 2: Mid-Ground Arch */}
        <path
          d="M 360 240 Q 600 145 840 240 L 840 256 Q 600 161 360 256 Z"
          fill="#070707"
          stroke="rgba(255, 255, 255, 0.14)"
          strokeWidth="0.8"
        />
        {/* Portal 3: Deep Horizon Portal Arch (Framing the Logo) */}
        <path
          d="M 480 190 Q 600 140 720 190 L 720 202 Q 600 152 480 202 Z"
          fill="#060606"
          stroke="rgba(255, 50, 50, 0.3)"
          strokeWidth="0.8"
        />

        {/* Overhead Diagonal Sway Lattice Braces (X-bracing across top canopy) */}
        <g stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1">
          <line x1="230" y1="310" x2="600" y2="145" />
          <line x1="970" y1="310" x2="600" y2="145" />
          <line x1="360" y1="240" x2="600" y2="140" />
          <line x1="840" y1="240" x2="600" y2="140" />
        </g>

        {/* LEFT Powerful Metallic Truss Arch & Columns */}
        <g className="left-truss-system">
          {/* Main Arched Upper Chord */}
          <path
            d="M 50 800 Q 280 220 560 360 L 550 360 Q 270 235 40 800 Z"
            fill="url(#leftTrussMetal)"
          />
          {/* Metallic Top Edge Highlight catching foggy backlight */}
          <path
            d="M 50 800 Q 280 220 560 360"
            stroke="url(#rimGlint)"
            strokeWidth="1.8"
            fill="none"
          />

          {/* Heavy Vertical Posts along perspective */}
          <g stroke="rgba(255, 255, 255, 0.15)" strokeWidth="2" fill="#0A0A0A">
            {/* Post 1: Foreground */}
            <path d="M 120 760 L 140 500 L 150 500 L 130 760 Z" />
            {/* Post 2: Mid-Foreground */}
            <path d="M 230 650 L 255 405 L 263 405 L 238 650 Z" />
            {/* Post 3: Mid-Ground */}
            <path d="M 345 550 L 370 330 L 376 330 L 351 550 Z" />
            {/* Post 4: Mid-Distance */}
            <path d="M 445 460 L 465 270 L 470 270 L 450 460 Z" />
            {/* Post 5: Horizon Entry */}
            <path d="M 520 395 L 535 240 L 538 240 L 523 395 Z" />
          </g>

          {/* Diagonal Structural X-Lattice Girder Panels */}
          <g stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1.2">
            <line x1="120" y1="760" x2="255" y2="405" />
            <line x1="140" y1="500" x2="230" y2="650" />
            <line x1="230" y1="650" x2="370" y2="330" />
            <line x1="255" y1="405" x2="345" y2="550" />
            <line x1="345" y1="550" x2="465" y2="270" />
            <line x1="370" y1="330" x2="445" y2="460" />
            <line x1="445" y1="460" x2="535" y2="240" />
            <line x1="465" y1="270" x2="520" y2="395" />
          </g>
        </g>

        {/* RIGHT Powerful Metallic Truss Arch & Columns */}
        <g className="right-truss-system">
          {/* Main Arched Upper Chord */}
          <path
            d="M 1150 800 Q 920 220 640 360 L 650 360 Q 930 235 1160 800 Z"
            fill="url(#rightTrussMetal)"
          />
          {/* Metallic Top Edge Highlight catching foggy backlight */}
          <path
            d="M 1150 800 Q 920 220 640 360"
            stroke="url(#rimGlint)"
            strokeWidth="1.8"
            fill="none"
          />

          {/* Heavy Vertical Posts along perspective */}
          <g stroke="rgba(255, 255, 255, 0.15)" strokeWidth="2" fill="#0A0A0A">
            {/* Post 1: Foreground */}
            <path d="M 1080 760 L 1060 500 L 1050 500 L 1070 760 Z" />
            {/* Post 2: Mid-Foreground */}
            <path d="M 970 650 L 945 405 L 937 405 L 962 650 Z" />
            {/* Post 3: Mid-Ground */}
            <path d="M 855 550 L 830 330 L 824 330 L 849 550 Z" />
            {/* Post 4: Mid-Distance */}
            <path d="M 755 460 L 735 270 L 730 270 L 750 460 Z" />
            {/* Post 5: Horizon Entry */}
            <path d="M 680 395 L 665 240 L 662 240 L 677 395 Z" />
          </g>

          {/* Diagonal Structural X-Lattice Girder Panels */}
          <g stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1.2">
            <line x1="1080" y1="760" x2="945" y2="405" />
            <line x1="1060" y1="500" x2="970" y2="650" />
            <line x1="970" y1="650" x2="830" y2="330" />
            <line x1="945" y1="405" x2="855" y2="550" />
            <line x1="855" y1="550" x2="735" y2="270" />
            <line x1="830" y1="330" x2="755" y2="460" />
            <line x1="755" y1="460" x2="665" y2="240" />
            <line x1="735" y1="270" x2="680" y2="395" />
          </g>
        </g>
      </g>

      {/* 5. The Grounded Bridge Deck Stretching into Distance */}
      <g className="bridge-deck-assembly">
        {/* Main asphalt and metallic roadbed */}
        <polygon points="140,800 560,360 640,360 1060,800" fill="url(#deckSurfaceGrad)" />

        {/* Centerline wet reflection strip reflecting the distant PRIME apex */}
        <polygon
          points="580,360 620,360 700,800 500,800"
          fill="url(#centerDeckReflection)"
          style={{ mixBlendMode: "screen" }}
        />

        {/* Center dashed perspective lane marker */}
        <g stroke="rgba(255, 255, 255, 0.15)" strokeLinecap="round">
          <line x1="600" y1="780" x2="600" y2="705" strokeWidth="3" />
          <line x1="600" y1="675" x2="600" y2="618" strokeWidth="2.4" />
          <line x1="600" y1="592" x2="600" y2="548" strokeWidth="1.9" />
          <line x1="600" y1="528" x2="600" y2="492" strokeWidth="1.5" />
          <line x1="600" y1="475" x2="600" y2="446" strokeWidth="1.2" />
          <line x1="600" y1="432" x2="600" y2="410" strokeWidth="0.9" />
          <line x1="600" y1="398" x2="600" y2="380" strokeWidth="0.7" />
          <line x1="600" y1="372" x2="600" y2="362" strokeWidth="0.5" />
        </g>

        {/* Perspective Steel Cross Expansion Joints across deck */}
        <g stroke="rgba(255, 255, 255, 0.06)" strokeWidth="1">
          <line x1="175" y1="765" x2="1025" y2="765" />
          <line x1="225" y1="700" x2="975" y2="700" />
          <line x1="278" y1="635" x2="922" y2="635" />
          <line x1="335" y1="575" x2="865" y2="575" />
          <line x1="392" y1="520" x2="808" y2="520" />
          <line x1="445" y1="470" x2="755" y2="470" />
          <line x1="492" y1="425" x2="708" y2="425" />
          <line x1="532" y1="388" x2="668" y2="388" />
        </g>

        {/* Left Safety Barrier / Curb Wall */}
        <polygon points="110,800 140,800 560,360 550,360" fill="#0C0C0C" />
        <line
          x1="110"
          y1="795"
          x2="550"
          y2="360"
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth="1.5"
        />

        {/* Right Safety Barrier / Curb Wall */}
        <polygon points="1090,800 1060,800 640,360 650,360" fill="#0C0C0C" />
        <line
          x1="1090"
          y1="795"
          x2="650"
          y2="360"
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth="1.5"
        />
      </g>

      {/* 6. Sequential Perspective Red Edge Runner Lights */}
      <BridgeLights />
    </svg>
  );
}
