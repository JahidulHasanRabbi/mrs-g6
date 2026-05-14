"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { AdminRouteGuard } from "../../../components/guards/AdminRouteGuard";
import HistoryPageShell from "../../../components/admin/members/HistoryPageShell";
import { FilterDropdown, DateFilter, TextSearchInput } from "../../../components/admin/members/FilterControls";
import { DataTable, Pagination } from "../../../components/admin/members/DataTable";

// API imports
import { getMemberDeposit } from "../../../api/adminApi";
import { getCategoryOptions } from "../../../api/queryParams";

// ── Constants ────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;

const TABLE_COLUMNS = [
  { key: "created", label: "Date/Time", minW: "min-w-[200px]" },
  { key: "station", label: "Station", minW: "min-w-[180px]" },
  { key: "amount", label: "Deposit Amount", minW: "min-w-[180px]", align: "right" },
];

// ── Helpers ──────────────────────────────────────────────────────────────
function formatDateTime(isoStr) {
  if (!isoStr) return "N/A";
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const h12 = hours % 12 || 12;
    return `${dd}/${mm}/${yyyy} ${h12}:${minutes} ${ampm}`;
  } catch {
    return isoStr;
  }
}

function formatAmount(val) {
  if (!val) return "RM 0.00";
  return `RM ${parseFloat(val).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ── Page content ─────────────────────────────────────────────────────────
function DepositHistoryContent() {
  const searchParams = useSearchParams();
  const memberName = searchParams.get("name") || "Unknown";
  const memberId = searchParams.get("memberId") || "";

  // Filters
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Table state
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async (page) => {
    if (!memberId) return;
    setLoading(true);
    try {
      const params = {
        page,
        page_size: PAGE_SIZE,
        start_datetime: dateFrom || undefined,
        end_datetime: dateTo || undefined,
      };
      const res = await getMemberDeposit(memberId, params);
      setRows(res.results || []);
      setTotalCount(res.count || 0);
    } catch (err) {
      console.error(err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [memberId, dateFrom, dateTo]);

  // Debounced fetch - only trigger when user stops selecting for 500ms
  useEffect(() => {
    // Only fetch if both dates are filled or both are empty
    const isDateRangeValid = (!dateFrom && !dateTo) || (dateFrom && dateTo);
    if (!isDateRangeValid) {
      return; // Don't fetch if date range is incomplete
    }
    
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchHistory(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [dateFrom, dateTo]);

  // Initial fetch on mount
  useEffect(() => {
    if (memberId) {
      fetchHistory(1);
    }
  }, [memberId]);

  const sortedRows = useMemo(() => {
    let list = [...rows];
    if (sortKey) {
      list.sort((a, b) => {
        const va = a[sortKey] ?? "";
        const vb = b[sortKey] ?? "";
        const mul = sortDir === "asc" ? 1 : -1;
        if (sortKey === "created") return (new Date(a.created) - new Date(b.created)) * mul;
        if (typeof va === "number") return (va - vb) * mul;
        return String(va).localeCompare(String(vb)) * mul;
      });
    }
    return list;
  }, [rows, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchHistory(page);
  };

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const renderCell = (row, col) => {
    if (col.key === "created") return formatDateTime(row.created);
    if (col.key === "amount") return formatAmount(row.amount);
    if (col.key === "station") return row.station || "—";
    return row[col.key] || "—";
  };

  return (
    <HistoryPageShell title="Member Deposit" memberName={memberName} memberId={memberId}>
      <div className="rounded-[12px] border border-[rgba(255,255,132,0.2)] bg-[rgba(220,220,220,0.1)] p-3 sm:p-4 flex flex-col gap-3">
        {/* Filters */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          <p className=" font-bold text-[16px] sm:text-[18px] text-white whitespace-nowrap italic">
            The Deposit Are Given
          </p>
          <span className=" text-[13px] text-white/80 ml-auto mr-1">Filter By:</span>
          <DateFilter label="Date/Time" fromDate={dateFrom} toDate={dateTo} onFromChange={setDateFrom} onToChange={setDateTo} align="right" />
        </div>

        {/* Table */}
        <DataTable
          columns={TABLE_COLUMNS}
          rows={sortedRows}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
          renderCell={renderCell}
          emptyMessage={loading ? "Loading..." : "No deposit records found."}
        />

        {totalPages > 1 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        )}
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
