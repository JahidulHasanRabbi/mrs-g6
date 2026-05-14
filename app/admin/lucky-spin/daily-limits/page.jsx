"use client";

import { useState } from "react";
import NavigationCards from "../../../components/admin/lucky-spin/NavigationCards";
import DailyLimitsTable from "../../../components/admin/lucky-spin/DailyLimitsTable";
import MemberActivityTable from "../../../components/admin/lucky-spin/MemberActivityTable";
import { AdminRouteGuard } from "../../../components/guards/AdminRouteGuard";

export default function DailyLimitsPage() {
  return (
    <AdminRouteGuard>
      <DailyLimitsPageContent />
    </AdminRouteGuard>
  );
}

function DailyLimitsPageContent() {
  const [activeTab, setActiveTab] = useState("daily-limits");

  return (
    <main className="min-h-screen pl-[388px] pr-10 pt-10 pb-10">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <h1 className="text-4xl font-bold leading-[1.05] text-white">
            Daily Limits
          </h1>
          <button className="flex h-[26px] w-[26px] items-center justify-center" type="button">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path
                d="M13 3.25C12.3096 3.25 11.75 3.80964 11.75 4.5V5.75C11.75 6.44036 12.3096 7 13 7C13.6904 7 14.25 6.44036 14.25 5.75V4.5C14.25 3.80964 13.6904 3.25 13 3.25Z"
                fill="#E9AF41"
              />
              <path
                d="M19.5 13C19.5 12.3096 20.0596 11.75 20.75 11.75H22C22.6904 11.75 23.25 12.3096 23.25 13C23.25 13.6904 22.6904 14.25 22 14.25H20.75C20.0596 14.25 19.5 13.6904 19.5 13Z"
                fill="#E9AF41"
              />
              <path
                d="M13 19.5C13.6904 19.5 14.25 20.0596 14.25 20.75V22C14.25 22.6904 13.6904 23.25 13 23.25C12.3096 23.25 11.75 22.6904 11.75 22V20.75C11.75 20.0596 12.3096 19.5 13 19.5Z"
                fill="#E9AF41"
              />
              <path
                d="M6.5 13C6.5 12.3096 5.94036 11.75 5.25 11.75H4C3.30964 11.75 2.75 12.3096 2.75 13C2.75 13.6904 3.30964 14.25 4 14.25H5.25C5.94036 14.25 6.5 13.6904 6.5 13Z"
                fill="#E9AF41"
              />
            </svg>
          </button>
        </div>

        {/* Navigation Cards */}
        <div className="mb-6">
          <NavigationCards activeCard="daily-limits" />
        </div>

        {/* Daily Limits Content */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          {/* Table Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            {/* Search and Sort Section (visual only) */}
            <div className="flex items-center gap-[12px]">
              <div className="border border-[#f2c36b] border-solid flex gap-[6px] items-center justify-center px-[8px] py-[6px] rounded-[4px] shrink-0 w-[817px]">
                <div className="relative shrink-0 size-[32px]">
                  <img
                    src="/assets/admin/lucky-spin/searchicon.png"
                    alt=""
                    className="absolute inset-0 h-full w-full object-contain"
                  />
                </div>
                <p className="flex-1 text-[12px] text-white leading-[1.3]">
                  Search..
                </p>
              </div>

              <button
                className="flex items-center justify-center p-[6px] rounded-[8px] shrink-0"
                type="button"
              >
                <div className="relative shrink-0 size-[42px]">
                  <img
                    src="/assets/admin/lucky-spin/sorting.png"
                    alt=""
                    className="absolute inset-0 h-full w-full object-contain"
                  />
                </div>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-[34px] items-center whitespace-nowrap">
              <button
                type="button"
                onClick={() => setActiveTab("member-activity")}
                className={`capitalize text-[20px] font-bold leading-[1.2] p-[5px] border-b ${
                  activeTab === "member-activity"
                    ? "border-[#f2c36b] text-white"
                    : "border-transparent text-white"
                }`}
              >
                Member Activity Overview Table
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("daily-limits")}
                className={`capitalize text-[20px] font-bold leading-[1.2] p-[5px] ${
                  activeTab === "daily-limits"
                    ? "border-b border-[#f2c36b] text-white"
                    : "text-white"
                }`}
              >
                Daily Limits
              </button>
            </div>
          </div>

          {/* Table Content */}
          {activeTab === "member-activity" ? (
            <MemberActivityTable />
          ) : (
            <DailyLimitsTable />
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-white/10 px-6 py-4">
            <p className="text-[12px] text-white font-bold leading-[1.3]">
              1 -10 of {activeTab === "member-activity" ? "5" : "120"}
            </p>
            <div className="flex items-center">
              <button
                type="button"
                className="flex items-center justify-center p-[4px] rounded-[8px]"
              >
                <span className="text-white">‹</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center p-[4px] rounded-[8px]"
              >
                <span className="text-white">›</span>
              </button>
            </div>
          </div>
        </div>
    </main>
  );
}
