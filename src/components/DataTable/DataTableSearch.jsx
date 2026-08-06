import React from 'react';
import { StyleSheet } from 'react-native';
import { Searchbar } from 'react-native-paper';

export default function DataTableSearch({ value, onChangeText, placeholder }) {
  return (
    <Searchbar
      placeholder={placeholder || 'Search'}
      value={value}
      onChangeText={onChangeText}
      style={styles.searchbar}
      elevation={0}
    />
  );
}

const styles = StyleSheet.create({
  searchbar: {
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 8,
  },
});
