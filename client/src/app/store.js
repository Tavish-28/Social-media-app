import { configStore } from "@reduxjs/toolkit";
import userReducer from "../features/user/userSlice.js";
import connectionsReducer from "../features/connections/connectionSlice.js";
import messagesReducer from "../features/messages/messagesSlice.js";
export const store = configStore({
  reducer: {
    user: user,
    connections: connectionsReducer,
    messages: messagesReducer,
  },
});
