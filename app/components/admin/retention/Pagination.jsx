"use client";

// Pagination bar: "Showing X to Y of Z" + numeric chips + prev/next chevrons.
// Caller supplies the data — the component does no fetching.

export default function Pagination({ from, to, total, pageCount = 7, currentPage = 1, onPageChange }) {
  const visible = buildPageList(currentPage, pageCount);
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < pageCount;
  return (
    <div className="flex w-full items-center justify-between px-6 py-3">
      <span className="b-6 text-white">
        Showing {from} to {to} of {total} Results
      </span>
      <div className="flex items-center gap-[5.5px]">
        <ChevronButton
          ariaLabel="Previous page"
          direction="left"
          disabled={!canGoPrev}
          onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
        />
        {visible.map((item) =>
          typeof item === "string" ? (
            <span key={item} className="b-6 text-white px-0.5">…</span>
          ) : (
            <PageChip
              key={item}
              page={item}
              active={item === currentPage}
              onClick={() => onPageChange?.(item)}
            />
          )
        )}
        <ChevronButton
          ariaLabel="Next page"
          direction="right"
          disabled={!canGoNext}
          onClick={() => onPageChange?.(Math.min(pageCount, currentPage + 1))}
        />
      </div>
    </div>
  );
}

// Sliding-window page list. Always shows first + last page and a 3-page
// window centred on currentPage, with ellipses where gaps exist.
// Examples (total=10):  page 1 → [1 2 3 4 … 10]
//                        page 5 → [1 … 4 5 6 … 10]
//                        page 9 → [1 … 7 8 9 10]
function buildPageList(currentPage, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  // Clamp the 3-page window so it stays anchored at the start/end near edges.
  const windowStart = Math.max(2, Math.min(currentPage - 1, total - 3));
  const windowEnd   = Math.min(total - 1, Math.max(currentPage + 1, 4));

  const pages = [1];
  if (windowStart > 2) pages.push("ellipsis-left");
  for (let i = windowStart; i <= windowEnd; i++) pages.push(i);
  if (windowEnd < total - 1) pages.push("ellipsis-right");
  pages.push(total);
  return pages;
}

function PageChip({ page, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "flex h-[18px] w-[18px] items-center justify-center rounded-[4px] bg-[#eaad2c] b-6 text-white"
          : "flex h-[18px] w-[18px] items-center justify-center rounded-[4px] border border-[#eaad2c] b-6 text-white"
      }
    >
      {page}
    </button>
  );
}

function ChevronButton({ ariaLabel, direction, disabled, onClick }) {
  const transform = direction === "left" ? "rotate(180deg)" : "rotate(0deg)";
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-[18px] w-[18px] items-center justify-center rounded-[4px] border border-[#eaad2c] ${
        disabled ? "opacity-40 cursor-not-allowed" : ""
      }`}
    >
      <svg width="6" height="10" viewBox="0 0 6 10" fill="none" style={{ transform }}>
        <path
          d="M1 1l4 4-4 4"
          stroke="#eaad2c"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
