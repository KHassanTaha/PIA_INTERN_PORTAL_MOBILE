import { createSlice } from '@reduxjs/toolkit';

// Matches the backend's Documents/LetterRequests flow: an intern REQUESTS
// a generated document (ID Card or Letter of Internship); a mentor/admin
// must approve before it's actually produced. Distinct from
// documentUploadsSlice, which is the intern UPLOADING their own files
// (CNIC, resume, etc.) for review — a different backend flow
// (DocumentRequests table), not this one.

// type: 'ID_CARD' | 'LETTER_OF_INTERNSHIP'
// status: 'queued' | 'submitted' | 'approved' | 'rejected'
// syncStatus: 'pending' | 'synced' | 'failed'

const initialState = {
  requests: [], // most recent first
};

function makeLocalId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const documentRequestsSlice = createSlice({
  name: 'documentRequests',
  initialState,
  reducers: {
    submitDocumentRequestOffline: {
      reducer(state, action) {
        state.requests.unshift(action.payload);
      },
      prepare(type, note = '') {
        return {
          payload: {
            id: makeLocalId(),
            type,
            note,
            requestedAt: new Date().toISOString(),
            status: 'queued',
            syncStatus: 'pending',
          },
        };
      },
    },
    markDocumentRequestSynced(state, action) {
      const req = state.requests.find((r) => r.id === action.payload);
      if (req) {
        req.syncStatus = 'synced';
        req.status = 'submitted';
      }
    },
    markDocumentRequestFailed(state, action) {
      const req = state.requests.find((r) => r.id === action.payload);
      if (req) req.syncStatus = 'failed';
    },
  },
});

export const {
  submitDocumentRequestOffline,
  markDocumentRequestSynced,
  markDocumentRequestFailed,
} = documentRequestsSlice.actions;

export default documentRequestsSlice.reducer;
