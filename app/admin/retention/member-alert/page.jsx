"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RefreshControl from "../../../components/admin/retention/RefreshControl";
import { ASSETS, GRAD_DARK, GRAD_GOLD } from "../../../components/admin/retention/constants";

// Member Alert page — Figma 69:340. "Overview" KPI strip + Member Follow Up
// list. The list is the same shape as /admin/retention/members but with a
// green "Done" action button instead of a gold View link.

const PAGE_SIZE = 7;

const PRIORITY_OPTIONS = ["High", "Medium", "Low"];
const VIP_OPTIONS = ["VIP 1", "VIP 2", "VIP 3", "VIP 4", "VIP 5"];
const RETENTION_OPTIONS = ["Sarah", "John", "Michael", "Emma", "Linda"];

const SEED_ROWS = [
  { name: "Ah Chong",     phone: "+64164293333", vip: "VIP 2", sales: "RM 3,770", winloss: "RM 400",  priority: "High",   pic: "Sarah" },
  { name: "Lily Tran",    phone: "+64167891234", vip: "VIP 1", sales: "RM 3,770", winloss: "RM 250",  priority: "Low",    pic: "John" },
  { name: "Sophia Lee",   phone: "+64168901234", vip: "VIP 4", sales: "RM 3,770", winloss: "RM 300",  priority: "Medium", pic: "Michael" },
  { name: "Marcus Henry", phone: "+64164293333", vip: "VIP 2", sales: "RM 3,770", winloss: "RM 400",  priority: "High",   pic: "Sarah" },
  { name: "Aiden Smith",  phone: "+64161234567", vip: "VIP 3", sales: "RM 5,500", winloss: "RM 550",  priority: "Medium", pic: "Emma" },
  { name: "Daniel Kim",   phone: "+64163456789", vip: "VIP 5", sales: "RM 7,000", winloss: "RM 700",  priority: "High",   pic: "Linda" },
  { name: "Nora Park",    phone: "+64162345678", vip: "VIP 2", sales: "RM 4,200", winloss: "RM 450",  priority: "Medium", pic: "Sarah" },
];

const ROWS = Array.from({ length: 150 }, (_, i) => {
  const seed = SEED_ROWS[i % SEED_ROWS.length];
  return { ...seed, id: i + 1 };
});

const COLUMNS = [
  { key: "name",     label: "Username",       minW: 180 },
  { key: "phone",    label: "Phone Number",   minW: 140 },
  { key: "vip",      label: "VIP Level",      minW: 100 },
  { key: "sales",    label: "Daily Sales",    minW: 120 },
  { key: "winloss",  label: "Daily Win/Loss", minW: 130 },
  { key: "priority", label: "Priority",       minW: 100 },
  { key: "pic",      label: "Retention",      minW: 110 },
  { key: "action",   label: "Action",         minW: 110, align: "end" },
];

const TABLE_MIN_WIDTH = COLUMNS.reduce((sum, c) => sum + c.minW, 0);

// KPI tiles — all render with the gold gradient. Each tile pairs the label
// with a dark icon-tile whose glyph is tinted per priority (red → white →
// green → blue) so the row scans left-to-right from most to least urgent.
const KPI_CARDS = [
  { id: "high",     label: "High Priority",    value: "281",   icon: "user-times", iconColor: "#fb3748" },
  { id: "medium",   label: "Medium Priority",  value: "4,281", icon: "user-minus", iconColor: "#fbeed2" },
  { id: "low",      label: "Low Priority",     value: "1,281", icon: "user-check", iconColor: "#84ebb4" },
  { id: "inactive", label: "Inactive Members", value: "281",   icon: "user-clock", iconColor: "#4188ff" },
];

function nameToSlug(name) {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

export default function MemberAlertPage() {
  return (
    <>
      <OverviewHeader />
      <KpiRow />
      <FollowUpList />
    </>
  );
}

function OverviewHeader() {
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
      <RefreshControl />
    </div>
  );
}

function KpiRow() {
  return (
    <div className="grid w-full gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
      {KPI_CARDS.map((kpi) => (
        <KpiCard key={kpi.id} kpi={kpi} />
      ))}
    </div>
  );
}

