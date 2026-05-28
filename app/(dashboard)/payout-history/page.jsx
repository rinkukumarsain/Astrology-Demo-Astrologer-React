"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPayoutHistory } from "@/redux/slices/dashboardSlice";
import EmptyState from "@/components/common/EmptyState";

const MONTH_OPTIONS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

function getMonthDateRange(year, month) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  const startDate = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
  const endDate = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`;
  return { startDate, endDate };
}

function formatInr(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "\u20B90";
  return `\u20B9${x.toLocaleString("en-IN", { maximumFractionDigits: 2, minimumFractionDigits: x % 1 ? 2 : 0 })}`;
}

function formatDate(raw) {
  if (!raw) return "-";
  const dt = new Date(raw);
  if (Number.isNaN(dt.getTime())) return String(raw);
  return dt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function getStatusTone(status) {
  const s = String(status || "").toLowerCase();
  if (s === "completed" || s === "success") return "text-[#16A34A]";
  if (s === "pending") return "text-[#D97706]";
  return "text-[#9CA3AF]";
}

function PayoutEmptyIcon() {
  return (
    <svg className="h-5 w-5" width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 6.5A2.5 2.5 0 0 1 5.5 4h13A2.5 2.5 0 0 1 21 6.5v9A2.5 2.5 0 0 1 18.5 18h-13A2.5 2.5 0 0 1 3 15.5v-9Zm2 0v9c0 .3.2.5.5.5h13c.3 0 .5-.2.5-.5v-9c0-.3-.2-.5-.5-.5h-13c-.3 0-.5.2-.5.5Zm2.5 2.5h9v2h-9V9Zm0 3.5h6v2h-6v-2Z" />
    </svg>
  );
}

export default function PayoutHistoryPage() {
  const dispatch = useDispatch();
  const payoutHistoryState = useSelector((state) => state.dashboard.payoutHistory);
  const payoutData = payoutHistoryState.data || {};
  const isLoading = payoutHistoryState.loading;
  const error = payoutHistoryState.error;

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const yearOptions = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 16 }, (_, i) => current - i);
  }, []);

  const selectedMonthLabel = MONTH_OPTIONS.find((item) => item.value === month)?.label || "Month";
  const range = useMemo(() => getMonthDateRange(year, month), [year, month]);

  useEffect(() => {
    void dispatch(fetchPayoutHistory(range));
  }, [dispatch, range]);

  const payouts = useMemo(() => {
    const source = payoutData?.recentPayouts || payoutData?.payouts || payoutData?.history || payoutData?.list || [];
    if (!Array.isArray(source)) return [];
    return source;
  }, [payoutData]);

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm md:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#F0ECF4] pb-4">
        <h1 className="text-lg font-semibold text-[#1F1F1F]">Payout History</h1>
        <div className="flex items-center gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="h-9 rounded-lg border border-[#E0DCE4] px-2 text-sm text-[#3A3A3A] outline-none"
          >
            {MONTH_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="h-9 rounded-lg border border-[#E0DCE4] px-2 text-sm text-[#3A3A3A] outline-none"
          >
            {yearOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? <p className="py-2 text-sm text-[#7A7A7A]">Loading payout history...</p> : null}
      {error ? <p className="py-2 text-sm text-[#B42318]">{error}</p> : null}

      {!isLoading && !error && payouts.length === 0 ? (
        <EmptyState
          className="mt-2"
          title="No payout records found"
          text="Completed payout requests and transfers will appear in this section."
          icon={<PayoutEmptyIcon />}
        />
      ) : null}

      {!isLoading && !error && payouts.length > 0 ? (
        <div className="space-y-1">
          {payouts.map((item, index) => {
            const id = item?._id || item?.id || `payout-row-${index}`;
            const amount = item?.amount ?? item?.payoutAmount ?? item?.netAmount ?? item?.totalAmount;
            const date = item?.createdAt ?? item?.date ?? item?.paidAt ?? item?.updatedAt;
            const status = item?.status || "pending";
            return (
              <article key={id} className="flex items-center justify-between gap-3 border-b border-[#F5F1F7] py-3 last:border-b-0">
                <div>
                  <p className="text-lg font-semibold text-[#1F1F1F]">{formatInr(amount)}</p>
                  <p className="text-xs text-[#7A7A7A]">{formatDate(date)}</p>
                </div>
                <p className={`text-sm font-medium capitalize ${getStatusTone(status)}`}>{status}</p>
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
