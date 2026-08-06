/**
 * services/documentsAdmin.js
 *
 * Admin/mentor-facing document review operations. Backed by the same
 * services/mockDocumentsStore.js as documents.js - a decision made here
 * is immediately reflected on the intern-facing side within the same
 * app session, which is what makes the full cycle demoable end-to-end.
 *
 * Uploads and requests are merged into one combined queue here (each
 * item tagged with a `category` field, 'upload' | 'request') since a
 * reviewer working through pending documents doesn't think in terms of
 * "which underlying table this came from" - see getPendingQueue().
 *
 * TODO(backend-integration): once real endpoints exist, this combined
 * queue is almost certainly two separate backend calls merged client-
 * side (GET /documents/uploads/pending + GET /documents/requests/pending)
 * rather than one combined endpoint, mirroring how the two are separate
 * tables/concerns server-side too - the merge-for-display step can stay
 * in this file either way.
 *
 * IMPORTANT: this uses hierarchy visibility in the real backend design
 * (a reviewer only sees uploads/requests from interns visible to them -
 * see hierarchy.service.js) but the mock here returns everything
 * unscoped, since there's no logged-in-reviewer-specific mock intern
 * roster to scope against. Don't take the mock's "sees everything"
 * behavior as the real access model.
 */

import { DocumentStatus } from '../constants/documentTypes';
import { mockRequests, mockUploads, PLACEHOLDER_PDF_DATA_URI } from './mockDocumentsStore';

const MOCK_DELAY_MS = 600;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * @typedef {Object} QueueItem
 * @property {string} id
 * @property {'upload'|'request'} category
 * @property {string} type
 * @property {string} status
 * @property {string} submittedAt
 * // upload-only fields (undefined for requests):
 * @property {string} [fileUri]
 * @property {string} [fileName]
 * @property {string} [fileMimeType]
 * @property {number} [fileSize]
 */

export async function getPendingQueue() {
  await delay(MOCK_DELAY_MS);

  const uploadItems = mockUploads
    .filter((u) => u.status === DocumentStatus.PENDING || u.status === DocumentStatus.IN_REVIEW)
    .map((u) => ({ ...u, category: 'upload' }));

  const requestItems = mockRequests
    .filter((r) => r.status === DocumentStatus.PENDING || r.status === DocumentStatus.IN_REVIEW)
    .map((r) => ({ ...r, category: 'request' }));

  return [...uploadItems, ...requestItems].sort(
    (a, b) => new Date(a.submittedAt) - new Date(b.submittedAt), // oldest first - FIFO review queue
  );
}

/**
 * Marks an item as being actively looked at, distinct from a still-
 * untouched Pending item - lets the queue UI show "someone's on this
 * one" (matters more with multiple reviewers, less so solo, but the
 * state exists in the design either way).
 *
 * @param {string} id
 * @param {'upload'|'request'} category
 */
export async function markInReview(id, category) {
  await delay(200);
  const collection = category === 'upload' ? mockUploads : mockRequests;
  const record = collection.find((r) => r.id === id);
  if (!record) throw new Error('Item not found.');
  if (record.status === DocumentStatus.PENDING) {
    record.status = DocumentStatus.IN_REVIEW;
  }
  return record;
}

/**
 * @param {string} id
 * @param {'upload'|'request'} category
 * @param {'approve'|'reject'} decision
 * @param {string|null} note
 */
export async function decide(id, category, decision, note) {
  await delay(MOCK_DELAY_MS);

  const collection = category === 'upload' ? mockUploads : mockRequests;
  const record = collection.find((r) => r.id === id);
  if (!record) throw new Error('Item not found.');
  if (record.status === DocumentStatus.APPROVED || record.status === DocumentStatus.REJECTED) {
    throw new Error('This item has already been decided.');
  }

  record.status = decision === 'approve' ? DocumentStatus.APPROVED : DocumentStatus.REJECTED;
  record.decisionNote = note || null;
  record.decidedAt = new Date().toISOString();

  // Requests additionally "issue" a generated file on approval - mocked
  // here as the same placeholder PDF every time, standing in for what
  // would be a real server-side generation step (Puppeteer-rendered per
  // the original backend design docs).
  if (category === 'request' && decision === 'approve') {
    record.issuedFileUri = PLACEHOLDER_PDF_DATA_URI;
  }

  return record;
}