/**
 * constants/notificationTypes.js
 *
 * Single source of truth for notification type -> display metadata,
 * mirroring the pattern used for taskStages.js. Covers both in-app list
 * items (NotificationsScreen) and, once wired, what a tapped push
 * notification should navigate to.
 */

import { PIAColors } from '../theme/theme';

export const NotificationType = {
  TASK_ASSIGNED: 'TASK_ASSIGNED',
  ATTENDANCE_REMINDER: 'ATTENDANCE_REMINDER',
  REQUEST_SUBMITTED: 'REQUEST_SUBMITTED', // confirms an intern's own request went through
  REQUEST_APPROVED: 'REQUEST_APPROVED',
  REQUEST_REJECTED: 'REQUEST_REJECTED',
};

export const NOTIFICATION_TYPE_META = {
  [NotificationType.TASK_ASSIGNED]: {
    icon: 'checkbox-marked-circle-outline',
    color: PIAColors.green,
    // Screen name inside InternDrawer's Tasks stack to navigate to on tap.
    navigateTo: { drawerScreen: 'Tasks', stackScreen: 'TasksHome' },
  },
  [NotificationType.ATTENDANCE_REMINDER]: {
    icon: 'calendar-check-outline',
    color: PIAColors.gold,
    navigateTo: { drawerScreen: 'Attendance', stackScreen: 'AttendanceHome' },
  },
  [NotificationType.REQUEST_SUBMITTED]: {
    icon: 'send-outline',
    color: PIAColors.greenLight,
    navigateTo: { drawerScreen: 'Documents', stackScreen: 'RequestDocuments' },
  },
  [NotificationType.REQUEST_APPROVED]: {
    icon: 'check-circle-outline',
    color: PIAColors.green,
    navigateTo: { drawerScreen: 'Documents', stackScreen: 'RequestDocuments' },
  },
  [NotificationType.REQUEST_REJECTED]: {
    icon: 'close-circle-outline',
    color: PIAColors.error,
    navigateTo: { drawerScreen: 'Documents', stackScreen: 'RequestDocuments' },
  },
};