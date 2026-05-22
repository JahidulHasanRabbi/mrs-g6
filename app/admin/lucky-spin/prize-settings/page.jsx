"use client";

import PrizeSettingsTable from "../../../components/admin/lucky-spin/PrizeSettingsTable";

export default function PrizeSettingsPage() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <h2 className="text-xl font-bold text-white">Prize Settings Table</h2>
      </div>

      <PrizeSettingsTable />

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
  );
}
