import type { AptitudeTopic, AptitudeVideoItem } from "./types";

export const aptitudeVideoProgressKey = (topicId: string, videoId: string) =>
  topicId + ":" + videoId;

export function getAptitudeTopicVideos(topic: AptitudeTopic): AptitudeVideoItem[] {
  const seen = new Set<string>();
  return [topic.primaryVideo, topic.backupVideo].filter(
    (video): video is AptitudeVideoItem => {
      if (
        !video ||
        !/^[A-Za-z0-9_-]{11}$/.test(video.videoId) ||
        video.availability !== "available" ||
        video.audioLanguage !== "en" ||
        video.audioLanguageCheck?.status !== "english" ||
        !video.audioLanguageCheck.method ||
        !video.audioLanguageCheck.sourceUrl ||
        ["rejected", "unavailable", "missing_video"].includes(video.reviewStatus) ||
        seen.has(video.videoId)
      )
        return false;
      seen.add(video.videoId);
      return true;
    }
  );
}
