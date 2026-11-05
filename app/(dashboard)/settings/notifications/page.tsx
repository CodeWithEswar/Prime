import type { Metadata } from "next";
import { NotificationPreferencesForm } from "@/features/notifications/components/notification-preferences-form";

export const metadata: Metadata = {
  title: "Notification Settings — PRIME",
  description:
    "Configure delivery channels, study reminders, quiet hours, and email digests.",
};

export default function NotificationSettingsPage() {
  return <NotificationPreferencesForm />;
}
