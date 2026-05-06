"use client";

import { useState, useEffect, useMemo, useRef, useCallback, Suspense } from "react";
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

const REWARD_DETAILS_OPTIONS = [
  "Here are the details",
  "Additional information",
  "Further details provided",
];

const REWARD_NAME_OPTIONS = ["Name Abc", "Name Def", "Name Ghi"];

const STATION_OPTIONS = [
  "Station A",
  "Station B",
  "Station C",
  "Station D",
  "Station E",
  "Station F",
  "Station G",
];

// ── Mock Data ─────────────────────────────────────────────────────────
const MOCK_TOKEN_HISTORY = [
  { id: 1, station: "Station A", dateTime: "30.04.2026 8:00 PM", timestamp: "2026-04-30T20:00:00", category: "Category A", rewardDetails: "Here are the details", rewardName: "Name Abc" },
  { id: 2, station: "Station B", dateTime: "30.04.2026 9:00 PM", timestamp: "2026-04-30T21:00:00", category: "Category B", rewardDetails: "Additional information", rewardName: "Name Def" },
  { id: 3, station: "Station A", dateTime: "30.04.2026 8:00 PM", timestamp: "2026-04-30T20:00:00", category: "Category A", rewardDetails: "Here are the details", rewardName: "Name Abc" },
  { id: 4, station: "Station C", dateTime: "30.04.2026 10:00 PM", timestamp: "2026-04-30T22:00:00", category: "Category C", rewardDetails: "Further details provided", rewardName: "Name Ghi" },
  { id: 5, station: "Station D", dateTime: "01.05.2026 11:00 AM", timestamp: "2026-05-01T11:00:00", category: "Category D", rewardDetails: "Here are the details", rewardName: "Name Def" },
  { id: 6, station: "Station E", dateTime: "01.05.2026 2:30 PM", timestamp: "2026-05-01T14:30:00", category: "Category E", rewardDetails: "Additional information", rewardName: "Name Ghi" },
  { id: 7, station: "Station F", dateTime: "01.05.2026 4:00 PM", timestamp: "2026-05-01T16:00:00", category: "Category F", rewardDetails: "Further details provided", rewardName: "Name Abc" },
  { id: 8, station: "Station G", dateTime: "02.05.2026 9:15 AM", timestamp: "2026-05-02T09:15:00", category: "Category G", rewardDetails: "Here are the details", rewardName: "Name Def" },
  { id: 9, station: "Station A", dateTime: "02.05.2026 12:00 PM", timestamp: "2026-05-02T12:00:00", category: "Category A", rewardDetails: "Additional information", rewardName: "Name Ghi" },
  { id: 10, station: "Station B", dateTime: "02.05.2026 3:45 PM", timestamp: "2026-05-02T15:45:00", category: "Category B", rewardDetails: "Further details provided", rewardName: "Name Abc" },
  { id: 11, station: "Station C", dateTime: "03.05.2026 8:30 AM", timestamp: "2026-05-03T08:30:00", category: "Category C", rewardDetails: "Here are the details", rewardName: "Name Def" },
  { id: 12, station: "Station D", dateTime: "03.05.2026 1:00 PM", timestamp: "2026-05-03T13:00:00", category: "Category D", rewardDetails: "Additional information", rewardName: "Name Ghi" },
  { id: 13, station: "Station E", dateTime: "03.05.2026 5:20 PM", timestamp: "2026-05-03T17:20:00", category: "Category E", rewardDetails: "Further details provided", rewardName: "Name Abc" },
  { id: 14, station: "Station F", dateTime: "04.05.2026 10:00 AM", timestamp: "2026-05-04T10:00:00", category: "Category F", rewardDetails: "Here are the details", rewardName: "Name Def" },
  { id: 15, station: "Station G", dateTime: "04.05.2026 6:00 PM", timestamp: "2026-05-04T18:00:00", category: "Category G", rewardDetails: "Additional information", rewardName: "Name Ghi" },
  { id: 16, station: "Station A", dateTime: "05.05.2026 9:00 AM", timestamp: "2026-05-05T09:00:00", category: "Category A", rewardDetails: "Further details provided", rewardName: "Name Abc" },
  { id: 17, station: "Station B", dateTime: "05.05.2026 11:30 AM", timestamp: "2026-05-05T11:30:00", category: "Category B", rewardDetails: "Here are the details", rewardName: "Name Def" },
  { id: 18, station: "Station C", dateTime: "05.05.2026 3:15 PM", timestamp: "2026-05-05T15:15:00", category: "Category C", rewardDetails: "Additional information", rewardName: "Name Ghi" },
  { id: 19, station: "Station D", dateTime: "06.05.2026 7:45 AM", timestamp: "2026-05-06T07:45:00", category: "Category D", rewardDetails: "Further details provided", rewardName: "Name Def" },
  { id: 20, station: "Station E", dateTime: "06.05.2026 2:00 PM", timestamp: "2026-05-06T14:00:00", category: "Category E", rewardDetails: "Here are the details", rewardName: "Name Abc" },
];

