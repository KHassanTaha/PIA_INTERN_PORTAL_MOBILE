import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import InternsScreen from '../screens/staff/InternsScreen';
import AddInternScreen from '../screens/staff/AddInternScreen';

const Stack = createNativeStackNavigator();

// Mirrors DocumentApprovalsStack's role in StaffDrawer.js — InternsScreen
// itself needed to push to AddInternScreen with real back-navigation,
// which a bare Drawer.Screen doesn't provide on its own.
export default function InternsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="InternsHome" component={InternsScreen} />
      <Stack.Screen name="AddIntern" component={AddInternScreen} />
    </Stack.Navigator>
  );
}