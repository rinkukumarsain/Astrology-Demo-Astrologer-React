"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { postAPIAuth, getAPIAuth } from "@/lib/apiServices";
import { fetchDashboardProfile, fetchDashboardAnalytics, fetchDailyStats } from "@/redux/slices/dashboardSlice";
import { BASE_URL } from "@/constants/apiConstants";
import { getCookie } from "@/lib/clientHelpers";
import { AUTH_TOKEN_KEY } from "@/constants/others";
import axios from "axios";

const AGORA_BASE_URL = process.env.NEXT_PUBLIC_AGORA_BASE_URL;

export default function VideoCallScreen() {
  const params = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const channelName = params.get("channelName");

  const profileState = useSelector((state) => state.dashboard.profile);
  const profile = profileState?.data;

  const localRef = useRef();
  const remoteRef = useRef();
  const tracksRef = useRef([]);
  const clientRef = useRef(null);
  const joinedRef = useRef(false);
  const endingRef = useRef(false);

  const [callStatus, setCallStatus] = useState("connecting");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  // Fetch profile if not loaded (handles page reload)
  useEffect(() => {
    if (!profileState?.loaded && !profileState?.loading) {
      dispatch(fetchDashboardProfile());
    }
  }, [dispatch, profileState?.loaded, profileState?.loading]);

  // End call on page reload / close
  useEffect(() => {
    if (!channelName) return;

    const handleBeforeUnload = () => {
      const token = getCookie(AUTH_TOKEN_KEY);
      const url = `${BASE_URL}/api/astrologer/end-call`;
      const body = JSON.stringify({ channelName, duration: 0, endedBy: "astro" });

      // sendBeacon is reliable during page unload
      navigator.sendBeacon(
        url,
        new Blob([body], { type: "application/json" })
      );
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [channelName]);

  // Prevent back navigation
  useEffect(() => {
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
      toast.error("Please end the call before leaving");
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const leaveCall = useCallback(async () => {
    tracksRef.current.forEach((t) => {
      try { t.stop(); } catch {}
      try { t.close(); } catch {}
    });
    tracksRef.current = [];

    if (clientRef.current && joinedRef.current) {
      try {
        await clientRef.current.leave();
      } catch {}
      joinedRef.current = false;
    }
  }, []);

  const handleEndCall = useCallback(async () => {
    if (endingRef.current) return;
    endingRef.current = true;

    try {
      await postAPIAuth("/api/astrologer/end-call", {
        channelName,
        duration: 0,
        endedBy: "astro",
      });
    } catch (err) {
      console.error("End call API failed", err);
    }

    await leaveCall();
    
    // Refresh dashboard data
    const now = new Date();
    dispatch(fetchDashboardProfile());
    dispatch(fetchDailyStats());
    dispatch(fetchDashboardAnalytics({ month: now.getMonth() + 1, year: now.getFullYear() }));

    router.replace("/");
  }, [channelName, leaveCall, router, dispatch]);

  // Toggle microphone
  const toggleMute = useCallback(() => {
    const audioTrack = tracksRef.current[0];
    if (audioTrack) {
      audioTrack.setEnabled(isMuted);
      setIsMuted((prev) => !prev);
    }
  }, [isMuted]);

  // Toggle camera
  const toggleVideo = useCallback(() => {
    const videoTrack = tracksRef.current[1];
    if (videoTrack) {
      videoTrack.setEnabled(isVideoOff);
      setIsVideoOff((prev) => !prev);
    }
  }, [isVideoOff]);

  // Start call only when profile is loaded
  useEffect(() => {
    if (!channelName) {
      toast.error("Channel name missing");
      router.push("/");
      return;
    }

    // Wait for profile to load
    if (!profile?._id && !profile?.id) {
      return;
    }

    let cancelled = false;

    const startCall = async () => {
      try {
        const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;

        if (cancelled) return;

        const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        clientRef.current = client;

        const astrologerId = profile._id || profile.id;

        // 1. Get Token
        const res = await axios.post(`${AGORA_BASE_URL}/rtc-token`, {
          channelName,
          role: "subscriber",
          astrologerId,
          expireTime: 3600,
        });

        if (cancelled) return;

        console.log("RTC Token Response:", res.data);
        const tokenData = res.data?.data || res.data;
        const token = tokenData?.token;
        const uid = tokenData?.uid || null;

        if (!token) {
          toast.error("Failed to get call token");
          router.push("/");
          return;
        }

        // 2. Register remote user handlers BEFORE joining
        client.on("user-published", async (user, mediaType) => {
          console.log("Remote user published:", user.uid, mediaType);
          await client.subscribe(user, mediaType);

          if (mediaType === "video") {
            user.videoTrack.play(remoteRef.current, { fit: "contain" });
          }
          if (mediaType === "audio") {
            user.audioTrack.play();
          }
        });

        client.on("user-left", (user) => {
          console.log("Remote user left:", user.uid);
          toast("User left the call", { icon: "👋" });
          handleEndCall();
        });

        // 3. Join Channel
        await client.join(
          process.env.NEXT_PUBLIC_AGORA_APP_ID,
          channelName,
          token,
          uid
        );

        if (cancelled) {
          await client.leave();
          return;
        }

        joinedRef.current = true;

        // 4. Create and Publish Tracks
        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();

        if (cancelled) {
          audioTrack.close();
          videoTrack.close();
          await client.leave();
          joinedRef.current = false;
          return;
        }

        tracksRef.current = [audioTrack, videoTrack];

        videoTrack.play(localRef.current, { fit: "cover" });
        await client.publish([audioTrack, videoTrack]);
        setCallStatus("active");

      } catch (err) {
        if (cancelled) return;
        console.error(err);
        toast.error("Failed to connect to video call");
        router.push("/");
      }
    };

    startCall();

    // Call Status Check Interval — handle both "ended" and "completed"
    const statusInterval = setInterval(async () => {
      try {
        const res = await getAPIAuth(`/api/astrologer/call-status/${channelName}`);
        const status = res.data?.data?.status || res.data?.status;
        if (status === "ended" || status === "completed") {
          toast("Call ended", { icon: "📞" });
          handleEndCall();
        }
      } catch (err) {
        console.error("Status check failed", err);
      }
    }, 5000);

    return () => {
      cancelled = true;
      clearInterval(statusInterval);
      leaveCall();
    };
  }, [channelName, profile]);

  return (
    <div className="relative h-full w-full bg-black overflow-hidden">
      {/* Remote Video (Full Screen) */}
      <div
        ref={remoteRef}
        className="absolute inset-0 bg-gray-900"
      />

      {/* Local Preview (Small Overlay) */}
      <div
        ref={localRef}
        className="absolute top-6 right-6 w-32 h-44 rounded-xl border-2 border-white/20 bg-black overflow-hidden shadow-2xl z-20"
      />

      {/* Connection Status Overlay */}
      {callStatus === "connecting" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-30">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg font-medium">Connecting to call...</p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-10 left-0 right-0 flex justify-center items-center gap-4 z-40">
        {/* Toggle Mic */}
        <button
          onClick={toggleMute}
          className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95 ${
            isMuted ? "bg-white/20 text-white" : "bg-white text-gray-900"
          }`}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
              <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .76-.13 1.48-.35 2.17" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          )}
        </button>

        {/* End Call */}
        <button
          onClick={handleEndCall}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
          title="End Call"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
            <line x1="23" y1="1" x2="1" y2="23" />
          </svg>
        </button>

        {/* Toggle Camera */}
        <button
          onClick={toggleVideo}
          className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95 ${
            isVideoOff ? "bg-white/20 text-white" : "bg-white text-gray-900"
          }`}
          title={isVideoOff ? "Turn on camera" : "Turn off camera"}
        >
          {isVideoOff ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16.16 3.84A1 1 0 0 0 15 4v4.37l-4.37-4.37A1 1 0 0 0 9 5v6.37L2.63 5A1 1 0 0 0 1 5.63V18a2 2 0 0 0 2 2h15.37" />
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M22.95 15.65a1 1 0 0 0 .05-.32V8.67a1 1 0 0 0-1.55-.83L17 11v2" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
