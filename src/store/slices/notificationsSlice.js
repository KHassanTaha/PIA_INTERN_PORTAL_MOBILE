import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchNotifications, markNotificationRead as markReadApi } from '../../services/notifications';

export const fetchNotificationsThunk = createAsyncThunk(
  'notifications/fetchMine',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchNotifications();
    } catch (err) {
      return rejectWithValue(err.message || 'Could not load notifications');
    }
  },
);

export const markNotificationReadThunk = createAsyncThunk(
  'notifications/markRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      await markReadApi(notificationId);
      return notificationId;
    } catch (err) {
      return rejectWithValue(err.message || 'Could not update notification');
    }
  },
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    status: 'idle',
    error: null,
    items: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotificationsThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchNotificationsThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchNotificationsThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Optimistic: flips read immediately, since this is a self-owned,
      // low-stakes action - same reasoning as task stage updates. No
      // rollback wired for the rare failure case here, on purpose - a
      // notification silently staying "read" locally even if the server
      // update failed is a harmless inconsistency, not worth the extra
      // state-tracking complexity tasksSlice's rollback needed.
      .addCase(markNotificationReadThunk.pending, (state, action) => {
        const item = state.items.find((n) => n.id === action.meta.arg);
        if (item) item.read = true;
      });
  },
});

export default notificationsSlice.reducer;

export const selectAllNotifications = (state) => state.notifications.items;
export const selectUnreadCount = (state) =>
  state.notifications.items.filter((n) => !n.read).length;
export const selectNotificationsStatus = (state) => state.notifications.status;
export const selectNotificationsError = (state) => state.notifications.error;