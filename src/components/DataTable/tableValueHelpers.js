/**
 * Pure helpers for reading a cell's value off a row and comparing two
 * values for sorting. Kept separate from the hook/UI so they're easy to
 * unit test and reuse (e.g. if some future screen needs to sort a list
 * outside the table too).
 */

/**
 * Resolves a column's value for a given row. Supports either a plain
 * `key` (row[key]) or a computed `accessor(row)` function on the column
 * definition — accessor takes precedence if both are present.
 */
export function getColumnValue(column, row) {
  if (typeof column.accessor === 'function') {
    return column.accessor(row);
  }
  return row?.[column.key];
}

/**
 * Compares two values according to a column's declared `type`
 * ('string' | 'number' | 'date'). Defaults to string comparison, which
 * covers plain text columns without any config needed.
 */
export function compareValues(a, b, type = 'string') {
  const aIsNil = a === null || a === undefined;
  const bIsNil = b === null || b === undefined;
  if (aIsNil && bIsNil) return 0;
  if (aIsNil) return -1;
  if (bIsNil) return 1;

  switch (type) {
    case 'number': {
      const an = Number(a);
      const bn = Number(b);
      return an - bn;
    }
    case 'date': {
      const at = new Date(a).getTime();
      const bt = new Date(b).getTime();
      return at - bt;
    }
    case 'string':
    default:
      return String(a).localeCompare(String(b), undefined, {
        sensitivity: 'base',
        numeric: true,
      });
  }
}
