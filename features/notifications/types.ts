export * from "@/domain/notifications/types";
export * from "@/domain/notifications/schemas";

export type NotificationTab = "all" | "unread" | "reminders";

export interface NotificationsListResponse {
  notifications: import("@/domain/notifications/types").InAppNotification[];
  unreadCount: number;
  nextCursor?: string | null;
}
