"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { Phone, PhoneOff, User } from "lucide-react";
import { getBackendImageUrl } from "@/lib/getBackendImageUrl";
import { acceptCall, rejectCall, setActiveCall, fetchRtcToken } from "@/redux/slices/callSlice";
import { agoraService } from "@/lib/agoraService";
import toast from "react-hot-toast";

const IncomingCallModal = () => {
  const dispatch = useDispatch();
  const incomingCall = useSelector((state) => state.call.incomingCall);
  const callStatus = useSelector((state) => state.call.callStatus);
  
  if (callStatus !== "ringing" || !incomingCall) return null;

  const handleAccept = async () => {
    try {
      const { channelName, astrologerId, userName, userImage } = incomingCall;
      await dispatch(acceptCall({ channelName })).unwrap();
      const tokenData = await dispatch(fetchRtcToken({ channelName, astrologerId })).unwrap();
      
      if (tokenData?.token) {
        await agoraService.join({
          appId: process.env.NEXT_PUBLIC_AGORA_APP_ID,
          channel: channelName,
          token: tokenData.token,
          uid: tokenData.uid,
        });
        await agoraService.publish({ audio: true, video: false });
        dispatch(setActiveCall({
          channelName,
          token: tokenData.token,
          uid: tokenData.uid,
          userDetails: { name: userName, image: userImage }
        }));
        toast.success("Call connected");
      }
    } catch (error) {
      console.error("Failed to accept call:", error);
      toast.error("Could not connect the call.");
    }
  };

  const handleReject = async () => {
    try {
      await dispatch(rejectCall({ channelName: incomingCall.channelName })).unwrap();
      toast("Call rejected", { icon: "📵" });
    } catch (error) {
      console.error("Failed to reject call:", error);
    }
  };

  const imageUrl = getBackendImageUrl(incomingCall.userImage);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl text-center">
        <div className="relative mx-auto mb-6 h-24 w-24">
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/20"></div>
          <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-primary/10 bg-gray-100">
            {imageUrl ? (
              <Image src={imageUrl} alt={incomingCall.userName} fill className="object-cover" unoptimized />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary/5 text-primary">
                <User size={40} />
              </div>
            )}
          </div>
        </div>
        <h3 className="mb-1 text-2xl font-bold text-gray-900">{incomingCall.userName || "User"}</h3>
        <p className="mb-8 text-sm font-medium text-gray-500 animate-pulse">Incoming Audio Call...</p>
        <div className="flex items-center justify-center gap-8">
          <button onClick={handleReject} className="group flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-lg">
            <PhoneOff size={28} />
          </button>
          <button onClick={handleAccept} className="group flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 hover:bg-green-600 hover:text-white transition-all shadow-lg">
            <Phone size={28} className="animate-bounce" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
