import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import api from "../../api/axios";

const initialState = {
  connections: [],
  pendingConnections: [],
  followers: [],
  following: [],
  loading: false,
  error: null,
};

const authHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const fetchConnections = createAsyncThunk(
  "connections/fetchConnections",
  async (token, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/user/connections", authHeaders(token));

      if (!data.success) {
        return rejectWithValue(data.message);
      }

      return {
        connections: data.connections || [],
        pendingConnections: data.pendingConnections || [],
        followers: data.followers || [],
        following: data.following || [],
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const acceptConnectionRequest = createAsyncThunk(
  "connections/acceptConnectionRequest",
  async ({ id, token }, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await api.post(
        "/api/user/accept",
        { id },
        authHeaders(token),
      );

      if (!data.success) {
        toast.error(data.message);
        return rejectWithValue(data.message);
      }

      toast.success(data.message);
      await dispatch(fetchConnections(token));
      return id;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

export const followUser = createAsyncThunk(
  "connections/followUser",
  async ({ id, token }, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/user/follow", { id }, authHeaders(token));

      if (!data.success) {
        toast.error(data.message);
        return rejectWithValue(data.message);
      }

      toast.success(data.message);
      await dispatch(fetchConnections(token));
      return id;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

export const unfollowUser = createAsyncThunk(
  "connections/unfollowUser",
  async ({ id, token }, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await api.post(
        "/api/user/unfollow",
        { id },
        authHeaders(token),
      );

      if (!data.success) {
        toast.error(data.message);
        return rejectWithValue(data.message);
      }

      toast.success(data.message);
      await dispatch(fetchConnections(token));
      return id;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

export const sendConnectionRequest = createAsyncThunk(
  "connections/sendConnectionRequest",
  async ({ id, token }, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/user/connect", { id }, authHeaders(token));

      if (!data.success) {
        toast.error(data.message);
        return rejectWithValue(data.message);
      }

      toast.success(data.message);
      await dispatch(fetchConnections(token));
      return id;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

const connectionSlice = createSlice({
  name: "connections",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchConnections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConnections.fulfilled, (state, action) => {
        state.loading = false;
        state.connections = action.payload.connections;
        state.pendingConnections = action.payload.pendingConnections;
        state.followers = action.payload.followers;
        state.following = action.payload.following;
      })
      .addCase(fetchConnections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Could not load connections";
      });
  },
});

export default connectionSlice.reducer;
