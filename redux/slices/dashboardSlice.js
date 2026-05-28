import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { API_ENDPOINTS } from "@/constants/apiConstants";
import { deleteAPIAuth, getAPIAuth, patchAPIAuth, postAPIAuth, putAPIAuth } from "@/lib/apiServices";

function getPayloadProfile(payload) {
  if (!payload || typeof payload !== "object") return null;
  return payload.profile || payload.astrologer || payload.user || payload.data || payload;
}

function getPayloadData(payload) {
  if (!payload || typeof payload !== "object") return null;
  return payload.data && typeof payload.data === "object" ? payload.data : payload;
}

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
  return pickApiMessage(error?.response?.data) || error?.message || "Something went wrong";
}

function getServiceFlags(profile) {
  return {
    isChatting: Boolean(profile?.isChatting),
    isCalling: Boolean(profile?.isCalling || profile?.isVoiceCalling),
    isVideoCalling: Boolean(profile?.isVideoCalling),
  };
}

function activeServiceCount(flags) {
  return Number(flags.isChatting) + Number(flags.isCalling) + Number(flags.isVideoCalling);
}

function buildServiceAvailabilityFormData({ isChatting, isCalling, isVideoCalling }) {
  const formData = new FormData();
  formData.append("isChatting", String(isChatting));
  formData.append("isCalling", String(isCalling));
  formData.append("isVideoCalling", String(isVideoCalling));
  return formData;
}

