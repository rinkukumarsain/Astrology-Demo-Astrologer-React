"use client";

import { setCookies } from "@/lib/clientHelpers";
import i18n from "@/i18n/i18n";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "mr", label: "मराठी" },
  { code: "pa", label: "ਪੰਜਾਬੀ" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "ml", label: "മലയാളം" },
];

function CheckIcon(props) {
  return (
    <svg viewBox="0 0 12 10" aria-hidden className="size-2.5 text-white" {...props}>
      <path
        fill="currentColor"
        d="M11.2.3a1 1 0 0 1 .2 1.4l-6 8a1 1 0 0 1-1.5.1L.3 5.6A1 1 0 0 1 1.7 4l2.3 2.3L9.8.4A1 1 0 0 1 11.2.3Z"
      />
    </svg>
  );
}

export default function ChangeLanguagePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState(i18n.language || "en");

  useEffect(() => {
    setMounted(true);
    const currentLang = localStorage.getItem("preferredLanguage") || i18n.language || "en";
    setSelected(currentLang);
  }, []);

  const handleContinue = () => {
    try {
      localStorage.setItem("preferredLanguage", selected);
      setCookies("preferredLanguage", selected, 60 * 60 * 24 * 365);
      i18n.changeLanguage(selected);
    } catch {
      // no-op for storage-restricted environments
    }

    router.push("/settings");
  };

  if (!mounted) return null;

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-4">
      <div
        className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1"
        role="radiogroup"
        aria-label="Language"
      >
        {LANGUAGES.map((lang) => {
          const isSelected = selected === lang.code;

          return (
            <button
              key={lang.code}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setSelected(lang.code)}
              className={[
                "flex h-[52px] w-full cursor-pointer items-center justify-between rounded-xl border px-4 text-left transition-colors",
                isSelected
                  ? "border-[#E8BEA6] bg-[#FFF7F2] text-[#C4684D]"
                  : "border-[#E5E1E9] bg-white text-[#232323] hover:border-[#D9D3DF]",
              ].join(" ")}
            >
              <span className="text-sm font-medium">{lang.label}</span>
              <span
                className={[
                  "inline-flex size-5 shrink-0 items-center justify-center rounded-full border",
                  isSelected ? "border-[#DB7C66] bg-[#DB7C66]" : "border-[#D3D3D3] bg-white",
                ].join(" ")}
                aria-hidden
              >
                {isSelected ? <CheckIcon /> : null}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-center pt-1">
        <button
          type="button"
          onClick={handleContinue}
          className="h-[46px] w-full max-w-[320px] cursor-pointer rounded-xl bg-primary px-6 text-sm font-semibold text-white transition-opacity hover:opacity-95 active:opacity-90"
        >
          {t("continue") || "Continue"}
        </button>
      </div>
    </section>
  );
}
