"use client";

import { useCallback, useEffect, useState } from "react";
import { GRAD_DARK, GRAD_GOLD } from "../../../components/admin/retention/constants";
import {
  approveCrmLoginRequest,
  getCrmLoginRequests,
  rejectCrmLoginRequest,
} from "../../../api/crmApi";

// Login Requests — Figma 175:3738. Table of inbound login attempts; admin
// can Approve/Reject pending rows. Already-resolved rows show their final
// status badge and render the action buttons at 15% opacity so the row
// reads as "done" without removing it from the list.

const PAGE_SIZE = 7;

const STATUS_PENDING = "Pending";
const STATUS_APPROVED = "Approved";
const STATUS_REJECTED = "Rejected";

const COLUMNS = [
  { key: "username", label: "Username",   minW: 232, flex: false                },
  { key: "ip",       label: "IP Address", minW: 140, flex: true                 },
  { key: "device",   label: "Device",     minW: 160, flex: true                 },
  { key: "time",     label: "Req. Time",  minW: 170, flex: true                 },
  { key: "status",   label: "Status",     minW: 140, flex: true, align: "center" },
  { key: "action",   label: "Action",     minW: 266, flex: false, align: "end"  },
];

const TABLE_MIN_WIDTH = COLUMNS.reduce((sum, c) => sum + c.minW, 0);

function formatRequestTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-US", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mapLoginRequest(row) {
  return {
    id: row.uuid,
    username: row.user || row.username || "—",
    ip: row.ip_address || "—",
    device: row.device || "—",
    time: formatRequestTime(row.request_time),
    status: row.status || STATUS_PENDING,
  };
}

export default function LoginRequestsPage() {
  return (
    <>
      <PageHeader />
      <LoginListSection />
    </>
  );
}

function PageHeader() {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 px-2">
      <div className="flex flex-col gap-1">
        <span className="text-[12px] font-medium leading-[18px] text-white">
          ADMIN DASHBOARD
        </span>
        <h1
          className="bg-clip-text text-transparent font-bold whitespace-nowrap"
          style={{
            backgroundImage: GRAD_GOLD,
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: "clamp(32px, 5vw, 46px)",
            lineHeight: "1.2",
            letterSpacing: "-1px",
          }}
        >
          Login Requests
        </h1>
      </div>
    </div>
  );
}

