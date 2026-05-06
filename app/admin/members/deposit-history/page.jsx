"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { AdminRouteGuard } from "../../../components/guards/AdminRouteGuard";
import HistoryPageShell from "../../../components/admin/members/HistoryPageShell";
import { FilterDropdown, DateFilter } from "../../../components/admin/members/FilterControls";
import { DataTable, Pagination } from "../../../components/admin/members/DataTable";

// ── Constants ────────────────────────────────────────────────────────────
const PAGE_SIZE = 8;

const STATION_OPTIONS = ["Station A", "Station B", "Station C", "Station D", "Station E", "Station F", "Station G"];
const CATEGORY_OPTIONS = ["Category A", "Category B", "Category C", "Category D", "Category E", "Category F", "Category G"];
const TOKEN_DETAIL_OPTIONS = ["Here are the details", "Final thoughts", "Summary of activities", "Important updates", "Overview of events", "Key highlights", "All relevant information"];

// ── Mock data ────────────────────────────────────────────────────────────
// TODO (Backend): replace with real API call to member deposit history endpoint.
const MOCK_DEPOSIT_HISTORY = [
  { id: 1, dateTime: "30.04.2026 8:00 PM", timestamp: "2026-04-30T20:00:00", station: "Station A", rewardAmount: 10000 },
  { id: 2, dateTime: "02.05.2026 10:30 AM", timestamp: "2026-05-02T10:30:00", station: "Station C", rewardAmount: 9800 },
  { id: 3, dateTime: "01.05.2026 9:00 AM", timestamp: "2026-05-01T09:00:00", station: "Station B", rewardAmount: 12500 },
  { id: 4, dateTime: "05.05.2026 5:00 PM", timestamp: "2026-05-05T17:00:00", station: "Station F", rewardAmount: 13000 },
  { id: 5, dateTime: "30.04.2026 8:00 PM", timestamp: "2026-04-30T20:00:00", station: "Station A", rewardAmount: 10000 },
  { id: 6, dateTime: "03.05.2026 1:15 PM", timestamp: "2026-05-03T13:15:00", station: "Station D", rewardAmount: 11200 },
  { id: 7, dateTime: "04.05.2026 3:45 PM", timestamp: "2026-05-04T15:45:00", station: "Station E", rewardAmount: 10500 },
  { id: 8, dateTime: "06.05.2026 7:30 AM", timestamp: "2026-05-06T07:30:00", station: "Station G", rewardAmount: 15000 },
  { id: 9, dateTime: "07.05.2026 11:00 AM", timestamp: "2026-05-07T11:00:00", station: "Station B", rewardAmount: 8200 },
  { id: 10, dateTime: "08.05.2026 2:20 PM", timestamp: "2026-05-08T14:20:00", station: "Station A", rewardAmount: 14800 },
  { id: 11, dateTime: "09.05.2026 4:00 PM", timestamp: "2026-05-09T16:00:00", station: "Station D", rewardAmount: 9500 },
  { id: 12, dateTime: "10.05.2026 9:45 AM", timestamp: "2026-05-10T09:45:00", station: "Station F", rewardAmount: 16200 },
  { id: 13, dateTime: "11.05.2026 6:30 PM", timestamp: "2026-05-11T18:30:00", station: "Station C", rewardAmount: 11800 },
  { id: 14, dateTime: "12.05.2026 8:15 AM", timestamp: "2026-05-12T08:15:00", station: "Station E", rewardAmount: 7600 },
  { id: 15, dateTime: "13.05.2026 12:00 PM", timestamp: "2026-05-13T12:00:00", station: "Station G", rewardAmount: 18500 },
  { id: 16, dateTime: "14.05.2026 3:30 PM", timestamp: "2026-05-14T15:30:00", station: "Station B", rewardAmount: 13400 },
  { id: 17, dateTime: "15.05.2026 10:10 AM", timestamp: "2026-05-15T10:10:00", station: "Station A", rewardAmount: 9900 },
  { id: 18, dateTime: "16.05.2026 5:45 PM", timestamp: "2026-05-16T17:45:00", station: "Station D", rewardAmount: 20000 },
];

