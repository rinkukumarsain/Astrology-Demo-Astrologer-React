"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { getBackendImageUrl } from "@/lib/getBackendImageUrl";
import AadharVerificationModal from "@/components/common/AadharVerificationModal";
import PanVerificationModal from "@/components/common/PanVerificationModal";
import BankVerificationModal from "@/components/common/BankVerificationModal";
import LogoutModal from "@/components/common/LogoutModal";
import { removeCookie } from "@/lib/clientHelpers";
import { postAPIAuth, getAPIAuth } from "@/lib/apiServices";
import { API_ENDPOINTS } from "@/constants/apiConstants";
import React, { useState } from "react";
import { AUTH_TOKEN_KEY, FIREBASE_FCM_TOKEN } from "@/constants/others";
import toast from "react-hot-toast";
import { resetDashboard } from "@/redux/slices/dashboardSlice";
import { clearActiveChat, clearIncomingRequests } from "@/redux/slices/chatSlice";
import {
  LayoutDashboard,
  FileText,
  Star,
  BookOpen,
  TicketPercent,
  ShieldCheck,
  FileSignature,
  Headset,
  Settings,
  LogOut,
  Users,
  ClipboardClock,
  BanknoteArrowDown
  
} from "lucide-react";

const MENU = [
  { labelKey: "dashboard", fallbackLabel: "Dashboard", icon: LayoutDashboard, href: "/" },
  { labelKey: "kycDetails", fallbackLabel: "KYC Details", icon: FileText, href: "/kyc-details" },
  { labelKey: "payoutHistory", fallbackLabel: "Payout History", icon: BanknoteArrowDown, href: "/payout-history" },
  { labelKey: "reviewRatings", fallbackLabel: "Review & Ratings", icon: Star, href: "/review-ratings" },
  { labelKey: "Blogs", fallbackLabel: "Blogs", icon: BookOpen, href: "/blogs" },
  { labelKey: "Create Offer", fallbackLabel: "Create Offer", icon: TicketPercent, href: "/offers" },
  { labelKey: "Sessions", fallbackLabel: "Sessions", icon: ClipboardClock, href: "/sessions" },
  { labelKey: "About Us", fallbackLabel: "About Us", icon: Users, href: "/about-us" },
  { labelKey: "privacyPolicy", fallbackLabel: "Privacy Policy", icon: ShieldCheck, href: "/privacy-policy" },
  { labelKey: "termsConditions", fallbackLabel: "Terms & Conditions", icon: FileSignature, href: "/terms-and-conditions" },
  { labelKey: "helpSupport", fallbackLabel: "Support", icon: Headset, href: "/help-support" },
  { labelKey: "settings", fallbackLabel: "Settings", icon: Settings, href: "/settings" },
  { labelKey: "logout", fallbackLabel: "Logout", icon: LogOut, href: "/logout" },
];

