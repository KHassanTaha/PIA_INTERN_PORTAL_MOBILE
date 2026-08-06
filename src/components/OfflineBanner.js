import NetInfo from '@react-native-community/netinfo';
import React, { useEffect, useState } from 'react';
import { Banner, Text } from 'react-native-paper';
import { useSelector } from 'react-redux';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  // Only attendance uses the write-locally-then-sync (offline queue)
  // pattern right now. documentsSlice moved to a thunk/actionStatus model
  // (see documentsSlice.js header) — actionStatus tracks an in-flight API
  // call, not a queued-for-later-sync item, so it deliberately isn't
  // counted here. If document offline queuing gets built later, add it
  // back the same way attendance is counted below.
  const pendingCount = useSelector(
    (s) => s.attendance.records.filter((r) => r.syncStatus === 'pending').length,
  );

  useEffect(() => {
    return NetInfo.addEventListener((state) => {
      setIsOffline(!(state.isConnected && state.isInternetReachable !== false));
    });
  }, []);

  if (!isOffline && pendingCount === 0) return null;

  return (
    <Banner visible icon={isOffline ? 'wifi-off' : 'cloud-upload-outline'}>
      <Text>
        {isOffline
          ? "You're offline — changes are saved and will sync automatically."
          : `Syncing ${pendingCount} pending item${pendingCount === 1 ? '' : 's'}…`}
      </Text>
    </Banner>
  );
}