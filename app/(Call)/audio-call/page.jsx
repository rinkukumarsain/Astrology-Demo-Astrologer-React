"use client";

import AudioCallScreen from "@/components/dashboardComponents/AudioCallScreen";
import { Suspense } from "react";

export default function AudioCallPage() {
  return (
    <Suspense fallback={<div className="h-full w-full bg-[#1a1a2e]" />}>
      <AudioCallScreen />
    </Suspense>
  );
}
