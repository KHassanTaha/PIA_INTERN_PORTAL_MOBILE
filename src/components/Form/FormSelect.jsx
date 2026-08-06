import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { HelperText, Menu, TextInput, TouchableRipple, useTheme } from 'react-native-paper';

/**
 * Menu-anchored dropdown, matching DataTableFooter.jsx's exact pattern:
 * TouchableRipple wraps a non-interactive display (pointerEvents="none"
 * inner View) that opens a Menu on press. `options` — array of
 * { label, value }.
 */
export function FormSelect({
  label,
  value,
  onSelect,
  options = [],
  error,
  required = false,
  style,
}) {
  const theme = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <View style={[styles.container, style]}>
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <TouchableRipple onPress={() => setMenuVisible(true)}>
            <View pointerEvents="none">
              <TextInput
                mode="outlined"
                label={required ? `${label} *` : label}
                value={selectedOption?.label ?? ''}
                editable={false}
                error={!!error}
                right={<TextInput.Icon icon="chevron-down" />}
                outlineStyle={styles.inputOutline}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
              />
            </View>
          </TouchableRipple>
        }
      >
        {options.map((opt) => (
          <Menu.Item
            key={String(opt.value)}
            title={opt.label}
            trailingIcon={opt.value === value ? 'check' : undefined}
            onPress={() => {
              onSelect(opt.value);
              setMenuVisible(false);
            }}
          />
        ))}
      </Menu>
      <HelperText type="error" visible={!!error}>
        {error || ' '}
      </HelperText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 4 },
  inputOutline: { borderRadius: 14 },
});