"use client";

import { useState } from "react";
import UserLogsTable from "../../../components/admin/lucky-spin/UserLogsTable";

export default function UserLogsPage() {
  const [selectedYear, setSelectedYear] = useState("2024");
  const years = ["2024", "2023", "2022", "2021", "2020"];

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <h2 className="text-xl font-bold text-white">User Logs</h2>
        <div className="flex items-center gap-3">
          <label className="text-[14px] text-white">Filter by Year:</label>
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="appearance-none bg-transparent border-none h-[36px] rounded-[4px] px-3 text-black text-[16px] focus:outline-none cursor-pointer pr-10"
              style={{
                backgroundImage:
                  "linear-gradient(1.1194924757333382deg, rgba(242, 195, 107, 0) 74.374%, rgb(221, 143, 31) 94.001%), linear-gradient(90deg, rgb(255, 255, 132) 0%, rgb(255, 255, 132) 100%)",
              }}
            >
              {years.map((year) => (
                <option key={year} value={year} className="bg-[#4d4d4d] text-white">
                  {year}
                </option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 6L8 10L12 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <UserLogsTable selectedYear={selectedYear} />

      <div className="flex items-center justify-center border-t border-white/10 px-6 py-4">
        <div className="flex items-center gap-2">
          <button className="flex h-8 w-8 items-center justify-center rounded border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/10">
            ‹
          </button>
          <div className="flex items-center gap-1 px-2 text-sm text-white/70">
            <span className="font-bold text-white">1</span>
            <span>/</span>
            <span>8</span>
          </div>
          <button className="flex h-8 w-8 items-center justify-center rounded border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/10">
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
