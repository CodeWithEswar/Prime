"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SettingsField, SettingsHeading, SettingsSection } from "./settings-primitives";
import {
  createDataExportAction,
  clearNotificationInboxAction,
  resetLearningPreferencesAction,
  deleteAccountAction,
} from "../server/actions";

type Control = "inbox" | "learning" | "account";
const controlLabels = {
  inbox: "Clear notification inbox",
  learning: "Reset learning preferences",
  account: "Delete account",
};

export function PrivacySettingsView() {
  const router = useRouter();
  const [control, setControl] = useState<Control | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [dialogError, setDialogError] = useState("");

  async function exportData() {
    setExporting(true);
    setError("");
    setMessage("");
    try {
      const result = await createDataExportAction();
      if (!result.ok) throw new Error(result.error);
      const blob = new Blob([JSON.stringify(result.data.exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download =
        "prime-data-export-" + new Date().toISOString().slice(0, 10) + ".json";
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage("Your export is ready to download.");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Could not export your data. Try again."
      );
    } finally {
      setExporting(false);
    }
  }

  async function confirmAction() {
    if (!control || (control === "account" && confirmation !== "DELETE MY ACCOUNT"))
      return;
    setPending(true);
    setDialogError("");
    setMessage("");
    setError("");
    try {
      const result =
        control === "inbox"
          ? await clearNotificationInboxAction()
          : control === "learning"
            ? await resetLearningPreferencesAction()
            : await deleteAccountAction({ confirmationText: confirmation, reason });
      if (!result.ok) throw new Error(result.error);
      if (control === "account") {
        router.replace("/login?deleted=true");
        router.refresh();
        return;
      }
      setMessage(
        control === "inbox"
          ? "Notification inbox cleared."
          : "Learning preferences reset."
      );
      setControl(null);
      router.refresh();
    } catch (error) {
      setDialogError(
        error instanceof Error
          ? error.message
          : "Could not complete this action. Try again."
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-5">
      <SettingsHeading
        title="Privacy & data"
        description="Download your records and manage your account data."
      />
      <SettingsSection title="Data export">
        <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-[1_1_16rem]">
            <h4 className="text-sm font-medium">Download your data</h4>
            <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
              Download your profile, preferences, and available preparation records as
              JSON.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            loading={exporting}
            onClick={exportData}
          >
            Download export
          </Button>
        </div>
      </SettingsSection>
      <SettingsSection title="Data controls">
        <div className="divide-y divide-[var(--border-subtle)]">
          {(["inbox", "learning"] as const).map((key) => (
            <div
              key={key}
              className="flex min-w-0 flex-wrap items-start justify-between gap-3 py-4 first:pt-0 last:pb-0"
            >
              <div className="min-w-0 flex-[1_1_16rem]">
                <h4 className="text-sm font-medium">{controlLabels[key]}</h4>
                <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
                  {key === "inbox"
                    ? "Remove the notifications currently in your inbox."
                    : "Restore your learning preferences to their defaults."}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogError("");
                  setControl(key);
                }}
              >
                {key === "inbox" ? "Clear inbox" : "Reset preferences"}
              </Button>
            </div>
          ))}
        </div>
      </SettingsSection>
      <SettingsSection title="Delete account">
        <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
          <p className="min-w-0 flex-[1_1_16rem] text-xs leading-relaxed text-[var(--text-secondary)]">
            Permanently delete your account and associated preparation records. This
            action cannot be undone.
          </p>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              setConfirmation("");
              setReason("");
              setDialogError("");
              setControl("account");
            }}
          >
            Delete account
          </Button>
        </div>
      </SettingsSection>
      {error && (
        <p role="alert" className="text-sm text-[var(--accent)]">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="text-sm text-[var(--text-secondary)]">
          {message}
        </p>
      )}
      <AlertDialog
        open={Boolean(control)}
        onOpenChange={(open) => {
          if (!open && !pending) setControl(null);
        }}
      >
        <AlertDialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto p-4 sm:p-6">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {control ? controlLabels[control] + "?" : ""}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {control === "account"
                ? "Your account and associated records will be permanently deleted."
                : control === "inbox"
                  ? "All notifications in your inbox will be removed."
                  : "Your saved learning preferences will return to their default values."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {control === "account" && (
            <div className="space-y-3">
              <SettingsField
                id="delete-confirmation"
                label="Type DELETE MY ACCOUNT to confirm"
              >
                <Input
                  id="delete-confirmation"
                  value={confirmation}
                  autoComplete="off"
                  disabled={pending}
                  onChange={(event) => setConfirmation(event.target.value)}
                />
              </SettingsField>
              <SettingsField id="delete-reason" label="Reason for leaving (optional)">
                <Textarea
                  id="delete-reason"
                  maxLength={300}
                  value={reason}
                  disabled={pending}
                  onChange={(event) => setReason(event.target.value)}
                />
              </SettingsField>
            </div>
          )}
          {dialogError && (
            <p role="alert" className="text-sm text-[var(--accent)]">
              {dialogError}
            </p>
          )}
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <Button
              variant={control === "account" ? "destructive" : "primary"}
              loading={pending}
              disabled={control === "account" && confirmation !== "DELETE MY ACCOUNT"}
              onClick={confirmAction}
            >
              {control === "account" ? "Permanently delete account" : "Confirm"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