// Gold-gradient card with a dark icon-tile + per-priority colored glyph.
// Matches Figma 69:340.
function KpiCard({ kpi }) {
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
          {kpi.value}
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
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [doneIds, setDoneIds] = useState(() => new Set());

  const filtered = useMemo(() => {
    return ROWS.filter((r) => {
      if (priority && r.priority !== priority) return false;
      if (vip && r.vip !== vip) return false;
      if (retention && r.pic !== retention) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!r.name.toLowerCase().includes(q) && !r.phone.includes(query)) return false;
      }
      return true;
    });
  }, [priority, vip, retention, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  // Reset to page 1 whenever filters change so the user isn't stranded on a
  // page that no longer exists after the result set shrinks.
  useEffect(() => {
    setPage(1);
  }, [priority, vip, retention, query]);

  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const visibleRows = filtered.slice(startIdx, startIdx + PAGE_SIZE);

  const markDone = (id) => {
    setDoneIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
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
          <FilterPill label="VIP Level" value={vip} onChange={setVip} options={VIP_OPTIONS} />
          <FilterPill label="All Retention" value={retention} onChange={setRetention} options={RETENTION_OPTIONS} />
          <SearchInput value={query} onChange={setQuery} />
        </div>
      </header>

      <div className="overflow-x-auto scrollbar-admin">
        <div style={{ minWidth: TABLE_MIN_WIDTH }}>
          <TableHeader />
          <div className="flex w-full flex-col">
            {visibleRows.length === 0 ? (
              <EmptyRow />
            ) : (
              visibleRows.map((row) => (
                <TableRow
                  key={row.id}
                  row={row}
                  done={doneIds.has(row.id)}
                  onDone={() => markDone(row.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <PaginationBar
        from={filtered.length === 0 ? 0 : startIdx + 1}
        to={Math.min(startIdx + PAGE_SIZE, filtered.length)}
        total={filtered.length}
        page={safePage}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </section>
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
          className={`flex flex-1 flex-col px-6 py-4 ${col.align === "end" ? "items-end" : "items-start"}`}
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

function TableRow({ row, done, onDone }) {
  return (
    <div className="flex w-full items-stretch -mb-px border-b border-white/5">
      <Cell minW={COLUMNS[0].minW}>
        <Link
          href={`/admin/retention/members/${nameToSlug(row.name)}`}
          className="flex items-center gap-3 hover:opacity-80"
        >
          <UserAvatar />
          <span className="text-[12px] font-medium text-white leading-[18px] whitespace-nowrap">
            {row.name}
          </span>
        </Link>
      </Cell>
      <DataCell value={row.phone} minW={COLUMNS[1].minW} />
      <DataCell value={row.vip} minW={COLUMNS[2].minW} />
      <DataCell value={row.sales} minW={COLUMNS[3].minW} />
      <DataCell value={row.winloss} minW={COLUMNS[4].minW} />
      <DataCell value={row.priority} minW={COLUMNS[5].minW} />
      <DataCell value={row.pic} minW={COLUMNS[6].minW} />
      <Cell minW={COLUMNS[7].minW} align="end">
        <DoneButton done={done} onClick={onDone} />
      </Cell>
    </div>
  );
}

function DoneButton({ done, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={done}
      className={`flex items-center justify-center gap-1 rounded-[8px] border px-4 py-2 transition ${
        done
          ? "border-[#84ebb4]/40 bg-[#84ebb4]/10 cursor-default"
          : "border-[#84ebb4] hover:brightness-110"
      }`}
      style={!done ? { backgroundImage: "linear-gradient(178deg, #00813c 0%, #179451 99.7%)" } : undefined}
    >
      <CheckIcon color={done ? "#84ebb4" : "#ffffff"} />
      <span
        className="text-[12px] font-medium leading-[18px]"
        style={{ color: done ? "#84ebb4" : "#ffffff" }}
      >
        {done ? "Done" : "Done"}
      </span>
    </button>
  );
}

function CheckIcon({ color }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function DataCell({ value, minW }) {
  return (
    <Cell minW={minW}>
      <span className="text-[12px] font-medium text-white leading-[18px] whitespace-nowrap">
        {value}
      </span>
    </Cell>
  );
}

function Cell({ children, minW, align = "start" }) {
  const justify = align === "end" ? "justify-end" : "justify-start";
  return (
    <div className={`flex flex-1 items-center p-6 ${justify}`} style={{ minWidth: minW }}>
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
      <path d="M1 1l4 4-4 4" stroke="#eaad2c" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
