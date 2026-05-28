import { configureStore } from "@reduxjs/toolkit";
import { dashboardReducer } from "@/redux/slices/dashboardSlice";
import { notificationReducer } from "@/redux/slices/notificationSlice";
import { chatReducer } from "@/redux/slices/chatSlice";
import { callReducer } from "@/redux/slices/callSlice";

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    notifications: notificationReducer,
    chat: chatReducer,
    call: callReducer,
  },
});
