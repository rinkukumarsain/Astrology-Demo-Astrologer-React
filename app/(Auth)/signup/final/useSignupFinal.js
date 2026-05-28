"use client";

import { API_ENDPOINTS } from "@/constants/apiConstants";
import { AUTH_TOKEN_KEY, FIREBASE_FCM_TOKEN } from "@/constants/others";
import { postAPI } from "@/lib/apiServices";
import { setCookies } from "@/lib/clientHelpers";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

const MAX_TEXT = 500;

function parseStoredObject(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function useSignupFinal() {
  const router = useRouter();
  const [chartType, setChartType] = useState("");
  const [about, setAbout] = useState("");
  const [achievements, setAchievements] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(
    () => chartType && about.trim().length > 0 && achievements.trim().length > 0,
    [achievements, about, chartType]
  );

  function handleBack() {
    router.push("/signup/details");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit || isSubmitting) return;

    const stepOne = parseStoredObject("signupStepOneData") || {};
    const stepTwo = parseStoredObject("signupStepTwoData");
    const stepThree = {
      chartType,
      about: about.trim(),
      achievements: achievements.trim(),
    };
    localStorage.setItem("signupStepThreeData", JSON.stringify(stepThree));

    const mobile = stepOne.mobile || localStorage.getItem("signupMobile");
    const aid = stepOne.aid || localStorage.getItem("signupAid");

    if (!mobile || !stepTwo) {
      toast.error("Session expired. Please complete signup again.");
      router.push("/signup");
      return;
    }

    setIsSubmitting(true);
    try {
      const userAgent = navigator.userAgent.toLowerCase();
      const deviceName = userAgent.includes("chrome") ? "chrome" : "browser";
      const deviceId = navigator.vendor || "web";
      const fcmToken = sessionStorage.getItem(FIREBASE_FCM_TOKEN);

      const payload = {
        name: stepOne.name || "",
        dob: stepOne.dob || "",
        email: stepOne.email || "",
        about: stepThree.about,
        achievements: stepThree.achievements,
        certificates: stepTwo.certificates ?? null,
        chartType: stepThree.chartType,
        cityState: stepOne.cityState || "",
        consultationType: stepTwo.consultationType ?? [],
        deviceId,
        deviceName,
        experience: stepTwo.experience || "",
        expertises: stepTwo.expertises || [],
        gender: stepOne.gender || "",
        image: stepOne.image ?? null,
        languages: stepTwo.languages || [],
        mobile,
        ratePerMinCall: String(stepTwo.ratePerMinCall || ""),
        ratePerMinChat: String(stepTwo.ratePerMinChat || ""),
        ratePerMinVideoCall: String(stepTwo.ratePerMinVideoCall || ""),
        fcmToken: fcmToken || "astrologer",
      };

      if (aid) {
        payload.aid = aid;
      }

      const response = await postAPI(API_ENDPOINTS.REGISTER, payload);
      const responseData = response?.data;
      if (!responseData?.status) {
        throw new Error(responseData?.message || "Unable to complete registration.");
      }

      const token = responseData?.data?.loginToken || responseData?.data?.token;
      if (token) {
        setCookies(AUTH_TOKEN_KEY, token, 60 * 60 * 24 * 7);
      }

      // Clear temporary signup flow data after successful registration.
      localStorage.removeItem("signupMobile");
      localStorage.removeItem("signupAid");
      localStorage.removeItem("signupStepOneData");
      localStorage.removeItem("signupStepTwoData");
      localStorage.removeItem("signupStepThreeData");

      toast.success(responseData?.message || "Registration completed successfully");
      router.push("/");
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || "Unable to complete registration.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    chartType,
    about,
    achievements,
    isSubmitting,
    canSubmit,
    textLimits: {
      MAX_TEXT,
      aboutCount: about.length,
      achievementsCount: achievements.length,
    },
    setChartType,
    setAbout: (value) => setAbout(value.slice(0, MAX_TEXT)),
    setAchievements: (value) => setAchievements(value.slice(0, MAX_TEXT)),
    handleBack,
    handleSubmit,
  };
}
