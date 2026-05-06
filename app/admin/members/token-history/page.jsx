"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { AdminRouteGuard } from "../../../components/guards/AdminRouteGuard";
import HistoryPageShell from "../../../components/admin/members/HistoryPageShell";
import { FilterDropdown, DateFilter, TextSearchInput } from "../../../components/admin/members/FilterControls";
import { DataTable, Pagination } from "../../../components/admin/members/DataTable";

// ── Constants ────────────────────────────────────────────────────────────
const PAGE_SIZE = 8;

const CATEGORY_OPTIONS = ["Category A", "Category B", "Category C", "Category D", "Category E", "Category F", "Category G"];
const REWARD_DETAILS_OPTIONS = ["Here are the details", "Additional information", "Further details provided"];
const REWARD_NAME_OPTIONS = ["Name Abc", "Name Def", "Name Ghi"];
const STATION_OPTIONS = ["Station A", "Station B", "Station C", "Station D", "Station E", "Station F", "Station G"];

// ── Mock data ────────────────────────────────────────────────────────────
// TODO (Backend): replace with real API call to member token history endpoint.
const MOCK_TOKEN_HISTORY = [
  { id: 1, station: "Station A", dateTime: "30.04.2026 8:00 PM", timestamp: "2026-04-30T20:00:00", category: "Category A", rewardDetails: "Here are the details", rewardName: "Name Abc" },
  { id: 2, station: "Station B", dateTime: "30.04.2026 9:00 PM", timestamp: "2026-04-30T21:00:00", category: "Category B", rewardDetails: "Additional information", rewardName: "Name Def" },
  { id: 3, station: "Station A", dateTime: "30.04.2026 8:00 PM", timestamp: "2026-04-30T20:00:00", category: "Category A", rewardDetails: "Here are the details", rewardName: "Name Abc" },
  { id: 4, station: "Station C", dateTime: "30.04.2026 10:00 PM", timestamp: "2026-04-30T22:00:00", category: "Category C", rewardDetails: "Further details provided", rewardName: "Name Ghi" },
  { id: 5, station: "Station D", dateTime: "01.05.2026 11:00 AM", timestamp: "2026-05-01T11:00:00", category: "Category D", rewardDetails: "Here are the details", rewardName: "Name Def" },
  { id: 6, station: "Station E", dateTime: "01.05.2026 2:30 PM", timestamp: "2026-05-01T14:30:00", category: "Category E", rewardDetails: "Additional information", rewardName: "Name Ghi" },
  { id: 7, station: "Station F", dateTime: "01.05.2026 4:00 PM", timestamp: "2026-05-01T16:00:00", category: "Category F", rewardDetails: "Further details provided", rewardName: "Name Abc" },
  { id: 8, station: "Station G", dateTime: "02.05.2026 9:15 AM", timestamp: "2026-05-02T09:15:00", category: "Category G", rewardDetails: "Here are the details", rewardName: "Name Def" },
  { id: 9, station: "Station A", dateTime: "02.05.2026 11:45 AM", timestamp: "2026-05-02T11:45:00", category: "Category A", rewardDetails: "Additional information", rewardName: "Name Abc" },
  { id: 10, station: "Station B", dateTime: "02.05.2026 3:20 PM", timestamp: "2026-05-02T15:20:00", category: "Category B", rewardDetails: "Here are the details", rewardName: "Name Ghi" },
  { id: 11, station: "Station C", dateTime: "03.05.2026 8:00 AM", timestamp: "2026-05-03T08:00:00", category: "Category C", rewardDetails: "Further details provided", rewardName: "Name Def" },
  { id: 12, station: "Station D", dateTime: "03.05.2026 12:30 PM", timestamp: "2026-05-03T12:30:00", category: "Category D", rewardDetails: "Additional information", rewardName: "Name Abc" },
  { id: 13, station: "Station E", dateTime: "04.05.2026 10:00 AM", timestamp: "2026-05-04T10:00:00", category: "Category E", rewardDetails: "Here are the details", rewardName: "Name Ghi" },
  { id: 14, station: "Station F", dateTime: "04.05.2026 2:15 PM", timestamp: "2026-05-04T14:15:00", category: "Category F", rewardDetails: "Further details provided", rewardName: "Name Def" },
  { id: 15, station: "Station G", dateTime: "05.05.2026 9:00 AM", timestamp: "2026-05-05T09:00:00", category: "Category G", rewardDetails: "Additional information", rewardName: "Name Abc" },
  { id: 16, station: "Station A", dateTime: "05.05.2026 1:45 PM", timestamp: "2026-05-05T13:45:00", category: "Category A", rewardDetails: "Here are the details", rewardName: "Name Def" },
  { id: 17, station: "Station B", dateTime: "06.05.2026 11:30 AM", timestamp: "2026-05-06T11:30:00", category: "Category B", rewardDetails: "Further details provided", rewardName: "Name Ghi" },
  { id: 18, station: "Station C", dateTime: "06.05.2026 4:00 PM", timestamp: "2026-05-06T16:00:00", category: "Category C", rewardDetails: "Additional information", rewardName: "Name Abc" },
  { id: 19, station: "Station D", dateTime: "07.05.2026 8:30 AM", timestamp: "2026-05-07T08:30:00", category: "Category D", rewardDetails: "Here are the details", rewardName: "Name Def" },
  { id: 20, station: "Station E", dateTime: "07.05.2026 3:00 PM", timestamp: "2026-05-07T15:00:00", category: "Category E", rewardDetails: "Further details provided", rewardName: "Name Ghi" },
];

