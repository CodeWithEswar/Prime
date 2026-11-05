import type { Metadata } from "next";
import { PageFrame } from "@/components/shell";
import { NotificationInboxView } from "@/features/notifications/components/notification-inbox-view";

export const metadata: Metadata = {
  title: "Notifications — PRIME",
  description: "PRIME preparation reminders, spaced revisions, and study notifications.",
};

export default function NotificationsPage() {
  return (
    <PageFrame
      category="Inbox"
      title="Notifications"
      description="Your preparation updates, reminders, and reports in one place."
      variant="workspace"
    >
      <NotificationInboxView />
    </PageFrame>
  );
}
