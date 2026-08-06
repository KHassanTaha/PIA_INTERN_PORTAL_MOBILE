/**
 * store/slices/documentsSlice.js
 *
 * Replaces the earlier documentRequestsSlice.js / documentUploadsSlice.js
 * split - this feature's scope grew enough (preview, amend, issued-file
 * viewing, shared status vocabulary) that keeping uploads and requests
 * in one slice with a consistent shape made more sense than maintaining
 * two. If documentUploadsSlice.js/documentRequestsSlice.js still exist
 * in the project, remove them and this slice's registration in
 * store/store.js replaces both entries.
 */

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  amendUpload as amendUploadApi,
  getIssuedDocument as getIssuedDocumentApi,
  getMyRequests,
  getMyUploads,
  submitRequest as submitRequestApi,
  submitUpload as submitUploadApi,
  withdrawRequest as withdrawRequestApi,
} from '../../services/documents';

export const fetchMyDocumentsThunk = createAsyncThunk(
  'documents/fetchMine',
  async (_, { rejectWithValue }) => {
    try {
      const [uploads, requests] = await Promise.all([getMyUploads(), getMyRequests()]);
      return { uploads, requests };
    } catch (err) {
      return rejectWithValue(err.message || 'Could not load documents');
    }
  },
);

export const submitUploadThunk = createAsyncThunk(
  'documents/submitUpload',
  async ({ type, file }, { rejectWithValue }) => {
    try {
      return await submitUploadApi(type, file);
    } catch (err) {
      return rejectWithValue(err.message || 'Could not submit document');
    }
  },
);

export const amendUploadThunk = createAsyncThunk(
  'documents/amendUpload',
  async ({ uploadId, file }, { rejectWithValue }) => {
    try {
      return await amendUploadApi(uploadId, file);
    } catch (err) {
      return rejectWithValue(err.message || 'Could not update document');
    }
  },
);

export const submitRequestThunk = createAsyncThunk(
  'documents/submitRequest',
  async (type, { rejectWithValue }) => {
    try {
      return await submitRequestApi(type);
    } catch (err) {
      return rejectWithValue(err.message || 'Could not submit request');
    }
  },
);

export const withdrawRequestThunk = createAsyncThunk(
  'documents/withdrawRequest',
  async (requestId, { rejectWithValue }) => {
    try {
      await withdrawRequestApi(requestId);
      return requestId;
    } catch (err) {
      return rejectWithValue(err.message || 'Could not withdraw request');
    }
  },
);

export const fetchIssuedDocumentThunk = createAsyncThunk(
  'documents/fetchIssued',
  async (requestId, { rejectWithValue }) => {
    try {
      return await getIssuedDocumentApi(requestId);
    } catch (err) {
      return rejectWithValue(err.message || 'Could not load document');
    }
  },
);

const documentsSlice = createSlice({
  name: 'documents',
  initialState: {
    status: 'idle', // covers the initial fetchMyDocumentsThunk
    error: null,
    uploads: [],
    requests: [],
    // Per-action status, keyed by upload/request id, so one submit's
    // loading spinner doesn't affect unrelated cards on screen.
    actionStatus: {}, // id -> 'idle' | 'loading' | 'failed'
    actionError: {}, // id -> string | null
  },
  reducers: {
    clearActionError(state, action) {
      delete state.actionError[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyDocumentsThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchMyDocumentsThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.uploads = action.payload.uploads;
        state.requests = action.payload.requests;
      })
      .addCase(fetchMyDocumentsThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      .addCase(submitUploadThunk.pending, (state, action) => {
        state.actionStatus[action.meta.arg.type] = 'loading';
      })
      .addCase(submitUploadThunk.fulfilled, (state, action) => {
        state.uploads.unshift(action.payload);
        delete state.actionStatus[action.payload.type];
      })
      .addCase(submitUploadThunk.rejected, (state, action) => {
        const type = action.meta.arg.type;
        state.actionStatus[type] = 'failed';
        state.actionError[type] = action.payload;
      })

      .addCase(amendUploadThunk.pending, (state, action) => {
        state.actionStatus[action.meta.arg.uploadId] = 'loading';
      })
      .addCase(amendUploadThunk.fulfilled, (state, action) => {
        const index = state.uploads.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) state.uploads[index] = action.payload;
        delete state.actionStatus[action.payload.id];
      })
      .addCase(amendUploadThunk.rejected, (state, action) => {
        const id = action.meta.arg.uploadId;
        state.actionStatus[id] = 'failed';
        state.actionError[id] = action.payload;
      })

      .addCase(submitRequestThunk.pending, (state, action) => {
        state.actionStatus[action.meta.arg] = 'loading';
      })
      .addCase(submitRequestThunk.fulfilled, (state, action) => {
        state.requests.unshift(action.payload);
        delete state.actionStatus[action.payload.type];
      })
      .addCase(submitRequestThunk.rejected, (state, action) => {
        const type = action.meta.arg;
        state.actionStatus[type] = 'failed';
        state.actionError[type] = action.payload;
      })

      .addCase(withdrawRequestThunk.fulfilled, (state, action) => {
        state.requests = state.requests.filter((r) => r.id !== action.payload);
      })

      .addCase(fetchIssuedDocumentThunk.fulfilled, () => {
        // Issued file itself isn't stored in Redux (it's shown directly
        // from the thunk's resolved value in IssuedDocumentModal) - this
        // case exists so components can still key off status/error via
        // the standard thunk lifecycle if needed later.
      });
  },
});

export const { clearActionError } = documentsSlice.actions;
export default documentsSlice.reducer;

export const selectMyUploads = (state) => state.documents.uploads;
export const selectMyRequests = (state) => state.documents.requests;
export const selectDocumentsStatus = (state) => state.documents.status;
export const selectDocumentsError = (state) => state.documents.error;
export const selectActionStatus = (state, key) => state.documents.actionStatus[key] || 'idle';
export const selectActionError = (state, key) => state.documents.actionError[key] || null;