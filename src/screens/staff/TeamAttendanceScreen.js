import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import DataTable from '../../components/DataTable';
import { GradientHeader } from '../../components/Gradients';
import StatusChip from '../../components/StatusChip';
import { fetchTeamAttendanceThunk, selectTeamAttendance } from '../../store/slices/staffDataSlice';
import { PIAColors, PIAGradients } from '../../theme/theme';

const STATUS_META = {
  Present: { color: PIAColors.green, icon: 'check-circle-outline' },
  Absent: { color: PIAColors.error, icon: 'close-circle-outline' },
  Excused: { color: PIAColors.gold, icon: 'information-outline' },
};

export default function TeamAttendanceScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { items, status, error } = useSelector(selectTeamAttendance);

  useEffect(() => {
    dispatch(fetchTeamAttendanceThunk());
  }, [dispatch]);

  const columns = [
    { key: 'internName', label: 'Intern', width: 160 },
    { key: 'date', label: 'Date', width: 120, type: 'date' },
    {
      key: 'checkInTime',
      label: 'Check-In',
      width: 110,
      type: 'date',
      accessor: (row) => row.checkInTime,
      render: (value) => (value ? new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'),
    },
    {
      key: 'status',
      label: 'Status',
      width: 130,
      render: (value) => (
        <StatusChip label={value} icon={STATUS_META[value]?.icon} color={STATUS_META[value]?.color || PIAColors.ink} />
      ),
    },
  ];

  return (
    <View style={styles.container}>
      <GradientHeader gradient={PIAGradients.primaryDark}>
        <Appbar.Action icon="menu" color={PIAColors.white} onPress={() => navigation.openDrawer()} />
        <Appbar.Content title="Team Attendance" titleStyle={styles.headerTitle} />
      </GradientHeader>

      <DataTable
        columns={columns}
        data={items}
        loading={status === 'loading'}
        defaultSort={{ key: 'date', direction: 'desc' }}
        emptyMessage={error ? `Couldn't load attendance: ${error}` : 'No attendance records found.'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PIAColors.offWhite },
  headerTitle: { color: PIAColors.white, fontWeight: '700' },
});