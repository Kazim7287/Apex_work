import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: null,
  userType: null,
  userId: null,
  sectionId: null,
  sectionName: null,
  name: null,
  expiresAt: null,
  isLoading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.token = action.payload.token;
      state.userType = action.payload.userType;
      state.userId = action.payload.userId;
      state.sectionId = action.payload.sectionId;
      state.sectionName = action.payload.sectionName;
      state.name = action.payload.name;
      state.expiresAt = action.payload.expiresAt;
      state.isLoading = false;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      Object.assign(state, initialState);
    }
  }
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;