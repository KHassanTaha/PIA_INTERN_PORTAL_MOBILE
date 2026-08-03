import NetInfo from '@react-native-community/netinfo';
import React, { useEffect, useState } from 'react';
import { Banner, Text } from 'react-native-paper';
import { useSelector } from 'react-redux';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  const pendingCount = useSelector((s) => {
    const pendingAttendance = s.attendance.records.filter(
      (r) => r.syncStatus === 'pending',
    ).length;
    const pendingRequests = s.documentRequests.requests.filter(
      (r) => r.syncStatus === 'pending',
    ).length;
    const pendingUploads = s.documentUploads.uploads.filter(
      (u) => u.syncStatus === 'pending',
    ).length;
    return pendingAttendance + pendingRequests + pendingUploads;
  });

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
