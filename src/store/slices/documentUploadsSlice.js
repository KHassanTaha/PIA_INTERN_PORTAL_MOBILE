import { createSlice } from '@reduxjs/toolkit';

// Matches the backend's DocumentRequests flow: the intern uploads one of
// their own files (profile photo, CNIC, student ID, resume); a mentor/admin
// must approve before it becomes the official on-file version. Every
// upload — first time or a replacement — goes through this same gate.

// documentType: 'profile_photo' | 'cnic_doc' | 'student_id_doc' | 'resume_doc'
// status: 'pending' | 'approved' | 'rejected'
// syncStatus: 'pending' | 'synced' | 'failed'

const initialState = {
  uploads: [], // most recent first
};

function makeLocalId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const documentUploadsSlice = createSlice({
  name: 'documentUploads',
  initialState,
  reducers: {
    submitUploadOffline: {
      reducer(state, action) {
        state.uploads.unshift(action.payload);
      },
      prepare(documentType, localFileUri) {
        return {
          payload: {
            id: makeLocalId(),
            documentType,
            localFileUri,
            uploadedAt: new Date().toISOString(),
            status: 'pending',
            decisionNote: null,
            syncStatus: 'pending',
          },
        };
      },
    },
    markUploadSynced(state, action) {
      const upload = state.uploads.find((u) => u.id === action.payload);
      if (upload) upload.syncStatus = 'synced';
    },
    markUploadFailed(state, action) {
      const upload = state.uploads.find((u) => u.id === action.payload);
      if (upload) upload.syncStatus = 'failed';
    },
  },
});

export const { submitUploadOffline, markUploadSynced, markUploadFailed } =
  documentUploadsSlice.actions;

export default documentUploadsSlice.reducer;
