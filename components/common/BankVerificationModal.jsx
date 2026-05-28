"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { patchAPIAuth, postAPIAuth } from "@/lib/apiServices";
import { API_ENDPOINTS } from "@/constants/apiConstants";
import { fetchDashboardProfile } from "@/redux/slices/dashboardSlice";

export default function BankVerificationModal({ isOpen, onClose, isEditMode = false }) {
  const [holderName, setHolderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const loadingState = useSelector((state) => state.dashboard.profile.loading);
  const profile = useSelector((state) => state.dashboard.profile.data);

  // Pre-fill or reset state when modal opens/closes
  useEffect(() => {
    if (isOpen && isEditMode) {
      if (profile?.bankDetails) {
        const bd = profile.bankDetails;
        setHolderName(bd.accountHolderName || bd.holderName || "");
        const accNum = String(bd.accountNumber || bd.accountNo || "");
        setAccountNumber(accNum);
        setConfirmAccountNumber(accNum);
        setIfsc(bd.ifscCode || bd.ifsc || "");
      }
    } else if (!isOpen) {
      setHolderName("");
      setAccountNumber("");
      setConfirmAccountNumber("");
      setIfsc("");
    }
  }, [isOpen, profile, isEditMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();

    if (!holderName || !accountNumber || !confirmAccountNumber || !ifsc) {
      toast.error("Please fill all fields");
      return;
    }

    if (accountNumber !== confirmAccountNumber) {
      toast.error("Account numbers do not match");
      return;
    }

    setLoading(true);
    try {
      // Using UPDATE_ASTROLOGER_DETAIL as the endpoint to save bank details
      const response = await postAPIAuth(API_ENDPOINTS.VERIFY_BANK, {
        accountNumber: accountNumber,
        ifsc: ifsc,
      });

      if (response?.data?.status) {
        toast.success(response?.data?.message || "Bank details submitted successfully!");
        await dispatch(fetchDashboardProfile());
        if (onClose) onClose();
      } else {
        toast.error(response?.data?.message || "Failed to submit bank details");
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to submit bank details";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="relative flex w-full max-w-[480px] min-h-[600px] flex-col rounded-[24px] bg-[#FFFBF8] p-6 shadow-xl md:p-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex cursor-pointer items-center justify-center p-1 text-[#1A1A1A] hover:bg-neutral-100 rounded-full"
            aria-label="Go back"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-xl font-semibold text-[#1A1A1A]">Bank Details</h2>
        </div>

        {/* Form Body */}
        <div className="flex-1 space-y-5">
          <div>
            <div className="mb-2 text-sm font-semibold text-[#333333]">Account Holder Name</div>
            <input
              type="text"
              className="w-full rounded-xl border border-[#D1D1D1] bg-white px-4 py-3.5 text-base text-[#333333] placeholder-[#A0A0A0] outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="Enter Account Holder name"
              value={holderName}
              onChange={(e) => setHolderName(e.target.value)}
            />
          </div>

          <div>
            <div className="mb-2 text-sm font-semibold text-[#333333]">Account Number</div>
            <input
              type="password"
              className="w-full rounded-xl border border-[#D1D1D1] bg-white px-4 py-3.5 text-base text-[#333333] placeholder-[#A0A0A0] outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="Enter Account number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
            />
          </div>

          <div>
            <div className="mb-2 text-sm font-semibold text-[#333333]">Re-Enter Account Number</div>
            <input
              type="text"
              className="w-full rounded-xl border border-[#D1D1D1] bg-white px-4 py-3.5 text-base text-[#333333] placeholder-[#A0A0A0] outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="Re-Enter Account Number"
              value={confirmAccountNumber}
              onChange={(e) => setConfirmAccountNumber(e.target.value.replace(/\D/g, ""))}
            />
          </div>

          <div>
            <div className="mb-2 text-sm font-semibold text-[#333333]">IFSC Code</div>
            <input
              type="text"
              className="w-full rounded-xl border border-[#D1D1D1] bg-white px-4 py-3.5 text-base text-[#333333] placeholder-[#A0A0A0] outline-none focus:border-primary focus:ring-1 focus:ring-primary uppercase"
              placeholder="IFSC Code"
              value={ifsc}
              onChange={(e) => setIfsc(e.target.value.toUpperCase())}
              maxLength={11}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-8">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!holderName || !accountNumber || !confirmAccountNumber || !ifsc || loading}
            className="w-full rounded-xl bg-[#E66344] py-4 text-center text-lg font-semibold text-white shadow-sm hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
