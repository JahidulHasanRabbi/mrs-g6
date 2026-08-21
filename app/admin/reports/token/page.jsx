"use client";

import { useEffect, useMemo, useState, useCallback, Suspense } from "react";
import { AdminRouteGuard } from "../../../components/guards/AdminRouteGuard";
import { FilterDropdown, DateFilter, TextSearchInput } from "../../../components/admin/members/FilterControls";
import { Pagination } from "../../../components/admin/members/DataTable";
import { getStationList, getTokenReport } from "../../../api/adminApi";
import {
  buildTokenReportParams,
  compareTokenReportRows,
  getTokenReportCategoryOptions,
  getTokenReportCurrencyValue,
  tokenReportRowKey,
  TOKEN_REPORT_CURRENCIES,
} from "../../../api/tokenReport.mjs";

const PAGE_SIZE = 8;

// Column widths are tuned so the total (1220px) fits inside the admin
// content area on a 1440px viewport with the expanded sidebar. Below that
// the wrapper still allows horizontal scroll, but most desktops won't see
// it. Long cell values are truncated with title fallbacks (see <td>s);
// Category wraps instead, since its longest label is Worldcup-Top-Player.
const TABLE_COLUMNS = [
  { key: "phone_number",  label: "Phone Number",  className: "w-[140px]" },
  { key: "username",      label: "Username",      className: "w-[140px]" },
  { key: "station",       label: "Station",       className: "w-[130px]" },
  { key: "currency",      label: "Currency",      className: "w-[140px]" },
  { key: "created",       label: "Date/Time",     className: "w-[170px]" },
  { key: "category",      label: "Category",      className: "w-[180px]" },
  { key: "token_details", label: "Token Details", className: "w-[170px]" },
  { key: "amount",        label: "Amount +/-",    className: "w-[150px] text-right" },
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

// Battle point rows are tagged so the two ledgers stay tellable apart at a
// glance now that the endpoint returns both by default.
const CURRENCY_TONE = {
  "BATTLE POINT": "border-[rgba(150,190,255,0.35)] bg-[rgba(90,140,255,0.12)] text-[#bcd4ff]",
  TOKEN: "border-[rgba(233,175,65,0.35)] bg-[rgba(233,175,65,0.12)] text-[#f0cd8a]",
};

function CurrencyBadge({ value }) {
  if (!value) return <span className="text-[13px] text-[#e8e8e8]">—</span>;
  const tone = CURRENCY_TONE[String(value).toUpperCase()] || "border-white/15 bg-white/5 text-[#e8e8e8]";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-[3px] text-[11px] font-semibold uppercase tracking-[0.04em] ${tone}`}>
      {value}
    </span>
  );
}

function TokenReportContent() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currencyFilter, setCurrencyFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [detailFilter, setDetailFilter] = useState("");
  const [usernameQuery, setUsernameQuery] = useState("");
  const [phoneQuery, setPhoneQuery] = useState("");
  const [stationFilter, setStationFilter] = useState("");
  const [stations, setStations] = useState([]);

  const [sortConfig, setSortConfig] = useState({ key: "created", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getStationList()
      .then((data) => {
        if (cancelled) return;
        setStations(Array.isArray(data) ? data : data?.results || []);
      })
      .catch((err) => console.error(err));
    return () => { cancelled = true; };
  }, []);

  const stationName = (station) => station?.station_name || station?.name || "";
  const stationOptions = stations.map(stationName).filter(Boolean);
  const selectedStationName = stationFilter
    ? stationName(stations.find((station) => station.uuid === stationFilter))
    : "";

  const currencyValue = getTokenReportCurrencyValue(currencyFilter);
  const categoryOptions = getTokenReportCategoryOptions(currencyValue).map((option) => option.label);

  const handleCurrencyChange = (value) => {
    setCurrencyFilter(value);
    setCategoryFilter("");
    if (value === "Battle Point") setDetailFilter("");
  };

  const fetchReport = useCallback(async (page) => {
    setLoading(true);
    try {
      const params = buildTokenReportParams({
        page,
        pageSize: PAGE_SIZE,
        currency: currencyFilter,
        category: categoryFilter,
        startDate: dateFrom,
        endDate: dateTo,
        detail: detailFilter,
        username: usernameQuery,
        phone: phoneQuery,
        stationUuid: stationFilter,
      });
      const res = await getTokenReport(params);
      setRows(res.results || []);
      setTotalCount(res.count || 0);
    } catch (err) {
      console.error(err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, currencyFilter, categoryFilter, detailFilter, usernameQuery, phoneQuery, stationFilter]);

  useEffect(() => {
    // Only fetch if both dates are filled or both are empty
    const isDateRangeValid = (!dateFrom && !dateTo) || (dateFrom && dateTo);
    if (!isDateRangeValid) {
      return; // Don't fetch if date range is incomplete
    }
    
    setCurrentPage(1);
    fetchReport(1);
  }, [fetchReport]);

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => compareTokenReportRows(a, b, sortConfig));
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
    <main className="min-h-screen xl:admin-content-pl pr-10 pt-8 pb-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold leading-[1.05] text-white">
              Token and Battle Point Report
            </h1>
            <p className="mt-2 text-[14px] text-white/55">
              Combined token and battle point ledger report.
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
              <h2 className="mr-auto whitespace-nowrap text-[15px] font-bold text-[#f4efe0] sm:text-[16px] lg:text-[17px]">
                The Token &amp; Battle Point Reports Are Given
              </h2>

              <span className="whitespace-nowrap text-[13px] text-[#d6d6d6]">
                Filter By:
              </span>

              <DateFilter label="Date/Time" fromDate={dateFrom} toDate={dateTo} onFromChange={setDateFrom} onToChange={setDateTo} />
              <FilterDropdown label="Currency" options={TOKEN_REPORT_CURRENCIES} value={currencyFilter} onChange={handleCurrencyChange} />
              <FilterDropdown
                label="Station"
                options={stationOptions}
                value={selectedStationName}
                onChange={(name) => {
                  const station = stations.find((item) => stationName(item) === name);
                  setStationFilter(station?.uuid || "");
                }}
              />
              <FilterDropdown
                label={currencyValue ? "Category" : "Category (select currency)"}
                options={categoryOptions}
                value={categoryFilter}
                onChange={setCategoryFilter}
                disabled={!currencyValue}
              />
              {currencyValue !== 2 && (
                <TextSearchInput
                  placeholder="Token Details"
                  title="Searches token rows only — battle point rows have no token details."
                  value={detailFilter}
                  onChange={setDetailFilter}
                />
              )}
              <TextSearchInput placeholder="Enter Username" value={usernameQuery} onChange={setUsernameQuery} />
              <TextSearchInput placeholder="Enter Phone" value={phoneQuery} onChange={setPhoneQuery} />
            </div>

            {detailFilter && currencyValue !== 1 && (
              <p className="mt-2 text-[12px] text-white/50">
                Token Details only exists on token rows — filtering by it hides every battle point row.
              </p>
            )}
          </div>

          <div className="overflow-x-auto overflow-y-hidden scrollbar-admin">
            <table className="min-w-[1230px] w-full table-fixed border-separate border-spacing-0">
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
                          <span className=" text-[14px] font-bold text-white whitespace-nowrap">
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
                ) : sortedRows.length > 0 ? (
                  sortedRows.map((row, index) => {
                    const amountTone = row.amount >= 0 ? "text-[#f0f0f0]" : "text-[#ffb0a0]";

                    return (
                      <tr key={tokenReportRowKey(row, index)} className="border-b border-[rgba(255,255,255,0.08)] transition-colors hover:bg-white/[0.03]">
                        <td className="px-4 py-[14px] first:pl-5 text-[13px] text-[#f1f1f1] truncate" title={row.phone_number || ""}>
                          {row.phone_number || "—"}
                        </td>
                        <td className="px-4 py-[14px] text-[13px] text-[#f1f1f1] truncate" title={row.username || ""}>
                          {row.username || "—"}
                        </td>
                        <td className="px-4 py-[14px] text-[13px] text-[#e8e8e8] truncate" title={row.station || ""}>
                          {row.station || "—"}
                        </td>
                        <td className="px-4 py-[14px] text-[13px] truncate" title={row.currency || ""}>
                          <CurrencyBadge value={row.currency} />
                        </td>
                        <td className="px-4 py-[14px] text-[13px] text-[#e8e8e8] whitespace-nowrap">
                          {formatDateTime(row.created)}
                        </td>
                        <td className="px-4 py-[14px] text-[13px] text-[#ece9dc] break-words" title={row.category || ""}>
                          {row.category || "—"}
                        </td>
                        <td className="px-4 py-[14px] text-[13px] text-[#dadada] truncate" title={row.token_details || ""}>
                          {row.token_details || "—"}
                        </td>
                        <td className={`px-4 py-[14px] pr-5 text-right text-[13px] font-semibold whitespace-nowrap ${amountTone}`} title={formatAmount(row.amount)}>
                          {formatAmount(row.amount)}
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
