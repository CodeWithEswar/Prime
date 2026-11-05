# Notifications inbox

PRIME's inbox at /notifications uses the existing notification records, preferences, and authenticated Supabase client. It does not create demonstration notifications or send email when the inbox is opened.

## Implementation inventory

| Area                    | Existing implementation reused                                                                                           | Inbox work                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Records and access      | notifications table, owner RLS, soft deletion                                                                            | Owner-scoped list and mutation queries                                                                                 |
| Preferences             | notification_preferences, settings form and API                                                                          | Shared design system controls and settings shortcuts                                                                   |
| Reminder infrastructure | schedules, events, deliveries, attempts and outbox migration; reminders worker; internal reconciliation and email routes | Preserved; no worker deployment or SMTP delivery performed                                                             |
| Inbox page              | /notifications and notification hooks                                                                                    | Responsive GitHub-inspired list, local navigation, date groups, search, category filtering, selection and bulk actions |
| Bell                    | Topbar entry and unread count query                                                                                      | Desktop popover, mobile sheet, deferred preview fetching, shared buttons and tabs                                      |

## Behavior

- Unread rows use PRIME red; read rows remain readable. Category icons, metadata, titles, and timestamps have distinct hierarchy.
- Date groups use the user's notification timezone. Exact timestamps are available on hover and in the detail sheet.
- Search runs on the server across titles and bodies, including older records. Filter syntax characters are treated as separators.
- Lists fetch 20 rows at a time (8 in the bell preview). An opaque timestamp-and-ID cursor avoids losing records with identical timestamps.
- Select individual rows or up to 50 visible records. Selection never marks a notification as read.
- Bulk actions mark read, mark unread, or soft delete. Deletion requires confirmation.
- Opening a full inbox item opens its message sheet and marks it as read. Event destinations must be relative PRIME paths.
- Mutations change the visible records only after the server confirms success. Failures remain visible and preserve the saved state.
- Backend failures show retry controls rather than an empty inbox. Unread count refreshes once a minute and on focus; it is not a realtime subscription.
- The inbox view does not support GitHub-specific concepts such as subscriptions, repositories, or saved filters.

## Verification

The isolated Playwright backend supplies test-only notifications and never forwards requests to Supabase. Tests cover 320/390/768/1440 pixel layouts, timestamp ties and pagination, search across history, unread/category filters, bulk persistence, confirmed deletion, safe destinations, failed mutations, failed reads, and mobile/desktop bell panels. Unit tests cover filter validation, bounded bulk IDs, internal links, timezone grouping, and DST.

Run:

    node node_modules/@playwright/test/cli.js test --config scripts/planner-qa.config.ts notifications.spec.ts settings.spec.ts
    node node_modules/vitest/vitest.mjs run tests/unit/notification-inbox.test.ts tests/unit/notification-eligibility.test.ts tests/unit/settings-schemas.test.ts tests/unit/email-templates.test.ts tests/unit/workers.test.ts

No new database migration is needed for this inbox update. Existing notification and settings tables must already be installed. These checks do not establish that live cron, SMTP delivery, unsubscribe handling, or queue configuration are operational.

Internal email delivery and reconciliation now fail closed with 503 when their shared secret is absent, and 401 for an incorrect secret. Unit tests verify that neither the privileged client nor email transport is invoked in these cases. Obsolete route runtime exports were removed because Cache Components uses the default Node.js runtime.
