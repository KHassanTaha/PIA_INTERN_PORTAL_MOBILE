/**
 * services/documents.js
 *
 * Intern-facing document operations - uploads (CNIC, photo, etc.) and
 * requests (ID card, gate pass, letter). Backed by
 * services/mockDocumentsStore.js for now since no /documents endpoints
 * exist on the backend yet (blocked further by the .NET rewrite
 * decision). Each function below has a TODO(backend-integration)
 * marking exactly what a real implementation replaces - the function
 * signatures and business rules (one-pending-per-type, amend only when
 * Pending/Rejected, etc.) are the real contract; only the "talk to
 * mockDocumentsStore instead of a server" part is temporary.
 *
 * A simulated delay (MOCK_DELAY_MS) is intentional, not filler - it
 * makes loading states in the UI demoable too, not just the end states.
 */

import { DocumentStatus } from '../constants/documentTypes';
import { generateMockId, mockRequests, mockUploads } from './mockDocumentsStore';

const MOCK_DELAY_MS = 600;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * TODO(backend-integration): implement once GET /documents/uploads/mine
 * exists.
 */
export async function getMyUploads() {
  await delay(MOCK_DELAY_MS);
  return [...mockUploads].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
}

/**
 * TODO(backend-integration): implement once GET /documents/requests/mine
 * exists.
 */
export async function getMyRequests() {
  await delay(MOCK_DELAY_MS);
  return [...mockRequests].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
}

/**
 * TODO(backend-integration): implement once POST /documents/uploads
 * exists (multipart). Mirrors the real design's DB constraint (at most
 * one Pending/InReview upload per document type at a time) - enforced
 * here too so the mock behaves like the real system will.
 *
 * @param {string} type - an UploadDocumentType value
 * @param {import('./filePicker').PickedFile} file
 */
export async function submitUpload(type, file) {
  await delay(MOCK_DELAY_MS);

  const hasActive = mockUploads.some(
    (u) => u.type === type && (u.status === DocumentStatus.PENDING || u.status === DocumentStatus.IN_REVIEW),
  );
  if (hasActive) {
    throw new Error('A request for this document is already awaiting review.');
  }

  const record = {
    id: generateMockId(),
    type,
    fileUri: file.uri,
    fileName: file.name,
    fileMimeType: file.type,
    fileSize: file.size,
    status: DocumentStatus.PENDING,
    submittedAt: new Date().toISOString(),
    decisionNote: null,
    decidedAt: null,
  };
  mockUploads.unshift(record);
  return record;
}

/**
 * Amend (replace) an existing upload - only allowed while Pending or
 * Rejected. Re-picking and resubmitting resets status back to Pending
 * and clears any prior decision note, matching "resubmitting after a
 * rejection is a fresh review", not "editing the rejected review".
 *
 * TODO(backend-integration): implement once PATCH /documents/uploads/:id
 * exists.
 *
 * @param {string} uploadId
 * @param {import('./filePicker').PickedFile} file
 */
export async function amendUpload(uploadId, file) {
  await delay(MOCK_DELAY_MS);

  const record = mockUploads.find((u) => u.id === uploadId);
  if (!record) throw new Error('Upload not found.');
  if (record.status === DocumentStatus.APPROVED) {
    throw new Error('An approved document cannot be amended.');
  }
  if (record.status === DocumentStatus.IN_REVIEW) {
    throw new Error('This document is currently being reviewed and cannot be amended yet.');
  }

  record.fileUri = file.uri;
  record.fileName = file.name;
  record.fileMimeType = file.type;
  record.fileSize = file.size;
  record.status = DocumentStatus.PENDING;
  record.submittedAt = new Date().toISOString();
  record.decisionNote = null;
  record.decidedAt = null;
  return record;
}

/**
 * Withdraw an upload - allowed while Pending OR InReview (per feedback:
 * an intern should be able to cancel a submission even after a reviewer
 * has started looking at it, not just before).
 *
 * TODO(backend-integration): implement once DELETE
 * /documents/uploads/:id (or a status transition to a Withdrawn state)
 * exists.
 *
 * @param {string} uploadId
 */
export async function withdrawUpload(uploadId) {
  await delay(MOCK_DELAY_MS);

  const index = mockUploads.findIndex((u) => u.id === uploadId);
  if (index === -1) throw new Error('Upload not found.');
  const status = mockUploads[index].status;
  if (status !== DocumentStatus.PENDING && status !== DocumentStatus.IN_REVIEW) {
    throw new Error('This document has already been decided and cannot be withdrawn.');
  }
  mockUploads.splice(index, 1);
}

/**
 * TODO(backend-integration): implement once POST /documents/requests
 * exists. Same one-pending-per-type rule as submitUpload().
 *
 * @param {string} type - a RequestDocumentType value
 */
export async function submitRequest(type) {
  await delay(MOCK_DELAY_MS);

  const hasActive = mockRequests.some(
    (r) => r.type === type && (r.status === DocumentStatus.PENDING || r.status === DocumentStatus.IN_REVIEW),
  );
  if (hasActive) {
    throw new Error('A request for this document is already awaiting review.');
  }

  const record = {
    id: generateMockId(),
    type,
    status: DocumentStatus.PENDING,
    submittedAt: new Date().toISOString(),
    decisionNote: null,
    decidedAt: null,
    issuedFileUri: null,
  };
  mockRequests.unshift(record);
  return record;
}

/**
 * Withdraw a request - allowed while Pending OR InReview (per feedback:
 * previously restricted to Pending only).
 *
 * TODO(backend-integration): implement once DELETE /documents/requests/:id
 * (or a status transition to a Withdrawn state) exists.
 *
 * @param {string} requestId
 */
export async function withdrawRequest(requestId) {
  await delay(MOCK_DELAY_MS);

  const index = mockRequests.findIndex((r) => r.id === requestId);
  if (index === -1) throw new Error('Request not found.');
  const status = mockRequests[index].status;
  if (status !== DocumentStatus.PENDING && status !== DocumentStatus.IN_REVIEW) {
    throw new Error('This request has already been decided and cannot be withdrawn.');
  }
  mockRequests.splice(index, 1);
}

/**
 * Returns the issued file for an APPROVED request - throws if the
 * request isn't approved yet, since there's nothing to view.
 *
 * TODO(backend-integration): implement once GET
 * /documents/requests/:id/file exists (likely a signed download URL,
 * not the file bytes directly).
 *
 * @param {string} requestId
 * @returns {Promise<{ uri: string, name: string, mimeType: string }>}
 */
export async function getIssuedDocument(requestId) {
  await delay(MOCK_DELAY_MS);

  const record = mockRequests.find((r) => r.id === requestId);
  if (!record) throw new Error('Request not found.');
  if (record.status !== DocumentStatus.APPROVED || !record.issuedFileUri) {
    throw new Error('This document has not been issued yet.');
  }

  return {
    uri: record.issuedFileUri,
    name: `${record.type.toLowerCase()}.pdf`,
    mimeType: 'application/pdf',
  };
}