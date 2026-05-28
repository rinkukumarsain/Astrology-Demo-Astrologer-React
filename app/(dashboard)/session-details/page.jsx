"use client";

import { useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { fetchSessionDetail } from "@/redux/slices/dashboardSlice";
import { getBackendImageUrl } from "@/lib/getBackendImageUrl";

function ProfileAvatar() {
  return (
    <div className="relative h-12 w-12 shrink-0">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#F1DCC6] text-[#734A21] shadow-sm">
        <svg className="h-6 w-6" width={24} height={24} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4 0-7 2.2-7 5v1h14v-1c0-2.8-3-5-7-5Z" />
        </svg>
      </span>
      <span className="absolute -right-0.5 -top-0.5 inline-flex h-4.5 w-4.5 items-center justify-center rounded-full bg-primary text-white">
        <svg className="h-3 w-3" width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m4 4 16 16M20 4 4 20" />
        </svg>
      </span>
    </div>
  );
}

function MiniInfoCard({ label, value, icon }) {
  return (
    <div className="rounded-xl bg-white p-3">
      <p className="text-[11px] text-[#7D7D86]">{label}</p>
      <p className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-[#23232A]">
        {icon}
        <span>{value}</span>
      </p>
    </div>
  );
}

export default function SessionDetailsPage() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const sessionDetailState = useSelector((state) => state.dashboard.sessionDetail);
  const data = sessionDetailState.data || {};
  const sessionInfo = data?.sessionInfo && typeof data.sessionInfo === "object" ? data.sessionInfo : {};
  const earningOverview = data?.earningOverview && typeof data.earningOverview === "object" ? data.earningOverview : {};
  const user = data?.user && typeof data.user === "object" ? data.user : {};
  const sessionId = searchParams.get("id");

  useEffect(() => {
    if (!sessionId) return;
    void dispatch(fetchSessionDetail(sessionId));
  }, [dispatch, sessionId]);

  const name = user?.name || "Unknown user";
  const typeRaw = sessionInfo?.type || "Chat";
  const duration = sessionInfo?.durationFormatted || `${sessionInfo?.duration || 0}`;
  const createdAt = sessionInfo?.date ? new Date(sessionInfo.date) : null;
  const dateValue = createdAt && !Number.isNaN(createdAt.getTime()) ? createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-";
  const sessionTime = sessionInfo?.time ? new Date(sessionInfo.time) : null;
  const timeValue = sessionTime && !Number.isNaN(sessionTime.getTime()) ? sessionTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true }) : "-";
  const birthDate = user?.dob ? new Date(user.dob).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-";
  const birthTime = user?.birthTime || "-";
  const birthPlace = user?.birthPlace || "-";
  const profileImage = getBackendImageUrl(user?.image);

  const typeMap = {
    chat: t("chat") || "Chat",
    "voice call": t("voiceCall") || "Voice Call",
    "audio call": t("audioCall") || "Audio Call",
    audio: t("audioCall") || "Audio",
    "video call": t("videoCall") || "Video Call",
    video: t("videoCall") || "Video",
  };
  const type = typeMap[typeRaw.toLowerCase()] || typeRaw;

  const grossAmount = Number(earningOverview?.amount || 0);
  const taxes = Number(earningOverview?.taxes || 0);
  const netAmount = Number(earningOverview?.netAmount || 0);

  return (
    <section className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col gap-3 rounded-2xl bg-[#FFF9FB] p-4 md:p-5">
      <header>
        <h1 className="text-2xl font-bold text-[#303038]">{t("sessionDetails") || "Session Details"}</h1>
        <p className="mt-0.5 text-xs text-[#8B8B96]">{t("sessionInfo") || "Review your archival record for this interaction."}</p>
        {sessionDetailState.loading ? <p className="mt-1 text-xs text-[#8B8B96]">Loading session details...</p> : null}
        {sessionDetailState.error ? <p className="mt-1 text-xs text-[#B42318]">{sessionDetailState.error}</p> : null}
      </header>

      <div className="rounded-2xl border border-[#F2E8EF] bg-white p-3.5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-[#25252C]">{name}</p>
            <div className="mt-1.5 space-y-1 text-xs text-[#6C6C75]">
              <p className="flex items-center gap-1.5">
                <span className="inline-flex h-3.5 w-3.5 items-center justify-center text-[#8F8F98]">
                  <svg className="h-3.5 w-3.5" width={14} height={14} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4 0-7 2.2-7 5v1h14v-1c0-2.8-3-5-7-5Z" />
                  </svg>
                </span>
                {birthDate}
              </p>
              <p className="flex items-center gap-1.5">
                <span className="inline-flex h-3.5 w-3.5 items-center justify-center text-[#8F8F98]">
                  <svg className="h-3.5 w-3.5" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 21s7-4.6 7-10a7 7 0 1 0-14 0c0 5.4 7 10 7 10Z" />
                    <circle cx="12" cy="11" r="2.5" />
                  </svg>
                </span>
                {birthPlace}
              </p>
              <p className="flex items-center gap-1.5">
                <span className="inline-flex h-3.5 w-3.5 items-center justify-center text-[#8F8F98]">
                  <svg className="h-3.5 w-3.5" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                </span>
                {birthTime}
              </p>
            </div>
          </div>
          {profileImage ? (
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full">
              <img src={profileImage} alt={name} className="h-full w-full object-cover" />
            </div>
          ) : (
            <ProfileAvatar />
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-2 px-0.5 text-[11px] font-bold uppercase tracking-wide text-[#8A8A93]">
          {t("sessionInfo") || "Interaction Info"}
        </h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <MiniInfoCard
            label={t("type") || "Type"}
            value={type}
            icon={
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
            }
          />
          <MiniInfoCard
            label={t("date") || "Date"}
            value={dateValue}
            icon={
              <svg className="h-3.5 w-3.5 text-primary" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M16 3v4M8 3v4M3 11h18" />
              </svg>
            }
          />
          <MiniInfoCard
            label={t("duration") || "Duration"}
            value={duration}
            icon={
              <svg className="h-3.5 w-3.5 text-primary" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
            }
          />
          <MiniInfoCard
            label={t("time") || "Time"}
            value={timeValue}
            icon={
              <svg className="h-3.5 w-3.5 text-primary" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
            }
          />
        </div>
      </div>

      <div>
        <h2 className="mb-2 px-0.5 text-[11px] font-bold uppercase tracking-wide text-[#8A8A93]">
          {t("earningOverview") || "Earning Overview"}
        </h2>
        <div className="overflow-hidden rounded-2xl border border-[#F2E8EF] bg-white shadow-sm">
          <div className="space-y-2 px-3.5 py-3">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-[#5B5B64]">{t("grossEarnings") || "Gross Amount"}</span>
              <span className="font-semibold text-[#22222A]">{`₹${grossAmount.toFixed(2)}`}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-[#5B5B64]">{t("taxes") || "Taxes"}</span>
              <span className="font-semibold text-[#D6455B]">{`-₹${taxes.toFixed(3)}`}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 bg-primary px-3.5 py-3 text-white">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-white/80">{t("netAmount") || "Net Payout"}</p>
              <p className="mt-0.5 text-2xl font-bold leading-none">{`₹${netAmount.toFixed(3)}`}</p>
            </div>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-white/15" aria-hidden>
              <svg className="h-4 w-4" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M21 12V7H5a2 2 0 0 1 2-2h14v4M3 5v14a2 2 0 0 0 2 2h16v-5M18 12a2 2 0 1 0 0 4h4v-4h-4Z" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
