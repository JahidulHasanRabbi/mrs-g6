"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import RefreshControl from "../../../components/admin/retention/RefreshControl";
import PriorityBadge from "../../../components/admin/retention/PriorityBadge";
import Pagination from "../../../components/admin/retention/Pagination";
import { GRAD_DARK, GRAD_GOLD } from "../../../components/admin/retention/constants";
import {
  AlertViewModal,
  MOCK_FOLLOWUP_HISTORY,
  StatusBadge,
} from "../../../components/admin/retention/FollowUpComponents";
import {
  getPrioritySummary,
  refreshCrmMembers,
} from "../../../api/crmApi";
/*
import { getCrmMembers, getCrmUsers } from "../../../api/crmApi";
import { getVipTierList } from "../../../api/adminApi";
*/

// Member Alert page — Figma 69:340. "Overview" KPI strip + Member Follow Up
// list. The list is the same shape as /admin/retention/members but with a
// green "Done" action button instead of a gold View link.

const PAGE_SIZE = 7;

const PRIORITY_OPTIONS = ["High", "Medium", "Low"];
const STATUS_OPTIONS = ["New", "In Progress", "Snoozed", "Resolved"];
const ALERT_ACTION_OPTIONS = ["In Progress", "Resolve", "Snooze", "Remark"];

// Column widths from Figma 69:340 (frame ids 87:6604 etc). Username and
const COLUMNS = [
  { key: "name",     label: "Username",       minW: 200 },
  { key: "phone",    label: "Phone Number",   minW: 160 },
  { key: "vip",      label: "VIP Level",      minW: 100 },
  { key: "sales",    label: "Daily Sales",    minW: 120 },
  { key: "winloss",  label: "Daily Win/Loss", minW: 130 },
  { key: "priority", label: "Priority",       minW: 100 },
  { key: "pic",      label: "Retention",      minW: 120 },
  { key: "status",   label: "Status",         minW: 130 },
  { key: "action",   label: "Action",         minW: 150, align: "end" },
];

const TABLE_MIN_WIDTH = COLUMNS.reduce((sum, c) => sum + c.minW, 0);

// KPI tiles — all render with the gold gradient. Each tile pairs the label
// with a dark icon-tile whose glyph is tinted per priority (red → white →
// green → blue) so the row scans left-to-right from most to least urgent.
const KPI_META = [
  { id: "high",     label: "High Priority",    key: "high_priority",    icon: "user-times", iconColor: "#fb3748" },
  { id: "medium",   label: "Medium Priority",  key: "medium_priority",  icon: "user-minus", iconColor: "#fbeed2" },
  { id: "low",      label: "Low Priority",     key: "low_priority",     icon: "user-check", iconColor: "#84ebb4" },
  { id: "inactive", label: "Inactive Members", key: "inactive_members", icon: "user-clock", iconColor: "#4188ff" },
];

