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

const rootReducer = combineReducers({
  attendance: attendanceReducer,
  documentRequests: documentRequestsReducer,
  documentUploads: documentUploadsReducer,
});

// Per project decision: no separate local database (no SQLite) for this
// build — all offline data, including full history, lives in this
// persisted Redux store, backed by AsyncStorage. Worth knowing for later:
// Redux Persist re-serializes its whole persisted state on every write, so
// if any slice's history grows very large over time, that write can start
// to feel slow — not a concern at this project's scale, just worth
// watching if attendance/document history grows into the thousands of
// records per device.
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
