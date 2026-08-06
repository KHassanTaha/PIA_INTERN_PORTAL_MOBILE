/**
 * services/mockStaffDataStore.js
 *
 * Shared in-memory mock data for every DataTable-based staff screen
 * (Interns, Team Attendance, Tasks overview, Signatures, Audit Logs) -
 * same architecture as services/mockDocumentsStore.js: one source of
 * truth multiple services read/write, so e.g. approving a signature
 * request here is reflected everywhere that reads signatureRequests
 * within the same app session.
 *
 * Resets on every reload. DELETE once real backend endpoints exist -
 * see each function in services/staffData.js for its matching
 * TODO(backend-integration).
 */

const now = Date.now();
const daysAgo = (d) => new Date(now - d * 24 * 60 * 60 * 1000).toISOString();
const hoursAgo = (h) => new Date(now - h * 60 * 60 * 1000).toISOString();

export const mockInterns = [
  { id: 1, name: 'Ayesha Khan', department: 'IT', mentor: 'S. Ahmed', startDate: daysAgo(60), status: 'Active' },
  { id: 2, name: 'Bilal Ahmed', department: 'HR', mentor: 'F. Khan', startDate: daysAgo(75), status: 'Active' },
  { id: 3, name: 'Zainab Malik', department: 'Finance', mentor: 'S. Ahmed', startDate: daysAgo(30), status: 'Active' },
  { id: 4, name: 'Hassan Raza', department: 'IT', mentor: 'S. Ahmed', startDate: daysAgo(50), status: 'Active' },
  { id: 5, name: 'Sana Tariq', department: 'Marketing', mentor: 'F. Khan', startDate: daysAgo(110), status: 'Completed' },
  { id: 6, name: 'Omar Farooq', department: 'IT', mentor: 'S. Ahmed', startDate: daysAgo(20), status: 'Active' },
];

export const mockAttendanceRecords = [
  { id: 101, internName: 'Ayesha Khan', date: daysAgo(0), checkInTime: hoursAgo(4), status: 'Present' },
  { id: 102, internName: 'Bilal Ahmed', date: daysAgo(0), checkInTime: hoursAgo(3), status: 'Present' },
  { id: 103, internName: 'Zainab Malik', date: daysAgo(0), checkInTime: null, status: 'Absent' },
  { id: 104, internName: 'Hassan Raza', date: daysAgo(0), checkInTime: hoursAgo(5), status: 'Present' },
  { id: 105, internName: 'Ayesha Khan', date: daysAgo(1), checkInTime: hoursAgo(28), status: 'Present' },
  { id: 106, internName: 'Zainab Malik', date: daysAgo(1), checkInTime: hoursAgo(29), status: 'Excused' },
];

export const mockStaffTasks = [
  { id: 201, title: 'Fix login validation bug', internName: 'Ayesha Khan', priority: 'High', stage: 'STARTED', dueDate: daysAgo(-2) },
  { id: 202, title: 'Prepare onboarding doc', internName: 'Bilal Ahmed', priority: 'Medium', stage: 'REVIEW', dueDate: daysAgo(-8) },
  { id: 203, title: 'QA pass on attendance module', internName: 'Hassan Raza', priority: 'High', stage: 'TESTING', dueDate: daysAgo(1) },
  { id: 204, title: 'Draft weekly report template', internName: 'Zainab Malik', priority: 'Low', stage: 'ASSIGNED', dueDate: daysAgo(-5) },
];

export const mockSignatureRequests = [
  { id: 301, employeeName: 'Faisal Khan', designation: 'General Manager', fileUri: 'https://picsum.photos/seed/sig1/300/150', submittedAt: hoursAgo(10), status: 'PENDING' },
  { id: 302, employeeName: 'Nadia Sheikh', designation: 'Deputy General Manager', fileUri: 'https://picsum.photos/seed/sig2/300/150', submittedAt: hoursAgo(30), status: 'PENDING' },
];

export const mockAuditLogs = [
  { id: 401, actor: 'S. Ahmed', action: 'Approved leave request', target: 'Ayesha Khan', timestamp: hoursAgo(2) },
  { id: 402, actor: 'F. Khan', action: 'Rejected document upload (Resume)', target: 'Sana Tariq', timestamp: hoursAgo(6) },
  { id: 403, actor: 'admin', action: 'Approved signature request', target: 'Faisal Khan', timestamp: daysAgo(1) },
  { id: 404, actor: 'S. Ahmed', action: 'Assigned task', target: 'Hassan Raza', timestamp: daysAgo(2) },
  { id: 405, actor: 'admin', action: 'Created department', target: 'Marketing', timestamp: daysAgo(5) },
];