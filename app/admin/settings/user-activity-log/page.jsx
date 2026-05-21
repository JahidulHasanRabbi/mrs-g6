"use client";

import { useCallback, useEffect, useState } from "react";
import { GRAD_DARK, GRAD_GOLD } from "../../../components/admin/retention/constants";
import { getCrmActivityLog } from "../../../api/crmApi";

const PAGE_SIZE = 7;

const COLUMNS = [
  { key: "id", label: "#", minW: 70, flex: false },
  { key: "date", label: "Date", minW: 130, flex: true },
  { key: "time", label: "Time", minW: 130, flex: true },
  { key: "user", label: "User", minW: 180, flex: true },
  { key: "activity", label: "Activity", minW: 360, flex: false, align: "end" },
];

const TABLE_MIN_WIDTH = COLUMNS.reduce((sum, c) => sum + c.minW, 0);

export default function UserActivityLogPage() {
  return (
    <>
      <PageHeader />
      <ActivityListSection />
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
          Activity Log
        </h1>
      </div>
    </div>
  );
}

function ActivityListSection() {
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadRows = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await getCrmActivityLog({ page, page_size: PAGE_SIZE });
      const results = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
      setRows(results.map((row, idx) => mapActivityRow(row, (page - 1) * PAGE_SIZE + idx + 1)));
      setTotal(Number.isFinite(res?.count) ? res.count : results.length);
    } catch {
      setRows([]);
      setTotal(0);
      setError(true);
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
          Activity List
        </h2>
      </header>

      <div className="overflow-x-auto overflow-y-hidden scrollbar-admin">
        <div style={{ minWidth: TABLE_MIN_WIDTH }}>
          <TableHeader />
          <div className="flex w-full flex-col">
            {loading ? (
              <div className="px-6 py-12 text-center text-[12px] text-white/40">Loading...</div>
            ) : error ? (
              <div className="px-6 py-12 text-center text-[12px] text-red-400">Failed to load activity log.</div>
            ) : rows.length === 0 ? (
              <EmptyRow />
            ) : (
              rows.map((row) => <ActivityRow key={row.uuid || row.id} row={row} />)
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

function mapActivityRow(row, id) {
  const date = row.datetime ? new Date(row.datetime) : null;
  const validDate = date && !Number.isNaN(date.getTime());
  return {
    id,
    uuid: row.uuid,
    date: validDate ? date.toLocaleDateString("en-US", { year: "2-digit", month: "2-digit", day: "2-digit" }) : "—",
    time: validDate ? date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—",
    user: row.user || "—",
    activity: row.activity || "—",
  };
}

function TableHeader() {
  return (
    <div className="flex w-full items-stretch" style={{ backgroundImage: GRAD_DARK }}>
      {COLUMNS.map((col) => (
        <div
          key={col.key}
          className={`flex flex-col px-6 py-4 ${col.flex ? "flex-1 min-w-0" : "shrink-0"} ${
            col.align === "end" ? "items-end" : "items-start"
          }`}
          style={{ minWidth: col.minW, width: col.flex ? undefined : col.minW }}
        >
          <p className="text-[14px] font-semibold text-[#fbeed2] leading-[21px] whitespace-nowrap" style={{ letterSpacing: "-1px" }}>
            {col.label}
          </p>
        </div>
      ))}
    </div>
  );
}

function ActivityRow({ row }) {
  return (
    <div className="flex w-full items-stretch -mb-px border-b border-white/5">
      <Cell col={COLUMNS[0]}>
        <span className="text-[12px] font-medium text-white leading-[18px] whitespace-nowrap">{row.id}</span>
      </Cell>
      <Cell col={COLUMNS[1]}>
        <span className="text-[12px] font-medium text-white leading-[18px] whitespace-nowrap">{row.date}</span>
      </Cell>
      <Cell col={COLUMNS[2]}>
        <span className="text-[12px] font-medium text-white leading-[18px] whitespace-nowrap">{row.time}</span>
      </Cell>
      <Cell col={COLUMNS[3]}>
        <div className="flex items-center gap-3 min-w-0">
          <UserAvatar />
          <span className="text-[12px] font-medium text-white leading-[18px] whitespace-nowrap">{row.user}</span>
        </div>
      </Cell>
      <Cell col={COLUMNS[4]}>
        <span className="text-[12px] font-medium text-white leading-[18px] whitespace-nowrap">{row.activity}</span>
      </Cell>
    </div>
  );
}

function Cell({ col, children }) {
  const justify = col.align === "end" ? "justify-end" : "justify-start";
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

function EmptyRow() {
  return <div className="px-6 py-12 text-center text-[12px] text-white/40">No activity found.</div>;
}

function buildPageItems(currentPage, totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
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
        <PageButton onClick={() => onPageChange(Math.max(1, page - 1))} disabled={prevDisabled} ariaLabel="Previous page">
          <PageChevron direction="left" />
        </PageButton>
        {items.map((item) =>
          typeof item === "number" ? (
            <PageNumber key={item} value={item} active={item === page} onClick={() => onPageChange(item)} />
          ) : (
            <span key={item} className="text-[8px] text-white leading-[12px]">....</span>
          )
        )}
        <PageButton onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={nextDisabled} ariaLabel="Next page">
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
      <path d="M1 1l4 4-4 4" stroke="#eaad2c" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
