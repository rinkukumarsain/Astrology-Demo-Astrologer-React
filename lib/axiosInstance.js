import axios from "axios";
import { AUTH_TOKEN_KEY, LOGOUT_EVENT } from "@/constants/others";
import { eventEmitter } from "./events";
import { getCookie, removeCookie } from "./clientHelpers";
import { BASE_URL } from "@/constants/apiConstants";

/**
 * Axios Instance to use with auth token
 *
 */
export const apiAUTH = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    Accept: "application/json",
  },
});

/**
 * Axios Instance to use without auth token
 *
 */
export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    Accept: "application/json",
  },
});

apiAUTH.interceptors.request.use((req) => {
  const token = getCookie(AUTH_TOKEN_KEY);
  if (!token) {
    return Promise.reject(new Error("Missing auth token"));
  }
  req.headers.Authorization = `Bearer ${token}`;
  return req;
});

//  Emits logout event on 401 Unauthorized errors

let logoutTriggered = false;

function triggerLogout(reason) {
  if (logoutTriggered) return;
  logoutTriggered = true;

  try {
    removeCookie(AUTH_TOKEN_KEY);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("astrologerAid");
      window.localStorage.removeItem("loginMobile");
      window.localStorage.removeItem("isNewAstrologer");
      window.location.href = "/login";
    }
  } catch {
    // ignore client storage cleanup issues
  }

  eventEmitter.emit(LOGOUT_EVENT);
  if (reason) {
    console.warn(reason);
  }

  setTimeout(() => {
    logoutTriggered = false;
  }, 3000);
}

function isAstrologerNotFound403(error) {
  const status = error?.response?.status;
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "";

  return status === 403 && String(message).toLowerCase().includes("astrologer not found");
}

apiAUTH.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      triggerLogout("🔒 401 detected — logout triggered");
    } else if (isAstrologerNotFound403(error)) {
      triggerLogout("🔒 403 astrologer not found — logout triggered");
    }
    return Promise.reject(error);
  }
);

export const postAPIAuthFormData = async (url, params, tokenInit) => {
  const token = getCookie(AUTH_TOKEN_KEY);
  try {
    const response = await axios({
      method: "post",
      url: `${BASE_URL}${url}`,
      data: params,
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${tokenInit ? tokenInit : token}`,
      },
    });
    return response;
  } catch (error) {
    
  }
};