function LoginListSection() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  const loadRows = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCrmLoginRequests({ page, page_size: PAGE_SIZE });
      const results = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
      setRows(results.map(mapLoginRequest));
      setTotal(Number.isFinite(res?.count) ? res.count : results.length);
    } catch (err) {
      console.error("[login-requests] fetch failed", err);
      setError(err);
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const showingFrom = total === 0 ? 0 : startIdx + 1;
  const showingTo = Math.min(startIdx + rows.length, total);

  const [decidingId, setDecidingId] = useState(null);
  const [decideError, setDecideError] = useState(null);

  const decide = async (row, action) => {
    if (decidingId) return;
    setDecidingId(row.id);
    setDecideError(null);
    try {
      if (action === STATUS_APPROVED) await approveCrmLoginRequest(row.id);
      else await rejectCrmLoginRequest(row.id);
      await loadRows();
    } catch (err) {
      console.error("[login-requests] decision failed", err);
      setDecideError(action === STATUS_APPROVED ? "Failed to approve request." : "Failed to reject request.");
    } finally {
      setDecidingId(null);
    }
  };

  return (
    <section className="flex w-full flex-col overflow-hidden rounded-[16px] bg-[#041502] shadow-[0_-4px_12px_-2px_#dea220]">
      <header className="flex items-center justify-between p-6 w-full">
        <h2
          className="text-white font-bold whitespace-nowrap"
          style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: "26px",
            lineHeight: "39px",
            letterSpacing: "-2px",
          }}
        >
          Login List
        </h2>
      </header>

      {decideError && (
        <div className="mx-6 mb-0 mt-2 rounded-[8px] border border-[#fb3748] bg-[#d00416]/20 px-4 py-2 text-[12px] text-[#fb3748]">
          {decideError}
        </div>
      )}

      <div className="overflow-x-auto overflow-y-hidden scrollbar-admin">
        <div style={{ minWidth: TABLE_MIN_WIDTH }}>
          <TableHeader />
          <div className="flex w-full flex-col">
            {loading ? (
              <div className="px-6 py-12 text-center text-[12px] text-white/40">Loading...</div>
            ) : error ? (
              <div className="px-6 py-12 text-center text-[12px] text-red-400">Failed to load login requests.</div>
            ) : rows.length === 0 ? (
              <EmptyRow />
            ) : (
              rows.map((row) => (
                <LoginRow
                  key={row.id}
                  row={row}
                  deciding={decidingId === row.id}
                  onApprove={() => decide(row, STATUS_APPROVED)}
                  onReject={() => decide(row, STATUS_REJECTED)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <PaginationBar
        from={showingFrom}
        to={showingTo}
        total={total}
        page={safePage}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </section>
  );
}

function TableHeader() {
  return (
    <div className="flex w-full items-stretch" style={{ backgroundImage: GRAD_DARK }}>
      {COLUMNS.map((col) => {
        const align =
          col.align === "end"
            ? "items-end"
            : col.align === "center"
              ? "items-center"
              : "items-start";
        return (
          <div
            key={col.key}
            className={`flex flex-col px-6 py-4 ${col.flex ? "flex-1 min-w-0" : "shrink-0"} ${align}`}
            style={{ minWidth: col.minW, width: col.flex ? undefined : col.minW }}
          >
            <p
              className="text-[14px] font-semibold text-[#fbeed2] leading-[21px] whitespace-nowrap"
              style={{ letterSpacing: "-1px" }}
            >
              {col.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function LoginRow({ row, deciding, onApprove, onReject }) {
  const isPending = row.status === STATUS_PENDING;
  const actionsDisabled = !isPending || deciding;
  return (
    <div className="flex w-full items-stretch -mb-px border-b border-white/5">
      <Cell col={COLUMNS[0]}>
        <div className="flex items-center gap-3 min-w-0">
          <UserAvatar />
          <span className="text-[12px] font-medium text-white leading-[18px] whitespace-nowrap">
            {row.username}
          </span>
        </div>
      </Cell>
      <Cell col={COLUMNS[1]}>
        <span className="text-[12px] font-medium text-white leading-[18px] whitespace-nowrap">
          {row.ip}
        </span>
      </Cell>
      <Cell col={COLUMNS[2]}>
        <span className="text-[12px] font-medium text-white leading-[18px] whitespace-nowrap">
          {row.device}
        </span>
      </Cell>
      <Cell col={COLUMNS[3]}>
        <span className="text-[12px] font-medium text-white leading-[18px] whitespace-nowrap">
          {row.time}
        </span>
      </Cell>
      <Cell col={COLUMNS[4]}>
        <StatusBadge status={row.status} />
      </Cell>
      <Cell col={COLUMNS[5]}>
        <div className="flex items-center gap-2">
          <RejectButton onClick={onReject} disabled={actionsDisabled} />
          <ApproveButton onClick={onApprove} disabled={actionsDisabled} loading={deciding} />
        </div>
      </Cell>
    </div>
  );
}

function Cell({ col, children }) {
  const justify =
    col.align === "end"
      ? "justify-end"
      : col.align === "center"
        ? "justify-center"
        : "justify-start";
  return (
    <div
      className={`flex items-center p-6 ${col.flex ? "flex-1 min-w-0" : "shrink-0"} ${justify}`}
      style={{ minWidth: col.minW, width: col.flex ? undefined : col.minW }}
    >
      {children}
    </div>
  );
}

function UserAvatar() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3a4255]">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f6dda6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === STATUS_APPROVED) {
    return (
      <span
        className="flex items-center justify-center rounded-[8px] border border-[#1fc16b] px-4 py-2 text-[12px] font-medium leading-[18px] text-white whitespace-nowrap"
        style={{ backgroundColor: "rgba(31,193,107,0.15)" }}
      >
        Approved
      </span>
    );
  }
  if (status === STATUS_REJECTED) {
    return (
      <span
        className="flex items-center justify-center rounded-[8px] border border-[#d00416] px-4 py-2 text-[12px] font-medium leading-[18px] text-white whitespace-nowrap"
        style={{ backgroundColor: "rgba(208,4,22,0.25)" }}
      >
        Rejected
      </span>
    );
  }
  return (
    <span
      className="flex items-center justify-center rounded-[8px] border border-[#ffdb43] px-4 py-2 text-[12px] font-medium leading-[18px] text-white whitespace-nowrap"
      style={{ backgroundColor: "rgba(223,180,0,0.4)" }}
    >
      Pending
    </span>
  );
}

function RejectButton({ onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{ backgroundColor: "#d00416" }}
      className={`flex w-[105px] items-center justify-center gap-2 rounded-[8px] px-4 py-2 text-[12px] font-medium leading-[18px] text-white transition ${
        disabled ? "opacity-[0.15] cursor-not-allowed" : "hover:brightness-110"
      }`}
    >
      <CrossIcon />
      <span>Reject</span>
    </button>
  );
}

function ApproveButton({ onClick, disabled, loading }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{ backgroundColor: "#1fc16b" }}
      className={`flex items-center justify-center gap-2 rounded-[8px] px-4 py-2 text-[12px] font-medium leading-[18px] text-white transition ${
        disabled ? "opacity-[0.15] cursor-not-allowed" : "hover:brightness-110"
      }`}
    >
      <CheckIcon />
      <span>{loading ? "..." : "Approve"}</span>
    </button>
  );
}

function EmptyRow() {
  return (
    <div className="px-6 py-12 text-center text-[12px] text-white/40">
      No login requests.
    </div>
  );
}

// ── Icons ───────────────────────────────────────────────────────────────

function CrossIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ── Pagination ──────────────────────────────────────────────────────────

// Compact page-chip list with ellipsis. Pages <= 7 render in full, otherwise
// always show first + last and a 1-page window around `currentPage`.
function buildPageItems(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const items = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  if (start > 2) items.push("ellipsis-l");
  for (let p = start; p <= end; p += 1) items.push(p);
  if (end < totalPages - 1) items.push("ellipsis-r");
  items.push(totalPages);
  return items;
}

function PaginationBar({ from, to, total, page, totalPages, onPageChange }) {
  const items = buildPageItems(page, totalPages);
  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <div className="flex min-h-[44px] w-full items-center justify-between gap-3 flex-wrap px-6 py-3">
      <span className="text-[8px] text-white leading-[12px]">
        Showing {from} to {to} of {total} Results
      </span>
      <div className="flex items-center gap-[5.5px]">
        <PageButton
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={prevDisabled}
          ariaLabel="Previous page"
        >
          <PageChevron direction="left" />
        </PageButton>
        {items.map((item) =>
          typeof item === "number" ? (
            <PageNumber
              key={item}
              value={item}
              active={item === page}
              onClick={() => onPageChange(item)}
            />
          ) : (
            <span key={item} className="text-[8px] text-white leading-[12px]">....</span>
          )
        )}
        <PageButton
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={nextDisabled}
          ariaLabel="Next page"
        >
          <PageChevron direction="right" />
        </PageButton>
      </div>
    </div>
  );
}

function PageNumber({ value, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-[18px] w-[18px] items-center justify-center rounded-[4px] text-[8px] text-white leading-[12px] ${
        active ? "bg-[#eaad2c]" : "border border-[#eaad2c] hover:bg-[#eaad2c]/20"
      }`}
    >
      {value}
    </button>
  );
}

function PageButton({ children, onClick, ariaLabel, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
      className={`flex h-[18px] w-[18px] items-center justify-center rounded-[4px] border border-[#eaad2c] ${
        disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-[#eaad2c]/20"
      }`}
    >
      {children}
    </button>
  );
}

function PageChevron({ direction }) {
  const rotate = direction === "left" ? "rotate(180deg)" : "rotate(0deg)";
  return (
    <svg width="6" height="10" viewBox="0 0 6 10" fill="none" style={{ transform: rotate }}>
      <path
        d="M1 1l4 4-4 4"
        stroke="#eaad2c"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