const TABLE_COLUMNS = [
  { key: "dateTime", label: "Date/Time", minW: "min-w-[200px]" },
  { key: "station", label: "Station", minW: "min-w-[180px]" },
  { key: "rewardAmount", label: "Reward Amount", minW: "min-w-[180px]", align: "right" },
];

// ── Helpers ──────────────────────────────────────────────────────────────
function toDateOnly(dateStr) {
  if (!dateStr) return null;
  try { return new Date(dateStr).toISOString().slice(0, 10); } catch { return null; }
}

function formatAmount(val) {
  return `RM ${val.toLocaleString("en-MY")}`;
}

// ── Page content ─────────────────────────────────────────────────────────
function DepositHistoryContent() {
  const searchParams = useSearchParams();
  const memberName = searchParams.get("name") || "Unknown";
  const memberId = searchParams.get("memberId") || "";

  // Filters
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [tokenDetailFilter, setTokenDetailFilter] = useState("");
  const [stationFilter, setStationFilter] = useState("");

  // Table state
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);

  const isInRange = useCallback((ts, from, to) => {
    if (!from && !to) return true;
    const d = toDateOnly(ts);
    if (!d) return true;
    if (from && d < from) return false;
    if (to && d > to) return false;
    return true;
  }, []);

  const filteredRows = useMemo(() => {
    let list = [...MOCK_DEPOSIT_HISTORY];
    if (stationFilter) list = list.filter((r) => r.station === stationFilter);
    list = list.filter((r) => isInRange(r.timestamp, dateFrom, dateTo));
    // categoryFilter and tokenDetailFilter kept for UI parity even though mock data doesn't have those fields
    if (sortKey) {
      list.sort((a, b) => {
        const va = a[sortKey] ?? "";
        const vb = b[sortKey] ?? "";
        const mul = sortDir === "asc" ? 1 : -1;
        if (sortKey === "dateTime") return (new Date(a.timestamp) - new Date(b.timestamp)) * mul;
        if (typeof va === "number") return (va - vb) * mul;
        return String(va).localeCompare(String(vb)) * mul;
      });
    }
    return list;
  }, [stationFilter, dateFrom, dateTo, categoryFilter, tokenDetailFilter, sortKey, sortDir, isInRange]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const pageRows = filteredRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => { setCurrentPage(1); }, [stationFilter, dateFrom, dateTo, categoryFilter, tokenDetailFilter]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const renderCell = (row, col) => {
    if (col.key === "rewardAmount") return formatAmount(row.rewardAmount);
    return row[col.key];
  };

  return (
    <HistoryPageShell title="Member Deposit" memberName={memberName} memberId={memberId}>
      <div className="rounded-[12px] border border-[rgba(255,255,132,0.2)] bg-[rgba(220,220,220,0.1)] p-3 sm:p-4 flex flex-col gap-3">
        {/* Filters */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          <p className="font-['Times_New_Roman'] font-bold text-[16px] sm:text-[18px] text-white whitespace-nowrap italic">
            The Deposit Are Given
          </p>
          <span className="font-['Times_New_Roman'] text-[13px] text-white/80 ml-auto mr-1">Filter By:</span>
          <DateFilter label="Date/Time" fromDate={dateFrom} toDate={dateTo} onFromChange={setDateFrom} onToChange={setDateTo} />
          <FilterDropdown label="Category" options={CATEGORY_OPTIONS} value={categoryFilter} onChange={setCategoryFilter} />
          <FilterDropdown label="Token Details" options={TOKEN_DETAIL_OPTIONS} value={tokenDetailFilter} onChange={setTokenDetailFilter} />
          <FilterDropdown label="Station" options={STATION_OPTIONS} value={stationFilter} onChange={setStationFilter} align="right" />
        </div>

        {/* Table */}
        <DataTable
          columns={TABLE_COLUMNS}
          rows={pageRows}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
          renderCell={renderCell}
          emptyMessage="No deposit records found."
        />

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </HistoryPageShell>
  );
}

// ── Default export ───────────────────────────────────────────────────────
export default function DepositHistoryPage() {
  return (
    <AdminRouteGuard>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-[#07190d]">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e9af41] border-t-transparent" />
          </div>
        }
      >
        <DepositHistoryContent />
      </Suspense>
    </AdminRouteGuard>
  );
}
