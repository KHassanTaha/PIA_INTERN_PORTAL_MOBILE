import React, { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { HelperText, TextInput, TouchableRipple, useTheme } from 'react-native-paper';
// NEW NATIVE DEPENDENCY — not yet installed. Run:
//   npm install @react-native-community/datetimepicker
// then a native rebuild (cd android && ./gradlew clean, or full
// npx react-native run-android) — same pattern as every other native
// module added to this project (vision-camera, geolocation, linear-gradient).
import DateTimePicker from '@react-native-community/datetimepicker';

function formatDate(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString();
}

export function FormDatePicker({
  label,
  value,
  onChange,
  error,
  required = false,
  minimumDate,
  maximumDate,
  style,
}) {
  const theme = useTheme();
  const [pickerVisible, setPickerVisible] = useState(false);

  const handlePickerChange = (event, selectedDate) => {
    setPickerVisible(Platform.OS === 'ios');
    if (event.type === 'dismissed') return;
    if (selectedDate) onChange(selectedDate);
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableRipple onPress={() => setPickerVisible(true)}>
        <View pointerEvents="none">
          <TextInput
            mode="outlined"
            label={required ? `${label} *` : label}
            value={formatDate(value)}
            editable={false}
            error={!!error}
            right={<TextInput.Icon icon="calendar" />}
            outlineStyle={styles.inputOutline}
            outlineColor={theme.colors.outline}
            activeOutlineColor={theme.colors.primary}
          />
        </View>
      </TouchableRipple>
      <HelperText type="error" visible={!!error}>
        {error || ' '}
      </HelperText>
      {pickerVisible && (
        <DateTimePicker
          value={value instanceof Date ? value : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={handlePickerChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 4 },
  inputOutline: { borderRadius: 14 },
});