"use client";

import { KR_ASSETS, KR_COLORS, KR_FONT } from "./assets";

// Figma 706:1061 pager: arrows, a 4-page window, then "...N".
function pageWindow(page, totalPages) {
  const start = Math.max(1, Math.min(page - 1, totalPages - 3));
  const end = Math.min(totalPages, start + 3);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export default function KrPagination({ page, totalPages, onPage }) {
  const pages = pageWindow(page, totalPages);
  const numStyle = { fontFamily: KR_FONT, letterSpacing: 1 };
  const arrow = (dir) => (
    <button
      type="button"
      aria-label={dir < 0 ? "Previous page" : "Next page"}
      disabled={dir < 0 ? page <= 1 : page >= totalPages}
      onClick={() => onPage(page + dir)}
      className="grid h-6 w-6 cursor-pointer place-items-center disabled:cursor-not-allowed disabled:opacity-40"
    >
      <img src={KR_ASSETS.ui.iconArrowLeft} alt="" className={`h-4 w-4 ${dir > 0 ? "-scale-x-100" : ""}`} />
    </button>
  );
  return (
    <div className="flex items-center justify-between px-1 pb-1">
      {arrow(-1)}
      <div className="flex items-center gap-4">
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPage(p)}
            className={`cursor-pointer text-[10px] font-medium leading-[15px] ${p === page ? "underline underline-offset-2" : ""}`}
            style={{ ...numStyle, color: p === page ? KR_COLORS.gold : "#ffffff" }}
          >
            {p}
          </button>
        ))}
        {pages[pages.length - 1] < totalPages && (
          <button
            type="button"
            onClick={() => onPage(totalPages)}
            className="cursor-pointer text-[10px] font-medium leading-[15px] text-white"
            style={numStyle}
          >
            ...{totalPages}
          </button>
        )}
      </div>
      {arrow(1)}
    </div>
  );
}
