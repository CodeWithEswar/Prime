"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SettingsField,
  SettingsHeading,
  SettingsSaveBar,
  SettingsSection,
  SettingsSelect,
  SettingsToggle,
  useSettingsEditor,
} from "@/features/settings/components/settings-primitives";
import { useNotificationPreferences } from "../hooks/use-notification-preferences";
import type { NotificationPreferencesInput } from "@/domain/notifications/schemas";

const timezones = [
  "UTC",
  "Asia/Kolkata",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];
const weekdays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const reminderFields = [
  ["revisionEmailEnabled", "Revision reminders"],
  ["sessionEmailEnabled", "Upcoming study sessions"],
  ["assessmentEmailEnabled", "Upcoming assessments"],
  ["aptitudeReminderEnabled", "Aptitude practice"],
  ["missedTaskEmailEnabled", "Incomplete tasks"],
] as const;

export function NotificationPreferencesForm() {
  const { preferences, isLoading, isError, retry, updatePreferences } =
    useNotificationPreferences();
  if (isLoading)
    return (
      <div
        className="space-y-4"
        role="status"
        aria-label="Loading notification preferences"
      >
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  if (isError || !preferences)
    return (
      <SettingsSection title="Notifications unavailable">
        <p className="text-sm text-[var(--text-secondary)]">
          Your preferences could not be loaded.
        </p>
        <Button variant="outline" onClick={() => void retry()}>
          Try again
        </Button>
      </SettingsSection>
    );
  const {
    timezone,
    inAppEnabled,
    emailEnabled,
    revisionEmailEnabled,
    sessionEmailEnabled,
    assessmentEmailEnabled,
    missedTaskEmailEnabled,
    aptitudeReminderEnabled,
    dailyDigestEnabled,
    weeklyReportEnabled,
    sessionLeadTimeMinutes,
    dailyDigestLocalTime,
    weeklyReportDay,
    weeklyReportLocalTime,
    quietHoursEnabled,
    quietHoursStart,
    quietHoursEnd,
  } = preferences;

  return (
    <PreferencesEditor
      initial={{
        timezone,
        inAppEnabled,
        emailEnabled,
        revisionEmailEnabled,
        sessionEmailEnabled,
        assessmentEmailEnabled,
        missedTaskEmailEnabled,
        aptitudeReminderEnabled,
        dailyDigestEnabled,
        weeklyReportEnabled,
        sessionLeadTimeMinutes,
        dailyDigestLocalTime,
        weeklyReportDay,
        weeklyReportLocalTime,
        quietHoursEnabled,
        quietHoursStart,
        quietHoursEnd,
      }}
      save={async (value) => {
        await updatePreferences(value);
        return { ok: true };
      }}
    />
  );
}

function PreferencesEditor({
  initial,
  save,
}: {
  initial: NotificationPreferencesInput;
  save: (value: NotificationPreferencesInput) => Promise<{ ok: true }>;
}) {
  const editor = useSettingsEditor(initial, save);
  const { form, setForm } = editor;
  const zones = [...new Set([form.timezone, ...timezones])];
  return (
    <div className="space-y-5">
      <SettingsHeading
        title="Notifications"
        description="Choose the reminders you receive and when they arrive."
      />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          editor.submit();
        }}
        className="space-y-4"
      >
        <fieldset disabled={editor.pending} className="min-w-0 space-y-4">
          <SettingsSection title="Delivery">
            <SettingsToggle
              id="notifications-in-app"
              label="In-app notifications"
              checked={form.inAppEnabled}
              onChange={(inAppEnabled) => setForm({ ...form, inAppEnabled })}
            />
            <SettingsToggle
              id="notifications-email"
              label="Email reminders"
              checked={form.emailEnabled}
              onChange={(emailEnabled) => setForm({ ...form, emailEnabled })}
            />
          </SettingsSection>
          <SettingsSection title="Reminders">
            <div className="space-y-4">
              {reminderFields.map(([key, label]) => (
                <SettingsToggle
                  key={key}
                  id={"notifications-" + key}
                  label={label}
                  checked={form[key]}
                  disabled={!form.emailEnabled}
                  onChange={(checked) => setForm({ ...form, [key]: checked })}
                />
              ))}
            </div>
            <SettingsField id="notifications-lead" label="Session reminder timing">
              <SettingsSelect
                id="notifications-lead"
                value={String(form.sessionLeadTimeMinutes)}
                onChange={(value) =>
                  setForm({
                    ...form,
                    sessionLeadTimeMinutes: Number(
                      value
                    ) as NotificationPreferencesInput["sessionLeadTimeMinutes"],
                  })
                }
                disabled={!form.emailEnabled || !form.sessionEmailEnabled}
                options={([5, 10, 15, 30, 60] as const).map(
                  (value) => [String(value), value + " minutes before"] as const
                )}
              />
            </SettingsField>
          </SettingsSection>
          <SettingsSection title="Digests">
            <SettingsToggle
              id="notifications-daily"
              label="Daily digest"
              checked={form.dailyDigestEnabled}
              disabled={!form.emailEnabled}
              onChange={(dailyDigestEnabled) => setForm({ ...form, dailyDigestEnabled })}
            />
            {form.dailyDigestEnabled && (
              <SettingsField id="notifications-daily-time" label="Daily delivery time">
                <Input
                  id="notifications-daily-time"
                  type="time"
                  required
                  disabled={!form.emailEnabled}
                  value={form.dailyDigestLocalTime.slice(0, 5)}
                  onChange={(event) =>
                    setForm({ ...form, dailyDigestLocalTime: event.target.value })
                  }
                  className="max-w-xs"
                />
              </SettingsField>
            )}
            <div className="border-t border-[var(--border-subtle)] pt-4">
              <SettingsToggle
                id="notifications-weekly"
                label="Weekly progress report"
                checked={form.weeklyReportEnabled}
                disabled={!form.emailEnabled}
                onChange={(weeklyReportEnabled) =>
                  setForm({ ...form, weeklyReportEnabled })
                }
              />
            </div>
            {form.weeklyReportEnabled && (
              <div className="grid min-w-0 grid-cols-1 gap-4 @min-[36rem]:grid-cols-2">
                <SettingsField id="notifications-weekly-day" label="Delivery day">
                  <SettingsSelect
                    id="notifications-weekly-day"
                    value={String(form.weeklyReportDay)}
                    disabled={!form.emailEnabled}
                    onChange={(value) =>
                      setForm({ ...form, weeklyReportDay: Number(value) })
                    }
                    options={weekdays.map((day, index) => [String(index), day] as const)}
                  />
                </SettingsField>
                <SettingsField id="notifications-weekly-time" label="Delivery time">
                  <Input
                    id="notifications-weekly-time"
                    type="time"
                    required
                    disabled={!form.emailEnabled}
                    value={form.weeklyReportLocalTime.slice(0, 5)}
                    onChange={(event) =>
                      setForm({ ...form, weeklyReportLocalTime: event.target.value })
                    }
                  />
                </SettingsField>
              </div>
            )}
          </SettingsSection>
          <SettingsSection title="Timezone and quiet hours">
            <SettingsField id="notifications-timezone" label="Timezone">
              <SettingsSelect
                id="notifications-timezone"
                value={form.timezone}
                options={zones.map((zone) => [zone, zone.replaceAll("_", " ")] as const)}
                onChange={(timezone) => setForm({ ...form, timezone })}
              />
            </SettingsField>
            <SettingsToggle
              id="notifications-quiet"
              label="Quiet hours"
              description="Pause non-critical notifications during these hours."
              checked={form.quietHoursEnabled}
              onChange={(quietHoursEnabled) => setForm({ ...form, quietHoursEnabled })}
            />
            {form.quietHoursEnabled && (
              <div className="grid min-w-0 grid-cols-2 gap-3">
                <SettingsField id="notifications-quiet-start" label="From">
                  <Input
                    id="notifications-quiet-start"
                    type="time"
                    required
                    value={form.quietHoursStart.slice(0, 5)}
                    onChange={(event) =>
                      setForm({ ...form, quietHoursStart: event.target.value })
                    }
                    className="min-w-0"
                  />
                </SettingsField>
                <SettingsField id="notifications-quiet-end" label="Until">
                  <Input
                    id="notifications-quiet-end"
                    type="time"
                    required
                    value={form.quietHoursEnd.slice(0, 5)}
                    onChange={(event) =>
                      setForm({ ...form, quietHoursEnd: event.target.value })
                    }
                    className="min-w-0"
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
