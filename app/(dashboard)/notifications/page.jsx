"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { fetchNotifications, markNotificationsRead } from "@/redux/slices/notificationSlice";

const PAGE_LIMIT = 10;
const SECTION_CONFIG = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "older", label: "Older" },
];

function getNotificationId(item, fallbackIndex) {
  return item?._id || item?.id || `${item?.createdAt || "item"}-${fallbackIndex}`;
}

function formatTime(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";
  const now = Date.now();
  const diffMs = Math.max(0, now - date.getTime());
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diffMs < minute) return "just now";
  if (diffMs < hour) return `${Math.floor(diffMs / minute)} min ago`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)} hours ago`;
  return `${Math.floor(diffMs / day)} days ago`;
}

function NotifIcon() {
  return (
    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FFF6D9]">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#E5DBC0] bg-white">
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-[#6A5D33]">
          <path d="M6.8 9a5.2 5.2 0 1 1 10.4 0v4.2l1.7 2.3a.9.9 0 0 1-.7 1.5H5.8a.9.9 0 0 1-.7-1.5l1.7-2.3V9Z" />
          <path d="M10 19a2 2 0 0 0 4 0" />
        </svg>
      </span>
    </span>
  );
}

export default function NotificationsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { list, loading, error, pagination, unreadCount } = useSelector((state) => state.notifications);
  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.totalPages || 1;
  const totalItems = pagination?.total || 0;

  useEffect(() => {
    void dispatch(markNotificationsRead()).finally(() => {
      void dispatch(fetchNotifications({ page: 1, limit: PAGE_LIMIT }));
    });
  }, [dispatch]);

  const hasNotifications = Boolean(list?.today?.length || list?.yesterday?.length || list?.older?.length);

  const handlePageChange = (nextPage) => {
    if (nextPage === currentPage || nextPage < 1 || nextPage > totalPages || loading) return;
    void dispatch(fetchNotifications({ page: nextPage, limit: PAGE_LIMIT }));
  };

  const handleNotificationClick = (item) => {
    if (item.redirectType === "NEW_REVIEW" && item.sessionId) {
      router.push(`/session-details?id=${item.sessionId}`);
    }
  };

  return (
    <section className="space-y-3">
      {/* <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
        <h1 className="text-lg font-semibold text-[#1F1F1F]">Notifications</h1>
        <p className="text-xs font-medium text-[#6F6F6F]">Unread: {unreadCount}</p>
      </div> */}

      {error ? (
        <div className="rounded-xl bg-[#FFF1F1] px-4 py-3 text-sm text-[#B42318]">{error}</div>
      ) : null}

      {!loading && !hasNotifications ? (
        <div className="rounded-xl bg-white px-4 py-8 text-center text-sm text-[#7A7A7A] shadow-sm">No notifications found.</div>
      ) : null}

      {SECTION_CONFIG.map((section) => {
        const items = list?.[section.key] || [];
        if (!items.length) return null;
        return (
          <div key={section.key}>
            <h2 className="mb-3 text-sm font-semibold text-[#3C3C3C]">{section.label}</h2>
            <div>
              {items.map((item, index) => (
                <article
                  key={getNotificationId(item, index)}
                  onClick={() => handleNotificationClick(item)}
                  className={`mb-3 flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm transition-colors ${item.redirectType === "NEW_REVIEW" ? "cursor-pointer hover:bg-gray-50" : ""}`}
                >
                  <NotifIcon />
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold text-[#262626]">{item?.title || "Notification"}</p>
                    <p className="truncate text-sm text-[#7A7A7A]">{item?.body || item?.message || "-"}</p>
                  </div>
                  <p className="shrink-0 text-xs text-[#9B9B9B]">{formatTime(item?.createdAt)}</p>
                </article>
              ))}
            </div>
          </div>
        );
      })}

      <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
        <p className="text-sm text-[#6F6F6F]">
          Page {currentPage} of {totalPages} | Total {totalItems}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={loading || currentPage <= 1}
            className="rounded-lg border border-[#E4E4E7] px-3 py-1.5 text-sm text-[#3F3F46] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={loading || currentPage >= totalPages}
            className="rounded-lg border border-[#E4E4E7] px-3 py-1.5 text-sm text-[#3F3F46] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl bg-white px-4 py-3 text-sm text-[#7A7A7A] shadow-sm">Loading notifications...</div>
      ) : null}
    </section>
  );
}
