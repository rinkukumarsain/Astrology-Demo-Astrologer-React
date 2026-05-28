"use client";

import Image from "next/image";
import { useSignup } from "./useSignup";
import NotificationPermissionPrompt from "@/components/common/NotificationPermissionPrompt";

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

export default function Page() {
  const {
    form,
    gender,
    isSubmitting,
    showNotificationPrompt,
    canSubmit,
    fileInputRef,
    profileFileName,
    profilePreviewUrl,
    handleBack,
    handleGenderChange,
    handleFieldChange,
    handleOpenProfilePicker,
    handleProfileFileChange,
    handleSubmit,
  } = useSignup();

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <form onSubmit={handleSubmit} className="flex h-full min-h-0 w-full flex-col overflow-hidden">
        <header className="shrink-0 px-5 pt-4 pb-2">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-base font-medium text-[#111111] cursor-pointer"
          >
            <ArrowLeftIcon />
            <span>Signup</span>
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
          <div className="mx-auto w-full max-w-md">
            <div className="mt-2 flex justify-center">
              <button
                type="button"
                onClick={handleOpenProfilePicker}
                className="relative inline-flex size-26 bg-white items-center justify-center overflow-hidden rounded-full border border-primary text-primary"
                aria-label="Upload profile"
              >
                {profilePreviewUrl ? (
                  <Image
                    src={profilePreviewUrl}
                    alt="Selected profile preview"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <svg viewBox="0 0 24 24" className="size-7" aria-hidden>
                    <path
                      d="M9.2 6.5 10 5c.2-.4.6-.6 1-.6h2c.4 0 .8.2 1 .6l.8 1.5h2.7c1 0 1.8.8 1.8 1.8v8.2c0 1-.8 1.8-1.8 1.8H6.5c-1 0-1.8-.8-1.8-1.8V8.3c0-1 .8-1.8 1.8-1.8h2.7Zm2.8 2.6a3.3 3.3 0 1 0 0 6.6 3.3 3.3 0 0 0 0-6.6Zm0 1.5a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6Z"
                      fill="currentColor"
                    />
                  </svg>
                )}
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfileFileChange}
              className="hidden"
            />

            <p className="mt-3 text-center text-sm font-medium text-[#1F1F1F]">Upload Your Profile</p>
            {profileFileName ? (
              <p className="mt-1 truncate text-center text-xs text-[#777777]">{profileFileName}</p>
            ) : null}

            <div className="mt-4 space-y-4.5">
              <label className="block">
                <span className="mb-1 block text-sm font-normal text-[#2C2C2C]">Full Name</span>
                <input
                  type="text"
                  placeholder="Enter name"
                  value={form.fullName}
                  onChange={handleFieldChange("fullName")}
                  className="h-[3.125rem] w-full rounded-lg border border-[#C8CDD0] bg-white px-3 text-sm text-[#2A2A2A] outline-none placeholder:text-[#A8A8A8]"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-normal text-[#2C2C2C]">Date of Birth</span>
                <input
                  type="date"
                  value={form.dob}
                  onChange={handleFieldChange("dob")}
                  className="h-[3.125rem] w-full rounded-lg border border-[#C8CDD0] bg-white px-3 text-sm text-[#2A2A2A] outline-none placeholder:text-[#A8A8A8]"
                />
              </label>

              <div>
                <span className="mb-1 block text-sm font-normal text-[#2C2C2C]">Gender</span>
                <div className="flex gap-2">
                  {[
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                    { value: "other", label: "Other" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleGenderChange(option.value)}
                      className={[
                        "h-[28px] rounded-md border px-4 text-xs font-normal transition-colors cursor-pointer",
                        gender === option.value
                          ? "border-primary bg-primary text-white"
                          : "border-[#C8CDD0] bg-white text-[#4A4A4A] hover:bg-[#F8F8F8]",
                      ].join(" ")}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block">
                <span className="mb-1 block text-sm font-normal text-[#2C2C2C]">Phone Number</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="Enter your number"
                  value={form.phoneNumber}
                  onChange={handleFieldChange("phoneNumber")}
                  className="h-[3.125rem] w-full rounded-lg border border-[#C8CDD0] bg-white px-3 text-sm text-[#2A2A2A] outline-none placeholder:text-[#A8A8A8]"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-normal text-[#2C2C2C]">Email</span>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email address"
                  value={form.email}
                  onChange={handleFieldChange("email")}
                  className="h-[3.125rem] w-full rounded-lg border border-[#C8CDD0] bg-white px-3 text-sm text-[#2A2A2A] outline-none placeholder:text-[#A8A8A8]"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-normal text-[#2C2C2C]">Address</span>
                <input
                  type="text"
                  placeholder="Enter your full address"
                  value={form.address}
                  onChange={handleFieldChange("address")}
                  className="h-[3.125rem] w-full rounded-lg border border-[#C8CDD0] bg-white px-3 text-sm text-[#2A2A2A] outline-none placeholder:text-[#A8A8A8]"
                />
              </label>
            </div>
          </div>
        </div>

        <footer className="shrink-0 px-5 pb-5">
          <button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className="w-full rounded-lg bg-primary py-3.5 text-center text-base font-semibold text-white transition-opacity hover:opacity-95 active:opacity-90 disabled:cursor-not-allowed disabled:bg-[#E89886] disabled:opacity-100"
          >
            {isSubmitting ? "Submitting..." : "Next"}
          </button>
        </footer>
      </form>
      {showNotificationPrompt && <NotificationPermissionPrompt mandatory={true} />}
    </div>
  );
}
