import NetInfo from '@react-native-community/netinfo';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  markAttendanceFailed,
  markAttendanceSynced,
} from '../store/slices/attendanceSlice';
import {
  markDocumentRequestFailed,
  markDocumentRequestSynced,
} from '../store/slices/documentRequestsSlice';
import {
  markUploadFailed,
  markUploadSynced,
} from '../store/slices/documentUploadsSlice';
import {
  syncAttendanceRecord,
  syncDocumentRequest,
  syncDocumentUpload,
} from './api';

/**
 * Write-locally-then-sync engine. Anything queued with syncStatus:'pending'
 * gets pushed to the backend as soon as the device is online — on mount,
 * and again on every connectivity change. Mount this once near the app
 * root (see App.js); it doesn't render anything.
 */
export function useSyncQueue() {
  const dispatch = useDispatch();
  const attendanceRecords = useSelector((s) => s.attendance.records);
  const documentRequests = useSelector((s) => s.documentRequests.requests);
  const documentUploads = useSelector((s) => s.documentUploads.uploads);
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

        const pendingRequests = documentRequests.filter(
          (r) => r.syncStatus === 'pending',
        );
        for (const request of pendingRequests) {
          try {
            await syncDocumentRequest(request);
            dispatch(markDocumentRequestSynced(request.id));
          } catch {
            dispatch(markDocumentRequestFailed(request.id));
          }
        }

        const pendingUploads = documentUploads.filter(
          (u) => u.syncStatus === 'pending',
        );
        for (const upload of pendingUploads) {
          try {
            await syncDocumentUpload(upload);
            dispatch(markUploadSynced(upload.id));
          } catch {
            dispatch(markUploadFailed(upload.id));
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
  }, [attendanceRecords, documentRequests, documentUploads]);
}
