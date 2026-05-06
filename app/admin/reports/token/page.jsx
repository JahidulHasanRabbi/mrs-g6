"use client";

import Sidebar from "../../../components/admin/Sidebar";
import { AdminRouteGuard } from "../../../components/guards/AdminRouteGuard";

export default function TokenReportPage() {
  return (
    <AdminRouteGuard>
      <TokenReportContent />
    </AdminRouteGuard>
  );
}

// TODO (Backend): Replace mock data with real API — fields: phone_number, username, station, created_at, category, details, amount
const MOCK_TOKEN_REPORT = [
  {
    id: 1,
    phone_number: "601X-XXXXXXX",
    username: "member_001",
    station: "LV918",
    created_at: "29.04.2026 8:00 AM",
    category: "Category A",
    details: "Here are the details.....",
    amount: "RM 2,000",
  },
];

function TokenReportContent() {
  return (
    <div className="min-h-screen bg-[#07190d]">
      <aside className="fixed left-6 top-6 bottom-6 z-20 w-[326px]">
        <Sidebar activeItem="token-report" />
      </aside>

      <main className="min-h-screen pl-[388px] pr-10 pt-10 pb-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold leading-[1.05] text-white font-['Times_New_Roman']">
            Token Report
          </h1>
          <p className="mt-2 text-gray-400">View token transaction history across all members</p>
        </div>

        {/* Filters — TODO (Backend): wire up filter params */}
        <div className="mb-6 flex flex-wrap gap-3">
          {["Date/Time", "Category", "Token Details", "Username", "Phone Number", "Station"].map((f) => (
            <input
              key={f}
              type="text"
              placeholder={`Filter by ${f}`}
              className="rounded-lg border border-[rgba(255,255,132,0.2)] bg-[rgba(220,220,220,0.05)] px-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#e9af41]"
            />
          ))}
        </div>

        <div className="rounded-xl border border-[rgba(255,255,132,0.2)] bg-[rgba(220,220,220,0.1)]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  {["Phone Number", "Username", "Station", "Date/Time", "Category", "Token Details", "Amount"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-sm font-medium text-gray-400 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_TOKEN_REPORT.map((row) => (
                  <tr key={row.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-5 py-3 text-sm text-white">{row.phone_number}</td>
                    <td className="px-5 py-3 text-sm text-white">{row.username}</td>
                    <td className="px-5 py-3 text-sm text-white">{row.station}</td>
                    <td className="px-5 py-3 text-sm text-white whitespace-nowrap">{row.created_at}</td>
                    <td className="px-5 py-3 text-sm text-white">{row.category}</td>
                    <td className="px-5 py-3 text-sm text-white">{row.details}</td>
                    <td className="px-5 py-3 text-sm font-bold text-[#e9af41]">{row.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
