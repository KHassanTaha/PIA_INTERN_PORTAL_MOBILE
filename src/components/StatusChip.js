/**
 * components/StatusChip.js
 *
 * Single reusable chip for status/priority/filter display across the
 * app - pulls TaskCard's three separately-styled inline chips (stage,
 * priority, overdue) and TasksScreen's filter chips into one component
 * with two visual modes:
 *
 *   - tinted (default): pale color-tinted background + colored text/icon.
 *     Used for read-only display - a task's current stage, its priority,
 *     an overdue flag.
 *   - selected: solid color fill + white text. Used for the active state
 *     of a tappable filter chip (see TasksScreen).
 *
 * Any future screen needing a status/tag chip (staff Approvals list,
 * notification-type tags, etc.) should reach for this instead of
 * re-styling react-native-paper's Chip inline again.
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { PIAColors } from '../theme/theme';

/**
 * @param {{
 *   label: string,
 *   icon?: string,
 *   color: string,          // base color this chip represents (a PIAColors value, or PRIORITY_COLOR/stage color)
 *   selected?: boolean,      // true = solid fill (active filter state)
 *   onPress?: () => void,    // omit for a non-interactive display chip
 *   bold?: boolean,          // heavier text weight - used for the Overdue chip
 *   style?: object,
 * }} props
 */
export default function StatusChip({ label, icon, color, selected = false, onPress, bold = false, style }) {
  const backgroundColor = selected ? color : color + '22';
  const textColor = selected ? PIAColors.white : color;

  return (
    <Chip
      compact
      icon={icon}
      onPress={onPress}
      style={[styles.chip, { backgroundColor }, style]}
      textStyle={[{ color: textColor }, bold && styles.boldText]}
    >
      {label}
    </Chip>
  );
}

const styles = StyleSheet.create({
  chip: { marginRight: 6, marginBottom: 6 },
  boldText: { fontWeight: '700' },
});