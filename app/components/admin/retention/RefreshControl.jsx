"use client";

import { ASSETS, GRAD_GOLD } from "./constants";

// Countdown text + gold Refresh button. Same visual on the dashboard and the
// PIC detail page.

export default function RefreshControl({ countdownText = "5min", onRefresh }) {
  return (
    <div className="flex items-center gap-4">
      <p className="text-right b-5 text-[#d9dff4]">
        <span className="b-5 capitalize font-bold text-[#fb3748]">{countdownText}</span>
        <span> </span>
        <span className="capitalize">remaining till refresh</span>
      </p>
      <button
        type="button"
        onClick={onRefresh}
        className="flex items-center justify-center gap-1 rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold tracking-[-1px] text-[#152044] transition hover:brightness-110"
        style={{ backgroundImage: GRAD_GOLD }}
      >
        <img src={`${ASSETS}/refresh.svg`} alt="" className="h-4 w-4" />
        Refresh
      </button>
    </div>
  );
}
