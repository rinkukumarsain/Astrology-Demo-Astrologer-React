"use client";

import { API_ENDPOINTS } from "@/constants/apiConstants";
import { postAPI } from "@/lib/apiServices";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

const OTP_LENGTH = 6;

function getInitialOtp() {
  return Array.from({ length: OTP_LENGTH }, () => "");
}

export function useSignupOtp() {
  const router = useRouter();
  const inputRefs = useRef([]);
  const [otp, setOtp] = useState(getInitialOtp);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");

  useEffect(() => {
    const savedMobile = localStorage.getItem("signupMobile");
    if (savedMobile) {
      setMobileNumber(savedMobile);
    }
  }, []);

  const canSubmit = useMemo(() => otp.every((digit) => digit !== ""), [otp]);

  function focusInput(index) {
    inputRefs.current[index]?.focus();
  }

  function setOtpValue(index, value) {
    setOtp((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function handleOtpChange(index, event) {
    const digit = event.target.value.replace(/\D/g, "").slice(-1);
    setOtpValue(index, digit);
    if (digit && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  }

  function handleOtpKeyDown(index, event) {
    if (event.key !== "Backspace") return;
    if (otp[index]) {
      setOtpValue(index, "");
      return;
    }
    if (index > 0) {
      focusInput(index - 1);
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
    focusInput(Math.min(pasted.length, OTP_LENGTH - 1));
  }

  function handleBack() {
    router.push("/signup");
  }

  function handleEditMobile() {
    router.push("/signup");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit || isSubmitting) return;

    const mobile = localStorage.getItem("signupMobile");
    if (!mobile) {
      toast.error("Session expired. Please signup again.");
      router.push("/signup");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        mobile,
        code: otp.join(""),
      };
      const response = await postAPI(API_ENDPOINTS.REGISTRATION_VERIFY_OTP, payload);
      const responseData = response?.data;
      if (!responseData?.status) {
        throw new Error(responseData?.message || "OTP verification failed.");
      }

      const aidPayload = responseData?.data?.aid;
      const aid =
        (typeof aidPayload === "object" && aidPayload?.aid) ||
        (typeof aidPayload === "object" && aidPayload?._id) ||
        (typeof aidPayload === "string" ? aidPayload : "");
      if (aid) {
        localStorage.setItem("signupAid", aid);
      }

      toast.success(responseData?.message || "OTP verified successfully");
      router.push("/signup/details");
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || "OTP verification failed.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    otp,
    canSubmit,
    isSubmitting,
    mobileNumber,
    inputRefs,
    handleBack,
    handleEditMobile,
    handleSubmit,
    handleOtpChange,
    handleOtpKeyDown,
    handleOtpPaste,
  };
}
