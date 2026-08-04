/**
 * PIA Intern Portal — App root
 * @format
 */

import React from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import RootNavigator from './src/navigation/RootNavigator';
import { persistor, store } from './src/store/store';
import { piaTheme } from './src/theme/theme';
import { useSyncQueue } from './src/services/syncQueue';
import { useNotificationPolling } from './src/hooks/UseNotificationPolling';

function AppShell() {
  useSyncQueue(); // starts the offline write-then-sync engine
  useNotificationPolling();
  return <RootNavigator />;
}

function PersistLoading() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={piaTheme.colors.primary} />
    </View>
  );
}

export default function App() {
  return (
    // Required at the app root by react-navigation's Drawer (uses
    // react-native-gesture-handler internally for the swipe-to-open
    // gesture) — the earlier bottom-tabs POC didn't need this.
    <GestureHandlerRootView style={styles.flexFill}>
      <ReduxProvider store={store}>
        <PersistGate loading={<PersistLoading />} persistor={persistor}>
          <PaperProvider theme={piaTheme}>
            <SafeAreaProvider>
              <StatusBar barStyle="light-content" backgroundColor={piaTheme.colors.primary} />
              <AppShell />
            </SafeAreaProvider>
          </PaperProvider>
        </PersistGate>
      </ReduxProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flexFill: { flex: 1 },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
