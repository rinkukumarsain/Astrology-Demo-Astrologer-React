"use client";

import React from "react";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { fetchDailyStats, updateAstrologerServices, updateOnlineStatus } from "@/redux/slices/dashboardSlice";
import AadharVerificationModal from "@/components/common/AadharVerificationModal";
import PanVerificationModal from "@/components/common/PanVerificationModal";
import BankVerificationModal from "@/components/common/BankVerificationModal";
import MediaPermissionPrompt from "@/components/common/MediaPermissionPrompt";

function getServiceFlags(profile) {
  return {
    isChatting: Boolean(profile?.isChatting),
    isCalling: Boolean(profile?.isCalling || profile?.isVoiceCalling),
    isVideoCalling: Boolean(profile?.isVideoCalling),
  };
}

function activeServiceCount(flags) {
  return Number(flags.isChatting) + Number(flags.isCalling) + Number(flags.isVideoCalling);
}

const Greeting = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const profile = useSelector((state) => state.dashboard.profile.data);
  const [isAadharModalOpen, setIsAadharModalOpen] = React.useState(false);
  const [isPanModalOpen, setIsPanModalOpen] = React.useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = React.useState(false);
  const [mediaPromptState, setMediaPromptState] = React.useState({ isOpen: false, type: "camera/mic" });
  const dailyStatsState = useSelector((state) => state.dashboard.dailyStats);
  const dailyStats = dailyStatsState?.data || {};
  const summary = dailyStats?.summary || {};
  const breakdown = dailyStats?.breakdown || {};
  const isStatusUpdating = useSelector((state) => state.dashboard.statusUpdate.loading);
  const isServiceUpdating = useSelector((state) => state.dashboard.serviceUpdate.loading);

  const displayName = profile?.fullName || profile?.name || "Girish sharma";
  const earningsValue = Number(summary?.earnings || 0).toFixed(2);
  const consultationCount = Number(summary?.consultations || 0);
  const durationValue = summary?.duration || "0s";
  const isOnline = Boolean(profile?.isOnline);
  const formattedDate =
    dailyStats?.date ||
    new Date().toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
  const serviceFlags = getServiceFlags(profile);
  const onlineActiveCount = activeServiceCount(serviceFlags);
  const chatBreakdown = breakdown?.chats || {};
  const voiceBreakdown = breakdown?.voiceCalls || {};
  const videoBreakdown = breakdown?.videoCalls || {};

  useEffect(() => {
    if (dailyStatsState.loading || dailyStatsState.loaded) return;
    void dispatch(fetchDailyStats());
  }, [dailyStatsState.loaded, dailyStatsState.loading, dispatch]);

  useEffect(() => {
    // If they are online and have voice or video calls enabled, verify they haven't blocked permissions
    if (isOnline && (profile?.isCalling || profile?.isVideoCalling || profile?.isVoiceCalling)) {
      if (typeof navigator !== "undefined" && navigator.permissions && navigator.permissions.query) {
        const checkPermissions = async () => {
          try {
            const micStatus = await navigator.permissions.query({ name: 'microphone' });
            let cameraStatus = null;
            if (profile?.isVideoCalling) {
              try {
                cameraStatus = await navigator.permissions.query({ name: 'camera' });
              } catch (e) {
                // Ignore if camera permission query fails on some browsers
              }
            }

            if (micStatus.state === 'denied' || (cameraStatus && cameraStatus.state === 'denied')) {
              setMediaPromptState({ isOpen: true, type: profile?.isVideoCalling ? "camera/mic" : "mic" });
            }
          } catch (err) {
            console.warn("Permissions API not supported for camera/mic on this browser", err);
          }
        };
        checkPermissions();
      }
    }
  }, [isOnline, profile?.isCalling, profile?.isVideoCalling, profile?.isVoiceCalling]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return t("goodMorning") || "Good morning,";
    if (hour >= 12 && hour < 17) return t("goodAfternoon") || "Good afternoon,";
    if (hour >= 17 && hour < 21) return t("goodEvening") || "Good evening,";
    return t("goodNight") || "Good night,";
  };

  const serviceCards = [
    { key: "chat", title: t("chat") || "Chat", enabled: isOnline && Boolean(profile?.isChatting) },
    { key: "voice", title: t("voiceCalls") || "Voice Calls", enabled: isOnline && Boolean(profile?.isCalling || profile?.isVoiceCalling) },
    { key: "video", title: t("videoCalls") || "Video Calls", enabled: isOnline && Boolean(profile?.isVideoCalling) },
  ];

  const handleStatusToggle = async () => {
    if (profile?.profileStatus === "pending" || profile?.profileStatus === "rejected") {
      toast.error("Your Profile is not Verified by the Admin");
      return;
    }
    if (profile?.documents?.aadharCard?.status !== 1) {
      setIsAadharModalOpen(true);
      return;
    }
    if (profile?.documents?.panCard?.status !== 1) {
      setIsPanModalOpen(true);
      return;
    }
    if (!profile?.bankDetails?.isVerified) {
      setIsBankModalOpen(true);
      return;
    }
    const nextStatus = !isOnline;

    if (nextStatus) {
      // Request camera and microphone permissions
      if (typeof navigator !== "undefined") {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices.getUserMedia({ audio: true, video: true })
            .then(stream => {
              // Stop tracks immediately so the recording light doesn't stay on
              stream.getTracks().forEach(track => track.stop());
            })
            .catch(err => {
              // console.warn("Media permission error:", err);
              if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setMediaPromptState({ isOpen: true, type: "camera/mic" });
              } else if (err.name === 'NotFoundError') {
                toast.error("No camera or microphone found on your device.");
              } else {
                toast.error("Could not access camera/mic: " + err.message);
              }
            });
        } else {
          toast.error("Camera/Mic access is only supported on HTTPS or localhost.");
        }
      }
    }

    try {
      const result = await dispatch(updateOnlineStatus({ status: nextStatus })).unwrap();
      toast.success(result?.message || (nextStatus ? (t("online") || "Online") : (t("offline") || "Offline")));
      if (result?.autoMessage) {
        toast.success(result.autoMessage);
      }
    } catch (errorMessage) {
      toast.error(errorMessage || t("errorOccured") || "An error occurred. Please try again.");
    }
  };

  const handleServiceToggle = async (serviceKey) => {
    if (profile?.profileStatus === "pending") {
      toast.error("Your Profile is not Verified by the Admin");
      return;
    }
    if (profile?.documents?.aadharCard?.status !== 1) {
      setIsAadharModalOpen(true);
      return;
    }
    if (profile?.documents?.panCard?.status !== 1) {
      setIsPanModalOpen(true);
      return;
    }
    if (!profile?.bankDetails?.isVerified) {
      setIsBankModalOpen(true);
      return;
    }
    if (!isOnline) {
      toast.error(t("goOnlineToManageServices") || "Go online to change chat, call, or video settings.");
      return;
    }

    const isChatting = Boolean(profile?.isChatting);
    const isCalling = Boolean(profile?.isCalling || profile?.isVoiceCalling);
    const isVideoCalling = Boolean(profile?.isVideoCalling);
    const activeCount = Number(isChatting) + Number(isCalling) + Number(isVideoCalling);
    const turningOff =
      (serviceKey === "chat" && isChatting) ||
      (serviceKey === "voice" && isCalling) ||
      (serviceKey === "video" && isVideoCalling);

    if (turningOff && activeCount === 1) {
      toast.error(t("atLeastOneServiceMustStayOn") || "At least one of chat, voice, or video must stay on.");
      return;
    }

    const next = { isChatting, isCalling, isVideoCalling };
    if (serviceKey === "chat") next.isChatting = !isChatting;
    if (serviceKey === "voice") {
      next.isCalling = !isCalling;
      if (next.isCalling && typeof navigator !== "undefined" && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true }).then(s => s.getTracks().forEach(t => t.stop())).catch((err) => {
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            setMediaPromptState({ isOpen: true, type: "mic" });
          } else {
            toast.error("Please allow microphone permission.");
          }
        });
      }
    }
    if (serviceKey === "video") {
      next.isVideoCalling = !isVideoCalling;
      if (next.isVideoCalling && typeof navigator !== "undefined" && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(s => s.getTracks().forEach(t => t.stop())).catch((err) => {
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            setMediaPromptState({ isOpen: true, type: "camera/mic" });
          } else {
            toast.error("Please allow camera and microphone permissions.");
          }
        });
      }
    }

    try {
      const result = await dispatch(updateAstrologerServices(next)).unwrap();
      toast.success(result?.message || t("serviceAvailabilityUpdated") || "Service availability updated");
    } catch (errorMessage) {
      toast.error(errorMessage || t("errorOccured") || "An error occurred. Please try again.");
    }
  };

  return (
    <>
      <section className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm md:flex-row md:items-stretch md:justify-between md:p-5">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div>
            <h1 className="text-lg font-semibold text-[#1a1a1a] md:text-xl">{`${getGreeting()} ${displayName}`}</h1>
            <p className="text-sm text-[#666]">{formattedDate}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-[#444]">{isOnline ? t("online") || "Online" : t("offline") || "Offline"}</span>
              <button
                type="button"
                onClick={handleStatusToggle}
                disabled={isStatusUpdating}
                className={[
                  "relative h-6 w-11 shrink-0 rounded-full transition-all duration-300 ease-in-out after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-all after:duration-300 after:ease-in-out",
                  isOnline ? "bg-primary after:translate-x-[20px]" : "bg-[#D4D4D4] after:translate-x-0",
                  isStatusUpdating ? "cursor-not-allowed opacity-70" : "cursor-pointer",
                ].join(" ")}
                aria-pressed={isOnline}
                aria-label="Toggle online status"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-6 border-t border-[#F0ECF4] pt-4">
            <div>
              <p className="text-xs text-[#888]">{t("earnings") || "Earnings"}</p>
              <p className="text-lg font-semibold text-[#1a1a1a]">{`₹${earningsValue}`}</p>
            </div>
            <div>
              <p className="text-xs text-[#888]">{t("duration") || "Duration"}</p>
                <p className="text-lg font-semibold text-[#1a1a1a]">{durationValue}</p>
            </div>
            <div>
              <p className="text-xs text-[#888]">{t("consultations") || "Consultations"}</p>
              <p className="text-lg font-semibold text-[#1a1a1a]">{consultationCount}</p>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-3 md:flex-row md:gap-3">
          {serviceCards.map((service) => {
            const isSoleActiveLock =
              isOnline &&
              onlineActiveCount === 1 &&
              ((service.key === "chat" && serviceFlags.isChatting) ||
                (service.key === "voice" && serviceFlags.isCalling) ||
                (service.key === "video" && serviceFlags.isVideoCalling));
            const serviceToggleDisabled = !isOnline || isServiceUpdating || isSoleActiveLock;
            return (
              <div
                key={service.key}
                className="flex min-w-[140px] flex-1 flex-col gap-2 rounded-xl border border-[#EEE8F0] bg-[#FDFBFF] p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#333]">{service.title}</span>
                  <button
                    type="button"
                    onClick={() => handleServiceToggle(service.key)}
                    disabled={serviceToggleDisabled}
                    className={[
                      "relative h-5 w-9 shrink-0 rounded-full transition-all duration-300 ease-in-out after:absolute after:top-0.5 after:left-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition-all after:duration-300 after:ease-in-out",
                      service.enabled ? "bg-primary after:translate-x-[16px]" : "bg-[#D4D4D4] after:translate-x-0",
                      serviceToggleDisabled ? "cursor-not-allowed opacity-70" : "cursor-pointer",
                    ].join(" ")}
                    aria-label={`Toggle ${service.title}`}
                    aria-pressed={service.enabled}
                  />
                </div>
                <p className="text-xs text-[#888]">
                  {`${t("sessions") || "Sessions"}: ${
                    service.key === "chat"
                      ? Number(chatBreakdown?.sessions || 0)
                      : service.key === "voice"
                        ? Number(voiceBreakdown?.sessions || 0)
                        : Number(videoBreakdown?.sessions || 0)
                  }`}
                </p>
                <p className="text-sm font-semibold text-primary">
                  ₹
                  {service.key === "chat"
                    ? Number(chatBreakdown?.earnings || 0)
                    : service.key === "voice"
                      ? Number(voiceBreakdown?.earnings || 0)
                      : Number(videoBreakdown?.earnings || 0)}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <AadharVerificationModal
        isOpen={isAadharModalOpen}
        onClose={() => setIsAadharModalOpen(false)}
        onSuccess={() => {
          setIsAadharModalOpen(false);
          if (profile?.documents?.panCard?.status !== 1) {
            setIsPanModalOpen(true);
          }
        }}
      />
      <PanVerificationModal
        isOpen={isPanModalOpen}
        onClose={() => setIsPanModalOpen(false)}
        onSuccess={() => {
          setIsPanModalOpen(false);
          if (!profile?.bankDetails?.isVerified) {
            setIsBankModalOpen(true);
          }
        }}
      />
      <BankVerificationModal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
      />
      <MediaPermissionPrompt
        isOpen={mediaPromptState.isOpen}
        type={mediaPromptState.type}
        onClose={() => setMediaPromptState({ isOpen: false, type: "camera/mic" })}
      />
    </>
  );
};

export default Greeting;
