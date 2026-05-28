"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { addOffer, editOffer } from "@/redux/slices/dashboardSlice";

const SERVICE_OPTIONS = ["Video Call", "Voice Call", "Chat"];

export default function NewOfferPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSubmitting = useSelector((state) => state.dashboard.offerCreate.loading);
  const isEditing = useSelector((state) => state.dashboard.offerEdit.loading);
  const isSaving = isSubmitting || isEditing;

  const editId = searchParams.get("editId");
  const isEditMode = Boolean(editId);
  const initialServices = useMemo(() => {
    const raw = searchParams.get("services") || "";
    return raw
      .split(",")
      .map((item) => item.trim())
      .filter((item) => SERVICE_OPTIONS.includes(item));
  }, [searchParams]);

  const [discountType, setDiscountType] = useState(searchParams.get("discountType") || "amount");
  const [title, setTitle] = useState(searchParams.get("title") || "");
  const [selectedServices, setSelectedServices] = useState(initialServices.length > 0 ? initialServices : ["Video Call"]);
  const [amount, setAmount] = useState(searchParams.get("discount") || "");
  const [validFrom, setValidFrom] = useState(searchParams.get("validFrom") || "");
  const [validTo, setValidTo] = useState(searchParams.get("validTo") || "");

  const validate = () => {
    if (!discountType) return "Discount type is required";
    if (!title.trim()) return "Title is required";
    if (selectedServices.length === 0) return "Select at least one applicable service";
    const amountNum = Number(amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) return "Please enter a valid amount";
    if (discountType === "percentage" && amountNum > 100) return "Percentage discount cannot exceed 100";
    if (!validFrom) return "Valid from date is required";
    if (!validTo) return "Valid to date is required";
    if (new Date(validTo) < new Date(validFrom)) return "Valid to date must be after valid from date";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      toast.error(validationError);
      return;
    }
    const payload = {
      title: title.trim(),
      discountType,
      discount: Number(amount),
      applicableServices: selectedServices,
      type: "astrologer",
      validFrom,
      validTo,
    };
    try {
      const result = isEditMode
        ? await dispatch(editOffer({ offerId: editId, payload })).unwrap()
        : await dispatch(addOffer(payload)).unwrap();
      toast.success(result?.message || (isEditMode ? "Offer updated successfully" : "Offer created successfully"));
      router.push("/offers");
    } catch (errorMessage) {
      toast.error(errorMessage || (isEditMode ? "Unable to update offer" : "Unable to create offer"));
    }
  };

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm md:p-5">
      <div className="mb-4">
        <Link href="/offers" className="inline-flex items-center text-[#2F2F2F]">
          <svg className="h-5 w-5" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1 block text-sm font-medium text-[#333]">Discount type<span className="text-[#D1005A]">*</span></label>
          <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} className="h-11 w-full rounded-lg border border-[#D9D2DE] px-3 text-sm outline-none">
            <option value="amount">Amount</option>
            {/* <option value="percentage">Percentage</option> */}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[#333]">Title<span className="text-[#D1005A]">*</span></label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title"
            className="h-11 w-full rounded-lg border border-[#D9D2DE] px-3 text-sm outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[#333]">Applicable services<span className="text-[#D1005A]">*</span></label>
          <div className="flex flex-wrap gap-2">
            {SERVICE_OPTIONS.map((service) => {
              const selected = selectedServices.includes(service);
              return (
                <button
                  key={service}
                  type="button"
                  onClick={() =>
                    setSelectedServices((prev) => (prev.includes(service) ? prev.filter((item) => item !== service) : [...prev, service]))
                  }
                  className={[
                    "cursor-pointer rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                    selected ? "border-primary bg-primary/10 text-primary" : "border-[#D9D2DE] bg-white text-[#4F4F4F] hover:border-primary/50",
                  ].join(" ")}
                >
                  {service}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[#333]">Amount<span className="text-[#D1005A]">*</span></label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="h-11 w-full rounded-lg border border-[#D9D2DE] px-3 text-sm outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#333]">Valid from<span className="text-[#D1005A]">*</span></label>
            <input type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} className="h-11 w-full rounded-lg border border-[#D9D2DE] px-3 text-sm outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#333]">Valid to<span className="text-[#D1005A]">*</span></label>
            <input type="date" value={validTo} onChange={(e) => setValidTo(e.target.value)} className="h-11 w-full rounded-lg border border-[#D9D2DE] px-3 text-sm outline-none" />
          </div>
        </div>

        <div className="pt-2 text-center">
          <button type="submit" disabled={isSaving} className="h-11 min-w-50 rounded-xl bg-primary px-6 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
            {isSaving ? "Submitting..." : isEditMode ? "Update" : "Submit"}
          </button>
        </div>
      </form>
    </section>
  );
}
