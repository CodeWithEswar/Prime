import { Notification01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import type { NotificationTab } from "../types";

export function NotificationEmptyState({
  tab,
  message,
}: {
  tab?: NotificationTab;
  message?: string;
}) {
  return (
    <div className="px-5 py-16 text-center">
      <Icon
        icon={Notification01Icon}
        size={28}
        className="mx-auto mb-4 text-[var(--text-tertiary)]"
      />
      <h3 className="text-sm font-semibold text-white">
        {message
          ? "No matching notifications"
          : tab === "unread"
            ? "You're all caught up"
            : tab === "reminders"
              ? "No reminders"
              : "Your inbox is clear"}
      </h3>
      <p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-[var(--text-secondary)]">
        {message ??
          (tab === "unread"
            ? "You've read every notification in your inbox."
            : "Your preparation updates will appear here.")}
      </p>
    </div>
  );
}