const TABLE_COLUMNS = [
  { key: "station", label: "Station", minW: "min-w-[120px]" },
  { key: "dateTime", label: "Date/Time", minW: "min-w-[180px]" },
  { key: "category", label: "Category", minW: "min-w-[140px]" },
  { key: "rewardDetails", label: "Reward Details", minW: "min-w-[220px]" },
  { key: "rewardName", label: "Reward Name", minW: "min-w-[140px]", align: "right" },
];

// ── Helpers ──────────────────────────────────────────────────────────────
function toDateOnly(dateStr) {
  if (!dateStr) return null;
  try { return new Date(dateStr).toISOString().slice(0, 10); } catch { return null; }
}

// ── Page content ─────────────────────────────────────────────────────────
function TokenHistoryContent() {
  const searchParams = useSearchParams();
  const memberName = searchParams.get("name") || "Unknown";
  const memberId = searchParams.get("memberId") || "";

  // Filters
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [detailsFilter, setDetailsFilter] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [stationFilter, setStationFilter] = useState("");
  const [usernameSearch, setUsernameSearch] = useState("");
  const [phoneSearch, setPhoneSearch] = useState("");

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
    let list = [...MOCK_TOKEN_HISTORY];
    if (categoryFilter) list = list.filter((r) => r.category === categoryFilter);
    if (detailsFilter) list = list.filter((r) => r.rewardDetails === detailsFilter);
    if (nameFilter) list = list.filter((r) => r.rewardName === nameFilter);
    if (stationFilter) list = list.filter((r) => r.station === stationFilter);
    list = list.filter((r) => isInRange(r.timestamp, dateFrom, dateTo));

    if (sortKey) {
      list.sort((a, b) => {
        const mul = sortDir === "asc" ? 1 : -1;
        if (sortKey === "dateTime") return (new Date(a.timestamp) - new Date(b.timestamp)) * mul;
        return String(a[sortKey] ?? "").localeCompare(String(b[sortKey] ?? "")) * mul;
      });
    }
    return list;
  }, [categoryFilter, detailsFilter, nameFilter, stationFilter, dateFrom, dateTo, sortKey, sortDir, isInRange]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const pageRows = filteredRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => { setCurrentPage(1); }, [categoryFilter, detailsFilter, nameFilter, stationFilter, dateFrom, dateTo, usernameSearch, phoneSearch]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  return (
    <HistoryPageShell title="Member Tokens" memberName={memberName} memberId={memberId}>
      <div className="rounded-[12px] border border-[rgba(255,255,132,0.2)] bg-[rgba(220,220,220,0.1)] p-3 sm:p-4 flex flex-col gap-3">
        {/* Filters */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          <p className="font-['Times_New_Roman'] font-bold text-[16px] sm:text-[18px] text-white whitespace-nowrap italic">
            The Token Are Given
          </p>
          <DateFilter label="Date/Time" fromDate={dateFrom} toDate={dateTo} onFromChange={setDateFrom} onToChange={setDateTo} />
          <FilterDropdown label="Category" options={CATEGORY_OPTIONS} value={categoryFilter} onChange={setCategoryFilter} />
          <FilterDropdown label="Reward Details" options={REWARD_DETAILS_OPTIONS} value={detailsFilter} onChange={setDetailsFilter} />
          <FilterDropdown label="Reward Name" options={REWARD_NAME_OPTIONS} value={nameFilter} onChange={setNameFilter} />
          <TextSearchInput placeholder="Enter Username" value={usernameSearch} onChange={setUsernameSearch} />
          <TextSearchInput placeholder="Enter Phone Number" value={phoneSearch} onChange={setPhoneSearch} />
          <FilterDropdown label="Station" options={STATION_OPTIONS} value={stationFilter} onChange={setStationFilter} />
        </div>

        {/* Record count */}
        <div className="font-['Times_New_Roman'] text-[12px] text-white/40">
          Showing {pageRows.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}&ndash;{Math.min(currentPage * PAGE_SIZE, filteredRows.length)} of {filteredRows.length} records
        </div>

        {/* Table */}
        <DataTable
          columns={TABLE_COLUMNS}
          rows={pageRows}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
          emptyMessage="No token history records found."
        />

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </HistoryPageShell>
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
