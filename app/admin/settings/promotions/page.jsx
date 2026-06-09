"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { GRAD_DARK, GRAD_GOLD } from "../../../components/admin/retention/constants";
import Pagination from "../../../components/admin/retention/Pagination";
import { getPromotions } from "../../../api/adminApi";

// Promotions (Settings → Promotions). List of promotions with Name,
// Promotion ID and assigned Stations, plus an "Add Promotion" affordance.
// Chrome (auth guard, topbar, padding) comes from app/admin/settings/layout.jsx.
//
// NOTE: the backend endpoint is stubbed (see TODO in app/api/api.js). Until the
// real path lands the list will surface an empty/error state — the UI flow is
// the deliverable here.

const PAGE_SIZE = 8;

const COLUMNS = [
  { key: "name",         label: "Name",         minW: 240 },
  { key: "promotion_id", label: "Promotion ID", minW: 200 },
  { key: "stations",     label: "Stations",     minW: 280 },
  { key: "action",       label: "Action",       minW: 140, align: "end" },
];

const TABLE_MIN_WIDTH = COLUMNS.reduce((sum, c) => sum + c.minW, 0);

function stationNames(row) {
  const stations = Array.isArray(row?.stations) ? row.stations : [];
  return stations
    .map((s) => (typeof s === "string" ? s : s?.station_name || s?.name || ""))
    .filter(Boolean);
}

export default function PromotionsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getPromotions({ page: 1, page_size: 100 })
      .then((res) => {
        if (cancelled) return;
        const results = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
        setRows(results);
        setError(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[promotions] fetch failed", err);
        setError(true);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <PageHeader />
      <PromotionList rows={rows} loading={loading} error={error} />
    </>
  );
}

function PageHeader() {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 px-2">
      <div className="flex flex-col gap-1">
        <span className="text-[12px] font-medium leading-[18px] text-white">
          ADMIN DASHBOARD
        </span>
        <h1
          className="bg-clip-text text-transparent font-bold whitespace-nowrap"
          style={{
            backgroundImage: GRAD_GOLD,
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: "clamp(32px, 5vw, 46px)",
            lineHeight: "1.2",
            letterSpacing: "-1px",
          }}
        >
          Promotions
        </h1>
      </div>
    </div>
  );
}

