"use client";

import { useSelector, useDispatch } from "react-redux";
import { clearIncomingCall, acceptCall, rejectCall } from "@/redux/slices/callSlice";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import Image from "next/image";

/**
 * Tell the service worker to dismiss the "incoming-call" notification
 * and mark the channel as handled so stale clicks are ignored.
 */
function dismissCallNotification(channelName) {
  if (typeof navigator !== "undefined" && "serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: "DISMISS_CALL_NOTIFICATION",
      channelName,
    });
  }
}

export default function IncomingCallOverlay() {
  const dispatch = useDispatch();
  const router = useRouter();
  const incomingCall = useSelector((state) => state.call.incomingCall);
  const loading = useSelector((state) => state.call.loading);
  const audioRef = useRef(null);

  useEffect(() => {
    if (incomingCall) {
      // Play audio when incoming call appears
      if (!audioRef.current) {
        audioRef.current = new Audio("/assets/audio/soft_ringtone.mp3");
        audioRef.current.loop = true;
      }
      
      const playAudio = async () => {
        try {
          await audioRef.current.play();
        } catch (err) {
          console.error("[CallOverlay] Audio play failed:", err);
        }
      };
      
      playAudio();
    } else {
      // Stop audio when incoming call is cleared
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }

    return () => {
      // Clean up on unmount
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [incomingCall]);

  if (!incomingCall) return null;

  const { channelName, userName, userImage, callType } = incomingCall;

  const handleAccept = async () => {
    const type = (callType || "").toLowerCase().trim();
    console.log("[CallOverlay] Accepting call with type:", type);
    
    // Dismiss the Windows notification immediately
    dismissCallNotification(channelName);

    try {
      await dispatch(acceptCall({ channelName })).unwrap();
      
      // Determine target route based on call type
      const isAudio = type === "audio" || type === "voice" || type === "voice_call";
      const targetRoute = isAudio ? "/audio-call" : "/video-call";
      
      console.log("[CallOverlay] Redirecting to:", targetRoute);
      
      // IMPORTANT: Clear the incoming call state so the overlay disappears
      dispatch(clearIncomingCall());
      
      // Pass user info in query params to persist across page refreshes
      const queryParams = new URLSearchParams({
        channelName,
        userName: userName || "",
        userImage: userImage || ""
      }).toString();
      
      router.push(`${targetRoute}?${queryParams}`);
    } catch (err) {
      console.error("Accept call failed:", err);
      toast.error(err || "Failed to accept call");
    }
  };

  const handleReject = async () => {
    // Dismiss the Windows notification immediately
    dismissCallNotification(channelName);

    try {
      await dispatch(rejectCall({ channelName })).unwrap();
      toast("Call rejected", { icon: "📞" });
      // Clear the incoming call state so the overlay disappears
      dispatch(clearIncomingCall());
    } catch (err) {
      console.error("Reject call failed:", err);
      toast.error(err || "Failed to reject call");
    }
  };

  const isAudioType = (callType || "").toLowerCase().trim() === "audio" || 
                     (callType || "").toLowerCase().trim() === "voice" ||
                     (callType || "").toLowerCase().trim() === "voice_call";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
        {/* Caller Info */}
        <div className="flex flex-col items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-green-400/30" />
            <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-green-400 bg-gray-200">
              {userImage ? (
                <Image
                  src={userImage}
                  alt={userName}
                  width={96}
                  height={96}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-3xl font-bold text-gray-500">
                  {userName?.charAt(0)?.toUpperCase() || "?"}
                </span>
              )}
            </div>
          </div>

          {/* Name & Type */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900">{userName}</h3>
            <p className="mt-1 text-sm text-gray-500">
              Incoming {isAudioType ? "Audio" : "Video"} Call...
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8 flex items-center justify-center gap-8">
          {/* Reject */}
          <button
            onClick={handleReject}
            disabled={loading}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            title="Reject Call"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
              <line x1="23" y1="1" x2="1" y2="23" />
            </svg>
          </button>

          {/* Accept */}
          <button
            onClick={handleAccept}
            disabled={loading}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            title="Accept Call"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
