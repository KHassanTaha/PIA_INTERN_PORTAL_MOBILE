import React, { useCallback, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, IconButton } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import DataTable from '../../components/DataTable';
import { GradientHeader } from '../../components/Gradients';
import {
  decideSignatureRequestThunk,
  fetchSignatureRequestsThunk,
  selectSignatureRequests,
} from '../../store/slices/staffDataSlice';
import { PIAColors, PIAGradients } from '../../theme/theme';

function SignatureRowActions({ row, onDecide }) {
  return (
    <>
      <IconButton icon="check" iconColor={PIAColors.green} size={20} onPress={() => onDecide(row.id, 'approve')} />
      <IconButton icon="close" iconColor={PIAColors.error} size={20} onPress={() => onDecide(row.id, 'reject')} />
    </>
  );
}

export default function SignaturesScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { items, status, error } = useSelector(selectSignatureRequests);

  useEffect(() => {
    dispatch(fetchSignatureRequestsThunk());
  }, [dispatch]);

  const handleDecide = useCallback(
    (id, decision) => dispatch(decideSignatureRequestThunk({ id, decision })),
    [dispatch],
  );

  const columns = [
    { key: 'employeeName', label: 'Employee', width: 160 },
    { key: 'designation', label: 'Designation', width: 190 },
    { key: 'submittedAt', label: 'Submitted', width: 130, type: 'date' },
  ];

  const renderRowActions = useCallback(
    (row) => <SignatureRowActions row={row} onDecide={handleDecide} />,
    [handleDecide],
  );

  return (
    <View style={styles.container}>
      <GradientHeader gradient={PIAGradients.primaryDark}>
        <Appbar.Action icon="menu" color={PIAColors.white} onPress={() => navigation.openDrawer()} />
        <Appbar.Content title="Signature Requests" titleStyle={styles.headerTitle} />
      </GradientHeader>

      <DataTable
        columns={columns}
        data={items}
        loading={status === 'loading'}
        defaultSort={{ key: 'submittedAt', direction: 'asc' }}
        emptyMessage={error ? `Couldn't load requests: ${error}` : 'No pending signature requests.'}
        rowActions={renderRowActions}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PIAColors.offWhite },
  headerTitle: { color: PIAColors.white, fontWeight: '700' },
});