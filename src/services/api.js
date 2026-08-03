/**
 * Stub API layer for the proof-of-concept.
 *
 * The .NET backend isn't live yet, so these simulate a network round-trip
 * with a short delay. When the real endpoints exist, replace the body of
 * each function with an axios call — nothing calling these needs to change,
 * since the function signatures are the real contract.
 */

const SIMULATED_LATENCY_MS = 1000;
// Set > 0 (e.g. 0.3) locally to exercise the failed/retry UI during dev.
const SIMULATE_FAILURE_RATE = 0;

function simulateNetworkCall(value) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < SIMULATE_FAILURE_RATE) {
        reject(new Error('Simulated network failure'));
      } else {
        resolve(value);
      }
    }, SIMULATED_LATENCY_MS);
  });
}

export async function syncAttendanceRecord(record) {
  // TODO: POST /attendance/check-in — send facePhotoUri as multipart, plus
  // checkInTime, latitude, longitude. Backend performs the real face-match
  // AND its own independent geofence check server-side — the app's local
  // geofence check is a UX convenience (fail fast, don't waste a face
  // capture on a doomed request), never a replacement for server-side
  // enforcement.
  return simulateNetworkCall(record);
}

export async function syncDocumentRequest(request) {
  // TODO: POST /letter-requests (LETTER_OF_INTERNSHIP) or
  // POST /documents/generate/id-card (ID_CARD, though that endpoint is
  // actually mentor/admin-triggered per the real backend — an intern-side
  // "request" likely needs its own lightweight request endpoint mirroring
  // the LetterRequests pattern; confirm with backend before wiring this
  // for real).
  return simulateNetworkCall(request);
}

export async function syncDocumentUpload(upload) {
  // TODO: POST /interns/me/documents — multipart, field name matches
  // upload.documentType (profile_photo | cnic_doc | student_id_doc |
  // resume_doc), file from upload.localFileUri.
  return simulateNetworkCall(upload);
}
