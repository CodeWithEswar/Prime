"use client";

import {
  SettingsField,
  SettingsHeading,
  SettingsSaveBar,
  SettingsSection,
  SettingsSelect,
  useSettingsEditor,
} from "./settings-primitives";
import { updateAppearancePreferencesAction } from "../server/actions";
import type { AppearancePreferences } from "../types";

export function AppearanceSettingsForm({
  preferences,
}: {
  preferences: AppearancePreferences;
}) {
  const editor = useSettingsEditor(preferences, updateAppearancePreferencesAction);
  const { form, setForm } = editor;
  return (
    <div className="space-y-5">
      <SettingsHeading
        title="Appearance"
        description="Adjust display and accessibility preferences."
      />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          editor.submit();
        }}
        className="space-y-4"
      >
        <fieldset disabled={editor.pending} className="min-w-0 space-y-4">
          <SettingsSection title="Display">
            <div className="flex items-center gap-3">
              <div
                aria-hidden="true"
                className="flex h-10 w-14 items-end gap-1 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-black p-2"
              >
                <span className="h-5 w-1 bg-[var(--accent)]" />
                <span className="h-3 flex-1 rounded-sm bg-white/80" />
              </div>
              <div>
                <p className="text-sm font-medium">Dark</p>
                <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                  Black surfaces with PRIME red accents.
                </p>
              </div>
            </div>
            <div className="grid min-w-0 gap-4 @min-[36rem]:grid-cols-2">
              <SettingsField id="appearance-density" label="Interface density">
                <SettingsSelect
                  id="appearance-density"
                  value={form.uiDensity}
                  onChange={(uiDensity) => setForm({ ...form, uiDensity })}
                  options={[
                    ["comfortable", "Comfortable"],
                    ["compact", "Compact"],
                  ]}
                />
              </SettingsField>
              <SettingsField id="appearance-font" label="Text size">
                <SettingsSelect
                  id="appearance-font"
                  value={form.fontScaling}
                  onChange={(fontScaling) => setForm({ ...form, fontScaling })}
                  options={[
                    ["normal", "Standard"],
                    ["large", "Larger"],
                  ]}
                />
              </SettingsField>
            </div>
          </SettingsSection>
          <SettingsSection title="Motion">
            <SettingsField id="appearance-motion" label="Animation preference">
              <SettingsSelect
                id="appearance-motion"
                value={form.motionPreference}
                onChange={(motionPreference) => setForm({ ...form, motionPreference })}
                options={[
                  ["system", "Use device setting"],
                  ["reduced", "Reduced motion"],
                  ["standard", "Standard motion"],
                ]}
              />
            </SettingsField>
          </SettingsSection>
        </fieldset>
        <SettingsSaveBar {...editor} onCancel={editor.cancel} />
      </form>
    </div>
  );
}
