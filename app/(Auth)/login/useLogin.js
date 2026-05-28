"use client";

import { API_ENDPOINTS } from "@/constants/apiConstants";
import { postAPI } from "@/lib/apiServices";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useFormik } from "formik";
import * as Yup from "yup";

export function useLogin() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

  // Validation Schema using Yup
  const validationSchema = Yup.object({
    mobileNumber: Yup.string()
      .min(10, "Must be 10 digits")
      .max(10, "Must be 10 digits")
      .required("Required"),
  });

  const formik = useFormik({
    initialValues: {
      mobileNumber: "",
    },
    validationSchema,
    validateOnMount: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      // Ensure notifications are permitted before proceeding
      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission !== "granted") {
          try {
            const permission = await Notification.requestPermission();
            if (permission !== "granted") {
              toast.error("Notifications are required for login. Please allow them in your browser.");
              setShowNotificationPrompt(true);
              return;
            }
          } catch (err) {
            console.error("Notification permission error:", err);
            return;
          }
        }
      }

      setIsSubmitting(true);
      try {
        const payload = { mobile: values.mobileNumber };
        const response = await postAPI(API_ENDPOINTS.LOGIN_WITH_MOBILE, payload);
        const responseData = response?.data;

        if (!responseData?.status) {
          throw new Error(responseData?.message || "Unable to send OTP. Please try again.");
        }

        const aidPayload = responseData?.data?.aid;
        const aid =
          (typeof aidPayload === "object" && aidPayload?.aid) ||
          (typeof aidPayload === "object" && aidPayload?._id) ||
          (typeof aidPayload === "string" ? aidPayload : "");
        const isNewAstrologer = Boolean(responseData?.data?.newAstrologer);

        localStorage.setItem("loginMobile", values.mobileNumber);
        if (aid) {
          localStorage.setItem("astrologerAid", aid);
        }
        localStorage.setItem("isNewAstrologer", String(isNewAstrologer));
        toast.success(responseData?.message || "OTP sent successfully");
        router.push("/otp");
      } catch (error) {
        const serverMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Unable to send OTP. Please try again.";
        toast.error(serverMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Force validation update for mobile browsers
  useEffect(() => {
    formik.validateForm();
  }, [formik.values.mobileNumber]);

  // Handle number-only input and limit to 10 digits
  const handleMobileChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    // Explicitly set value and trigger validation
    formik.setFieldValue("mobileNumber", val, true);
    // Mark as touched to ensure isValid updates correctly on some mobile browsers
    if (val.length > 0) {
      formik.setFieldTouched("mobileNumber", true, false);
    }
  };

  return {
    formik,
    isSubmitting,
    showNotificationPrompt,
    handleMobileChange,
    handleGoToSignup: () => router.push("/signup"),
    handleGoToTerms: () => {router.push("/terms-and-conditions")},
  };
}
