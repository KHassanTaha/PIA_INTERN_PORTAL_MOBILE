/**
 * services/mockDocumentsStore.js
 *
 * Single in-memory "database" shared by services/documents.js (intern
 * side) and services/documentsAdmin.js (admin side) - both import and
 * mutate the SAME arrays here, so an admin action (approve/reject) taken
 * from within the same running app session is immediately visible to
 * the intern-facing screens too. This is what makes the whole
 * submit -> review -> decide -> view cycle demoable end-to-end without
 * any real backend.
 *
 * Resets on every app reload/restart - this is explicitly demo/mock
 * data, not persisted anywhere. DELETE THIS FILE (and the two service
 * files built on top of it) once real /documents endpoints exist -
 * every function here has a matching TODO(backend-integration) in
 * services/documents.js and services/documentsAdmin.js marking exactly
 * what to replace.
 */

import { DocumentStatus } from '../constants/documentTypes';

let nextId = 1000;
export function generateMockId() {
  nextId += 1;
  return String(nextId);
}

// Fake "generated PDF" placeholder - a tiny valid base64-encoded PDF, so
// IssuedDocumentModal has something real to render/download in a demo
// rather than a broken link. Swap for a real signed URL from the backend
// once document generation is wired up.
const PLACEHOLDER_PDF_DATA_URI =
  'data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsO4CjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nCvkMlAwUDC1NNUzMVEwULC0MDXTMzZWKC5JLM'
  + '8vsjK1NAEAAI0KOAplbmRzdHJlYW0KZW5kb2JqCgozIDAgb2JqCjgxCmVuZG9iagoKMSAwIG9iago8PC9UeXBlL1BhZ2UvUGFyZW50IDQgMCBSL1Jlc291cmNlczw8Pj4vTWVkaWFCb3ggWzAgMCA2MTIgNzkyXS9Db250ZW50cyAyIDAgUj4+CmVuZG9iagoKNCAwIG9iago8PC9UeXBlL1BhZ2VzL0tpZHNbMSAwIFJdL0NvdW50IDE+PgplbmRvYmoKCjUgMCBvYmoKPDwvVHlwZS9DYXRhbG9nL1BhZ2VzIDQgMCBSPj4KZW5kb2JqCgp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCnRyYWlsZXIKPDwvU2l6ZSA2L1Jvb3QgNSAwIFI+PgpzdGFydHhyZWYKMAolJUVPRg==';

const now = Date.now();
const hoursAgo = (h) => new Date(now - h * 60 * 60 * 1000).toISOString();

/** @type {Array} MockUploadRecord[] - id, type, fileUri, fileName, fileMimeType, fileSize, status, submittedAt, decisionNote, decidedAt */
export const mockUploads = [
  {
    id: generateMockId(),
    type: 'CNIC',
    fileUri: 'https://picsum.photos/seed/cnic/400/260',
    fileName: 'cnic-front.jpg',
    fileMimeType: 'image/jpeg',
    fileSize: 1_240_000,
    status: DocumentStatus.APPROVED,
    submittedAt: hoursAgo(72),
    decisionNote: null,
    decidedAt: hoursAgo(50),
  },
  {
    id: generateMockId(),
    type: 'STUDENT_ID',
    fileUri: 'https://picsum.photos/seed/studentid/400/260',
    fileName: 'student-id.jpg',
    fileMimeType: 'image/jpeg',
    fileSize: 980_000,
    status: DocumentStatus.IN_REVIEW,
    submittedAt: hoursAgo(20),
    decisionNote: null,
    decidedAt: null,
  },
  {
    id: generateMockId(),
    type: 'RESUME',
    fileUri: PLACEHOLDER_PDF_DATA_URI,
    fileName: 'resume.pdf',
    fileMimeType: 'application/pdf',
    fileSize: 340_000,
    status: DocumentStatus.REJECTED,
    submittedAt: hoursAgo(96),
    decisionNote: 'Please upload a version without a password / with your latest experience.',
    decidedAt: hoursAgo(80),
  },
];

/** @type {Array} MockRequestRecord[] - id, type, status, submittedAt, decisionNote, decidedAt, issuedFileUri */
export const mockRequests = [
  {
    id: generateMockId(),
    type: 'ID_CARD',
    status: DocumentStatus.APPROVED,
    submittedAt: hoursAgo(60),
    decisionNote: null,
    decidedAt: hoursAgo(40),
    issuedFileUri: PLACEHOLDER_PDF_DATA_URI,
  },
  {
    id: generateMockId(),
    type: 'GATE_PASS',
    status: DocumentStatus.PENDING,
    submittedAt: hoursAgo(6),
    decisionNote: null,
    decidedAt: null,
    issuedFileUri: null,
  },
];

export { PLACEHOLDER_PDF_DATA_URI };