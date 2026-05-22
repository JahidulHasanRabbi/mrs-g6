"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { AdminRouteGuard } from "../../../components/guards/AdminRouteGuard";
import HistoryPageShell from "../../../components/admin/members/HistoryPageShell";
import { DataTable } from "../../../components/admin/members/DataTable";

// API imports
import { getMemberListSingle } from "../../../api/adminApi";

// ── Constants ────────────────────────────────────────────────────────────
const TABLE_COLUMNS = [
  { key: "id", label: "Number", minW: "min-w-[100px]" },
  { key: "station_id", label: "Username", minW: "min-w-[150px]" },
  { key: "station_name", label: "Station Name", minW: "min-w-[200px]" },
  { key: "deposit_amount", label: "Deposit Amount", minW: "min-w-[200px]" },
  { key: "wallet_site_vip", label: "Wallet Site VIP", minW: "min-w-[200px]", align: "right" },
];

// ── Helpers ──────────────────────────────────────────────────────────────
function formatRM(val) {
  if (!val) return "RM 0.00";
  return `RM ${parseFloat(val).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ── Page content ─────────────────────────────────────────────────────────
function StationContent() {
  const searchParams = useSearchParams();
  const memberName = searchParams.get("name") || "Unknown";
  const memberId = searchParams.get("memberId") || "";

  // Table state
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!memberId) return;
    
    const fetchStations = async () => {
      setLoading(true);
      try {
        const memberData = await getMemberListSingle(memberId);
        setStations(memberData.stations || []);
      } catch (err) {
        console.error("Failed to fetch member stations:", err);
        setStations([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStations();
  }, [memberId]);

  const sortedRows = useMemo(() => {
    let list = [...stations];
    if (sortKey) {
      list.sort((a, b) => {
        const va = a[sortKey] ?? "";
        const vb = b[sortKey] ?? "";
        const mul = sortDir === "asc" ? 1 : -1;
        if (sortKey === "deposit_amount") {
          return (parseFloat(va) - parseFloat(vb)) * mul;
        }
        if (typeof va === "number") return (va - vb) * mul;
        return String(va).localeCompare(String(vb)) * mul;
      });
    }
    return list;
  }, [stations, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const renderCell = (row, col) => {
    if (col.key === "deposit_amount") return formatRM(row.deposit_amount);
    if (col.key === "wallet_site_vip") return row.wallet_site_vip || "—";
    return row[col.key] || "—";
  };

  return (
    <HistoryPageShell title="Member Stations" memberName={memberName} memberId={memberId}>
      <div className="rounded-[12px] border border-[rgba(255,255,132,0.2)] bg-[rgba(220,220,220,0.1)] p-3 sm:p-4 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          <p className=" font-bold text-[16px] sm:text-[18px] text-white whitespace-nowrap italic">
            Member Station Details
          </p>
        </div>

        {/* Table */}
        <DataTable
          columns={TABLE_COLUMNS}
          rows={sortedRows}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
          renderCell={renderCell}
          isLoading={loading}
          emptyMessage="No station records found for this member."
        />
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
