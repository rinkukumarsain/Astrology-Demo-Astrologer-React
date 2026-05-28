"use client";

import React from "react";
import { useParams } from "next/navigation";
import AstrologerChatScreen from "@/components/dashboardComponents/AstrologerChatScreen";

export default function DynamicChatPage() {
  const params = useParams();
  const chatId = params?.chatId;

  return <AstrologerChatScreen urlChatId={chatId} />;
}
