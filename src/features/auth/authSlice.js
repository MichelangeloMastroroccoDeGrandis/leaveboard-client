import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        localStorage.setItem('token', action.payload.token);
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateToken: (state, action) => {
      state.token = action.payload;
    },
    logout: (state) => {
        state.user = null;
        state.token = null;
        state.loading = false;
        state.error = null; 
        state.isAuthenticated = false;
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, updateToken } = authSlice.actions;
export default authSlice.reducer;
