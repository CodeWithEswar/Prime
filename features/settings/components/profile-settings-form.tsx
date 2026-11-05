"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SettingsField,
  SettingsHeading,
  SettingsSaveBar,
  SettingsSection,
  useSettingsEditor,
} from "./settings-primitives";
import { updateProfileAction, requestEmailChangeAction } from "../server/actions";
import type { UserProfileExtended } from "../types";

export function ProfileSettingsForm({ profile }: { profile: UserProfileExtended }) {
  const initial = {
    displayName: profile.displayName ?? "",
    fullName: profile.fullName ?? "",
    institution: profile.institution ?? "",
    degree: profile.degree ?? "",
    specialization: profile.specialization ?? "",
    graduationYear: profile.graduationYear?.toString() ?? "",
    avatarUrl: profile.avatarUrl ?? "",
  };
  const editor = useSettingsEditor(initial, (value) =>
    updateProfileAction({
      ...value,
      graduationYear: value.graduationYear ? Number(value.graduationYear) : null,
      avatarUrl: value.avatarUrl || null,
    })
  );
  const { form, setForm } = editor;
  const [newEmail, setNewEmail] = useState("");
  const [emailState, setEmailState] = useState({
    pending: false,
    error: "",
    message: "",
  });
  const router = useRouter();

  async function changeEmail(event: React.FormEvent) {
    event.preventDefault();
    setEmailState({ pending: true, error: "", message: "" });
    try {
      const result = await requestEmailChangeAction({ newEmail: newEmail.trim() });
      if (!result.ok) throw new Error(result.error);
      setEmailState({
        pending: false,
        error: "",
        message: "Check your inbox to confirm the email change.",
      });
      setNewEmail("");
      router.refresh();
    } catch (error) {
      setEmailState({
        pending: false,
        error:
          error instanceof Error
            ? error.message
            : "Could not update your email. Try again.",
        message: "",
      });
    }
  }

  return (
    <div className="space-y-5">
      <SettingsHeading
        title="Profile"
        description="Your personal details and contact information."
      />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          editor.submit();
        }}
        className="space-y-4"
      >
        <fieldset disabled={editor.pending} className="min-w-0 space-y-4">
          <SettingsSection title="Personal details">
            <div className="flex flex-wrap items-center gap-3">
              <Avatar className="size-12">
                <AvatarImage src={form.avatarUrl || undefined} alt="" />
                <AvatarFallback>
                  {form.displayName.slice(0, 2).toUpperCase() || "P"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium [overflow-wrap:anywhere]">
                  {form.displayName || "Your profile"}
                </p>
                <p className="text-xs text-[var(--text-secondary)] [overflow-wrap:anywhere]">
                  {profile.email}
                </p>
              </div>
              {form.avatarUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setForm({ ...form, avatarUrl: "" })}
                >
                  Remove photo
                </Button>
              )}
            </div>
            <div className="grid min-w-0 gap-4 @min-[36rem]:grid-cols-2">
              <SettingsField id="profile-display-name" label="Display name">
                <Input
                  id="profile-display-name"
                  autoComplete="nickname"
                  required
                  maxLength={50}
                  value={form.displayName}
                  onChange={(event) =>
                    setForm({ ...form, displayName: event.target.value })
                  }
                />
              </SettingsField>
              <SettingsField id="profile-full-name" label="Full name">
                <Input
                  id="profile-full-name"
                  autoComplete="name"
                  maxLength={100}
                  value={form.fullName}
                  onChange={(event) => setForm({ ...form, fullName: event.target.value })}
                />
              </SettingsField>
            </div>
          </SettingsSection>
          <SettingsSection
            title="Education"
            description="Optional details about your background."
          >
            <div className="grid min-w-0 gap-4 @min-[36rem]:grid-cols-2">
              {(
                [
                  ["institution", "Institution"],
                  ["degree", "Degree"],
                  ["specialization", "Specialization"],
                ] as const
              ).map(([key, label]) => (
                <SettingsField key={key} id={"profile-" + key} label={label}>
                  <Input
                    id={"profile-" + key}
                    value={form[key]}
                    maxLength={key === "institution" ? 120 : 80}
                    onChange={(event) => setForm({ ...form, [key]: event.target.value })}
                  />
                </SettingsField>
              ))}
              <SettingsField id="profile-graduation" label="Graduation year">
                <Input
                  id="profile-graduation"
                  type="number"
                  min={1980}
                  max={2035}
                  value={form.graduationYear}
                  onChange={(event) =>
                    setForm({ ...form, graduationYear: event.target.value })
                  }
                />
              </SettingsField>
            </div>
          </SettingsSection>
        </fieldset>
        <SettingsSaveBar {...editor} onCancel={editor.cancel} />
      </form>

      <form onSubmit={changeEmail}>
        <SettingsSection
          title="Email address"
          description="Confirm the change through the verification email."
        >
          <p className="text-sm [overflow-wrap:anywhere]">{profile.email}</p>
          <SettingsField id="profile-new-email" label="New email address">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <Input
                id="profile-new-email"
                type="email"
                autoComplete="email"
                required
                value={newEmail}
                onChange={(event) => setNewEmail(event.target.value)}
                className="min-w-0 flex-[1_1_14rem]"
                disabled={emailState.pending}
              />
              <Button
                type="submit"
                variant="outline"
                loading={emailState.pending}
                disabled={!newEmail.trim() || newEmail.trim() === profile.email}
              >
                Send verification
              </Button>
            </div>
          </SettingsField>
          {emailState.error && (
            <p role="alert" className="text-sm text-[var(--accent)]">
              {emailState.error}
            </p>
          )}
          {emailState.message && (
            <p role="status" className="text-sm text-[var(--text-secondary)]">
              {emailState.message}
            </p>
          )}
        </SettingsSection>
      </form>
    </div>
  );
}