const MOCK_MEMBERS = [
  { uuid: "mock-001", full_name: "Ah Chong 88", phone_number: "+6012-309 8765", vip_level: "VIP 4", daily_sales: 9999.88, daily_win_loss: 1023.13, priority: "High", retention: "Sarah", status: "In Progress", last_action: "TG", last_action_at: "2026-05-27 09:15", last_action_by: "Sarah" },
  { uuid: "mock-002", full_name: "Jason Win", phone_number: "+6011-111 1111", vip_level: "VIP 5", daily_sales: 4000.00, daily_win_loss: -600.00, priority: "High", retention: "Sarah", status: "New", last_action: null, last_action_at: null, last_action_by: null },
  { uuid: "mock-003", full_name: "Peter Lee", phone_number: "+6012-353 2148", vip_level: "VIP 6", daily_sales: 5000.00, daily_win_loss: 1000.00, priority: "Medium", retention: "Eddie", status: "Snoozed", last_action: "WA", last_action_at: "2026-05-26 14:30", last_action_by: "Eddie" },
  { uuid: "mock-004", full_name: "Star99", phone_number: "+6016-778 4521", vip_level: "VIP 2", daily_sales: 2500.50, daily_win_loss: -300.00, priority: "Medium", retention: "Zoey", status: "In Progress", last_action: "Bonus", last_action_at: "2026-05-26 09:00", last_action_by: "Zoey" },
  { uuid: "mock-005", full_name: "MegaKing", phone_number: "+6019-234 5678", vip_level: "VIP 3", daily_sales: 8750.00, daily_win_loss: 450.00, priority: "Low", retention: "Candy", status: "Resolved", last_action: "LiveChat", last_action_at: "2026-05-25 16:45", last_action_by: "Candy" },
  { uuid: "mock-006", full_name: "LuckyDragon", phone_number: "+6013-987 6543", vip_level: "VIP 1", daily_sales: 1200.00, daily_win_loss: -150.00, priority: "Low", retention: "Marcus", status: "New", last_action: null, last_action_at: null, last_action_by: null },
  { uuid: "mock-007", full_name: "GoldFish77", phone_number: "+6017-456 7890", vip_level: "VIP 7", daily_sales: 15000.00, daily_win_loss: 2300.00, priority: "High", retention: "Sarah", status: "In Progress", last_action: "Event", last_action_at: "2026-05-24 11:20", last_action_by: "Sarah" },
];

