import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Appbar, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import { GradientHeader } from '../../components/Gradients';
import StatusChip from '../../components/StatusChip';
import TaskCard from '../../components/tasks/TaskCard';
import { isTaskOverdue, TASK_STAGE_META, TASK_STAGE_ORDER } from '../../constants/taskStages';
import {
  fetchMyTasksThunk,
  selectAllTasks,
  selectTasksError,
  selectTasksStatus,
  updateTaskStageThunk,
} from '../../store/slices/tasksSlice';
import { PIAColors, PIAGradients } from '../../theme/theme';

const FILTER_ALL = 'ALL';
const FILTER_OVERDUE = 'OVERDUE';

export default function TasksScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const tasks = useSelector(selectAllTasks);
  const status = useSelector(selectTasksStatus);
  const error = useSelector(selectTasksError);

  const [activeFilter, setActiveFilter] = useState(FILTER_ALL);

  useEffect(() => {
    dispatch(fetchMyTasksThunk());
  }, [dispatch]);

  const overdueCount = useMemo(() => tasks.filter(isTaskOverdue).length, [tasks]);

  const filteredTasks = useMemo(() => {
    if (activeFilter === FILTER_ALL) return tasks;
    if (activeFilter === FILTER_OVERDUE) return tasks.filter(isTaskOverdue);
    return tasks.filter((t) => t.stage === activeFilter);
  }, [tasks, activeFilter]);

  const handleChangeStage = (taskId, newStage) => {
    dispatch(updateTaskStageThunk({ taskId, newStage }));
  };

  const filterOptions = [
    { key: FILTER_ALL, label: 'All', color: PIAColors.ink },
    ...TASK_STAGE_ORDER.map((s) => ({ key: s, label: TASK_STAGE_META[s].label, color: TASK_STAGE_META[s].color })),
    {
      key: FILTER_OVERDUE,
      label: `Overdue${overdueCount ? ` (${overdueCount})` : ''}`,
      color: PIAColors.error,
    },
  ];

  return (
    <View style={styles.container}>
      <GradientHeader gradient={PIAGradients.primaryDark}>
        <Appbar.Action icon="menu" color={PIAColors.white} onPress={() => navigation.openDrawer()} />
        <Appbar.Content title="My Tasks" titleStyle={styles.headerTitle} />
      </GradientHeader>

      {/*
        Deliberately a plain wrapping View, not a horizontal ScrollView/
        FlatList - per feedback, all filters should be visible at once
        with no side-scrolling. It's also a sibling of the list below
        (not inside GradientHeader, not inside the FlatList), so it
        neither scrolls away with the task list nor moves/collapses like
        a page header would - it just sits fixed in place between the two.
      */}
      <View style={styles.filterRow}>
        {filterOptions.map((option) => (
          <StatusChip
            key={option.key}
            label={option.label}
            color={option.color}
            selected={activeFilter === option.key}
            onPress={() => setActiveFilter(option.key)}
          />
        ))}
      </View>

      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={status === 'loading'}
            onRefresh={() => dispatch(fetchMyTasksThunk())}
            colors={[PIAColors.green]}
          />
        }
        renderItem={({ item }) => <TaskCard task={item} onChangeStage={handleChangeStage} />}
        ListEmptyComponent={
          status === 'loading' ? null : (
            <View style={styles.emptyState}>
              <Text style={styles.mutedText}>
                {error ? `Couldn't load tasks: ${error}` : 'No tasks match this filter.'}
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PIAColors.offWhite },
  headerTitle: { color: PIAColors.white, fontWeight: '700' },

  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 2,
    backgroundColor: PIAColors.offWhite,
  },

  listContent: { padding: 16, paddingTop: 8 },
  emptyState: { padding: 32, alignItems: 'center' },
  mutedText: { opacity: 0.6, textAlign: 'center' },
});