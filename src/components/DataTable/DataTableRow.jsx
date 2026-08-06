import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { getColumnValue } from './tableValueHelpers';
import { ACTIONS_COLUMN_WIDTH } from './DataTableHeader';

function DataTableRow({ row, columns, rowActions, isEven }) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.row,
        { borderBottomColor: theme.colors.outlineVariant },
        isEven && { backgroundColor: theme.colors.surface },
      ]}
    >
      {columns.map((column) => {
        const value = getColumnValue(column, row);
        return (
          <View key={column.key} style={[styles.cell, { width: column.width || 120 }]}>
            {column.render ? (
              column.render(value, row)
            ) : (
              <Text
                variant="bodyMedium"
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{ color: theme.colors.onSurface }}
              >
                {value === null || value === undefined || value === '' ? '—' : String(value)}
              </Text>
            )}
          </View>
        );
      })}
      {rowActions && (
        <View style={[styles.cell, styles.actionsCell, { width: ACTIONS_COLUMN_WIDTH }]}>
          {rowActions(row)}
        </View>
      )}
    </View>
  );
}

// Rows re-render constantly during scroll; memo keeps that cheap for
// large datasets since a row only needs to update when its own data,
// columns, or actions renderer actually change.
export default React.memo(DataTableRow);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    minHeight: 48,
  },
  cell: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  actionsCell: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
