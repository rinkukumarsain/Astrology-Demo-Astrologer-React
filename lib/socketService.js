"use client";
import { socket } from "@/lib/socket";

/**
 * Get the singleton socket instance (same one from lib/socket.js).
 */
export function getSocket() {
  return socket;
}

/**
 * Authenticate the astrologer with the socket server.
 */
export function authenticate(token) {
  if (!socket) {
    console.error("[Socket] No socket instance for authenticate");
    return;
  }
  console.log("[Socket] Emitting authenticate, connected:", socket.connected, "id:", socket.id);
  socket.emit("authenticate", {
    token,
    userType: "astrologer",
    "accept-language": "en",
  });
}

/**
 * Emit accept_connection to accept a user's chat request.
 */
export function emitAcceptConnection(userId) {
  if (!socket) {
    console.error("[Socket] No socket instance for accept_connection");
    return;
  }
  if (!socket.connected) {
    console.error("[Socket] Socket NOT connected! Cannot emit accept_connection. Attempting reconnect...");
    socket.connect();
    // Wait briefly then try to emit
    setTimeout(() => {
      console.log("[Socket] Retry accept_connection, connected:", socket.connected, "id:", socket.id);
      socket.emit("accept_connection", { userId });
    }, 1000);
    return;
  }
  console.log("[Socket] Emitting accept_connection:", { userId }, "socket.id:", socket.id);
  socket.emit("accept_connection", { userId });
}

/**
 * Emit end_connection to end a chat session.
 */
export function emitEndConnection(userId, astrologerId) {
  if (!socket) {
    console.error("[Socket] No socket instance for end_connection");
    return;
  }
  if (!socket.connected) {
    console.error("[Socket] Socket NOT connected! Cannot emit end_connection. Attempting reconnect...");
    socket.connect();
    setTimeout(() => {
      console.log("[Socket] Retry end_connection, connected:", socket.connected);
      socket.emit("end_connection", { userId, astrologerId });
    }, 1000);
    return;
  }
  console.log("[Socket] Emitting end_connection:", { userId, astrologerId }, "socket.id:", socket.id);
  socket.emit("end_connection", { userId, astrologerId });
}

/**
 * Listen helpers — each returns an unsubscribe function.
 */
export function onConnectionRequest(callback) {
  console.log("[Socket] Listening for connection_request");
  if (!socket) return () => {};
  socket.on("connection_request", callback);
  return () => socket.off("connection_request", callback);
}

export function onConnectionConfirmed(callback) {
  if (!socket) return () => {};
  socket.on("connection_confirmed", callback);
  return () => socket.off("connection_confirmed", callback);
}

export function onPartnerDisconnected(callback) {
  if (!socket) return () => {};
  socket.on("partner_disconnected", callback);
  return () => socket.off("partner_disconnected", callback);
}

export function onWaitingRequestCancelled(callback) {
  if (!socket) return () => {};
  socket.on("waiting_request_cancelled", callback);
  return () => socket.off("waiting_request_cancelled", callback);
}

export function onUserDecidingContinuation(callback) {
  if (!socket) return () => {};
  socket.on("user_deciding_continuation", callback);
  return () => socket.off("user_deciding_continuation", callback);
}

export function onUserContinuedChat(callback) {
  if (!socket) return () => {};
  socket.on("user_continued_chat", callback);
  return () => socket.off("user_continued_chat", callback);
}

export function onAuthenticationSuccess(callback) {
  if (!socket) return () => {};
  socket.on("authenticationSuccess", callback);
  return () => socket.off("authenticationSuccess", callback);
}

export function onSocketError(callback) {
  if (!socket) return () => {};
  socket.on("error", callback);
  return () => socket.off("error", callback);
}

/**
 * Emit checkAstro to check astrologer availability
 */
export function emitCheckAstro(astrologerId) {
  if (!socket) return;
  socket.emit("checkAstro", { astrologerId: astrologerId });
}

/**
 * Emit a chat message to the other user
 */
export function emitChatMessage(userId, astrologerId, messageData) {
  if (!socket) {
    console.error("[Socket] No socket instance for chat message");
    return;
  }
  if (!socket.connected) {
    console.error("[Socket] Socket NOT connected! Cannot emit message");
    return;
  }
  console.log("[Socket] Emitting chat message:", { userId, astrologerId, ...messageData });
  socket.emit("chat_message", {
    userId,
    astrologerId,
    ...messageData,
  });
}

/**
 * Listen for incoming chat messages
 */
export function onChatMessage(callback) {
  if (!socket) return () => {};
  socket.on("chat_message", callback);
  return () => socket.off("chat_message", callback);
}

/**
 * Listen for typing indicator
 */
export function onTypingIndicator(callback) {
  if (!socket) return () => {};
  socket.on("typing", callback);
  return () => socket.off("typing", callback);
}

/**
 * Emit typing indicator
 */
export function emitTyping(userId, astrologerId, isTyping) {
  if (!socket?.connected) return;
  socket.emit("typing", { userId, astrologerId, isTyping });
}

/**
 * Listen for incoming calls
 */
export function onIncomingCall(callback) {
  if (!socket) return () => {};
  socket.on("incoming_call", callback);
  return () => socket.off("incoming_call", callback);
}

/**
 * Listen for call cancellation
 */
export function onCallCancelled(callback) {
  if (!socket) return () => {};
  socket.on("call_cancelled", callback);
  return () => socket.off("call_cancelled", callback);
}

/**
 * Remove all listeners at once.
 */
export function removeAllListeners() {
  if (!socket) return;
  const events = [
    "connection_request",
    "connection_confirmed",
    "partner_disconnected",
    "waiting_request_cancelled",
    "user_deciding_continuation",
    "user_continued_chat",
    "authenticationSuccess",
    "error",
    "chat_message",
    "typing",
    "incoming_call",
    "call_cancelled",
  ];
  events.forEach((event) => socket.removeAllListeners(event));
}
