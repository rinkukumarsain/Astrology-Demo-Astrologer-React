"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { deleteOffer, fetchOffers } from "@/redux/slices/dashboardSlice";

function formatDate(raw) {
  if (!raw) return "-";
  const dt = new Date(raw);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function getServiceBadge(services) {
  const arr = Array.isArray(services) ? services : [];
  if (arr.length === 0 || arr.length >= 3) return "ALL SERVICES";
  return arr.join(", ").toUpperCase();
}

function getOfferValueText(offer) {
  const discount = Number(offer?.discount || 0);
  if (offer?.discountType === "percentage") {
    return { primary: `${discount}%`, suffix: "sitewide" };
  }
  const suffix = Array.isArray(offer?.applicableServices) && offer.applicableServices.length > 1 ? "off" : "flat off";
  return { primary: `\u20B9${discount}`, suffix };
}

export default function CreateOfferPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const offersState = useSelector((state) => state.dashboard.offers);
  const [currentPage, setCurrentPage] = useState(1);
  const [offerToDelete, setOfferToDelete] = useState(null);
  const isLoading = offersState.loading;
  const error = offersState.error;
  const isDeleting = useSelector((state) => state.dashboard.offerDelete.loading);
  const offers = Array.isArray(offersState.data) ? offersState.data : [];
  const totalPages = offersState.totalPages || 1;
  const totalCount = offersState.totalCount || 0;

  useEffect(() => {
    void dispatch(fetchOffers({ page: currentPage, perPage: 10 }));
  }, [currentPage, dispatch]);

  const handleConfirmDelete = async () => {
    if (!offerToDelete?._id) return;
    try {
      const result = await dispatch(deleteOffer(offerToDelete._id)).unwrap();
      toast.success(result?.message || "Offer deleted successfully");
      setOfferToDelete(null);
      void dispatch(fetchOffers({ page: currentPage, perPage: 10 }));
    } catch (errorMessage) {
      toast.error(errorMessage || "Unable to delete offer");
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
        <div>
          <h1 className="text-lg font-semibold text-[#1F1F1F]">Offers</h1>
          <p className="text-xs text-[#7A7A7A]">Manage your offers and discounts.</p>
        </div>
        <Link href="/offers/new" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
          Create Offer
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {offers?.map((offer, index) => {
          const id = offer._id || offer.id || `offer-${index}`;
          const value = getOfferValueText(offer);
          return (
            <article key={id} className="rounded-xl border border-[#ECE8F1] bg-white p-4 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-3">
                <span className="rounded-full bg-primary-light px-3 py-1 text-xs font-semibold tracking-wide text-primary">{getServiceBadge(offer?.applicableServices)}</span>
                <div className="inline-flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/offers/new?editId=${encodeURIComponent(id)}&title=${encodeURIComponent(offer.title || "")}&discountType=${encodeURIComponent(
                          offer.discountType || "amount",
                        )}&discount=${encodeURIComponent(String(offer.discount ?? ""))}&services=${encodeURIComponent(
                          (Array.isArray(offer.applicableServices) ? offer.applicableServices : []).join(","),
                        )}&validFrom=${encodeURIComponent(String(offer.validFrom || "").slice(0, 10))}&validTo=${encodeURIComponent(
                          String(offer.validTo || "").slice(0, 10),
                        )}`,
                      )
                    }
                    className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-[#555] hover:bg-[#F5F2F8] hover:text-primary"
                    aria-label="Edit offer"
                  >
                    <svg className="h-3.5 w-3.5" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOfferToDelete(offer)}
                    className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-[#D6455B] hover:bg-[#FFF3F5]"
                    aria-label="Delete offer"
                  >
                    <svg className="h-3.5 w-3.5" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M3 6h18" />
                      <path d="M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6" />
                    </svg>
                  </button>
                </div>
              </div>
              <h3 className="text-xl leading-tight font-semibold text-[#2A2A2A]">{offer.title || `Offer ${index + 1}`}</h3>
              <p className="mt-1 text-sm text-[#7A7A7A]">{`Created: ${formatDate(offer.createdAt)}`}</p>
              <div className="mt-7 flex items-end gap-2">
                <span className="text-3xl font-bold leading-none text-primary">{value.primary}</span>
                <span className="pb-1 text-base font-medium leading-none text-[#5B5B5B]">{value.suffix}</span>
              </div>
            </article>
          );
        })}
      </div>
      {!isLoading && !error && offers.length === 0 ? <div className="rounded-2xl bg-white px-4 py-8 text-center text-sm text-[#7A7A7A] shadow-sm">No offers found.</div> : null}
      {isLoading ? <div className="rounded-2xl bg-white px-4 py-3 text-sm text-[#7A7A7A] shadow-sm">Loading offers...</div> : null}
      {error ? <div className="rounded-2xl bg-white px-4 py-3 text-sm text-[#B42318] shadow-sm">{error}</div> : null}

      <div className="flex items-center justify-between rounded-xl bg-white px-4 py-2 text-sm text-[#5D5D5D] shadow-sm">
        <span>{`Total: ${totalCount}`}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={isLoading || currentPage <= 1}
            className="rounded-md border border-[#E3DEE7] px-2.5 py-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Prev
          </button>
          <span>{`Page ${currentPage} / ${totalPages}`}</span>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={isLoading || currentPage >= totalPages}
            className="rounded-md border border-[#E3DEE7] px-2.5 py-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {offerToDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-base font-semibold text-[#1F1F1F]">Delete Offer</h3>
            <p className="mt-2 text-sm text-[#5D5D5D]">
              Are you sure you want to delete <span className="font-semibold text-[#1F1F1F]">{offerToDelete.title || "this offer"}</span>?
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOfferToDelete(null)}
                disabled={isDeleting}
                className="rounded-lg border border-[#D9D2DE] px-3.5 py-2 text-sm text-[#4F4F4F] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="rounded-lg bg-[#D6455B] px-3.5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
