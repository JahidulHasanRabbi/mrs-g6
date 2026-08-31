"use client";

import { useEffect, useMemo, useRef, useState, useCallback, Suspense } from "react";
import { AdminRouteGuard } from "../../../components/guards/AdminRouteGuard";
import { FilterDropdown, DateFilter, TextSearchInput } from "../../../components/admin/members/FilterControls";
import { Pagination } from "../../../components/admin/members/DataTable";
import { getRewardReport } from "../../../api/adminApi";
import { getCategoryOptions } from "../../../api/queryParams";

const PAGE_SIZE = 8;

// The summary totals cover every filtered record, so they are swept separately
// from the table page at the largest page size the endpoint allows.
const TOTALS_PAGE_SIZE = 100;
const TOTALS_MAX_PAGES = 50;

// Column widths are tuned so the total (≈1040px) fits inside the admin
// content area on a 1440px viewport with the expanded sidebar. Below that
// the wrapper still allows horizontal scroll, but most desktops won't see
// it. Long cell values are truncated with title fallbacks (see <td>s).
const TABLE_COLUMNS = [
  { key: "phone_number",   label: "Phone Number",   className: "w-[140px]" },
  { key: "username",       label: "Username",       className: "w-[140px]" },
  { key: "station",        label: "Station",        className: "w-[130px]" },
  { key: "created",        label: "Date/Time",      className: "w-[170px]" },
  { key: "category",       label: "Category",       className: "w-[110px]" },
  { key: "reward_details", label: "Reward Details", className: "w-[180px]" },
  { key: "reward_name",    label: "Reward Name",    className: "w-[170px]" },
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

function toIsoDate(date) {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${mm}-${dd}`;
}

function formatIsoDate(iso) {
  const [y, m, d] = String(iso || "").split("-");
  return d ? `${d}/${m}/${y}` : iso || "";
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatCount(value) {
  return Number(value || 0).toLocaleString("en-MY");
}

function isCategory(row, name) {
  const raw = String(row?.category ?? "").trim().toLowerCase();
  return raw === name || raw === (name === "prize" ? "1" : "2");
}

// Credit rows carry the money in `reward_details` ("RM 2.64"); `amount` is used
// first in case the backend starts sending it as a number.
function creditAmountOf(row) {
  if (row?.amount != null && row.amount !== "") {
    const direct = Number(row.amount);
    if (Number.isFinite(direct)) return direct;
  }
  const match = String(row?.reward_details ?? "").match(/-?\d[\d,]*(?:\.\d+)?/);
  if (!match) return 0;
  const parsed = Number(match[0].replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function readBackendTotals(res) {
  const credit = res?.total_credit_amount ?? res?.totals?.total_credit_amount;
  const prizes = res?.total_prizes_claimed ?? res?.totals?.total_prizes_claimed;
  if (credit == null && prizes == null) return null;
  return { credit: Number(credit ?? 0), prizes: Number(prizes ?? 0), truncated: false };
}

// Returns null when `stillCurrent()` goes false — a newer filter change has
// superseded this sweep, so there is nothing worth finishing.
async function sweepTotals(params, stillCurrent) {
  let credit = 0;
  let prizes = 0;
  for (let page = 1; page <= TOTALS_MAX_PAGES; page += 1) {
    const res = await getRewardReport({ ...params, page, page_size: TOTALS_PAGE_SIZE });
    const provided = readBackendTotals(res);
    if (provided) return provided;

    const rows = res?.results || [];
    for (const row of rows) {
      if (isCategory(row, "credit")) credit += creditAmountOf(row);
      else if (isCategory(row, "prize")) prizes += 1;
    }
    if (!res?.next || rows.length === 0) return { credit, prizes, truncated: false };
    if (!stillCurrent()) return null;
  }
  return { credit, prizes, truncated: true };
}

function TotalStat({ label, value, truncated }) {
  return (
    <div className="min-w-[140px] px-4 py-2">
      <p className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.06em] text-[#f6dda6]/80">{label}</p>
      <p className="mt-0.5 whitespace-nowrap text-[19px] font-bold tabular-nums text-[#f2cb7a]">
        {truncated ? <span className="text-[13px] text-white/50">≥ </span> : null}{value}
      </p>
    </div>
  );
}

function TotalsPanel({ totals, loading, showCredit, showPrizes, period }) {
  const value = (formatted) => (loading || !totals ? "—" : formatted);

  return (
    <div className="shrink-0 overflow-hidden rounded-[10px] border border-[#f2cb7a] bg-black/30">
      <div className="flex items-stretch divide-x divide-[#f2cb7a]/30 py-1">
        {showCredit ? (
          <TotalStat
            label="Total Credit Amount"
            value={value(`RM ${formatMoney(totals?.credit)}`)}
            truncated={!loading && totals?.truncated}
          />
        ) : null}
        {showPrizes ? (
          <TotalStat
            label="Total Prizes Claimed"
            value={value(formatCount(totals?.prizes))}
            truncated={!loading && totals?.truncated}
          />
        ) : null}
      </div>
      <p className="border-t border-[#f2cb7a]/20 px-4 py-1.5 text-[11px] text-white/45">
        {loading ? "Calculating…" : `${formatIsoDate(period.start)} – ${formatIsoDate(period.end)}`}
        {period.isDefault ? " · this month (default)" : ""}
        {!loading && totals?.truncated ? ` · first ${formatCount(TOTALS_MAX_PAGES * TOTALS_PAGE_SIZE)} records` : ""}
      </p>
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

function compareRows(a, b, sortConfig) {
  const { key, direction } = sortConfig;
  const multiplier = direction === "asc" ? 1 : -1;

  if (key === "dateTime") {
    return (new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) * multiplier;
  }

  return a[key].localeCompare(b[key]) * multiplier;
}

function RewardReportContent() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [detailFilter, setDetailFilter] = useState("");
  const [rewardNameFilter, setRewardNameFilter] = useState("");
  const [usernameQuery, setUsernameQuery] = useState("");
  const [phoneQuery, setPhoneQuery] = useState("");

  const activeFilters = [dateFrom, dateTo, categoryFilter, detailFilter, rewardNameFilter, usernameQuery, phoneQuery];
  const hasActiveFilters = activeFilters.some(Boolean);

  const clearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setCategoryFilter("");
    setDetailFilter("");
    setRewardNameFilter("");
    setUsernameQuery("");
    setPhoneQuery("");
  };

  const [sortConfig, setSortConfig] = useState({ key: "created", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totals, setTotals] = useState(null);
  const [totalsLoading, setTotalsLoading] = useState(false);
  const totalsRunRef = useRef(0);

  const catValue = useMemo(
    () => getCategoryOptions("reward").find((o) => o.label === categoryFilter)?.value,
    [categoryFilter]
  );

  // With no date filter the totals default to the current calendar month; the
  // table itself stays unfiltered, so the panel captions its own period.
  const totalsPeriod = useMemo(() => {
    if (dateFrom && dateTo) return { start: dateFrom, end: dateTo, isDefault: false };
    const now = new Date();
    return {
      start: toIsoDate(new Date(now.getFullYear(), now.getMonth(), 1)),
      end: toIsoDate(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
      isDefault: true,
    };
  }, [dateFrom, dateTo]);

  const fetchReport = useCallback(async (page) => {
    setLoading(true);
    try {
      const params = {
        page,
        page_size: PAGE_SIZE,
        start_date: dateFrom || undefined,
        end_date: dateTo || undefined,
        category: catValue || undefined,
        reward_details: detailFilter || undefined,
        reward_name: rewardNameFilter || undefined,
        username: usernameQuery || undefined,
        phone_number: phoneQuery || undefined,
      };
      const res = await getRewardReport(params);
      setRows(res.results || []);
      setTotalCount(res.count || 0);
    } catch (err) {
      console.error(err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, catValue, detailFilter, rewardNameFilter, usernameQuery, phoneQuery]);

  useEffect(() => {
    // Only fetch if both dates are filled or both are empty
    const isDateRangeValid = (!dateFrom && !dateTo) || (dateFrom && dateTo);
    if (!isDateRangeValid) {
      return; // Don't fetch if date range is incomplete
    }

    setCurrentPage(1);
    fetchReport(1);
  }, [fetchReport]);

  useEffect(() => {
    const isDateRangeValid = (!dateFrom && !dateTo) || (dateFrom && dateTo);
    if (!isDateRangeValid) return;

    const runId = totalsRunRef.current + 1;
    totalsRunRef.current = runId;
    const isCurrent = () => totalsRunRef.current === runId;

    // Debounced: the text filters refetch on every keystroke, and a sweep is a
    // lot more expensive than one table page.
    const timer = setTimeout(async () => {
      setTotalsLoading(true);
      try {
        const result = await sweepTotals({
          start_date: totalsPeriod.start,
          end_date: totalsPeriod.end,
          category: catValue || undefined,
          reward_details: detailFilter || undefined,
          reward_name: rewardNameFilter || undefined,
          username: usernameQuery || undefined,
          phone_number: phoneQuery || undefined,
        }, isCurrent);
        if (!isCurrent() || result === null) return;
        setTotals(result);
      } catch (err) {
        console.error(err);
        if (isCurrent()) setTotals(null);
      } finally {
        if (isCurrent()) setTotalsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [dateFrom, dateTo, totalsPeriod, catValue, detailFilter, rewardNameFilter, usernameQuery, phoneQuery]);

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
    <main className="min-h-screen xl:admin-content-pl pr-10 pt-8 pb-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold leading-[1.05] text-white">
              Reward Report
            </h1>
            <p className="mt-2 text-[14px] text-white/55">
              Frontend-only report layout based on the approved Phase 1 enhancement spec.
            </p>
          </div>

        </div>

        <section className="overflow-hidden rounded-[12px] border border-[rgba(255,255,132,0.18)] bg-[linear-gradient(180deg,rgba(28,48,31,0.98)_0%,rgba(24,44,28,0.98)_100%)] shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
          {/* Two deliberate rows — title/totals, then the filters. Previously all
              eight elements shared one flex-wrap, so the wrap point was accidental. */}
          <div className="border-b border-white/5 px-4 pt-4 pb-3">
            <div className="flex flex-wrap items-start gap-4">
              <div className="min-w-0 flex-1">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="text-[15px] font-bold text-[#f4efe0] sm:text-[16px] lg:text-[17px]">
                    The Reward Reports Are Given
                  </h2>

                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="shrink-0 whitespace-nowrap rounded-[8px] border border-[#f2cb7a]/60 px-3 py-1.5 text-[12px] font-semibold text-[#eaad2c] transition-colors hover:bg-white/5"
                    >
                      Clear filters
                    </button>
                  )}
                </div>

                <div className="flex items-start gap-3">
                  <span className="mt-2 shrink-0 text-[13px] text-[#d6d6d6]">
                    Filter By:
                  </span>

                  {/* An even grid, so six controls land in tidy columns instead of
                      wrapping raggedly and orphaning the last one. */}
                  <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    <DateFilter fullWidth label="Date/Time" fromDate={dateFrom} toDate={dateTo} onFromChange={setDateFrom} onToChange={setDateTo} />
                    <FilterDropdown fullWidth label="Category" options={getCategoryOptions("reward").map(o => o.label)} value={categoryFilter} onChange={setCategoryFilter} />
                    <TextSearchInput fullWidth placeholder="Reward Details" value={detailFilter} onChange={setDetailFilter} />
                    <TextSearchInput fullWidth placeholder="Reward Name" value={rewardNameFilter} onChange={setRewardNameFilter} />
                    <TextSearchInput fullWidth placeholder="Enter Username" value={usernameQuery} onChange={setUsernameQuery} />
                    <TextSearchInput fullWidth placeholder="Enter Phone" value={phoneQuery} onChange={setPhoneQuery} />
                  </div>
                </div>
              </div>

              <TotalsPanel
                totals={totals}
                loading={totalsLoading}
                showCredit={categoryFilter !== "Prize"}
                showPrizes={categoryFilter !== "Credit"}
                period={totalsPeriod}
              />
            </div>
          </div>

          <div className="overflow-x-auto overflow-y-hidden scrollbar-admin">
            <table className="min-w-[1040px] w-full table-fixed border-separate border-spacing-0">
              <thead>
                <tr className="bg-black">
                  {TABLE_COLUMNS.map((column) => {
                    const active = sortConfig.key === column.key;

                    return (
                      <th key={column.key} className={`${column.className} px-4 py-[14px] first:pl-5 last:pr-5`}>
                        <button
                          type="button"
                          onClick={() => handleSort(column.key)}
                          className="flex w-full items-center justify-start"
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
                  sortedRows.map((row) => (
                    <tr key={row.id} className="border-b border-[rgba(255,255,255,0.08)] transition-colors hover:bg-white/[0.03]">
                      <td className="px-4 py-[14px] first:pl-5 text-[13px] text-[#f1f1f1] truncate" title={row.phone_number || ""}>
                        {row.phone_number || "—"}
                      </td>
                      <td className="px-4 py-[14px] text-[13px] text-[#f1f1f1] truncate" title={row.username || ""}>
                        {row.username || "—"}
                      </td>
                      <td className="px-4 py-[14px] text-[13px] text-[#e8e8e8] truncate" title={row.station || ""}>
                        {row.station || "—"}
                      </td>
                      <td className="px-4 py-[14px] text-[13px] text-[#e8e8e8] whitespace-nowrap">
                        {formatDateTime(row.created)}
                      </td>
                      <td className="px-4 py-[14px] text-[13px] text-[#ece9dc] truncate" title={row.category || ""}>
                        {row.category || "—"}
                      </td>
                      <td className="px-4 py-[14px] text-[13px] text-[#dadada] truncate" title={row.reward_details || ""}>
                        {row.reward_details || "—"}
                      </td>
                      <td className="px-4 py-[14px] pr-5 text-[13px] text-[#f1f1f1] truncate" title={row.reward_name || ""}>
                        {row.reward_name || "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={TABLE_COLUMNS.length}
                      className="px-5 py-12 text-center text-[14px] text-white/60"
                    >
                      {loading ? "Loading reports..." : "No reward report rows match the current filters."}
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

export default function RewardReportPage() {
  return (
    <AdminRouteGuard>
      <RewardReportContent />
    </AdminRouteGuard>
  );
}
