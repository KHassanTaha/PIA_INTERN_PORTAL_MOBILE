import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import AppDrawerContent from '../components/AppDrawerContent';
import DocumentApprovalsStack from './DocumentApprovalsStack';
import InternsScreen from '../screens/staff/InternsScreen';
import TeamAttendanceScreen from '../screens/staff/TeamAttendanceScreen';
import TasksOverviewScreen from '../screens/staff/TasksOverviewScreen';
import SignaturesScreen from '../screens/staff/SignaturesScreen';
import AuditLogsScreen from '../screens/staff/AuditLogsScreen';
import { ProfileScreen } from '../screens/staff/StaffPlaceholderScreens';
import { selectUserRole } from '../store/slices/authSlice';
import { piaTheme } from '../theme/theme';

const Drawer = createDrawerNavigator();

/**
 * Staff-role drawer. As of this update, every item except Profile is a
 * real DataTable-backed screen (mock data, see services/staffData.js) -
 * Profile remains a placeholder pending the spec handed to the other
 * agent (staff profile + GM signature upload flow).
 *
 * Audit Logs is admin-only (per the confirmed requirement) - same
 * isAdmin gate already used for Signatures.
 */
export default function StaffDrawer() {
  const role = useSelector(selectUserRole);
  const isAdmin = role === 'admin';

  return (
    <Drawer.Navigator
      drawerContent={(props) => <AppDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: piaTheme.colors.primary,
        drawerActiveBackgroundColor: piaTheme.colors.secondaryContainer,
      }}
    >
      <Drawer.Screen
        name="Approvals"
        component={DocumentApprovalsStack}
        options={{
          drawerIcon: ({ color, size }) => <Icon name="clipboard-check-outline" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="TeamAttendance"
        component={TeamAttendanceScreen}
        options={{
          title: 'Team Attendance',
          drawerIcon: ({ color, size }) => <Icon name="account-group-outline" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="Tasks"
        component={TasksOverviewScreen}
        options={{
          drawerIcon: ({ color, size }) => <Icon name="checkbox-marked-circle-outline" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="Interns"
        component={InternsScreen}
        options={{
          drawerIcon: ({ color, size }) => <Icon name="account-multiple-outline" color={color} size={size} />,
        }}
      />
      {isAdmin && (
        <Drawer.Screen
          name="Signatures"
          component={SignaturesScreen}
          options={{
            title: 'Signature Requests',
            drawerIcon: ({ color, size }) => <Icon name="draw-pen" color={color} size={size} />,
          }}
        />
      )}
      {isAdmin && (
        <Drawer.Screen
          name="AuditLogs"
          component={AuditLogsScreen}
          options={{
            title: 'Audit Logs',
            drawerIcon: ({ color, size }) => <Icon name="history" color={color} size={size} />,
          }}
        />
      )}
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          drawerIcon: ({ color, size }) => <Icon name="account-circle-outline" color={color} size={size} />,
        }}
      />
    </Drawer.Navigator>
  );
}