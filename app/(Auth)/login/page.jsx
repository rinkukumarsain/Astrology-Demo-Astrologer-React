"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLogin } from "./useLogin";
import { useTranslation } from 'react-i18next';
import NotificationPermissionPrompt from "@/components/common/NotificationPermissionPrompt";
import i18n from "../../../i18n/i18n";

const LANGUAGE_LABELS = {
  en: "English",
  hi: "हिंदी",
  mr: "मराठी",
  pa: "ਪੰਜਾਬੀ",
  ta: "தமிழ்",
  te: "తెలుగు",
  ml: "മലയാളം",
};

export default function Page() {
  const router = useRouter();
  const {
    formik,
    isSubmitting,
    showNotificationPrompt,
    handleMobileChange,
    handleGoToSignup,
    handleGoToTerms,
  } = useLogin();
  const { t } = useTranslation();

  const currentLangLabel = LANGUAGE_LABELS[i18n.language] || "English";

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <form onSubmit={formik.handleSubmit} className="flex h-full min-h-0 w-full flex-col overflow-hidden">
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-5 pb-6">
          {/* Change Language button */}
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={() => router.push("/choose-language")}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E0E0E0] bg-white px-3.5 py-1.5 text-xs font-medium text-[#4A4A4A] transition-colors hover:border-primary hover:text-primary cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A8.966 8.966 0 0 1 3 12c0-1.264.26-2.467.732-3.558" />
              </svg>
              {currentLangLabel}
            </button>
          </div>

          <div className="mx-auto w-full max-w-md">
            <Image
              src="/assets/img/logo-gif.gif"
              alt="Nakshatra.ai logo"
              width={120}
              height={120}
              unoptimized
              className="mx-auto"
              priority
            />

            <div className="mt-8 text-center">
              <p className="text-base font-normal leading-6 text-[#4A4A4A]">
                {t('embarkonYourAstrologyJourney') || 'Embark on your Astrology Journey with'}
              </p>
              <p className="mt-2 text-2xl font-semibold leading-tight text-[#222222]">
                {t('nakshatraAi') || 'Nakshatra.ai Astrologer'}
              </p>
            </div>

            <div className="mt-8">
              <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-2">
                {t('enterMobileNumber') || 'Mobile Number'}
              </label>
              <div className="relative">
                <div className="flex items-center absolute top-1/2 -translate-y-1/2 left-4">
                  <span className="shrink-0 text-sm font-normal text-[#363636]">+91</span>
                  <span className="mx-3 h-6 w-px bg-[#DFDFDF]" aria-hidden />
                </div>
                <input
                  id="mobileNumber"
                  name="mobileNumber"
                  type="tel"
                  inputMode="numeric"
                  placeholder={t('enterMobileNumberHint') || "Enter Mobile Number"}
                  value={formik.values.mobileNumber}
                  onChange={handleMobileChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-4 pl-17 text-sm text-[#202020] outline-none h-[50px] rounded-[14px] border bg-white transition-colors ${
                    formik.touched.mobileNumber && formik.errors.mobileNumber
                      ? "border-red-500 focus:border-red-500"
                      : "border-[#BEC3C7] focus:border-primary"
                  }`}
                />
              </div>
              {formik.touched.mobileNumber && formik.errors.mobileNumber && (
                <p className="mt-2 text-xs text-red-500 font-medium">{formik.errors.mobileNumber}</p>
              )}
            </div>

            <p className="mt-4 text-sm font-normal text-[#3A3A3A]">
              {t('doesntHaveAccount') || "Doesn't have a account?"}{" "}
              <button
                type="button"
                onClick={handleGoToSignup}
                className="font-semibold text-primary hover:opacity-90 cursor-pointer"
              >
                {t('signup') || 'Signup'}
              </button>
            </p>
          </div>
        </div>

        <footer className="shrink-0 px-5 pb-5">
          <p className="mb-3 text-center text-xs font-normal text-[#606060]">
            {t('bySubmittingYouAgree') || 'By Submitting, you agree to our'}{" "}
            <button
              type="button"
              onClick={handleGoToTerms}
              className="font-medium underline underline-offset-2 text-primary cursor-pointer"
            >
              {t('termsAndConditions') || 'Terms & Conditions'}
            </button>
          </p>

          <button
            type="submit"
            disabled={!formik.isValid || isSubmitting}
            className="w-full rounded-xl bg-primary py-4 text-center text-base font-bold text-white shadow-lg shadow-primary/20 transition-all hover:opacity-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[#E89886] disabled:opacity-70 disabled:shadow-none"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>{t('loading') || "Submitting..."}</span>
              </div>
            ) : (
              t('submit') || "Submit"
            )}
          </button>
        </footer>
      </form>
      {showNotificationPrompt && <NotificationPermissionPrompt mandatory={true} />}
    </div>
  );
}