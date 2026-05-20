"use client";

import { useState, useEffect, useMemo } from "react";
import BarChart from "../components/admin/charts/BarChart";
import { AdminRouteGuard } from "../components/guards/AdminRouteGuard";
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
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeToday: 0,
    newMembers: 0,
    checkins: [0, 0, 0, 0, 0, 0, 0],
    totalCheckins: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all dashboard data in parallel
      const [totalUsersData, activeUsersData, dailyCheckInData, membersData] = await Promise.all([
        adminApi.getTotalUsers(),
        adminApi.getActiveUsers(),
        adminApi.getDailyCheckIn(),
        adminApi.getMembers()
      ]);

      // Process daily check-in data
      const checkInArray = [
        dailyCheckInData['6D'] || 0,
        dailyCheckInData['5D'] || 0,
        dailyCheckInData['4D'] || 0,
        dailyCheckInData['3D'] || 0,
        dailyCheckInData['2D'] || 0,
        dailyCheckInData['1D'] || 0,
        dailyCheckInData['0D'] || 0
      ];
      
      const totalCheckins = checkInArray.reduce((a, b) => a + b, 0);

      // Calculate new members from last 7 days
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6);
      
      const membersList = Array.isArray(membersData) ? membersData : (membersData?.results || []);
      const newMembers = membersList.filter((member) => {
        if (!member.registered_date) return false;
        const registered = new Date(member.registered_date);
        const registeredDay = new Date(registered.getFullYear(), registered.getMonth(), registered.getDate());
        return registeredDay >= sevenDaysAgo && registeredDay <= today;
      }).length;

      setStats({
        totalMembers: totalUsersData.total_users || 0,
        activeToday: activeUsersData.active_users || 0,
        newMembers,
        checkins: checkInArray,
        totalCheckins,
      });
    } catch (err) {
      setError(err);
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const dayLabels = useMemo(() => {
    const labels = [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      // Format as "MM/DD" (e.g., "03/25")
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      labels.push(`${month}/${day}`);
    }
    
    return labels;
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
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
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr_1fr]">
          {/* Daily Check-In */}
          <div className="rounded-xl border border-[rgba(255,255,132,0.2)] bg-[rgba(220,220,220,0.1)] p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[20px] font-bold text-white font-['Times_New_Roman'] capitalize leading-[1.2]">
                  Daily Check-In
                </h2>
                <div className="rounded-[4px] px-[15px] py-[9px]" style={{ backgroundImage: "linear-gradient(1.0746108354373831deg, rgba(242, 195, 107, 0) 74.374%, rgb(221, 143, 31) 94.001%), linear-gradient(90deg, rgb(255, 255, 132) 0%, rgb(255, 255, 132) 100%)" }}>
                  <span className="text-[16px] font-bold text-black font-['Times_New_Roman'] leading-none">
                    last 7 days
                  </span>
                </div>
              </div>
              <p className="mb-4 text-[16px] text-[#5c5c5c] font-['Times_New_Roman'] capitalize leading-[1.2]">
                Active Counts : {stats.totalCheckins}
              </p>
              <BarChart
                labels={dayLabels}
                values={stats.checkins}
                positiveColor="#f6c75c"
                baseColor="rgba(255,255,255,0.15)"
              />
          </div>

          {/* Total Active Users */}
          <TotalActiveUsersCard activeToday={stats.activeToday} totalMembers={stats.totalMembers} />

          {/* Members Snapshot */}
          <div className="flex flex-col justify-around gap-4 rounded-xl border border-[rgba(255,255,132,0.2)] bg-[rgba(220,220,220,0.1)] px-8 py-8 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
            <SnapshotStat label="Total Users" value={stats.totalMembers} />
            <SnapshotStat label="New Members" value={stats.newMembers} />
            <SnapshotStat label="Active Members" value={stats.activeToday} />
          </div>
        </div>
    </main>
  );
}

function DashboardSkeleton() {
  return (
    <main className="min-h-screen pl-[388px] pr-10 pt-10 pb-10">
      <div className="mb-8 flex items-start justify-between">
        <div className="h-10 w-56 animate-pulse rounded-lg bg-white/10" />
        <div className="h-[26px] w-[26px] animate-pulse rounded-full bg-white/10" />
      </div>
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr_1fr]">
        {/* Daily Check-In card */}
        <div className="rounded-xl border border-[rgba(255,255,132,0.2)] bg-[rgba(220,220,220,0.1)] p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <div className="mb-4 flex items-center justify-between">
            <div className="h-6 w-36 animate-pulse rounded bg-white/10" />
            <div className="h-9 w-28 animate-pulse rounded-[4px] bg-white/10" />
          </div>
          <div className="mb-6 h-4 w-44 animate-pulse rounded bg-white/10" />
          <div className="flex h-[160px] items-end gap-2">
            {[55, 80, 45, 90, 65, 75, 85].map((h, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full animate-pulse rounded-t bg-white/10" style={{ height: `${h}%` }} />
                <div className="h-3 w-8 animate-pulse rounded bg-white/10" />
              </div>
            ))}
          </div>
        </div>
        {/* Total Active Users card */}
        <div className="flex h-full flex-col items-center justify-between rounded-xl border border-[rgba(255,255,132,0.2)] bg-[rgba(220,220,220,0.1)] p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <div className="mb-2 h-6 w-40 animate-pulse rounded bg-white/10" />
          <div className="h-[200px] w-[200px] animate-pulse rounded-full bg-white/10" />
          <div className="mt-2 h-4 w-32 animate-pulse rounded bg-white/10" />
        </div>
        {/* Members Snapshot card */}
        <div className="flex flex-col justify-around gap-4 rounded-xl border border-[rgba(255,255,132,0.2)] bg-[rgba(220,220,220,0.1)] px-8 py-8 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <div className="h-5 w-28 animate-pulse rounded bg-white/10" />
              <div className="h-11 w-24 animate-pulse rounded bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function SnapshotStat({ label, value }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <span className="font-['Times_New_Roman'] text-[18px] font-bold leading-none text-[#f4bf55]">
        {label}
      </span>
      <span className="font-['Times_New_Roman'] text-[44px] font-bold leading-none text-white">
        {value.toLocaleString()}
      </span>
    </div>
  );
}

function TotalActiveUsersCard({ activeToday, totalMembers }) {
  const size = 200;
  const stroke = 22;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = totalMembers > 0 ? Math.max(0, Math.min(1, activeToday / totalMembers)) : 0;
  const dash = circumference * pct;

  return (
    <div className="flex h-full flex-col items-center justify-between rounded-xl border border-[rgba(255,255,132,0.2)] bg-[rgba(220,220,220,0.1)] p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
      <h2 className="mb-2 text-center font-['Times_New_Roman'] text-[20px] font-bold leading-[1.2] text-white capitalize">
        Total Active Users
      </h2>

      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <linearGradient id="total-active-grad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFF84" />
              <stop offset="100%" stopColor="#DD8F1F" />
            </linearGradient>
          </defs>
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="#ffffff" strokeWidth={stroke} fill="none" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#total-active-grad)"
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference - dash}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            className="drop-shadow-[0_0_20px_rgba(246,199,92,0.25)]"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-['Times_New_Roman'] text-[14px] font-bold leading-tight text-[#06b800]">
            Active Users Today
          </span>
          <span className="font-['Times_New_Roman'] text-[30px] font-bold leading-none text-white">
            {activeToday.toLocaleString()}
          </span>
        </div>
      </div>

      <p className="mt-2 text-center font-['Times_New_Roman'] text-[14px] text-[#9f9f9f]">
        Setup Active Users
      </p>
    </div>
  );
}
