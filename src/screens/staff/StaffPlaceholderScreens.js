/**
 * screens/staff/StaffPlaceholderScreens.js
 *
 * Down to just ProfileScreen now — TeamAttendance, Tasks, Interns, and
 * Signatures all graduated to real DataTable-backed screens (see
 * screens/staff/TeamAttendanceScreen.js, TasksOverviewScreen.js,
 * InternsScreen.js, SignaturesScreen.js). Profile is the piece spec'd
 * out for the other agent to build (staff profile + GM signature
 * upload) — replace this export once that work lands, same pattern as
 * the others.
 */

import React from 'react';
import ComingSoonScreen from '../../components/ComingSoonScreen';

export function ProfileScreen() {
  return <ComingSoonScreen title="Profile" icon="account-circle-outline" />;
}