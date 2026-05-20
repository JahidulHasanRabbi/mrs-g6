"use client";

import { useState } from "react";
import DailyLimitsTable from "../../../components/admin/lucky-spin/DailyLimitsTable";
import MemberActivityTable from "../../../components/admin/lucky-spin/MemberActivityTable";

export default function DailyLimitsPage() {
  const [activeTab, setActiveTab] = useState("daily-limits");

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-[12px]">
          <div className="border border-[#f2c36b] border-solid flex gap-[6px] items-center justify-center px-[8px] py-[6px] rounded-[4px] shrink-0 w-[817px]">
            <div className="relative shrink-0 size-[32px]">
              <img
                src="/assets/admin/lucky-spin/searchicon.png"
                alt=""
                className="absolute inset-0 h-full w-full object-contain"
              />
            </div>
            <p className="flex-1 text-[12px] text-white leading-[1.3]">Search..</p>
          </div>

          <button className="flex items-center justify-center p-[6px] rounded-[8px] shrink-0" type="button">
            <div className="relative shrink-0 size-[42px]">
              <img
                src="/assets/admin/lucky-spin/sorting.png"
                alt=""
                className="absolute inset-0 h-full w-full object-contain"
              />
            </div>
          </button>
        </div>

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

      {activeTab === "member-activity" ? <MemberActivityTable /> : <DailyLimitsTable />}

      <div className="flex items-center justify-between border-t border-white/10 px-6 py-4">
        <p className="text-[12px] text-white font-bold leading-[1.3]">
          1 -10 of {activeTab === "member-activity" ? "5" : "120"}
        </p>
        <div className="flex items-center">
          <button type="button" className="flex items-center justify-center p-[4px] rounded-[8px]">
            <span className="text-white">‹</span>
          </button>
          <button type="button" className="flex items-center justify-center p-[4px] rounded-[8px]">
            <span className="text-white">›</span>
          </button>
        </div>
      </div>
    </div>
  );
}
