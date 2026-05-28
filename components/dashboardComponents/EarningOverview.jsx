"use client";

import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

function formatInr(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "\u20B90";
  return `\u20B9${x.toLocaleString("en-IN", { maximumFractionDigits: 2, minimumFractionDigits: x % 1 ? 2 : 0 })}`;
}

const EarningOverview = () => {
  const { t } = useTranslation();
  const analyticsState = useSelector((state) => state.dashboard.analytics);
  const earningOverview = analyticsState.data?.earningOverview || null;
  const isLoading = analyticsState.loading;

  const { viaCall, viaChat, gross, deductions, netEarnings, total } = useMemo(() => {
    const e = earningOverview || {};
    return {
      viaCall: Number(e.viaCall) || 0,
      viaChat: Number(e.viaChat) || 0,
      gross: Number(e.gross) || 0,
      deductions: Number(e.deductions) || 0,
      netEarnings: Number(e.netEarnings) || 0,
      total: Number(e.total) || 0,
    };
  }, [earningOverview]);

  const chartStyle = useMemo(() => {
    const sum = viaCall + viaChat;
    if (sum <= 0) {
      return { background: "conic-gradient(#E8E4EC 0deg 360deg)" };
    }
    const callDeg = (viaCall / sum) * 360;
    return {
      background: `conic-gradient(#E66344 0deg ${callDeg}deg, #F1E54A ${callDeg}deg 360deg)`,
    };
  }, [viaCall, viaChat]);

  return (
    <section className="flex min-h-[220px] flex-col rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-[#1a1a1a]">{t("earningOverview") || "Earning Overview"}</h2>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex flex-wrap items-center gap-2 text-[#555]">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#E66344]" />
              <span>{t("viaCall") || "Via Call"}</span>
              <span className="font-semibold text-[#1a1a1a]">{isLoading ? "..." : formatInr(viaCall)}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[#555]">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#F1E54A]" />
              <span>{t("viaChat") || "Via Chat"}</span>
              <span className="font-semibold text-[#1a1a1a]">{isLoading ? "..." : formatInr(viaChat)}</span>
            </div>
          </div>
        </div>

        <div className="relative mt-1 h-36 w-36 shrink-0">
          <div className="h-full w-full rounded-full" style={chartStyle} />
          <div className="absolute inset-5 flex items-center justify-center rounded-full bg-white text-center">
            <div>
              <p className="text-sm text-[#555]">{t("total") || "Total"}</p>
              <p className="text-3xl font-bold text-[#1a1a1a]">{isLoading ? "..." : formatInr(total)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 border-t border-[#ECE7EF] pt-4 text-sm">
        <div className="flex items-center justify-between py-1 text-[#3A3A3A]">
          <span>{t("grossEarnings") || "Gross Earnings"}</span>
          <span>{isLoading ? "..." : formatInr(gross)}</span>
        </div>
        <div className="flex items-center justify-between py-1 text-[#3A3A3A]">
          <span>{t("deductions") || "Deductions"}</span>
          <span className="text-[#B55A52]">{isLoading ? "..." : `- ${formatInr(deductions)}`}</span>
        </div>
        <div className="flex items-center justify-between py-1 font-semibold text-[#1a1a1a]">
          <span>{t("netEarnings") || "Net Earnings"}</span>
          <span className="text-[#189D41]">{isLoading ? "..." : formatInr(netEarnings)}</span>
        </div>
      </div>
    </section>
  );
};

export default EarningOverview;