function isActivePath(pathname, href) {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

// MenuIcon has been removed since we use Lucide icons directly

const Sidebar = ({ isOpen = false, onClose }) => {
  const pathname = usePathname();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { data: profile, loading: profileLoading, loaded: profileLoaded } = useSelector((state) => state.dashboard.profile);
  const [isAadharModalOpen, setIsAadharModalOpen] = useState(false);
  const [isPanModalOpen, setIsPanModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const router = useRouter();

  const handleLogoutConfirm = async () => {
    try {
      await getAPIAuth(API_ENDPOINTS.LOGOUT);
    } catch (error) {
      console.error("Logout API failed:", error);
    } finally {
      // Clear all Redux state so next login doesn't see stale data
      dispatch(resetDashboard());
      dispatch(clearActiveChat());
      dispatch(clearIncomingRequests());

      // Remove auth credentials
      removeCookie(AUTH_TOKEN_KEY);
      sessionStorage.removeItem(FIREBASE_FCM_TOKEN);
      sessionStorage.removeItem("ASTROLOGER_ONLINE_STATUS_PERSIST");
      localStorage.removeItem("ASTROLOGER_ONLINE_STATUS_PERSIST"); // Cleanup old one just in case

      // Hard redirect — completely flushes Redux store & JS memory
      window.location.replace("/login");
    }
  };
  const displayName = profile?.fullName || profile?.name || "Astrologer";
  const experience = profile?.experience || "";
  const followerCount = Array.isArray(profile?.followers)
    ? profile.followers.length
    : profile?.followersCount ?? profile?.followers ?? 0;
  const profileImagePath = profile?.image ? getBackendImageUrl(profile.image) : "";

  return (
    <>
        <aside
          className={[
            "fixed inset-y-0 left-0 z-40 flex w-55 shrink-0 flex-col border-r border-primary/15 bg-white transition-transform duration-200 ease-out md:w-62.5 lg:static lg:z-auto lg:translate-x-0",
            isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          ].join(" ")}
        >
          {(!profileLoaded || profileLoading) && !profile ? (
            <div className="m-3 block rounded-2xl border border-primary/20 bg-white p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="h-14 w-14 shrink-0 rounded-full bg-primary/10 border border-primary/25" />
                <div className="min-w-0 flex-1 space-y-2 py-1">
                  <div className="h-4 w-3/4 rounded bg-gray-200" />
                  <div className="h-3 w-1/2 rounded bg-gray-100" />
                  <div className="h-3 w-2/3 rounded bg-gray-100" />
                </div>
              </div>
            </div>
          ) : (
            <Link href="/profile" onClick={onClose} className="m-3 block rounded-2xl border border-primary/20 bg-white p-4 transition-colors hover:bg-primary/5">
              <div className="flex gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary/25 bg-primary/10 text-xl font-bold text-primary">
                  {profileImagePath ? (
                    <img src={profileImagePath} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <span>{displayName?.charAt(0)?.toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#1a1a1a]">{displayName}</p>
                  <p className="text-xs text-primary/80 line-clamp-1">{`Exp: ${experience}`}</p>
                  <p className="text-xs text-primary/80">{`Followers: ${followerCount}`}</p>
                </div>
              </div>
            </Link>
          )}
          <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 pb-4">
            {MENU.map((item) => {
              const isAllowedIfUnverified = ["/", "/kyc-details", "/logout", "/help-support", "/settings","/about-us",
    "/privacy-policy",
    "/terms-and-conditions",].includes(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    if (item.href === "/logout") {
                      e.preventDefault();
                      setIsLogoutModalOpen(true);
                      if (onClose) onClose();
                      return;
                    }

                    if (profile?.documents?.aadharCard?.status !== 1 && !isAllowedIfUnverified) {
                      e.preventDefault();
                      setIsAadharModalOpen(true);
                      return;
                    }
                    if (profile?.documents?.panCard?.status !== 1 && !isAllowedIfUnverified) {
                      e.preventDefault();
                      setIsPanModalOpen(true);
                      return;
                    }
                    if (!profile?.bankDetails?.isVerified && !isAllowedIfUnverified) {
                      e.preventDefault();
                      setIsBankModalOpen(true);
                      return;
                    }
                    if (onClose) onClose();
                  }}
                  className={[
                    "flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors",
                    isActivePath(pathname, item.href)
                      ? "bg-primary/12 font-medium text-primary"
                      : "text-[#444] hover:bg-primary/8 hover:text-primary",
                  ].join(" ")}
                >
                  <item.icon className="h-5 w-5 shrink-0" strokeWidth={1.8} />
                  <span className="flex-1">{t(item.labelKey) || item.fallbackLabel}</span>
                  {item.badge === "check" ? (
                    <span className="text-green-600" aria-hidden>
                      ✓
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </aside>

        <AadharVerificationModal
          isOpen={isAadharModalOpen}
          onClose={() => setIsAadharModalOpen(false)}
          onSuccess={() => {
            setIsAadharModalOpen(false);
            if (profile?.documents?.panCard?.status !== 1) {
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
        />
        <LogoutModal
          isOpen={isLogoutModalOpen}
          onClose={() => setIsLogoutModalOpen(false)}
          onConfirm={handleLogoutConfirm}
        />
    </>
  )
}

export default Sidebar
