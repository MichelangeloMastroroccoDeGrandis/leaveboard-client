// src/redux/approvalsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API = 'http://localhost:5000/api/wfh';

const fetchPendingRequests = createAsyncThunk(
  'approvals/fetchPending',
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/approvals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const approveRequest = createAsyncThunk(
  'approvals/approve',
  async (id, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API}/approvals/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.request;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

// ❌ REMOVE 'export' from here
const rejectRequest = createAsyncThunk(
  'approvals/reject',
  async ({ id, reason }, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/approvals/${id}/reject`, { reason }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { id };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const approvalsSlice = createSlice({
  name: 'approvals',
  initialState: {
    requests: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPendingRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload;
      })
      .addCase(fetchPendingRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch requests';
      })
      .addCase(approveRequest.fulfilled, (state, action) => {
        state.requests = state.requests.filter(r => r._id !== action.payload._id);
      })
      .addCase(rejectRequest.fulfilled, (state, action) => {
        state.requests = state.requests.filter(r => r._id !== action.payload.id);
      });
  },
});

// ✅ Default export
export default approvalsSlice.reducer;

// ✅ Named exports
export {
  fetchPendingRequests,
  approveRequest,
  rejectRequest,  // only export once here
};
