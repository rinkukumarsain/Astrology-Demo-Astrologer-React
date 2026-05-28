"use client";

import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

function formatAnalyticsChange(raw) {
  const n = Number(raw);
  if (!Number.isFinite(n)) return { text: "+0.00%", tone: "neutral" };
  const sign = n > 0 ? "+" : n < 0 ? "" : "+";
  const text = `${sign}${n.toFixed(2)}%`;
  const tone = n > 0 ? "up" : n < 0 ? "down" : "neutral";
  return { text, tone };
}

function formatCountFromKpi(kpi) {
  if (kpi == null) return "0";
  const v = kpi.count !== undefined ? kpi.count : kpi.value;
  const n = Number(v);
  if (!Number.isFinite(n)) return "0";
  return String(Math.trunc(n));
}

function MetricIcon({ name }) {
  const wrap = "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFF0E5] p-1.5 text-primary";
  const inner = "block h-5 w-5 max-h-full max-w-full";
  if (name === "phone")
    return (
      <span className={wrap} aria-hidden>
        <svg className={inner} width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
          <path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.2 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C9.4 21 3 14.6 3 6c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.2 1.1l-2.3 2.9Z" />
        </svg>
      </span>
    );
  if (name === "video")
    return (
      <span className={wrap} aria-hidden>
        <svg className={inner} width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4Z" />
        </svg>
      </span>
    );
  if (name === "bubble")
    return (
      <span className={wrap} aria-hidden>
        <svg className={inner} width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z" />
        </svg>
      </span>
    );
  if (name === "star")
    return (
      <span className={wrap} aria-hidden>
        <svg className={inner} width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 2.5 14.2 9h6.8l-5.5 4 2.1 6.5L12 16.9 6.4 19.5l2.1-6.5L3 9h6.8L12 2.5Z" />
        </svg>
      </span>
    );
  return (
    <span className={wrap} aria-hidden>
      <svg className={inner} width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2Zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8Zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7Z" />
      </svg>
    </span>
  );
}

const Performance = () => {
  const { t } = useTranslation();
  const analyticsState = useSelector((state) => state.dashboard.analytics);
  const analytics = analyticsState.data?.analytics || null;
  const isLoading = analyticsState.loading;

  const metrics = useMemo(() => {
    const a = analytics || {};
    const voice = a.voiceCalls ?? a.voiceCall;
    const video = a.videoCalls ?? a.videoCall;
    const chat = a.chatCalls ?? a.totalChats ?? a.chat;
    const rating = a.avgRating ?? a.averageRating ?? a.rating;
    const duration = a.totalDuration ?? a.duration;

    return [
      {
        labelKey: "totalVoiceCalls",
        fallbackLabel: "Total Voice Calls",
        icon: "phone",
        value: formatCountFromKpi(voice),
        change: formatAnalyticsChange(voice?.change),
      },
      {
        labelKey: "totalVideoCalls",
        fallbackLabel: "Total Video Calls",
        icon: "video",
        value: formatCountFromKpi(video),
        change: formatAnalyticsChange(video?.change),
      },
      {
        labelKey: "totalChats",
        fallbackLabel: "Total Chats",
        icon: "bubble",
        value: formatCountFromKpi(chat),
        change: formatAnalyticsChange(chat?.change),
      },
      {
        labelKey: "avgRating",
        fallbackLabel: "Avg. Rating",
        icon: "star",
        value: (() => {
          const raw = rating?.value ?? rating?.count ?? rating;
          if (raw == null || raw === "") return "-/5";
          const s = String(raw).trim();
          if (s.includes("/")) return s;
          return `${s}/5`;
        })(),
        change: formatAnalyticsChange(rating?.change),
      },
      {
        labelKey: "totalDuration",
        fallbackLabel: "Total Duration",
        icon: "clock",
        value: duration?.value != null && duration.value !== "" ? String(duration.value) : "0s",
        change: formatAnalyticsChange(duration?.change),
      },
    ];
  }, [analytics]);

  return (
    <section>
      <div className="flex flex-wrap gap-3 md:flex-nowrap md:justify-between">
        {metrics.map((m) => (
          <div
            key={m.labelKey}
            className="flex min-w-35 flex-1 flex-col gap-2 rounded-2xl border border-[#EEE8F0] bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <MetricIcon name={m.icon} />
              <span
                className={[
                  "text-xs font-medium",
                  m.change.tone === "up" ? "text-green-600" : m.change.tone === "down" ? "text-red-600" : "text-green-600",
                ].join(" ")}
              >
                {isLoading ? "..." : m.change.text}
              </span>
            </div>
            <p className="text-xl font-semibold text-[#1a1a1a]">{isLoading ? "..." : m.value}</p>
            <p className="text-xs leading-snug text-[#666]">{t(m.labelKey) || m.fallbackLabel}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Performance;
