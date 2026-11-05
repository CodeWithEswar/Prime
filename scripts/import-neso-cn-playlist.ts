/**
 * PRIME — Neso Academy Computer Networks Playlist Importer & Verification Pipeline
 *
 * Scans, verifies, and reconciles the 135-entry Neso Academy CN playlist
 * (PLBlnK6fEyqRgMCUAG0XRw78UA8qnv6jEx) and validates versioned manifests.
 */

import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

export const CourseVideoManifestEntrySchema = z.object({
  source: z.literal("neso-academy-cn"),
  playlistId: z.string(),
  playlistPosition: z.number().int().min(1).max(135),
  playlistItemId: z.string().nullable(),
  youtubeVideoId: z.string().nullable(),
  canonicalWatchUrl: z.string().nullable(),
  playlistContextUrl: z.string(),
  verifiedTitle: z.string().nullable(),
  durationSeconds: z.number().int().positive().nullable(),
  assignedStudyDay: z.number().int().min(1).max(12).nullable(),
  topicIds: z.array(z.string()),
  difficulty: z.enum(["easy", "medium", "hard"]).nullable(),
  interviewImportance: z.enum(["critical", "high", "medium", "low"]).nullable(),
  contentKind: z.enum(["full_lesson", "chapter_preview", "unknown"]),
  verificationStatus: z.enum(["verified", "unverified", "unavailable"]),
  verifiedAt: z.string().nullable(),
});

export type CourseVideoManifestEntry = z.infer<typeof CourseVideoManifestEntrySchema>;

export function loadCNManifest(): CourseVideoManifestEntry[] {
  const filePath = path.join(process.cwd(), "content", "cn", "neso-playlist-manifest.json");
  if (!fs.existsSync(filePath)) {
    throw new Error(`Manifest not found at ${filePath}`);
  }
  const content = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(content);
  return z.array(CourseVideoManifestEntrySchema).parse(parsed);
}

export function validateCNManifest(items: CourseVideoManifestEntry[]) {
  const errors: string[] = [];
  const seenPositions = new Set<number>();

  if (items.length !== 135) {
    errors.push(`Expected 135 manifest items, found ${items.length}`);
  }

  items.forEach((item, index) => {
    if (seenPositions.has(item.playlistPosition)) {
      errors.push(`Duplicate playlistPosition ${item.playlistPosition} at index ${index}`);
    }
    seenPositions.add(item.playlistPosition);

    if (item.playlistPosition < 1 || item.playlistPosition > 135) {
      errors.push(`Position out of bounds: ${item.playlistPosition}`);
    }

    if (item.playlistPosition >= 131 && item.playlistPosition <= 135) {
      if (item.contentKind !== "chapter_preview") {
        errors.push(`Entry ${item.playlistPosition} must have contentKind: 'chapter_preview'`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    totalItems: items.length,
    verifiedCount: items.filter((i) => i.verificationStatus === "verified").length,
    unverifiedCount: items.filter((i) => i.verificationStatus === "unverified").length,
    chapterPreviewCount: items.filter((i) => i.contentKind === "chapter_preview").length,
  };
}

if (process.env.NODE_ENV !== "test" && typeof require !== "undefined" && require.main === module) {
  const manifest = loadCNManifest();
  const res = validateCNManifest(manifest);
  console.log("CN Validation Result:", JSON.stringify(res, null, 2));
}

