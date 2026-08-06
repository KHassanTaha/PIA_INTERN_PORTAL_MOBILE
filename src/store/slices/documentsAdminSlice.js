import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { decide as decideApi, getPendingQueue, markInReview as markInReviewApi } from '../../services/documentsAdmin';

export const fetchPendingQueueThunk = createAsyncThunk(
  'documentsAdmin/fetchQueue',
  async (_, { rejectWithValue }) => {
    try {
      return await getPendingQueue();
    } catch (err) {
      return rejectWithValue(err.message || 'Could not load the review queue');
    }
  },
);

export const markInReviewThunk = createAsyncThunk(
  'documentsAdmin/markInReview',
  async ({ id, category }, { rejectWithValue }) => {
    try {
      return await markInReviewApi(id, category);
    } catch (err) {
      return rejectWithValue(err.message || 'Could not update item');
    }
  },
);

export const decideThunk = createAsyncThunk(
  'documentsAdmin/decide',
  async ({ id, category, decision, note }, { rejectWithValue }) => {
    try {
      const updated = await decideApi(id, category, decision, note);
      return { ...updated, category };
    } catch (err) {
      return rejectWithValue({ id, message: err.message || 'Could not save decision' });
    }
  },
);

const documentsAdminSlice = createSlice({
  name: 'documentsAdmin',
  initialState: {
    status: 'idle',
    error: null,
    queue: [],
    decidingIds: [], // ids currently mid-decision, so their card can show a spinner
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPendingQueueThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchPendingQueueThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.queue = action.payload;
      })
      .addCase(fetchPendingQueueThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      .addCase(markInReviewThunk.fulfilled, (state, action) => {
        const index = state.queue.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) state.queue[index].status = action.payload.status;
      })

      .addCase(decideThunk.pending, (state, action) => {
        state.decidingIds.push(action.meta.arg.id);
      })
      .addCase(decideThunk.fulfilled, (state, action) => {
        // A decided item leaves the pending queue entirely - it now
        // belongs on the intern-facing side's history, not this queue.
        state.queue = state.queue.filter((item) => item.id !== action.payload.id);
        state.decidingIds = state.decidingIds.filter((id) => id !== action.payload.id);
      })
      .addCase(decideThunk.rejected, (state, action) => {
        state.decidingIds = state.decidingIds.filter((id) => id !== action.payload?.id);
      });
  },
});

export default documentsAdminSlice.reducer;

export const selectQueue = (state) => state.documentsAdmin.queue;
export const selectQueueStatus = (state) => state.documentsAdmin.status;
export const selectQueueError = (state) => state.documentsAdmin.error;
export const selectIsDeciding = (state, id) => state.documentsAdmin.decidingIds.includes(id);