"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import AadharVerificationModal from "@/components/common/AadharVerificationModal";
import PanVerificationModal from "@/components/common/PanVerificationModal";
import BankVerificationModal from "@/components/common/BankVerificationModal";
import { Landmark, CheckCircle2, CreditCard, IdCard } from "lucide-react";

function CardIcon({ type }) {
  const wrapperClass = "inline-flex h-13 w-13 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary";

  if (type === "fingerprint") {
    return (
      <span className={wrapperClass} aria-hidden>
        <IdCard className="h-7.5 w-7.5" strokeWidth={1.6} />
      </span>
    );
  }

  if (type === "briefcase") {
    return (
      <span className={wrapperClass} aria-hidden>
        <CreditCard className="h-7 w-7" strokeWidth={1.8} />
      </span>
    );
  }

  return (
    <span className={wrapperClass} aria-hidden>
      <Landmark className="h-7 w-7" strokeWidth={1.8} />
    </span>
  );
}

function StatusBadge({ status }) {
  const { t } = useTranslation();

  if (status === "approved") {
    return (
      <span className="inline-flex h-9 items-center gap-1 rounded-full bg-[#E4F1E8] px-4 text-xs font-semibold text-[#2F8E49]">
        <CheckCircle2 className="h-4 w-4" strokeWidth={2.5} />
        {t("approved") || "Verified"}
      </span>
    );
  }

  if (status === "pending") {
    return (
      <span className="inline-flex h-9 items-center gap-1 rounded-full bg-orange-50 px-4 text-xs font-semibold text-orange-600">
        {t("pending") || "Pending"}
      </span>
    );
  }

  return (
    <span className="inline-flex h-9 items-center gap-1 rounded-full bg-[#faeaeb] px-4 text-xs font-semibold text-primary">
      {t("notVerified") || "Not Verified"}
    </span>
  );
}



