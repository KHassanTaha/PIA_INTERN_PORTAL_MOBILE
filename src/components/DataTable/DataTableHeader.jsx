import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ACTIONS_COLUMN_WIDTH = 120;

function SortIcon({ active, direction, color }) {
  if (!active) {
    return <Icon name="unfold-more-horizontal" size={16} color={color} style={styles.sortIcon} />;
  }
  return (
    <Icon
      name={direction === 'asc' ? 'arrow-up' : 'arrow-down'}
      size={16}
      color={color}
      style={styles.sortIcon}
    />
  );
}

export default function DataTableHeader({ columns, sortable, sortState, onToggleSort, hasActions }) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.row,
        { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.outlineVariant },
      ]}
    >
      {columns.map((column) => {
        const columnSortable = sortable && column.sortable !== false;
        const isActive = sortState?.key === column.key;
        const content = (
          <View style={styles.headerCellInner}>
            <Text
              variant="labelLarge"
              style={[styles.headerLabel, { color: theme.colors.onSurface }]}
              numberOfLines={1}
            >
              {column.label}
            </Text>
            {columnSortable && (
              <SortIcon
                active={isActive}
                direction={sortState?.direction}
                color={isActive ? theme.colors.primary : theme.colors.onSurfaceVariant}
              />
            )}
          </View>
        );

        return (
          <View key={column.key} style={[styles.cell, { width: column.width || 120 }]}>
            {columnSortable ? (
              <Pressable
                onPress={() => onToggleSort(column.key)}
                android_ripple={{ color: theme.colors.surfaceVariant }}
                style={styles.pressable}
              >
                {content}
              </Pressable>
            ) : (
              content
            )}
          </View>
        );
      })}
      {hasActions && (
        <View style={[styles.cell, styles.actionsCell, { width: ACTIONS_COLUMN_WIDTH }]}>
          <Text variant="labelLarge" style={{ color: theme.colors.onSurface }}>
            Actions
          </Text>
        </View>
      )}
    </View>
  );
}

export { ACTIONS_COLUMN_WIDTH };

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  cell: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  actionsCell: {
    alignItems: 'center',
  },
  pressable: {
    flex: 1,
  },
  headerCellInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLabel: {
    fontWeight: '700',
    flexShrink: 1,
  },
  sortIcon: {
    marginLeft: 4,
  },
});
