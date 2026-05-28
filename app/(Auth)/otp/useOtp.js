"use client";

import { API_ENDPOINTS } from "@/constants/apiConstants";
import { AUTH_TOKEN_KEY, FIREBASE_FCM_TOKEN } from "@/constants/others";
import { postAPI } from "@/lib/apiServices";
import { setCookies } from "@/lib/clientHelpers";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

const OTP_LENGTH = 6;
const RESEND_WAIT_SECONDS = 30;

function getInitialOtp() {
  return Array.from({ length: OTP_LENGTH }, () => "");
}

function getStoredAid() {
  const aidValue = localStorage.getItem("astrologerAid");
  if (!aidValue) return null;
  return aidValue.replace(/^"+|"+$/g, "");
}

export function useOtp() {
  const router = useRouter();
  const inputRefs = useRef([]);

  const [otp, setOtp] = useState(getInitialOtp);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(RESEND_WAIT_SECONDS);

  const [phoneNumber, setPhoneNumber] = useState("+91 9090909909");

  useEffect(() => {
    const savedMobile = localStorage.getItem("loginMobile");
    if (savedMobile) {
      setPhoneNumber(`+91 ${savedMobile}`);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setResendSeconds((prev) => (prev <= 0 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const canSubmit = useMemo(() => otp.every((digit) => digit !== ""), [otp]);

  function setOtpValue(index, value) {
    setOtp((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function focusInput(index) {
    inputRefs.current[index]?.focus();
  }

  function handleOtpChange(index, event) {
    const raw = event.target.value;
    const digit = raw.replace(/\D/g, "").slice(-1);
    setOtpValue(index, digit);
    if (digit && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  }

  function handleOtpKeyDown(index, event) {
    if (event.key === "Backspace") {
      if (otp[index]) {
        setOtpValue(index, "");
        return;
      }
      if (index > 0) {
        focusInput(index - 1);
      }
    }
  }

  function handleOtpPaste(event) {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;

    setOtp((prev) => {
      const next = [...prev];
      for (let i = 0; i < OTP_LENGTH; i += 1) {
        next[i] = pasted[i] ?? "";
      }
      return next;
    });

    const nextFocusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    focusInput(nextFocusIndex);
  }

  function handleEditPhone() {
    router.push("/login");
  }

  function handleBack() {
    router.push("/login");
  }

  async function handleResendOtp() {
    if (resendSeconds > 0 || isResending) return;

    setIsResending(true);
    try {
      const aid = getStoredAid();
      if (!aid) {
        throw new Error("Session expired. Please login again.");
      }

      const payload = { aid };
      const response = await postAPI(API_ENDPOINTS.RESEND_OTP, payload);
      const responseData = response?.data;
      if (!responseData?.status) {
        throw new Error(responseData?.message || "OTP resend failed.");
      }

      setResendSeconds(RESEND_WAIT_SECONDS);
      setOtp(getInitialOtp());
      focusInput(0);
      toast.success(responseData?.message || "OTP resent successfully");
    } catch (error) {
      const serverMessage = error?.response?.data?.message || error?.message || "OTP resend failed.";
      toast.error(serverMessage);
    } finally {
      setIsResending(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const aid = getStoredAid();
      const code = otp.join("");
      const userAgent = navigator.userAgent.toLowerCase();
      const deviceName = userAgent.includes("chrome") ? "chrome" : "browser";
      let deviceId = localStorage.getItem("deviceId");
      const fcmToken = sessionStorage.getItem(FIREBASE_FCM_TOKEN);
      if (!deviceId) {
        deviceId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
        localStorage.setItem("deviceId", deviceId);
      }

      if (!aid) {
        throw new Error("Session expired. Please login again.");
      }

      const payload = {
        aid,
        code,
        deviceId,
        deviceName,
        fcmToken: fcmToken || "astrologer",
      };

      const response = await postAPI(API_ENDPOINTS.VERIFY_OTP, payload);
      const responseData = response?.data;
      if (!responseData?.status) {
        throw new Error(responseData?.message || "OTP verification failed.");
      }

      const token = responseData?.data?.token;
      if (token) {
        setCookies(AUTH_TOKEN_KEY, token, 60 * 60 * 24 * 7);
        // Force immediate socket authentication without waiting for router redirect
        import("@/lib/socketService").then(({ authenticate }) => {
          authenticate(token);
        });
      }
      // Cleanup temporary login onboarding keys after successful verification.
      localStorage.removeItem("loginMobile");
      localStorage.removeItem("astrologerAid");
      localStorage.removeItem("isNewAstrologer");
      toast.success(responseData?.message || "Login successfully");
      router.push("/");
    } catch (error) {
      const serverMessage =
        error?.response?.data?.message || error?.message || "OTP verification failed.";
      toast.error(serverMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    otp,
    canSubmit,
    isSubmitting,
    isResending,
    resendSeconds,
    phoneNumber,
    inputRefs,
    handleBack,
    handleEditPhone,
    handleResendOtp,
    handleSubmit,
    handleOtpChange,
    handleOtpKeyDown,
    handleOtpPaste,
  };
}
