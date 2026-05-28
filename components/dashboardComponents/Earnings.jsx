"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { fetchPayoutHistory } from "@/redux/slices/dashboardSlice";

const MONTH_OPTIONS = [
  { value: 1, label: "Jan" },
  { value: 2, label: "Feb" },
  { value: 3, label: "Mar" },
  { value: 4, label: "Apr" },
  { value: 5, label: "May" },
  { value: 6, label: "Jun" },
  { value: 7, label: "Jul" },
  { value: 8, label: "Aug" },
  { value: 9, label: "Sep" },
  { value: 10, label: "Oct" },
  { value: 11, label: "Nov" },
  { value: 12, label: "Dec" },
];

function daysInMonth(year, month1Based) {
  return new Date(year, month1Based, 0).getDate();
}

function formatWeekRangeUk(year, month1Based, startIdx0) {
  const start = new Date(year, month1Based - 1, startIdx0 + 1);
  const end = new Date(year, month1Based - 1, startIdx0 + 7);
  const opts = { day: "numeric", month: "short" };
  return `${start.toLocaleDateString("en-GB", opts)} - ${end.toLocaleDateString("en-GB", opts)}`;
}

function formatInr(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "₹0";
  return `₹${x.toLocaleString("en-IN", { maximumFractionDigits: 2, minimumFractionDigits: x % 1 ? 2 : 0 })}`;
}

const Earnings = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const payoutHistoryState = useSelector((state) => state.dashboard.payoutHistory);
  const payoutData = payoutHistoryState.data || {};
  const earnings = payoutData.earnings || {};
  const isLoading = payoutHistoryState.loading;
  const calendarWrapRef = useRef(null);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [weekStartIdx, setWeekStartIdx] = useState(0);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    if (!isCalendarOpen) return undefined;
    const handleOutside = (event) => {
      if (!calendarWrapRef.current) return;
      if (!calendarWrapRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isCalendarOpen]);

  const yearOptions = useMemo(() => {
    const current = new Date().getFullYear();
    // Show only current and past years (no future years).
    return Array.from({ length: 16 }, (_, i) => current - i);
  }, []);

  const dim = daysInMonth(year, month);
  const maxWeekStart = Math.max(0, dim - 7);

  const rangeDates = useMemo(() => {
    const startDay = Math.min(dim, weekStartIdx + 1);
    const endDay = Math.min(dim, weekStartIdx + 7);
    const startDate = `${year}-${String(month).padStart(2, "0")}-${String(startDay).padStart(2, "0")}`;
    const endDate = `${year}-${String(month).padStart(2, "0")}-${String(endDay).padStart(2, "0")}`;
    return { startDate, endDate };
  }, [dim, month, weekStartIdx, year]);

  useEffect(() => {
    void dispatch(fetchPayoutHistory(rangeDates));
  }, [dispatch, rangeDates]);

  const dailyBreakdown = Array.isArray(earnings?.dailyBreakdown) ? earnings.dailyBreakdown : [];
  const weekSlice = {
    slice: Array.from({ length: 7 }, (_, i) => Number(dailyBreakdown[i]?.amount) || 0),
    start: Math.min(weekStartIdx, maxWeekStart),
    dailyBreakdown,
  };

  const weekLabels = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => weekSlice.dailyBreakdown[i]?.day || ["M", "T", "W", "T", "F", "S", "S"][i]);
  }, [weekSlice.dailyBreakdown]);

  const barMax = useMemo(() => Math.max(1, ...weekSlice.slice), [weekSlice.slice]);
  const rangeLabel = earnings?.dateRange || formatWeekRangeUk(year, month, weekSlice.start);
  const totalEarned = Number(earnings?.total) || 0;
  const percentageChange = String(earnings?.percentageChange || "0.00%");

  const handleApplyCalendar = () => {
    setIsCalendarOpen(false);
    setWeekStartIdx(0);
    setMonth(selectedMonth);
    setYear(selectedYear);
  };

  return (
    <section className="flex flex-col rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-[#1a1a1a]">{t("earnings") || "Earnings"}</h2>
        <div ref={calendarWrapRef} className="relative flex items-center gap-2 text-sm text-[#555]">
          <button
            type="button"
            className="cursor-pointer p-1 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous week"
            disabled={weekSlice.start <= 0 || isLoading}
            onClick={() => setWeekStartIdx((s) => Math.max(0, s - 7))}
          >
            ‹
          </button>
          <span className="min-w-34 text-center">{isLoading ? "…" : rangeLabel}</span>
          <button
            type="button"
            className="cursor-pointer p-1 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next week"
            disabled={weekSlice.start >= maxWeekStart || isLoading}
            onClick={() => setWeekStartIdx((s) => Math.min(maxWeekStart, s + 7))}
          >
            ›
          </button>

          <button
            type="button"
            onClick={() => setIsCalendarOpen((prev) => !prev)}
            className="ml-1 cursor-pointer rounded-lg border border-[#E0DCE4] p-2"
            aria-label="Open month and year selector"
            title={`${String(month).padStart(2, "0")}/${year}`}
          >
            <svg className="h-4 w-4" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M16 3v4M8 3v4M3 11h18" />
            </svg>
          </button>

          {isCalendarOpen ? (
            <div className="absolute right-0 top-[calc(100%+8px)] z-20 w-56 rounded-xl border border-[#E6DFEA] bg-white p-3 shadow-lg">
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#555]">Month</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="h-9 w-full rounded-lg border border-[#D9D2DE] px-2 text-sm outline-none"
                  >
                    {MONTH_OPTIONS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#555]">Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="h-9 w-full rounded-lg border border-[#D9D2DE] px-2 text-sm outline-none"
                  >
                    {yearOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMonth(month);
                      setSelectedYear(year);
                      setIsCalendarOpen(false);
                    }}
                    className="rounded-lg border border-[#D9D2DE] px-3 py-1.5 text-xs font-medium text-[#4C4453]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyCalendar}
                    className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex min-h-[280px] flex-col rounded-xl border border-[#ECE7EF] bg-[#FAFAFC] px-3 pb-3 pt-2">
        <div className="flex flex-1 items-end justify-between gap-1 border-b border-[#E8E4EC] pb-1 pt-4">
          {weekSlice.slice.map((v, i) => (
            <div key={i} className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <div className="flex h-[100px] w-full items-end justify-center">
                <div
                  className="w-[42%] min-w-[6px] max-w-[28px] rounded-t-md bg-primary/85"
                  style={{ height: `${v <= 0 ? 4 : Math.max(8, Math.round((v / barMax) * 96))}px` }}
                  title={`${v}`}
                />
              </div>
              <span className="text-[11px] font-medium uppercase text-[#777]">{weekLabels[i]}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap justify-end gap-x-6 gap-y-1 text-xs text-[#555]">
          <span>
            {t("totalEarnings") || "Total Earnings"}: <strong className="text-[#1a1a1a]">{isLoading ? "…" : formatInr(totalEarned)}</strong>
          </span>
          {/* <span>
            {t("weeklyPayout") || "Weekly payout"}: <strong className="text-[#1a1a1a]">{isLoading ? "…" : percentageChange}</strong>
          </span> */}
        </div>
      </div>
    </section>
  );
};

export default Earnings;

