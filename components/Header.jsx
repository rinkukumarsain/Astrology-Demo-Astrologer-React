import { Wallet } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import WithdrawModal from "./common/WithdrawModal";
import { fetchNotifications } from "@/redux/slices/notificationSlice";

function NavIcon({ name }) {
  const common = "h-5 w-5 shrink-0 text-[#6A6A6A]";
  switch (name) {
    case "bell":
      return (
        <svg className={common} width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <path d="M6.8 9a5.2 5.2 0 1 1 10.4 0v4.2l1.7 2.3a.9.9 0 0 1-.7 1.5H5.8a.9.9 0 0 1-.7-1.5l1.7-2.3V9Z" />
          <path d="M10 19a2 2 0 0 0 4 0" />
        </svg>
      );
    default:
      return null;
  }
}

const Header = ({ onMenuClick }) => {
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.dashboard.profile.data);
  const unreadCount = useSelector((state) => state.notifications.unreadCount);
  const rawBalance = profile?.balance ?? profile?.walletAmount ?? profile?.wallet?.amount ?? profile?.totalBalance ?? 2;
  const balanceValue = (Number(rawBalance || 0));

  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  useEffect(() => {
    void dispatch(fetchNotifications());
  }, [dispatch]);

  return (
    <>
      <header className="flex shrink-0 items-center justify-between border-b border-[#E8E4EC] bg-white px-3 py-3 md:px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#E8E4EC] text-[#444] lg:hidden"
            aria-label="Open sidebar"
          >
            <svg className="h-5 w-5" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
          <span className="inline-flex h-9 w-9 shrink-0 overflow-hidden rounded-full border border-[#E4DDE6] bg-white">
            <Image src="/assets/img/logo-gif.gif" alt="Nakshatra.ai logo" width={36} height={36} unoptimized className="h-full w-full object-cover" />
          </span>
          <p className="truncate text-[18px] font-semibold text-[#1F1F1F]">
            Nakshatra.ai <span className="font-normal text-[#8A8A8A]">Astrologer</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div 
            className="flex items-center justify-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1.5 cursor-pointer hover:bg-primary/20 transition-colors"
            onClick={() => setIsWithdrawModalOpen(true)}
          >
            <div className="flex items-center gap-1">
              <Wallet className="h-5 w-5 md:hidden text-primary" />
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-2 text-xs font-semibold text-white">{`\u20B9${Number(balanceValue).toFixed(2)}`}</span>
            </div>

            <span className="hidden md:inline-block ml-2 text-[11px] font-semibold tracking-[0.08em] text-primary">TOTAL BALANCE</span>
          </div>

          <Link href="/notifications" className="relative cursor-pointer rounded-full p-2 text-[#5C5C5C] hover:bg-[#F5F5F5]" aria-label="Notifications">
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#D1005A] px-1 text-[10px] font-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
            <NavIcon name="bell" />
          </Link>
        </div>
      </header>

      <WithdrawModal 
        isOpen={isWithdrawModalOpen} 
        onClose={() => setIsWithdrawModalOpen(false)} 
        balance={rawBalance} 
      />
    </>
  );
};

export default Header;
