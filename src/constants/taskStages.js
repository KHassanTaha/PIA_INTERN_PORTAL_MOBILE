/**
 * constants/taskStages.js
 *
 * Single source of truth for task workflow stages - labels, icons, and
 * theme-driven colors all live here so TaskCard, TasksScreen, and any
 * future admin-side task screen stay visually consistent without each
 * redefining this mapping.
 *
 * "Delayed/Overdue" is deliberately NOT a stage here - see
 * isTaskOverdue() below. A task is always in exactly one real stage;
 * overdue is a computed badge layered on top of whichever stage that is.
 */

import { PIAColors } from '../theme/theme';

export const TaskStage = {
  ASSIGNED: 'ASSIGNED',
  STARTED: 'STARTED',
  TESTING: 'TESTING',
  REVIEW: 'REVIEW',
  SUBMITTED: 'SUBMITTED',
};

// Order matters: drives both the filter-chip row and what "advance to
// next stage" means in TaskCard's stage menu.
export const TASK_STAGE_ORDER = [
  TaskStage.ASSIGNED,
  TaskStage.STARTED,
  TaskStage.TESTING,
  TaskStage.REVIEW,
  TaskStage.SUBMITTED,
];

export const TASK_STAGE_META = {
  [TaskStage.ASSIGNED]: { label: 'Assigned', icon: 'clipboard-outline', color: PIAColors.ink },
  [TaskStage.STARTED]: { label: 'Started', icon: 'progress-clock', color: PIAColors.gold },
  [TaskStage.TESTING]: { label: 'Testing', icon: 'flask-outline', color: PIAColors.goldLight },
  [TaskStage.REVIEW]: { label: 'In Review', icon: 'eye-outline', color: PIAColors.greenLight },
  [TaskStage.SUBMITTED]: { label: 'Submitted', icon: 'check-decagram-outline', color: PIAColors.green },
};

/**
 * A task is overdue if it has a due date in the past AND hasn't reached
 * the terminal SUBMITTED stage yet - a submitted task is never overdue
 * regardless of when it was due, even if it was submitted late (that's a
 * "submitted late" fact for whoever reviews it, not an ongoing overdue
 * state for the intern to keep seeing).
 *
 * @param {{ dueDate: string|null, stage: string }} task
 * @returns {boolean}
 */
export function isTaskOverdue(task) {
  if (!task.dueDate || task.stage === TaskStage.SUBMITTED) return false;
  return new Date(task.dueDate).getTime() < Date.now();
}