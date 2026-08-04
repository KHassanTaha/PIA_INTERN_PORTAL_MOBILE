/**
 * services/auth.js
 *
 * STUB — no /auth/* endpoints exist on the backend yet (it's still
 * scaffold-only). These functions define the interface LoginScreen and
 * ForgotPasswordScreen are built against, so the UI can be finished now
 * and wired to the real API later without touching screen code.
 *
 * Device binding: per the backend design, intern login is device-bound —
 * a device identifier travels alongside credentials, and the server
 * associates a login with a specific device. getOrCreateDeviceId() below
 * generates/persists that identifier using react-native-encrypted-storage
 * (already a project dependency for exactly this purpose). This part IS
 * implemented (it's self-contained, no backend needed) — only the actual
 * network calls are stubbed.
 */

import EncryptedStorage from 'react-native-encrypted-storage';
import { v4 as uuidv4 } from 'uuid';

const DEVICE_ID_KEY = 'pia_device_id';

/**
 * Returns this device's persistent identifier, generating and storing one
 * on first call. Stable across app restarts (EncryptedStorage survives
 * them); a fresh install gets a new device ID, which is the correct
 * behavior for a "device rebind" flow to detect.
 *
 * @returns {Promise<string>}
 */
export async function getOrCreateDeviceId() {
  const existing = await EncryptedStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;

  const generated = uuidv4();
  await EncryptedStorage.setItem(DEVICE_ID_KEY, generated);
  return generated;
}

/**
 * @typedef {Object} LoginResult
 * @property {string} accessToken
 * @property {string} refreshToken
 * @property {Object} user - shape TBD once the backend defines it; at
 *   minimum expected to carry user_id, role, first_name, last_name.
 *   role drives which drawer RootNavigator shows (see StaffDrawer.js /
 *   InternDrawer.js).
 */

/**
 * TODO(backend-integration): implement once POST /auth/login exists.
 * Expected request shape (per the documented JWT device-bound design):
 * { identifier, password, deviceId }. On a 409/device-mismatch style
 * response, the caller should route the user to a device-rebind request
 * flow rather than showing a generic error — not yet built, since the
 * backend hasn't defined that response shape yet either.
 *
 * @param {string} identifier - email or employee ID
 * @param {string} password
 * @param {string} deviceId - from getOrCreateDeviceId()
 * @returns {Promise<LoginResult>}
 */
export async function login(identifier, password, deviceId) {
  throw new Error('auth.login() is not implemented — POST /auth/login does not exist yet.');
}

/**
 * TODO(backend-integration): implement once a password-reset endpoint
 * exists. Scope is deliberately just "request a reset" — a follow-up
 * screen (enter reset code + new password) depends on how the backend
 * decides to deliver that code (email link vs SMS OTP), which hasn't
 * been decided yet.
 *
 * @param {string} identifier - email or employee ID
 * @returns {Promise<void>}
 */
export async function requestPasswordReset(identifier) {
  throw new Error(
    'auth.requestPasswordReset() is not implemented — no reset endpoint exists yet.',
  );
}