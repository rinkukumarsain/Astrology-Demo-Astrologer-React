"use client"
import { io } from 'socket.io-client';

const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;

const isBrowser = typeof window !== "undefined";

export const socket = isBrowser
  ? io(socketUrl, {
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 500,
      reconnectionDelayMax: 3000,
      reconnectionAttempts: Infinity,
    })
  : {
      on: () => {},
      off: () => {},
      emit: () => {},
      connect: () => {},
      disconnect: () => {},
      connected: false,
    };

// Debug connection lifecycle
socket.on("connect", () => {
  console.log("[Socket] Connected! id:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.warn("[Socket] Disconnected! reason:", reason);
});

socket.on("connect_error", (err) => {
  console.error("[Socket] Connection error:", err.message);
});

socket.on("reconnect", (attempt) => {
  console.log("[Socket] Reconnected after", attempt, "attempts");
});

socket.on("reconnect_failed", () => {
  console.error("[Socket] Reconnection failed after maximum attempts");
});