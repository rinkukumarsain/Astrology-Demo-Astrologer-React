"use client";

import React from "react";
import EmptyState from "@/components/common/EmptyState";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

function formatInr(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "\u20B90";
  return `\u20B9${x.toLocaleString("en-IN", { maximumFractionDigits: 2, minimumFractionDigits: x % 1 ? 2 : 0 })}`;
}

function formatDate(raw) {
  if (!raw) return "-";
  const dt = new Date(raw);
  if (Number.isNaN(dt.getTime())) return String(raw);
  return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function PayoutEmptyIcon() {
  return (
    <svg className="h-5 w-5" width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 6.5A2.5 2.5 0 0 1 5.5 4h13A2.5 2.5 0 0 1 21 6.5v9A2.5 2.5 0 0 1 18.5 18h-13A2.5 2.5 0 0 1 3 15.5v-9Zm2 0v9c0 .3.2.5.5.5h13c.3 0 .5-.2.5-.5v-9c0-.3-.2-.5-.5-.5h-13c-.3 0-.5.2-.5.5Zm2.5 2.5h9v2h-9V9Zm0 3.5h6v2h-6v-2Z" />
    </svg>
  );
}

const RecentPayouts = () => {
  const { t } = useTranslation();
  const payoutHistoryState = useSelector((state) => state.dashboard.payoutHistory);
  const payoutData = payoutHistoryState.data || {};
  const recentPayouts = Array.isArray(payoutData.recentPayouts) ? payoutData.recentPayouts : [];
  const isLoading = payoutHistoryState.loading;

  return (
    <section className="flex min-h-[220px] flex-col rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-[#1a1a1a]">{t("recentPayouts") || "Recent payouts"}</h2>
      {isLoading ? <p className="mt-4 text-sm text-[#7A7A7A]">Loading payouts...</p> : null}
      {!isLoading && recentPayouts.length === 0 ? (
        <EmptyState
          className="mt-4"
          title={t("noPayoutsAvailableThisMonth") || "No payouts available"}
          text={t("noPayoutsAvailable") || "Completed payout requests and transfers will appear in this section."}
          icon={<PayoutEmptyIcon />}
        />
      ) : null}
      {!isLoading && recentPayouts.length > 0 ? (
        <div className="mt-4 space-y-2">
          {recentPayouts.map((item, index) => {
            const id = item?._id || item?.id || `payout-${index}`;
            const amount = item?.amount ?? item?.payoutAmount ?? item?.netAmount;
            const date = item?.createdAt ?? item?.date ?? item?.paidAt;
            const status = item?.status || "completed";
            return (
              <div key={id} className="flex items-center justify-between rounded-xl border border-[#EEE8F0] bg-[#FCFBFD] px-3 py-2.5">
                <div>
                  <p className="text-sm font-semibold text-[#1a1a1a]">{formatInr(amount)}</p>
                  <p className="text-xs text-[#7A7A7A]">{formatDate(date)}</p>
                </div>
                <span className="rounded-full bg-[#EAF8EF] px-2.5 py-1 text-xs font-medium capitalize text-[#0E8A3A]">{status}</span>
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
};

export default RecentPayouts;
