import { createSlice } from "@reduxjs/toolkit";

const sessionSlice = createSlice({
  name: "session",
  initialState: {
    teacher_id: null,
    teacher_name: "",
    teacher_email: "",
    isAuthenticated: false,
  },
  reducers: {
    setSession: (state, action) => {
      const { teacher_id, teacher_name, teacher_email } = action.payload;
      state.teacher_id = teacher_id;
      state.teacher_name = teacher_name;
      state.teacher_email = teacher_email;
      state.isAuthenticated = true;
    },
    clearSession: (state) => {
      state.teacher_id = null;
      state.teacher_name = "";
      state.teacher_email = "";
      state.isAuthenticated = false;
    },
  },
});

export const { setSession, clearSession } = sessionSlice.actions;

export default sessionSlice.reducer;
