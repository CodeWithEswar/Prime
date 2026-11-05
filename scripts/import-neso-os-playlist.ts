/**
 * PRIME — Neso Academy Operating Systems Playlist Importer & Verification Pipeline
 *
 * Scans, verifies, and reconciles the 77-entry Neso Academy OS playlist
 * (PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O) and generates versioned manifests.
 */

import fs from "node:fs";
import path from "node:path";

interface OSManifestItem {
  sourcePlaylistId: string;
  referencePosition: number;
  livePosition: number;
  youtubeVideoId: string | null;
  canonicalWatchUrl: string | null;
  title: string;
  channel: string;
  durationSeconds: number;
  estimatedMinutes: number;
  dayNumber: number;
  topicSlug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  importance: "Low" | "Medium" | "High" | "Critical";
  isChapterIntro: boolean;
  verificationStatus: "verified" | "unverified";
  verifiedAt: string | null;
  curriculumVersion: string;
  playlistUrl: string;
}

export function loadOSManifest(): OSManifestItem[] {
  const filePath = path.join(process.cwd(), "content", "os", "neso-video-manifest.json");
  if (!fs.existsSync(filePath)) {
    throw new Error(`Manifest not found at ${filePath}`);
  }
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content) as OSManifestItem[];
}

export function validateOSManifest(items: OSManifestItem[]) {
  const errors: string[] = [];
  const seenPositions = new Set<number>();

  if (items.length !== 77) {
    errors.push(`Expected 77 manifest items, found ${items.length}`);
  }

  items.forEach((item, index) => {
    if (seenPositions.has(item.referencePosition)) {
      errors.push(`Duplicate referencePosition ${item.referencePosition} at index ${index}`);
    }
    seenPositions.add(item.referencePosition);

    if (item.referencePosition < 1 || item.referencePosition > 77) {
      errors.push(`Position out of bounds: ${item.referencePosition}`);
    }

    if (item.dayNumber < 1 || item.dayNumber > 12) {
      errors.push(`Invalid day number: ${item.dayNumber} for item ${item.referencePosition}`);
    }

    if (item.referencePosition >= 72 && item.referencePosition <= 77) {
      if (!item.isChapterIntro) {
        errors.push(`Entry ${item.referencePosition} should be marked as isChapterIntro: true`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    totalItems: items.length,
    verifiedCount: items.filter((i) => i.verificationStatus === "verified").length,
    unverifiedCount: items.filter((i) => i.verificationStatus === "unverified").length,
  };
}

if (process.env.NODE_ENV !== "test" && typeof require !== "undefined" && require.main === module) {
  const manifest = loadOSManifest();
  const res = validateOSManifest(manifest);
  console.log("Validation Result:", JSON.stringify(res, null, 2));
}

