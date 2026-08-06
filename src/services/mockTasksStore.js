/**
 * services/mockTasksStore.js
 *
 * In-memory mock tasks for the intern Tasks screen, same pattern as
 * mockDocumentsStore.js/mockStaffDataStore.js. Resets on reload.
 */

const now = Date.now();
const daysFromNow = (d) => new Date(now + d * 24 * 60 * 60 * 1000).toISOString();

let nextId = 500;
const generateId = () => String((nextId += 1));

export const mockTasks = [
  {
    id: generateId(),
    title: 'Fix login validation bug',
    description: 'The email field accepts invalid formats without showing an error - add proper validation.',
    priority: 'High',
    stage: 'STARTED',
    dueDate: daysFromNow(-2), // already overdue, for demo purposes
    assignedByName: 'S. Ahmed',
    createdAt: daysFromNow(-5),
  },
  {
    id: generateId(),
    title: 'Prepare intern onboarding doc',
    description: 'Draft a short onboarding checklist for new interns joining next month.',
    priority: 'Medium',
    stage: 'REVIEW',
    dueDate: daysFromNow(3),
    assignedByName: 'F. Khan',
    createdAt: daysFromNow(-6),
  },
  {
    id: generateId(),
    title: 'QA pass on attendance module',
    description: 'Test check-in flow across a few devices and note any geofence edge cases.',
    priority: 'High',
    stage: 'TESTING',
    dueDate: daysFromNow(1),
    assignedByName: 'S. Ahmed',
    createdAt: daysFromNow(-3),
  },
  {
    id: generateId(),
    title: 'Draft weekly report template',
    description: 'A reusable template interns can fill out for their weekly status update.',
    priority: 'Low',
    stage: 'ASSIGNED',
    dueDate: daysFromNow(6),
    assignedByName: 'F. Khan',
    createdAt: daysFromNow(-1),
  },
  {
    id: generateId(),
    title: 'Set up local dev environment',
    description: 'Get the mobile app running locally with all dependencies installed.',
    priority: 'Medium',
    stage: 'SUBMITTED',
    dueDate: daysFromNow(-10),
    assignedByName: 'S. Ahmed',
    createdAt: daysFromNow(-14),
  },
];