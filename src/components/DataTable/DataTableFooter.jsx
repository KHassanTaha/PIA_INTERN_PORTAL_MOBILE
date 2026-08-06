import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton, Menu, Text, TouchableRipple, useTheme } from 'react-native-paper';

export default function DataTableFooter({
  page,
  totalPages,
  totalRecords,
  startIndex,
  endIndex,
  pageSize,
  pageSizeOptions,
  onChangePage,
  onChangePageSize,
}) {
  const theme = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={[styles.container, { borderTopColor: theme.colors.outlineVariant }]}>
      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
        {totalRecords === 0
          ? '0 records'
          : `Showing ${startIndex}–${endIndex} of ${totalRecords}`}
      </Text>

      <View style={styles.controls}>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <TouchableRipple onPress={() => setMenuVisible(true)} style={styles.pageSizeButton}>
              <View style={styles.pageSizeButtonInner}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {pageSize} / page
                </Text>
                <IconButton icon="menu-down" size={16} style={styles.pageSizeIcon} />
              </View>
            </TouchableRipple>
          }
        >
          {pageSizeOptions.map((size) => (
            <Menu.Item
              key={size}
              onPress={() => {
                onChangePageSize(size);
                setMenuVisible(false);
              }}
              title={`${size} / page`}
              trailingIcon={size === pageSize ? 'check' : undefined}
            />
          ))}
        </Menu>

        <IconButton
          icon="chevron-left"
          size={20}
          disabled={page <= 1}
          onPress={() => onChangePage(page - 1)}
        />
        <Text variant="bodySmall" style={styles.pageIndicator}>
          {page} / {totalPages}
        </Text>
        <IconButton
          icon="chevron-right"
          size={20}
          disabled={page >= totalPages}
          onPress={() => onChangePage(page + 1)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopWidth: 1,
    flexWrap: 'wrap',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageSizeButton: {
    borderRadius: 8,
    marginRight: 4,
  },
  pageSizeButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  pageSizeIcon: {
    margin: 0,
  },
  pageIndicator: {
    minWidth: 44,
    textAlign: 'center',
  },
});
