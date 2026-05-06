"use client";

import NavigationCards from "../../../components/admin/lucky-spin/NavigationCards";
import PrizeSettingsTable from "../../../components/admin/lucky-spin/PrizeSettingsTable";
import { AdminRouteGuard } from "../../../components/guards/AdminRouteGuard";

export default function PrizeSettingsPage() {
  return (
    <AdminRouteGuard>
      <PrizeSettingsPageContent />
    </AdminRouteGuard>
  );
}

function PrizeSettingsPageContent() {
  return (
    <main className="min-h-screen pl-[388px] pr-10 pt-10 pb-10">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <h1 className="text-4xl font-bold leading-[1.05] text-white font-['Times_New_Roman']">
            Prize Settings
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

        {/* Navigation Cards */}
        <div className="mb-6">
          <NavigationCards activeCard="prize-settings" />
        </div>

        {/* Prize Settings Table */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          {/* Table Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <h2 className="text-xl font-bold text-white font-['Times_New_Roman']">
              Prize Settings Table
            </h2>
          </div>

          {/* Table Content */}
          <PrizeSettingsTable />

          {/* Pagination */}
          <div className="flex items-center justify-center border-t border-white/10 px-6 py-4">
            <div className="flex items-center gap-2">
              <button className="flex h-8 w-8 items-center justify-center rounded border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/10">
                ‹
              </button>
              <div className="flex items-center gap-1 px-2 text-sm text-white/70">
                <span className="font-bold text-white">1</span>
                <span>/</span>
                <span>5</span>
              </div>
              <button className="flex h-8 w-8 items-center justify-center rounded border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/10">
                ›
              </button>
            </div>
          </div>
        </div>
    </main>
  );
}
