"use client";

import { API_ENDPOINTS } from "@/constants/apiConstants";
import { getAPI } from "@/lib/apiServices";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

const CONSULTATION_LIST = ["Chat", "Voice Call", "Video Call"];
const EXPERIENCE_OPTIONS = ["0-1 years", "2-5 years", "6-10 years", "10+ years"];

export function useSignupDetails() {
  const router = useRouter();
  const certificateInputRef = useRef(null);

  const [experience, setExperience] = useState("");
  const [expertises, setExpertises] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [consultationType, setConsultationType] = useState([]);
  const [ratePerMinChat, setRatePerMinChat] = useState("");
  const [ratePerMinCall, setRatePerMinCall] = useState("");
  const [ratePerMinVideoCall, setRatePerMinVideoCall] = useState("");
  const [certificateFile, setCertificateFile] = useState(null);
  const [expertiseOptions, setExpertiseOptions] = useState([]);
  const [languageOptions, setLanguageOptions] = useState([]);
  const [showAllExpertise, setShowAllExpertise] = useState(false);
  const [showAllLanguages, setShowAllLanguages] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function fetchListingOptions() {
      try {
        const response = await getAPI(API_ENDPOINTS.GET_LISTING);
        const responseData = response?.data;
        if (!responseData?.status) return;

        if (!mounted) return;
        const expertisesList = (responseData?.data?.expertises || [])
          .filter((item) => item?.Status)
          .map((item) => item?.name)
          .filter(Boolean);
        const languagesList = (responseData?.data?.languages || [])
          .filter((item) => item?.isActive && !item?.isDeleted)
          .map((item) => item?.title)
          .filter(Boolean);

        setExpertiseOptions(expertisesList);
        setLanguageOptions(languagesList);
      } catch {
        if (mounted) {
          toast.error("Unable to load expertise and languages.");
        }
      }
    }

    fetchListingOptions();
    return () => {
      mounted = false;
    };
  }, []);

  function toggleMultiValue(list, setList, value) {
    setList((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  }

  function handleRateChange(setter) {
    return function onRateChange(event) {
      setter(event.target.value.replace(/[^\d.]/g, ""));
    };
  }

  function handleOpenCertificatePicker() {
    certificateInputRef.current?.click();
  }

  function handleCertificateChange(event) {
    const file = event.target.files?.[0] ?? null;
    setCertificateFile(file);
  }

  const canSubmit = useMemo(() => {
    return (
      experience &&
      expertises.length > 0 &&
      languages.length > 0 &&
      consultationType.length > 0 &&
      ratePerMinChat &&
      ratePerMinCall &&
      ratePerMinVideoCall
    );
  }, [consultationType, experience, expertises, languages, ratePerMinCall, ratePerMinChat, ratePerMinVideoCall]);

  function handleBack() {
    router.push("/signup/otp");
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) {
      toast.error("Please fill all required fields.");
      return;
    }

    const stepTwoData = {
      experience,
      expertises,
      languages,
      consultationType: consultationType.map((item) => item === "Voice Call" ? "voiceCall" : item === "Video Call" ? "videoCall" : "chat"),
      ratePerMinChat,
      ratePerMinCall,
      ratePerMinVideoCall,
      certificates: null,
      certificatesName: certificateFile?.name || "",
    };
    localStorage.setItem("signupStepTwoData", JSON.stringify(stepTwoData));
    router.push("/signup/final");
  }

  return {
    experience,
    expertises,
    languages,
    consultationType,
    ratePerMinChat,
    ratePerMinCall,
    ratePerMinVideoCall,
    certificateFile,
    certificateInputRef,
    canSubmit,
    showAllExpertise,
    showAllLanguages,
    options: {
      EXPERIENCE_OPTIONS,
      EXPERTISE_LIST: expertiseOptions,
      LANGUAGE_LIST: languageOptions,
      CONSULTATION_LIST,
    },
    handleBack,
    handleSubmit,
    setExperience,
    toggleExpertise: (value) => toggleMultiValue(expertises, setExpertises, value),
    toggleLanguage: (value) => toggleMultiValue(languages, setLanguages, value),
    toggleConsultationType: (value) => toggleMultiValue(consultationType, setConsultationType, value),
    handleRatePerMinChat: handleRateChange(setRatePerMinChat),
    handleRatePerMinCall: handleRateChange(setRatePerMinCall),
    handleRatePerMinVideoCall: handleRateChange(setRatePerMinVideoCall),
    handleOpenCertificatePicker,
    handleCertificateChange,
    handleViewAllExpertise: () => setShowAllExpertise(true),
    handleViewAllLanguages: () => setShowAllLanguages(true),
    handleToggleExpertiseView: () => setShowAllExpertise((prev) => !prev),
    handleToggleLanguagesView: () => setShowAllLanguages((prev) => !prev),
  };
}
