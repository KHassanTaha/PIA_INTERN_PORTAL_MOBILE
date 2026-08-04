/**
 * services/notifications.js
 *
 * Two genuinely different halves, kept in one file since they're both
 * "notifications" from the user's point of view, but worth understanding
 * separately:
 *
 * REAL, implemented now (no backend needed):
 *   - scheduleAttendanceReminder / cancelAttendanceReminder - a local,
 *     on-device daily reminder via Notifee. Nothing server-side is
 *     involved; this fires whether or not the app has any network
 *     connection at all.
 *
 * STUBBED, waiting on backend work:
 *   - fetchNotifications / markNotificationRead - the in-app
 *     notification center's data. The live DB already has a
 *     Notifications table (confirmed in the schema export), but there's
 *     no GET/PATCH endpoint exposing it yet.
 *   - registerPushToken - remote push (task-assigned, request approved/
 *     rejected arriving as a system notification even when the app is
 *     closed) requires Firebase Cloud Messaging wired up on BOTH ends:
 *     @react-native-firebase/messaging here, plus a backend job that
 *     actually calls the FCM API when those events happen (node-cron is
 *     already an installed-but-unused backend dep - a natural fit for a
 *     scheduled digest, though the event-triggered ones like
 *     task-assigned would fire from the relevant controller directly,
 *     not from a cron job). None of that server-side piece exists yet -
 *     this function only stubs the device's half (getting an FCM token
 *     and handing it to the server to store against this user).
 */

import notifee, { RepeatFrequency, TriggerType } from '@notifee/react-native';

const ATTENDANCE_REMINDER_NOTIFICATION_ID = 'attendance-daily-reminder';
const ATTENDANCE_REMINDER_CHANNEL_ID = 'attendance-reminders';

/**
 * Creates (or reuses) the Android notification channel used for the
 * attendance reminder. iOS has no channel concept - Notifee no-ops this
 * there. Must be called before scheduleAttendanceReminder() the first
 * time; safe to call repeatedly.
 */
async function ensureAttendanceChannel() {
  await notifee.createChannel({
    id: ATTENDANCE_REMINDER_CHANNEL_ID,
    name: 'Attendance Reminders',
    importance: 4, // AndroidImportance.HIGH
  });
}

/**
 * Schedules (or reschedules, if one already exists) a daily local
 * reminder at the given hour/minute to check in. Call this once after
 * login succeeds, and again if the person changes the reminder time in
 * settings (not yet built) - Notifee replaces the existing trigger
 * notification for this ID rather than stacking duplicates, since the ID
 * is fixed.
 *
 * @param {{ hour: number, minute: number }} time - 24h local time,
 *   defaults to 9:00 AM if omitted.
 */
export async function scheduleAttendanceReminder({ hour = 9, minute = 0 } = {}) {
  await ensureAttendanceChannel();

  const now = new Date();
  const trigger = new Date();
  trigger.setHours(hour, minute, 0, 0);
  if (trigger.getTime() <= now.getTime()) {
    trigger.setDate(trigger.getDate() + 1); // today's time already passed - start tomorrow
  }

  await notifee.createTriggerNotification(
    {
      id: ATTENDANCE_REMINDER_NOTIFICATION_ID,
      title: "Don't forget to check in",
      body: "You haven't checked in for attendance yet today.",
      android: { channelId: ATTENDANCE_REMINDER_CHANNEL_ID, pressAction: { id: 'default' } },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: trigger.getTime(),
      repeatFrequency: RepeatFrequency.DAILY,
    },
  );
}

/**
 * Cancels the daily reminder - call on logout, or if the person disables
 * attendance reminders in settings (not yet built).
 */
export async function cancelAttendanceReminder() {
  await notifee.cancelNotification(ATTENDANCE_REMINDER_NOTIFICATION_ID);
}

/**
 * @typedef {Object} AppNotification
 * @property {string} id
 * @property {string} type - a NotificationType value (constants/notificationTypes.js)
 * @property {string} title
 * @property {string} body
 * @property {boolean} read
 * @property {string} createdAt - ISO datetime string
 */

/**
 * TODO(backend-integration): implement once GET /notifications/mine (or
 * equivalent, reading the existing Notifications table) exists.
 * @returns {Promise<AppNotification[]>}
 */
export async function fetchNotifications() {
  throw new Error(
    'notifications.fetchNotifications() is not implemented — no /notifications endpoint exists yet.',
  );
}

/**
 * TODO(backend-integration): implement once PATCH /notifications/:id/read
 * (or equivalent) exists.
 * @param {string} notificationId
 * @returns {Promise<void>}
 */
export async function markNotificationRead(notificationId) {
  throw new Error(
    'notifications.markNotificationRead() is not implemented — no /notifications endpoint exists yet.',
  );
}

/**
 * TODO(backend-integration + Firebase setup): implement once Firebase is
 * added to the project (google-services.json / GoogleService-Info.plist)
 * and the backend has somewhere to store+use this token. Should call
 * @react-native-firebase/messaging's getToken(), then POST it to the
 * server against the current user.
 * @returns {Promise<void>}
 */
export async function registerPushToken() {
  throw new Error(
    'notifications.registerPushToken() is not implemented — Firebase is not set up in this project yet.',
  );
}