"use client";

import { API_ENDPOINTS } from "@/constants/apiConstants";
import { getAPI } from "@/lib/apiServices";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const FAQ_ITEMS = [
  {
    id: "faq-1",
    question: "How can I join as an astrologer?",
    answer:
      "You can register from the signup flow, complete profile details, upload required verification documents, and submit for approval.",
  },
  {
    id: "faq-2",
    question: "How long does approval take?",
    answer:
      "Approval usually takes 24 to 72 hours after successful verification of your details and submitted documents.",
  },
  {
    id: "faq-3",
    question: "How do payouts work?",
    answer:
      "Your earnings are settled to your linked bank account as per the platform payout cycle after applicable deductions.",
  },
  {
    id: "faq-4",
    question: "Is astrology guaranteed to be accurate?",
    answer:
      "Astrology is interpretive and guidance-based. Results vary by person, and outcomes depend on multiple real-life factors.",
  },
  {
    id: "faq-5",
    question: "How do I report a problem or complaint?",
    answer:
      "Use WhatsApp, email, or call support from this page and share your registered details with a short issue description.",
  },
];

function ArrowRightIcon() {
  return (
    <svg className="h-5 w-5" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg
      className={["h-5 w-5 text-[#6A6A6A] transition-transform", open ? "rotate-180" : ""].join(" ")}
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#EAFBF0] text-[#25D366]">
      <svg className="h-5 w-5" width={20} height={20} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M19.1 4.9A9.87 9.87 0 0 0 12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 19.1 4.9Zm-7.1 15a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20Zm4.4-6c-.2-.1-1.2-.6-1.4-.6-.2-.1-.3-.1-.5.1l-.7.8c-.1.1-.3.2-.4.1a6.5 6.5 0 0 1-1.9-1.2 7.2 7.2 0 0 1-1.3-1.6c-.1-.2 0-.3.1-.4l.3-.4.2-.3c.1-.1.1-.3 0-.4l-.6-1.5c-.1-.2-.2-.2-.4-.2h-.3c-.1 0-.4.1-.6.3-.2.2-.8.8-.8 1.9 0 1 .8 2.1.9 2.3.1.1 1.6 2.5 4 3.4.5.2 1 .4 1.4.5.6.2 1.1.2 1.5.1.5-.1 1.2-.5 1.4-.9.2-.5.2-.9.2-1 0-.1-.2-.2-.4-.3Z" />
      </svg>
    </span>
  );
}

function EmailIcon() {
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F3F3] text-[#555]">
      <svg className="h-5 w-5" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" />
        <path d="m22 7-10 7L2 7" />
      </svg>
    </span>
  );
}

function CallIcon() {
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F3F3] text-[#555]">
      <svg className="h-5 w-5" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1A19.4 19.4 0 0 1 5.2 13 19.8 19.8 0 0 1 2 4.3 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.6a2 2 0 0 1-.4 2L8 9.6a16 16 0 0 0 6.4 6.4l1.3-1.3a2 2 0 0 1 2-.4c.8.3 1.7.6 2.6.7A2 2 0 0 1 22 16.9Z" />
      </svg>
    </span>
  );
}

function ContactCard({ icon, title, subtitle, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[62px] w-full cursor-pointer items-center justify-between rounded-2xl border border-[#EAE5EC] bg-white px-4 shadow-sm"
    >
      <span className="flex items-center gap-3">
        {icon}
        <span className="text-left">
          <span className="block text-sm font-semibold text-[#232323]">{title}</span>
          <span className="mt-1 block text-xs text-[#8A8A8A]">{subtitle}</span>
        </span>
      </span>
      <span className="text-[#2E2E2E]">
        <ArrowRightIcon />
      </span>
    </button>
  );
}

function FaqItem({ item, open, onToggle }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#EAE5EC] bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-4 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-[#1F1F1F]">{item.question}</span>
        <ChevronIcon open={open} />
      </button>
      {open ? <p className="border-t border-[#F0ECF4] px-4 py-3 text-sm leading-6 text-[#696969]">{item.answer}</p> : null}
    </div>
  );
}

