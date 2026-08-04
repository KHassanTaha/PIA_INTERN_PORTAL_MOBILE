/**
 * store/slices/authSlice.js
 *
 * Adds scheduleAttendanceReminder()/cancelAttendanceReminder() calls into
 * loginThunk/logoutThunk - the only two places a session actually starts
 * or ends, so this is the correct single spot for each rather than
 * scattering calls across screens.
 */

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import EncryptedStorage from 'react-native-encrypted-storage';

import { getOrCreateDeviceId, login as loginApi } from '../../services/auth';
import { cancelAttendanceReminder, scheduleAttendanceReminder } from '../../services/notifications';

const ACCESS_TOKEN_KEY = 'pia_access_token';
const REFRESH_TOKEN_KEY = 'pia_refresh_token';

export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ identifier, password }, { rejectWithValue }) => {
    try {
      const deviceId = await getOrCreateDeviceId();
      const result = await loginApi(identifier, password, deviceId);

      await EncryptedStorage.setItem(ACCESS_TOKEN_KEY, result.accessToken);
      await EncryptedStorage.setItem(REFRESH_TOKEN_KEY, result.refreshToken);

      // Best-effort: a failure here (e.g. notification permission not yet
      // granted on this OS version) shouldn't fail the login itself - the
      // person is still logged in either way, they just won't get
      // reminders until this succeeds on a later login or a dedicated
      // "enable reminders" retry gets built.
      try {
        await scheduleAttendanceReminder();
      } catch (reminderErr) {
        console.warn('authSlice: failed to schedule attendance reminder', reminderErr);
      }

      return result;
    } catch (err) {
      // err.message from the stub is a developer-facing "not implemented"
      // string for now; once the real endpoint exists, map its actual
      // error responses (invalid credentials, device mismatch, locked
      // account, etc) to distinct messages here rather than passing a
      // raw server string straight to the UI.
      return rejectWithValue(err.message || 'Login failed. Please try again.');
    }
  },
);

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  await EncryptedStorage.removeItem(ACCESS_TOKEN_KEY);
  await EncryptedStorage.removeItem(REFRESH_TOKEN_KEY);

  try {
    await cancelAttendanceReminder();
  } catch (reminderErr) {
    console.warn('authSlice: failed to cancel attendance reminder', reminderErr);
  }
  // NOTE: does not call a backend /auth/logout (refresh-token revocation)
  // endpoint yet, since one doesn't exist - this only clears local state.
  // Once the endpoint exists, call it here too, best-effort (a failed
  // revocation call shouldn't block the local logout from completing).
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    accessToken: null,
    refreshToken: null,
    user: null,
  },
  reducers: {
    // Lets LoginScreen clear a stale error message as soon as the person
    // starts editing the form again, rather than leaving it up until the
    // next submit.
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.status = 'idle';
        state.error = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.user = null;
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;

export const selectIsAuthenticated = (state) => Boolean(state.auth.accessToken);
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;
export const selectCurrentUser = (state) => state.auth.user;
export const selectUserRole = (state) => state.auth.user?.role ?? null;