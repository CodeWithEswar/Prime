import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self)",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // unsafe-eval needed for Next.js dev and worker sandboxes
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "media-src 'self'",
      "font-src 'self' data:",
      "connect-src 'self' http://127.0.0.1:* https://*.supabase.co wss://*.supabase.co https://api.resend.com",
      "frame-src 'self' https://www.youtube-nocookie.com https://www.youtube.com https://*.youtube.com https://*.youtube-nocookie.com",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  distDir:
    process.env.PRIME_PLANNER_QA === "1"
      ? ".next-planner-qa"
      : process.env.PRIME_LAB_QA === "1"
      ? ".next-lab-qa"
      : process.env.PRIME_AI_QA === "1"
      ? ".next-ai-qa"
      : process.env.PRIME_WEATHER_QA === "1"
        ? ".next-weather-qa"
        : process.env.PRIME_PROBLEM_QA === "1"
          ? ".next-problem-qa"
          : process.env.PRIME_SHELL_QA === "1"
            ? ".next-shell-qa"
            : ".next",
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "yt3.ggpht.com",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
      {
        source: "/planner",
        destination: "/plan",
        permanent: false,
      },
      {
        source: "/progress",
        destination: "/analytics",
        permanent: false,
      },
      {
        source: "/app/dsa/sheets/striver-a2z",
        destination: "/practice/dsa/sheets/striver-a2z",
        permanent: false,
      },
      {
        source: "/app/dsa/playlists/kunal-kushwaha",
        destination: "/practice/dsa/playlists/kunal-kushwaha",
        permanent: false,
      },
      {
        source: "/app/dsa/playlists/kunal-kushwaha/analytics",
        destination: "/practice/dsa/playlists/kunal-kushwaha/analytics",
        permanent: false,
      },
      {
        source: "/practice/dsa/playlists/kunal-java-dsa/analytics",
        destination: "/practice/dsa/playlists/kunal-kushwaha/analytics",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/weather/video/:file*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, must-revalidate" },
        ],
      },
      {
        source: "/weather/posters/:file*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
