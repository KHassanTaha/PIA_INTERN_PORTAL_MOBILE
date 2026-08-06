/**
 * components/Gradients.js
 *
 * Shared gradient building blocks on top of react-native-paper, since
 * Paper's theme has no native gradient concept. Every screen that wants a
 * gradient look imports from here instead of calling LinearGradient
 * directly - keeps the gradient-wiring in exactly one place instead of
 * repeated per-screen.
 *
 * Colors always come from PIAGradients (theme.js) - never pass raw hex
 * pairs at a call site, so a future palette change only touches theme.js.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Appbar, Text, TouchableRipple } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { PIAColors, PIAGradients } from '../theme/theme';

/**
 * Vertical gradient accent sliver, for the left edge of a Card.
 * Usage: <GradientAccentBar gradient={PIAGradients.primary} />
 */
export function GradientAccentBar({ gradient }) {
  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.accentBar}
    />
  );
}

/**
 * Icon-in-a-tinted-circle badge. Not itself a gradient, but grouped here
 * since it's always paired with GradientAccentBar in the current design
 * (see RequestDocumentsScreen) - keeps that pairing defined in one place.
 */
export function IconBadge({ icon, tint, color }) {
  return (
    <View style={[styles.iconBadge, { backgroundColor: tint }]}>
      <Icon name={icon} size={26} color={color} />
    </View>
  );
}

/**
 * Gradient-filled "contained" button. react-native-paper's Button has no
 * gradient-fill mode, so this rebuilds just enough of it: LinearGradient
 * for the fill, TouchableRipple for press feedback, Paper-consistent
 * type/spacing. `disabled` swaps to PIAGradients.disabled automatically -
 * never pass a raw color for the disabled state at the call site.
 *
 * FIXES applied here (previously): explicit rippleColor - the default
 * ripple was too close to the gradient's own colors to read as visible
 * feedback on press, which is why buttons across the app felt
 * unresponsive even though onPress was firing correctly. `loading` prop
 * added for the same reason - a picker/network action with no visual
 * change while it's in flight (e.g. the camera opening) reads as "did
 * nothing happened" even when it's working.
 *
 * NOTE: this component no longer applies its own marginTop - it
 * previously baked in a 14px top margin unconditionally, which is
 * exactly why two buttons placed side-by-side in a row (one
 * GradientButton, one plain button) misaligned vertically: only one of
 * them had the invisible offset. Spacing is now the CALLER's
 * responsibility (wrap in a View with the margin you want) - if you're
 * placing this next to another button, give both the same explicit
 * layout instead of relying on this component's internal margin.
 */
export function GradientButton({ icon, label, gradient, onPress, disabled, loading }) {
  return (
    <TouchableRipple
      onPress={disabled || loading ? undefined : onPress}
      disabled={disabled || loading}
      borderless
      rippleColor={PIAColors.white + '55'}
      style={styles.buttonWrapper}
    >
      <LinearGradient
        colors={disabled ? PIAGradients.disabled : gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.button}
      >
        {loading ? (
          <ActivityIndicator size={16} color={PIAColors.white} style={styles.buttonIcon} />
        ) : (
          <Icon
            name={icon}
            size={18}
            color={disabled ? PIAColors.ink + '55' : PIAColors.white}
            style={styles.buttonIcon}
          />
        )}
        <Text style={[styles.buttonLabel, disabled && styles.buttonLabelDisabled]}>
          {label}
        </Text>
      </LinearGradient>
    </TouchableRipple>
  );
}

/**
 * Gradient-filled Appbar.Header drop-in replacement. Usage is identical
 * to a normal Appbar.Header - pass children (Appbar.BackAction,
 * Appbar.Content, etc) exactly as you would to the real thing.
 */
export function GradientHeader({ gradient, children, ...appbarProps }) {
  return (
    <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
      <Appbar.Header
        mode="center-aligned"
        statusBarHeight={0}
        style={styles.transparentHeader}
        {...appbarProps}
      >
        {children}
      </Appbar.Header>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonWrapper: { borderRadius: 14, overflow: 'hidden' },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
  },
  buttonIcon: { marginRight: 8 },
  buttonLabel: { color: PIAColors.white, fontWeight: '700', fontSize: 15 },
  buttonLabelDisabled: { color: PIAColors.ink + '55' },
  transparentHeader: { backgroundColor: 'transparent', elevation: 0 },
});