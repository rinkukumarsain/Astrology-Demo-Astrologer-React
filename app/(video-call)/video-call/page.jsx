"use client";

import VideoCallScreen from "@/components/dashboardComponents/VideoCallScreen";
import { Suspense } from "react";

export default function VideoCallPage() {
  return (
    <Suspense fallback={<div className="h-full w-full bg-[#1a1a2e]" />}>
      <VideoCallScreen />
    </Suspense>
  );
}