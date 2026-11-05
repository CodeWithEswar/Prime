"use client";

import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  SettingsField,
  SettingsHeading,
  SettingsSaveBar,
  SettingsSection,
  SettingsToggle,
  useSettingsEditor,
} from "./settings-primitives";
import { updateStudyCommitmentAction } from "../server/actions";
import type { StudyCommitment, WeekdayAvailabilityItem } from "../types";

const weekdays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
function duration(minutes: number) {
  if (!Number.isFinite(minutes)) return "—";
  return (
    Math.floor(minutes / 60) + "h" + (minutes % 60 ? " " + (minutes % 60) + "m" : "")
  );
}

export function StudySettingsForm({ study }: { study: StudyCommitment }) {
  const editor = useSettingsEditor(
    {
      dailyStudyMinutes: study.dailyStudyMinutes,
      availabilityRules: study.availabilityRules,
    },
    (value) =>
      updateStudyCommitmentAction({
        ...value,
        restDays: value.availabilityRules
          .filter((rule) => rule.isRestDay)
          .map((rule) => rule.dayOfWeek),
      })
  );
  const { form, setForm } = editor;
  const activeDays = form.availabilityRules.filter((rule) => !rule.isRestDay);
  const target = form.dailyStudyMinutes * activeDays.length;
  const available = activeDays.reduce((sum, rule) => sum + rule.availableMinutes, 0);
  const feasible = target <= available;
  function updateDay(day: number, patch: Partial<WeekdayAvailabilityItem>) {
    setForm({
      ...form,
      availabilityRules: form.availabilityRules.map((rule) =>
        rule.dayOfWeek === day ? { ...rule, ...patch } : rule
      ),
    });
  }

  return (
    <div className="space-y-5">
      <SettingsHeading
        title="Study schedule"
        description="Set a daily target and the time you have available each week."
      />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          editor.submit();
        }}
        className="space-y-4"
      >
        <fieldset disabled={editor.pending} className="min-w-0 space-y-4">
          <SettingsSection title="Study target">
            <div className="max-w-xs">
              <SettingsField
                id="study-daily-minutes"
                label="Daily study target"
                description="Minutes per active study day."
              >
                <Input
                  id="study-daily-minutes"
                  type="number"
                  min={15}
                  max={720}
                  step={15}
                  required
                  value={
                    Number.isNaN(form.dailyStudyMinutes) ? "" : form.dailyStudyMinutes
                  }
                  onChange={(event) =>
                    setForm({ ...form, dailyStudyMinutes: event.target.valueAsNumber })
                  }
                />
              </SettingsField>
            </div>
          </SettingsSection>
          <SettingsSection title="Weekly availability">
            <div className="divide-y divide-[var(--border-subtle)]">
              {[1, 2, 3, 4, 5, 6, 0].map((day) => {
                const rule = form.availabilityRules.find(
                  (rule) => rule.dayOfWeek === day
                );
                if (!rule) return null;
                return (
                  <div key={day} className="space-y-3 py-4 first:pt-0 last:pb-0">
                    <SettingsToggle
                      id={"study-day-" + day}
                      label={weekdays[day]}
                      description={rule.isRestDay ? "Rest day" : "Available for study"}
                      checked={!rule.isRestDay}
                      onChange={(checked) =>
                        updateDay(day, {
                          isRestDay: !checked,
                          availableMinutes: checked
                            ? rule.availableMinutes || form.dailyStudyMinutes
                            : rule.availableMinutes,
                        })
                      }
                    />
                    {!rule.isRestDay && (
                      <div className="grid min-w-0 grid-cols-2 gap-3 @min-[40rem]:grid-cols-3">
                        <div className="col-span-2 @min-[40rem]:col-span-1">
                          <SettingsField
                            id={"study-capacity-" + day}
                            label="Available minutes"
                          >
                            <Input
                              id={"study-capacity-" + day}
                              type="number"
                              min={0}
                              max={720}
                              required
                              value={
                                Number.isNaN(rule.availableMinutes)
                                  ? ""
                                  : rule.availableMinutes
                              }
                              onChange={(event) =>
                                updateDay(day, {
                                  availableMinutes: event.target.valueAsNumber,
                                })
                              }
                            />
                          </SettingsField>
                        </div>
                        <SettingsField id={"study-start-" + day} label="Start time">
                          <Input
                            id={"study-start-" + day}
                            type="time"
                            value={rule.preferredStartTime?.slice(0, 5) ?? ""}
                            onChange={(event) =>
                              updateDay(day, {
                                preferredStartTime: event.target.value
                                  ? event.target.value + ":00"
                                  : null,
                              })
                            }
                            className="min-w-0 max-w-full"
                          />
                        </SettingsField>
                        <SettingsField id={"study-end-" + day} label="End time">
                          <Input
                            id={"study-end-" + day}
                            type="time"
                            value={rule.preferredEndTime?.slice(0, 5) ?? ""}
                            onChange={(event) =>
                              updateDay(day, {
                                preferredEndTime: event.target.value
                                  ? event.target.value + ":00"
                                  : null,
                              })
                            }
                            className="min-w-0 max-w-full"
                          />
                        </SettingsField>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </SettingsSection>
          <SettingsSection title="Weekly capacity">
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-[var(--text-secondary)]">Study target</dt>
                <dd className="mt-1 font-medium tabular-nums">{duration(target)}</dd>
              </div>
              <div>
                <dt className="text-[var(--text-secondary)]">Available time</dt>
                <dd className="mt-1 font-medium tabular-nums">{duration(available)}</dd>
              </div>
            </dl>
            <Progress
              value={
                Number.isFinite(target) && Number.isFinite(available) && available > 0
                  ? Math.min(100, Math.round((target / available) * 100))
                  : 0
              }
              aria-label="Weekly capacity used by study target"
            />
            <p
              className={
                "text-xs leading-relaxed " +
                (feasible ? "text-[var(--text-secondary)]" : "text-[var(--accent)]")
              }
            >
              {feasible
                ? "Your study target fits within your availability."
                : "Your target exceeds your available time. Adjust your daily target or add availability."}
            </p>
          </SettingsSection>
        </fieldset>
        <SettingsSaveBar {...editor} onCancel={editor.cancel} />
      </form>
    </div>
  );
}
