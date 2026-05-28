"use client";

import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "@/redux/store";
import { FIREBASE_FCM_TOKEN } from "@/constants/others";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { onMessageListener, requestForToken } from "@/utils/firebase";
import { setIncomingCall, clearIncomingCall } from "@/redux/slices/callSlice";

function FCMHandler() {
  const dispatch = useDispatch();
  const isListeningRef = useRef(false);

  useEffect(() => {
    const fetchFirebaseToken = async () => {
      try {
        const fcmToken = await requestForToken();
        if (fcmToken) {
          console.log("FCM Token:", fcmToken);
          sessionStorage.setItem(FIREBASE_FCM_TOKEN, fcmToken);
        }
      } catch (error) {
        console.error("Failed to fetch FCM token:", error);
      }
    };

    fetchFirebaseToken();

    // Listen for foreground push notifications
    const listenForMessages = () => {
      if (isListeningRef.current) return;
      isListeningRef.current = true;

      onMessageListener()
        .then((payload) => {
          isListeningRef.current = false;
          console.log("Foreground Message Received:", payload);

          const data = payload?.data || {};

          // 📞 Handle incoming video/audio call
          if (data.type === "incoming_call") {
            const rawType = (data.callType || "").toLowerCase().trim();
            const mappedCallType = rawType === "voice" ? "audio" : (rawType || "video");
            
            dispatch(
              setIncomingCall({
                callId: data.callId,
                channelName: data.channelName,
                callType: mappedCallType,
                userId: data.userId,
                userName: data.userName || "User",
                userImage: data.userImage || null,
                userPhone: data.userPhone || null,
              })
            );
          } else if (data.type === "call_ended" || data.type === "call_rejected") {
            // Dismiss the overlay if call ended or was rejected by user
            dispatch(clearIncomingCall());
            const { title, body } = payload.notification || {};
            if (title || body) {
              toast(`${title || ""} ${body ? `- ${body}` : ""}`.trim(), { icon: "📞" });
            }
          } else {
            // Regular notification toast
            const { title, body } = payload.notification || {};
            if (title || body) {
              toast(`${title || ""} ${body ? `- ${body}` : ""}`.trim());
            }
          }

          // Re-register listener for next message
          listenForMessages();
        })
        .catch((err) => {
          isListeningRef.current = false;
          console.error("onMessageListener error:", err);
          setTimeout(listenForMessages, 5000); // Retry after delay
        });
    };

    listenForMessages();

    // ────────────────────────────────────────────────────────────
    // Listen for messages from the service worker (background FCM)
    // When the tab was in background and a call came in via FCM,
    // the service worker forwards the call data via postMessage.
    // ────────────────────────────────────────────────────────────
    const handleServiceWorkerMessage = (event) => {
      const { type, data } = event.data || {};

      if (type === "BACKGROUND_INCOMING_CALL" && data) {
        console.log("[FCMHandler] Received background incoming call from SW:", data);

        // Guard: ignore if the call is already being handled or completed
        const currentState = store.getState();
        const callStatus = currentState.call?.status;
        const activeCall = currentState.call?.activeCall;
        const existingIncoming = currentState.call?.incomingCall;

        // If we're already in a call (connecting/connected), ignore stale notification
        if (callStatus === "connecting" || callStatus === "connected") {
          console.log("[FCMHandler] Ignoring stale SW message — call already in progress, status:", callStatus);
          return;
        }

        // If there's an active call on the same channel, ignore
        if (activeCall?.channelName && activeCall.channelName === data.channelName) {
          console.log("[FCMHandler] Ignoring SW message — same channel already active:", data.channelName);
          return;
        }

        // If we already handled this exact channel (incoming exists and was dealt with)
        if (existingIncoming?.channelName === data.channelName && callStatus === "idle") {
          // It's possible the overlay was dismissed but the notification is stale
          // Only re-show if we're truly idle with no prior handling
          console.log("[FCMHandler] Same channelName already processed, might be stale. Checking...");
        }

        const rawType = (data.callType || "").toLowerCase().trim();
        const mappedCallType = rawType === "voice" ? "audio" : (rawType || "video");

        dispatch(
          setIncomingCall({
            callId: data.callId,
            channelName: data.channelName,
            callType: mappedCallType,
            userId: data.userId,
            userName: data.userName || "User",
            userImage: data.userImage || null,
            userPhone: data.userPhone || null,
          })
        );
      } else if (type === "BACKGROUND_CALL_DISMISSED") {
        console.log("[FCMHandler] Call dismissed from SW:", data);
        dispatch(clearIncomingCall());
      }
    };

    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", handleServiceWorkerMessage);
    }

    // ────────────────────────────────────────────────────────────
    // Visibility change handler:
    // When the user switches back to this tab, re-check if there
    // is a pending incoming call that was missed.
    // ────────────────────────────────────────────────────────────
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("[FCMHandler] Tab became visible, checking for pending calls...");

        // Check current Redux state — if there IS an incoming call already, 
        // force a re-render by re-dispatching (ensures the overlay shows)
        const currentState = store.getState();
        const currentIncoming = currentState.call?.incomingCall;
        if (currentIncoming) {
          console.log("[FCMHandler] Found pending incoming call in Redux, re-dispatching to ensure overlay shows");
          dispatch(setIncomingCall({ ...currentIncoming }));
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener("message", handleServiceWorkerMessage);
      }
    };
  }, [dispatch]);

  return null;
}

export default function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
      <FCMHandler />
      {children}
    </Provider>
  );
}
