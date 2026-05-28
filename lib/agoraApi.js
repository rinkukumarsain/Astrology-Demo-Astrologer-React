import axios from "axios";
import { getCookie } from "./clientHelpers";
import { AUTH_TOKEN_KEY } from "@/constants/others";

const AGORA_BASE_URL = process.env.NEXT_PUBLIC_AGORA_BASE_URL;

/**
 * Axios Instance for Agora-specific backend calls
 */
export const agoraApi = axios.create({
  baseURL: AGORA_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    Accept: "application/json",
  },
});

agoraApi.interceptors.request.use((req) => {
  const token = getCookie(AUTH_TOKEN_KEY);
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

/**
 * Agora API services
 */
export const postAgora = async (url, data) => {
  const response = await agoraApi.post(url, data);
  return response;
};

export const getAgora = async (url) => {
  const response = await agoraApi.get(url);
  return response;
};
