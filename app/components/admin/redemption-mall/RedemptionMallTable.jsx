"use client";

import { useMemo, useState } from "react";

const COLUMNS = [
  { id: "name",                label: "Name",       sortable: true,  align: "left",   sortAs: "string" },
  { id: "quantity_available",  label: "Quantity",   sortable: true,  align: "left",   sortAs: "number" },
  { id: "start_date",          label: "Start Date", sortable: true,  align: "left",   sortAs: "date" },
  { id: "end_date",            label: "End Date",   sortable: true,  align: "left",   sortAs: "date" },
  { id: "prize_type",          label: "Prize Type", sortable: true,  align: "left",   sortAs: "string" },
  { id: "mart_tier",           label: "Mart Tier",  sortable: true,  align: "left",   sortAs: "string" },
  { id: "tokens_needed",       label: "Tokens",     sortable: true,  align: "left",   sortAs: "number" },
  { id: "promotion",           label: "Promotion",  sortable: true,  align: "left",   sortAs: "number" },
  { id: "image",               label: "Image",      sortable: false, align: "left" },
  { id: "action",              label: "Action",     sortable: false, align: "center" },
];

const PRIZE_TYPE_LABELS = {
  1: "ITEM",
  2: "VOUCHER",
  3: "CREDIT",
  4: "OTHERS",
};

const PAGE_SIZE = 5;

function getSortValue(item, col) {
  const raw = item[col.id];
  if (col.sortAs === "date") return raw || "";
  if (col.sortAs === "number") return Number(raw) || 0;
  return String(raw ?? "").toLowerCase();
}

const SortArrow = ({ direction }) => (
  <svg width="10" height="14" viewBox="0 0 10 14" fill="none" className="ml-1 inline-block shrink-0">
    <path d="M5 0L9 5H1L5 0Z" fill="currentColor" opacity={direction === "asc" ? "1" : "0.4"} />
    <path d="M5 14L1 9H9L5 14Z" fill="currentColor" opacity={direction === "desc" ? "1" : "0.4"} />
  </svg>
);

