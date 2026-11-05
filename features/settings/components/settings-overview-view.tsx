"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { SETTINGS_SECTIONS } from "./settings-nav";
import type { SettingsOverviewData } from "../types";

export function SettingsOverviewView({ data }: { data: SettingsOverviewData }) {
  const { profile, targets, study, learning, notificationsEnabled, security } = data;
  const name = profile.displayName || profile.fullName || "Your profile";
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
  const details: Record<string, string> = {
    "/settings/targets": targets.targetRole || "Set your career goals",
    "/settings/study": study.dailyStudyMinutes + " min per study day",
    "/settings/learning": {
      java: "Java",
      python: "Python",
      cpp: "C++",
      javascript: "JavaScript",
      typescript: "TypeScript",
    }[learning.preferredLanguage],
    "/settings/notifications": notificationsEnabled
      ? "Notifications enabled"
      : "Notifications off",
    "/settings/appearance": "Dark appearance",
    "/settings/security": security.emailConfirmed
      ? "Email verified"
      : "Email verification pending",
    "/settings/connections": security.providers.length
      ? security.providers
          .map((provider) =>
            provider === "email" ? "Email" : provider[0].toUpperCase() + provider.slice(1)
          )
          .join(", ")
      : "View sign-in methods",
    "/settings/privacy": "Manage your data",
  };

  return (
    <div className="space-y-5">
      <Card
        elevation="base"
        className="flex min-w-0 flex-wrap items-center gap-3 p-4 sm:p-5"
      >
        <Avatar className="size-12">
          <AvatarImage src={profile.avatarUrl ?? undefined} alt="" />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold [overflow-wrap:anywhere]">{name}</h2>
          <p className="mt-0.5 text-sm text-[var(--text-secondary)] [overflow-wrap:anywhere]">
            {profile.email}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/settings/profile">Edit profile</Link>
        </Button>
      </Card>

      <Card
        elevation="base"
        className="min-w-0 divide-y divide-[var(--border-subtle)] overflow-hidden"
      >
        {SETTINGS_SECTIONS.filter(
          (section) =>
            section.href !== "/settings" && section.href !== "/settings/profile"
        ).map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group flex min-w-0 flex-wrap items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent)] sm:px-5"
          >
            <Icon
              icon={section.icon}
              size={17}
              className="shrink-0 text-[var(--text-secondary)] group-hover:text-[var(--accent)]"
            />
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium">{section.label}</h3>
              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                {section.description}
              </p>
            </div>
            <p className="max-w-full pl-7 text-xs text-[var(--text-secondary)] [overflow-wrap:anywhere] sm:max-w-[45%] sm:pl-0 sm:text-right">
              {details[section.href]}
            </p>
          </Link>
        ))}
      </Card>
    </div>
  );
}
