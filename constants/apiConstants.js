// const API_FALLBACK_URL = "http://localhost:7005";
const API_FALLBACK_URL = "https://astrologer.nakshatraai.ai";


export const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || API_FALLBACK_URL).replace(/\/$/, "");
export const AGORA_BASE_URL = process.env.NEXT_PUBLIC_AGORA_BASE_URL;
export const API_ENDPOINTS = {
  LOGIN_WITH_MOBILE: "/api/astrologer/loginwithmobile",
  VERIFY_OTP: "/api/astrologer/verifyotp",
  RESEND_OTP: "/api/astrologer/resendotp",
  REGISTRATION_SEND_OTP: "/api/astrologer/registration-send-otp",
  REGISTRATION_VERIFY_OTP: "/api/astrologer/registration-verify-otp",
  REGISTER: "/api/astrologer/register",
  GET_LISTING: "/api/astrologer/get-listing",
  GET_CMS: "/api/astrologer/get-cms",
  PROFILE: "/api/astrologer/profile",
  ONLINE_STATUS: "/api/astrologer/online-status",
  UPDATE_ASTROLOGER_DETAIL: "/api/astrologer/updateAstrologerDetail",
  ANALYTICS: "/api/astrologer/analytics",
  DAILY_STATS: "/api/astrologer/daily-stats",
  PAYOUT_HISTORY: "/api/astrologer/payout/history",
  PENDING_CHAT_REQUESTS: "/api/astrologer/pending-chat-requests",
  ASTROLOGER_REVIEWS: "/api/astrologer/get-astrologer-reviews",
  SESSIONS: "/api/astrologer/sessions",
  SESSION_DETAIL: "/api/astrologer/session",
  ADD_OFFER: "/api/astrologer/add-offer",
  GET_OFFERS: "/api/astrologer/getoffers",
  EDIT_OFFER: "/api/astrologer/edit-offer",
  DELETE_OFFER: "/api/astrologer/delete-offer",
  NOTIFICATIONS: "/api/astrologer/notifications",
  MARK_NOTIFICATION_READ: "/api/astrologer/mark-notification-read",

  //Verification Apis
  VERIFY_AADHAR:"/api/astrologer/verify-aadhar",
  VERIFY_AADHAR_OTP:"/api/astrologer/verify-aadhar-otp",
  VERIFY_PAN:"/api/astrologer/verify-pan",
  VERIFY_BANK:"/api/astrologer/verify-bank",

  //Blogs Apis
  GET_BLOGS: "/api/astrologer/get-blogs",
  CREATE_BLOG: "/api/astrologer/create-blog",
  DELETE_BLOG: "/api/astrologer/delete-blog",
  EDIT_BLOG: "/api/astrologer/update-blog",
  GET_BLOG_DETAILS: "/api/astrologer/get-blog-details",

  // Logout Api
  LOGOUT:"/api/astrologer/logout",

  // Agora Call Apis
  RTC_TOKEN: "/api/astrologer/agora/rtc-token",
  ACCEPT_CALL: "/api/astrologer/accept-call",
  REJECT_CALL: "/api/astrologer/reject-call",
  END_CALL: "/api/astrologer/end-call",
  CALL_STATUS: "/api/astrologer/call-status"
};