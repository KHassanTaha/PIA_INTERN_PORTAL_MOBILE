import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import NotificationsScreen from '../screens/notifications/NotificationsScreen';

const Stack = createNativeStackNavigator();

export default function NotificationsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="NotificationsHome" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}