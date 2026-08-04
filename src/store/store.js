import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';

import attendanceReducer from './slices/attendanceSlice';
import documentRequestsReducer from './slices/documentRequestsSlice';
import documentUploadsReducer from './slices/documentUploadsSlice';
import authReducer from './slices/authSlice';
import tasksReducer from './slices/tasksSlice';
import notificationsReducer from './slices/notificationsSlice';

const rootReducer = combineReducers({
  attendance: attendanceReducer,
  documentRequests: documentRequestsReducer,
  documentUploads: documentUploadsReducer,
  auth: authReducer,
  tasks: tasksReducer,
  notifications: notificationsReducer,
});

// Per project decision: no separate local database (no SQLite) for this
// build — all offline data, including full history, lives in this
// persisted Redux store, backed by AsyncStorage. Worth knowing for later:
// Redux Persist re-serializes its whole persisted state on every write, so
// if any slice's history grows very large over time, that write can start
// to feel slow — not a concern at this project's scale, just worth
// watching if attendance/document history grows into the thousands of
// records per device.
//
// auth is intentionally NOT blacklisted from persistence here even
// though its tokens are also separately written to EncryptedStorage
// (see authSlice.js) — the token strings themselves are fine to sit in
// plain AsyncStorage-backed Redux state too (they're already opaque,
// short-lived, and revocable server-side); EncryptedStorage is used for
// the belt-and-suspenders case of restoring a session before Redux
// Persist has rehydrated. Worth revisiting if that turns out redundant.
const persistConfig = {
  key: 'pia-intern-portal-root',
  version: 1,
  storage: AsyncStorage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);