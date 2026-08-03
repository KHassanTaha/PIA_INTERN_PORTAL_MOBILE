import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DocumentsHomeScreen from '../screens/documents/DocumentsHomeScreen';
import UploadDocumentsScreen from '../screens/documents/UploadDocumentsScreen';
import RequestDocumentsScreen from '../screens/documents/RequestDocumentsScreen';

const Stack = createNativeStackNavigator();

// Each screen renders its own Appbar.Header (react-native-paper), so the
// native-stack header is hidden here to avoid a doubled header bar.
export default function DocumentsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DocumentsHome" component={DocumentsHomeScreen} />
      <Stack.Screen name="UploadDocuments" component={UploadDocumentsScreen} />
      <Stack.Screen name="RequestDocuments" component={RequestDocumentsScreen} />
    </Stack.Navigator>
  );
}
