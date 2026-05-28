"use client";

import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  authenticate,
  onConnectionRequest,
  onConnectionConfirmed,
  onPartnerDisconnected,
  onWaitingRequestCancelled,
  onUserDecidingContinuation,
  onUserContinuedChat,
  onAuthenticationSuccess,
  onSocketError,
  getSocket,
  emitCheckAstro,
  onIncomingCall,
  onCallCancelled,
} from "@/lib/socketService";
import { getCookie } from "@/lib/clientHelpers";
import { AUTH_TOKEN_KEY } from "@/constants/others";
import {
  addIncomingRequest,
  removeIncomingRequest,
  setConnectionStatus,
  clearActiveChat,
} from "@/redux/slices/chatSlice";
import { fetchPendingChatRequests, fetchDashboardProfile, updateOnlineStatus, fetchDashboardAnalytics, fetchDailyStats } from "@/redux/slices/dashboardSlice";
import { setIncomingCall, clearIncomingCall } from "@/redux/slices/callSlice";
import { useRouter, usePathname } from "next/navigation";
import { normalizeSocketId, socketEventMatchesActiveChat } from "@/lib/socketEventGuards";

const SocketContext = React.createContext(null);

export function useSocketContext() {
  return React.useContext(SocketContext);
}

export default function SocketProvider({ children }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const activeChat = useSelector((state) => state.chat.activeChat);
  const profile = useSelector((state) => state.dashboard.profile.data);

  // console.log("profile", profile);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const activeChatRef = useRef(activeChat);
  const profileRef = useRef(profile);
  const pathnameRef = useRef(pathname);
  const isAuthenticatedRef = useRef(isAuthenticated);

  // Keep ref in sync so callbacks always see latest state
  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  // Online Status Re-sync logic
  // This handles the case where a refresh makes the backend think the user is offline.
  useEffect(() => {
    // Wait until both profile is loaded and socket is authenticated
    if (isAuthenticated && profile?._id) {
      const shouldBeOnline = sessionStorage.getItem("ASTROLOGER_ONLINE_STATUS_PERSIST") === "true";
      const isActuallyOnline = Boolean(profile.isOnline);

      if (shouldBeOnline && !isActuallyOnline) {
        console.log("[Socket] Auto-resyncing online status because sessionStorage says we should be online...");
        dispatch(updateOnlineStatus({ status: true }));
      }
    }
  }, [profile?.isOnline, profile?._id, isAuthenticated, dispatch]);

  // Authenticate when navigating if we now have a token
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const token = getCookie(AUTH_TOKEN_KEY);
    if (token && socket.connected && !isAuthenticated) {
      console.log("[Socket] Pathname changed and token found, authenticating...");
      authenticate(token);
    }
  }, [pathname, isAuthenticated]);

  // checkAstro heartbeat logic
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !profile?._id) return;

    const sendHeartbeat = () => {
      if (socket.connected && isAuthenticated) {
        console.log("[Socket] Sending heartbeat (checkAstro) for:", profile._id);
        emitCheckAstro(profile._id);
      }
    };

    // Send immediately if already authenticated
    if (isAuthenticated) {
      sendHeartbeat();
    }

    const interval = setInterval(sendHeartbeat, 25000); // every 25 seconds

    return () => clearInterval(interval);
  }, [profile?._id, isAuthenticated]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Authenticate on connect / reconnect
    const handleConnect = () => {
      setIsAuthenticated(false);
      const token = getCookie(AUTH_TOKEN_KEY);
      if (token) {
        authenticate(token);
      }
    };

    if (socket.connected && !isAuthenticatedRef.current) {
      const token = getCookie(AUTH_TOKEN_KEY);
      if (token) {
        authenticate(token);
      }
    }

    socket.on("connect", handleConnect);

    // --- Listeners ---

    const unsubAuth = onAuthenticationSuccess((data) => {
      setIsAuthenticated(true);
      console.log("[Socket] Authenticated:", data);
      
      // Refresh profile and requests to sync everything from backend
      void dispatch(fetchDashboardProfile());
      void dispatch(fetchPendingChatRequests());
    });

    const unsubRequest = onConnectionRequest((data) => {
      console.log("[Socket] connection_request:", data);
      
      // If it's a call request, show the popup modal
      if (data.requestType === "call" || data.requestType === "voice_call" || data.requestType === "video_call") {
        dispatch(setIncomingCall({
          channelName: data.channelName,
          userId: data.userId,
          userName: data.userName,
          userImage: data.userImage,
          astrologerId: data.astrologerId,
          requestType: data.requestType,
        }));
      } else {
        // Otherwise handle as a normal chat request
        dispatch(
          addIncomingRequest({
            userId: data.userId,
            userName: data.userName,
            userImage: data.userImage,
            astrologerId: data.astrologerId,
            requestType: data.requestType,
            timestamp: data.timestamp,
          })
        );
      }
      
      // Always refresh API-based list to be sure
      dispatch(fetchPendingChatRequests());
    });

    const unsubConfirmed = onConnectionConfirmed((data) => {
      console.log("[Socket] connection_confirmed:", data);
      if (!socketEventMatchesActiveChat(data, activeChatRef.current, profileRef.current)) {
        console.log("[Socket] Ignoring connection_confirmed for non-active chat:", data);
        return;
      }
      dispatch(setConnectionStatus("connected"));
    });

    const unsubDisconnected = onPartnerDisconnected((data) => {
      console.log("[Socket] partner_disconnected:", data);
      if (!socketEventMatchesActiveChat(data, activeChatRef.current, profileRef.current)) {
        console.log("[Socket] Ignoring partner_disconnected for non-active chat:", data);
        return;
      }
      toast("Chat ended by user");
      dispatch(clearActiveChat());
      // Re-authenticate socket so backend resumes sending new requests
      const freshToken = getCookie(AUTH_TOKEN_KEY);
      if (freshToken) authenticate(freshToken);
      // Refresh dashboard data (balance, earnings, stats)
      const now = new Date();
      dispatch(fetchDashboardProfile());
      dispatch(fetchDailyStats());
      dispatch(fetchDashboardAnalytics({ month: now.getMonth() + 1, year: now.getFullYear() }));
      // Refresh pending requests to show new requests that might have come
      dispatch(fetchPendingChatRequests());
      router.replace("/");
    });

    const unsubCancelled = onWaitingRequestCancelled((data) => {
      console.log("[Socket] waiting_request_cancelled:", data);
      dispatch(removeIncomingRequest(data.userId));
      dispatch(fetchPendingChatRequests());
      // If the cancelled request is the one we're connecting to, abort
      if (normalizeSocketId(activeChatRef.current.userId) === normalizeSocketId(data.userId)) {
        toast.error("User cancelled the request");
        dispatch(clearActiveChat());
        router.replace("/");
      }
    });

    const unsubDeciding = onUserDecidingContinuation((data) => {
      console.log("[Socket] user_deciding_continuation:", data);
      if (!socketEventMatchesActiveChat(data, activeChatRef.current, profileRef.current)) return;
      if (!pathnameRef.current?.startsWith("/chat/")) {
        toast("User is deciding to continue...");
      }
    });

    const unsubContinued = onUserContinuedChat((data) => {
      console.log("[Socket] user_continued_chat:", data);
      if (!socketEventMatchesActiveChat(data, activeChatRef.current, profileRef.current)) return;
      if (!pathnameRef.current?.startsWith("/chat/")) {
        toast.success("User continued the chat!");
      }
    });

    const unsubError = onSocketError((data) => {
      console.error("[Socket] error:", data);
      toast.error(data?.message || "Socket error occurred");
    });

    const unsubIncomingCall = onIncomingCall((data) => {
      console.log("[Socket] incoming_call:", data);
      dispatch(setIncomingCall({
        callId: data.callId,
        channelName: data.channelName,
        callType: data.callType || "audio",
        userId: data.userId,
        userName: data.userName || "User",
        userImage: data.userImage || null,
        userPhone: data.userPhone || null,
        astrologerId: data.astrologerId,
      }));
    });

    const unsubCallCancelled = onCallCancelled((data) => {
      console.log("[Socket] call_cancelled:", data);
      dispatch(clearIncomingCall());
      toast("Call cancelled by user");
    });

    // ────────────────────────────────────────────────────────────
    // Re-authenticate socket when tab becomes visible again.
    // Browsers may throttle or disconnect WebSockets when the tab
    // is in the background, so we ensure the socket is alive.
    // ────────────────────────────────────────────────────────────
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("[Socket] Tab became visible, checking socket state...");
        if (!socket.connected) {
          console.log("[Socket] Socket disconnected while in background, reconnecting...");
          socket.connect();
        }
        // Re-authenticate in case the server dropped the session
        const freshToken = getCookie(AUTH_TOKEN_KEY);
        if (freshToken && socket.connected) {
          authenticate(freshToken);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      socket.off("connect", handleConnect);
      unsubAuth();
      unsubRequest();
      unsubConfirmed();
      unsubDisconnected();
      unsubCancelled();
      unsubDeciding();
      unsubContinued();
      unsubError();
      unsubIncomingCall();
      unsubCallCancelled();
      setIsAuthenticated(false);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [dispatch, router]);

  return (
    <SocketContext.Provider value={getSocket()}>
      {children}
    </SocketContext.Provider>
  );
}
