"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  UserIcon,
  Target02Icon,
  Clock01Icon,
  BookOpen01Icon,
  Notification01Icon,
  PaintBoardIcon,
  Shield01Icon,
  Link01Icon,
  FolderSecurityIcon,
  DashboardSquare01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useSettingsNavigation } from "./settings-primitives";

export const SETTINGS_SECTIONS = [
  {
    href: "/settings",
    label: "Overview",
    icon: DashboardSquare01Icon,
    description: "Your account at a glance",
  },
  {
    href: "/settings/profile",
    label: "Profile",
    icon: UserIcon,
    description: "Personal details and email",
  },
  {
    href: "/settings/targets",
    label: "Career targets",
    icon: Target02Icon,
    description: "Roles, companies, and goals",
  },
  {
    href: "/settings/study",
    label: "Study schedule",
    icon: Clock01Icon,
    description: "Daily targets and availability",
  },
  {
    href: "/settings/learning",
    label: "Learning",
    icon: BookOpen01Icon,
    description: "Practice and lesson preferences",
  },
  {
    href: "/settings/notifications",
    label: "Notifications",
    icon: Notification01Icon,
    description: "Reminders and delivery times",
  },
  {
    href: "/settings/appearance",
    label: "Appearance",
    icon: PaintBoardIcon,
    description: "Display and accessibility",
  },
  {
    href: "/settings/security",
    label: "Account & security",
    icon: Shield01Icon,
    description: "Sign-in and session controls",
  },
  {
    href: "/settings/connections",
    label: "Connected accounts",
    icon: Link01Icon,
    description: "Your linked sign-in methods",
  },
  {
    href: "/settings/privacy",
    label: "Privacy & data",
    icon: FolderSecurityIcon,
    description: "Exports and data controls",
  },
] as const;

export function SettingsNav() {
  const pathname = usePathname();
  const navigate = useSettingsNavigation();
  const selected =
    SETTINGS_SECTIONS.find((section) => section.href === pathname)?.href ?? "/settings";
  return (
    <nav aria-label="Settings sections" className="min-w-0">
      <div className="space-y-1.5 @min-[58rem]:hidden">
        <Label htmlFor="settings-section">Settings section</Label>
        <Select value={selected} onValueChange={navigate}>
          <SelectTrigger id="settings-section" className="w-full">
            <SelectValue>
              {SETTINGS_SECTIONS.find((section) => section.href === selected)?.label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {SETTINGS_SECTIONS.map((section) => (
              <SelectItem key={section.href} value={section.href}>
                {section.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="hidden space-y-0.5 @min-[58rem]:block">
        {SETTINGS_SECTIONS.map(({ href, label, icon }) => (
          <Link
            id={"settings-link-" + href.split("/").at(-1)}
            key={href}
            href={href}
            aria-current={selected === href ? "page" : undefined}
            className={cn(
              "flex min-h-9 items-center gap-2.5 rounded-[var(--radius-sm)] border border-transparent px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
              selected === href
                ? "border-[var(--border-subtle)] bg-[var(--surface-raised)] text-[var(--foreground)]"
                : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
            )}
          >
            <Icon
              icon={icon}
              size={16}
              className={selected === href ? "text-[var(--accent)]" : ""}
            />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
