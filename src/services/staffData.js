/**
 * services/staffData.js
 *
 * Mock-backed getters for every staff table screen. Each function has a
 * TODO(backend-integration) marking the real endpoint it replaces - same
 * convention as services/documents.js. All reads are unscoped here
 * (return everything) since there's no logged-in-reviewer-specific mock
 * roster to scope against - the REAL backend implementation must scope
 * every one of these through hierarchy.service.js's getVisibleInternIds
 * (or its .NET equivalent), exactly like leave.controller.js and
 * document.controller.js already do. Don't take this mock's "sees
 * everything" behavior as the real access model.
 */

import {
  mockAttendanceRecords,
  mockAuditLogs,
  mockInterns,
  mockSignatureRequests,
  mockStaffTasks,
} from './mockStaffDataStore';

const MOCK_DELAY_MS = 500;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** TODO(backend-integration): implement once GET /interns (hierarchy-scoped) exists. */
export async function getInterns() {
  await delay(MOCK_DELAY_MS);
  return [...mockInterns];
}

/** TODO(backend-integration): implement once GET /attendance/team (hierarchy-scoped) exists. */
export async function getTeamAttendance() {
  await delay(MOCK_DELAY_MS);
  return [...mockAttendanceRecords];
}

/** TODO(backend-integration): implement once GET /tasks (hierarchy-scoped, all interns' tasks) exists. */
export async function getStaffTasks() {
  await delay(MOCK_DELAY_MS);
  return [...mockStaffTasks];
}

/** TODO(backend-integration): implement once GET /signature-requests/pending exists (admin-only). */
export async function getSignatureRequests() {
  await delay(MOCK_DELAY_MS);
  return mockSignatureRequests.filter((r) => r.status === 'PENDING');
}

/**
 * TODO(backend-integration): implement once PATCH /signature-requests/:id
 * exists. On approval, the real endpoint additionally writes
 * users.signature_path/signature_uploaded_at for the target employee -
 * see the SignatureRequests design in the hierarchy migration.
 *
 * @param {number} id
 * @param {'approve'|'reject'} decision
 */
export async function decideSignatureRequest(id, decision) {
  await delay(MOCK_DELAY_MS);
  const record = mockSignatureRequests.find((r) => r.id === id);
  if (!record) throw new Error('Signature request not found.');
  record.status = decision === 'approve' ? 'APPROVED' : 'REJECTED';
  return record;
}

/** TODO(backend-integration): implement once GET /audit-logs (admin-only) exists. */
export async function getAuditLogs() {
  await delay(MOCK_DELAY_MS);
  return [...mockAuditLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}