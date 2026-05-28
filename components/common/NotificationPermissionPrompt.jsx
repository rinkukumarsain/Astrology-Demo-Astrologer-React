"use client";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

export default function NotificationPermissionPrompt({ mandatory = false }) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isDenied, setIsDenied] = useState(false);

  useEffect(() => {
    // Only run in browser and if Notification API is supported
    if (typeof window !== "undefined" && "Notification" in window) {
      if (mandatory) {
        if (Notification.permission !== "granted") {
          setIsDenied(Notification.permission === "denied");
          setShowPrompt(true);
          
          // Attempt to open the native prompt automatically
          if (Notification.permission === "default") {
            Notification.requestPermission().then((permission) => {
              if (permission === "granted") {
                toast.success("Notifications enabled successfully!");
                setShowPrompt(false);
              } else if (permission === "denied") {
                setIsDenied(true);
              }
            }).catch(console.error);
          }
        }
      } else {
        const hasSeenPrompt = sessionStorage.getItem("notificationPromptSeen");
        
        // If default (not asked yet) and hasn't dismissed in this session
        if (Notification.permission === "default" && !hasSeenPrompt) {
          // Show after a slight delay for better UX
          const timer = setTimeout(() => setShowPrompt(true), 2000);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [mandatory]);

  const handleEnable = async () => {
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === "granted") {
        toast.success("Notifications enabled successfully!");
        setShowPrompt(false);
      } else if (permission === "denied") {
        toast.error("Notifications denied. Please enable them in your browser settings.");
        if (mandatory) {
          setIsDenied(true);
        } else {
          sessionStorage.setItem("notificationPromptSeen", "true");
          setShowPrompt(false);
        }
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }
  };

  const handleClose = () => {
    if (mandatory) return;
    sessionStorage.setItem("notificationPromptSeen", "true");
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity duration-300">
      <div className="w-full max-w-md bg-white rounded-[1rem] shadow-2xl overflow-hidden transform transition-all duration-300">
        <div className="p-8 text-center relative">
          
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-orange-50 shadow-inner">
            <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-[#E66344] shadow-lg shadow-[#E66344]/30">
              <svg className="h-9 w-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
          </div>
          
          <h2 className="mb-3 text-2xl font-bold text-slate-800 tracking-tight">
            {isDenied ? "Notifications Blocked" : "Turn on Notifications"}
          </h2>
          <p className="mb-8 text-[15px] text-slate-500 leading-relaxed font-medium">
            {isDenied 
              ? "You have blocked notifications. Please enable them in your browser settings and refresh the page to continue." 
              : "Turn notification on for seamless and better chats experience and audio/video calls."}
          </p>

          <div className="flex flex-col gap-3">
            {isDenied ? (
              <button
                onClick={() => window.location.reload()}
                className="w-full rounded-2xl bg-[#E66344] px-6 py-4 text-[15px] font-bold text-white shadow-lg shadow-[#E66344]/25 hover:shadow-[#E66344]/40 hover:-translate-y-0.5 transition-all active:scale-[0.98]"
              >
                Refresh Page
              </button>
            ) : (
              <button
                onClick={handleEnable}
                className="w-full rounded-2xl bg-[#E66344] px-6 py-4 text-[15px] font-bold text-white shadow-lg shadow-[#E66344]/25 hover:shadow-[#E66344]/40 hover:-translate-y-0.5 transition-all active:scale-[0.98]"
              >
                Allow Notifications
              </button>
            )}
            
            {!mandatory && (
              <button
                onClick={handleClose}
                className="w-full rounded-2xl bg-slate-50 px-6 py-4 text-[15px] font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors active:scale-[0.98]"
              >
                Maybe Later
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
