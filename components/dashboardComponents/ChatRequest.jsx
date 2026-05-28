"use client";

import React, { useEffect, useMemo } from "react";
import Image from "next/image";
import EmptyState from "@/components/common/EmptyState";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { fetchPendingChatRequests } from "@/redux/slices/dashboardSlice";
import { setActiveChat, setConnectionStatus, removeIncomingRequest } from "@/redux/slices/chatSlice";
import { emitAcceptConnection } from "@/lib/socketService";
import { getChatId } from "@/utils/chatHelpers";
import { getBackendImageUrl } from "@/lib/getBackendImageUrl";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

function ChatEmptyIcon() {
  return (
    <svg className="h-5 w-5" width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z" />
    </svg>
  );
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

const ChatRequest = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { t } = useTranslation();
  const profile = useSelector((state) => state.dashboard.profile.data);
  const pendingState = useSelector((state) => state.dashboard.pendingChatRequests);
  const activeChat = useSelector((state) => state.chat.activeChat);
  const socketRequests = useSelector((state) => state.chat.incomingRequests);
  const isLoading = pendingState.loading;
  const error = pendingState.error;

  const list = useMemo(() => {
    const apiList = Array.isArray(pendingState.data) ? pendingState.data : [];
    
    // Map API list to a standard format
    const formattedApiList = apiList.map(item => {
      const user = item?.user || item?.userProfile || {};
      let id = item?.userId || user?._id || user?.id || item?._id;
      if (typeof id === 'object' && id !== null) {
        id = id._id || id.id;
      }
      return {
        _id: item?._id || `api-${id}`,
        userId: String(id),
        userName: user?.name || "User",
        userImage: user?.image || null,
        timestamp: item?.createdAt || item?.timestamp,
        original: item, // Keep original for handleAccept
      };
    });

    // Merge socket requests
    const merged = [...formattedApiList];
    
    socketRequests.forEach(sockReq => {
      const exists = merged.find(m => String(m.userId) === String(sockReq.userId));
      if (!exists) {
        merged.unshift({
          _id: `sock-${sockReq.userId}`,
          userId: sockReq.userId,
          userName: sockReq.userName || "User",
          userImage: sockReq.userImage || null,
          timestamp: sockReq.timestamp || new Date().toISOString(),
          original: sockReq, // Pass socket request
        });
      }
    });

    // Sort by newest first
    return merged.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [pendingState.data, socketRequests]);

  useEffect(() => {
    if (pendingState.loading || pendingState.loaded) return;
    void dispatch(fetchPendingChatRequests());
  }, [dispatch, pendingState.loaded, pendingState.loading]);

  const handleAccept = (item) => {
    const original = item.original || item;
    let userId = original?.user?._id || original?.userId?._id || original?.userId || original?._id;
    if (typeof userId === "object") {
      userId = userId?._id || userId?.id;
    }
    // Fallback to the merged userId if original is malformed
    if (!userId) userId = item.userId;

    const userName = item.userName || "User";
    const userImage = item.userImage || null;
    const astrologerId = original?.astrologerId || profile?._id || profile?.id;

    if (!userId || typeof userId !== "string") {
      toast.error("Invalid chat request: missing user ID");
      return;
    }

    const chatId = getChatId(astrologerId, userId);

    // Remove from Redux incoming requests list
    dispatch(removeIncomingRequest(userId));

    // Set active chat in Redux and mark connected immediately
    // (astrologer is accepting, so connection is confirmed from our side)
    dispatch(setActiveChat({ userId, userName, userImage, chatId, astrologerId }));
    dispatch(setConnectionStatus("connected"));

    // Emit accept_connection via socket
    emitAcceptConnection(userId);

    // Navigate to chat page
    router.push(`/chat/${chatId}`);
  };

  return (
    <section className="flex flex-col rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-[#1a1a1a]">{t("chatRequests") || "Chat Requests"}</h2>
      {isLoading && list.length === 0 ? <p className="text-sm text-[#7A7A7A]">Loading chat requests...</p> : null}
      {error && list.length === 0 ? <p className="mb-3 text-sm text-[#B42318]">{error}</p> : null}
      {!isLoading && !error && list.length === 0 ? (
        <EmptyState
          title={t("noRequestAvailable") || "No chat requests yet"}
          text={t("noRequestsYet") || "You will see incoming chat requests here when users connect with you."}
          icon={<ChatEmptyIcon />}
        />
      ) : null}
      {list.length > 0 ? (
        <div className="space-y-3">
          {list.map((item, index) => {
            const name = item.userName;
            const imageUrl = getBackendImageUrl(item.userImage);
            const timeText = formatTime(item.timestamp);
            const id = item._id || `chat-req-${index}`;
            const itemUserId = item.userId;
            const isAccepting = activeChat.isActive && activeChat.userId === itemUserId;
            return (
              <article key={id} className="flex items-center justify-between gap-3 rounded-xl border border-[#EEE8F0] bg-[#FCFBFD] px-3 py-2.5">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[#E8E0ED] bg-[#F7F4FA]">
                    {imageUrl ? (
                      <Image src={imageUrl} alt={name} width={40} height={40} unoptimized className="h-full w-full object-cover" />
                    ) : (
                      <span className="m-auto text-xs font-semibold text-[#7A6A86]">{name.slice(0, 1).toUpperCase()}</span>
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#1a1a1a]">{name}</p>
                    <p className="truncate text-xs text-[#7A7A7A]">{timeText}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleAccept(item)}
                    disabled={isAccepting || activeChat.isActive}
                    className={[
                      "rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90",
                      (isAccepting || activeChat.isActive) ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                    ].join(" ")}
                  >
                    {isAccepting ? "Connecting..." : "Accept"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
};

export default ChatRequest;
