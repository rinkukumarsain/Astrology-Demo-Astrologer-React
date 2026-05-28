"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
// import i18n from '../../i18n/i18n';
import i18n from "../../../i18n/i18n"
import { setCookies } from "@/lib/clientHelpers";

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

export default function Page() {
  const router = useRouter();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState(i18n.language || "en");

  useEffect(() => {
    setMounted(true);
    const currentLang = localStorage.getItem("preferredLanguage") || i18n.language || "en";
    setSelected(currentLang);
  }, []);

  function handleContinue() {
    try {
      localStorage.setItem("preferredLanguage", selected);
      setCookies("preferredLanguage", selected, 60 * 60 * 24 * 365); // Save for 1 year
      i18n.changeLanguage(selected);
    } catch {
      /* ignore quota / private mode */
    }
    router.push("/login");
  }

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
        <header className="shrink-0 p-5">
          <h1 className="text-xl font-semibold tracking-tight text-neutral-800 md:text-xl">
            {t('chooseYourLanguage') || 'Choose your language'}
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-neutral-500 font-normal">
            {t('selectPreferredLanguage') || 'Select your preferred language to use on your app'}
          </p>
        </header>

        <div
          className="w-full px-5 min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]"
          role="radiogroup"
          aria-label="Language"
        >
          <div className="flex flex-col gap-3 pb-1">
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
                    "flex w-full items-center justify-between gap-3 rounded-lg border-2 cursor-pointer px-4 py-4 text-left transition-colors",
                    isSelected
                      ? "border-primary bg-[#FFF4E9] text-primary"
                      : "border-[#E0E0E0] bg-white text-neutral-900 hover:border-neutral-300",
                  ].join(" ")}
                >
                  <span className="text-sm font-normal">{lang.label}</span>
                  <span
                    className={[
                      "inline-flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-[#E0E0E0] bg-white",
                    ].join(" ")}
                    aria-hidden
                  >
                    {isSelected ? <CheckIcon /> : null}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <footer className="shrink-0 p-5">
          <button
            type="button"
            onClick={handleContinue}
            className="w-full rounded-lg bg-primary py-3.5 text-center text-base font-semibold text-white transition-opacity hover:opacity-95 active:opacity-90"
          >
            Continue
          </button>
        </footer>
      </div>
    </div>
  );
}
