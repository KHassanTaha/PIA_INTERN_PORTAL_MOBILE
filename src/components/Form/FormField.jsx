import React from 'react';
import { StyleSheet } from 'react-native';
import { HelperText, TextInput, useTheme } from 'react-native-paper';

/**
 * Matches LoginScreen.js's TextInput+HelperText pairing exactly: mode
 * "outlined", error surfaced via HelperText directly beneath the field,
 * rounded outline. Colors come from the active theme (useTheme()) rather
 * than importing PIAColors directly, per theme.js's guidance for any
 * component reading color roles Paper itself understands (outline,
 * surface, etc.) — only reach for PIAColors/PIAGradients when a value has
 * no Paper-theme equivalent.
 */
export function FormField({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  required = false,
  style,
  ...rest
}) {
  const theme = useTheme();

  return (
    <>
      <TextInput
        mode="outlined"
        label={required ? `${label} *` : label}
        value={value ?? ''}
        onChangeText={onChangeText}
        onBlur={onBlur}
        error={!!error}
        style={[styles.input, style]}
        outlineStyle={styles.inputOutline}
        outlineColor={theme.colors.outline}
        activeOutlineColor={theme.colors.primary}
        {...rest}
      />
      <HelperText type="error" visible={!!error}>
        {error || ' '}
      </HelperText>
    </>
  );
}

const styles = StyleSheet.create({
  input: { backgroundColor: 'transparent' },
  inputOutline: { borderRadius: 14 },
});