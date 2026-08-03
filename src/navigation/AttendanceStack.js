import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AttendanceScreen from '../screens/attendance/AttendanceScreen';

const Stack = createNativeStackNavigator();

export default function AttendanceStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AttendanceHome" component={AttendanceScreen} />
    </Stack.Navigator>
  );
}
