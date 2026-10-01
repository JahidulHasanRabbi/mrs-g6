"use client";

import { useEffect, useState } from "react";
import { Pagination } from "../members/DataTable";
import SettingsSection from "../world-cup/SettingsSection";
import { useToast } from "../ui/Toast";
import {
  getLeaderboardMonthlyRanking,
  getLeaderboardPayoutHistory,
} from "../../../api/adminApi";

const PAGE_SIZE = 10;
const HEADER_BG = "linear-gradient(180deg, #141828 0%, #333333 99.75%)";
const TH = "px-5 py-4 text-[13px] font-semibold text-[#fbeed2]";
const TD = "px-5 py-5 text-[12px] text-white";

const ITEM_TYPE_LABELS = { 1: "Free Credit", 2: "Item", 3: "KR Coins", 4: "Other" };
// monthly-ranking sends a string, payout-history sends 1/2 (or the string).
const STATUS_LABELS = { 1: "PAID", 2: "FAILED" };
const STATUS_COLORS = { PAID: "#4ade80", FAILED: "#f87171", "NO REWARD": "#9ca3af" };

function fmt(n) {
  if (n == null || n === "") return "-";
  const num = Number(n);
  return Number.isFinite(num) ? num.toLocaleString("en-US") : String(n);
}

function fmtDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString();
}

function errorMessage(error) {
  return error?.data?.detail || error?.data?.message || error?.message || "Please try again.";
}

function StatusCell({ value }) {
  const label = STATUS_LABELS[value] ?? String(value ?? "-");
  return (
    <td className={`${TD} font-semibold`} style={{ color: STATUS_COLORS[label] || "#fff" }}>
      {label}
    </td>
  );
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Current month back through January of the previous year, newest first.
function buildMonthOptions() {
  const now = new Date();
  const options = [];
  for (let y = now.getFullYear(), m = now.getMonth(); y >= now.getFullYear() - 1; ) {
    options.push({ value: `${y}-${String(m + 1).padStart(2, "0")}`, label: `${MONTH_NAMES[m]} ${y}` });
    if (m === 0) {
      y -= 1;
      m = 11;
    } else {
      m -= 1;
    }
  }
  return options;
}
const MONTH_OPTIONS = buildMonthOptions();

// "2026-04" -> { start_date: "2026-04-01", end_date: "2026-04-30" }
function monthToRange(month) {
  if (!month) return {};
  const [y, m] = month.split("-").map(Number);
  const last = new Date(y, m, 0).getDate();
  return { start_date: `${month}-01`, end_date: `${month}-${String(last).padStart(2, "0")}` };
}

function MonthFilter({ month, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2 px-4 pb-3 sm:px-6">
      <select
        value={month}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Month"
        className="rounded-[8px] border border-white/10 bg-[#141828] px-3 py-2 text-[12px] text-white [color-scheme:dark]"
      >
        <option value="">All months</option>
        {MONTH_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function Footer({ total, page, setPage }) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6">
      <p className="text-[10px] text-white/80">
        Showing {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, total)} of {total} Results
      </p>
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

function TableShell({ head, children }) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-white/5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr style={{ backgroundImage: HEADER_BG }} className="text-left">
              {head.map((h) => (
                <th key={h} className={TH}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}

function EmptyRow({ cols, text }) {
  return (
    <tr>
      <td colSpan={cols} className="px-5 py-10 text-center text-[13px] text-white/50">{text}</td>
    </tr>
  );
}

// Filtered, paginated fetch. Every request is scoped to this board's
// leaderboard type so each admin page only sees its own rows.
function useHistory(fetcher, type, label) {
  const toast = useToast();
  const [month, setMonth] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetcher({
      type,
      page,
      page_size: PAGE_SIZE,
      ...monthToRange(month),
    })
      .then((res) => {
        if (cancelled) return;
        const list = res?.results ?? res ?? [];
        setRows(Array.isArray(list) ? list : []);
        setCount(res?.count ?? (Array.isArray(list) ? list.length : 0));
      })
      .catch((error) => {
        if (!cancelled) toast.error(`Failed to load ${label}`, { description: errorMessage(error) });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, page, month]);

  const changeMonth = (next) => {
    setMonth(next);
    setPage(1);
  };

  return { month, changeMonth, page, setPage, rows, count };
}

function memberLabel(row) {
  return row.full_name || (row.member_id != null ? `#${row.member_id}` : "-");
}

export default function LeaderboardHistorySections({ type }) {
  const monthly = useHistory(getLeaderboardMonthlyRanking, type, "monthly ranking");
  const payouts = useHistory(getLeaderboardPayoutHistory, type, "payout history");

  return (
    <>
      <SettingsSection title="Monthly Ranking">
        <MonthFilter month={monthly.month} onChange={monthly.changeMonth} />
        <TableShell
          head={["Period", "Rank", "Member", "Amount", "Count", "Reward", "Won Amount", "Payout Status", "Created"]}
        >
          {monthly.rows.length === 0 ? (
            <EmptyRow cols={9} text="No monthly ranking yet." />
          ) : (
            monthly.rows.map((row) => (
              <tr key={row.uuid} className="border-b border-white/5 align-middle last:border-b-0 hover:bg-white/[0.02]">
                <td className={TD}>{row.period_start || "-"}</td>
                <td className={TD}>#{fmt(row.rank)}</td>
                <td className={TD}>{memberLabel(row)}</td>
                <td className={TD}>{fmt(row.amount)}</td>
                <td className={TD}>{fmt(row.count)}</td>
                <td className={TD}>{row.reward_name || "-"}</td>
                <td className={TD}>{fmt(row.won_amount)}</td>
                <StatusCell value={row.payout_status} />
                <td className={`${TD} text-white/70`}>{fmtDate(row.created)}</td>
              </tr>
            ))
          )}
        </TableShell>
        <Footer total={monthly.count} page={monthly.page} setPage={monthly.setPage} />
      </SettingsSection>

      <SettingsSection title="Payout History">
        <MonthFilter month={payouts.month} onChange={payouts.changeMonth} />
        <TableShell
          head={["Period", "Rank", "Member", "Reward", "Item Type", "Won Amount", "Status", "Notes", "Created"]}
        >
          {payouts.rows.length === 0 ? (
            <EmptyRow cols={9} text="No payouts yet." />
          ) : (
            payouts.rows.map((row) => (
              <tr key={row.uuid} className="border-b border-white/5 align-middle last:border-b-0 hover:bg-white/[0.02]">
                <td className={TD}>{row.period_start || "-"}</td>
                <td className={TD}>#{fmt(row.rank)}</td>
                <td className={TD}>{memberLabel(row)}</td>
                <td className={TD}>{row.reward_name || "-"}</td>
                <td className={TD}>{ITEM_TYPE_LABELS[row.item_type] ?? "-"}</td>
                <td className={TD}>{fmt(row.won_amount)}</td>
                <StatusCell value={row.status} />
                <td className={`${TD} text-white/70`}>{row.notes || "-"}</td>
                <td className={`${TD} text-white/70`}>{fmtDate(row.created)}</td>
              </tr>
            ))
          )}
        </TableShell>
        <Footer total={payouts.count} page={payouts.page} setPage={payouts.setPage} />
      </SettingsSection>
    </>
  );
}
