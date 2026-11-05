"use client";

import { Input } from "@/components/ui/input";
import {
  SettingsField,
  SettingsHeading,
  SettingsSaveBar,
  SettingsSection,
  SettingsSelect,
  SettingsToggle,
  useSettingsEditor,
} from "./settings-primitives";
import { updateLearningPreferencesAction } from "../server/actions";
import type { LearningPreferences } from "../types";

export function LearningSettingsForm({
  preferences,
}: {
  preferences: LearningPreferences;
}) {
  const editor = useSettingsEditor(preferences, updateLearningPreferencesAction);
  const { form, setForm } = editor;
  return (
    <div className="space-y-5">
      <SettingsHeading
        title="Learning preferences"
        description="Choose your practice and lesson preferences."
      />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          editor.submit();
        }}
        className="space-y-4"
      >
        <fieldset disabled={editor.pending} className="min-w-0 space-y-4">
          <SettingsSection title="Practice">
            <div className="grid min-w-0 gap-4 @min-[36rem]:grid-cols-2">
              <SettingsField id="learning-language" label="Programming language">
                <SettingsSelect
                  id="learning-language"
                  value={form.preferredLanguage}
                  onChange={(preferredLanguage) =>
                    setForm({ ...form, preferredLanguage })
                  }
                  options={[
                    ["java", "Java"],
                    ["python", "Python"],
                    ["cpp", "C++"],
                    ["javascript", "JavaScript"],
                    ["typescript", "TypeScript"],
                  ]}
                />
              </SettingsField>
              <SettingsField id="learning-difficulty" label="Difficulty">
                <SettingsSelect
                  id="learning-difficulty"
                  value={form.difficultyLevel}
                  onChange={(difficultyLevel) => setForm({ ...form, difficultyLevel })}
                  options={[
                    ["beginner", "Beginner"],
                    ["intermediate", "Intermediate"],
                    ["advanced", "Advanced"],
                    ["adaptive", "Adaptive"],
                  ]}
                />
              </SettingsField>
              <SettingsField id="learning-pace" label="Learning pace">
                <SettingsSelect
                  id="learning-pace"
                  value={form.learningPace}
                  onChange={(learningPace) => setForm({ ...form, learningPace })}
                  options={[
                    ["relaxed", "Relaxed"],
                    ["standard", "Standard"],
                    ["accelerated", "Accelerated"],
                    ["intensive", "Intensive"],
                  ]}
                />
              </SettingsField>
              <SettingsField id="learning-session" label="Default session length">
                <SettingsSelect
                  id="learning-session"
                  value={String(form.defaultSessionMinutes)}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      defaultSessionMinutes: Number(
                        value
                      ) as LearningPreferences["defaultSessionMinutes"],
                    })
                  }
                  options={[
                    ["30", "30 minutes"],
                    ["45", "45 minutes"],
                    ["60", "1 hour"],
                    ["90", "1 hour 30 minutes"],
                    ["120", "2 hours"],
                  ]}
                />
              </SettingsField>
            </div>
          </SettingsSection>
          <SettingsSection title="Lessons and revision">
            <div className="grid min-w-0 gap-4 @min-[36rem]:grid-cols-2">
              <SettingsField id="learning-player" label="Open videos in">
                <SettingsSelect
                  id="learning-player"
                  value={form.videoPlayerMode}
                  onChange={(videoPlayerMode) => setForm({ ...form, videoPlayerMode })}
                  options={[
                    ["embedded", "PRIME player"],
                    ["youtube", "YouTube"],
                  ]}
                />
              </SettingsField>
              <SettingsField id="learning-instruction" label="Instructional language">
                <SettingsSelect
                  id="learning-instruction"
                  value={form.instructionalLanguage}
                  onChange={(instructionalLanguage) =>
                    setForm({ ...form, instructionalLanguage })
                  }
                  options={[
                    ["english", "English"],
                    ["hindi", "Hindi"],
                    ["bilingual", "Bilingual"],
                    ...(!["english", "hindi", "bilingual"].includes(
                      form.instructionalLanguage
                    )
                      ? [
                          [
                            form.instructionalLanguage,
                            form.instructionalLanguage,
                          ] as const,
                        ]
                      : []),
                  ]}
                />
              </SettingsField>
              <SettingsField id="learning-revision" label="Revision preference">
                <SettingsSelect
                  id="learning-revision"
                  value={form.revisionMode}
                  onChange={(revisionMode) => setForm({ ...form, revisionMode })}
                  options={[
                    ["adaptive", "Adaptive"],
                    ["spaced_standard", "Spaced repetition"],
                    ["manual", "Manual"],
                  ]}
                />
              </SettingsField>
            </div>
            <SettingsToggle
              id="learning-supplementary"
              label="Show supplementary lessons"
              checked={form.showSupplementaryLessons}
              onChange={(showSupplementaryLessons) =>
                setForm({ ...form, showSupplementaryLessons })
              }
            />
          </SettingsSection>
          <SettingsSection title="Aptitude and reasoning">
            <SettingsToggle
              id="learning-aptitude"
              label="Include aptitude practice"
              checked={form.enableAptitudeModule ?? true}
              onChange={(enableAptitudeModule) =>
                setForm({ ...form, enableAptitudeModule })
              }
            />
            {(form.enableAptitudeModule ?? true) && (
              <div className="grid min-w-0 gap-4 @min-[36rem]:grid-cols-2">
                <SettingsField id="learning-track" label="Track focus">
                  <SettingsSelect
                    id="learning-track"
                    value={form.aptitudeTrackFocus ?? "comprehensive"}
                    onChange={(aptitudeTrackFocus) =>
                      setForm({ ...form, aptitudeTrackFocus })
                    }
                    options={[
                      ["comprehensive", "All tracks"],
                      ["campus_nqt", "Campus and TCS NQT"],
                      ["quant_only", "Quantitative and data interpretation"],
                      ["logical_verbal", "Logical and verbal"],
                    ]}
                  />
                </SettingsField>
                <SettingsField
                  id="learning-aptitude-minutes"
                  label="Daily target in minutes"
                >
                  <Input
                    id="learning-aptitude-minutes"
                    type="number"
                    min={15}
                    max={180}
                    value={form.aptitudeDailyTargetMinutes ?? 30}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        aptitudeDailyTargetMinutes: event.target.valueAsNumber,
                      })
                    }
                  />
                </SettingsField>
              </div>
            )}
          </SettingsSection>
        </fieldset>
        <SettingsSaveBar {...editor} onCancel={editor.cancel} />
      </form>
    </div>
  );
}
