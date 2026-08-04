import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useSelector } from 'react-redux';
import { Badge } from 'react-native-paper';
import { View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import AttendanceStack from './AttendanceStack';
import DocumentsStack from './DocumentsStack';
import TasksStack from './TasksStack';
import NotificationsStack from './NotificationsStack';
import AppDrawerContent from '../components/AppDrawerContent';
import { selectUnreadCount } from '../store/slices/notificationsSlice';
import { piaTheme, PIAColors } from '../theme/theme';

const Drawer = createDrawerNavigator();

// Small wrapper so the Notifications drawer icon can show an unread-count
// badge - a plain <Icon /> has no room for that on its own.
function NotificationsDrawerIcon({ color, size }) {
  const unreadCount = useSelector(selectUnreadCount);
  return (
    <View>
      <Icon name="bell-outline" color={color} size={size} />
      {unreadCount > 0 && (
        <Badge size={16} style={{ position: 'absolute', top: -4, right: -6, backgroundColor: PIAColors.error }}>
          {unreadCount > 9 ? '9+' : unreadCount}
        </Badge>
      )}
    </View>
  );
}

/**
 * Intern-role drawer. Previously lived directly inside RootNavigator;
 * pulled out into its own file now that RootNavigator has to choose
 * between this and StaffDrawer based on the logged-in user's role - see
 * RootNavigator.js.
 */
export default function InternDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <AppDrawerContent {...props} />}
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
        name="Tasks"
        component={TasksStack}
        options={{
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Icon name="checkbox-marked-circle-outline" color={color} size={size} />
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
      <Drawer.Screen
        name="Notifications"
        component={NotificationsStack}
        options={{
          headerShown: false,
          drawerIcon: NotificationsDrawerIcon,
        }}
      />
    </Drawer.Navigator>
  );
}