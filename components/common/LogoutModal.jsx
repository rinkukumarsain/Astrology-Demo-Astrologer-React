import React, { useEffect } from "react";

export default function LogoutModal({ isOpen, onClose, onConfirm }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleEsc = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
       <div className="relative flex w-full max-w-[380px] flex-col items-center rounded-3xl bg-white p-8 shadow-2xl">
         {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-black hover:bg-neutral-100 transition-colors"
            aria-label="Close"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          {/* Icon */}
          <div className="mt-8 mb-5">
             <img src="/assets/img/logout.png" alt="Logout Icon" className="h-[130px] w-auto object-contain" />
          </div>

          <h2 className="mb-8 text-center text-[17px] font-semibold text-black px-4 leading-snug">
            Are you sure, You want to<br/>logout?
          </h2>

          <div className="flex w-full items-center gap-4">
             <button
               onClick={onClose}
               className="flex-1 cursor-pointer rounded-full border-[2.5px] border-[#e85b3f] bg-white py-3 text-[15px] font-semibold text-[#e85b3f] transition-colors hover:bg-orange-50"
             >
               No
             </button>
             <button
               onClick={onConfirm}
               className="flex-1 cursor-pointer rounded-full bg-[#e85b3f] border-[2.5px] border-[#e85b3f] py-3 text-[15px] font-semibold text-white shadow-md transition-opacity hover:opacity-90"
             >
               Yes
             </button>
          </div>
       </div>
    </div>
  );
}
