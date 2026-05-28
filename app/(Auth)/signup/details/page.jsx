"use client";

import { useSignupDetails } from "./useSignupDetails";

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

function Pill({ label, active, onClick, compact = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        compact
          ? "h-[28px] rounded-md border px-4 text-xs font-normal transition-colors"
          : "h-[50px] rounded-xl border px-5 text-sm font-normal transition-colors",
        active
          ? "border-primary bg-primary text-white"
          : "border-[#B9BDC0] bg-white text-[#3A3A3A]",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

export default function SignupDetailsPage() {
  const {
    experience,
    expertises,
    languages,
    consultationType,
    ratePerMinChat,
    ratePerMinCall,
    ratePerMinVideoCall,
    certificateFile,
    certificateInputRef,
    canSubmit,
    showAllExpertise,
    showAllLanguages,
    options,
    handleBack,
    handleSubmit,
    setExperience,
    toggleExpertise,
    toggleLanguage,
    toggleConsultationType,
    handleRatePerMinChat,
    handleRatePerMinCall,
    handleRatePerMinVideoCall,
    handleOpenCertificatePicker,
    handleCertificateChange,
    handleViewAllExpertise,
    handleViewAllLanguages,
    handleToggleExpertiseView,
    handleToggleLanguagesView,
  } = useSignupDetails();

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
          <div className="mx-auto w-full max-w-md space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-normal text-[#2C2C2C]">Experience</span>
              <div className="relative">
                <select
                  value={experience}
                  onChange={(event) => setExperience(event.target.value)}
                  className="h-[50px] w-full appearance-none rounded-lg border border-[#C8CDD0] bg-white px-3 text-sm text-[#6A6A6A] outline-none"
                >
                  <option>Select year of experience</option>
                  {options.EXPERIENCE_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-3 inline-flex items-center text-[#7E7E7E]">
                  <svg viewBox="0 0 20 20" className="size-4" aria-hidden>
                    <path d="M5.2 7.6a.8.8 0 0 1 1.1 0L10 11.3l3.7-3.7a.8.8 0 1 1 1.1 1.1l-4.2 4.2a.8.8 0 0 1-1.1 0L5.2 8.7a.8.8 0 0 1 0-1.1Z" fill="currentColor" />
                  </svg>
                </span>
              </div>
            </label>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-normal text-[#2C2C2C]">Expertise</p>
                <button type="button" onClick={handleToggleExpertiseView} className="text-sm font-semibold text-primary cursor-pointer hover:underline">
                  {showAllExpertise ? "View less" : "View all"}
                </button>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {(showAllExpertise ? options.EXPERTISE_LIST : options.EXPERTISE_LIST.slice(0, 6)).map((item) => (
                  <Pill
                    key={item}
                    label={item}
                    active={expertises.includes(item)}
                    onClick={() => toggleExpertise(item)}
                    compact
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-normal text-[#2C2C2C]">Language Known</p>
                <button type="button" onClick={handleToggleLanguagesView} className="text-sm font-semibold text-primary cursor-pointer hover:underline">
                  {showAllLanguages ? "View less" : "View all"}
                </button>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {(showAllLanguages ? options.LANGUAGE_LIST : options.LANGUAGE_LIST.slice(0, 4)).map((item) => (
                  <Pill
                    key={item}
                    label={item}
                    active={languages.includes(item)}
                    onClick={() => toggleLanguage(item)}
                    compact
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-normal text-[#2C2C2C]">Consultation Type</p>
              <div className="flex flex-wrap gap-2.5">
                {options.CONSULTATION_LIST.map((item) => (
                  <Pill
                    key={item}
                    label={item}
                    active={consultationType.includes(item)}
                    onClick={() => toggleConsultationType(item)}
                  />
                ))}
              </div>
            </div>

            <label className="block">
              <span className="mb-1 block text-sm font-normal text-[#2C2C2C]">Charges (Chat)</span>
              <input
                type="text"
                placeholder="₹/min"
                value={ratePerMinChat}
                onChange={handleRatePerMinChat}
                className="h-[50px] w-full rounded-lg border border-[#C8CDD0] bg-white px-3 text-sm text-[#2A2A2A] outline-none placeholder:text-[#B8B8B8]"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-normal text-[#2C2C2C]">Charges (Voice Call)</span>
              <input
                type="text"
                placeholder="₹/min"
                value={ratePerMinCall}
                onChange={handleRatePerMinCall}
                className="h-[50px] w-full rounded-lg border border-[#C8CDD0] bg-white px-3 text-sm text-[#2A2A2A] outline-none placeholder:text-[#B8B8B8]"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-normal text-[#2C2C2C]">Charges (Video Call)</span>
              <input
                type="text"
                placeholder="₹/min"
                value={ratePerMinVideoCall}
                onChange={handleRatePerMinVideoCall}
                className="h-[50px] w-full rounded-lg border border-[#C8CDD0] bg-white px-3 text-sm text-[#2A2A2A] outline-none placeholder:text-[#B8B8B8]"
              />
            </label>

            <div>
              <span className="mb-1 block text-sm font-normal text-[#2C2C2C]">Certification Upload(Optional)</span>
              <input
                ref={certificateInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleCertificateChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={handleOpenCertificatePicker}
                className="flex h-[88px] w-full items-center justify-center gap-2 rounded-md border border-dashed border-[#BFC3C6] bg-white text-sm text-[#9B9FA3]"
              >
                <svg viewBox="0 0 20 20" className="size-4" aria-hidden>
                  <path
                    d="M10 2.7a4.1 4.1 0 0 1 4.1 4.1v.8h.8a3.3 3.3 0 0 1 0 6.6h-1.6a.8.8 0 0 1 0-1.6h1.6a1.7 1.7 0 1 0 0-3.4h-1.6a.8.8 0 0 1-.8-.8V6.8a2.5 2.5 0 0 0-5 0v1.6a.8.8 0 0 1-.8.8H5.1a1.7 1.7 0 1 0 0 3.4h1.6a.8.8 0 1 1 0 1.6H5.1a3.3 3.3 0 1 1 0-6.6h.8v-.8A4.1 4.1 0 0 1 10 2.7Zm0 7.4a.8.8 0 0 1 .8.8V15a.8.8 0 1 1-1.6 0v-4.1a.8.8 0 0 1 .8-.8Zm0-2.5a.8.8 0 0 1 .8.8v.8a.8.8 0 1 1-1.6 0v-.8a.8.8 0 0 1 .8-.8Z"
                    fill="currentColor"
                  />
                </svg>
                <span>{certificateFile?.name || "Click to upload your certification"}</span>
              </button>
            </div>
          </div>
        </div>

        <footer className="shrink-0 px-5 pb-5">
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-lg bg-primary py-3.5 text-center text-base font-semibold text-white transition-opacity hover:opacity-95 active:opacity-90 disabled:cursor-not-allowed disabled:bg-[#E89886] disabled:opacity-100"
          >
            Next
          </button>
        </footer>
      </form>
    </div>
  );
}
