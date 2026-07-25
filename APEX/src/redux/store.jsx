import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";  // ✅ Manages student authentication
import teacherReducer from "./teacherSlice"; // ✅ Manages teacher data

export const store = configureStore({
  reducer: {
    auth: authReducer,  // ✅ Handles student login
    teacher: teacherReducer, // ✅ Handles teacher data (including ID)
  },
});

export default store;
