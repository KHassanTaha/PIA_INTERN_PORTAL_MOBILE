import { useMemo, useState, useEffect } from 'react';
import { compareValues, getColumnValue } from './tableValueHelpers';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

/**
 * All the non-visual logic for DataTable: search filtering, sorting,
 * and pagination — as one hook so DataTable.jsx stays a thin rendering
 * layer. Deliberately framework-agnostic beyond React itself (no Paper,
 * no navigation) so it's easy to reason about and test in isolation.
 *
 * @param {object[]} data - raw rows
 * @param {object[]} columns - column definitions (see DataTable.jsx for shape)
 * @param {object} options
 * @param {boolean} options.searchable
 * @param {boolean} options.sortable
 * @param {boolean} options.pagination
 * @param {number} options.pageSize - initial/default page size
 * @param {{key: string, direction: 'asc'|'desc'}} [options.defaultSort]
 */
export function useTableData(
  data,
  columns,
  { searchable, sortable, pagination, pageSize: initialPageSize, defaultSort },
) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortState, setSortState] = useState(defaultSort ?? null); // { key, direction } | null
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize || 10);

  const searchableColumns = useMemo(
    () => columns.filter((c) => c.searchable !== false),
    [columns],
  );

  // --- filter ---
  const filteredData = useMemo(() => {
    if (!searchable || !searchQuery.trim()) return data;
    const q = searchQuery.trim().toLowerCase();
    return data.filter((row) =>
      searchableColumns.some((col) => {
        const value = getColumnValue(col, row);
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(q);
      }),
    );
  }, [data, searchable, searchQuery, searchableColumns]);

  // --- sort ---
  const sortedData = useMemo(() => {
    if (!sortable || !sortState) return filteredData;
    const column = columns.find((c) => c.key === sortState.key);
    if (!column) return filteredData;

    const sorted = [...filteredData].sort((rowA, rowB) => {
      const result = compareValues(
        getColumnValue(column, rowA),
        getColumnValue(column, rowB),
        column.type,
      );
      return sortState.direction === 'desc' ? -result : result;
    });
    return sorted;
  }, [filteredData, sortable, sortState, columns]);

  // --- pagination ---
  const totalRecords = sortedData.length;
  const totalPages = pagination ? Math.max(1, Math.ceil(totalRecords / pageSize)) : 1;

  // Keep the current page in range whenever the underlying result set
  // shrinks (new search, filtered dataset, smaller page size, etc.).
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  // Any change to search or sort should land the user back on page 1 —
  // otherwise "page 4" of a brand new search result is usually empty
  // and confusing.
  useEffect(() => {
    setPage(1);
  }, [searchQuery, sortState]);

  const pageRows = useMemo(() => {
    if (!pagination) return sortedData;
    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, pagination, page, pageSize]);

  const startIndex = totalRecords === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, totalRecords);

  function toggleSort(key) {
    if (!sortable) return;
    setSortState((current) => {
      if (!current || current.key !== key) return { key, direction: 'asc' };
      if (current.direction === 'asc') return { key, direction: 'desc' };
      return null; // third click clears sort
    });
  }

  function changePageSize(nextSize) {
    setPageSize(nextSize);
    setPage(1);
  }

  return {
    searchQuery,
    setSearchQuery,
    sortState,
    toggleSort,
    page,
    setPage,
    pageSize,
    changePageSize,
    pageRows,
    totalRecords,
    filteredCount: filteredData.length,
    totalPages,
    startIndex,
    endIndex,
    isSearchActive: searchable && searchQuery.trim().length > 0,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
  };
}
