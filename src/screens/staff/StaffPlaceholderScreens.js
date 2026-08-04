/**
 * screens/staff/StaffPlaceholderScreens.js
 *
 * Thin wrappers around ComingSoonScreen for each staff drawer
 * destination that doesn't have a real implementation yet. Kept in one
 * file rather than one file each, since each is currently a single line
 * of actual content — split any of these into their own file the moment
 * real functionality gets built into it.
 */

import React from 'react';
import ComingSoonScreen from '../../components/ComingSoonScreen';

export function ApprovalsScreen() {
  return <ComingSoonScreen title="Approvals" icon="clipboard-check-outline" />;
}

export function TeamAttendanceScreen() {
  return <ComingSoonScreen title="Team Attendance" icon="account-group-outline" />;
}

export function TasksScreen() {
  return <ComingSoonScreen title="Tasks" icon="checkbox-marked-circle-outline" />;
}

export function InternsScreen() {
  return <ComingSoonScreen title="Interns" icon="account-multiple-outline" />;
}

export function GatePassesScreen() {
  return <ComingSoonScreen title="Gate Passes" icon="card-account-details-star-outline" />;
}

export function LettersScreen() {
  return <ComingSoonScreen title="Letters" icon="file-document-multiple-outline" />;
}

export function SignaturesScreen() {
  return <ComingSoonScreen title="Signature Requests" icon="draw-pen" />;
}

export function ProfileScreen() {
  return <ComingSoonScreen title="Profile" icon="account-circle-outline" />;
}