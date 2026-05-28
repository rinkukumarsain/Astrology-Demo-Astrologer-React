"use client";

import React, { useEffect, useMemo } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { fetchAstrologerReviews } from "@/redux/slices/dashboardSlice";
import { getBackendImageUrl } from "@/lib/getBackendImageUrl";

const RATING_META = [
  { key: "excellent", color: "bg-[#6CAE75]" },
  { key: "good", color: "bg-[#9AC47F]" },
  { key: "average", color: "bg-[#D6C449]" },
  { key: "belowAverage", color: "bg-[#E2A32D]" },
  { key: "poor", color: "bg-[#D1D1D1]" },
];

function AvatarIcon() {
  return (
    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E7E7E7] text-[#8A8A8A]" aria-hidden>
      <svg className="h-5 w-5" width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4 0-7 2.2-7 5v1h14v-1c0-2.8-3-5-7-5Z" />
      </svg>
    </span>
  );
}

function StarRow({ rating }) {
  const filled = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-0.5 text-sm leading-none">
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} className={index < filled ? "text-[#F3A647]" : "text-[#D5D5D5]"}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function ReviewRatingsPage() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const reviewsState = useSelector((state) => state.dashboard.reviews);
  const isLoading = reviewsState.loading;
  const error = reviewsState.error;
  const payload = reviewsState.data || {};
  const overallRating = Number(payload?.overallRating || 0);
  const totalReviews = Number(payload?.totalReviews || 0);
  const reviews = Array.isArray(payload?.reviews) ? payload.reviews : [];
  const breakdown = payload?.breakdown && typeof payload.breakdown === "object" ? payload.breakdown : {};

  useEffect(() => {
    if (reviewsState.loading || reviewsState.loaded) return;
    void dispatch(fetchAstrologerReviews());
  }, [dispatch, reviewsState.loaded, reviewsState.loading]);

  const ratingBreakdown = useMemo(() => {
    return RATING_META.map((item) => {
      const entry = breakdown?.[item.key] || {};
      return {
        ...item,
        percent: Number(entry?.percent || 0),
      };
    });
  }, [breakdown]);

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="rounded-2xl border border-[#ECE5EC] bg-white p-4 shadow-sm">
        <p className="text-base font-semibold text-[#252525]">{t("overallRating") || "Overall Rating"}</p>
        <div className="mt-1 flex items-end gap-2">
          <p className="text-3xl text-[30px] font-bold leading-none text-[#212121]">{isLoading ? "..." : overallRating.toFixed(1)}</p>
          <div className="pb-0.5">
            <StarRow rating={overallRating} />
          </div>
        </div>
        <p className="mt-1 text-xs text-[#7B7B7B]">
          {String(t("basedOnReviews") || "Based on {count} reviews").replace("{count}", String(totalReviews))}
        </p>

        <div className="mt-3 space-y-2">
          {ratingBreakdown.map((item) => (
            <div key={item.key} className="flex items-center gap-4">
              <span className="w-20 text-xs text-[#3F3F3F]">{t(item.key) || item.key}</span>
              <div className="h-1.5 flex-1 rounded-full bg-[#EDEDED]">
                <div className={["h-1.5 rounded-full", item.color].join(" ")} style={{ width: `${Math.max(0, Math.min(100, item.percent))}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {error ? <p className="rounded-xl bg-[#FFF1F1] px-4 py-3 text-sm text-[#B42318]">{error}</p> : null}
      {!isLoading && !error && reviews.length === 0 ? (
        <p className="rounded-2xl border border-[#ECE5EC] bg-white px-4 py-6 text-sm text-[#7B7B7B]">No reviews found.</p>
      ) : null}

      {reviews.map((review, index) => {
        const id = review?._id || `review-${index}`;
        const user = review?.userId || {};
        const name = user?.name || "Anonymous";
        const imageUrl = getBackendImageUrl(user?.image);
        const ratingValue = Number(review?.rating || 0);
        return (
          <div key={id} className="rounded-2xl border border-[#ECE5EC] bg-white px-4 py-3 shadow-sm">
            <div className="flex items-center gap-3">
              {imageUrl ? (
                <span className="inline-flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
                  <Image src={imageUrl} alt={name} width={40} height={40} unoptimized className="h-full w-full object-cover" />
                </span>
              ) : (
                <AvatarIcon />
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#242424]">{name}</p>
                <div className="mt-1 flex items-center gap-2">
                  <StarRow rating={ratingValue} />
                  <span className="text-sm text-[#5A5A5A]">{ratingValue.toFixed(1)}</span> <span className="text-sm text-[#5A5A5A]"> {review?.reviewType ==="chat"?"Chat":review?.reviewType ==="voice_call"?"Voice Call":review?.reviewType ==="video_call"?"Video Call":"Call"} Review</span>
                </div>
                {review?.comment ? <p className="mt-1 text-xs text-[#6B6B6B]">{review.comment}</p> : null}
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
