import fs from "node:fs";
import { classifyAudioLanguage } from "./audio-policy.mjs";
const catalogPath = process.argv[2] ?? "content/aptitude/video-catalog.json";
const reportPath = process.argv[3] ?? "content/aptitude/audio-language-audit.json";
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const report = fs.existsSync(reportPath)
  ? JSON.parse(fs.readFileSync(reportPath, "utf8"))
  : {};
const entries = Object.entries(catalog).filter(
  ([id]) =>
    !process.argv.includes("--pending") ||
    !report[id] ||
    report[id].status === "unverified"
);
// Respect rate limits and preserve previous evidence on transient failures.
for (const [id, item] of entries) {
  const result = {
    videoId: id,
    title: item.title,
    channelTitle: item.channelTitle,
    sourceUrl: "https://www.youtube.com/watch?v=" + id,
    checkedAt: new Date().toISOString(),
    status: "unverified",
    method: null,
    originalAudio: [],
    automaticCaptionLanguages: [],
  };
  try {
    const response = await fetch(result.sourceUrl, {
      headers: {
        "user-agent": "Mozilla/5.0",
        "accept-language": "en-US,en;q=0.9",
        connection: "close",
      },
      signal: AbortSignal.timeout(18000),
    });
    if (response.status === 429 || new URL(response.url).pathname.startsWith("/sorry")) {
      console.error(
        "YouTube rate limit reached. Audit stopped; previous records preserved."
      );
      process.exitCode = 1;
      break;
    }
    if (!response.ok) throw new Error("HTTP " + response.status);
    const html = await response.text();
    const match = html.match(/var ytInitialPlayerResponse = (.*?);<\/script>/s);
    if (!match) throw new Error("No public player metadata");
    const player = JSON.parse(match[1]);
    const tracks = [
      ...new Map(
        (player.streamingData?.adaptiveFormats ?? [])
          .filter((f) => f.audioTrack)
          .map((f) => [f.audioTrack.id, f.audioTrack])
      ).values(),
    ];
    result.originalAudio = tracks
      .filter((t) => !t.isAutoDubbed)
      .map((t) => ({
        language: t.id.split(".")[0],
        name: t.displayName,
        default: !!t.audioIsDefault,
      }));
    result.automaticCaptionLanguages = [
      ...new Set(
        (player.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? [])
          .filter((t) => t.kind === "asr")
          .map((t) => t.languageCode)
      ),
    ];
    result.playability = player.playabilityStatus?.status ?? null;
    Object.assign(
      result,
      classifyAudioLanguage(result.originalAudio, result.automaticCaptionLanguages)
    );
    report[id] = result;
  } catch (error) {
    if (!report[id]) report[id] = { ...result, error: error.message };
    console.error(id + ": " + error.message);
    process.exitCode = 1;
  }
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n");
}
console.log(
  JSON.stringify(
    Object.fromEntries(
      ["english", "non_english", "unverified"].map((status) => [
        status,
        Object.values(report).filter((r) => r.status === status).length,
      ])
    )
  )
);
