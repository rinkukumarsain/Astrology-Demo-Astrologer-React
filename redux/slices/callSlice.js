import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { postAPIAuth } from "@/lib/apiServices";
import { AGORA_BASE_URL, API_ENDPOINTS } from "@/constants/apiConstants";
import axios from "axios";

/**
 * Fetch Agora RTC Token for a channel
 */
export const fetchRtcToken = createAsyncThunk(
  "call/fetchRtcToken",
  async ({ channelName, astrologerId }, { rejectWithValue }) => {
    try {
      const response = await postAPIAuth(API_ENDPOINTS.RTC_TOKEN, {
        channelName,
        role: "publisher",
        astrologerId,
        expireTime: 3600,
      });
        // const response = await axios.post(`${AGORA_BASE_URL}/rtc-token`, {
        //         channelName,
        //         role: "subscriber",
        //         astrologerId,
        //         expireTime: 3600,
        //       });
      
      return response?.data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch RTC token");
    }
  }
);

/**
 * Signal to backend that call is accepted
 */
export const acceptCall = createAsyncThunk(
  "call/acceptCall",
  async ({ channelName }, { rejectWithValue }) => {
    try {
      const response = await postAPIAuth(API_ENDPOINTS.ACCEPT_CALL, { channelName });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to accept call");
    }
  }
);

/**
 * Signal to backend that call is rejected
 */
export const rejectCall = createAsyncThunk(
  "call/rejectCall",
  async ({ channelName }, { rejectWithValue }) => {
    try {
      const response = await postAPIAuth(API_ENDPOINTS.REJECT_CALL, { channelName });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to reject call");
    }
  }
);

/**
 * Signal to backend that call has ended
 */
export const endCall = createAsyncThunk(
  "call/endCall",
  async ({ channelName, duration, endedBy }, { rejectWithValue }) => {
    try {
      const response = await postAPIAuth(API_ENDPOINTS.END_CALL, {
        channelName,
        duration,
        endedBy,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to end call");
    }
  }
);

const initialState = {
  incomingCall: null, // { callId, channelName, callType, userId, userName, userImage }
  activeCall: null,   // { channelName, token, uid, callType, userDetails }
  status: "idle",     // 'idle' | 'ringing' | 'connecting' | 'connected' | 'ended'
  loading: false,
  error: null,
  lastHandledChannel: null, // Track last accepted/rejected channel to prevent stale notifications
};

const callSlice = createSlice({
  name: "call",
  initialState,
  reducers: {
    setIncomingCall(state, action) {
      // Don't re-show overlay for a channel that was already handled
      if (action.payload?.channelName && action.payload.channelName === state.lastHandledChannel) {
        console.log("[callSlice] Ignoring setIncomingCall for already-handled channel:", action.payload.channelName);
        return;
      }
      state.incomingCall = action.payload;
      state.status = action.payload ? "ringing" : "idle";
    },
    clearIncomingCall(state) {
      state.incomingCall = null;
      state.status = state.status === "ringing" ? "idle" : state.status;
    },
    setActiveCall(state, action) {
      state.activeCall = action.payload;
      state.status = action.payload ? "connected" : "idle";
      state.incomingCall = null;
    },
    clearCallState(state) {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Accept Call
      .addCase(acceptCall.pending, (state) => {
        state.loading = true;
      })
      .addCase(acceptCall.fulfilled, (state) => {
        state.loading = false;
        state.status = "connecting";
        // Track this channel so stale notification clicks are ignored
        if (state.incomingCall?.channelName) {
          state.lastHandledChannel = state.incomingCall.channelName;
        }
        state.incomingCall = null;
      })
      .addCase(acceptCall.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Reject Call
      .addCase(rejectCall.fulfilled, (state) => {
        // Track this channel so stale notification clicks are ignored
        if (state.incomingCall?.channelName) {
          state.lastHandledChannel = state.incomingCall.channelName;
        }
        state.incomingCall = null;
        state.status = "idle";
      })
      // End Call
      .addCase(endCall.fulfilled, (state) => {
        // Track this channel so stale notification clicks are ignored
        if (state.activeCall?.channelName) {
          state.lastHandledChannel = state.activeCall.channelName;
        }
        state.activeCall = null;
        state.status = "idle";
      });
  },
});

export const { setIncomingCall, clearIncomingCall, setActiveCall, clearCallState } = callSlice.actions;
export const callReducer = callSlice.reducer;
