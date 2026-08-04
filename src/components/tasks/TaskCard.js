import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Menu, Text, TouchableRipple } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import StatusChip from '../StatusChip';
import { isTaskOverdue, TASK_STAGE_META, TASK_STAGE_ORDER } from '../../constants/taskStages';
import { PIAColors } from '../../theme/theme';

const PRIORITY_COLOR = {
  High: PIAColors.error,
  Medium: PIAColors.gold,
  Low: PIAColors.greenLight,
};

/**
 * @param {{ task: import('../../services/tasks').Task, onChangeStage: (taskId: string, newStage: string) => void }} props
 */
export default function TaskCard({ task, onChangeStage }) {
  const [menuVisible, setMenuVisible] = useState(false);
  const stageMeta = TASK_STAGE_META[task.stage];
  const overdue = isTaskOverdue(task);

  return (
    <Card style={styles.card} mode="elevated">
      <View style={[styles.accentBar, { backgroundColor: stageMeta.color }]} />
      <Card.Content style={styles.content}>
        <View style={styles.headerRow}>
          <Text variant="titleMedium" style={styles.title} numberOfLines={2}>
            {task.title}
          </Text>
          <StatusChip label={task.priority} color={PRIORITY_COLOR[task.priority]} />
        </View>

        {task.description ? (
          <Text variant="bodySmall" style={styles.description} numberOfLines={3}>
            {task.description}
          </Text>
        ) : null}

        <View style={styles.metaRow}>
          <Icon name="account-outline" size={14} color={PIAColors.ink} style={styles.metaIcon} />
          <Text variant="bodySmall" style={styles.metaText}>
            {task.assignedByName}
          </Text>
          {task.dueDate ? (
            <>
              <Icon
                name="calendar-outline"
                size={14}
                color={overdue ? PIAColors.error : PIAColors.ink}
                style={styles.metaIconSpaced}
              />
              <Text
                variant="bodySmall"
                style={[styles.metaText, overdue && styles.overdueText]}
              >
                {new Date(task.dueDate).toLocaleDateString()}
              </Text>
            </>
          ) : null}
        </View>

        <View style={styles.footerRow}>
          <View style={styles.badgeGroup}>
            <StatusChip label={stageMeta.label} icon={stageMeta.icon} color={stageMeta.color} />
            {overdue && (
              <StatusChip label="Overdue" icon="alert-outline" color={PIAColors.error} bold />
            )}
          </View>

          {task.stage !== 'SUBMITTED' && (
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <TouchableRipple onPress={() => setMenuVisible(true)} style={styles.stageMenuTrigger}>
                  <View style={styles.stageMenuTriggerContent}>
                    <Text style={styles.stageMenuTriggerText}>Update</Text>
                    <Icon name="chevron-down" size={16} color={PIAColors.green} />
                  </View>
                </TouchableRipple>
              }
            >
              {TASK_STAGE_ORDER.filter((s) => s !== task.stage).map((stage) => (
                <Menu.Item
                  key={stage}
                  leadingIcon={TASK_STAGE_META[stage].icon}
                  title={TASK_STAGE_META[stage].label}
                  onPress={() => {
                    setMenuVisible(false);
                    onChangeStage(task.id, stage);
                  }}
                />
              ))}
            </Menu>
          )}
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12, borderRadius: 18, overflow: 'hidden', backgroundColor: PIAColors.white },
  accentBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  content: { paddingTop: 14 },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { flex: 1, fontWeight: '700', marginRight: 8 },

  description: { opacity: 0.65, marginTop: 6, lineHeight: 18 },

  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  metaIcon: { marginRight: 4 },
  metaIconSpaced: { marginLeft: 14, marginRight: 4 },
  metaText: { opacity: 0.6 },
  overdueText: { color: PIAColors.error, opacity: 1, fontWeight: '600' },

  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  badgeGroup: { flexDirection: 'row', flexWrap: 'wrap', flex: 1 },

  stageMenuTrigger: { borderRadius: 8, paddingHorizontal: 4 },
  stageMenuTriggerContent: { flexDirection: 'row', alignItems: 'center' },
  stageMenuTriggerText: { color: PIAColors.green, fontWeight: '700', marginRight: 2 },
});