function PromotionList({ rows, loading, error }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!query) return rows;
    const q = query.toLowerCase();
    return rows.filter((r) => {
      const haystack = `${r.name || ""} ${r.promotion_id || ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [rows, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [query]);

  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const visibleRows = filtered.slice(startIdx, startIdx + PAGE_SIZE);
  const showingFrom = filtered.length === 0 ? 0 : startIdx + 1;
  const showingTo = Math.min(startIdx + PAGE_SIZE, filtered.length);

  return (
    <section className="flex w-full flex-col overflow-hidden rounded-[16px] bg-[#041502] shadow-[0_-4px_12px_-2px_#dea220]">
      <header className="flex flex-col gap-4 p-6 w-full md:flex-row md:flex-wrap md:items-center">
        <h2
          className="text-white font-bold whitespace-nowrap md:flex-1 md:min-w-0"
          style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: "26px",
            lineHeight: "39px",
            letterSpacing: "-2px",
          }}
        >
          Promotion List
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput value={query} onChange={setQuery} />
          <AddPromotionButton />
        </div>
      </header>

      <div className="overflow-x-auto overflow-y-hidden scrollbar-admin">
        <div style={{ minWidth: TABLE_MIN_WIDTH }}>
          <TableHeader />
          <div className="flex w-full flex-col">
            {loading ? (
              Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonRow key={i} />)
            ) : error ? (
              <div className="px-6 py-12 text-center text-[12px] text-red-400">
                Failed to load promotions.
              </div>
            ) : visibleRows.length === 0 ? (
              <EmptyRow />
            ) : (
              visibleRows.map((row, idx) => (
                <PromotionRow key={row.uuid || `${row.promotion_id}-${idx}`} row={row} />
              ))
            )}
          </div>
        </div>
      </div>

      <Pagination
        from={showingFrom}
        to={showingTo}
        total={filtered.length}
        currentPage={safePage}
        pageCount={totalPages}
        onPageChange={setPage}
      />
    </section>
  );
}

function AddPromotionButton() {
  return (
    <Link
      href="/admin/settings/promotions/add"
      className="flex items-center justify-center gap-1 rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold text-[#141828] whitespace-nowrap transition hover:brightness-110"
      style={{ backgroundImage: GRAD_GOLD, letterSpacing: "-1px" }}
    >
      <PlusIcon />
      <span>Add Promotion</span>
    </Link>
  );
}

function SearchInput({ value, onChange }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search by name or ID"
      className="w-[200px] bg-[#141828] border border-[#f2cb7a] rounded-[8px] px-3 py-2 text-[10px] italic text-[#f6dda6] placeholder:text-[#f6dda6] placeholder:capitalize focus:outline-none focus:ring-1 focus:ring-[#eaad2c]"
      style={{ fontFamily: "Inter, sans-serif", lineHeight: "15px" }}
    />
  );
}

function TableHeader() {
  return (
    <div className="flex w-full items-stretch" style={{ backgroundImage: GRAD_DARK }}>
      {COLUMNS.map((col) => (
        <div
          key={col.key}
          className={`flex flex-1 flex-col px-6 py-4 ${
            col.align === "end" ? "items-end" : "items-start"
          }`}
          style={{ minWidth: col.minW }}
        >
          <p className="text-[14px] font-semibold text-[#fbeed2] leading-[21px] whitespace-nowrap" style={{ letterSpacing: "-1px" }}>
            {col.label}
          </p>
        </div>
      ))}
    </div>
  );
}

function PromotionRow({ row }) {
  const names = stationNames(row);
  return (
    <div className="flex w-full items-stretch -mb-px border-b border-white/5">
      <Cell minW={COLUMNS[0].minW}>
        <span className="text-[12px] font-medium text-white leading-[18px] whitespace-nowrap">
          {row.name}
        </span>
      </Cell>
      <Cell minW={COLUMNS[1].minW}>
        <span className="text-[12px] font-medium text-white leading-[18px] whitespace-nowrap">
          {row.promotion_id}
        </span>
      </Cell>
      <Cell minW={COLUMNS[2].minW}>
        {names.length === 0 ? (
          <span className="text-[12px] text-white/40">—</span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {names.map((name, i) => (
              <span
                key={`${name}-${i}`}
                className="rounded-[6px] border border-[#f2cb7a]/40 bg-[#141828] px-2 py-0.5 text-[11px] font-medium text-[#f6dda6] whitespace-nowrap"
              >
                {name}
              </span>
            ))}
          </div>
        )}
      </Cell>
      <Cell minW={COLUMNS[3].minW} align="end">
        <EditButton href={`/admin/settings/promotions/${row.uuid}`} />
      </Cell>
    </div>
  );
}

function Cell({ children, minW, align = "start" }) {
  const justify = align === "end" ? "justify-end" : "justify-start";
  return (
    <div className={`flex flex-1 items-center p-6 ${justify}`} style={{ minWidth: minW }}>
      {children}
    </div>
  );
}

function EditButton({ href }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-center gap-1 rounded-[8px] border-2 border-[#f2cb7a] px-4 py-2 text-[12px] font-medium text-[#141828] transition hover:brightness-110"
      style={{ backgroundImage: GRAD_GOLD }}
    >
      <EditIcon />
      <span>Edit</span>
    </Link>
  );
}

function EmptyRow() {
  return (
    <div className="px-6 py-12 text-center text-[12px] text-white/40">
      No promotions yet.
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex w-full items-stretch border-b border-white/5">
      {COLUMNS.map((col) => (
        <div key={col.key} className="flex flex-1 items-center p-6" style={{ minWidth: col.minW }}>
          <div className="h-3 w-3/4 rounded bg-white/10 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

// ── Icons ───────────────────────────────────────────────────────────────

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#141828" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#141828" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}
