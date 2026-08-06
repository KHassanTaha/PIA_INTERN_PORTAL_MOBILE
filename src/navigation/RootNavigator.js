import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector } from 'react-redux';

import AuthStack from './AuthStack';
import InternDrawer from './InternDrawer';
import StaffDrawer from './StaffDrawer';
import { selectIsAuthenticated, selectUserRole } from '../store/slices/authSlice';

/**
 * Top-level navigation switch. A single NavigationContainer wraps all
 * three destinations so switching between them (login -> drawer, or
 * logout -> back to login) is a state change inside one container, not a
 * container remount - avoids losing/resetting unrelated navigation state
 * on every auth transition.
 *
 * Role -> drawer mapping: 'interns' gets InternDrawer (Attendance,
 * Documents - the two screens built so far); 'employees' and 'admin'
 * both get StaffDrawer, which internally shows/hides the Signatures item
 * based on the finer-grained admin check - see StaffDrawer.js.
 */
export default function RootNavigator() {
  const isAuthenticated = true;
  const role = 'interns';
  /**
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const role = useSelector(selectUserRole);
 */

  const renderAuthenticatedDrawer = () => {
    if (role === 'interns') return <InternDrawer />;
    if (role === 'employees' || role === 'admin') return <StaffDrawer />;

    // Defensive fallback: an authenticated session with an unrecognized
    // or missing role shouldn't silently render nothing. This shouldn't
    // be reachable once login is actually wired up (the backend's
    // chk_user_role constraint only allows 'interns'/'employees'/'admin'),
    // but a stale/malformed persisted token during development could hit
    // this - falls back to the intern drawer rather than a blank screen.
    return <InternDrawer />;
  };

  return (
    <NavigationContainer>
      {isAuthenticated ? renderAuthenticatedDrawer() : <AuthStack />}
    </NavigationContainer>
  );
}