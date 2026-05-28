"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { postAPIAuth } from "@/lib/apiServices";
import { API_ENDPOINTS } from "@/constants/apiConstants";
import { fetchDashboardProfile } from "@/redux/slices/dashboardSlice";

export default function AadharVerificationModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [aadharNumber, setAadharNumber] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [referenceId, setReferenceId] = useState("");
  const [timeLeft, setTimeLeft] = useState(45);
  
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const dispatch = useDispatch();

  // resetting state when closed
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setAadharNumber("");
      setAgreed(false);
      setReferenceId("");
      setOtp(["", "", "", "", "", ""]);
      setTimeLeft(45);
    }
  }, [isOpen]);

  // Handle countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (isOpen && step === 2 && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [isOpen, step, timeLeft]);

  if (!isOpen) return null;

  const handleContinue = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!aadharNumber || !agreed || aadharNumber.length < 12) return;
    
    setLoading(true);
    try {
      const response = await postAPIAuth(API_ENDPOINTS.VERIFY_AADHAR, { aadhaar_number: aadharNumber });
      
      if(response?.data?.status){
        const payload = response?.data;
        const message = payload?.message || payload?.data?.message || "OTP sent successfully";
        toast.success(message);
        
        const refId = payload?.data?.reference_id || payload?.reference_id || payload?.data?.data?.reference_id;
        if (refId) {
           setReferenceId(refId);
        }
        
        setStep(2);
        setTimeLeft(45); // Reset timer on success (including resends)
      }else{
        toast.error(response?.data?.message || "Failed to initiate Aadhar verification");
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.response?.data?.error || error?.message || "Failed to verify Aadhar";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) return;

    setLoading(true);
    try {
      const response = await postAPIAuth(API_ENDPOINTS.VERIFY_AADHAR_OTP, {
        reference_id: referenceId,
        otp: otpValue
      });

      if (response?.data?.status) {
        toast.success(response?.data?.message || "Aadhar verified successfully!");
        await dispatch(fetchDashboardProfile());
        if (onSuccess) {
          onSuccess();
        } else if (onClose) {
          onClose();
        }
      } else {
        toast.error(response?.data?.message || "OTP verification failed");
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.response?.data?.error || error?.message || "Verification failed";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="relative flex w-full max-w-[480px] min-h-[600px] flex-col rounded-[24px] bg-[#FFFBF8] p-6 shadow-xl md:p-8">
        
        {step === 1 ? (
          <>
            {/* Header Level 1 */}
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
    
            {/* Form Body Level 1 */}
            <div className="flex-1">
              <div className="mb-2 text-[#333333] text-start font-medium">Aadhar card Verification</div>
              <input
                type="text"
                className="w-full rounded-xl border border-[#D1D1D1] bg-white px-4 py-3.5 text-base text-[#333333] placeholder-[#A0A0A0] outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Enter Aadhar card number"
                value={aadharNumber}
                onChange={(e) => setAadharNumber(e.target.value.replace(/\D/g, ""))}
                maxLength={12}
              />
            </div>
    
            {/* Footer actions Level 1 */}
            <div className="mt-auto pt-6">
              <button
                type="button"
                onClick={handleContinue}
                disabled={!aadharNumber || !agreed || aadharNumber.length < 12 || loading}
                className="w-full rounded-xl bg-[#E66344] py-3.5 text-center text-lg font-semibold text-white shadow-sm hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                {loading ? "Verifying..." : "Continue"}
              </button>
    
              <div className="mt-5 flex items-start gap-3 px-1">
                <input
                  type="checkbox"
                  id="terms-checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 h-5 w-5 shrink-0 cursor-pointer rounded border-[#C0C0C0] text-[#E66344] focus:ring-[#E66344]"
                />
                <label htmlFor="terms-checkbox" className="text-sm cursor-pointer text-[#4B4B4B] leading-snug">
                  Agree to our{" "}
                  <Link href="/terms" className="text-[#E66344] hover:underline" onClick={(e) => e.stopPropagation()}>
                    Terms & Conditions
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-[#E66344] hover:underline" onClick={(e) => e.stopPropagation()}>
                    Privacy Policy
                  </Link>
                </label>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Header Level 2 */}
            <div className="mb-3 flex items-center gap-3">
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="inline-flex cursor-pointer items-center justify-center p-1 text-[#1A1A1A] hover:bg-neutral-100 rounded-full" 
                aria-label="Go back">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-[19px] font-semibold text-[#1A1A1A]">Verify OTP</h2>
            </div>
            
            <p className="text-[#4E4E4E] text-[15px] mb-8 leading-snug pr-4">
              Enter OTP that we have send to your mobile number that link with your Aadhar card number
            </p>

            {/* OTP Input Fields */}
            <div className="flex items-center gap-2 sm:gap-3 mb-8">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="h-[52px] w-[46px] sm:h-[58px] sm:w-[50px] rounded-xl border-none bg-[#F4F4F4] text-center text-xl font-semibold text-[#333] outline-none focus:ring-2 focus:ring-[#E66344]/50"
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={otp.join("").length !== 6 || loading}
              className="w-full rounded-xl bg-[#E66344] py-3.5 text-center text-[17px] font-medium text-white shadow-sm hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              Verify
            </button>

            <div className="mt-8 text-sm text-[#4E4E4E]">
              {timeLeft > 0 ? (
                <p>Resend SMS in <span className="font-semibold text-primary">{`00:${timeLeft < 10 ? `0${timeLeft}` : timeLeft}`}</span></p>
              ) : (
                <>
                  Didn't get OTP? Resend SMS in<br/>
                  <button 
                    onClick={() => handleContinue({ preventDefault: ()=>{} })} 
                    disabled={loading}
                    className="text-[#E66344] font-semibold hover:underline mt-1 disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                </>
              )}
            </div>

          </>
        )}

      </div>
    </div>
  );
}
