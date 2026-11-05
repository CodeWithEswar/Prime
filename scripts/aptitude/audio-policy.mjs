/** Classify original speech only. English auto-dubs/translations are not evidence. */
export function classifyAudioLanguage(originalAudio, automaticCaptionLanguages) {
  const isEnglish = (language) => /^en(?:-|$)/i.test(language);
  const speech = [...new Set(automaticCaptionLanguages)];
  const original = originalAudio.filter((track) => !track.isAutoDubbed);
  if (speech.length === 1 && !isEnglish(speech[0])) {
    return {
      status: "non_english",
      method: original.some((track) => isEnglish(track.language))
        ? "conflicting-audio-and-speech-language"
        : "original-automatic-captions",
    };
  }
  if (original.length) {
    return {
      status: original.every((track) => isEnglish(track.language))
        ? "english"
        : "non_english",
      method: "original-audio-track",
    };
  }
  if (speech.length === 1 && isEnglish(speech[0])) {
    return { status: "english", method: "original-automatic-captions" };
  }
  return { status: "unverified", method: null };
}
