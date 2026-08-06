import React, { useMemo } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import DataTableSearch from './DataTableSearch';
import DataTableHeader, { ACTIONS_COLUMN_WIDTH } from './DataTableHeader';
import DataTableRow from './DataTableRow';
import DataTableFooter from './DataTableFooter';
import DataTableEmpty from './DataTableEmpty';
import { useTableData } from './useTableData';

/**
 * DataTable — the single reusable table used across every module in the
 * app (Interns, Employees, Attendance, Tasks, Documents, Notifications,
 * Approvals, Gate Passes, Signature Requests, Audit Logs, etc.). Do not
 * build a one-off table for a new screen — add columns/rowActions here
 * instead, so every table keeps identical styling, search, sort, and
 * pagination behavior for free.
 *
 * --- Column shape ---
 * {
 *   key: 'name',              // required, unique. Also used as row[key]
 *                              // unless `accessor` is given.
 *   label: 'Name',             // required, header text
 *   width: 140,                // px, optional (defaults to 120)
 *   type: 'string'|'number'|'date',  // optional, drives sort comparison
 *                                     // (defaults to 'string')
 *   sortable: true,            // optional, per-column override
 *   searchable: true,          // optional, per-column override — set
 *                              // false to exclude a column from search
 *   accessor: (row) => value,  // optional, for computed/nested values
 *   render: (value, row) => <ReactNode/>, // optional custom cell
 * }
 *
 * --- IMPORTANT: sizing ---
 * DataTable fills its parent (`flex: 1`) and manages its own internal
 * scrolling — the screen around it should NOT be a ScrollView, or you'll
 * get the classic RN bug where the whole page grows to fit every row.
 * Give DataTable's parent a bounded height (e.g. the screen's root View
 * with flex: 1) and let DataTable handle scrolling itself.
 *
 * @param {object[]} columns
 * @param {object[]} data
 * @param {boolean} [loading=false]
 * @param {number} [pageSize=10] - initial page size
 * @param {{key: string, direction: 'asc'|'desc'}} [defaultSort]
 * @param {boolean} [searchable=true]
 * @param {boolean} [sortable=true]
 * @param {boolean} [pagination=true]
 * @param {(row: object) => React.ReactNode} [rowActions] - renders
 *        whatever action buttons the parent screen needs (View/Edit/
 *        Delete/Approve/Reject...); DataTable just reserves the column
 *        and renders what's returned.
 * @param {string} [emptyMessage] - shown when `data` is empty (a
 *        separate, distinct message is shown automatically when a
 *        search simply has no matches).
 * @param {(row: object, index: number) => string} [keyExtractor] -
 *        defaults to row.id, falling back to the row's index.
 * @param {object} [style] - applied to the outer container.
 */
export default function DataTable({
  columns,
  data,
  loading = false,
  pageSize = 10,
  defaultSort,
  searchable = true,
  sortable = true,
  pagination = true,
  rowActions,
  emptyMessage,
  keyExtractor,
  style,
}) {
  const theme = useTheme();

  const {
    searchQuery,
    setSearchQuery,
    sortState,
    toggleSort,
    page,
    setPage,
    pageSize: currentPageSize,
    changePageSize,
    pageRows,
    totalRecords,
    totalPages,
    startIndex,
    endIndex,
    isSearchActive,
    pageSizeOptions,
  } = useTableData(data, columns, { searchable, sortable, pagination, pageSize, defaultSort });

  const tableWidth = useMemo(() => {
    const columnsWidth = columns.reduce((sum, col) => sum + (col.width || 120), 0);
    return columnsWidth + (rowActions ? ACTIONS_COLUMN_WIDTH : 0);
  }, [columns, rowActions]);

  const defaultKeyExtractor = (row, index) =>
    row?.id !== undefined && row?.id !== null ? String(row.id) : String(index);
  const resolvedKeyExtractor = keyExtractor || defaultKeyExtractor;

  const showEmptyState = !loading && pageRows.length === 0;

  return (
    <View style={[styles.container, style]}>
      {searchable && (
        <DataTableSearch value={searchQuery} onChangeText={setSearchQuery} />
      )}

      <View style={styles.tableWrapper}>
        <ScrollView
          horizontal
          style={styles.horizontalScroll}
          contentContainerStyle={styles.horizontalScrollContent}
          showsHorizontalScrollIndicator
        >
          <View style={[{ width: tableWidth }, styles.tableInner]}>
            <FlatList
              style={styles.flatList}
              data={pageRows}
              keyExtractor={resolvedKeyExtractor}
              stickyHeaderIndices={[0]}
              ListHeaderComponent={
                <DataTableHeader
                  columns={columns}
                  sortable={sortable}
                  sortState={sortState}
                  onToggleSort={toggleSort}
                  hasActions={Boolean(rowActions)}
                />
              }
              renderItem={({ item, index }) => (
                <DataTableRow
                  row={item}
                  columns={columns}
                  rowActions={rowActions}
                  isEven={index % 2 === 1}
                />
              )}
              ListEmptyComponent={
                showEmptyState ? (
                  <DataTableEmpty
                    isSearchActive={isSearchActive}
                    searchQuery={searchQuery}
                    emptyMessage={emptyMessage}
                  />
                ) : null
              }
            />
          </View>
        </ScrollView>

        {loading && (
          <View
            style={[
              styles.loadingOverlay,
              { backgroundColor: theme.colors.background + 'CC' },
            ]}
          >
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        )}
      </View>

      {pagination && !showEmptyState && (
        <DataTableFooter
          page={page}
          totalPages={totalPages}
          totalRecords={totalRecords}
          startIndex={startIndex}
          endIndex={endIndex}
          pageSize={currentPageSize}
          pageSizeOptions={pageSizeOptions}
          onChangePage={setPage}
          onChangePageSize={changePageSize}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tableWrapper: {
    flex: 1,
  },
  horizontalScroll: {
    flex: 1,
  },
  horizontalScrollContent: {
    flexGrow: 1,
  },
  flatList: {
    flex: 1,
  },
  tableInner: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
