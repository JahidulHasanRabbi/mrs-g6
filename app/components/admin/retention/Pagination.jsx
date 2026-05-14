"use client";

// Pagination bar: "Showing X to Y of Z" + numeric chips + prev/next chevrons.
// Caller supplies the data — the component does no fetching.

export default function Pagination({ from, to, total, pageCount = 7, currentPage = 1 }) {
  const visible = buildPageList(currentPage, pageCount);
  return (
    <div className="flex w-full items-center justify-between px-6 py-3">
      <span className="b-6 text-white">
        Showing {from} to {to} of {total} Results
      </span>
      <div className="flex items-center gap-[5.5px]">
        <ChevronButton ariaLabel="Previous page" direction="left" />
        {visible.map((item) =>
          item === "ellipsis" ? (
            <span key={`e-${item}`} className="b-6 text-white">....</span>
          ) : (
            <PageChip key={item} page={item} active={item === currentPage} />
          )
        )}
        <ChevronButton ariaLabel="Next page" direction="right" />
      </div>
    </div>
  );
}

// Decide which page numbers / ellipsis to render. Pure function, no allocation
// inside render-hot paths (the result is small and memoization isn't worth it).
function buildPageList(currentPage, total) {
  if (total <= 4) return Array.from({ length: total }, (_, i) => i + 1);
  return [1, 2, 3, "ellipsis", total];
}

function PageChip({ page, active }) {
  return (
    <button
      type="button"
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

function ChevronButton({ ariaLabel, direction }) {
  const transform = direction === "left" ? "rotate(180deg)" : "rotate(0deg)";
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className="flex h-[18px] w-[18px] items-center justify-center rounded-[4px] border border-[#eaad2c]"
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
