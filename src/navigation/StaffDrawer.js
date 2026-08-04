import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import AppDrawerContent from '../components/AppDrawerContent';
import { selectUserRole } from '../store/slices/authSlice';
import { piaTheme } from '../theme/theme';
import {
  ApprovalsScreen,
  TeamAttendanceScreen,
  TasksScreen,
  InternsScreen,
  GatePassesScreen,
  LettersScreen,
  SignaturesScreen,
  ProfileScreen,
} from '../screens/staff/StaffPlaceholderScreens';

const Drawer = createDrawerNavigator();

/**
 * Staff-role drawer (role 'admin' or 'employees' - i.e. any tier of
 * mentor/manager up through GM, plus admin). Every screen here is
 * currently a ComingSoonScreen placeholder (see
 * screens/staff/StaffPlaceholderScreens.js) except for navigation itself
 * being real - swap each Drawer.Screen's component for a real stack as
 * each feature gets built, without needing to touch this file's
 * structure.
 *
 * "Signature Requests" is admin-only, matching the design where a GM's
 * uploaded signature requires admin approval before it's live (see
 * SignatureRequests in the hierarchy migration) - an employee/GM reviewing
 * their OWN pending signature request would be a different, simpler
 * "my signature" screen under Profile, not this admin approval queue.
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
        component={ApprovalsScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="clipboard-check-outline" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="TeamAttendance"
        component={TeamAttendanceScreen}
        options={{
          title: 'Team Attendance',
          drawerIcon: ({ color, size }) => (
            <Icon name="account-group-outline" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="Tasks"
        component={TasksScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="checkbox-marked-circle-outline" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="Interns"
        component={InternsScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="account-multiple-outline" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="GatePasses"
        component={GatePassesScreen}
        options={{
          title: 'Gate Passes',
          drawerIcon: ({ color, size }) => (
            <Icon name="card-account-details-star-outline" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="Letters"
        component={LettersScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="file-document-multiple-outline" color={color} size={size} />
          ),
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
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon name="account-circle-outline" color={color} size={size} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}