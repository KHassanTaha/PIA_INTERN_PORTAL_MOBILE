import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TasksScreen from '../screens/tasks/TasksScreen';

const Stack = createNativeStackNavigator();

// TasksScreen renders its own GradientHeader (react-native-paper Appbar
// inside a gradient wrapper), so the native-stack header is hidden here -
// same reasoning as AttendanceStack/DocumentsStack.
export default function TasksStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TasksHome" component={TasksScreen} />
    </Stack.Navigator>
  );
}