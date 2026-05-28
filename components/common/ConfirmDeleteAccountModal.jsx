import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function ConfirmDeleteAccountModal({ isOpen, onClose, onConfirm }) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label={t("close") || "Close"}
        onClick={onClose}
        className="absolute inset-0 cursor-pointer bg-black/45"
      />

      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
        <h3 className="text-base font-semibold text-[#1F1F1F]">{t("deleteAccount") || "Delete Account"}</h3>
        <p className="mt-2 text-sm text-[#646464]">
          {t("deleteWarningMessage") || "Are you sure you want to delete your account? This action cannot be undone."}
        </p>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-10 cursor-pointer rounded-lg border border-[#E4DFE8] px-4 text-sm font-medium text-[#4F4F4F]"
          >
            {t("cancel") || "Cancel"}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-10 cursor-pointer rounded-lg bg-[#DB7C66] px-4 text-sm font-semibold text-white"
          >
            {`${t("yes") || "Yes"}, ${t("delete") || "Delete"}`}
          </button>
        </div>
      </div>
    </div>
  );
}
