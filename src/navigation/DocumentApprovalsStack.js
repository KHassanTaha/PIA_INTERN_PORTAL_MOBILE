import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DocumentApprovalsScreen from '../screens/staff/DocumentApprovalsScreen';
import DocumentReviewScreen from '../screens/staff/DocumentReviewScreen';

const Stack = createNativeStackNavigator();

export default function DocumentApprovalsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DocumentApprovalsList" component={DocumentApprovalsScreen} />
      <Stack.Screen name="DocumentReview" component={DocumentReviewScreen} />
    </Stack.Navigator>
  );
}