export default function KycDetailsPage() {
  const { t } = useTranslation();
  const profile = useSelector((state) => state.dashboard.profile.data);
  const [activeTab, setActiveTab] = useState("aadhar");
  const [isAadharModalOpen, setIsAadharModalOpen] = useState(false);
  const [isPanModalOpen, setIsPanModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);

  const documents = profile?.documents || {};
  const aadharDoc = documents?.aadharCard;
  const panDoc = documents?.panCard;
  const bankDetails = profile?.bankDetails;

  const maskAadhar = (value) => {
    const digits = String(value || "").replace(/\D/g, "");
    if (!digits) return "XXXX  XXXX  XXXX";
    return `XXXX  XXXX  ${digits.slice(-4)}`;
  };

  const maskPan = (value) => {
    const pan = String(value || "").toUpperCase();
    if (!pan) return "ABCDE  1234  F";
    return `${pan.slice(0, 5)}  ${pan.slice(5, 9)}  ${pan.slice(9, 10)}`.trim();
  };

  const bankLabel = (() => {
    const bankName = bankDetails?.bankName || bankDetails?.bank || "Bank";
    const accountNumber = String(bankDetails?.accountNumber || bankDetails?.accountNo || "");
    return `${bankName} ${accountNumber}`.trim();
  })();

  const verifiedItems = [
    {
      id: "aadhar",
      title: "Aadhar card number",
      value: maskAadhar(aadharDoc?.number || aadharDoc?.aadharNumber || aadharDoc),
      icon: "fingerprint",
      isAvailable: Boolean(aadharDoc),
      status: aadharDoc?.status === 1 ? "approved" : (aadharDoc?.status === 0 ? "missing" : (aadharDoc ? "pending" : "missing")),
    },
    {
      id: "pan",
      title: "Pan card number",
      value: maskPan(panDoc?.number || panDoc?.panNumber || panDoc),
      icon: "briefcase",
      isAvailable: Boolean(panDoc),
      status: panDoc?.status === 1 ? "approved" : (panDoc?.status === 0 ? "missing" : (panDoc ? "pending" : "missing")),
    },
    {
      id: "bank",
      title: "Bank account",
      value: bankLabel,
      icon: "bank",
      isAvailable: Boolean(bankDetails && (bankDetails?.accountNumber || bankDetails?.accountNo || bankDetails?.ifscCode)),
      status: bankDetails?.isVerified ? "approved" : (bankDetails?.status === 0 ? "missing" : (bankDetails ? "pending" : "missing")),
    },
  ];

  const hasBankDetails = verifiedItems.find((item) => item.id === "bank")?.isAvailable;

  const activeCount = verifiedItems.filter((item) => item.status === "approved").length;

  const renderRightPanel = () => {
    if (activeTab === "aadhar") {
      if (aadharDoc?.status === 1 && aadharDoc?.apiResponse) {
        const res = aadharDoc.apiResponse;
        return (
          <div className="rounded-xl border border-[#E2E2E2] bg-white overflow-hidden shadow-sm h-full flex flex-col">
             <div className="bg-[#FFFBF8] px-6 py-5 border-b border-[#E2E2E2]">
                <h2 className="text-lg font-semibold text-[#2F2F2F]">Aadhar Details</h2>
             </div>
             <div className="p-6 space-y-4 text-sm text-[#444] flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4 gap-y-7">
                  <div><span className="block text-xs uppercase tracking-wide text-[#888] font-semibold mb-1.5">Name</span><span className="font-semibold text-[#222] text-[15px]">{res.name || "-"}</span></div>
                  <div><span className="block text-xs uppercase tracking-wide text-[#888] font-semibold mb-1.5">Date of Birth</span><span className="font-semibold text-[#222] text-[15px]">{res.date_of_birth || "-"}</span></div>
                  <div><span className="block text-xs uppercase tracking-wide text-[#888] font-semibold mb-1.5">Gender</span><span className="font-semibold text-[#222] text-[15px]">{res.gender === 'M' ? 'Male' : res.gender === 'F' ? 'Female' : res.gender || "-"}</span></div>
                  <div><span className="block text-xs uppercase tracking-wide text-[#888] font-semibold mb-1.5">Care Of</span><span className="font-semibold text-[#222] text-[15px]">{res.care_of || "-"}</span></div>
                  <div className="col-span-2"><span className="block text-xs uppercase tracking-wide text-[#888] font-semibold mb-1.5">Full Address</span><span className="leading-relaxed text-[#222] text-[15px]">{res.full_address || "-"}</span></div>
                </div>
             </div>
          </div>
        );
      }
      return (
         <div className="rounded-xl border-2 border-dashed border-[#E4DFE7] bg-white p-8 h-full flex flex-col items-center justify-center text-center mt-0">
             <span className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-[#FFF5F2] text-primary shadow-sm mb-6">
                <IdCard className="h-7 w-7" strokeWidth={1.8} />
             </span>
             <h2 className="text-xl font-semibold leading-tight text-[#35353B]">Need to verify Aadhar?</h2>
             <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-[#777785]">Verify your Aadhar details safely to unlock full features and build trust on the platform.</p>
             <button onClick={() => setIsAadharModalOpen(true)} className="mt-8 inline-flex h-[42px] px-8 items-center justify-center rounded-full bg-primary text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(209,0,90,0.2)] hover:opacity-95 cursor-pointer">Verify Aadhar</button>
         </div>
      );
    }
    
    if (activeTab === "pan") {
      if (panDoc?.status === 1 && panDoc?.apiResponse) {
        const res = panDoc.apiResponse;
        return (
          <div className="rounded-xl border border-[#E2E2E2] bg-white overflow-hidden shadow-sm flex flex-col">
             <div className="bg-[#FFFBF8] px-6 py-5 border-b border-[#E2E2E2]">
                <h2 className="text-lg font-semibold text-[#2F2F2F]">PAN Card Details</h2>
             </div>
             <div className="p-6 space-y-4 text-sm text-[#444] flex-1">
                <div className="grid grid-cols-2 gap-4 gap-y-7 mt-2">
                  <div><span className="block text-xs uppercase tracking-wide text-[#888] font-semibold mb-1.5">PAN Number</span><span className="font-semibold text-[#222] tracking-wider text-[15px]">{res.pan || "-"}</span></div>
                  <div><span className="block text-xs uppercase tracking-wide text-[#888] font-semibold mb-1.5">Category</span><span className="font-semibold text-[#222] capitalize text-[15px]">{res.category || "-"}</span></div>  
                </div>
             </div>
          </div>
        );
      }
      return (
         <div className="rounded-xl border-2 border-dashed border-[#E4DFE7] bg-white p-8 h-full flex flex-col items-center justify-center text-center mt-0">
             <span className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-[#FFF5F2] text-primary shadow-sm mb-6">
                <CreditCard className="h-7 w-7" strokeWidth={1.8} />
             </span>
             <h2 className="text-xl font-semibold leading-tight text-[#35353B]">Need to verify PAN?</h2>
             <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-[#777785]">Verify your PAN card to ensure taxation compliance and secure transactions.</p>
             <button onClick={() => setIsPanModalOpen(true)} className="mt-8 inline-flex h-[42px] px-8 items-center justify-center rounded-full bg-primary text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(209,0,90,0.2)] hover:opacity-95 cursor-pointer">Verify PAN</button>
         </div>
      );
    }
    
    if (activeTab === "bank") {
      if (hasBankDetails) {
         return (
          <div className="rounded-xl border border-[#E2E2E2] bg-white overflow-hidden shadow-sm h-full flex flex-col justify-between">
             <div>
               <div className="bg-[#FFFBF8] px-6 py-5 border-b border-[#E2E2E2]">
                  <h2 className="text-lg font-semibold text-[#2F2F2F]">Bank Details</h2>
               </div>
               <div className="p-6 space-y-4 text-sm text-[#444] mt-2">
                  <div className="flex flex-col gap-7">
                    <div><span className="block text-xs uppercase tracking-wide text-[#888] font-semibold mb-1.5">Account Holder</span><span className="font-semibold text-[16px] text-[#222]">{bankDetails?.accountHolderName || bankDetails?.holderName || "-"}</span></div>
                    <div><span className="block text-xs uppercase tracking-wide text-[#888] font-semibold mb-1.5">Account Number</span><span className="font-semibold font-mono text-[16px] tracking-widest text-[#222]">{bankDetails?.accountNumber || bankDetails?.accountNo || "-"}</span></div>
                    <div><span className="block text-xs uppercase tracking-wide text-[#888] font-semibold mb-1.5">IFSC Code</span><span className="font-semibold text-[16px] text-[#222] tracking-wider">{bankDetails?.ifscCode || "-"}</span></div>
                  </div>
               </div>
             </div>
             <div className="p-6 pt-0 mt-4">
               <button onClick={() => setIsBankModalOpen(true)} className="inline-flex h-[44px] px-8 items-center justify-center rounded-xl bg-[#FFF5F2] border border-[#fddbd0] text-[15px] font-semibold text-primary shadow-sm hover:bg-[#ffece6] transition-colors w-full cursor-pointer">Update Bank Details</button>
             </div>
          </div>
         );
      }
      
      return (
         <div className="rounded-xl border-2 border-dashed border-[#E4DFE7] bg-white p-8 h-full flex flex-col items-center justify-center text-center mt-0">
             <span className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-[#FFF5F2] text-primary shadow-sm mb-6">
                <Landmark className="h-7 w-7" strokeWidth={1.8} />
             </span>
             <h2 className="text-xl font-semibold leading-tight text-[#35353B]">Need to add bank details?</h2>
             <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-[#777785]">Add your bank account information to receive payouts securely and complete your verification profile.</p>
             <button onClick={() => {
                  setBankForm({ holderName: "", accountNumber: "", ifsc: "" });
                  setIsBankModalOpen(true);
                }} className="mt-8 inline-flex h-[42px] px-8 items-center justify-center rounded-full bg-primary text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(209,0,90,0.2)] hover:opacity-95 cursor-pointer">Add Bank Details</button>
         </div>
      );
    }
    return null;
  };

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-[#2B2B2B]">{t("kycDetails") || "KYC Details"}</h1>
        <span className="inline-flex rounded-full bg-[#F2EFEE] px-3 py-1 text-[11px] font-semibold tracking-wide text-[#767676]">
          {`${activeCount} ${t("approved") || "ACTIVE"}`}
        </span>
      </div>
      <section className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-7">
          <div className="flex flex-col gap-3">
            {verifiedItems.map((item) => (
              <div 
                key={item.id} 
                onClick={() => setActiveTab(item.id)}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-4 shadow-sm transition-all ${
                  activeTab === item.id 
                    ? "border-primary bg-[#FFFBF8] ring-1 ring-primary/20" 
                    : "border-[#EFE7EE] bg-white hover:border-[#D0C5CF]"
                }`}
              >
                <div className="flex min-w-0 items-center gap-4 pointer-events-none">
                  <CardIcon type={item.icon} />
                  <div className="min-w-0">
                    <p className={`truncate text-sm font-semibold leading-tight ${activeTab === item.id ? "text-primary" : "text-[#373737]"}`}>{t(item.id === "aadhar" ? "aadharCardNumber" : item.id === "pan" ? "panCardNumber" : "bankAccount") || item.title}</p>
                    <p className="mt-1.5 truncate text-[13px] text-[#666] font-medium">{item.value}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 pointer-events-none">
                  <StatusBadge status={item.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12 xl:col-span-5 relative">
          <div className="sticky top-0 h-full">
            {renderRightPanel()}
          </div>
        </div>

        <AadharVerificationModal
          isOpen={isAadharModalOpen}
          onClose={() => setIsAadharModalOpen(false)}
          onSuccess={() => {
            setIsAadharModalOpen(false);
            if (!profile?.documents?.panCard) {
              setIsPanModalOpen(true);
            }
          }}
        />

        <PanVerificationModal
          isOpen={isPanModalOpen}
          onClose={() => setIsPanModalOpen(false)}
          onSuccess={() => {
            setIsPanModalOpen(false);
            if (!profile?.bankDetails?.isVerified) {
              setIsBankModalOpen(true);
            }
          }}
        />
        <BankVerificationModal
          isOpen={isBankModalOpen}
          onClose={() => setIsBankModalOpen(false)}
          isEditMode={true}
        />
      </section>
    </>
  );
}

