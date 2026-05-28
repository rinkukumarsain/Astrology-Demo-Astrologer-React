"use client";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { fetchDashboardProfile } from "@/redux/slices/dashboardSlice";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import BankVerificationModal from "@/components/common/BankVerificationModal";
import IncomingCallOverlay from "@/components/common/IncomingCallOverlay";
import AadharVerificationModal from "@/components/common/AadharVerificationModal";
import PanVerificationModal from "@/components/common/PanVerificationModal";
import GlobalChatRequestPill from "@/components/common/GlobalChatRequestPill";

const ALLOWED_UNVERIFIED_ROUTES = [
  "/",
  "/kyc-details",
  "/logout",
  "/help-support",
  "/settings",
  "/about-us",
  "/privacy-policy",
  "/terms-and-conditions",
];

export default function DashboardLayout({ children }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const profileState = useSelector((state) => state.dashboard.profile);
  const pathname = usePathname();
  const [sidebarState, setSidebarState] = useState({ open: false, path: "" });
  const isSidebarOpen = sidebarState.open && sidebarState.path === pathname;

  useEffect(() => {
    if (profileState.loading || profileState.loaded) return;
    void dispatch(fetchDashboardProfile());
  }, [dispatch, profileState.loading, profileState.loaded]);

  const isProfileLoaded = profileState.loaded && profileState.data !== null;
  const isAadharVerified = isProfileLoaded ? Boolean(profileState.data?.documents?.aadharCard?.status === 1) : true;
  const isPanVerified = isProfileLoaded ? Boolean(profileState.data?.documents?.panCard?.status === 1) : true;
  const isBankVerified = isProfileLoaded ? Boolean(profileState.data?.bankDetails?.isVerified) : true;
  
  const isVerified = isAadharVerified && isPanVerified && isBankVerified;
  
  const isCurrentRouteAllowed = ALLOWED_UNVERIFIED_ROUTES.some(
    (route) => pathname === route || (route !== "/" && pathname.startsWith(`${route}/`))
  );

  const blockAccess = isProfileLoaded && !isVerified && !isCurrentRouteAllowed;

  return (
    <div className="h-full w-full overflow-hidden flex flex-col bg-red-50">
        <Header onMenuClick={() => setSidebarState({ open: true, path: pathname })} />
        <div className="flex min-h-0 flex-1 flex-row">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarState({ open: false, path: pathname })} />
          <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overflow-x-hidden p-4 md:p-5 relative">
            {!isProfileLoaded ? (
              <div className="flex flex-1 items-center justify-center">
                 <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
              </div>
            ) : blockAccess ? (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-[#888]">
                <svg className="mb-4 h-[60px] w-[60px] opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <h2 className="text-xl font-semibold mb-2">Restricted Access</h2>
                <p>Please complete your {!isAadharVerified ? "Aadhar" : !isPanVerified ? "PAN" : "Bank"} verification to access this page.</p>
                {!isAadharVerified ? (
                  <AadharVerificationModal isOpen={true} onClose={() => router.replace("/")} />
                ) : !isPanVerified ? (
                  <PanVerificationModal isOpen={true} onClose={() => router.replace("/")} />
                ) : (
                  <BankVerificationModal isOpen={true} onClose={() => router.replace("/")} />
                )}
              </div>
            ) : (
              children
            )}
          </main>
        </div>
        {isSidebarOpen ? (
          <button
            type="button"
            onClick={() => setSidebarState({ open: false, path: pathname })}
            className="fixed inset-0 z-30 cursor-pointer bg-black/35 lg:hidden"
            aria-label="Close sidebar"
          />
        ) : null}
        <IncomingCallOverlay />
        <GlobalChatRequestPill />
      </div>
  );
}
