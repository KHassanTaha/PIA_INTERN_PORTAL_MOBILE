import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/auth/LoginScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

const Stack = createNativeStackNavigator();

// LoginScreen renders its own full-bleed gradient background (no
// Appbar.Header at all - a login screen isn't part of the drawer, so
// there's nothing to navigate "up" to), so the native-stack header is
// hidden for it specifically. ForgotPasswordScreen has its own
// GradientHeader with a back action instead, same reasoning as the
// Documents/Attendance stacks elsewhere in the app.
export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}