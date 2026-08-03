/**
 * hooks/useReferenceFace.js
 *
 * Fetches the intern's stored signup reference photo and prepares it via
 * faceRecognition.loadReferenceFace(). Kept separate from
 * faceRecognition.js on purpose: "where does the reference photo come
 * from" (an API call) and "how do we compare two faces" (the engine) are
 * different concerns with different owners, and this hook is the seam
 * between them.
 *
 * TODO(backend-integration): the actual API call below is a stub — there
 * is no live GET /interns/me endpoint yet (backend is still scaffold-only
 * as of this writing). Replace fetchReferencePhotoUri() with a real call
 * once that endpoint exists. It should resolve to the intern's
 * profile_photo_path — see document.controller.js's DOCUMENT_TYPE_TO_COLUMN
 * for where that column gets written on the backend side.
 */

import { useCallback, useEffect, useState } from 'react';
import { loadReferenceFace } from '../services/faceRecognition';

async function fetchReferencePhotoUri() {
  throw new Error(
    'useReferenceFace: fetchReferencePhotoUri() is not implemented — wire up GET /interns/me once it exists.',
  );
}

const Status = {
  IDLE: 'IDLE',
  LOADING: 'LOADING',
  READY: 'READY',
  ERROR: 'ERROR',
};

/**
 * @returns {{
 *   status: 'IDLE'|'LOADING'|'READY'|'ERROR',
 *   referenceHandle: import('../services/faceRecognition').ReferenceFaceHandle | null,
 *   error: Error | null,
 *   reload: () => void,
 * }}
 */
export function useReferenceFace() {
  const [status, setStatus] = useState(Status.IDLE);
  const [referenceHandle, setReferenceHandle] = useState(null);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setStatus(Status.LOADING);
      setError(null);
      try {
        const referencePhotoUri = await fetchReferencePhotoUri();
        const handle = await loadReferenceFace(referencePhotoUri);
        if (!cancelled) {
          setReferenceHandle(handle);
          setStatus(Status.READY);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
          setStatus(Status.ERROR);
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const reload = useCallback(() => setReloadToken((t) => t + 1), []);

  return { status, referenceHandle, error, reload };
}