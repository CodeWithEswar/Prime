import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProviders } from "@/components/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://prime.prep"),
  title: {
    default: "PRIME — Preparation Roadmap for Interviews, Mastery & Excellence",
    template: "%s | PRIME",
  },
  description:
    "Personal interview-preparation operating system engineered for structured roadmaps, spaced repetition, DSA practice tracking, revision scheduling, and mastery.",
  applicationName: "PRIME",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/brand/icons/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [
      { rel: "mask-icon", url: "/brand/mark/prime-mark-red.svg", color: "#FF0000" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "PRIME",
    title: "PRIME — Preparation Roadmap for Interviews, Mastery & Excellence",
    description:
      "Personal interview-preparation operating system engineered for structured roadmaps, spaced repetition, DSA practice tracking, revision scheduling, and mastery.",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "PRIME — Preparation Roadmap for Interviews, Mastery & Excellence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PRIME — Preparation Roadmap for Interviews, Mastery & Excellence",
    description:
      "Personal interview-preparation operating system engineered for structured roadmaps, spaced repetition, and interview readiness.",
    images: ["/twitter-card.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} dark`}
      suppressHydrationWarning
    >
      <body className="bg-[var(--background)] text-[var(--foreground)] antialiased min-h-screen">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
