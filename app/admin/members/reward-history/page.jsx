"use client";

import { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import Sidebar from "../../../components/admin/Sidebar";
import { AdminRouteGuard } from "../../../components/guards/AdminRouteGuard";

// ── Constants ─────────────────────────────────────────────────────────
const PAGE_SIZE = 8;

const GOLD_BG =
  "linear-gradient(1deg, rgba(242,195,107,0) 74%, #dd8f1f 94%), linear-gradient(90deg, #ffff84, #ffff84)";

const CATEGORY_OPTIONS = [
  "Category A",
  "Category B",
  "Category C",
  "Category D",
  "Category E",
  "Category F",
  "Category G",
];

const TOKEN_DETAIL_OPTIONS = [
  "Here are the details",
  "Final thoughts",
  "Summary of activities",
  "Important updates",
  "Overview of events",
  "Key highlights",
  "All relevant information",
];

const STATION_OPTIONS = [
  "Station A",
  "Station B",
  "Station C",
  "Station D",
  "Station E",
  "Station F",
  "Station G",
];

// ── Mock data ─────────────────────────────────────────────────────────
// TODO (Backend): replace with real API call to member reward history endpoint.
const MOCK_REWARD_HISTORY = [
  { id: 1, station: "Station A", dateTime: "30.04.2026 8:00 PM", timestamp: "2026-04-30T20:00:00", category: "Category A", tokenDetails: "Here are the details", amount: 10000 },
  { id: 2, station: "Station G", dateTime: "06.05.2026 2:00 PM", timestamp: "2026-05-06T14:00:00", category: "Category G", tokenDetails: "Final thoughts", amount: 40000 },
  { id: 3, station: "Station C", dateTime: "02.05.2026 10:00 AM", timestamp: "2026-05-02T10:00:00", category: "Category C", tokenDetails: "Summary of activities", amount: 20000 },
  { id: 4, station: "Station D", dateTime: "03.05.2026 11:00 AM", timestamp: "2026-05-03T11:00:00", category: "Category D", tokenDetails: "Important updates", amount: 25000 },
  { id: 5, station: "Station B", dateTime: "01.05.2026 9:00 AM", timestamp: "2026-05-01T09:00:00", category: "Category B", tokenDetails: "Overview of events", amount: 15000 },
  { id: 6, station: "Station F", dateTime: "05.05.2026 1:00 PM", timestamp: "2026-05-05T13:00:00", category: "Category F", tokenDetails: "Key highlights", amount: 35000 },
  { id: 7, station: "Station A", dateTime: "30.04.2026 8:00 PM", timestamp: "2026-04-30T20:00:00", category: "Category A", tokenDetails: "Here are the details", amount: 10000 },
  { id: 8, station: "Station E", dateTime: "04.05.2026 12:00 PM", timestamp: "2026-05-04T12:00:00", category: "Category E", tokenDetails: "All relevant information", amount: 30000 },
  { id: 9, station: "Station B", dateTime: "07.05.2026 3:30 PM", timestamp: "2026-05-07T15:30:00", category: "Category B", tokenDetails: "Final thoughts", amount: 18000 },
  { id: 10, station: "Station D", dateTime: "08.05.2026 9:15 AM", timestamp: "2026-05-08T09:15:00", category: "Category D", tokenDetails: "Overview of events", amount: 22000 },
  { id: 11, station: "Station G", dateTime: "09.05.2026 11:45 AM", timestamp: "2026-05-09T11:45:00", category: "Category G", tokenDetails: "Key highlights", amount: 45000 },
  { id: 12, station: "Station C", dateTime: "10.05.2026 4:00 PM", timestamp: "2026-05-10T16:00:00", category: "Category C", tokenDetails: "Summary of activities", amount: 12000 },
  { id: 13, station: "Station F", dateTime: "11.05.2026 10:30 AM", timestamp: "2026-05-11T10:30:00", category: "Category F", tokenDetails: "Important updates", amount: 38000 },
  { id: 14, station: "Station A", dateTime: "12.05.2026 2:45 PM", timestamp: "2026-05-12T14:45:00", category: "Category A", tokenDetails: "All relevant information", amount: 8000 },
  { id: 15, station: "Station E", dateTime: "13.05.2026 6:00 PM", timestamp: "2026-05-13T18:00:00", category: "Category E", tokenDetails: "Here are the details", amount: 27000 },
  { id: 16, station: "Station B", dateTime: "14.05.2026 8:20 AM", timestamp: "2026-05-14T08:20:00", category: "Category B", tokenDetails: "Final thoughts", amount: 16000 },
  { id: 17, station: "Station D", dateTime: "15.05.2026 1:10 PM", timestamp: "2026-05-15T13:10:00", category: "Category D", tokenDetails: "Key highlights", amount: 33000 },
  { id: 18, station: "Station G", dateTime: "16.05.2026 5:30 PM", timestamp: "2026-05-16T17:30:00", category: "Category G", tokenDetails: "Overview of events", amount: 50000 },
];

const TABLE_COLUMNS = [
  { key: "station", label: "Station", className: "min-w-[120px]" },
  { key: "dateTime", label: "Date/Time", className: "min-w-[180px]" },
  { key: "category", label: "Category", className: "min-w-[140px]" },
  { key: "tokenDetails", label: "Token Details", className: "min-w-[260px]" },
  { key: "amount", label: "Amount", className: "min-w-[120px] text-right" },
];

// ── Sort icon ─────────────────────────────────────────────────────────
function SortIcon({ active, dir }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 ml-0.5">
      <path
        d="M4 5L7 2L10 5"
        stroke={active && dir === "asc" ? "#e9af41" : "rgba(255,255,255,0.4)"}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 9L7 12L10 9"
        stroke={active && dir === "desc" ? "#e9af41" : "rgba(255,255,255,0.4)"}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── FilterDropdown ────────────────────────────────────────────────────
function FilterDropdown({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayLabel = value || label;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 h-9 rounded px-3 py-2 shrink-0 transition-opacity hover:opacity-90"
        style={{ background: GOLD_BG }}
      >
        <span className="font-['Times_New_Roman'] text-[14px] text-black whitespace-nowrap">
          {displayLabel}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="black"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 min-w-[180px] rounded-lg border border-[rgba(255,255,132,0.3)] bg-[#0f2618] shadow-xl overflow-hidden">
          <button
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className={`w-full text-left px-3 py-2.5 font-['Times_New_Roman'] text-[13px] transition-colors ${
              !value
                ? "text-[#e9af41] bg-[rgba(233,175,65,0.1)]"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            All
          </button>
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 font-['Times_New_Roman'] text-[13px] border-t border-white/5 transition-colors ${
                value === opt
                  ? "text-[#e9af41] bg-[rgba(233,175,65,0.1)]"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── DateFilter ────────────────────────────────────────────────────────
function DateFilter({ label, fromDate, toDate, onFromChange, onToChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasValue = fromDate || toDate;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 h-9 rounded px-3 py-2 shrink-0 transition-opacity hover:opacity-90"
        style={{ background: GOLD_BG }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="black"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span className="font-['Times_New_Roman'] text-[14px] text-black whitespace-nowrap">
          {label}
        </span>
        {hasValue && <span className="w-1.5 h-1.5 rounded-full bg-[#06b800]" />}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="black"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 w-[260px] rounded-lg border border-[rgba(255,255,132,0.3)] bg-[#0f2618] shadow-xl p-3 flex flex-col gap-2.5">
          <label className="font-['Times_New_Roman'] text-[12px] text-white/60">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => onFromChange(e.target.value)}
            className="w-full h-9 rounded px-2.5 bg-white/10 border border-white/10 font-['Times_New_Roman'] text-[13px] text-white outline-none focus:border-[#e9af41]/50 [color-scheme:dark]"
          />
          <label className="font-['Times_New_Roman'] text-[12px] text-white/60">To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => onToChange(e.target.value)}
            className="w-full h-9 rounded px-2.5 bg-white/10 border border-white/10 font-['Times_New_Roman'] text-[13px] text-white outline-none focus:border-[#e9af41]/50 [color-scheme:dark]"
          />
          <button
            onClick={() => {
              onFromChange("");
              onToChange("");
            }}
            className="font-['Times_New_Roman'] text-[12px] text-[#e9af41] hover:underline self-end mt-1"
          >
            Clear dates
          </button>
        </div>
      )}
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────
function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-end gap-2 pt-4 pr-2 pb-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="font-['Times_New_Roman'] text-[13px] text-white/70 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed px-2 py-1 italic"
      >
        Previous
      </button>
      {getPageNumbers().map((page, idx) =>
        page === "..." ? (
          <span
            key={`ellipsis-${idx}`}
            className="font-['Times_New_Roman'] text-[13px] text-white/40 px-1"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`font-['Times_New_Roman'] text-[13px] min-w-[28px] h-[28px] rounded flex items-center justify-center transition-colors ${
              currentPage === page
                ? "bg-[#e9af41] text-black font-bold"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            {page}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="font-['Times_New_Roman'] text-[13px] text-white/70 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed px-2 py-1 italic"
      >
        Next
      </button>
    </div>
  );
}

// ── Sorting helper ────────────────────────────────────────────────────
function compareRows(a, b, key, direction) {
  const multiplier = direction === "asc" ? 1 : -1;

  if (key === "dateTime") {
    return (new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) * multiplier;
  }

  if (key === "amount") {
    return (a.amount - b.amount) * multiplier;
  }

  // String comparison for station, category, tokenDetails
  return String(a[key]).localeCompare(String(b[key])) * multiplier;
}

// ── Date-only helper for range filtering ──────────────────────────────
function toDateOnly(timestamp) {
  try {
    return new Date(timestamp).toISOString().slice(0, 10);
  } catch {
    return null;
  }
}

// ── Main content component (uses useSearchParams) ─────────────────────
function RewardHistoryContent() {
  const searchParams = useSearchParams();
  const memberId = searchParams.get("memberId") || "";
  const name = searchParams.get("name") || "Unknown Member";

  // Filter state
  const [categoryFilter, setCategoryFilter] = useState("");
  const [tokenDetailFilter, setTokenDetailFilter] = useState("");
  const [stationFilter, setStationFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Table state
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter logic
  const filteredRows = useMemo(() => {
    return MOCK_REWARD_HISTORY.filter((row) => {
      if (categoryFilter && row.category !== categoryFilter) return false;
      if (tokenDetailFilter && row.tokenDetails !== tokenDetailFilter) return false;
      if (stationFilter && row.station !== stationFilter) return false;

      // Date range
      if (dateFrom || dateTo) {
        const rowDate = toDateOnly(row.timestamp);
        if (!rowDate) return true;
        if (dateFrom && rowDate < dateFrom) return false;
        if (dateTo && rowDate > dateTo) return false;
      }

      return true;
    });
  }, [categoryFilter, tokenDetailFilter, stationFilter, dateFrom, dateTo]);

  // Sort logic
  const sortedRows = useMemo(() => {
    if (!sortKey) return filteredRows;
    return [...filteredRows].sort((a, b) => compareRows(a, b, sortKey, sortDir));
  }, [filteredRows, sortKey, sortDir]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, tokenDetailFilter, stationFilter, dateFrom, dateTo]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedRows.slice(start, start + PAGE_SIZE);
  }, [currentPage, sortedRows]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "dateTime" ? "desc" : "asc");
    }
  };

  return (
    <div className="min-h-screen bg-[#07190d]">
      {/* Sidebar */}
      <aside className="fixed left-6 top-6 bottom-6 z-20 w-[326px] hidden xl:block">
        <Sidebar activeItem="member-list" />
      </aside>

      {/* Main Content */}
      <main className="min-h-screen px-4 pt-6 pb-10 sm:px-6 md:px-8 xl:pl-[388px] xl:pr-10 xl:pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <h1 className="font-['Times_New_Roman'] text-[28px] font-bold text-white">
            Member Rewards
          </h1>
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e0a744] bg-[rgba(233,175,65,0.08)] text-[#e9af41] shadow-[0_0_24px_rgba(233,175,65,0.18)]">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
        </div>

        {/* Back link */}
        <Link
          href="/admin/members"
          className="inline-flex items-center gap-1.5 font-['Times_New_Roman'] text-[14px] text-white/60 hover:text-white transition-colors mb-4"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Member List
        </Link>

        {/* Subtitle */}
        <p className="font-['Times_New_Roman'] text-[15px] text-[#e9af41] mb-5">
          Viewing history for: {name}
          {memberId && (
            <span className="text-white/40 text-[13px] ml-2">(ID: {memberId})</span>
          )}
        </p>

        {/* Table card */}
        <div className="rounded-[12px] border border-[rgba(255,255,132,0.2)] bg-[rgba(220,220,220,0.1)] p-3 sm:p-4 flex flex-col gap-3 sm:gap-4">
          {/* Filters row */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-3">
            <p className="font-['Times_New_Roman'] font-bold text-[16px] sm:text-[18px] text-white whitespace-nowrap italic">
              The Reward Are Given
            </p>
            <span className="font-['Times_New_Roman'] text-[13px] text-white/80 ml-auto mr-1 sm:mr-2">
              Filter By:
            </span>

            <DateFilter
              label="Date/Time"
              fromDate={dateFrom}
              toDate={dateTo}
              onFromChange={setDateFrom}
              onToChange={setDateTo}
            />
            <FilterDropdown
              label="Category"
              options={CATEGORY_OPTIONS}
              value={categoryFilter}
              onChange={setCategoryFilter}
            />
            <FilterDropdown
              label="Token Details"
              options={TOKEN_DETAIL_OPTIONS}
              value={tokenDetailFilter}
              onChange={setTokenDetailFilter}
            />
            <FilterDropdown
              label="Station"
              options={STATION_OPTIONS}
              value={stationFilter}
              onChange={setStationFilter}
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto scrollbar-admin rounded-lg">
            <table className="w-full min-w-[860px]">
              <thead>
                <tr className="bg-black">
                  {TABLE_COLUMNS.map((col) => {
                    const active = sortKey === col.key;
                    const isRight = col.key === "amount";

                    return (
                      <th
                        key={col.key}
                        className={`${col.className} px-4 py-3 text-left cursor-pointer select-none hover:bg-white/5 transition-colors`}
                        onClick={() => handleSort(col.key)}
                      >
                        <div
                          className={`flex items-center ${isRight ? "justify-end" : "justify-start"}`}
                        >
                          <span className="font-['Times_New_Roman'] font-bold text-[13px] sm:text-[14px] text-white whitespace-nowrap">
                            {col.label}
                          </span>
                          <SortIcon active={active} dir={sortDir} />
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                {paginatedRows.length > 0 ? (
                  paginatedRows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-[rgba(240,240,240,0.2)] hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="px-4 py-3 font-['Times_New_Roman'] text-[13px] text-white/80 whitespace-nowrap">
                        {row.station}
                      </td>
                      <td className="px-4 py-3 font-['Times_New_Roman'] text-[13px] text-white/80 whitespace-nowrap">
                        {row.dateTime}
                      </td>
                      <td className="px-4 py-3 font-['Times_New_Roman'] text-[13px] text-white/80 whitespace-nowrap">
                        {row.category}
                      </td>
                      <td className="px-4 py-3 font-['Times_New_Roman'] text-[13px] text-white/80 whitespace-nowrap">
                        {row.tokenDetails}
                      </td>
                      <td className="px-4 py-3 font-['Times_New_Roman'] text-[13px] text-white/80 whitespace-nowrap text-right">
                        {row.amount.toLocaleString("en-MY")}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={TABLE_COLUMNS.length}
                      className="px-5 py-12 text-center font-['Times_New_Roman'] text-[14px] text-white/60"
                    >
                      No reward history rows match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </main>
    </div>
  );
}

// ── Default export with AdminRouteGuard + Suspense ────────────────────
export default function MemberRewardHistoryPage() {
  return (
    <AdminRouteGuard>
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#07190d] flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e9af41] border-t-transparent" />
            <span className="ml-3 font-['Times_New_Roman'] text-white/60">Loading...</span>
          </div>
        }
      >
        <RewardHistoryContent />
      </Suspense>
    </AdminRouteGuard>
  );
}
