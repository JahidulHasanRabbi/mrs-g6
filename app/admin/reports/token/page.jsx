"use client";

import { useEffect, useMemo, useState, useCallback, Suspense } from "react";
import { AdminRouteGuard } from "../../../components/guards/AdminRouteGuard";
import { FilterDropdown, DateFilter, TextSearchInput } from "../../../components/admin/members/FilterControls";
import { Pagination } from "../../../components/admin/members/DataTable";
import { getTokenReport } from "../../../api/adminApi";
import { getCategoryOptions } from "../../../api/queryParams";

const PAGE_SIZE = 8;

const TABLE_COLUMNS = [
  { key: "phone_number", label: "Phone Number", className: "w-[170px]" },
  { key: "username", label: "Username", className: "w-[180px]" },
  { key: "station", label: "Station", className: "w-[180px]" },
  { key: "created", label: "Date/Time", className: "w-[255px]" },
  { key: "category", label: "Category", className: "w-[220px]" },
  { key: "token_details", label: "Token Details", className: "w-[260px]" },
  { key: "amount", label: "Amount +/-", className: "w-[160px] text-right" },
];

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

function formatAmount(amount) {
  const formattedNumber = Math.abs(amount).toLocaleString("en-MY");

  if (amount === 0) {
    return "0";
  }

  return `${amount > 0 ? "+" : "-"}${formattedNumber}`;
}

function compareRows(a, b, sortConfig) {
  const { key, direction } = sortConfig;
  const multiplier = direction === "asc" ? 1 : -1;

  if (key === "amount") {
    return (a.amount - b.amount) * multiplier;
  }

  if (key === "dateTime") {
    return (new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) * multiplier;
  }

  return a[key].localeCompare(b[key]) * multiplier;
}

