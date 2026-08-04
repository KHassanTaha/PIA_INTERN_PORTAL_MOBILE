/**
 * store/slices/tasksSlice.js
 *
 * Task list state for the intern. Stage updates are optimistic (the UI
 * updates immediately on tap, before the server confirms) since stage
 * changes are frequent, low-stakes, and self-owned (unlike a leave/
 * document decision, nothing here needs another person's approval) - a
 * laggy-feeling stage change would be a worse experience than the rare
 * rollback-on-failure case.
 */

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getMyTasks, updateTaskStage as updateTaskStageApi } from '../../services/tasks';

export const fetchMyTasksThunk = createAsyncThunk(
  'tasks/fetchMine',
  async (_, { rejectWithValue }) => {
    try {
      return await getMyTasks();
    } catch (err) {
      return rejectWithValue(err.message || 'Could not load tasks');
    }
  },
);

export const updateTaskStageThunk = createAsyncThunk(
  'tasks/updateStage',
  async ({ taskId, newStage }, { rejectWithValue }) => {
    try {
      return await updateTaskStageApi(taskId, newStage);
    } catch (err) {
      return rejectWithValue({ taskId, message: err.message || 'Could not update task' });
    }
  },
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: {
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    items: [],
    // taskId -> the task's stage before an in-flight optimistic update,
    // so a failed update can be rolled back precisely rather than
    // guessed at.
    pendingRollback: {},
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyTasksThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchMyTasksThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchMyTasksThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      .addCase(updateTaskStageThunk.pending, (state, action) => {
        const { taskId, newStage } = action.meta.arg;
        const task = state.items.find((t) => t.id === taskId);
        if (task) {
          state.pendingRollback[taskId] = task.stage;
          task.stage = newStage; // optimistic
        }
      })
      .addCase(updateTaskStageThunk.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.items.findIndex((t) => t.id === updated.id);
        if (index !== -1) state.items[index] = updated;
        delete state.pendingRollback[updated.id];
      })
      .addCase(updateTaskStageThunk.rejected, (state, action) => {
        const { taskId } = action.payload || {};
        const previousStage = state.pendingRollback[taskId];
        if (taskId && previousStage) {
          const task = state.items.find((t) => t.id === taskId);
          if (task) task.stage = previousStage;
          delete state.pendingRollback[taskId];
        }
      });
  },
});

export default tasksSlice.reducer;

export const selectAllTasks = (state) => state.tasks.items;
export const selectTasksStatus = (state) => state.tasks.status;
export const selectTasksError = (state) => state.tasks.error;