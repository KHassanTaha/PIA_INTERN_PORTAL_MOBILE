/**
 * components/ScreenBackground.js
 *
 * Wraps a screen's content in the app-wide subtle cream gradient
 * (PIAGradients.background). This replaces the pattern every screen was
 * using so far — `container: { flex: 1, backgroundColor: PIAColors.offWhite }`
 * in each screen's own StyleSheet — with one shared component, so the
 * background treatment lives in exactly one place. If this changes again
 * later (a different tint, a different gradient angle), it changes here
 * once instead of in every screen file.
 *
 * Usage — replace this:
 *   <View style={styles.container}>...</View>
 *   // styles.container: { flex: 1, backgroundColor: PIAColors.offWhite }
 *
 * With this:
 *   <ScreenBackground>...</ScreenBackground>
 *   // drop backgroundColor from styles.container entirely (keep flex: 1
 *   // if the screen's layout needs it on an inner View)
 *
 * Screens still needing this update (flat PIAColors.offWhite ->
 * ScreenBackground): RequestDocumentsScreen, TasksScreen,
 * NotificationsScreen, ForgotPasswordScreen, ComingSoonScreen. Not a
 * blocking change - the flat color still looks correct today with the
 * new offWhite value, this just gets the subtler gradient everywhere
 * consistently when each gets touched next.
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { PIAGradients } from '../theme/theme';

export default function ScreenBackground({ children, style }) {
  return (
    <LinearGradient
      colors={PIAGradients.background}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[styles.fill, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});