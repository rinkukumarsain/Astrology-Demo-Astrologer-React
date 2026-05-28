"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { fetchSessions } from "@/redux/slices/dashboardSlice";
import { getBackendImageUrl } from "@/lib/getBackendImageUrl";

const FILTERS = [
  { id: "all", labelKey: "all", label: "All" },
  { id: "chat", labelKey: "chats", label: "Chats" },
  { id: "audio", labelKey: "audioCall", label: "Audio Calls" },
  { id: "video", labelKey: "videoCall", label: "Video" },
];

function formatInr(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "\u20B90";
  return `\u20B9${n.toLocaleString("en-IN", { maximumFractionDigits: 2, minimumFractionDigits: n % 1 ? 2 : 0 })}`;
}

function getModeFromCallType(callType) {
  const raw = String(callType || "").toLowerCase();
  if (raw.includes("video")) return "video";
  if (raw.includes("audio") || raw.includes("voice") || raw.includes("call")) return "audio";
  return "chat";
}

function getTypeLabelKey(mode) {
  if (mode === "video") return "videoCall";
  if (mode === "audio") return "audioCall";
  return "chat";
}

function capitalizeLabel(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function AvatarIcon({ avatar }) {
  return (
    <span
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
      style={{ backgroundColor: avatar?.bg || "#E6E6E6", color: avatar?.color || "#6B7280" }}
      aria-hidden
    >
      {avatar?.text || "U"}
    </span>
  );
}

function ModeIcon({ mode }) {
  const common = "h-3.5 w-3.5 text-[#777]";

  if (mode === "chat") {
    return (
      <svg className={common} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" />
      </svg>
    );
  }

  if (mode === "audio") {
    return (
      <svg className={common} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 11.2 19 19.4 19.4 0 0 1 5.2 13 19.8 19.8 0 0 1 2 4.3 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.6a2 2 0 0 1-.4 2L8 9.6a16 16 0 0 0 6.4 6.4l1.3-1.3a2 2 0 0 1 2-.4c.8.3 1.7.6 2.6.7A2 2 0 0 1 22 16.9Z" />
      </svg>
    );
  }

  return (
    <svg className={common} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4Z" />
    </svg>
  );
}

export default function SessionsPage() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("all");
  const sessionsState = useSelector((state) => state.dashboard.sessions);
  const [currentPage, setCurrentPage] = useState(1);

  const isLoading = sessionsState.loading;
  const error = sessionsState.error;
  const totalPages = sessionsState.totalPages || 1;
  const totalCount = sessionsState.totalCount || 0;

  useEffect(() => {
    void dispatch(fetchSessions({ page: currentPage, limit: 10 }));
  }, [currentPage, dispatch]);

  const getSessionTypeLabel = (item) => t(item.typeKey) || item.type;

  const getSubtitleLabel = (item) => {
    const meta = item.subtitleMeta || {};
    if (meta.kind === "missed") {
      return `${t("chatEndedByUser") || "Missed"} · ${meta.value} ${t("ago") || "ago"}`;
    }
    if (meta.kind === "messages") {
      return `${meta.value} ${t("chats") || "messages"} · ${meta.time}`;
    }
    if (meta.kind === "duration") {
      return `${meta.value} · ${meta.timeAgo} ${t("ago") || "ago"}`;
    }
    if (meta.kind === "durationAt") {
      return `${meta.value} · ${meta.time}`;
    }
    return "";
  };

  const groups = useMemo(() => {
    const byDay = sessionsState.data && typeof sessionsState.data === "object" ? sessionsState.data : {};
    return Object.entries(byDay)
      .map(([day, entries]) => {
        const source = Array.isArray(entries) ? entries : [];
        const mappedItems = source
          .map((entry, index) => {
            const mode = getModeFromCallType(entry?.callType);
            const user = entry?.user && typeof entry.user === "object" ? entry.user : {};
            const name = user?.name || "Unknown user";
            const image = getBackendImageUrl(user?.image);
            return {
              id: entry?._id || `${day}-${index}`,
              name,
              typeKey: getTypeLabelKey(mode),
              type: entry?.callType || mode,
              amount: formatInr(entry?.chargeAmount),
              subtitleMeta: { kind: "durationAt", value: entry?.duration || "0", time: entry?.timeAgo || "" },
              mode,
              avatar: { text: name.slice(0, 1).toUpperCase(), bg: "#ECEDEF", color: "#5C6470", image },
            };
          })
          .filter((item) => {
            if (activeFilter === "all") return true;
            if (activeFilter === "chat") return item.mode === "chat";
            if (activeFilter === "audio") return item.mode === "audio";
            return item.mode === "video";
          });
        return {
          dayKey: day.toLowerCase(),
          day: capitalizeLabel(day),
          interactionsCount: mappedItems.length,
          items: mappedItems,
        };
      })
      .filter((group) => group.items.length > 0);
  }, [activeFilter, sessionsState.data]);

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((filter) => {
          const selected = activeFilter === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              className={[
                "inline-flex h-8 cursor-pointer items-center rounded-full border px-3 text-xs font-medium transition-colors",
                selected
                  ? "border-[#E86C45] bg-[#E86C45] text-white"
                  : "border-[#E3DEE7] bg-white text-[#5D5D5D] hover:border-[#D2CBD8]",
              ].join(" ")}
            >
              {t(filter.labelKey) || filter.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
        {error ? <div className="mb-3 rounded-xl bg-[#FFF1F1] px-4 py-3 text-sm text-[#B42318]">{error}</div> : null}
        {groups.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#DDD4DE] bg-white px-4 py-8 text-center text-sm text-[#777]">
            {isLoading ? "Loading sessions..." : t("noSessionsFound") || "No sessions found"}
          </div>
        ) : (
          <div className="space-y-7">
            {groups.map((group) => (
              <div key={group.day}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-lg font-semibold text-[#1F1F1F]">{t(group.dayKey) || group.day}</p>
                  {group.interactionsCount ? (
                    <span className="text-[10px] font-semibold tracking-wide text-[#8A7B61]">{`${group.interactionsCount} ${t("consultations") || "INTERACTIONS"}`}</span>
                  ) : null}
                </div>
                <div className="space-y-2">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        router.push(
                          `/session-details?id=${encodeURIComponent(item.id)}`,
                        )
                      }
                      className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border border-[#EEE6ED] bg-white px-3.5 py-3 text-left shadow-sm transition-colors hover:border-[#E2D8E3]"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        {item.avatar?.image ? (
                          <span className="inline-flex h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#E6E6E6]">
                            <img src={item.avatar.image} alt={item.name} className="h-full w-full object-cover" />
                          </span>
                        ) : (
                          <AvatarIcon avatar={item.avatar} />
                        )}
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-[#242424]">{item.name}</span>
                          <span className="mt-0.5 flex items-center gap-1 text-xs text-[#757575]">
                            <ModeIcon mode={item.mode} />
                            <span>{getSubtitleLabel(item)}</span>
                          </span>
                        </span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="flex items-center justify-end gap-1 text-xs text-[#5E5E5E]">
                          <ModeIcon mode={item.mode} />
                          <span>{getSessionTypeLabel(item)}</span>
                        </span>
                        <span className="mt-1 block text-xs font-semibold text-[#707070]">{item.amount}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm text-[#5D5D5D]">
        <span>{`Total: ${totalCount}`}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isLoading || currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="rounded-md border border-[#E3DEE7] px-2.5 py-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Prev
          </button>
          <span>{`Page ${currentPage} / ${totalPages}`}</span>
          <button
            type="button"
            disabled={isLoading || currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-md border border-[#E3DEE7] px-2.5 py-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
