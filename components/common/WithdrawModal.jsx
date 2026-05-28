import React, { useEffect, useState } from "react";
import { postAPIAuth } from "@/lib/apiServices";
import { toast } from "react-hot-toast";

export default function WithdrawModal({ isOpen, onClose, balance }) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setAmount("");
      return undefined;
    }
    const handleEsc = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleWithdraw = async () => {
    if (!amount) {
      toast.error("Please enter an amount");
      return;
    }
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 500 || numAmount > 2000) {
      toast.error("Amount must be between 500 and 2000");
      return;
    }
    if (numAmount > balance) {
      toast.error("Insufficient balance");
      return;
    }

    try {
      setLoading(true);
      const res = await postAPIAuth("/api/astrologer/payout/request", { amount: numAmount });
      if (res?.data?.status) {
        toast.success(res?.data?.message || "Payout requested successfully");
        onClose();
      } else {
        toast.error(res?.data?.message || "Failed to request payout");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative flex w-full max-w-[500px] flex-col rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Withdraw Funds</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="mb-6 flex items-center gap-2">
          <span className="text-gray-600">Total Balance:</span>
          <span className="text-lg font-bold text-gray-900">₹{Number(balance).toFixed(2)}</span>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter Amount
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
            <input
              type="number"
              min="0"
              value={amount}
              onChange={(e) => {
                const val = e.target.value;
                if (Number(val) < 0) return;
                setAmount(val);
              }}
              placeholder="0"
              className="w-full rounded-xl border border-gray-300 py-3 pl-8 pr-4 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            You can withdraw between ₹500 and ₹2000
          </p>
        </div>

        <button
          onClick={handleWithdraw}
          disabled={loading}
          className="w-full cursor-pointer rounded-full bg-primary py-3.5 text-[15px] font-semibold text-white shadow-md transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : "Withdraw"}
        </button>
      </div>
    </div>
  );
}
