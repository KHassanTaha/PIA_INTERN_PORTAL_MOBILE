/**
 * services/tasks.js
 *
 * Mock-backed now (previously threw not-implemented) - same reasoning as
 * documents.js/staffData.js: gives the Tasks screen real, interactive
 * data to demo against without a backend. See mockTasksStore.js for the
 * underlying data.
 *
 * TODO(backend-integration): replace both functions once GET /tasks/mine
 * and PATCH /tasks/:id/stage exist. See leave.controller.js/
 * document.controller.js for the authorization-check pattern the real
 * PATCH endpoint should follow (an intern updates their own task's stage
 * directly - no reviewer check needed, unlike leave/document decisions).
 */

import { mockTasks } from './mockTasksStore';

const MOCK_DELAY_MS = 500;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** @returns {Promise<import('../constants/taskStages').Task[]>} */
export async function getMyTasks() {
  await delay(MOCK_DELAY_MS);
  return [...mockTasks];
}

/**
 * @param {string} taskId
 * @param {string} newStage - a TaskStage value
 */
export async function updateTaskStage(taskId, newStage) {
  await delay(MOCK_DELAY_MS);
  const task = mockTasks.find((t) => t.id === taskId);
  if (!task) throw new Error('Task not found.');
  task.stage = newStage;
  return task;
}