function formatNumber(value) {
  if (value === null || value === undefined || value === "") return "0";
  return Number(value).toLocaleString("en-US");
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return "RM 0";
  const num = parseFloat(value);
  if (Number.isNaN(num)) return `RM ${value}`;
  return `RM ${num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export default function MemberAlertPage() {
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const res = await getPrioritySummary();
      setSummary(res || {});
    } catch (err) {
      console.error("[member-alert] priority-summary failed", err);
      setSummary({});
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  // POST refresh-members, then refresh the summary so KPIs reflect new state.
  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await refreshCrmMembers();
      await loadSummary();
    } catch (err) {
      console.error("[member-alert] refresh failed", err);
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, loadSummary]);

  return (
    <>
      <OverviewHeader onRefresh={handleRefresh} />
      <KpiRow summary={summary} loading={summaryLoading} />
      <FollowUpList />
    </>
  );
}

function OverviewHeader({ onRefresh }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 px-2">
      <div className="flex flex-col gap-1">
        <span className="text-[12px] font-medium leading-[18px] text-white">MEMBER RETENTION</span>
        <h1
          className="bg-clip-text text-transparent font-bold whitespace-nowrap"
          style={{
            backgroundImage: GRAD_GOLD,
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: "26px",
            lineHeight: "39px",
            letterSpacing: "-2px",
          }}
        >
          Overview
        </h1>
      </div>
      <RefreshControl onRefresh={onRefresh} />
    </div>
  );
}

function KpiRow({ summary, loading }) {
  return (
    <div className="grid w-full gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
      {KPI_META.map((kpi) => (
        <KpiCard
          key={kpi.id}
          kpi={kpi}
          value={loading ? "—" : formatNumber(summary?.[kpi.key])}
        />
      ))}
    </div>
  );
}

// Gold-gradient card with a dark icon-tile + per-priority colored glyph.
// Matches Figma 69:340.
function KpiCard({ kpi, value }) {
  return (
    <div
      className="flex items-center gap-4 rounded-[16px] border-[3px] border-[#f2cb7a] p-6"
      style={{ backgroundImage: GRAD_GOLD }}
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px]"
        style={{ backgroundImage: GRAD_DARK, color: kpi.iconColor }}
      >
        <KpiIcon name={kpi.icon} />
      </div>
      <div className="flex flex-1 min-w-0 flex-col gap-1">
        <p
          className="text-[16px] font-semibold uppercase leading-[24px] text-[#141828]"
          style={{ letterSpacing: "-1px" }}
        >
          {kpi.label}
        </p>
        <p
          className="font-bold text-[#141828] whitespace-nowrap"
          style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: "38px",
            lineHeight: "44px",
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

// FA-style user glyphs. Use currentColor so the wrapping icon-tile controls
// the fill via inline `color`. Sized at 24px; viewBox tuned to keep the
// person centered.
function KpiIcon({ name }) {
  const common = { width: 24, height: 24, viewBox: "0 0 24 24", fill: "currentColor" };
  if (name === "user-times") {
    return (
      <svg {...common}>
        <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 9a7 7 0 0 1 14 0v1H2v-1zm14.3-9.7l1.4-1.4 1.8 1.8 1.8-1.8 1.4 1.4-1.8 1.8 1.8 1.8-1.4 1.4-1.8-1.8-1.8 1.8-1.4-1.4 1.8-1.8-1.8-1.8z" />
      </svg>
    );
  }
  if (name === "user-minus") {
    return (
      <svg {...common}>
        <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 9a7 7 0 0 1 14 0v1H2v-1zm14-9h7v2h-7v-2z" />
      </svg>
    );
  }
  if (name === "user-check") {
    return (
      <svg {...common}>
        <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 9a7 7 0 0 1 14 0v1H2v-1zm15.5-2.5L15 15l-1.4 1.4 3.9 3.9 5.5-5.5L21.6 13.4l-4.1 4.1z" />
      </svg>
    );
  }
  // user-clock
  return (
    <svg {...common}>
      <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 9a7 7 0 0 1 12.5-4.3 6 6 0 0 0 .5 9.3H2v-5zm15-3a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm.5 2v3l2.1 1.3-.7 1.2L16 18v-4h1.5z" />
    </svg>
  );
}

function FollowUpList() {
  const [priority, setPriority] = useState("");
  const [vip, setVip] = useState("");
  const [retention, setRetention] = useState("");
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState(MOCK_MEMBERS);
  const [histories, setHistories] = useState(() =>
    Object.fromEntries(MOCK_MEMBERS.map((member) => [member.uuid, MOCK_FOLLOWUP_HISTORY]))
  );
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [remarkMemberId, setRemarkMemberId] = useState(null);

  /*
  useEffect(() => {
    getCrmUsers({ page: 1, page_size: 100 })
      .then((res) => {
        const results = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
        setPics(results);
      })
      .catch(() => setPics([]));
    getVipTierList()
      .then((res) => {
        const results = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
        setVipTiers(results.map((t) => ({ name: t.name, level: t.id ?? t.uuid })));
      })
      .catch(() => setVipTiers([]));
  }, []);
  */

  useEffect(() => {
    setPage(1);
  }, [priority, vip, retention, status, query]);

  const [debouncedQuery, setDebouncedQuery] = useState(query);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  /*
  useEffect(() => {
    let cancelled = false;
    const fetchRows = async () => {
      setLoading(true);
      try {
        const retentionUuid = retention
          ? pics.find((u) => (u.full_name || u.username) === retention)?.uuid
          : undefined;
        const res = await getCrmMembers({
          page,
          page_size: PAGE_SIZE,
          priority: priority ? PRIORITY_TO_INT[priority] : undefined,
          vip_level: vip ? (vipTiers.find((t) => t.name === vip)?.level ?? undefined) : undefined,
          retention: retentionUuid || undefined,
          search: debouncedQuery || undefined,
        });
        if (cancelled) return;
        const results = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
        setRows(results);
        setTotal(Number.isFinite(res?.count) ? res.count : results.length);
      } catch (err) {
        if (cancelled) return;
        console.error("[member-alert] members fetch failed", err);
        setRows([]);
        setTotal(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchRows();
    return () => {
      cancelled = true;
    };
  }, [page, priority, vip, retention, pics, debouncedQuery]);
  */

  const vipOptions = [...new Set(MOCK_MEMBERS.map((member) => member.vip_level).filter(Boolean))];
  const retentionOptions = [...new Set(MOCK_MEMBERS.map((member) => member.retention).filter(Boolean))];
  const filteredRows = rows.filter((member) => {
    const haystack = `${member.full_name || ""} ${member.username || ""} ${member.phone_number || ""}`.toLowerCase();
    return (
      (!priority || member.priority === priority) &&
      (!vip || member.vip_level === vip) &&
      (!retention || member.retention === retention) &&
      (!status || member.status === status) &&
      (!debouncedQuery || haystack.includes(debouncedQuery.toLowerCase()))
    );
  });

  const total = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const pagedRows = filteredRows.slice(startIdx, startIdx + PAGE_SIZE);
  const showingFrom = total === 0 ? 0 : startIdx + 1;
  const showingTo = Math.min(startIdx + pagedRows.length, total);
  const selectedMember = rows.find((member) => member.uuid === selectedMemberId);

  const updateAlertStatus = (memberUuid, nextStatus) => {
    setRows((prev) =>
      prev.map((member) =>
        member.uuid === memberUuid
          ? {
              ...member,
              status: nextStatus,
              priority: nextStatus === "Snoozed" ? "Low" : member.priority,
            }
          : member
      )
    );
  };

  const handleActionSelect = (memberUuid, actionType) => {
    if (actionType === "In Progress") updateAlertStatus(memberUuid, "In Progress");
    if (actionType === "Snooze") updateAlertStatus(memberUuid, "Snoozed");
    if (actionType === "Resolve") updateAlertStatus(memberUuid, "Resolved");
    if (actionType === "Remark") setRemarkMemberId(memberUuid);
  };

  const handleSnooze = (memberUuid) => {
    updateAlertStatus(memberUuid, "Snoozed");
  };

  return (
    <section className="flex w-full flex-col overflow-hidden rounded-[16px] bg-[#041502] shadow-[0_-4px_12px_-2px_#dea220]">
      <header className="flex flex-col gap-4 p-6 w-full md:flex-row md:flex-wrap md:items-center">
        <h2
          className="text-white font-bold whitespace-nowrap md:flex-1 md:min-w-0"
          style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: "26px",
            lineHeight: "39px",
            letterSpacing: "-2px",
          }}
        >
          Member Follow Up List
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <FilterPill label="Priority" value={priority} onChange={setPriority} options={PRIORITY_OPTIONS} />
          <FilterPill label="VIP Level" value={vip} onChange={setVip} options={vipOptions} />
          <FilterPill label="All Retention" value={retention} onChange={setRetention} options={retentionOptions} />
          <FilterPill label="Status" value={status} onChange={setStatus} options={STATUS_OPTIONS} />
          <SearchInput value={query} onChange={setQuery} />
        </div>
      </header>

      <div className="overflow-x-auto overflow-y-hidden scrollbar-admin">
        <div style={{ minWidth: TABLE_MIN_WIDTH }}>
          <TableHeader />
          <div className="flex w-full flex-col">
            {pagedRows.length === 0 ? (
              <EmptyRow />
            ) : (
              pagedRows.map((row, idx) => (
                <TableRow
                  key={`${row.uuid || row.username || "member"}-${idx}`}
                  row={row}
                  onView={() => setSelectedMemberId(row.uuid)}
                  onActionSelect={(actionType) => handleActionSelect(row.uuid, actionType)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <Pagination
        from={showingFrom}
        to={showingTo}
        total={total}
        currentPage={safePage}
        pageCount={totalPages}
        onPageChange={setPage}
      />
      {selectedMember ? (
        <AlertViewModal
          member={selectedMember}
          onClose={() => setSelectedMemberId(null)}
          onSnooze={() => handleSnooze(selectedMember.uuid)}
        />
      ) : null}
      {remarkMemberId ? (
        <RemarkModal
          memberName={rows.find((member) => member.uuid === remarkMemberId)?.full_name || "Member"}
          onClose={() => setRemarkMemberId(null)}
          onSubmit={(remark) => {
            setRows((prev) =>
              prev.map((member) =>
                member.uuid === remarkMemberId
                  ? {
                      ...member,
                      last_action: "Remark",
                      last_action_at: currentDateTime(),
                      last_action_by: "Sarah",
                      remark,
                    }
                  : member
              )
            );
            setRemarkMemberId(null);
          }}
        />
      ) : null}
    </section>
  );
}

function currentDateTime() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function RemarkModal({ memberName, onClose, onSubmit }) {
  const [remark, setRemark] = useState("");
  const canSubmit = remark.trim().length > 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4" style={{ backgroundColor: "rgba(0,0,0,0.65)" }}>
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-[16px] bg-[#05060a] p-6 shadow-[0_0_3px_0_#dea220]">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <h2
            className="bg-clip-text text-transparent font-bold"
            style={{
              backgroundImage: GRAD_GOLD,
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: "22px",
              lineHeight: "33px",
              letterSpacing: "-1.5px",
            }}
          >
            Remark - {memberName}
          </h2>
          <button type="button" onClick={onClose} className="rounded-[6px] p-1 text-white/60 transition hover:bg-white/10 hover:text-white" aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <textarea
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          placeholder="Write remark here..."
          className="mt-5 min-h-[96px] w-full resize-none rounded-[8px] border border-[#f2cb7a] bg-[#141828] px-3 py-2 text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#eaad2c]"
        />
        <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[8px] border border-[#d00416] px-5 py-2 text-[12px] font-medium text-[#d00416] transition hover:bg-[#d00416]/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => canSubmit && onSubmit(remark.trim())}
            disabled={!canSubmit}
            className="rounded-[8px] border border-[#f2cb7a] px-5 py-2 text-[12px] font-medium text-[#141828] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundImage: GRAD_GOLD }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyRow() {
  return (
    <div className="px-6 py-12 text-center text-[12px] text-white/40">
      No members found.
    </div>
  );
}

function FilterPill({ label, value, onChange, options }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center gap-1 rounded-[8px] border border-[#f2cb7a] px-4 py-2"
        style={{ backgroundImage: GRAD_DARK }}
      >
        <span className="text-[12px] font-medium text-[#f6dda6] leading-[18px] whitespace-nowrap">
          {value || label}
        </span>
        <Chevron up={open} />
      </button>
      {open ? (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-1 z-20 min-w-full rounded-[8px] border border-[#f2cb7a] overflow-hidden"
            style={{ backgroundImage: GRAD_DARK }}
          >
            <button
              type="button"
              onClick={() => { onChange(""); setOpen(false); }}
              className="block w-full text-left px-4 py-2 text-[12px] text-[#f6dda6] hover:bg-white/5 whitespace-nowrap"
            >
              All
            </button>
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setOpen(false); }}
                className="block w-full text-left px-4 py-2 text-[12px] text-[#f6dda6] hover:bg-white/5 whitespace-nowrap"
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function Chevron({ up }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#f6dda6"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: up ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 0.2s" }}
    >
      <polyline points="6 15 12 9 18 15" />
    </svg>
  );
}

function SearchInput({ value, onChange }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter Name/Phone Number"
      className="w-[180px] bg-[#141828] border border-[#f2cb7a] rounded-[8px] px-3 py-2 text-[10px] italic text-[#f6dda6] placeholder:text-[#f6dda6] placeholder:capitalize focus:outline-none focus:ring-1 focus:ring-[#eaad2c]"
      style={{ fontFamily: "Inter, sans-serif", lineHeight: "15px" }}
    />
  );
}

function TableHeader() {
  return (
    <div className="flex w-full items-stretch" style={{ backgroundImage: GRAD_DARK }}>
      {COLUMNS.map((col) => (
        <div
          key={col.key}
          className={`flex flex-1 flex-col px-4 py-4 ${col.align === "end" ? "items-end" : "items-start"}`}
          style={{ minWidth: col.minW }}
        >
          <p className="text-[12px] font-medium text-[#fbeed2] leading-[18px] whitespace-nowrap">
            {col.label}
          </p>
        </div>
      ))}
    </div>
  );
}

function TableRow({ row, onView, onActionSelect }) {
  return (
    <div className="flex w-full items-stretch -mb-px border-b border-white/5">
      <Cell minW={COLUMNS[0].minW}>
        <div className="flex items-start gap-3">
          <div className="shrink-0 pt-0.5"><UserAvatar /></div>
          <span className="text-[12px] font-medium text-white leading-[18px] break-words">
            {row.full_name || row.username}
          </span>
        </div>
      </Cell>
      <DataCell value={row.phone_number} minW={COLUMNS[1].minW} />
      <DataCell value={row.vip_level} minW={COLUMNS[2].minW} />
      <DataCell value={formatCurrency(row.daily_sales)} minW={COLUMNS[3].minW} />
      <DataCell value={formatCurrency(row.daily_win_loss)} minW={COLUMNS[4].minW} />
      <Cell minW={COLUMNS[5].minW}>
        <PriorityBadge value={row.priority} />
      </Cell>
      <DataCell value={row.retention} minW={COLUMNS[6].minW} />
      <Cell minW={COLUMNS[7].minW}>
        <StatusBadge value={row.status} />
      </Cell>
      <Cell minW={COLUMNS[8].minW} align="end">
        <div className="flex items-center justify-end gap-2">
          <ViewButton onClick={onView} />
          <FollowupActionMenu onSelect={onActionSelect} />
        </div>
      </Cell>
    </div>
  );
}

// View link — dark gradient pill with gold border and gold text/eye icon.
// Matches Figma 20:1735 (the shared "button" component used across the table).
function ViewButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[34px] w-[34px] items-center justify-center rounded-[8px] border-2 border-[#f2cb7a] transition hover:brightness-110"
      style={{ backgroundImage: GRAD_GOLD }}
      aria-label="View followup history"
    >
      <EyeIcon />
    </button>
  );
}

function FollowupActionMenu({ onSelect }) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const buttonRef = useRef(null);

  const openMenu = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      setMenuPos({
        top: rect.bottom + 4,
        right: Math.max(8, window.innerWidth - rect.right),
      });
    }
    setOpen((v) => !v);
  };

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={openMenu}
        className="flex h-[34px] items-center justify-center gap-1 rounded-[8px] border border-[#f2cb7a] px-3 transition hover:brightness-110"
        style={{ backgroundImage: GRAD_DARK }}
      >
        <span className="text-[12px] font-medium text-[#eaad2c] leading-[18px]">Action</span>
        <Chevron up={open} />
      </button>
      {open ? (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="fixed z-50 min-w-[170px] overflow-hidden rounded-[14px] bg-[#fbeed2] py-2 shadow-[0_12px_32px_rgba(0,0,0,0.45)]"
            style={{ top: menuPos.top, right: menuPos.right }}
          >
            {ALERT_ACTION_OPTIONS.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  onSelect(type);
                  setOpen(false);
                }}
                className={`block w-full px-5 py-2.5 text-left text-[14px] font-medium leading-[21px] transition hover:bg-[#f2cb7a]/30 ${
                  type === "Resolve" ? "text-[#d00416]" : "text-[#141828]"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}


function EyeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#141828"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function DataCell({ value, minW }) {
  return (
    <Cell minW={minW}>
      <span className="text-[12px] font-medium text-white leading-[18px] whitespace-nowrap">
        {value ?? "—"}
      </span>
    </Cell>
  );
}

function Cell({ children, minW, align = "start" }) {
  const justify = align === "end" ? "justify-end" : "justify-start";
  return (
    <div className={`flex flex-1 items-center overflow-hidden px-4 py-4 ${justify}`} style={{ minWidth: minW }}>
      {children}
    </div>
  );
}

function UserAvatar() {
  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
      style={{ background: "#3a4255" }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f6dda6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </div>
  );
}

