"use client";

import { useSignupFinal } from "./useSignupFinal";

const CHART_TYPE_OPTIONS = ["North Indian", "South Indian", "East Indian"];

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

export default function SignupFinalPage() {
  const {
    chartType,
    about,
    achievements,
    isSubmitting,
    canSubmit,
    textLimits,
    setChartType,
    setAbout,
    setAchievements,
    handleBack,
    handleSubmit,
  } = useSignupFinal();

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
              <span className="mb-1 block text-sm font-semibold text-[#2C2C2C]">Chart Type</span>
              <div className="relative">
                <select
                  value={chartType}
                  onChange={(event) => setChartType(event.target.value)}
                  className="h-[50px] w-full appearance-none rounded-lg border border-[#C8CDD0] bg-white px-3 text-sm text-[#6A6A6A] outline-none"
                >
                  <option value="">Select</option>
                  {CHART_TYPE_OPTIONS.map((item) => (
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

            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-[#2C2C2C]">About Me</span>
              <textarea
                value={about}
                onChange={(event) => setAbout(event.target.value)}
                placeholder="Tell Clients about your astrological journey and approach........"
                className="h-[170px] w-full resize-none rounded-lg border border-[#C8CDD0] bg-white px-3 py-3 text-sm text-[#2A2A2A] outline-none placeholder:text-[#A8A8A8]"
              />
              <p className="mt-1 text-right text-sm text-[#777777]">
                {textLimits.aboutCount}/{textLimits.MAX_TEXT}
              </p>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-[#2C2C2C]">Achievements</span>
              <textarea
                value={achievements}
                onChange={(event) => setAchievements(event.target.value)}
                placeholder="List any publications, awards, or specializations........"
                className="h-[170px] w-full resize-none rounded-lg border border-[#C8CDD0] bg-white px-3 py-3 text-sm text-[#2A2A2A] outline-none placeholder:text-[#A8A8A8]"
              />
              <p className="mt-1 text-right text-sm text-[#777777]">
                {textLimits.achievementsCount}/{textLimits.MAX_TEXT}
              </p>
            </label>
          </div>
        </div>

        <footer className="shrink-0 px-5 pb-5">
          <button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className="w-full rounded-lg bg-primary py-3.5 text-center text-base font-semibold text-white transition-opacity hover:opacity-95 active:opacity-90 disabled:cursor-not-allowed disabled:bg-[#E89886] disabled:opacity-100"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </footer>
      </form>
    </div>
  );
}
