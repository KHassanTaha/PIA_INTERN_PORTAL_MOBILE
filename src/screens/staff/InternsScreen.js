import React, { useCallback, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, IconButton } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import DataTable from '../../components/DataTable';
import { GradientHeader } from '../../components/Gradients';
import StatusChip from '../../components/StatusChip';
import { fetchInternsThunk, selectInterns } from '../../store/slices/staffDataSlice';
import { PIAColors, PIAGradients } from '../../theme/theme';

const STATUS_COLOR = { Active: PIAColors.green, Completed: PIAColors.greenLight };

function InternRowActions({ row }) {
  return (
    <>
      <IconButton icon="eye-outline" size={18} onPress={() => console.log('view intern', row.id)} />
      <IconButton icon="pencil-outline" size={18} onPress={() => console.log('edit intern', row.id)} />
    </>
  );
}

export default function InternsScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { items, status, error } = useSelector(selectInterns);

  useEffect(() => {
    dispatch(fetchInternsThunk());
  }, [dispatch]);

  const columns = [
    { key: 'name', label: 'Name', width: 160 },
    { key: 'department', label: 'Department', width: 120 },
    { key: 'mentor', label: 'Mentor', width: 130 },
    { key: 'startDate', label: 'Start Date', width: 120, type: 'date' },
    {
      key: 'status',
      label: 'Status',
      width: 120,
      render: (value) => <StatusChip label={value} color={STATUS_COLOR[value] || PIAColors.ink} />,
    },
  ];

  const renderRowActions = useCallback((row) => <InternRowActions row={row} />, []);

  return (
    <View style={styles.container}>
      <GradientHeader gradient={PIAGradients.primaryDark}>
        <Appbar.Action icon="menu" color={PIAColors.white} onPress={() => navigation.openDrawer()} />
        <Appbar.Content title="Interns" titleStyle={styles.headerTitle} />
      </GradientHeader>

      <DataTable
        columns={columns}
        data={items}
        loading={status === 'loading'}
        defaultSort={{ key: 'name', direction: 'asc' }}
        emptyMessage={error ? `Couldn't load interns: ${error}` : 'No interns found.'}
        rowActions={renderRowActions}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PIAColors.offWhite },
  headerTitle: { color: PIAColors.white, fontWeight: '700' },
});