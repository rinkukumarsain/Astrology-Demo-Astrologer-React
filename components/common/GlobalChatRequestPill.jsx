"use client";

import { useSelector } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";

export default function GlobalChatRequestPill() {
  const pathname = usePathname();
  const router = useRouter();
  
  const incomingRequests = useSelector((state) => state.chat.incomingRequests);
  const activeChat = useSelector((state) => state.chat.activeChat);
  const hasRequests = incomingRequests && incomingRequests.length > 0;

  // Do not show if on the dashboard (since dashboard already has the incoming requests view)
  // Also do not show if they are actively in a chat
  if (pathname === "/" || !hasRequests || activeChat?.isActive) {
    return null;
  }

  const handleGoToDashboard = () => {
    router.push("/");
  };

  return (
    <div className="fixed top-[4.5rem] md:top-20 right-4 md:right-8 z-[60] animate-in slide-in-from-right-8 fade-in duration-300">
      <button 
        onClick={handleGoToDashboard}
        className="flex items-center gap-3 bg-white border border-[#E66344]/30 shadow-[0_8px_20px_rgba(230,99,68,0.15)] rounded-full px-4 py-2.5 hover:shadow-[0_8px_25px_rgba(230,99,68,0.25)] hover:-translate-y-0.5 transition-all group cursor-pointer"
      >
        <div className="relative flex items-center justify-center h-8 w-8 rounded-full bg-[#FFF5F2] text-[#E66344]">
          <MessageCircle size={18} strokeWidth={2.5} />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#E66344] text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
            {incomingRequests.length > 9 ? '9+' : incomingRequests.length}
          </span>
          <span className="absolute inline-flex h-full w-full rounded-full bg-[#E66344] opacity-20 animate-ping"></span>
        </div>
        
        <div className="text-left pr-2">
          <p className="text-[13px] font-bold text-[#222] leading-tight">New Chat Request!</p>
          <p className="text-[11px] font-medium text-[#E66344] group-hover:underline decoration-[#E66344]/40 underline-offset-2">View on Dashboard &rarr;</p>
        </div>
      </button>
    </div>
  );
}
