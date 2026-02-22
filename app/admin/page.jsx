"use client";

import { useMemo } from "react";
import Sidebar from "../components/admin/Sidebar";
import BarChart from "../components/admin/charts/BarChart";
import LineChart from "../components/admin/charts/LineChart";
import StatDonut from "../components/admin/charts/StatDonut";
import MemberTable from "../components/admin/table/MemberTable";

export default function AdminDashboard() {
  // Mock data for charts
  const dayLabels = useMemo(() => {
    const days = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    return days;
  }, []);

  const weeklyActive = [4200, 5100, 4800, 6200, 5500, 7100, 6800];
  const checkins = [320, 450, 380, 520, 490, 610, 580];
  const activeToday = 2500;
  const totalMembers = 8450;

  return (
    <div className="min-h-screen bg-[#07190d]">
      {/* Sidebar (fixed) */}
      <aside className="fixed left-6 top-6 bottom-6 z-20 w-[326px]">
        <Sidebar activeItem="home" />
      </aside>

      {/* Main Content */}
      <main className="min-h-screen pl-[388px] pr-10 pt-10 pb-10">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <h1 className="text-4xl font-bold leading-[1.05] text-white font-['Times_New_Roman']">
            Home Dashboard
          </h1>
          <button className="flex h-[26px] w-[26px] items-center justify-center">
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

        {/* Stats Grid */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr_0.5fr]">
          {/* Member Activity Overview */}
          <div className="rounded-xl border border-[rgba(255,255,132,0.2)] bg-[rgba(220,220,220,0.1)] p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[20px] font-bold text-white font-['Times_New_Roman'] capitalize leading-[1.2]">
                  Member activity overview
                </h2>
                <div className="rounded-[4px] px-[15px] py-[9px]" style={{ backgroundImage: "linear-gradient(1.0746108354373831deg, rgba(242, 195, 107, 0) 74.374%, rgb(221, 143, 31) 94.001%), linear-gradient(90deg, rgb(255, 255, 132) 0%, rgb(255, 255, 132) 100%)" }}>
                  <span className="text-[16px] font-bold text-black font-['Times_New_Roman'] leading-none">
                    last 7 days
                  </span>
                </div>
              </div>
              <p className="mb-4 text-[16px] text-[#5c5c5c] font-['Times_New_Roman'] capitalize leading-[1.2]">
                active Users : 185
              </p>
              <BarChart
                labels={dayLabels}
                values={weeklyActive}
                positiveColor="#f6c75c"
                baseColor="rgba(255,255,255,0.15)"
              />
          </div>

          {/* Daily Check-In Summary */}
          <div className="rounded-xl border border-[rgba(255,255,132,0.2)] bg-[rgba(220,220,220,0.1)] p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[20px] font-bold text-white font-['Times_New_Roman'] capitalize leading-[1.2]">
                  Daily Check-In Summary
                </h2>
                <div className="rounded-[4px] px-[15px] py-[9px]" style={{ backgroundImage: "linear-gradient(1.0746108354373831deg, rgba(242, 195, 107, 0) 74.374%, rgb(221, 143, 31) 94.001%), linear-gradient(90deg, rgb(255, 255, 132) 0%, rgb(255, 255, 132) 100%)" }}>
                  <span className="text-[16px] font-bold text-black font-['Times_New_Roman'] leading-none">
                    last 7 days
                  </span>
                </div>
              </div>
              <p className="mb-4 text-sm">
                <span className="text-[#06b800]">▲ 18.4%</span>
                <span className="ml-2 text-gray-400">
                  · Total: {checkins.reduce((a, b) => a + b, 0)} check-ins
                </span>
              </p>
              <LineChart
                labels={dayLabels}
                values={checkins}
                stroke="#f6c75c"
              />
          </div>

          {/* Active Users Today */}
          <div className="flex h-full flex-col items-center justify-center rounded-xl border border-[rgba(255,255,132,0.2)] bg-[rgba(220,220,220,0.1)] p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
              <h2 className="mb-2 text-center text-xl font-bold text-white font-['Times_New_Roman']">
                Active Users Today
              </h2>
              <div className="my-2">
                <StatDonut value={activeToday} total={totalMembers} size={217} stroke={20} />
              </div>
              <div className="w-full space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Total</span>
                  <span className="font-semibold text-white">{totalMembers.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Active</span>
                  <span className="font-semibold text-emerald-400">{activeToday.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Rate</span>
                  <span className="font-semibold text-white">
                    {((activeToday / totalMembers) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
          </div>
        </div>

        {/* Member Activity Table */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
            <h2 className="text-sm font-medium text-gray-400">
              Member Activity Overview Table
            </h2>
            <div className="relative">
              <input
                placeholder="Search..."
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
              />
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                ⌘K
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <MemberTable />
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-white/10 px-5 py-3">
            <div className="text-xs text-gray-400">1–10 of 120</div>
            <button className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-sm hover:bg-white/10">
              ‹
            </button>
            <button className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-sm hover:bg-white/10">
              ›
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
