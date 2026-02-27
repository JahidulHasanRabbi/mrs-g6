"use client";

import { useState, useEffect, useMemo } from "react";
import Sidebar from "../components/admin/Sidebar";
import BarChart from "../components/admin/charts/BarChart";
import LineChart from "../components/admin/charts/LineChart";
import StatDonut from "../components/admin/charts/StatDonut";
import MemberTable from "../components/admin/table/MemberTable";
import { AdminRouteGuard } from "../components/guards/AdminRouteGuard";
import LoadingState from "../components/ui/LoadingState";
import ErrorDisplay from "../components/ui/ErrorDisplay";
import * as adminApi from "../api/adminApi";

export default function AdminDashboard() {
  return (
    <AdminRouteGuard>
      <AdminDashboardContent />
    </AdminRouteGuard>
  );
}

function AdminDashboardContent() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getMembers();
      setMembers(data);
    } catch (err) {
      setError(err);
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics from real member data
  const stats = useMemo(() => {
    if (!members.length) {
      return {
        totalMembers: 0,
        activeToday: 0,
        weeklyActive: [0, 0, 0, 0, 0, 0, 0],
        checkins: [0, 0, 0, 0, 0, 0, 0],
        totalCheckins: 0,
        activeUsers7Days: 0
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Count active users today (logged in today)
    const activeToday = members.filter(member => {
      if (!member.last_login_datetime) return false;
      const loginDate = new Date(member.last_login_datetime);
      loginDate.setHours(0, 0, 0, 0);
      return loginDate.getTime() === today.getTime();
    }).length;

    // Calculate weekly activity (last 7 days)
    const weeklyActive = [];
    const checkins = [];
    let activeUsers7Days = 0;
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      // Count logins for this day
      const loginsThisDay = members.filter(member => {
        if (!member.last_login_datetime) return false;
        const loginDate = new Date(member.last_login_datetime);
        return loginDate >= date && loginDate < nextDate;
      }).length;
      
      // Count check-ins for this day
      const checkinsThisDay = members.filter(member => {
        if (!member.last_check_in_date) return false;
        const checkinDate = new Date(member.last_check_in_date);
        checkinDate.setHours(0, 0, 0, 0);
        return checkinDate.getTime() === date.getTime();
      }).length;
      
      weeklyActive.push(loginsThisDay);
      checkins.push(checkinsThisDay);
    }

    // Count unique users active in last 7 days
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    activeUsers7Days = members.filter(member => {
      if (!member.last_login_datetime) return false;
      const loginDate = new Date(member.last_login_datetime);
      return loginDate >= sevenDaysAgo;
    }).length;

    const totalCheckins = checkins.reduce((a, b) => a + b, 0);

    return {
      totalMembers: members.length,
      activeToday,
      weeklyActive,
      checkins,
      totalCheckins,
      activeUsers7Days
    };
  }, [members]);

  const dayLabels = useMemo(() => {
    const days = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    return days;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07190d]">
        <aside className="fixed left-6 top-6 bottom-6 z-20 w-[326px]">
          <Sidebar activeItem="home" />
        </aside>
        <main className="min-h-screen pl-[388px] pr-10 pt-10 pb-10">
          <LoadingState message="Loading dashboard data..." />
        </main>
      </div>
    );
  }

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

        {error && (
          <div className="mb-6">
            <ErrorDisplay error={error} />
          </div>
        )}

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
                active Users : {stats.activeUsers7Days}
              </p>
              <BarChart
                labels={dayLabels}
                values={stats.weeklyActive}
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
                <span className="ml-2 text-gray-400">
                  Total: {stats.totalCheckins} check-ins
                </span>
              </p>
              <LineChart
                labels={dayLabels}
                values={stats.checkins}
                stroke="#f6c75c"
              />
          </div>

          {/* Active Users Today */}
          <div className="flex h-full flex-col items-center justify-center rounded-xl border border-[rgba(255,255,132,0.2)] bg-[rgba(220,220,220,0.1)] p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
              <h2 className="mb-2 text-center text-xl font-bold text-white font-['Times_New_Roman']">
                Active Users Today
              </h2>
              <div className="my-2">
                <StatDonut value={stats.activeToday} total={stats.totalMembers} size={217} stroke={20} />
              </div>
              <div className="w-full space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Total</span>
                  <span className="font-semibold text-white">{stats.totalMembers.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Active</span>
                  <span className="font-semibold text-emerald-400">{stats.activeToday.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Rate</span>
                  <span className="font-semibold text-white">
                    {stats.totalMembers > 0 ? ((stats.activeToday / stats.totalMembers) * 100).toFixed(1) : '0.0'}%
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
            <MemberTable members={members} />
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-white/10 px-5 py-3">
            <div className="text-xs text-gray-400">1–{Math.min(10, members.length)} of {members.length}</div>
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
