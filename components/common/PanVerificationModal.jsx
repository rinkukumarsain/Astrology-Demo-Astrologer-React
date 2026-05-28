"use client";

import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { postAPIAuth } from "@/lib/apiServices";
import { API_ENDPOINTS } from "@/constants/apiConstants";
import { fetchDashboardProfile } from "@/redux/slices/dashboardSlice";

export default function PanVerificationModal({ isOpen, onClose, onSuccess }) {
  const [panNumber, setPanNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  // Resetting state when closed
  useEffect(() => {
    if (!isOpen) {
      setPanNumber("");
      setFullName("");
      setDob("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleContinue = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!panNumber || !fullName || !dob) {
        toast.error("Please fill all fields");
        return;
    }
    
    const formattedDob = dob.split("-").reverse().join("/");
    
    setLoading(true);
    try {
      const response = await postAPIAuth(API_ENDPOINTS.VERIFY_PAN, { 
        panNumber: panNumber,
        name: fullName, 
        dob: formattedDob
      });
      
      if(response?.data?.status){
        toast.success(response?.data?.message || "PAN verified successfully!");
        await dispatch(fetchDashboardProfile());
        if (onSuccess) {
           onSuccess();
        } else if (onClose) {
           onClose();
        }
      } else {
        toast.error(response?.data?.message || "PAN verification failed");
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.response?.data?.error || error?.message || "Failed to verify PAN";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="relative flex w-full max-w-[480px] min-h-[600px] flex-col rounded-[24px] bg-[#FFFBF8] p-6 shadow-xl md:p-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="inline-flex cursor-pointer items-center justify-center p-1 text-[#1A1A1A] hover:bg-neutral-100 rounded-full" 
            aria-label="Go back">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-xl font-semibold text-[#1A1A1A]">Identity Verification</h2>
        </div>

        {/* Form Body */}
        <div className="flex-1 space-y-6">
          <div>
            <div className="mb-2 text-[#333333] font-medium">Pan Card Verification</div>
            <input
              type="text"
              className="w-full rounded-xl border border-[#D1D1D1] bg-white px-4 py-3.5 text-base text-[#333333] placeholder-[#A0A0A0] outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="Enter Pan card number"
              value={panNumber}
              onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
              maxLength={10}
            />
          </div>

          <div>
            <div className="mb-2 text-[#333333] font-medium">Enter name</div>
            <input
              type="text"
              className="w-full rounded-xl border border-[#D1D1D1] bg-white px-4 py-3.5 text-base text-[#333333] placeholder-[#A0A0A0] outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="Enter name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div>
            <div className="mb-2 text-[#333333] font-medium">Date of Birth</div>
            <div className="relative">
                <input
                    type="date"
                    className="w-full rounded-xl border border-[#D1D1D1] bg-white px-4 py-3.5 text-base text-[#333333] placeholder-[#A0A0A0] outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none"
                    placeholder="Enter DOB"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-[#A0A0A0]">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-8">
          <button
            type="button"
            onClick={handleContinue}
            disabled={!panNumber || !fullName || !dob || loading}
            className="w-full rounded-xl bg-[#E66344] py-4 text-center text-lg font-semibold text-white shadow-sm hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
