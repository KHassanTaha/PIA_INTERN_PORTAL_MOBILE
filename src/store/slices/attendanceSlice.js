import { createSlice } from '@reduxjs/toolkit';

// syncStatus: 'pending' | 'synced' | 'failed'

const initialState = {
  records: [], // most recent first
};

function makeLocalId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    // Called once BOTH geofence checks (pre-camera and at-capture, see
    // AttendanceScreen) and face capture have all succeeded — writes
    // locally immediately, regardless of connectivity. Sync happens
    // separately (see services/syncQueue.js) whenever the device is online.
    checkInOffline: {
      reducer(state, action) {
        state.records.unshift(action.payload);
      },
      prepare({ facePhotoUri, latitude, longitude, distanceMeters }) {
        const now = new Date();
        return {
          payload: {
            id: makeLocalId(),
            date: now.toISOString().slice(0, 10),
            checkInTime: now.toISOString(),
            facePhotoUri,
            // Captured at the SECOND (capture-time) location check, not the
            // first pre-camera check — this is the reading actually being
            // vouched for when the record is synced.
            latitude,
            longitude,
            distanceMeters,
            syncStatus: 'pending',
          },
        };
      },
    },
    markAttendanceSynced(state, action) {
      const record = state.records.find((r) => r.id === action.payload);
      if (record) record.syncStatus = 'synced';
    },
    markAttendanceFailed(state, action) {
      const record = state.records.find((r) => r.id === action.payload);
      if (record) record.syncStatus = 'failed';
    },
  },
});

export const { checkInOffline, markAttendanceSynced, markAttendanceFailed } =
  attendanceSlice.actions;

export default attendanceSlice.reducer;
