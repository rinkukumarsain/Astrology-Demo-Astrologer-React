import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { API_ENDPOINTS } from "@/constants/apiConstants";
import { getAPIAuth, postAPIAuth } from "@/lib/apiServices";

const DEFAULT_LIMIT = 10;

function pickApiMessage(body) {
  if (body == null) return "";
  if (typeof body === "string") return body.trim();
  if (typeof body !== "object") return "";
  const nested = body.data && typeof body.data === "object" ? body.data : null;
  const candidates = [body.message, body.msg, body.error, nested?.message, nested?.msg, nested?.error];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
  }
  return "";
}

function getErrorMessage(error) {
  return pickApiMessage(error?.response?.data) || error?.message || "Unable to load notifications";
}

function normalizeList(rawList) {
  const list = rawList && typeof rawList === "object" ? rawList : {};
  return {
    today: Array.isArray(list.today) ? list.today : [],
    yesterday: Array.isArray(list.yesterday) ? list.yesterday : [],
    older: Array.isArray(list.older) ? list.older : [],
  };
}

function normalizePagination(rawPagination, fallbackPage, fallbackLimit, list) {
  const totalItems = list.today.length + list.yesterday.length + list.older.length;
  const pagination = rawPagination && typeof rawPagination === "object" ? rawPagination : {};
  const page = Number(pagination.page) || fallbackPage || 1;
  const limit = Number(pagination.limit) || fallbackLimit || DEFAULT_LIMIT;
  const total = Number(pagination.total) || 0;
  const totalPages = Number(pagination.totalPages) || Math.max(1, Math.ceil(total / Math.max(limit, 1)));
  return { page, limit, total, totalPages, totalItems };
}

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async ({ page = 1, limit = DEFAULT_LIMIT } = {}, { rejectWithValue }) => {
    try {
      const response = await getAPIAuth(`${API_ENDPOINTS.NOTIFICATIONS}?page=${page}&limit=${limit}`);
      const payload = response?.data || {};
      const data = payload?.data && typeof payload.data === "object" ? payload.data : {};
      const list = normalizeList(data.list);
      const pagination = normalizePagination(data.pagination, page, limit, list);
      return {
        list,
        pagination,
        unreadCount: Number(data.unreadCount || 0),
        message: pickApiMessage(payload),
      };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const markNotificationsRead = createAsyncThunk(
  "notifications/markNotificationsRead",
  async (_, { rejectWithValue }) => {
    try {
      const response = await postAPIAuth(API_ENDPOINTS.MARK_NOTIFICATION_READ);
      return {
        message: pickApiMessage(response?.data),
      };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

const initialState = {
  loading: false,
  loaded: false,
  error: null,
  list: {
    today: [],
    yesterday: [],
    older: [],
  },
  pagination: {
    page: 1,
    limit: DEFAULT_LIMIT,
    total: 0,
    totalPages: 1,
    totalItems: 0,
  },
  unreadCount: 0,
  message: "",
  markReadLoading: false,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.loaded = true;
        state.error = null;
        state.list = action.payload.list;
        state.pagination = action.payload.pagination;
        state.unreadCount = action.payload.unreadCount;
        state.message = action.payload.message;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.loaded = true;
        state.error = action.payload || "Unable to load notifications";
      })
      .addCase(markNotificationsRead.pending, (state) => {
        state.markReadLoading = true;
      })
      .addCase(markNotificationsRead.fulfilled, (state, action) => {
        state.markReadLoading = false;
        state.unreadCount = 0;
        state.message = action.payload?.message || state.message;
        state.list.today = state.list.today.map((item) => ({ ...item, isRead: true }));
        state.list.yesterday = state.list.yesterday.map((item) => ({ ...item, isRead: true }));
        state.list.older = state.list.older.map((item) => ({ ...item, isRead: true }));
      })
      .addCase(markNotificationsRead.rejected, (state) => {
        state.markReadLoading = false;
      });
  },
});

export const notificationReducer = notificationSlice.reducer;
