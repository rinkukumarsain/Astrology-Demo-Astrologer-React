"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  serverTimestamp,
  where,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/utils/firebase";
import { getChatId, formatChatTime, getDateLabel, formatTimer } from "@/utils/chatHelpers";
import { useSelector, useDispatch } from "react-redux";
import { clearActiveChat } from "@/redux/slices/chatSlice";
import { fetchPendingChatRequests, fetchDashboardProfile, fetchDashboardAnalytics, fetchDailyStats } from "@/redux/slices/dashboardSlice";
import { authenticate, emitEndConnection, emitChatMessage, onUserDecidingContinuation, onUserContinuedChat } from "@/lib/socketService";
import { getCookie } from "@/lib/clientHelpers";
import { AUTH_TOKEN_KEY } from "@/constants/others";
import { Send, Timer, ArrowLeft, Check, CheckCheck } from "lucide-react";
import EndChatModal from "@/components/common/EndChatModal";
import UserDecidingModal from "@/components/common/UserDecidingModal";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";
import { getBackendImageUrl } from "@/lib/getBackendImageUrl";
import { socketEventMatchesActiveChat } from "@/lib/socketEventGuards";

const AstrologerChatScreen = ({ urlChatId }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const activeChat = useSelector((state) => state.chat.activeChat);
  const profile = useSelector((state) => state.dashboard.profile.data);

  const astrologerId = activeChat.astrologerId || profile?._id || profile?.id;
  const userId = activeChat.userId;
  const userName = activeChat.userName || "User";
  const userImage = activeChat.userImage;
  const chatId = urlChatId || activeChat.chatId || (astrologerId && userId ? getChatId(astrologerId, userId) : null);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isEndChatModalOpen, setIsEndChatModalOpen] = useState(false);
  const [isUserDecidingModalOpen, setIsUserDecidingModalOpen] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [chatReady, setChatReady] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const bottomRef = useRef(null);
  const timerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Redirect if no active chat
  useEffect(() => {
    if (urlChatId && activeChat.chatId && urlChatId !== activeChat.chatId) {
      router.replace(`/chat/${activeChat.chatId}`);
      return;
    }

    if (!activeChat.isActive || !userId) {
      router.replace("/");
    }
  }, [activeChat.chatId, activeChat.isActive, urlChatId, userId, router]);

  // Prevent back navigation — show End Chat modal instead
  useEffect(() => {
    if (!chatId) return;

    const guardedChatUrl = `/chat/${chatId}`;

    const handlePopState = () => {
      window.history.pushState({ chatLocked: true }, "", guardedChatUrl);
      setIsEndChatModalOpen(true);
    };

    window.history.pushState({ chatLocked: true }, "", guardedChatUrl);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [chatId]);

  // Count-up timer
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeChat.connectionStatus === "connected" && activeChat.startedAt) {
        const startedAtTime = new Date(activeChat.startedAt).getTime();

        if (Number.isNaN(startedAtTime)) return;
        setElapsedSeconds((currentValue) => (
          currentValue > 0
            ? currentValue
            : Math.max(0, Math.floor((Date.now() - startedAtTime) / 1000))
        ));
      } else {
        setElapsedSeconds(0);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [activeChat.connectionStatus, activeChat.startedAt]);

  useEffect(() => {
    if (activeChat.connectionStatus === "connected" && activeChat.startedAt) {

      // Only run interval if not paused by the deciding modal
      if (!isUserDecidingModalOpen) {
        timerRef.current = setInterval(() => {
          setElapsedSeconds((prev) => prev + 1);
        }, 1000);
      }

      return () => clearInterval(timerRef.current);
    }
  }, [activeChat.connectionStatus, activeChat.startedAt, isUserDecidingModalOpen]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (chatId) {
        updateDoc(doc(db, "chats", chatId), { astroTyping: false }).catch((err) =>
          console.error("Error clearing typing status on cleanup:", err)
        );
      }
    };
  }, [chatId]);

  // Handle end chat
  const handleEndChat = () => {
    setIsEndChatModalOpen(false);

    // Emit end_connection via socket
    emitEndConnection(userId, astrologerId);

    // Clear active chat from Redux FIRST (before re-authenticating,
    // so SocketProvider's onAuthenticationSuccess won't re-emit accept_connection)
    dispatch(clearActiveChat());

    // Refresh pending chat requests
    dispatch(fetchPendingChatRequests());

    // Refresh dashboard data (balance, earnings, stats)
    const now = new Date();
    dispatch(fetchDashboardProfile());
    dispatch(fetchDailyStats());
    dispatch(fetchDashboardAnalytics({ month: now.getMonth() + 1, year: now.getFullYear() }));

    toast.success("Chat ended");
    router.replace("/");

    // Re-authenticate socket AFTER clearActiveChat has propagated,
    // so the backend resumes sending new connection_request events
    setTimeout(() => {
      const token = getCookie(AUTH_TOKEN_KEY);
      if (token) authenticate(token);
    }, 500);
  };

  // Initialize Firebase chat document
  useEffect(() => {
    if (!chatId || !astrologerId || !userId) return;

    const initChat = async () => {
      try {
        const chatRef = doc(db, "chats", chatId);
        const snap = await getDoc(chatRef);

        if (!snap.exists()) {
          await setDoc(chatRef, {
            participants: [astrologerId, userId],
            lastMessage: "",
            lastMessageTime: serverTimestamp(),
            lastSenderId: "",
          });
        }

        setChatReady(true);
      } catch (err) {
        console.error("Error initializing chat:", err);
        toast.error("Failed to initialize chat");
      }
    };

    initChat();

    // Listen to the main chat document for typing indicators
    const unsubChatDoc = onSnapshot(
      doc(db, "chats", chatId),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setIsUserTyping(Boolean(data.userTyping));
        }
      },
      (err) => {
        console.error("Error listening to chat document:", err);
      }
    );

    return () => unsubChatDoc();
  }, [chatId, astrologerId, userId]);

  // Listen to socket events for partner disconnect and chat events
  useEffect(() => {
    if (!userId || !astrologerId) return;

    const unsubUserDeciding = onUserDecidingContinuation((data) => {
      console.log("[Chat] User is deciding continuation:", data);
      if (socketEventMatchesActiveChat(data, activeChat, profile)) {
        setIsUserDecidingModalOpen(true);
      }
    });

    const unsubUserContinued = onUserContinuedChat((data) => {
      console.log("[Chat] User continued chat:", data);
      if (socketEventMatchesActiveChat(data, activeChat, profile)) {
        const resumedSeconds = Number(
          data?.elapsedSeconds ?? data?.durationSeconds ?? data?.seconds ?? 300
        );
        setIsUserDecidingModalOpen(false);
        setElapsedSeconds(Number.isFinite(resumedSeconds) && resumedSeconds >= 0 ? resumedSeconds : 300);
        toast.success("User continued the chat!");
      }
    });

    return () => {
      unsubUserDeciding();
      unsubUserContinued();
    };
  }, [userId, astrologerId, activeChat, profile]);

  // Listen to messages in real-time
  useEffect(() => {
    if (!chatId || !chatReady) return;

    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const msgs = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        // console.log("[DEBUG] Messages from Firestore:", msgs);
        setMessages(msgs);

        setTimeout(
          () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
          50
        );
      },
      (err) => {
        console.error("Error listening to messages:", err);
        toast.error("Unable to sync chat messages");
      }
    );

    return () => unsub();
  }, [chatId, chatReady]);

  // Mark messages as read (messages sent by the user, received by astrologer)
  useEffect(() => {
    if (!chatId || !astrologerId || !chatReady) return;

    const markAsRead = async () => {
      try {
        const q = query(
          collection(db, "chats", chatId, "messages"),
          where("receiverId", "==", astrologerId),
          where("isRead", "==", false)
        );

        const snapshot = await getDocs(q);
        if (snapshot.empty) return;

        const batch = writeBatch(db);
        snapshot.forEach((msg) => {
          batch.update(doc(db, "chats", chatId, "messages", msg.id), { isRead: true });
        });
        await batch.commit();
      } catch (err) {
        console.error("Error marking messages as read:", err);
      }
    };

    markAsRead();
  }, [chatId, astrologerId, messages, chatReady]);

  // Handle typing indicator
  const handleTyping = (e) => {
    setText(e.target.value);

    if (!chatId || !chatReady) return;

    // Set typing to true
    updateDoc(doc(db, "chats", chatId), { astroTyping: true }).catch((err) =>
      console.error("Error setting typing status:", err)
    );

    // Clear existing timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // Set timeout to false after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      updateDoc(doc(db, "chats", chatId), { astroTyping: false }).catch((err) =>
        console.error("Error clearing typing status:", err)
      );
    }, 3000);
  };

  // Send message
  const sendMessage = async () => {
    if (!text.trim() || !chatId || !astrologerId) return;

    const messageText = text;
    setText("");
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    try {
      const messageData = {
        text: messageText,
        senderId: astrologerId,
        receiverId: userId,
        isRead: false,
        timestamp: serverTimestamp(),
      };

      // Emit via socket for real-time sync INSTANTLY
      emitChatMessage(userId, astrologerId, {
        text: messageText,
        senderId: astrologerId,
        receiverId: userId,
        timestamp: new Date().toISOString(),
      });

      // Save to Firebase in the background (no await)
      addDoc(collection(db, "chats", chatId, "messages"), messageData).catch(err => console.error("Firebase addDoc error:", err));

      updateDoc(doc(db, "chats", chatId), {
        lastMessage: messageText,
        lastMessageTime: serverTimestamp(),
        lastSenderId: astrologerId,
        astroTyping: false,
      }).catch(err => console.error("Firebase updateDoc error:", err));

    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Failed to send message");
      setText(messageText); // Restore text on failure
    }
  };

  const sortedMessages = [...messages].sort((a, b) => {
    return (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0);
  });

  const resolvedUserImage = getBackendImageUrl(userImage);

  if (!activeChat.isActive || !userId) {
    return null;
  }

  return (
    <div className="flex h-dvh flex-col bg-[#fafafa] overflow-hidden">
      {/* HEADER */}
      <div className="flex items-center gap-3 border-b bg-white px-4 py-3">
        <button
          type="button"
          onClick={() => setIsEndChatModalOpen(true)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#666] hover:bg-gray-100 cursor-pointer md:hidden"
          aria-label="Back"
        >
          <ArrowLeft className="size-5" />
        </button>

        <span className="inline-flex h-9 w-9 shrink-0 overflow-hidden rounded-full border border-[#E8E0ED] bg-[#F7F4FA]">
          {resolvedUserImage ? (
            <Image src={resolvedUserImage} alt={userName} width={36} height={36} unoptimized className="h-full w-full object-cover" />
          ) : (
            <span className="m-auto text-xs font-semibold text-[#7A6A86]">
              {userName.slice(0, 1).toUpperCase()}
            </span>
          )}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-gray-800">{userName}</p>
          <p className={`text-xs ${isUserTyping ? 'text-green-600 font-medium' : 'text-[#888]'}`}>
            {isUserTyping ? "typing..." : (activeChat.connectionStatus === "connected" ? "Online" : "Connecting...")}
          </p>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-[#444]">
            <Timer className="size-5 text-primary" />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>
          {/* <button
            onClick={() => setIsEndChatModalOpen(true)}
            className="rounded-lg bg-red-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-600 cursor-pointer"
          >
            End Chat
          </button> */}
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
        {sortedMessages.map((msg, index) => {
          const isMe = msg.senderId === astrologerId;

          const currentDateLabel = getDateLabel(msg.timestamp);
          const prevDateLabel =
            index > 0
              ? getDateLabel(sortedMessages[index - 1].timestamp)
              : null;

          const showDateSeparator = currentDateLabel !== prevDateLabel;

          return (
            <React.Fragment key={msg.id}>
              {/* DATE SEPARATOR */}
              {showDateSeparator && (
                <div className="flex justify-center my-4">
                  <span className="bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-full">
                    {currentDateLabel}
                  </span>
                </div>
              )}

              {/* MESSAGE BUBBLE */}
              <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2.5 text-sm leading-relaxed ${
                    isMe
                      ? "bg-primary/10 text-[#424242]"
                      : "bg-[#FFE2C6] text-gray-800"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                  <div className="mt-1 flex items-center justify-end gap-1.5 text-[11px] text-gray-500/80">
                    <span>{formatChatTime(msg.timestamp)}</span>
                    {isMe && (
                      <span className={msg.isRead ? "text-blue-500" : ""}>
                        {msg.isRead ? <CheckCheck size={14} strokeWidth={2.5} /> : <Check size={14} strokeWidth={2.5} />}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="border-t border-t-gray-200 bg-white px-4 md:px-6 lg:px-8 py-3">
        <form
          className="flex items-center gap-3 w-full"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
        >
          <textarea
            value={text}
            onChange={handleTyping}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none overflow-hidden h-12 leading-normal bg-gray-50"
            rows="1"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="rounded-lg bg-primary p-3 text-sm font-medium text-white hover:opacity-90 flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm cursor-pointer"
          >
            <Send className="size-5" />
          </button>
        </form>
      </div>

      {/* END CHAT MODAL */}
      <EndChatModal
        isOpen={isEndChatModalOpen}
        onClose={() => setIsEndChatModalOpen(false)}
        onConfirm={handleEndChat}
      />

      {/* USER DECIDING MODAL */}
      <UserDecidingModal isOpen={isUserDecidingModalOpen} />
    </div>
  );
};

export default AstrologerChatScreen;