// ── FilterDropdown component ──────────────────────────────────────────
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

// ── DateFilter component ──────────────────────────────────────────────
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
          <label className="font-['Times_New_Roman'] text-[12px] text-white/60">
            From
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => onFromChange(e.target.value)}
            className="w-full h-9 rounded px-2.5 bg-white/10 border border-white/10 font-['Times_New_Roman'] text-[13px] text-white outline-none focus:border-[#e9af41]/50 [color-scheme:dark]"
          />
          <label className="font-['Times_New_Roman'] text-[12px] text-white/60">
            To
          </label>
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

// ── SortIcon component ────────────────────────────────────────────────
function SortIcon({ active, dir }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className="shrink-0 ml-0.5"
    >
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

// ── Pagination component ──────────────────────────────────────────────
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

// ── Date helper ───────────────────────────────────────────────────────
function toDateOnly(dateString) {
  if (!dateString) return null;
  try {
    return new Date(dateString).toISOString().slice(0, 10);
  } catch {
    return null;
  }
}

// ── Table columns definition ──────────────────────────────────────────
const TABLE_COLUMNS = [
  { key: "station", label: "Station", minW: "min-w-[120px]" },
  { key: "dateTime", label: "Date/Time", minW: "min-w-[180px]", sortKey: "timestamp" },
  { key: "category", label: "Category", minW: "min-w-[140px]" },
  { key: "rewardDetails", label: "Reward Details", minW: "min-w-[220px]" },
  { key: "rewardName", label: "Reward Name", minW: "min-w-[140px]", align: "text-right" },
];

// ── Main content component ────────────────────────────────────────────
function TokenHistoryContent() {
  const searchParams = useSearchParams();
  const memberId = searchParams.get("memberId") || "";
  const name = searchParams.get("name") || "Unknown Member";

  // Filter state
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [rewardDetailsFilter, setRewardDetailsFilter] = useState("");
  const [rewardNameFilter, setRewardNameFilter] = useState("");
  const [usernameQuery, setUsernameQuery] = useState("");
  const [phoneQuery, setPhoneQuery] = useState("");
  const [stationFilter, setStationFilter] = useState("");

  // Table state
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  // Date range helper
  const isInDateRange = useCallback((dateStr, from, to) => {
    if (!from && !to) return true;
    const d = toDateOnly(dateStr);
    if (!d) return true;
    if (from && d < from) return false;
    if (to && d > to) return false;
    return true;
  }, []);

  // Filter + sort
  const filteredData = useMemo(() => {
    let list = [...MOCK_TOKEN_HISTORY];

    // Date range
    list = list.filter((r) => isInDateRange(r.timestamp, dateFrom, dateTo));

    // Dropdown filters
    if (categoryFilter) list = list.filter((r) => r.category === categoryFilter);
    if (rewardDetailsFilter) list = list.filter((r) => r.rewardDetails === rewardDetailsFilter);
    if (rewardNameFilter) list = list.filter((r) => r.rewardName === rewardNameFilter);
    if (stationFilter) list = list.filter((r) => r.station === stationFilter);

    // Text search filters
    if (usernameQuery.trim()) {
      const q = usernameQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.station.toLowerCase().includes(q) ||
          r.rewardDetails.toLowerCase().includes(q) ||
          r.rewardName.toLowerCase().includes(q)
      );
    }
    if (phoneQuery.trim()) {
      const q = phoneQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.category.toLowerCase().includes(q) ||
          r.dateTime.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortKey) {
      list.sort((a, b) => {
        const actualKey = sortKey === "timestamp" ? "timestamp" : sortKey;
        const va = a[actualKey] ?? "";
        const vb = b[actualKey] ?? "";
        if (typeof va === "number" && typeof vb === "number")
          return sortDir === "asc" ? va - vb : vb - va;
        return sortDir === "asc"
          ? String(va).localeCompare(String(vb))
          : String(vb).localeCompare(String(va));
      });
    }

    return list;
  }, [
    dateFrom,
    dateTo,
    categoryFilter,
    rewardDetailsFilter,
    rewardNameFilter,
    stationFilter,
    usernameQuery,
    phoneQuery,
    sortKey,
    sortDir,
    isInDateRange,
  ]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const currentRows = filteredData.slice(startIndex, startIndex + PAGE_SIZE);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    dateFrom,
    dateTo,
    categoryFilter,
    rewardDetailsFilter,
    rewardNameFilter,
    stationFilter,
    usernameQuery,
    phoneQuery,
  ]);

  // Clamp page if it exceeds total after filter change
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
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
            Member Tokens
          </h1>
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#e9af41"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>

        {/* Back link */}
        <Link
          href="/admin/members"
          className="inline-flex items-center gap-1.5 font-['Times_New_Roman'] text-[14px] text-white/70 hover:text-white transition-colors mb-2"
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

        {/* Member subtitle */}
        <p className="font-['Times_New_Roman'] text-[15px] text-[#e9af41] mb-5 sm:mb-6">
          Viewing history for: {name}
          {memberId && (
            <span className="text-white/40 text-[13px] ml-2">(ID: {memberId})</span>
          )}
        </p>

        {/* Table card */}
        <div className="rounded-[12px] border border-[rgba(255,255,132,0.2)] bg-[rgba(220,220,220,0.1)] p-3 sm:p-4 flex flex-col gap-3 sm:gap-4">
          {/* Table title + filters row */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-3">
            <p className="font-['Times_New_Roman'] font-bold text-[18px] text-white whitespace-nowrap italic">
              The Token Are Given
            </p>
          </div>

          {/* Filters row */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-3">
            {/* Date filter */}
            <DateFilter
              label="Date/Time"
              fromDate={dateFrom}
              toDate={dateTo}
              onFromChange={setDateFrom}
              onToChange={setDateTo}
            />

            {/* Dropdown filters */}
            <FilterDropdown
              label="Category"
              options={CATEGORY_OPTIONS}
              value={categoryFilter}
              onChange={setCategoryFilter}
            />
            <FilterDropdown
              label="Reward Details"
              options={REWARD_DETAILS_OPTIONS}
              value={rewardDetailsFilter}
              onChange={setRewardDetailsFilter}
            />
            <FilterDropdown
              label="Reward Name"
              options={REWARD_NAME_OPTIONS}
              value={rewardNameFilter}
              onChange={setRewardNameFilter}
            />

            {/* Text search inputs */}
            <div className="relative">
              <input
                type="text"
                placeholder="Enter Username"
                value={usernameQuery}
                onChange={(e) => setUsernameQuery(e.target.value)}
                className="h-9 w-[130px] sm:w-[145px] rounded px-3 py-2 font-['Times_New_Roman'] text-[14px] text-black italic placeholder:text-black/50 outline-none"
                style={{ background: GOLD_BG }}
              />
              {usernameQuery && (
                <button
                  onClick={() => setUsernameQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-black/40 hover:text-black text-[16px] leading-none"
                >
                  ×
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter Phone Number"
                value={phoneQuery}
                onChange={(e) => setPhoneQuery(e.target.value)}
                className="h-9 w-[145px] sm:w-[160px] rounded px-3 py-2 font-['Times_New_Roman'] text-[14px] text-black italic placeholder:text-black/50 outline-none"
                style={{ background: GOLD_BG }}
              />
              {phoneQuery && (
                <button
                  onClick={() => setPhoneQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-black/40 hover:text-black text-[16px] leading-none"
                >
                  ×
                </button>
              )}
            </div>

            {/* Station filter */}
            <FilterDropdown
              label="Station"
              options={STATION_OPTIONS}
              value={stationFilter}
              onChange={setStationFilter}
            />
          </div>

          {/* Results count */}
          <div className="font-['Times_New_Roman'] text-[12px] text-white/40">
            Showing{" "}
            {filteredData.length === 0 ? 0 : startIndex + 1}
            –{Math.min(startIndex + PAGE_SIZE, filteredData.length)} of{" "}
            {filteredData.length} records
          </div>

          {/* Table */}
          <div className="overflow-x-auto scrollbar-admin rounded-lg">
            <table className="w-full min-w-[820px]">
              <thead>
                <tr className="bg-black">
                  {TABLE_COLUMNS.map((c) => {
                    const colSortKey = c.sortKey || c.key;
                    return (
                      <th
                        key={c.key}
                        className={`${c.minW} px-2 py-3 ${c.align === "text-right" ? "text-right" : "text-left"} cursor-pointer select-none hover:bg-white/5 transition-colors`}
                        onClick={() => handleSort(colSortKey)}
                      >
                        <div
                          className={`flex items-center ${c.align === "text-right" ? "justify-end" : ""}`}
                        >
                          <span className="font-['Times_New_Roman'] font-bold text-[13px] sm:text-[14px] text-white whitespace-nowrap">
                            {c.label}
                          </span>
                          <SortIcon active={sortKey === colSortKey} dir={sortDir} />
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {currentRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={TABLE_COLUMNS.length}
                      className="px-5 py-12 text-center font-['Times_New_Roman'] text-white/40"
                    >
                      No token history records found matching your filters.
                    </td>
                  </tr>
                ) : (
                  currentRows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-[rgba(240,240,240,0.2)] hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="px-2 py-3 font-['Times_New_Roman'] text-[13px] text-white/80 whitespace-nowrap">
                        {row.station}
                      </td>
                      <td className="px-2 py-3 font-['Times_New_Roman'] text-[13px] text-white/80 whitespace-nowrap">
                        {row.dateTime}
                      </td>
                      <td className="px-2 py-3 font-['Times_New_Roman'] text-[13px] text-white/80 whitespace-nowrap">
                        {row.category}
                      </td>
                      <td className="px-2 py-3 font-['Times_New_Roman'] text-[13px] text-white/80 whitespace-nowrap">
                        {row.rewardDetails}
                      </td>
                      <td className="px-2 py-3 font-['Times_New_Roman'] text-[13px] text-white/80 whitespace-nowrap text-right">
                        {row.rewardName}
                      </td>
                    </tr>
                  ))
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

// ── Default export with AdminRouteGuard + Suspense ───────────────────
export default function TokenHistoryPage() {
  return (
    <AdminRouteGuard>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-[#07190d]">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e9af41] border-t-transparent" />
          </div>
        }
      >
        <TokenHistoryContent />
      </Suspense>
    </AdminRouteGuard>
  );
}
