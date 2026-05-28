"use client";

import { API_ENDPOINTS } from "@/constants/apiConstants";
import { postAPI } from "@/lib/apiServices";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

const INITIAL_FORM = {
  fullName: "",
  dob: "",
  phoneNumber: "",
  email: "",
  address: "",
};

export function useSignup() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [gender, setGender] = useState("male");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [profileFileName, setProfileFileName] = useState("");
  const [profilePreviewUrl, setProfilePreviewUrl] = useState("");
  const [form, setForm] = useState(INITIAL_FORM);

  function handleBack() {
    router.push("/login");
  }

  function handleGenderChange(nextGender) {
    setGender(nextGender);
  }

  function handleFieldChange(field) {
    return function onFieldChange(event) {
      const value = event.target.value;
      if (field === "fullName") {
        // Allow only alphabets and spaces in full name.
        const cleanName = value.replace(/[^A-Za-z\s]/g, "");
        setForm((prev) => ({ ...prev, [field]: cleanName }));
        return;
      }
      if (field === "phoneNumber") {
        setForm((prev) => ({ ...prev, [field]: value.replace(/\D/g, "").slice(0, 10) }));
        return;
      }
      setForm((prev) => ({ ...prev, [field]: value }));
    };
  }

  function handleOpenProfilePicker() {
    fileInputRef.current?.click();
  }

  function handleProfileFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) {
      setProfileFileName("");
      setProfilePreviewUrl("");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setProfileFileName(file.name);
    setProfilePreviewUrl(previewUrl);
  }

  useEffect(() => {
    return () => {
      if (profilePreviewUrl) {
        URL.revokeObjectURL(profilePreviewUrl);
      }
    };
  }, [profilePreviewUrl]);

  const canSubmit = useMemo(() => {
    return (
      form.fullName.trim().length > 1 &&
      form.dob.trim().length > 0 &&
      form.phoneNumber.length === 10 &&
      form.email.trim().length > 3 &&
      form.address.trim().length > 3
    );
  }, [form]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit || isSubmitting) {
      return;
    }

    // Ensure notifications are permitted before proceeding
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission !== "granted") {
        try {
          const permission = await Notification.requestPermission();
          if (permission !== "granted") {
            toast.error("Notifications are required to sign up. Please allow them in your browser.");
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
      const payload = { mobile: form.phoneNumber };
      const response = await postAPI(API_ENDPOINTS.REGISTRATION_SEND_OTP, payload);
      const responseData = response?.data;
      if (!responseData?.status) {
        throw new Error(responseData?.message || "Unable to send OTP. Please try again.");
      }

      const aidPayload = responseData?.data?.aid;
      const aid = typeof aidPayload === "string" ? aidPayload : aidPayload?._id;
      localStorage.setItem("signupMobile", form.phoneNumber);
      if (aid) {
        localStorage.setItem("signupAid", aid);
      }
      localStorage.setItem(
        "signupStepOneData",
        JSON.stringify({
          name: form.fullName.trim(),
          dob: form.dob,
          email: form.email.trim(),
          gender,
          cityState: "",
          image: null,
          mobile: form.phoneNumber,
          aid: aid || "",
        })
      );

      toast.success(responseData?.message || "OTP sent successfully");
      router.push("/signup/otp");
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || "Unable to send OTP. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    form,
    gender,
    isSubmitting,
    showNotificationPrompt,
    canSubmit,
    fileInputRef,
    profileFileName,
    profilePreviewUrl,
    handleBack,
    handleGenderChange,
    handleFieldChange,
    handleOpenProfilePicker,
    handleProfileFileChange,
    handleSubmit,
  };
}
