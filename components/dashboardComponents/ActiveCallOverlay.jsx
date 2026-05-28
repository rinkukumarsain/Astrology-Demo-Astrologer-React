"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { Mic, MicOff, PhoneOff, User, Timer } from "lucide-react";
import { getBackendImageUrl } from "@/lib/getBackendImageUrl";
import { endCall, clearCallState } from "@/redux/slices/callSlice";
import { agoraService } from "@/lib/agoraService";
import toast from "react-hot-toast";

const ActiveCallOverlay = () => {
  const dispatch = useDispatch();
  const { activeCall, callStatus } = useSelector((state) => state.call);
  
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [remoteUserJoined, setRemoteUserJoined] = useState(false);

  useEffect(() => {
    let interval;
    if (callStatus === "connected") {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  useEffect(() => {
    // Listen for remote user join status
    const unsub = agoraService.subscribe((remoteUsers) => {
      const hasRemote = Object.keys(remoteUsers).length > 0;
      setRemoteUserJoined(hasRemote);
    });
    return unsub;
  }, []);

  if (callStatus !== "connected" || !activeCall) return null;

  const handleEndCall = async () => {
    try {
      const { channelName } = activeCall;
      
      // 1. Leave Agora
      await agoraService.leave();
      
      // 2. Notify backend
      await dispatch(endCall({
        channelName,
        duration: seconds,
        endedBy: "astrologer"
      })).unwrap();
      
      // 3. Clear state
      dispatch(clearCallState());
      toast("Call ended", { icon: "🏁" });
      setSeconds(0);
    } catch (error) {
      console.error("Failed to end call:", error);
      dispatch(clearCallState());
    }
  };

  const toggleMute = async () => {
    const nextMute = !isMuted;
    const result = await agoraService.toggleMic(!nextMute);
    setIsMuted(!result);
  };

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const imageUrl = getBackendImageUrl(activeCall.userDetails?.image);

  return (
    <div className="fixed inset-0 z-[110] flex flex-col items-center justify-center bg-[#0F172A] text-white overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-primary blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-primary blur-[120px]"></div>
      </div>

      {/* User Info */}
      <div className="relative z-10 mb-12 flex flex-col items-center text-center">
        <div className="relative mb-6 h-32 w-32">
          {remoteUserJoined && (
             <div className="absolute inset-[-10px] animate-pulse rounded-full border-2 border-green-500/30"></div>
          )}
          <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-white/10 bg-white/5 shadow-2xl">
            {imageUrl ? (
              <Image src={imageUrl} alt={activeCall.userDetails?.name} fill className="object-cover" unoptimized />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-white/5">
                <User size={60} className="text-white/20" />
              </div>
            )}
          </div>
        </div>
        
        <h2 className="text-3xl font-bold tracking-tight">{activeCall.userDetails?.name || "User"}</h2>
        <div className="mt-2 flex items-center gap-2 text-sm font-medium text-white/60">
          {remoteUserJoined ? (
            <span className="flex items-center gap-1.5 text-green-400">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              On Call
            </span>
          ) : (
            <span className="animate-pulse">Connecting...</span>
          )}
        </div>
      </div>

      {/* Timer */}
      <div className="relative z-10 mb-16 flex flex-col items-center">
        <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-6 py-3 backdrop-blur-md border border-white/10 shadow-xl">
          <Timer size={20} className="text-primary" />
          <span className="text-3xl font-mono font-medium tracking-wider">{formatTime(seconds)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="relative z-10 flex items-center justify-center gap-8">
        <button
          onClick={toggleMute}
          className={`group flex h-16 w-16 items-center justify-center rounded-full transition-all border ${
            isMuted 
              ? "bg-red-500/20 border-red-500/50 text-red-500 hover:bg-red-500/30" 
              : "bg-white/5 border-white/10 text-white hover:bg-white/10"
          }`}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
        </button>

        <button
          onClick={handleEndCall}
          className="group flex h-20 w-20 items-center justify-center rounded-full bg-red-600 text-white transition-all hover:bg-red-700 hover:scale-105 shadow-2xl shadow-red-900/50"
          title="End Call"
        >
          <PhoneOff size={32} className="rotate-[135deg]" />
        </button>

        {/* Placeholder for more controls like speaker/volume if needed */}
        <div className="w-16 h-16 flex items-center justify-center opacity-40">
           <div className="w-2 h-2 rounded-full bg-white mx-0.5"></div>
           <div className="w-2 h-2 rounded-full bg-white mx-0.5"></div>
           <div className="w-2 h-2 rounded-full bg-white mx-0.5"></div>
        </div>
      </div>

      {/* Wave animation if on call */}
      {remoteUserJoined && (
        <div className="absolute bottom-0 left-0 right-0 h-32 opacity-20 pointer-events-none">
            <div className="flex items-end justify-center gap-1 h-full pb-8">
                {[...Array(20)].map((_, i) => (
                    <div 
                        key={i} 
                        className="w-1 bg-primary rounded-full animate-wave" 
                        style={{ 
                            height: `${Math.random() * 60 + 20}%`,
                            animationDelay: `${i * 0.1}s`
                        }}
                    ></div>
                ))}
            </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.5); }
        }
        .animate-wave {
          animation: wave 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ActiveCallOverlay;
