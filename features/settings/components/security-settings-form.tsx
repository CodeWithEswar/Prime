"use client";

import { useState, useTransition } from "react";
import { unstable_rethrow } from "next/navigation";
import { Logout01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { SettingsHeading, SettingsSection } from "./settings-primitives";
import { signOutAction } from "@/components/shell/actions";
import type { AccountSecuritySummary } from "../types";

export function SecuritySettingsForm({ security }: { security: AccountSecuritySummary }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function signOut() {
    setError("");
    startTransition(async () => {
      try {
        await signOutAction();
      } catch (error) {
        unstable_rethrow(error);
        setError("Could not sign out. Try again.");
      }
    });
  }

  return (
    <div className="space-y-5">
      <SettingsHeading
        title="Account & security"
        description="Manage how you sign in and access your account."
      />
      <SettingsSection title="Account details">
        <dl className="grid min-w-0 gap-5 text-sm @min-[36rem]:grid-cols-2">
          <div className="min-w-0">
            <dt className="text-xs text-[var(--text-secondary)]">Email address</dt>
            <dd className="mt-1 [overflow-wrap:anywhere]">
              {security.email || "No email address"}
            </dd>
            <dd className="mt-1 text-xs text-[var(--text-secondary)]">
              {security.emailConfirmed ? "Verified" : "Verification pending"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--text-secondary)]">Sign-in methods</dt>
            <dd className="mt-1 capitalize">
              {security.providers.join(", ") || "No linked providers"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--text-secondary)]">Account created</dt>
            <dd className="mt-1">
              {new Date(security.createdAt).toLocaleDateString("en", {
                dateStyle: "medium",
                timeZone: "UTC",
              })}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--text-secondary)]">Last sign-in</dt>
            <dd className="mt-1">
              {security.lastSignInAt
                ? new Date(security.lastSignInAt).toLocaleDateString("en", {
                    dateStyle: "medium",
                    timeZone: "UTC",
                  })
                : "Unavailable"}
            </dd>
          </div>
        </dl>
      </SettingsSection>
      <SettingsSection title="Current session">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[var(--text-secondary)]">
            Sign out on this browser.
          </p>
          <Button type="button" variant="outline" loading={pending} onClick={signOut}>
            <Icon icon={Logout01Icon} size={15} />
            Sign out
          </Button>
        </div>
      </SettingsSection>
      {error && (
        <p role="alert" className="text-sm text-[var(--accent)]">
          {error}
        </p>
      )}
      {security.recentSecurityEvents.length > 0 && (
        <SettingsSection title="Recent activity">
          <ul className="divide-y divide-[var(--border-subtle)]">
            {security.recentSecurityEvents.map((event) => (
              <li
                key={event.id}
                className="flex flex-wrap items-center justify-between gap-2 py-2 first:pt-0 last:pb-0 text-sm"
              >
                <span className="capitalize">
                  {event.eventType.toLowerCase().replaceAll("_", " ")}
                </span>
                <time
                  dateTime={event.createdAt}
                  className="text-xs text-[var(--text-secondary)]"
                >
                  {new Date(event.createdAt).toLocaleDateString("en", {
                    dateStyle: "medium",
                    timeZone: "UTC",
                  })}
                </time>
              </li>
            ))}
          </ul>
        </SettingsSection>
      )}
    </div>
  );
}
