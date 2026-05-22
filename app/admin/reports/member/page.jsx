"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { AdminRouteGuard } from "../../../components/guards/AdminRouteGuard";
import { Pagination } from "../../../components/admin/members/DataTable";
import { getMemberReport } from "../../../api/adminApi";

const PAGE_SIZE = 9;

const DATE_OPTIONS = [
  { value: "all", label: "Select Date" },
  { value: "latest-7", label: "Latest 7 Days" },
  { value: "this-month", label: "This Month" },
  { value: "this-year", label: "This Year" },
];

const QUICK_FILTERS = [
  { value: "daily", label: "Daily" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function QuickFilterButtons({ value, onChange }) {
  return (
    <div className="flex items-center gap-3">
      {QUICK_FILTERS.map((filter) => {
        const active = value === filter.value;

        return (
          <button
            key={filter.value}
            type="button"
            onClick={() => onChange(filter.value)}
            className={`flex h-10 items-center gap-2 rounded-[6px] border px-4 text-[15px] font-bold text-black transition ${
              active
                ? "border-[#8a5a14] bg-[linear-gradient(180deg,#f6c65c_0%,#c98018_100%)] shadow-[0_2px_0_rgba(0,0,0,0.35),inset_0_-2px_0_rgba(0,0,0,0.18)]"
                : "border-[#a36e1c] bg-[linear-gradient(180deg,#f6c65c_0%,#dd9526_100%)] shadow-[0_2px_0_rgba(0,0,0,0.35),inset_0_-2px_0_rgba(0,0,0,0.12)] hover:brightness-105"
            }`}
          >
            <CalendarIcon />
            <span>{filter.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function SortIcon({ active, direction }) {
  const stroke = active ? "#ffffff" : "rgba(255,255,255,0.55)";

  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="ml-1 shrink-0">
      <path
        d="M4 5L7 2L10 5"
        stroke={stroke}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={!active || direction === "asc" ? 1 : 0.35}
      />
      <path
        d="M4 9L7 12L10 9"
        stroke={stroke}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={!active || direction === "desc" ? 1 : 0.35}
      />
    </svg>
  );
}

function DateFilter({ value, onChange }) {
  return (
    <div className="relative h-9 shrink-0 overflow-hidden rounded-[4px] border border-[#d69324] bg-[linear-gradient(180deg,#f6c65c_0%,#dd9526_100%)]">
      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-full w-full appearance-none bg-transparent pl-9 pr-9 text-[14px] text-black outline-none"
      >
        {DATE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-black">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>
  );
}

function compareRows(a, b, sortConfig) {
  const { key, direction } = sortConfig;
  const multiplier = direction === "asc" ? 1 : -1;

  if (key === "date") {
    return (new Date(a.date).getTime() - new Date(b.date).getTime()) * multiplier;
  }

  return ((a[key] || 0) - (b[key] || 0)) * multiplier;
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-MY");
}

function formatDateDisplay(dateStr, type) {
  if (!dateStr) return "N/A";
  if (type === "daily") {
    // Expected format from API: YYYY-MM-DD -> DD/MM/YYYY
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  } else if (type === "monthly") {
    // Expected format: YYYY-MM -> MM/YYYY
    const parts = dateStr.split("-");
    if (parts.length === 2) {
      return `${parts[1]}/${parts[0]}`;
    }
  } else if (type === "yearly") {
    // Expected format: YYYY -> YYYY
    return dateStr;
  }
  return dateStr;
}

function MemberReportContent() {
  const [reportType, setReportType] = useState("daily");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [apiResults, setApiResults] = useState([]);
  
  // Column widths sized so the total (≈960px) fits inside the admin content
  // area on a 1280px viewport with the expanded sidebar. Numeric cells are
  // short, so we can be tight without sacrificing readability.
  const TABLE_COLUMNS = [
    { key: "no",                  label: "No",             className: "w-[80px]" },
    { key: "date",                label: "Date",           className: "w-[180px]" },
    { key: "new_members",         label: "New Member",     className: "w-[140px]" },
    { key: "total_members",       label: "Total Member",   className: "w-[140px]" },
    { key: "active_members",      label: "Active Members", className: "w-[150px]" },
    { key: "total_tokens_issued", label: "Token Issued",   className: "w-[170px] text-right" },
  ];

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const today = new Date();
      let start_date = new Date();
      if (dateFilter === "all") {
        if (reportType === "daily") {
          start_date = new Date(today.getFullYear(), today.getMonth(), 1);
        } else if (reportType === "monthly") {
          start_date = new Date(today.getFullYear() - 1, today.getMonth(), 1);
        } else if (reportType === "yearly") {
          start_date = new Date(today.getFullYear() - 10, 0, 1);
        }
      } else if (dateFilter === "this-year") {
        start_date = new Date(today.getFullYear(), 0, 1);
      } else if (dateFilter === "this-month") {
        start_date = new Date(today.getFullYear(), today.getMonth(), 1);
      } else {
        start_date.setDate(today.getDate() - 7);
      }

      // Format to YYYY-MM-DD
      const startStr = `${start_date.getFullYear()}-${String(start_date.getMonth() + 1).padStart(2, "0")}-${String(start_date.getDate()).padStart(2, "0")}`;
      const endStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      const res = await getMemberReport(reportType, {
        start_date: startStr,
        end_date: endStr,
      });

      if (res && res.results) {
        setApiResults(res.results.map((r, i) => ({ ...r, no: i + 1 })));
      } else {
        setApiResults([]);
      }
    } catch (err) {
      console.error(err);
      setApiResults([]);
    } finally {
      setLoading(false);
    }
  }, [reportType, dateFilter]);

  useEffect(() => {
    setCurrentPage(1);
    fetchReport();
  }, [fetchReport]);

  const sortedRows = useMemo(() => {
    return [...apiResults].sort((a, b) => compareRows(a, b, sortConfig));
  }, [apiResults, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return sortedRows.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage, sortedRows]);

  const handleSort = (key) => {
    setSortConfig((current) => {
      if (current.key === key) {
        return {
          key,
          direction: current.direction === "asc" ? "desc" : "asc",
        };
      }

      return {
        key,
        direction: key === "no" || key === "date" ? "desc" : "desc",
      };
    });
  };

  return (
    <main className="min-h-screen xl:admin-content-pl pr-10 pt-8 pb-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-4xl font-bold leading-[1.05] text-white">
            Member Report
          </h1>

          <button
            type="button"
            aria-label="Settings"
            className="flex h-9 w-9 items-center justify-center text-[#f4efe0] transition hover:text-white"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.14 12.94c.04-.31.06-.62.06-.94 0-.32-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.61l-1.92-3.32a.5.5 0 0 0-.59-.22l-2.39.96a7.03 7.03 0 0 0-1.62-.94l-.36-2.54A.49.49 0 0 0 13.91 2h-3.84a.49.49 0 0 0-.49.42l-.36 2.54c-.59.24-1.13.55-1.62.94l-2.39-.96a.5.5 0 0 0-.59.22L2.7 8.48a.5.5 0 0 0 .12.61l2.03 1.58c-.04.31-.06.62-.06.94 0 .32.02.63.06.94L2.82 14.13a.5.5 0 0 0-.12.61l1.92 3.32c.14.24.43.34.69.22l2.39-.96c.49.39 1.03.7 1.62.94l.36 2.54c.05.24.26.42.49.42h3.84c.24 0 .44-.18.49-.42l.36-2.54c.59-.24 1.13-.55 1.62-.94l2.39.96c.27.1.56 0 .69-.22l1.92-3.32a.5.5 0 0 0-.12-.61l-2.02-1.58zM12 15.6A3.6 3.6 0 0 1 8.4 12c0-1.99 1.61-3.6 3.6-3.6s3.6 1.61 3.6 3.6-1.61 3.6-3.6 3.6z" />
            </svg>
          </button>
        </div>

        <div className="mb-4 flex justify-end">
          <QuickFilterButtons 
            value={reportType} 
            onChange={(val) => {
              setReportType(val);
              setDateFilter("all");
            }} 
          />
        </div>

        <section className="overflow-hidden rounded-[12px] border border-[rgba(255,255,132,0.18)] bg-[linear-gradient(180deg,rgba(28,48,31,0.98)_0%,rgba(24,44,28,0.98)_100%)] shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
          <div className="flex flex-wrap items-center justify-between gap-4 px-4 pb-4 pt-4">
            <h2 className=" text-[22px] font-bold leading-none text-[#f4efe0]">
              Member Report
            </h2>

            <div className="flex flex-wrap items-center gap-3">
              <span className="whitespace-nowrap text-[13px] text-[#d6d6d6]">
                Filter By:
              </span>
              <DateFilter value={dateFilter} onChange={setDateFilter} />
            </div>
          </div>

          <div className="overflow-x-auto overflow-y-hidden scrollbar-admin border-t border-white/5">
            <table className="min-w-[960px] w-full table-fixed border-separate border-spacing-0">
              <thead>
                <tr className="bg-black">
                  {TABLE_COLUMNS.map((column) => {
                    const active = sortConfig.key === column.key;

                    return (
                      <th key={column.key} className={`${column.className} px-4 py-[14px] first:pl-5 last:pr-5`}>
                        <button
                          type="button"
                          onClick={() => handleSort(column.key)}
                          className={`flex w-full items-center ${column.key === "total_tokens_issued" ? "justify-end" : "justify-start"}`}
                        >
                          <span className="whitespace-nowrap text-[14px] font-bold text-white">
                            {column.label}
                          </span>
                          <SortIcon active={active} direction={sortConfig.direction} />
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={TABLE_COLUMNS.length} className="px-5 py-12 text-center text-[14px] text-white/60">
                      Loading...
                    </td>
                  </tr>
                ) : paginatedRows.length > 0 ? (
                  paginatedRows.map((row, index) => {
                    const displayNo = (currentPage - 1) * PAGE_SIZE + index + 1;
                    return (
                      <tr key={row.no || index} className="border-b border-[rgba(255,255,255,0.08)] transition-colors hover:bg-white/[0.03]">
                        <td className="px-4 py-[14px] first:pl-5 text-[13px] text-[#f1f1f1] whitespace-nowrap">
                          {displayNo}
                        </td>
                        <td className="px-4 py-[14px] text-[13px] text-[#f1f1f1] whitespace-nowrap">
                          {formatDateDisplay(row.date, reportType)}
                        </td>
                        <td className="px-4 py-[14px] text-[13px] text-[#ece9dc] whitespace-nowrap">
                          {formatNumber(row.new_members)}
                        </td>
                        <td className="px-4 py-[14px] text-[13px] text-[#ece9dc] whitespace-nowrap">
                          {formatNumber(row.total_members)}
                        </td>
                        <td className="px-4 py-[14px] text-[13px] text-[#ece9dc] whitespace-nowrap">
                          {formatNumber(row.active_members)}
                        </td>
                        <td className="px-4 py-[14px] pr-5 text-right text-[13px] text-[#f1f1f1] whitespace-nowrap">
                          {formatNumber(row.total_tokens_issued)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={TABLE_COLUMNS.length}
                      className="px-5 py-12 text-center text-[14px] text-white/60"
                    >
                      No member report rows match the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="border-t border-white/5 pt-3">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}
        </section>
    </main>
  );
}

export default function MemberReportPage() {
  return (
    <AdminRouteGuard>
      <MemberReportContent />
    </AdminRouteGuard>
  );
}
