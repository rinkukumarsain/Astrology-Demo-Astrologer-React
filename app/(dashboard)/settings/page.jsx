"use client";

import ConfirmDeleteAccountModal from "@/components/common/ConfirmDeleteAccountModal";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

function ChevronRightIcon() {
  return (
    <svg className="h-5 w-5" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="h-5 w-5" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M6 6l1 14a1 1 0 0 0 1 .9h8a1 1 0 0 0 1-.9L18 6M10 11v6M14 11v6" />
    </svg>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  return (
    <>
      <section className="flex min-h-0 flex-1 flex-col gap-3">
        <button
          type="button"
          onClick={() => router.push("/change-language")}
          className="flex h-[50px] cursor-pointer items-center justify-between rounded-xl border border-[#E5E1E9] bg-white px-4 text-left shadow-sm"
        >
          <span className="text-sm font-semibold text-[#2F2F2F]">{t("applanguage") || "App Language"}</span>
          <span className="text-[#4E4E4E]">
            <ChevronRightIcon />
          </span>
        </button>

        <button
          type="button"
          onClick={() => setIsDeleteModalOpen(true)}
          className="flex h-[50px] cursor-pointer items-center gap-3 rounded-xl border border-[#E5E1E9] bg-white px-4 text-left shadow-sm"
        >
          <span className="text-[#DB7C66]">
            <TrashIcon />
          </span>
          <span className="text-sm font-semibold text-[#DB7C66]">{t("deleteAccount") || "Delete Account"}</span>
        </button>
      </section>

      <ConfirmDeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => setIsDeleteModalOpen(false)}
      />
    </>
  );
}
