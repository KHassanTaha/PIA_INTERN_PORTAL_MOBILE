/**
 * services/tasks.js
 *
 * STUB — no /tasks endpoints exist on the backend yet. The live DB does
 * have a `tasks` table (assigned_to, assigned_by, priority, completed_at
 * per the confirmed schema), but it has no stage/status column matching
 * the ASSIGNED/STARTED/TESTING/REVIEW/SUBMITTED workflow this UI expects
 * - that's a schema addition someone on backend needs to make (a
 * `stage varchar` column + CHECK constraint, mirroring the pattern used
 * for LeaveRequests/DocumentRequests status columns elsewhere) before
 * this can be wired to something real.
 */

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {'Low'|'Medium'|'High'} priority
 * @property {string} stage - one of constants/taskStages.js's TaskStage values
 * @property {string|null} dueDate - ISO date string
 * @property {string} assignedByName
 * @property {string} createdAt - ISO datetime string
 */

/**
 * TODO(backend-integration): implement once GET /tasks/mine (or
 * equivalent) exists.
 * @returns {Promise<Task[]>}
 */
export async function getMyTasks() {
  throw new Error('tasks.getMyTasks() is not implemented — no /tasks endpoint exists yet.');
}

/**
 * TODO(backend-integration): implement once PATCH /tasks/:id/stage (or
 * equivalent) exists. Should be a straightforward single-column update
 * server-side, similar in shape to the LeaveRequests/DocumentRequests
 * decision endpoints, just without the reviewer-authorization check
 * those have (an intern updates their own task's stage directly, no
 * approval step for stage changes themselves).
 *
 * @param {string} taskId
 * @param {string} newStage - a constants/taskStages.js TaskStage value
 * @returns {Promise<Task>}
 */
export async function updateTaskStage(taskId, newStage) {
  throw new Error('tasks.updateTaskStage() is not implemented — no /tasks endpoint exists yet.');
}