export const fetchDashboardProfile = createAsyncThunk("dashboard/fetchProfile", async (_, { rejectWithValue }) => {
  try {
    const response = await getAPIAuth(API_ENDPOINTS.PROFILE);
    const profileData = getPayloadProfile(response?.data?.data || response?.data);
    return profileData;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchDashboardAnalytics = createAsyncThunk(
  "dashboard/fetchAnalytics",
  async ({ month, year }, { rejectWithValue }) => {
    try {
      const response = await getAPIAuth(`${API_ENDPOINTS.ANALYTICS}?month=${month}&year=${year}`);
      const data = getPayloadData(response?.data);
      return { data, month, year };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchDailyStats = createAsyncThunk("dashboard/fetchDailyStats", async (_, { rejectWithValue }) => {
  try {
    const response = await getAPIAuth(API_ENDPOINTS.DAILY_STATS);
    const data = getPayloadData(response?.data);
    return data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchPayoutHistory = createAsyncThunk(
  "dashboard/fetchPayoutHistory",
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await getAPIAuth(`${API_ENDPOINTS.PAYOUT_HISTORY}?startDate=${startDate}&endDate=${endDate}`);
      const data = getPayloadData(response?.data);
      return { data, startDate, endDate };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchPendingChatRequests = createAsyncThunk("dashboard/fetchPendingChatRequests", async (_, { rejectWithValue }) => {
  try {
    const response = await getAPIAuth(API_ENDPOINTS.PENDING_CHAT_REQUESTS);
    const payload = response?.data;
    const data = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
    return data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchAstrologerReviews = createAsyncThunk("dashboard/fetchAstrologerReviews", async (_, { rejectWithValue }) => {
  try {
    const response = await getAPIAuth(API_ENDPOINTS.ASTROLOGER_REVIEWS);
    const data = getPayloadData(response?.data);
    return data && typeof data === "object" ? data : {};
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchSessions = createAsyncThunk(
  "dashboard/fetchSessions",
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await getAPIAuth(`${API_ENDPOINTS.SESSIONS}?page=${page}&limit=${limit}`);
      const data = getPayloadData(response?.data);
      const sessions = data?.sessions && typeof data.sessions === "object" ? data.sessions : {};
      return {
        sessions,
        page: Number(data?.page) || page,
        perPage: Number(data?.perPage) || limit,
        totalCount: Number(data?.totalCount) || 0,
        totalPages: Number(data?.totalPages) || 1,
      };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchSessionDetail = createAsyncThunk("dashboard/fetchSessionDetail", async (sessionId, { rejectWithValue }) => {
  try {
    const response = await getAPIAuth(`${API_ENDPOINTS.SESSION_DETAIL}/${sessionId}`);
    const data = getPayloadData(response?.data);
    return data && typeof data === "object" ? data : {};
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const addOffer = createAsyncThunk("dashboard/addOffer", async (payload, { rejectWithValue }) => {
  try {
    const response = await postAPIAuth(API_ENDPOINTS.ADD_OFFER, payload);
    return {
      message: pickApiMessage(response?.data),
      data: getPayloadData(response?.data),
    };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const editOffer = createAsyncThunk("dashboard/editOffer", async ({ offerId, payload }, { rejectWithValue }) => {
  try {
    const response = await patchAPIAuth(`${API_ENDPOINTS.EDIT_OFFER}/${offerId}`, payload);
    return {
      message: pickApiMessage(response?.data),
      data: getPayloadData(response?.data),
    };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchOffers = createAsyncThunk(
  "dashboard/fetchOffers",
  async ({ page = 1, perPage = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await getAPIAuth(`${API_ENDPOINTS.GET_OFFERS}?page=${page}&perPage=${perPage}`);
      const data = getPayloadData(response?.data) || {};
      return {
        offers: Array.isArray(data?.offers) ? data.offers : [],
        page: Number(data?.page) || page,
        perPage: Number(data?.perPage) || perPage,
        totalCount: Number(data?.totalCount) || 0,
        totalPages: Number(data?.totalPages) || 1,
      };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const deleteOffer = createAsyncThunk("dashboard/deleteOffer", async (offerId, { rejectWithValue }) => {
  try {
    const response = await deleteAPIAuth(`${API_ENDPOINTS.DELETE_OFFER}/${offerId}`);
    return {
      message: pickApiMessage(response?.data),
    };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const updateOnlineStatus = createAsyncThunk(
  "dashboard/updateOnlineStatus",
  async ({ status }, { dispatch, rejectWithValue }) => {
    try {
      const statusRes = await postAPIAuth(API_ENDPOINTS.ONLINE_STATUS, { status: Boolean(status) });
      const statusMessage = pickApiMessage(statusRes?.data);

      // Persist choice to sessionStorage to handle page refreshes
      if (typeof window !== "undefined") {
        sessionStorage.setItem("ASTROLOGER_ONLINE_STATUS_PERSIST", String(Boolean(status)));
      }

      const refreshedProfile = await dispatch(fetchDashboardProfile()).unwrap();
      let autoMessage = "";

      if (status && refreshedProfile && activeServiceCount(getServiceFlags(refreshedProfile)) === 0) {
        const patchRes = await patchAPIAuth(
          API_ENDPOINTS.UPDATE_ASTROLOGER_DETAIL,
          buildServiceAvailabilityFormData({ isChatting: true, isCalling: false, isVideoCalling: false }),
        );
        autoMessage = pickApiMessage(patchRes?.data);
        await dispatch(fetchDashboardProfile());
      }

      return { status: Boolean(status), message: statusMessage, autoMessage };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const updateAstrologerServices = createAsyncThunk(
  "dashboard/updateAstrologerServices",
  async ({ isChatting, isCalling, isVideoCalling }, { dispatch, rejectWithValue }) => {
    try {
      const response = await patchAPIAuth(
        API_ENDPOINTS.UPDATE_ASTROLOGER_DETAIL,
        buildServiceAvailabilityFormData({ isChatting, isCalling, isVideoCalling }),
      );
      await dispatch(fetchDashboardProfile());
      return {
        message: pickApiMessage(response?.data),
        data: { isChatting: Boolean(isChatting), isCalling: Boolean(isCalling), isVideoCalling: Boolean(isVideoCalling) },
      };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

//Blogs Reducers
export const fetchBlogs = createAsyncThunk("dashboard/fetchBlogs", async (_, { rejectWithValue }) => {
  try {
    const response = await getAPIAuth(API_ENDPOINTS.GET_BLOGS);
    const blogs = Array.isArray(response?.data?.data) ? response.data.data : [];
    return blogs;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const createBlog = createAsyncThunk("dashboard/createBlog", async (payload, { rejectWithValue }) => {
  try {
    const response = await postAPIAuth(API_ENDPOINTS.CREATE_BLOG, payload);
    return {
      message: pickApiMessage(response?.data),
      data: getPayloadData(response?.data),
    };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const editBlog = createAsyncThunk("dashboard/editBlog", async ({ blogId, payload }, { rejectWithValue }) => {
  try {
    const response = await putAPIAuth(`${API_ENDPOINTS.EDIT_BLOG}/${blogId}`, payload);
    return {
      message: pickApiMessage(response?.data),
      data: getPayloadData(response?.data),
    };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const deleteBlog = createAsyncThunk("dashboard/deleteBlog", async (blogId, { rejectWithValue }) => {
  try {
    const response = await deleteAPIAuth(`${API_ENDPOINTS.DELETE_BLOG}/${blogId}`);
    return {
      message: pickApiMessage(response?.data),
    };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const initialState = {
  profile: {
    loading: false,
    loaded: false,
    error: null,
    data: null,
  },
  analytics: {
    loading: false,
    loaded: false,
    error: null,
    data: null,
    month: null,
    year: null,
  },
  dailyStats: {
    loading: false,
    loaded: false,
    error: null,
    data: null,
  },
  payoutHistory: {
    loading: false,
    loaded: false,
    error: null,
    data: null,
    startDate: null,
    endDate: null,
  },
  pendingChatRequests: {
    loading: false,
    loaded: false,
    error: null,
    data: [],
  },
  reviews: {
    loading: false,
    loaded: false,
    error: null,
    data: null,
  },
  sessions: {
    loading: false,
    loaded: false,
    error: null,
    data: {},
    page: 1,
    perPage: 10,
    totalCount: 0,
    totalPages: 1,
  },
  sessionDetail: {
    loading: false,
    loaded: false,
    error: null,
    data: null,
  },
  offerCreate: {
    loading: false,
    error: null,
  },
  offerEdit: {
    loading: false,
    error: null,
  },
  offers: {
    loading: false,
    loaded: false,
    error: null,
    data: [],
    page: 1,
    perPage: 10,
    totalCount: 0,
    totalPages: 1,
  },
  offerDelete: {
    loading: false,
    error: null,
  },
  blogs: {
    loading: false,
    loaded: false,
    error: null,
    data: [],
  },
  blogCreate: {
    loading: false,
    error: null,
  },
  blogEdit: {
    loading: false,
    error: null,
  },
  blogDelete: {
    loading: false,
    error: null,
  },
  statusUpdate: {
    loading: false,
    error: null,
  },
  serviceUpdate: {
    loading: false,
    error: null,
  },
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    resetDashboard() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardProfile.pending, (state) => {
        state.profile.loading = true;
        state.profile.error = null;
      })
      .addCase(fetchDashboardProfile.fulfilled, (state, action) => {
        state.profile.loading = false;
        state.profile.loaded = true;
        state.profile.error = null;
        if (action.payload !== null && action.payload !== undefined) {
          state.profile.data = action.payload;
        }
      })
      .addCase(fetchDashboardProfile.rejected, (state, action) => {
        state.profile.loading = false;
        state.profile.loaded = true;
        state.profile.error = action.payload || "Unable to load profile";
      })
      .addCase(fetchDashboardAnalytics.pending, (state) => {
        state.analytics.loading = true;
        state.analytics.error = null;
      })
      .addCase(fetchDashboardAnalytics.fulfilled, (state, action) => {
        state.analytics.loading = false;
        state.analytics.loaded = true;
        state.analytics.error = null;
        if (action.payload?.data !== null && action.payload?.data !== undefined) {
          state.analytics.data = action.payload.data;
        }
        state.analytics.month = action.payload?.month ?? state.analytics.month;
        state.analytics.year = action.payload?.year ?? state.analytics.year;
      })
      .addCase(fetchDashboardAnalytics.rejected, (state, action) => {
        state.analytics.loading = false;
        state.analytics.loaded = true;
        state.analytics.error = action.payload || "Unable to load analytics";
      })
      .addCase(fetchDailyStats.pending, (state) => {
        state.dailyStats.loading = true;
        state.dailyStats.error = null;
      })
      .addCase(fetchDailyStats.fulfilled, (state, action) => {
        state.dailyStats.loading = false;
        state.dailyStats.loaded = true;
        state.dailyStats.error = null;
        if (action.payload !== null && action.payload !== undefined) {
          state.dailyStats.data = action.payload;
        }
      })
      .addCase(fetchDailyStats.rejected, (state, action) => {
        state.dailyStats.loading = false;
        state.dailyStats.loaded = true;
        state.dailyStats.error = action.payload || "Unable to load daily stats";
      })
      .addCase(fetchPayoutHistory.pending, (state) => {
        state.payoutHistory.loading = true;
        state.payoutHistory.error = null;
      })
      .addCase(fetchPayoutHistory.fulfilled, (state, action) => {
        state.payoutHistory.loading = false;
        state.payoutHistory.loaded = true;
        state.payoutHistory.error = null;
        if (action.payload?.data !== null && action.payload?.data !== undefined) {
          state.payoutHistory.data = action.payload.data;
        }
        state.payoutHistory.startDate = action.payload?.startDate ?? state.payoutHistory.startDate;
        state.payoutHistory.endDate = action.payload?.endDate ?? state.payoutHistory.endDate;
      })
      .addCase(fetchPayoutHistory.rejected, (state, action) => {
        state.payoutHistory.loading = false;
        state.payoutHistory.loaded = true;
        state.payoutHistory.error = action.payload || "Unable to load payout history";
      })
      .addCase(fetchPendingChatRequests.pending, (state) => {
        state.pendingChatRequests.loading = true;
        state.pendingChatRequests.error = null;
      })
      .addCase(fetchPendingChatRequests.fulfilled, (state, action) => {
        state.pendingChatRequests.loading = false;
        state.pendingChatRequests.loaded = true;
        state.pendingChatRequests.error = null;
        state.pendingChatRequests.data = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchPendingChatRequests.rejected, (state, action) => {
        state.pendingChatRequests.loading = false;
        state.pendingChatRequests.loaded = true;
        state.pendingChatRequests.error = action.payload || "Unable to load chat requests";
      })
      .addCase(fetchAstrologerReviews.pending, (state) => {
        state.reviews.loading = true;
        state.reviews.error = null;
      })
      .addCase(fetchAstrologerReviews.fulfilled, (state, action) => {
        state.reviews.loading = false;
        state.reviews.loaded = true;
        state.reviews.error = null;
        state.reviews.data = action.payload;
      })
      .addCase(fetchAstrologerReviews.rejected, (state, action) => {
        state.reviews.loading = false;
        state.reviews.loaded = true;
        state.reviews.error = action.payload || "Unable to load reviews";
      })
      .addCase(fetchSessions.pending, (state) => {
        state.sessions.loading = true;
        state.sessions.error = null;
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.sessions.loading = false;
        state.sessions.loaded = true;
        state.sessions.error = null;
        state.sessions.data = action.payload?.sessions || {};
        state.sessions.page = action.payload?.page || state.sessions.page;
        state.sessions.perPage = action.payload?.perPage || state.sessions.perPage;
        state.sessions.totalCount = action.payload?.totalCount || 0;
        state.sessions.totalPages = action.payload?.totalPages || 1;
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.sessions.loading = false;
        state.sessions.loaded = true;
        state.sessions.error = action.payload || "Unable to load sessions";
      })
      .addCase(fetchSessionDetail.pending, (state) => {
        state.sessionDetail.loading = true;
        state.sessionDetail.error = null;
      })
      .addCase(fetchSessionDetail.fulfilled, (state, action) => {
        state.sessionDetail.loading = false;
        state.sessionDetail.loaded = true;
        state.sessionDetail.error = null;
        state.sessionDetail.data = action.payload || null;
      })
      .addCase(fetchSessionDetail.rejected, (state, action) => {
        state.sessionDetail.loading = false;
        state.sessionDetail.loaded = true;
        state.sessionDetail.error = action.payload || "Unable to load session detail";
      })
      .addCase(addOffer.pending, (state) => {
        state.offerCreate.loading = true;
        state.offerCreate.error = null;
      })
      .addCase(addOffer.fulfilled, (state) => {
        state.offerCreate.loading = false;
        state.offerCreate.error = null;
      })
      .addCase(addOffer.rejected, (state, action) => {
        state.offerCreate.loading = false;
        state.offerCreate.error = action.payload || "Unable to create offer";
      })
      .addCase(editOffer.pending, (state) => {
        state.offerEdit.loading = true;
        state.offerEdit.error = null;
      })
      .addCase(editOffer.fulfilled, (state) => {
        state.offerEdit.loading = false;
        state.offerEdit.error = null;
      })
      .addCase(editOffer.rejected, (state, action) => {
        state.offerEdit.loading = false;
        state.offerEdit.error = action.payload || "Unable to edit offer";
      })
      .addCase(fetchOffers.pending, (state) => {
        state.offers.loading = true;
        state.offers.error = null;
      })
      .addCase(fetchOffers.fulfilled, (state, action) => {
        state.offers.loading = false;
        state.offers.loaded = true;
        state.offers.error = null;
        state.offers.data = action.payload?.offers || [];
        state.offers.page = action.payload?.page || state.offers.page;
        state.offers.perPage = action.payload?.perPage || state.offers.perPage;
        state.offers.totalCount = action.payload?.totalCount || 0;
        state.offers.totalPages = action.payload?.totalPages || 1;
      })
      .addCase(fetchOffers.rejected, (state, action) => {
        state.offers.loading = false;
        state.offers.loaded = true;
        state.offers.error = action.payload || "Unable to load offers";
      })
      .addCase(deleteOffer.pending, (state) => {
        state.offerDelete.loading = true;
        state.offerDelete.error = null;
      })
      .addCase(deleteOffer.fulfilled, (state) => {
        state.offerDelete.loading = false;
        state.offerDelete.error = null;
      })
      .addCase(deleteOffer.rejected, (state, action) => {
        state.offerDelete.loading = false;
        state.offerDelete.error = action.payload || "Unable to delete offer";
      })
      .addCase(updateOnlineStatus.pending, (state) => {
        state.statusUpdate.loading = true;
        state.statusUpdate.error = null;
      })
      .addCase(updateOnlineStatus.fulfilled, (state) => {
        state.statusUpdate.loading = false;
        state.statusUpdate.error = null;
      })
      .addCase(updateOnlineStatus.rejected, (state, action) => {
        state.statusUpdate.loading = false;
        state.statusUpdate.error = action.payload || "Unable to update online status";
      })
      .addCase(updateAstrologerServices.pending, (state) => {
        state.serviceUpdate.loading = true;
        state.serviceUpdate.error = null;
      })
      .addCase(updateAstrologerServices.fulfilled, (state) => {
        state.serviceUpdate.loading = false;
        state.serviceUpdate.error = null;
      })
      .addCase(updateAstrologerServices.rejected, (state, action) => {
        state.serviceUpdate.loading = false;
        state.serviceUpdate.error = action.payload || "Unable to update service status";
      })
       .addCase(fetchBlogs.pending, (state) => {
        state.blogs.loading = true;
        state.blogs.error = null;
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.blogs.loading = false;
        state.blogs.loaded = true;
        state.blogs.error = null;
        state.blogs.data = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.blogs.loading = false;
        state.blogs.loaded = true;
        state.blogs.error = action.payload || "Unable to load blogs";
      })
      .addCase(createBlog.pending, (state) => {
        state.blogCreate.loading = true;
        state.blogCreate.error = null;
      })
      .addCase(createBlog.fulfilled, (state) => {
        state.blogCreate.loading = false;
        state.blogCreate.error = null;
      })
      .addCase(createBlog.rejected, (state, action) => {
        state.blogCreate.loading = false;
        state.blogCreate.error = action.payload || "Unable to create blog";
      })
      .addCase(editBlog.pending, (state) => {
        state.blogEdit.loading = true;
        state.blogEdit.error = null;
      })
      .addCase(editBlog.fulfilled, (state) => {
        state.blogEdit.loading = false;
        state.blogEdit.error = null;
      })
      .addCase(editBlog.rejected, (state, action) => {
        state.blogEdit.loading = false;
        state.blogEdit.error = action.payload || "Unable to edit blog";
      })
      .addCase(deleteBlog.pending, (state) => {
        state.blogDelete.loading = true;
        state.blogDelete.error = null;
      })
      .addCase(deleteBlog.fulfilled, (state) => {
        state.blogDelete.loading = false;
        state.blogDelete.error = null;
      })
      .addCase(deleteBlog.rejected, (state, action) => {
        state.blogDelete.loading = false;
        state.blogDelete.error = action.payload || "Unable to delete blog";
      })
  },
});

export const { resetDashboard } = dashboardSlice.actions;
export const dashboardReducer = dashboardSlice.reducer;
