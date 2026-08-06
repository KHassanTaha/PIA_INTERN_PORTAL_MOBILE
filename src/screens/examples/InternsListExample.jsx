import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import DataTable from '../../components/DataTable';
import { GradientHeader } from '../../components/Gradients';
import StatusChip from '../../components/StatusChip';
import { PIAColors, PIAGradients } from '../../theme/theme';

/**
 * Reference implementation showing how a real module wires up DataTable.
 * Not meant to ship as-is — copy this pattern for Employees, Attendance,
 * Tasks, Documents, Approvals, etc. The parts every module customizes:
 * `columns`, `data` (from your API/Redux), and `rowActions`. Everything
 * else — search, sort, pagination, loading/empty states, styling — comes
 * free from DataTable.
 *
 * Two things fixed from the original draft, worth carrying into every
 * other module built from this pattern:
 *   1. Header is GradientHeader, not a plain Appbar.Header — matches
 *      every other screen in the app (Login, Tasks, Notifications,
 *      Attendance, Approvals). A bare Appbar.Header here would be the
 *      one screen in the app with a flat, off-brand header.
 *   2. Status is the app's real components/StatusChip.js, not a local
 *      reinvention — a from-scratch "StatusChip" defined inside this
 *      file would shadow the actual shared component and drift from it
 *      over time (no color-coding by status, for one).
 */

const STATUS_COLOR = {
  Active: PIAColors.green,
  Completed: PIAColors.greenLight,
};

const MOCK_INTERNS = [
  { id: 1, name: 'Ayesha Khan', department: 'IT', startDate: '2026-06-01', status: 'Active' },
  { id: 2, name: 'Bilal Ahmed', department: 'HR', startDate: '2026-05-15', status: 'Active' },
  { id: 3, name: 'Zainab Malik', department: 'Finance', startDate: '2026-07-01', status: 'Completed' },
  { id: 4, name: 'Hassan Raza', department: 'IT', startDate: '2026-06-10', status: 'Active' },
  { id: 5, name: 'Sana Tariq', department: 'Marketing', startDate: '2026-04-20', status: 'Completed' },
  // ...a real screen loads this from the API/Redux instead of a mock array
];

function InternRowActions({ row, onView, onEdit, onDelete }) {
  return (
    <>
      <IconButton icon="eye-outline" size={18} onPress={() => onView(row)} />
      <IconButton icon="pencil-outline" size={18} onPress={() => onEdit(row)} />
      <IconButton icon="delete-outline" size={18} onPress={() => onDelete(row)} />
    </>
  );
}

export default function InternsListExample() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  // Column widths are explicit px — React Native has no browser-style
  // auto table layout, so each column declares how wide it should be.
  const columns = [
    { key: 'name', label: 'Name', width: 160 },
    { key: 'department', label: 'Department', width: 130 },
    {
      key: 'startDate',
      label: 'Start Date',
      width: 120,
      type: 'date', // drives correct chronological (not alphabetical) sort
    },
    {
      key: 'status',
      label: 'Status',
      width: 130,
      render: (value) => <StatusChip label={value} color={STATUS_COLOR[value] || PIAColors.ink} />,
    },
  ];

  const handleView = useCallback((row) => console.log('view', row.id), []);
  const handleEdit = useCallback((row) => console.log('edit', row.id), []);
  const handleDelete = useCallback((row) => console.log('delete', row.id), []);

  // useCallback here matters, not just style: DataTableRow is
  // React.memo'd specifically so large tables don't re-render every row
  // on every keystroke/sort/page change. If rowActions is a fresh inline
  // function every render (as in the original draft), every row still
  // re-renders anyway and that memo does nothing — wrapping the render
  // function itself in useCallback, keyed on the three handlers above
  // (also stable via useCallback), is what actually makes the memo pay
  // off. Carry this into every other module, not just this example.
  const renderRowActions = useCallback(
    (row) => (
      <InternRowActions row={row} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
    ),
    [handleView, handleEdit, handleDelete],
  );

  return (
    <View style={styles.container}>
      <GradientHeader gradient={PIAGradients.primaryDark}>
        <Appbar.Action icon="menu" color={PIAColors.white} onPress={() => navigation.openDrawer()} />
        <Appbar.Content title="Interns" titleStyle={styles.headerTitle} />
      </GradientHeader>

      <DataTable
        columns={columns}
        data={MOCK_INTERNS}
        loading={loading}
        pageSize={10}
        defaultSort={{ key: 'startDate', direction: 'desc' }}
        emptyMessage="No interns found."
        rowActions={renderRowActions}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PIAColors.offWhite },
  headerTitle: { color: PIAColors.white, fontWeight: '700' },
});