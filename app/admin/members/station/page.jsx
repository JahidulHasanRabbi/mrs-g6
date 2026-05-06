"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { AdminRouteGuard } from "../../../components/guards/AdminRouteGuard";
import HistoryPageShell from "../../../components/admin/members/HistoryPageShell";
import { FilterDropdown, DateFilter } from "../../../components/admin/members/FilterControls";
import { DataTable, Pagination } from "../../../components/admin/members/DataTable";

// ── Constants ────────────────────────────────────────────────────────────
const PAGE_SIZE = 8;

const STATION_OPTIONS = ["First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh"];
const CATEGORY_OPTIONS = ["Category A", "Category B", "Category C", "Category D", "Category E", "Category F", "Category G"];
const TOKEN_DETAIL_OPTIONS = ["Here are the details", "Final thoughts", "Summary of activities", "Important updates", "Overview of events", "Key highlights", "All relevant information"];

// ── Mock data ────────────────────────────────────────────────────────────
// TODO (Backend): replace with real API call to member station endpoint.
const MOCK_STATION_DATA = [
  { id: 1, number: 1, stationName: "First", depositAmount: 5000, vipSiteWallet: 8000 },
  { id: 2, number: 7, stationName: "Seventh", depositAmount: 8000, vipSiteWallet: 10000 },
  { id: 3, number: 3, stationName: "Third", depositAmount: 5500, vipSiteWallet: 8500 },
  { id: 4, number: 4, stationName: "Fourth", depositAmount: 7000, vipSiteWallet: 9500 },
  { id: 5, number: 2, stationName: "Second", depositAmount: 6000, vipSiteWallet: 9000 },
  { id: 6, number: 6, stationName: "Sixth", depositAmount: 7200, vipSiteWallet: 9700 },
  { id: 7, number: 1, stationName: "First", depositAmount: 5000, vipSiteWallet: 8000 },
  { id: 8, number: 5, stationName: "Fifth", depositAmount: 6500, vipSiteWallet: 9200 },
  { id: 9, number: 3, stationName: "Third", depositAmount: 5800, vipSiteWallet: 8800 },
  { id: 10, number: 8, stationName: "Seventh", depositAmount: 9200, vipSiteWallet: 11500 },
  { id: 11, number: 2, stationName: "Second", depositAmount: 6200, vipSiteWallet: 9100 },
  { id: 12, number: 4, stationName: "Fourth", depositAmount: 7500, vipSiteWallet: 9800 },
  { id: 13, number: 6, stationName: "Sixth", depositAmount: 7800, vipSiteWallet: 10200 },
  { id: 14, number: 1, stationName: "First", depositAmount: 5200, vipSiteWallet: 8200 },
  { id: 15, number: 5, stationName: "Fifth", depositAmount: 6800, vipSiteWallet: 9400 },
  { id: 16, number: 7, stationName: "Seventh", depositAmount: 8500, vipSiteWallet: 10800 },
  { id: 17, number: 3, stationName: "Third", depositAmount: 5900, vipSiteWallet: 8900 },
  { id: 18, number: 4, stationName: "Fourth", depositAmount: 7100, vipSiteWallet: 9600 },
];

const TABLE_COLUMNS = [
  { key: "number", label: "Number", minW: "min-w-[100px]" },
  { key: "stationName", label: "Station Name", minW: "min-w-[200px]" },
  { key: "depositAmount", label: "Deposit Amount", minW: "min-w-[200px]" },
  { key: "vipSiteWallet", label: "VIP Site Wallet", minW: "min-w-[200px]", align: "right" },
];

// ── Helpers ──────────────────────────────────────────────────────────────
function formatRM(val) {
  return `RM ${val.toLocaleString("en-MY")}`;
}

// ── Page content ─────────────────────────────────────────────────────────
function StationContent() {
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

  const filteredRows = useMemo(() => {
    let list = [...MOCK_STATION_DATA];
    if (stationFilter) list = list.filter((r) => r.stationName === stationFilter);
    if (sortKey) {
      list.sort((a, b) => {
        const va = a[sortKey] ?? "";
        const vb = b[sortKey] ?? "";
        const mul = sortDir === "asc" ? 1 : -1;
        if (typeof va === "number") return (va - vb) * mul;
        return String(va).localeCompare(String(vb)) * mul;
      });
    }
    return list;
  }, [stationFilter, dateFrom, dateTo, categoryFilter, tokenDetailFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const pageRows = filteredRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => { setCurrentPage(1); }, [stationFilter, dateFrom, dateTo, categoryFilter, tokenDetailFilter]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const renderCell = (row, col) => {
    if (col.key === "depositAmount" || col.key === "vipSiteWallet") return formatRM(row[col.key]);
    return row[col.key];
  };

  return (
    <HistoryPageShell title="Member Stations" memberName={memberName} memberId={memberId}>
      <div className="rounded-[12px] border border-[rgba(255,255,132,0.2)] bg-[rgba(220,220,220,0.1)] p-3 sm:p-4 flex flex-col gap-3">
        {/* Filters */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          <p className="font-['Times_New_Roman'] font-bold text-[16px] sm:text-[18px] text-white whitespace-nowrap italic">
            The Station Are Given
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
          emptyMessage="No station records found."
        />

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </HistoryPageShell>
  );
}

// ── Default export ───────────────────────────────────────────────────────
export default function StationPage() {
  return (
    <AdminRouteGuard>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-[#07190d]">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e9af41] border-t-transparent" />
          </div>
        }
      >
        <StationContent />
      </Suspense>
    </AdminRouteGuard>
  );
}
