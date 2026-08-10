import { createSlice } from "@reduxjs/toolkit";
import Messages from "../../pages/Messages";
import { dummyPendingConnectionsData } from "../../assets/assets";
const initalState = {
  connections: [],
  pendingConnections: [],
  followers: [],
  following: [],
};
const connectionSlice = createSlice({
  name: "connections",
  initialState,
  reducers: {},
});

export default connectionsSlice.reducer;
