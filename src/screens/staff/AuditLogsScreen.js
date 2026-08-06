import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import DataTable from '../../components/DataTable';
import { GradientHeader } from '../../components/Gradients';
import { fetchAuditLogsThunk, selectAuditLogs } from '../../store/slices/staffDataSlice';
import { PIAColors, PIAGradients } from '../../theme/theme';

export default function AuditLogsScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { items, status, error } = useSelector(selectAuditLogs);

  useEffect(() => {
    dispatch(fetchAuditLogsThunk());
  }, [dispatch]);

  const columns = [
    {
      key: 'timestamp',
      label: 'When',
      width: 150,
      type: 'date',
      render: (value) => new Date(value).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
    },
    { key: 'actor', label: 'Actor', width: 120 },
    { key: 'action', label: 'Action', width: 220 },
    { key: 'target', label: 'Target', width: 150 },
  ];

  return (
    <View style={styles.container}>
      <GradientHeader gradient={PIAGradients.primaryDark}>
        <Appbar.Action icon="menu" color={PIAColors.white} onPress={() => navigation.openDrawer()} />
        <Appbar.Content title="Audit Logs" titleStyle={styles.headerTitle} />
      </GradientHeader>

      <DataTable
        columns={columns}
        data={items}
        loading={status === 'loading'}
        defaultSort={{ key: 'timestamp', direction: 'desc' }}
        emptyMessage={error ? `Couldn't load audit logs: ${error}` : 'No activity recorded yet.'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PIAColors.offWhite },
  headerTitle: { color: PIAColors.white, fontWeight: '700' },
});