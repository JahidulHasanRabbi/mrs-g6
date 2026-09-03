"use client";

import { useEffect, useMemo, useState, useCallback, Suspense } from "react";
import { createPortal } from "react-dom";
import { AdminRouteGuard } from "../../../components/guards/AdminRouteGuard";
import { FilterDropdown, DateFilter, TextSearchInput } from "../../../components/admin/members/FilterControls";
import { Pagination } from "../../../components/admin/members/DataTable";
import { getStationList, getTokenReport } from "../../../api/adminApi";
import { getCrmMembers, giveTokens, giveBattlePoints } from "../../../api/crmApi";
import { useToast } from "../../../components/admin/ui/Toast";
import { formatItemTypeLabel } from "../../../api/apiOptions";
import ConfirmDialog from "../../../components/admin/ui/ConfirmDialog";
import {
  buildTokenReportParams,
  compareTokenReportRows,
  getTokenReportCategoryOptions,
  getTokenReportCurrencyValue,
  tokenReportRowKey,
  TOKEN_REPORT_CURRENCIES,
} from "../../../api/tokenReport.mjs";

const REWARD_TYPE_OPTIONS = [
  { value: "token", label: "KR Coins" },
  { value: "battle_point", label: "Battle Point" },
];

function MemberSearchModal({ open, onClose, onSelect }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setDebouncedQuery("");
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!open || !debouncedQuery) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setSearching(true);
    getCrmMembers({ page: 1, page_size: 10, search: debouncedQuery })
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
        setResults(list);
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setSearching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, debouncedQuery]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  const modal = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search member"
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[12px] border border-[#f2cb7a]/40 bg-[#0a0e0a] p-5 shadow-[0_0_32px_rgba(222,162,32,0.2)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-3 text-[15px] font-bold text-[#f4efe0]">Search Member</h2>
        <div className="relative">
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter phone number or username"
            className="w-full rounded-[8px] border border-[#f2cb7a] bg-[#141828] px-3 py-2 pr-9 text-[13px] text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#eaad2c]"
          />
          <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#e9af41]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        <div className="mt-3 max-h-72 overflow-y-auto rounded-[8px] border border-white/10">
          {!debouncedQuery ? (
            <div className="px-3 py-6 text-center text-[12px] text-white/40">
              Start typing a phone number or username.
            </div>
          ) : searching ? (
            <div className="px-3 py-6 text-center text-[12px] text-white/50">Searching...</div>
          ) : results.length === 0 ? (
            <div className="px-3 py-6 text-center text-[12px] text-white/50">No members found.</div>
          ) : (
            results.map((m) => (
              <button
                key={m.uuid}
                type="button"
                onClick={() => onSelect(m)}
                className="flex w-full items-center gap-3 border-b border-white/5 px-3 py-3 text-left last:border-b-0 hover:bg-white/5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3a4255] text-[#f6dda6]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-[15px] font-semibold text-white">{m.full_name || m.username}</span>
                  <span className="text-[13px] text-white/60">{m.phone_number}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

function ManualAddReward() {
  const toast = useToast();
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const [rewardType, setRewardType] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleSelectMember = (member) => {
    setSelectedMember(member);
    setSearchOpen(false);
  };

  const resetForm = () => {
    setSelectedMember(null);
    setRewardType("");
    setAmount("");
  };

  const canSubmit = selectedMember && rewardType && Number(amount) > 0 && !submitting;
  const rewardTypeLabel = REWARD_TYPE_OPTIONS.find((o) => o.value === rewardType)?.label || "";

  const handleConfirmSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      if (rewardType === "token") {
        await giveTokens({ member_uuid: selectedMember.uuid, token_amount: Number(amount) });
      } else {
        await giveBattlePoints({ member_uuid: selectedMember.uuid, battle_point_amount: Number(amount) });
      }
      toast.success(`${rewardTypeLabel} granted to ${selectedMember.full_name || selectedMember.username}`);
      resetForm();
      setConfirmOpen(false);
    } catch (err) {
      console.error("[manual-add-reward] submit failed", err);
      toast.error("Failed to grant reward");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mb-6 overflow-hidden rounded-[12px] border border-[rgba(255,255,132,0.18)] bg-[linear-gradient(180deg,rgba(28,48,31,0.98)_0%,rgba(24,44,28,0.98)_100%)] shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
      <div className="flex items-center gap-3 border-b border-white/5 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e0a744] bg-[rgba(233,175,65,0.08)] text-[#e9af41]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 12 20 22 4 22 4 12" />
            <rect x="2" y="7" width="20" height="5" />
            <line x1="12" y1="22" x2="12" y2="7" />
            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
          </svg>
        </div>
        <div>
          <h2 className="text-[15px] font-bold text-[#f4efe0]">Manual Add Reward</h2>
          <p className="text-[12px] text-white/55">Manually grant KR Coins or Battle Point to member.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <label className="mb-1.5 block text-[12px] text-white/70">
            Member Phone Number / Username <span className="text-[#fb3748]">*</span>
          </label>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex h-[38px] w-full items-center justify-between gap-2 rounded-[8px] border border-[#f2cb7a] bg-[#141828] px-3 text-left text-[13px] text-white transition hover:border-[#eaad2c]"
          >
            <span className={`min-w-0 flex-1 truncate ${selectedMember ? "text-white" : "text-white/40"}`}>
              {selectedMember
                ? `${selectedMember.full_name || selectedMember.username} — ${selectedMember.phone_number}`
                : "Search by phone or username"}
            </span>
            <svg className="shrink-0 text-[#e9af41]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>

        <div className="lg:col-span-1">
          <label className="mb-1.5 block text-[12px] text-white/70">
            Reward Type <span className="text-[#fb3748]">*</span>
          </label>
          <select
            value={rewardType}
            onChange={(e) => setRewardType(e.target.value)}
            className="h-[38px] w-full rounded-[8px] border border-[#f2cb7a] bg-[#141828] px-3 text-[13px] text-white focus:outline-none focus:ring-1 focus:ring-[#eaad2c]"
          >
            <option value="" disabled>Select Reward Type</option>
            {REWARD_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-1">
          <label className="mb-1.5 block text-[12px] text-white/70">
            Amount <span className="text-[#fb3748]">*</span>
          </label>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="h-[38px] w-full rounded-[8px] border border-[#f2cb7a] bg-[#141828] px-3 text-[13px] text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#eaad2c]"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 border-t border-white/5 px-5 py-4">
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          disabled={!canSubmit}
          className="flex shrink-0 items-center gap-2 rounded-[8px] bg-[#e9af41] px-5 py-2 text-[13px] font-semibold text-[#141828] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          Submit Reward
        </button>
      </div>

      <MemberSearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={handleSelectMember}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Grant reward?"
        message={
          selectedMember
            ? `Give ${amount} ${rewardTypeLabel} to ${selectedMember.full_name || selectedMember.username} (${selectedMember.phone_number}).`
            : ""
        }
        confirmLabel="Submit"
        tone="primary"
        loading={submitting}
        onConfirm={handleConfirmSubmit}
        onCancel={() => setConfirmOpen(false)}
      />
    </section>
  );
}

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
  { key: "token_details", label: "KR Coin Details", className: "w-[170px]" },
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
      {formatItemTypeLabel(value)}
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

  const hasActiveFilters = [dateFrom, dateTo, currencyFilter, categoryFilter, detailFilter, usernameQuery, phoneQuery, stationFilter].some(Boolean);

  const clearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setCurrencyFilter("");
    setCategoryFilter("");
    setDetailFilter("");
    setUsernameQuery("");
    setPhoneQuery("");
    setStationFilter("");
  };
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
              KR Coin and Battle Point Report
            </h1>
            <p className="mt-2 text-[14px] text-white/55">
              Combined KR Coin and battle point ledger report.
            </p>
          </div>

        </div>

        <ManualAddReward />

        <section className="overflow-hidden rounded-[12px] border border-[rgba(255,255,132,0.18)] bg-[linear-gradient(180deg,rgba(28,48,31,0.98)_0%,rgba(24,44,28,0.98)_100%)] shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
          <div className="border-b border-white/5 px-4 pt-4 pb-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-[15px] font-bold text-[#f4efe0] sm:text-[16px] lg:text-[17px]">
                The KR Coin &amp; Battle Point Reports Are Given
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

              {/* An even grid — the control count varies (KR Coin Details is
                  conditional), so a plain flex-wrap wrapped unpredictably. */}
              <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <DateFilter fullWidth label="Date/Time" fromDate={dateFrom} toDate={dateTo} onFromChange={setDateFrom} onToChange={setDateTo} />
                <FilterDropdown fullWidth label="Currency" options={TOKEN_REPORT_CURRENCIES} value={currencyFilter} onChange={handleCurrencyChange} />
                <FilterDropdown
                  fullWidth
                  label="Station"
                  options={stationOptions}
                  value={selectedStationName}
                  onChange={(name) => {
                    const station = stations.find((item) => stationName(item) === name);
                    setStationFilter(station?.uuid || "");
                  }}
                />
                <FilterDropdown
                  fullWidth
                  label={currencyValue ? "Category" : "Category (select currency)"}
                  options={categoryOptions}
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                  disabled={!currencyValue}
                />
                {currencyValue !== 2 && (
                  <TextSearchInput
                    fullWidth
                    placeholder="KR Coin Details"
                    title="Searches KR Coin rows only — battle point rows have no KR Coin details."
                    value={detailFilter}
                    onChange={setDetailFilter}
                  />
                )}
                <TextSearchInput fullWidth placeholder="Enter Username" value={usernameQuery} onChange={setUsernameQuery} />
                <TextSearchInput fullWidth placeholder="Enter Phone" value={phoneQuery} onChange={setPhoneQuery} />
              </div>
            </div>

            {detailFilter && currencyValue !== 1 && (
              <p className="mt-2 text-[12px] text-white/50">
                KR Coin Details only exists on KR Coin rows — filtering by it hides every battle point row.
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
                        <td className="px-4 py-[14px] text-[13px] truncate" title={formatItemTypeLabel(row.currency) || ""}>
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
                      {loading ? "Loading reports..." : "No KR Coin report rows match the current filters."}
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
