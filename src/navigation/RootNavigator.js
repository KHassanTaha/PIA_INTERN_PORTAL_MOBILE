import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import AttendanceStack from './AttendanceStack';
import DocumentsStack from './DocumentsStack';
import { piaTheme } from '../theme/theme';

const Drawer = createDrawerNavigator();

/**
 * Intern-role drawer shell for this proof of concept. Only Attendance and
 * Documents exist so far — role-conditional drawer content (different
 * items for mentor/admin) is a real, separate piece of work once those
 * roles' screens exist; this drawer is intentionally intern-only for now.
 */
export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        screenOptions={{
          headerTintColor: piaTheme.colors.onPrimary,
          headerStyle: { backgroundColor: piaTheme.colors.primary },
          drawerActiveTintColor: piaTheme.colors.primary,
          drawerActiveBackgroundColor: piaTheme.colors.secondaryContainer,
        }}
      >
        <Drawer.Screen
          name="Attendance"
          component={AttendanceStack}
          options={{
            headerShown: false,
            drawerIcon: ({ color, size }) => (
              <Icon name="calendar-check-outline" color={color} size={size} />
            ),
          }}
        />
        <Drawer.Screen
          name="Documents"
          component={DocumentsStack}
          options={{
            headerShown: false,
            drawerIcon: ({ color, size }) => (
              <Icon name="file-document-outline" color={color} size={size} />
            ),
          }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
