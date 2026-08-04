/**
 * hooks/useNotificationPolling.js
 *
 * No-external-service alternative to remote push: periodically calls
 * GET /notifications (via fetchNotifications in services/notifications.js)
 * while the app is foregrounded or backgrounded-but-not-killed, and shows
 * a local Notifee banner for anything new since the last poll.
 *
 * Honest limitation, not hidden: this cannot wake a fully force-quit app,
 * and Android's background-execution limits mean POLL_INTERVAL_MS below
 * is a floor, not a guarantee - the OS can delay a background timer
 * further under battery optimization. This is the tradeoff of avoiding
 * FCM/APNs entirely, not a bug in this implementation.
 *
 * Mount this once near the app root (e.g. inside AppShell in App.tsx,
 * alongside useSyncQueue) - NOT per-screen, or you'd get duplicate
 * pollers running.
 */

import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import notifee from '@notifee/react-native';

import { fetchNotificationsThunk, selectAllNotifications } from '../store/slices/notificationsSlice';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import { NOTIFICATION_TYPE_META } from '../constants/notificationTypes';

const POLL_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes - see the header note on background limits
const BANNER_CHANNEL_ID = 'general-notifications';

async function ensureBannerChannel() {
  await notifee.createChannel({
    id: BANNER_CHANNEL_ID,
    name: 'Notifications',
    importance: 4, // AndroidImportance.HIGH
  });
}

async function showBanner(notification) {
  const meta = NOTIFICATION_TYPE_META[notification.type];
  await notifee.displayNotification({
    title: notification.title,
    body: notification.body,
    android: {
      channelId: BANNER_CHANNEL_ID,
      pressAction: { id: 'default' },
      smallIcon: meta?.icon ? undefined : undefined, // TODO: map to a bundled Android drawable resource once notification icons are finalized - Notifee needs a drawable name here, not a MaterialCommunityIcons name, so meta.icon can't be passed through directly.
    },
  });
}

export function useNotificationPolling() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const notifications = useSelector(selectAllNotifications);

  // Tracks which notification IDs have already triggered a banner, so a
  // re-fetch that returns the same items doesn't re-notify. Persists only
  // for the life of this hook instance (app session) - intentional: a
  // fresh app start re-showing a banner for something still unread is a
  // reasonable, minor redundancy, far better than the alternative of
  // silently never re-showing it if this were persisted and something
  // went wrong.
  const seenIds = useRef(new Set());

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    ensureBannerChannel();

    let intervalId = null;

    const poll = () => {
      dispatch(fetchNotificationsThunk());
    };

    poll(); // immediate first fetch, don't wait a full interval on mount/resume
    intervalId = setInterval(poll, POLL_INTERVAL_MS);

    // Also poll immediately whenever the app comes back to the
    // foreground, rather than waiting for the next interval tick - this
    // is what makes "reopen the app" feel reasonably fresh despite the
    // conservative background interval.
    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') poll();
    });

    return () => {
      if (intervalId) clearInterval(intervalId);
      appStateSubscription.remove();
    };
  }, [isAuthenticated, dispatch]);

  // Separate effect: reacts to the notifications list changing (from any
  // poll) and shows banners for genuinely new unread items - kept apart
  // from the polling effect above so the banner logic doesn't need to
  // know anything about timers/AppState.
  useEffect(() => {
    const newUnread = notifications.filter((n) => !n.read && !seenIds.current.has(n.id));
    if (newUnread.length === 0) return;

    newUnread.forEach((n) => {
      seenIds.current.add(n.id);
      showBanner(n);
    });
  }, [notifications]);
}