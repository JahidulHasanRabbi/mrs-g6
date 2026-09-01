"use client";

import { useEffect, useMemo, useRef, useState, useCallback, Suspense } from "react";
import { AdminRouteGuard } from "../../../components/guards/AdminRouteGuard";
import { FilterDropdown, TextSearchInput } from "../../../components/admin/members/FilterControls";
import { Pagination } from "../../../components/admin/members/DataTable";
import ReportRangeBar, { presetRange } from "../../../components/admin/reports/ReportRangeBar";
import { GRAD_GOLD, GRAD_DARK } from "../../../components/admin/retention/constants";
import { getRewardReport, getRewardReportKpi } from "../../../api/adminApi";
import { getCategoryOptions } from "../../../api/queryParams";

const PAGE_SIZE = 8;

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

function formatMoney(value) {
  return Number(value || 0).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatCount(value) {
  return Number(value || 0).toLocaleString("en-MY");
}

// GET /member/reward-report-kpi/ — totals over every filtered record, not
// just the current table page. Same filters as the table, so the two numbers
// can never disagree. Both keys are always present regardless of category.
async function fetchTotals(params) {
  const res = await getRewardReportKpi(params);
  return {
    credit: Number(res?.total_credit_amount ?? 0),
    prizes: Number(res?.total_prizes_claimed ?? 0),
  };
}

function CreditIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 18V6h6a4 4 0 0 1 0 8H6" />
      <path d="M14 14l4 4" />
    </svg>
  );
}

function PrizeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4z" />
      <path d="M7 5H4a3 3 0 0 0 3 4" />
      <path d="M17 5h3a3 3 0 0 1-3 4" />
    </svg>
  );
}

// Gold-gradient KPI card — same pattern as Member Alert / PIC Dashboard.
function KpiCard({ icon, label, value, loading }) {
  return (
    <div className="flex items-center gap-4 rounded-[16px] border-[3px] border-[#f2cb7a] p-6" style={{ backgroundImage: GRAD_GOLD }}>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px] text-[#e9af41]" style={{ backgroundImage: GRAD_DARK }}>
        {icon}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-[16px] font-semibold uppercase leading-[24px] text-[#141828]" style={{ letterSpacing: "-1px" }}>{label}</p>
        <p
          className="whitespace-nowrap font-bold text-[#141828]"
          style={{ fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif", fontSize: "32px", lineHeight: "40px" }}
        >
          {loading ? "—" : value}
        </p>
      </div>
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
  // One shared date+time range drives both the table and the KPI totals —
  // same Daily/Monthly/Yearly + custom picker as Usage Report. Defaults to
  // Monthly (day 1 of the current month through today) on first load.
  const [preset, setPreset] = useState("monthly");
  const [range, setRange] = useState(() => presetRange("monthly"));
  const [categoryFilter, setCategoryFilter] = useState("");
  const [detailFilter, setDetailFilter] = useState("");
  const [rewardNameFilter, setRewardNameFilter] = useState("");
  const [usernameQuery, setUsernameQuery] = useState("");
  const [phoneQuery, setPhoneQuery] = useState("");

  const activeFilters = [categoryFilter, detailFilter, rewardNameFilter, usernameQuery, phoneQuery];
  const hasActiveFilters = activeFilters.some(Boolean);

  const clearFilters = () => {
    setCategoryFilter("");
    setDetailFilter("");
    setRewardNameFilter("");
    setUsernameQuery("");
    setPhoneQuery("");
  };

  const handlePreset = useCallback((next) => {
    setPreset(next);
    const computed = presetRange(next);
    if (computed) setRange(computed);
  }, []);

  const handleCustomRange = useCallback((next) => {
    setPreset("custom");
    setRange(next);
  }, []);

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

  const fetchReport = useCallback(async (page) => {
    if (!range.from || !range.to) return;
    setLoading(true);
    try {
      const params = {
        page,
        page_size: PAGE_SIZE,
        start_date: range.from,
        end_date: range.to,
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
  }, [range, catValue, detailFilter, rewardNameFilter, usernameQuery, phoneQuery]);

  useEffect(() => {
    setCurrentPage(1);
    fetchReport(1);
  }, [fetchReport]);

  useEffect(() => {
    if (!range.from || !range.to) return;

    const runId = totalsRunRef.current + 1;
    totalsRunRef.current = runId;
    const isCurrent = () => totalsRunRef.current === runId;

    // Debounced: the text filters refetch on every keystroke.
    const timer = setTimeout(async () => {
      setTotalsLoading(true);
      try {
        const result = await fetchTotals({
          start_date: range.from,
          end_date: range.to,
          category: catValue || undefined,
          reward_details: detailFilter || undefined,
          reward_name: rewardNameFilter || undefined,
          username: usernameQuery || undefined,
          phone_number: phoneQuery || undefined,
        });
        if (!isCurrent()) return;
        setTotals(result);
      } catch (err) {
        console.error(err);
        if (isCurrent()) setTotals(null);
      } finally {
        if (isCurrent()) setTotalsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [range, catValue, detailFilter, rewardNameFilter, usernameQuery, phoneQuery]);

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
          <h1 className="text-4xl font-bold leading-[1.05] text-white">
            Reward Report
          </h1>
        </div>

        <div className="mb-5">
          <ReportRangeBar preset={preset} range={range} onPreset={handlePreset} onRangeChange={handleCustomRange} />
        </div>

        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {categoryFilter !== "Prize" ? (
            <KpiCard icon={<CreditIcon />} label="Total Credit Amount" value={`RM ${formatMoney(totals?.credit)}`} loading={totalsLoading} />
          ) : null}
          {categoryFilter !== "Credit" ? (
            <KpiCard icon={<PrizeIcon />} label="Total Prizes Claimed" value={formatCount(totals?.prizes)} loading={totalsLoading} />
          ) : null}
        </div>

        <section className="overflow-hidden rounded-[12px] border border-[rgba(255,255,132,0.18)] bg-[linear-gradient(180deg,rgba(28,48,31,0.98)_0%,rgba(24,44,28,0.98)_100%)] shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
          <div className="border-b border-white/5 px-4 pt-4 pb-3">
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

              {/* All 5 controls in one row at xl — 3 columns left a dangling
                  half-empty second row (5 items ÷ 3 = 3 + 2). */}
              <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-5">
                <FilterDropdown fullWidth label="Category" options={getCategoryOptions("reward").map(o => o.label)} value={categoryFilter} onChange={setCategoryFilter} />
                <TextSearchInput fullWidth placeholder="Reward Details" value={detailFilter} onChange={setDetailFilter} />
                <TextSearchInput fullWidth placeholder="Reward Name" value={rewardNameFilter} onChange={setRewardNameFilter} />
                <TextSearchInput fullWidth placeholder="Enter Username" value={usernameQuery} onChange={setUsernameQuery} />
                <TextSearchInput fullWidth placeholder="Enter Phone" value={phoneQuery} onChange={setPhoneQuery} />
              </div>
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