export default function HelpSupportPage() {
  const { t } = useTranslation();
  const [openFaqId, setOpenFaqId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [faqItems, setFaqItems] = useState(FAQ_ITEMS);
  const [supportInfo, setSupportInfo] = useState({
    email: "info@nakshatraai.ai",
    phone: "9289604412",
    whatsapp: "9289604412",
  });

  useEffect(() => {
    let isMounted = true;

    const loadHelpSupportData = async () => {
      try {
        setIsLoading(true);
        const response = await getAPI(`${API_ENDPOINTS.GET_CMS}?userType=astrologer&pagetype=faqs`);
        const data = response?.data?.data || {};
        const cms = data?.cms || {};
        const rawFaqs = cms?.contenForFaqs || cms?.contentForFaqs || [];

        const parsedFaqs = Array.isArray(rawFaqs)
          ? rawFaqs
              .filter((item) => item?.question || item?.answer)
              .map((item, index) => ({
                id: item?._id || `faq-${index + 1}`,
                question: item?.question || "",
                answer: item?.answer || "",
              }))
          : [];

        if (!isMounted) return;

        if (parsedFaqs.length > 0) {
          setFaqItems(parsedFaqs);
        }

        setSupportInfo({
          email: data?.suppoertEmail || data?.supportEmail || "info@nakshatraai.ai",
          phone: data?.supportPhone || "9289604412",
          whatsapp: data?.supportWhatsApp || data?.supportWhatsapp || "9289604412",
        });
      } catch {
        // keep fallback static data if API fails
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadHelpSupportData();

    return () => {
      isMounted = false;
    };
  }, []);

  const supportCards = [
    {
      key: "whatsapp",
      icon: <WhatsAppIcon />,
      title: t("whatsApp") || "WhatsApp",
      subtitle: supportInfo.whatsapp || t("quickHelpMessaging") || "Quick help messaging",
      onClick: () => {
        const cleanNumber = String(supportInfo.whatsapp || "").replace(/\D/g, "");
        if (cleanNumber) {
          window.open(`https://wa.me/${cleanNumber}`, "_blank", "noopener,noreferrer");
        }
      },
    },
    {
      key: "email",
      icon: <EmailIcon />,
      title: t("email") || "Email",
      subtitle: supportInfo.email || t("responseWithin24Hour") || "Response within 24h",
      onClick: () => {
        const email = String(supportInfo.email || "").trim();
        if (email) {
          const gmailComposeUrl = `https://mail.google.com/mail/u/0/?fs=1&to=${encodeURIComponent(email)}&tf=cm`;
          window.open(gmailComposeUrl, "_blank", "noopener,noreferrer");
        }
      },
    },
    {
      key: "call",
      icon: <CallIcon />,
      title: t("callUs") || "Call Us",
      subtitle: supportInfo.phone || "Mon - Fri, 9am - 6pm",
      onClick: () => {
        const cleanNumber = String(supportInfo.phone || "").replace(/\D/g, "");
        if (cleanNumber) {
          window.location.href = `tel:${cleanNumber}`;
        }
      },
    },
  ];

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-3">
      {isLoading
        ? [1, 2, 3].map((item) => (
            <div key={item} className="h-[62px] w-full animate-pulse rounded-2xl border border-[#EAE5EC] bg-white px-4 shadow-sm" />
          ))
        : supportCards.map((card) => (
            <ContactCard key={card.key} icon={card.icon} title={card.title} subtitle={card.subtitle} onClick={card.onClick} />
          ))}

      <h2 className="pt-1 text-base font-semibold text-[#262626]">
        {t("frequentlyAskedQuestions") || "Frequently Asked Questions"}
      </h2>

      <div className="flex flex-col gap-2">
        {isLoading
          ? [1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="h-14 w-full animate-pulse rounded-2xl border border-[#EAE5EC] bg-white shadow-sm" />
            ))
          : faqItems.map((item) => (
              <FaqItem
                key={item.id}
                item={item}
                open={openFaqId === item.id}
                onToggle={() => setOpenFaqId((prev) => (prev === item.id ? null : item.id))}
              />
            ))}
      </div>
    </section>
  );
}
