import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import DataTable from '../../components/DataTable';
import { GradientHeader } from '../../components/Gradients';
import StatusChip from '../../components/StatusChip';
import { isTaskOverdue, TASK_STAGE_META } from '../../constants/taskStages';
import { fetchStaffTasksThunk, selectStaffTasks } from '../../store/slices/staffDataSlice';
import { PIAColors, PIAGradients } from '../../theme/theme';

const PRIORITY_COLOR = { High: PIAColors.error, Medium: PIAColors.gold, Low: PIAColors.greenLight };

export default function TasksOverviewScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { items, status, error } = useSelector(selectStaffTasks);

  useEffect(() => {
    dispatch(fetchStaffTasksThunk());
  }, [dispatch]);

  const columns = [
    { key: 'title', label: 'Task', width: 200 },
    { key: 'internName', label: 'Intern', width: 140 },
    {
      key: 'priority',
      label: 'Priority',
      width: 110,
      render: (value) => <StatusChip label={value} color={PRIORITY_COLOR[value] || PIAColors.ink} />,
    },
    {
      key: 'stage',
      label: 'Stage',
      width: 130,
      render: (value) => {
        const meta = TASK_STAGE_META[value];
        return <StatusChip label={meta.label} icon={meta.icon} color={meta.color} />;
      },
    },
    {
      key: 'dueDate',
      label: 'Due',
      width: 150,
      type: 'date',
      render: (value, row) => (
        <StatusChip
          label={new Date(value).toLocaleDateString()}
          color={isTaskOverdue({ dueDate: value, stage: row.stage }) ? PIAColors.error : PIAColors.ink}
        />
      ),
    },
  ];

  return (
    <View style={styles.container}>
      <GradientHeader gradient={PIAGradients.primaryDark}>
        <Appbar.Action icon="menu" color={PIAColors.white} onPress={() => navigation.openDrawer()} />
        <Appbar.Content title="Tasks" titleStyle={styles.headerTitle} />
      </GradientHeader>

      <DataTable
        columns={columns}
        data={items}
        loading={status === 'loading'}
        defaultSort={{ key: 'dueDate', direction: 'asc' }}
        emptyMessage={error ? `Couldn't load tasks: ${error}` : 'No tasks found.'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PIAColors.offWhite },
  headerTitle: { color: PIAColors.white, fontWeight: '700' },
});