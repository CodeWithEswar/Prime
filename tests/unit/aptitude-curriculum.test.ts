import { describe, expect, it } from "vitest";
import manifest from "@/content/aptitude/aptitude-curriculum-manifest.json";
import raw from "@/content/aptitude/raw-curriculum.json";
import catalog from "@/content/aptitude/video-catalog.json";
import rejected from "@/content/aptitude/rejected-video-sources.json";
import audioAudit from "@/content/aptitude/audio-language-audit.json";
import { classifyAudioLanguage } from "@/scripts/aptitude/audio-policy.mjs";
import { getAptitudeTopicVideos } from "@/domain/aptitude/videos";
import type { AptitudeDay } from "@/domain/aptitude/types";

const days = manifest.days as AptitudeDay[];
const topics = days.flatMap((day) => day.topics);
describe("aptitude curriculum source integrity", () => {
  it("preserves all 132 supplied concepts and their day order", () => {
    expect(days).toHaveLength(40);
    expect(topics.map((t) => t.id)).toEqual(
      raw.flatMap((d) => d.topics.map((t) => t.topic_id))
    );
    expect(new Set(topics.map((t) => t.id)).size).toBe(132);
  });
  it("publishes only source-checked English lessons, including alternatives", () => {
    for (const topic of topics) {
      const videos = getAptitudeTopicVideos(topic);
      expect(videos).toHaveLength([topic.primaryVideo, topic.backupVideo].filter(Boolean).length);
      expect(topic.hasVideo).toBe(videos.length > 0);
      if (!videos.length) expect(topic.videoStatusReason).toMatch(/English/);
      for (const video of videos) {
        const source = catalog[video.videoId as keyof typeof catalog];
        expect(source.sourceCheck.status, topic.id).toBe(200);
        expect(video.title).toBe(source.title);
        expect(video.channelTitle).toBe(source.channelTitle);
        expect(video.canonicalUrl).toBe(
          "https://www.youtube.com/watch?v=" + video.videoId
        );
        expect(video.topicCoverageVerified).toBe(false);
        expect(video.spokenEnglishVerified).toBe(false);
        expect(video.audioLanguage).toBe("en");
        const evidence = audioAudit[video.videoId as keyof typeof audioAudit];
        expect(evidence.status, video.videoId).toBe("english");
        expect(video.audioLanguageCheck?.method).toBe(evidence.method);
        expect(video.audioLanguageCheck?.sourceUrl).toBe(evidence.sourceUrl);
        expect(video.reviewStatus).not.toBe("verified");
        expect(video.channelTitle).not.toBe("Curated Instructor");
      }
    }
  });
  it("withholds uncertain lessons and never falls back to foreign-language videos", () => {
    const withheld = topics.filter((topic) => !topic.hasVideo);
    expect(withheld.map((topic) => topic.id)).toEqual([
      "D18_T03",
      "D23_T01",
      "D24_T03",
      "D25_T03",
      "D26_T01",
      "D26_T02",
    ]);
    for (const topic of withheld) {
      expect(topic.primaryVideo).toBeNull();
      expect(topic.backupVideo).toBeNull();
    }
    const base = topics[0].primaryVideo!;
    const fixture = { ...topics[0], backupVideo: null };
    expect(
      getAptitudeTopicVideos({
        ...fixture,
        primaryVideo: { ...base, audioLanguageCheck: undefined },
      })
    ).toEqual([]);
    expect(
      getAptitudeTopicVideos({
        ...fixture,
        primaryVideo: { ...base, audioLanguage: undefined },
      })
    ).toEqual([]);
    expect(
      getAptitudeTopicVideos({
        ...fixture,
        primaryVideo: { ...base, availability: "restricted" },
      })
    ).toEqual([]);
  });
  it("does not accept English auto-dubs or conflicting English labels", () => {
    expect(
      classifyAudioLanguage(
        [
          { language: "hi", isAutoDubbed: false },
          { language: "en", isAutoDubbed: true },
        ],
        ["hi"]
      ).status
    ).toBe("non_english");
    expect(classifyAudioLanguage([{ language: "en" }], ["hi"])).toEqual({
      status: "non_english",
      method: "conflicting-audio-and-speech-language",
    });
    expect(classifyAudioLanguage([], [])).toEqual({ status: "unverified", method: null });
    expect(classifyAudioLanguage([], ["en", "hi"]).status).toBe("unverified");
    expect(classifyAudioLanguage([], ["en"]).status).toBe("english");
    expect(classifyAudioLanguage([{ language: "en-US" }], ["en", "fr"]).status).toBe(
      "english"
    );
  });
  it("replaces known wrong-topic and missing mappings", () => {
    const topic = (id: string) => topics.find((t) => t.id === id)!;
    expect(topic("D08_T03").primaryVideo?.title).toMatch(/growth.*decay/i);
    expect(topic("D15_T01").primaryVideo?.title).toMatch(/geometry.*triangle/i);
    expect(topic("D20_T02").primaryVideo?.title).toMatch(/ranking.*ordering/i);
    expect(topic("D17_T03").primaryVideo?.title).toMatch(/alpha.?numeric/i);
    expect(topic("D23_T03").primaryVideo?.title).toMatch(/grouping/i);
    expect(topic("D28_T03").primaryVideo?.title).toMatch(/modifiers/i);
    expect(topic("D31_T02").primaryVideo?.title).toMatch(/sentence jumbles/i);
    expect(topic("D35_T03").primaryVideo?.title).toMatch(/stacked bar/i);
    expect(topic("D36_T01").primaryVideo?.title).toMatch(/line graph/i);
    expect(topic("D37_T02").primaryVideo?.title).toMatch(/pie chart/i);
    const selectedIds = topics.flatMap((t) =>
      getAptitudeTopicVideos(t).map((v) => v.videoId)
    );
    for (const video of rejected) expect(selectedIds).not.toContain(video.videoId);
  });
});
