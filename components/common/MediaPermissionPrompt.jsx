"use client";

export default function MediaPermissionPrompt({ isOpen, onClose, type = "camera/mic" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity duration-300">
      <div className="w-full max-w-md bg-white rounded-[1rem] shadow-2xl overflow-hidden transform transition-all duration-300">
        <div className="p-8 text-center relative">
          
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-50 shadow-inner">
            <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-[#E66344] shadow-lg shadow-[#E66344]/30">
              {type === "mic" ? (
                <svg className="h-9 w-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              ) : (
                <svg className="h-9 w-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </div>
          </div>
          
          <h2 className="mb-3 text-2xl font-bold text-slate-800 tracking-tight">
            {type === "mic" ? "Microphone Blocked" : "Camera & Mic Blocked"}
          </h2>
          <p className="mb-8 text-[15px] text-slate-500 leading-relaxed font-medium">
            {type === "mic" 
              ? "You have blocked microphone access. Please click the lock icon in your browser address bar, allow microphone access, and refresh the page to continue." 
              : "You have blocked camera and microphone access. Please click the lock icon in your browser address bar, allow access, and refresh the page to continue."}
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full rounded-2xl bg-[#E66344] px-6 py-4 text-[15px] font-bold text-white shadow-lg shadow-[#E66344]/25 hover:shadow-[#E66344]/40 hover:-translate-y-0.5 transition-all active:scale-[0.98]"
            >
              Refresh Page
            </button>
            {/* <button
              onClick={onClose}
              className="w-full rounded-2xl bg-slate-50 px-6 py-4 text-[15px] font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors active:scale-[0.98]"
            >
              Close
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
}
