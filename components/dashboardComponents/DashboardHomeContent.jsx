"use client";

import ChatRequest from "@/components/dashboardComponents/ChatRequest";
import EarningOverview from "@/components/dashboardComponents/EarningOverview";
import Earnings from "@/components/dashboardComponents/Earnings";
import Greeting from "@/components/dashboardComponents/Greeting";
import Performance from "@/components/dashboardComponents/Performance";
import RecentPayouts from "@/components/dashboardComponents/RecentPayouts";
import { fetchDashboardAnalytics } from "@/redux/slices/dashboardSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function DashboardHomeContent() {
  const dispatch = useDispatch();
  const analyticsState = useSelector((state) => state.dashboard.analytics);

  useEffect(() => {
    if (analyticsState.loading || analyticsState.loaded) return;
    const now = new Date();
    void dispatch(fetchDashboardAnalytics({ month: now.getMonth() + 1, year: now.getFullYear() }));
  }, [dispatch, analyticsState.loading, analyticsState.loaded]);

  return (
    <>
      <Greeting />
      <ChatRequest />
      <Performance />
      <Earnings />   
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <RecentPayouts />
        <EarningOverview />
      </section>
    </>
  );
}