export default function RedemptionMallTable({ items, onCreate, onEdit, onArchive }) {
  const [sort, setSort] = useState({ column: null, direction: "asc" });
  const [page, setPage] = useState(1);

  const sortedItems = useMemo(() => {
    if (!sort.column) return items;
    const col = COLUMNS.find((c) => c.id === sort.column);
    if (!col) return items;
    const dir = sort.direction === "asc" ? 1 : -1;
    return [...items].sort((a, b) => {
      const av = getSortValue(a, col);
      const bv = getSortValue(b, col);
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  }, [items, sort]);

  const totalPages = Math.max(1, Math.ceil(sortedItems.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedItems = useMemo(
    () => sortedItems.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [sortedItems, safePage]
  );

  const handleSort = (col) => {
    if (!col.sortable) return;
    setPage(1);
    setSort((prev) =>
      prev.column === col.id
        ? { column: col.id, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { column: col.id, direction: "asc" }
    );
  };

  const pageNumbers = useMemo(() => {
    const max = Math.min(totalPages, 3);
    return Array.from({ length: max }, (_, i) => i + 1);
  }, [totalPages]);

  return (
    <div
      className="overflow-hidden rounded-[14px] border border-[rgba(255,255,132,0.2)]"
      style={{ background: "linear-gradient(180deg, rgba(7, 25, 13, 1) 0%, rgba(10, 30, 15, 1) 100%)" }}
    >
      {/* Card header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
        <h2 className="font-['Times_New_Roman'] text-[18px] font-bold text-white">
          Redemption Item Panel Table
        </h2>
        <button
          onClick={onCreate}
          className="inline-flex min-w-[190px] items-center justify-center gap-2 whitespace-nowrap rounded-[6px] bg-[#e8b558] px-4 py-2 font-['Times_New_Roman'] text-[14px] font-bold leading-none text-black shadow-[0_2px_8px_rgba(231,196,87,0.35)] transition hover:brightness-110"
        >
          <span>Create Redemption Item</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {/* Scroll wrapper — keeps the grid from squashing on narrow viewports */}
      <div className="overflow-x-auto">
        <div className="min-w-[1100px]">
          {/* Column headers */}
          <div className="grid grid-cols-[1.1fr_1fr_1fr_1fr_1.3fr_1fr_1fr_1fr_0.9fr_1.4fr] items-center border-y border-white/10 bg-black/30 px-6 py-3">
            {COLUMNS.map((col) => {
              const isActive = sort.column === col.id;
              const direction = isActive ? sort.direction : null;
              const Wrapper = col.sortable ? "button" : "div";
              return (
                <Wrapper
                  key={col.id}
                  type={col.sortable ? "button" : undefined}
                  onClick={col.sortable ? () => handleSort(col) : undefined}
                  className={`flex items-center font-['Times_New_Roman'] text-[14px] font-bold ${
                    col.align === "center" ? "justify-center" : "justify-start"
                  } ${col.sortable ? "cursor-pointer select-none transition hover:text-[#e9af41]" : ""} ${
                    isActive ? "text-[#e9af41]" : "text-white"
                  }`}
                >
                  <span>{col.label}</span>
                  {col.sortable && <SortArrow direction={direction} />}
                </Wrapper>
              );
            })}
          </div>

          {/* Rows */}
          <div className="divide-y divide-white/10">
            {pagedItems.length === 0 ? (
              <div className="px-6 py-10 text-center font-['Times_New_Roman'] text-white/60">
                No redemption items yet.
              </div>
            ) : (
              pagedItems.map((item) => (
                <div
                  key={item.uuid}
                  className="grid grid-cols-[1.1fr_1fr_1fr_1fr_1.3fr_1fr_1fr_1fr_0.9fr_1.4fr] items-center px-6 py-4 transition-colors hover:bg-white/5"
                >
                  <div className="font-['Times_New_Roman'] text-[14px] text-white">{item.name}</div>
                  <div className="font-['Times_New_Roman'] text-[14px] text-white">{item.quantity_available}</div>
                  <div className="font-['Times_New_Roman'] text-[14px] text-white">{item.start_date}</div>
                  <div className="font-['Times_New_Roman'] text-[14px] text-white">{item.end_date}</div>
                  <div className="font-['Times_New_Roman'] text-[14px] text-white">{PRIZE_TYPE_LABELS[item.prize_type] || item.prize_type}</div>
                  <div className="font-['Times_New_Roman'] text-[14px] text-white">{item.mart_tier || "-"}</div>
                  <div className="font-['Times_New_Roman'] text-[14px] tabular-nums text-white">{item.tokens_needed}</div>
                  <div className="font-['Times_New_Roman'] text-[14px] tabular-nums text-white">{item.promotion}</div>
                  <div>
                    {item.image ? (
                      <div className="h-[36px] w-[44px] overflow-hidden rounded-[4px] bg-white/5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.image} alt="" className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-[36px] w-[44px] rounded-[4px] bg-white/5 flex items-center justify-center text-white/30 text-xs">
                        No img
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onArchive(item)}
                      className="inline-flex h-[28px] min-w-[72px] items-center justify-center rounded-[6px] bg-[#22c55e] px-3 font-['Times_New_Roman'] text-[13px] font-bold text-white transition hover:bg-[#16a34a]"
                    >
                      Archive
                    </button>
                    <button
                      onClick={() => onEdit(item)}
                      className="inline-flex h-[28px] min-w-[60px] items-center justify-center rounded-[6px] border border-white/20 px-3 font-['Times_New_Roman'] text-[13px] font-bold text-white/60 transition hover:border-[#e9af41] hover:text-[#e9af41]"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-end gap-3 px-6 py-4 font-['Times_New_Roman'] text-[13px] text-white/70">
        <span className="text-white/50">
          Showing {pagedItems.length} of {sortedItems.length}
        </span>
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={safePage === 1}
          className="px-2 transition hover:text-white disabled:opacity-40 disabled:hover:text-white/70"
        >
          Previous
        </button>
        {pageNumbers.map((n) => (
          <button
            key={n}
            onClick={() => setPage(n)}
            className={`flex h-[26px] w-[26px] items-center justify-center rounded-[4px] transition ${
              safePage === n
                ? "text-[#e9af41] underline underline-offset-2"
                : "text-white/70 hover:text-white"
            }`}
          >
            {n}
          </button>
        ))}
        {totalPages > 3 && <span className="text-white/50">…</span>}
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={safePage === totalPages}
          className="px-2 transition hover:text-white disabled:opacity-40 disabled:hover:text-white/70"
        >
          Next
        </button>
      </div>
    </div>
  );
}