function TokenReportContent() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [detailFilter, setDetailFilter] = useState("");
  const [usernameQuery, setUsernameQuery] = useState("");
  const [phoneQuery, setPhoneQuery] = useState("");

  const [sortConfig, setSortConfig] = useState({ key: "created", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReport = useCallback(async (page) => {
    setLoading(true);
    try {
      const catValue = getCategoryOptions("token").find(o => o.label === categoryFilter)?.value;
      const params = {
        page,
        page_size: PAGE_SIZE,
        start_datetime: dateFrom || undefined,
        end_datetime: dateTo || undefined,
        category: catValue || undefined,
        token_details: detailFilter || undefined,
        username: usernameQuery || undefined,
        phone_number: phoneQuery || undefined,
      };
      const res = await getTokenReport(params);
      setRows(res.results || []);
      setTotalCount(res.count || 0);
    } catch (err) {
      console.error(err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, categoryFilter, detailFilter, usernameQuery, phoneQuery]);

  useEffect(() => {
    setCurrentPage(1);
    fetchReport(1);
  }, [fetchReport]);

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => compareRows(a, b, sortConfig));
  }, [rows, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchReport(page);
  };

  const handleSort = (key) => {
    setSortConfig((current) => {
      if (current.key === key) return { key, direction: current.direction === "asc" ? "desc" : "asc" };
      return { key, direction: key === "amount" ? "desc" : "asc" };
    });
  };

  return (
    <main className="min-h-screen pl-[388px] pr-10 pt-8 pb-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-['Times_New_Roman'] text-[30px] font-bold leading-none text-white">
              Token Report
            </h1>
            <p className="mt-2 font-['Times_New_Roman'] text-[14px] text-white/55">
              Frontend-only report layout based on the approved Phase 1 enhancement spec.
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e0a744] bg-[rgba(233,175,65,0.08)] text-[#e9af41] shadow-[0_0_24px_rgba(233,175,65,0.18)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
        </div>

        <section className="overflow-hidden rounded-[12px] border border-[rgba(255,255,132,0.18)] bg-[linear-gradient(180deg,rgba(28,48,31,0.98)_0%,rgba(24,44,28,0.98)_100%)] shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
          <div className="border-b border-white/5 px-4 pt-4 pb-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="mr-auto whitespace-nowrap font-['Times_New_Roman'] text-[15px] font-bold text-[#f4efe0] sm:text-[16px] lg:text-[17px]">
                The Token Reports Are Given
              </h2>

              <span className="whitespace-nowrap font-['Times_New_Roman'] text-[13px] text-[#d6d6d6]">
                Filter By:
              </span>

              <DateFilter label="Date/Time" fromDate={dateFrom} toDate={dateTo} onFromChange={setDateFrom} onToChange={setDateTo} />
              <FilterDropdown label="Category" options={getCategoryOptions("token").map(o => o.label)} value={categoryFilter} onChange={setCategoryFilter} />
              <TextSearchInput placeholder="Token Details" value={detailFilter} onChange={setDetailFilter} />
              <TextSearchInput placeholder="Enter Username" value={usernameQuery} onChange={setUsernameQuery} />
              <TextSearchInput placeholder="Enter Phone" value={phoneQuery} onChange={setPhoneQuery} />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1472px] w-full border-separate border-spacing-0">
              <thead>
                <tr className="bg-black">
                  {TABLE_COLUMNS.map((column) => {
                    const active = sortConfig.key === column.key;

                    return (
                      <th key={column.key} className={`${column.className} px-4 py-[14px] first:pl-5 last:pr-5`}>
                        <button
                          type="button"
                          onClick={() => handleSort(column.key)}
                          className={`flex w-full items-center ${column.key === "amount" ? "justify-end" : "justify-start"}`}
                        >
                          <span className="font-['Times_New_Roman'] text-[14px] font-bold text-white whitespace-nowrap">
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
                    <td colSpan={TABLE_COLUMNS.length} className="px-5 py-12 text-center font-['Times_New_Roman'] text-[14px] text-white/60">
                      Loading...
                    </td>
                  </tr>
                ) : sortedRows.length > 0 ? (
                  sortedRows.map((row) => {
                    const amountTone = row.amount >= 0 ? "text-[#f0f0f0]" : "text-[#ffb0a0]";

                    return (
                      <tr key={row.id} className="border-b border-[rgba(255,255,255,0.08)] transition-colors hover:bg-white/[0.03]">
                        <td className="px-4 py-[14px] first:pl-5 font-['Times_New_Roman'] text-[13px] text-[#f1f1f1] whitespace-nowrap">
                          {row.phone_number || "—"}
                        </td>
                        <td className="px-4 py-[14px] font-['Times_New_Roman'] text-[13px] text-[#f1f1f1] whitespace-nowrap">
                          {row.username || "—"}
                        </td>
                        <td className="px-4 py-[14px] font-['Times_New_Roman'] text-[13px] text-[#e8e8e8] whitespace-nowrap">
                          {row.station || "—"}
                        </td>
                        <td className="px-4 py-[14px] font-['Times_New_Roman'] text-[13px] text-[#e8e8e8] whitespace-nowrap">
                          {formatDateTime(row.created)}
                        </td>
                        <td className="px-4 py-[14px] font-['Times_New_Roman'] text-[13px] text-[#ece9dc] whitespace-nowrap">
                          {row.category || "—"}
                        </td>
                        <td className="px-4 py-[14px] font-['Times_New_Roman'] text-[13px] text-[#dadada]">
                          {row.token_details || "—"}
                        </td>
                        <td className={`px-4 py-[14px] pr-5 text-right font-['Times_New_Roman'] text-[13px] font-semibold whitespace-nowrap ${amountTone}`}>
                          {formatAmount(row.amount)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={TABLE_COLUMNS.length}
                      className="px-5 py-12 text-center font-['Times_New_Roman'] text-[14px] text-white/60"
                    >
                      {loading ? "Loading reports..." : "No token report rows match the current filters."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="border-t border-white/5 pt-3">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
          )}
        </section>
    </main>
  );
}

export default function TokenReportPage() {
  return (
    <AdminRouteGuard>
      <TokenReportContent />
    </AdminRouteGuard>
  );
}
