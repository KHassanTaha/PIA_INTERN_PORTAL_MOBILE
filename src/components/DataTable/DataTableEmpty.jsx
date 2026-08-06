import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function DataTableEmpty({ isSearchActive, searchQuery, emptyMessage }) {
  const theme = useTheme();

  const message = isSearchActive
    ? `No results for "${searchQuery.trim()}"`
    : emptyMessage || 'No records to display.';

  return (
    <View style={styles.container}>
      <Icon
        name={isSearchActive ? 'file-search-outline' : 'table-off'}
        size={40}
        color={theme.colors.onSurfaceVariant}
      />
      <Text
        variant="bodyMedium"
        style={[styles.message, { color: theme.colors.onSurfaceVariant }]}
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    marginTop: 12,
    textAlign: 'center',
  },
});
