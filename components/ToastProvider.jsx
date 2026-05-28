"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 2500,
        style: {
          borderRadius: "10px",
          background: "#1f2937",
          color: "#ffffff",
          fontSize: "14px",
        },
      }}
    />
  );
}
