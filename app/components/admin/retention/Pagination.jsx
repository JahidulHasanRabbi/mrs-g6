"use client";

export default function Pagination({ from, to, total, pageCount = 1, currentPage = 1, onPageChange }) {
  if (pageCount <= 1 && total === 0) return null;

  const pages = buildPageList(currentPage, pageCount);
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < pageCount;

  return (
    <div className="flex w-full items-center justify-between border-t border-white/5 px-6 py-3">
      <span className="text-[13px] text-white/70">
        Showing {from} to {to} of {total} Results
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
          disabled={!canGoPrev}
          className="px-2 py-1 text-[13px] italic text-white/70 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>

        {pages.map((item, idx) =>
          typeof item === "string" ? (
            <span key={`e-${idx}`} className="px-1 text-[13px] text-white/40">
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange?.(item)}
              className={`flex h-[28px] min-w-[28px] items-center justify-center rounded px-1 text-[13px] transition-colors ${
                item === currentPage
                  ? "bg-[#e9af41] font-bold text-black"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange?.(Math.min(pageCount, currentPage + 1))}
          disabled={!canGoNext}
          className="px-2 py-1 text-[13px] italic text-white/70 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function buildPageList(currentPage, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", total];
  }
  if (currentPage >= total - 3) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", total];
}
