// redux/teacherSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  data: null,
  loggedIn: false,
};

export const teacherSlice = createSlice({
  name: 'teacher',
  initialState,
  reducers: {
    setTeacher: (state, action) => {
      state.data = action.payload;
      state.loggedIn = true;
    },
    clearTeacher: (state) => {
      state.data = null;
      state.loggedIn = false;
    },
  },
});

export const { setTeacher, clearTeacher } = teacherSlice.actions;

export default teacherSlice.reducer;
