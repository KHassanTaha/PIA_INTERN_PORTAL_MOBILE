import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  decideSignatureRequest,
  getAuditLogs,
  getInterns,
  getSignatureRequests,
  getStaffTasks,
  getTeamAttendance,
  createIntern,
} from '../../services/staffData';


// One thunk per domain rather than one combined "fetch everything" thunk
// - each table screen only fetches its own slice of data when it mounts,
// not all five domains every time any one of them is opened.
export const fetchInternsThunk = createAsyncThunk('staffData/fetchInterns', async (_, { rejectWithValue }) => {
  try {
    return await getInterns();
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchTeamAttendanceThunk = createAsyncThunk('staffData/fetchAttendance', async (_, { rejectWithValue }) => {
  try {
    return await getTeamAttendance();
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const createInternThunk = createAsyncThunk(
  'staffData/createIntern',
  async (payload, { rejectWithValue }) => {
    try {
      return await createIntern(payload);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const fetchStaffTasksThunk = createAsyncThunk('staffData/fetchTasks', async (_, { rejectWithValue }) => {
  try {
    return await getStaffTasks();
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchSignatureRequestsThunk = createAsyncThunk('staffData/fetchSignatures', async (_, { rejectWithValue }) => {
  try {
    return await getSignatureRequests();
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const decideSignatureRequestThunk = createAsyncThunk(
  'staffData/decideSignature',
  async ({ id, decision }, { rejectWithValue }) => {
    try {
      return await decideSignatureRequest(id, decision);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const fetchAuditLogsThunk = createAsyncThunk('staffData/fetchAuditLogs', async (_, { rejectWithValue }) => {
  try {
    return await getAuditLogs();
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

function domainReducers(builder, thunk, key) {
  builder
    .addCase(thunk.pending, (state) => {
      state[key].status = 'loading';
      state[key].error = null;
    })
    .addCase(thunk.fulfilled, (state, action) => {
      state[key].status = 'succeeded';
      state[key].items = action.payload;
    })
    .addCase(thunk.rejected, (state, action) => {
      state[key].status = 'failed';
      state[key].error = action.payload;
    });
}

const emptyDomain = () => ({ status: 'idle', error: null, items: [] });

const staffDataSlice = createSlice({
  name: 'staffData',
  initialState: {
    interns: emptyDomain(),
    attendance: emptyDomain(),
    tasks: emptyDomain(),
    signatures: emptyDomain(),
    auditLogs: emptyDomain(),
  },
  reducers: {},
  extraReducers: (builder) => {
    domainReducers(builder, fetchInternsThunk, 'interns');
    domainReducers(builder, fetchTeamAttendanceThunk, 'attendance');
    domainReducers(builder, fetchStaffTasksThunk, 'tasks');
    domainReducers(builder, fetchSignatureRequestsThunk, 'signatures');
    domainReducers(builder, fetchAuditLogsThunk, 'auditLogs');

    builder.addCase(decideSignatureRequestThunk.fulfilled, (state, action) => {
      // A decided signature request leaves the pending queue.
      state.signatures.items = state.signatures.items.filter((r) => r.id !== action.payload.id);
    });

    builder.addCase(createInternThunk.fulfilled, (state, action) => {
      // Add the newly created intern to the interns list.
      state.interns.items.push(action.payload);
    });
  },
});

export default staffDataSlice.reducer;

export const selectInterns = (state) => state.staffData.interns;
export const selectTeamAttendance = (state) => state.staffData.attendance;
export const selectStaffTasks = (state) => state.staffData.tasks;
export const selectSignatureRequests = (state) => state.staffData.signatures;
export const selectAuditLogs = (state) => state.staffData.auditLogs;