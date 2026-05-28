"use client";

import { useSignupOtp } from "./useSignupOtp";

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-7" aria-hidden>
      <path
        d="M11.8 4.7a.8.8 0 0 1 0 1.1L8.4 9.2h7a.8.8 0 1 1 0 1.6h-7l3.4 3.4a.8.8 0 1 1-1.2 1.1l-4.7-4.7a.8.8 0 0 1 0-1.1l4.7-4.7a.8.8 0 0 1 1.2 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function SignupOtpPage() {
  const {
    otp,
    canSubmit,
    isSubmitting,
    mobileNumber,
    inputRefs,
    handleBack,
    handleEditMobile,
    handleSubmit,
    handleOtpChange,
    handleOtpKeyDown,
    handleOtpPaste,
  } = useSignupOtp();

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <form onSubmit={handleSubmit} className="flex h-full min-h-0 w-full flex-col overflow-hidden">
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="mx-auto w-full max-w-md">
            <button type="button" onClick={handleBack} className="mb-4 inline-flex text-[#262626]">
              <ArrowLeftIcon />
            </button>

            <h1 className="text-2xl font-semibold leading-tight text-[#26262B]">OTP Verification</h1>
            <p className="mt-2 text-sm font-normal text-[#313131]">
              Verification Code sent to <span className="font-semibold">+91 {mobileNumber}</span>{" "}
              <button
                type="button"
                onClick={handleEditMobile}
                className="font-semibold text-primary hover:opacity-90"
              >
                Edit
              </button>
            </p>

            <div className="mt-6 flex items-center gap-3" onPaste={handleOtpPaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(node) => {
                    inputRefs.current[index] = node;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={digit}
                  onChange={(event) => handleOtpChange(index, event)}
                  onKeyDown={(event) => handleOtpKeyDown(index, event)}
                  className="size-[56px] rounded-[12px] border border-[#E4E4E4] bg-[#ECEDEF] text-center text-2xl font-semibold text-[#2D2D2D] outline-none focus:border-primary focus:bg-white"
                />
              ))}
            </div>
          </div>
        </div>

        <footer className="shrink-0 px-5 pb-5">
          <button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className="w-full rounded-lg bg-primary py-3.5 text-center text-base font-semibold text-white transition-opacity hover:opacity-95 active:opacity-90 disabled:cursor-not-allowed disabled:bg-[#E89886] disabled:opacity-100"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </footer>
      </form>
    </div>
  );
}
