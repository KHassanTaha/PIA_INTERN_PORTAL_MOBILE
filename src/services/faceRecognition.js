/**
 * services/faceRecognition.js
 *
 * STUB — the actual matching logic is NOT implemented here. This file
 * defines the interface FaceCaptureView.js is built against, so it can be
 * implemented independently (by a teammate, dropping a real engine in)
 * without touching any UI code.
 *
 * ============================================================
 * HARD PRIVACY CONTRACT — read before implementing:
 * ============================================================
 * The live photo captured at check-in is compared against the intern's
 * signup reference photo and then MUST be discarded. It is never uploaded,
 * never written to persistent app storage, and never kept in memory
 * longer than the single comparison call needs it for. Whatever engine
 * you drop into compareLiveCapture() below must not, as a side effect,
 * cache/log/persist the live capture anywhere (including engine-internal
 * disk caches some on-device ML SDKs use by default - check for that).
 * discardCapture() exists specifically to make cleanup an explicit,
 * visible step rather than something left implicit - call it from every
 * exit path (match, no-match, and error), which FaceCaptureView.js
 * already does.
 * ============================================================
 */

import RNFS from 'react-native-fs';

/**
 * @typedef {Object} ReferenceFaceHandle
 * Opaque handle representing a loaded/prepared reference face, however
 * the real engine wants to represent that internally (a raw image, a
 * precomputed embedding vector, a native SDK session object, etc). The
 * UI layer never inspects this - it only ever passes it back into
 * compareLiveCapture().
 */

/**
 * @typedef {Object} FaceMatchResult
 * @property {boolean} matched
 * @property {number} confidence - 0-1. UI shows this on a failed match
 *   for debugging during development; product copy should probably hide
 *   the raw number from interns in the final build.
 * @property {string} [reason] - set when matched is false and it's worth
 *   distinguishing "confidently not a match" from "couldn't get a clear
 *   enough read" (e.g. 'NO_MATCH' vs 'LOW_QUALITY_CAPTURE') so the UI can
 *   show different retry guidance.
 */

/**
 * Loads/prepares the intern's stored signup reference photo for
 * comparison. Called once per check-in attempt (not once per app
 * session) - the reference source itself (fetching the intern's
 * profile_photo_path from the API) is a separate, already-solved concern
 * outside this file - see hooks/useReferenceFace.js.
 *
 * TODO(face-recognition-engine): implement using the real engine's
 * "prepare a reference" step - e.g. running the reference photo through
 * the same embedding model that compareLiveCapture will use, so the two
 * are comparable.
 *
 * @param {string} referencePhotoUri - local URI or remote URL of the
 *   intern's stored signup photo.
 * @returns {Promise<ReferenceFaceHandle>}
 */
export async function loadReferenceFace(referencePhotoUri) {
  throw new Error(
    'faceRecognition.loadReferenceFace() is not implemented — plug in the real engine here.',
  );
}

/**
 * Compares one live-captured photo against a previously-loaded reference.
 * This is the core function to implement.
 *
 * TODO(face-recognition-engine): implement the actual comparison here.
 * By the time this returns (success, failure, or thrown error),
 * livePhotoUri must not have been copied/cached anywhere by your engine
 * beyond this function call's own execution - see the privacy contract
 * at the top of this file. If your chosen engine can't guarantee that
 * (some SDKs auto-cache input images to disk), you need to clear its
 * cache here before returning, in addition to the caller's own
 * discardCapture() call.
 *
 * @param {string} livePhotoUri - local URI of the just-captured photo.
 * @param {ReferenceFaceHandle} referenceHandle - from loadReferenceFace().
 * @returns {Promise<FaceMatchResult>}
 */
export async function compareLiveCapture(livePhotoUri, referenceHandle) {
  throw new Error(
    'faceRecognition.compareLiveCapture() is not implemented — plug in the real engine here.',
  );
}

/**
 * Deletes a live-captured photo file from local disk. FaceCaptureView.js
 * calls this from every exit path after a capture attempt (matched,
 * not-matched, or errored) - implemented here (not left as a TODO) since
 * it's a straightforward file delete, not something that needs a real
 * engine to define.
 *
 * Safe to call on a path that's already gone (e.g. double-cleanup on a
 * fast retry) - swallows the "file doesn't exist" case rather than
 * throwing, since callers shouldn't have to think about that race.
 *
 * @param {string} livePhotoUri
 * @returns {Promise<void>}
 */
export async function discardCapture(livePhotoUri) {
  if (!livePhotoUri) return;
  try {
    const exists = await RNFS.exists(livePhotoUri);
    if (exists) {
      await RNFS.unlink(livePhotoUri);
    }
  } catch (err) {
    // Deliberately swallowed — a failed cleanup of a temp capture file
    // should never block or crash the check-in flow. Logged so it's
    // still visible during development.
    console.warn('faceRecognition.discardCapture: cleanup failed', err);
  }
}