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
import { getBackendImageUrl } from "@/lib/getBackendImageUrl";
import axios from "axios";
import Image from "next/image";
import { User, Mic, MicOff, PhoneOff } from "lucide-react";

const AGORA_BASE_URL = process.env.NEXT_PUBLIC_AGORA_BASE_URL ;

export default function AudioCallScreen() {
  const params = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const channelName = params.get("channelName");
  const userNameParam = params.get("userName");
  const userImageParam = params.get("userImage");

  const profileState = useSelector((state) => state.dashboard.profile);
  const profile = profileState?.data;
  const incomingCall = useSelector((state) => state.call.incomingCall);

  const tracksRef = useRef([]);
  const clientRef = useRef(null);
  const joinedRef = useRef(false);
  const endingRef = useRef(false);

  const [callStatus, setCallStatus] = useState("connecting");
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

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
  //     const url = `${BASE_URL}/api/astrologer/end-call`;
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

          if (mediaType === "audio") {
            user.audioTrack.play();
          }
        });

        client.on("user-left", (user) => {
          // console.log("Remote user left:", user.uid);
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

        // 4. Create and Publish Audio Track
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();

        if (cancelled) {
          audioTrack.close();
          await client.leave();
          joinedRef.current = false;
          return;
        }

        tracksRef.current = [audioTrack];
        await client.publish([audioTrack]);
        setCallStatus("active");

      } catch (err) {
        if (cancelled) return;
        console.error(err);
        toast.error("Failed to connect to audio call");
        router.push("/");
      }
    };

    startCall();

    // Call Status Check Interval
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

  // Timer logic
  useEffect(() => {
    let timer;
    if (callStatus === "active") {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callStatus]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const userImageUrl = userImageParam ? getBackendImageUrl(userImageParam) : null;
  const displayName = userNameParam || "User";

  return (
    <div className="relative h-full w-full bg-[#0f172a] overflow-hidden flex flex-col items-center justify-between py-20">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500 blur-[120px]" />
      </div>

      {/* Connection Status Overlay */}
      {callStatus === "connecting" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg font-medium">Connecting to call...</p>
          </div>
        </div>
      )}

      {/* User Info & Avatar */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="relative">
          {callStatus === "active" && (
            <div className="absolute -inset-8 flex items-center justify-center">
              <div className="h-full w-full animate-ping rounded-full bg-blue-500/20" />
            </div>
          )}
          <div className="relative h-48 w-48 overflow-hidden rounded-full border-4 border-white/10 shadow-2xl bg-gray-800">
            {userImageUrl ? (
              <Image src={userImageUrl} alt="User" fill className="object-cover" unoptimized />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <User size={80} className="text-white/20" />
              </div>
            )}
          </div>
        </div>
        
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white tracking-tight">{displayName}</h2>
          <p className="mt-3 text-blue-400 font-medium tracking-widest uppercase text-xs">
            {callStatus === "active" ? "Ongoing Audio Call" : "Voice Call"}
          </p>
        </div>
      </div>

      {/* Timer & Waveform */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {callStatus === "active" && (
          <>
            <div className="text-6xl font-mono font-light tracking-tighter text-white/90">
              {formatDuration(callDuration)}
            </div>
            <div className="flex items-center gap-1.5 h-16">
              {[...Array(16)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-1.5 bg-blue-500 rounded-full animate-wave" 
                  style={{ 
                    height: `${25 + Math.random() * 75}%`,
                    animationDelay: `${i * 0.08}s`
                  }} 
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Controls */}
      <div className="relative z-40 flex justify-center items-center gap-10">
        <button
          onClick={toggleMute}
          className={`flex h-16 w-16 items-center justify-center rounded-full shadow-xl transition-all hover:scale-110 active:scale-95 ${
            isMuted ? "bg-white/10 text-white border border-white/20" : "bg-white text-gray-900"
          }`}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
        </button>

        <button
          onClick={handleEndCall}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500 text-white shadow-2xl transition-all hover:scale-110 hover:bg-red-600 active:scale-95"
          title="End Call"
        >
          <PhoneOff size={32} />
        </button>
      </div>

      <style jsx>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(0.5); }
          50% { transform: scaleY(1.5); }
        }
        .animate-wave {
          animation: wave 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
