import NetInfo from '@react-native-community/netinfo';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  markAttendanceFailed,
  markAttendanceSynced,
} from '../store/slices/attendanceSlice';
import { syncAttendanceRecord } from './api';

/**
 * Write-locally-then-sync engine. Anything queued with syncStatus:'pending'
 * gets pushed to the backend as soon as the device is online — on mount,
 * and again on every connectivity change. Mount this once near the app
 * root (see App.js); it doesn't render anything.
 *
 * Document uploads/requests were REMOVED from this queue (previously
 * imported from a documentSlice.js that no longer matches the current
 * documents architecture) — documentsSlice.js (plural, current) uses
 * direct async thunks against a mock service instead of an offline
 * syncStatus queue. This is a real open decision, not an oversight:
 * worth revisiting whether documents should get offline-queue support
 * added back once real endpoints exist, matching attendance's pattern -
 * see the project notes on this exact question. For now, document
 * submission simply requires connectivity (which is a non-issue while
 * everything is mock data anyway).
 */
export function useSyncQueue() {
  const dispatch = useDispatch();
  const attendanceRecords = useSelector((s) => s.attendance.records);
  const isFlushing = useRef(false);

  useEffect(() => {
    const flush = async () => {
      if (isFlushing.current) return;
      isFlushing.current = true;

      try {
        const pendingAttendance = attendanceRecords.filter(
          (r) => r.syncStatus === 'pending',
        );
        for (const record of pendingAttendance) {
          try {
            await syncAttendanceRecord(record);
            dispatch(markAttendanceSynced(record.id));
          } catch {
            dispatch(markAttendanceFailed(record.id));
          }
        }
      } finally {
        isFlushing.current = false;
      }
    };

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable !== false) {
        flush();
      }
    });

    flush(); // also try once immediately, in case we're already online

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attendanceRecords]);
}