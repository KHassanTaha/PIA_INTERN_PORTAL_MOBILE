import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

// Matches the backend's GEOFENCE_RADIUS_METERS constant
// (backend/src/controllers/attendance.controller.js) — keep these in sync.
export const GEOFENCE_RADIUS_METERS = 50;

export const LocationErrorCode = {
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  POSITION_UNAVAILABLE: 'POSITION_UNAVAILABLE',
  TIMEOUT: 'TIMEOUT',
};

export async function requestLocationPermission() {
  if (Platform.OS !== 'android') {
    // iOS permission is requested implicitly by Geolocation.getCurrentPosition
    // via Info.plist usage-description keys — no separate request call needed.
    return true;
  }

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'Location permission required',
      message:
        'PIA Intern Portal needs your location to verify you are at your assigned department when checking in.',
      buttonPositive: 'Allow',
      buttonNegative: 'Deny',
    },
  );

  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

/**
 * Resolves with { latitude, longitude } or rejects with
 * { code: LocationErrorCode, message }.
 */
export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        // react-native-community/geolocation error codes: 1 = permission
        // denied, 2 = position unavailable, 3 = timeout
        const codeMap = {
          1: LocationErrorCode.PERMISSION_DENIED,
          2: LocationErrorCode.POSITION_UNAVAILABLE,
          3: LocationErrorCode.TIMEOUT,
        };
        reject({
          code: codeMap[error.code] || LocationErrorCode.POSITION_UNAVAILABLE,
          message: error.message,
        });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  });
}

// Haversine distance in meters — mirrors backend/src/utils/geo.js exactly,
// so a "you're within range" result here should always agree with the
// server's own check during sync.
export function distanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Full check: requests permission if needed, gets current position, and
 * reports whether it's within range of the given department coordinates.
 * Used twice per check-in — once before showing the camera, once again at
 * capture time — see AttendanceScreen for why.
 */
export async function checkWithinGeofence(departmentLat, departmentLng) {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) {
    return {
      allowed: false,
      reason: 'PERMISSION_DENIED',
      distance: null,
      position: null,
    };
  }

  let position;
  try {
    position = await getCurrentPosition();
  } catch (err) {
    return {
      allowed: false,
      reason: err.code || LocationErrorCode.POSITION_UNAVAILABLE,
      distance: null,
      position: null,
    };
  }

  const distance = distanceMeters(
    position.latitude,
    position.longitude,
    departmentLat,
    departmentLng,
  );

  return {
    allowed: distance <= GEOFENCE_RADIUS_METERS,
    reason: distance <= GEOFENCE_RADIUS_METERS ? null : 'OUTSIDE_GEOFENCE',
    distance,
    position,
  };
}
