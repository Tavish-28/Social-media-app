import { createSlice } from "@reduxjs/toolkit";
import Messages from "../../pages/Messages";
const initalState = {
  messages: [],
};
const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {},
});

export default messagesSlice.reducer;
