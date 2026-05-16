"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ASSETS,
  GRAD_CARD,
  GRAD_DARK,
  GRAD_GOLD,
} from "../../../components/admin/retention/constants";

// User Access management — Figma 94:11764. Four KPI cards (Total Users,
// Active Users, Suspended, Login Pending) and a User List table with
// inline status badges and an Edit affordance per row. Chrome (auth guard,
// topbar, padding) is provided by app/admin/retention/layout.jsx.

const PAGE_SIZE = 7;

const ROLE_OPTIONS = [
  "Retention",
  "Prize Moderator",
  "Game Master",
  "Lucky Spin Manager",
  "Supervisor Retention",
];

const STATUS_OPTIONS = ["Active", "Suspended"];

// Seed users, cycled to 150 rows so the pagination has something to flip
// through until the backend is wired up.
const SEED_USERS = [
  { name: "Sarah Jenkins",  vip: "VIP 1", avatar: `${ASSETS}/avatar-1.jpg`, role: "Retention",            status: "Active"    },
  { name: "Marcus Henry",   vip: "VIP 2", avatar: `${ASSETS}/avatar-2.jpg`, role: "Prize Moderator",      status: "Active"    },
  { name: "David Chen",     vip: "VIP 3", avatar: `${ASSETS}/avatar-3.jpg`, role: "Game Master",          status: "Suspended" },
  { name: "Elena Rody",     vip: "VIP 2", avatar: `${ASSETS}/avatar-3.jpg`, role: "Lucky Spin Manager",   status: "Active"    },
  { name: "Adam Ron",       vip: "VIP 3", avatar: `${ASSETS}/avatar-4.jpg`, role: "Retention",            status: "Active"    },
  { name: "Omar Al-Farsi",  vip: "VIP 1", avatar: `${ASSETS}/avatar-4.jpg`, role: "Supervisor Retention", status: "Active"    },
  { name: "Samantha",       vip: "VIP 1", avatar: `${ASSETS}/avatar-5.jpg`, role: "Game Master",          status: "Suspended" },
];

const USERS = Array.from({ length: 150 }, (_, i) => {
  const seed = SEED_USERS[i % SEED_USERS.length];
  return { ...seed, id: i + 1 };
});

const COLUMNS = [
  { key: "username", label: "Username",  minW: 240 },
  { key: "name",     label: "Full Name", minW: 160 },
  { key: "role",     label: "Role",      minW: 160 },
  { key: "status",   label: "Status",    minW: 140, align: "center" },
  { key: "action",   label: "Action",    minW: 140, align: "end" },
];

const TABLE_MIN_WIDTH = COLUMNS.reduce((sum, c) => sum + c.minW, 0);

const KPIS = [
  { id: "total",     label: "Total Users",   value: "224", icon: "user"   },
  { id: "active",    label: "Active Users",  value: "181", icon: "users"  },
  { id: "suspended", label: "Suspended",     value: "23",  icon: "alert"  },
];

const PENDING_VALUE = "12";

export default function UserAccessPage() {
  return (
    <>
      <OverviewHeader />
      <KpiRow />
      <UserList />
    </>
  );
}

function OverviewHeader() {
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
          Overview
        </h1>
      </div>
    </div>
  );
}

function KpiRow() {
  return (
    <div className="grid w-full gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
      {KPIS.map((kpi) => (
        <KpiCard key={kpi.id} kpi={kpi} />
      ))}
      <LoginPendingCard />
    </div>
  );
}

function KpiCard({ kpi }) {
  return (
    <div
      className="flex flex-col gap-2 rounded-[16px] border-2 border-[#05060a] p-6"
      style={{ backgroundImage: GRAD_CARD }}
    >
      <div className="flex w-full items-start gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[4px] drop-shadow-[0_0_3px_rgba(222,162,32,0.5)]"
          style={{ backgroundImage: GRAD_DARK }}
        >
          <KpiIcon name={kpi.icon} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <p
            className="text-[16px] font-semibold uppercase leading-[24px] text-[#f6dda6]"
            style={{ letterSpacing: "-1px" }}
          >
            {kpi.label}
          </p>
          <p
            className="bg-clip-text text-transparent font-bold"
            style={{
              backgroundImage: GRAD_GOLD,
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: "38px",
              lineHeight: "44px",
            }}
          >
            {kpi.value}
          </p>
        </div>
      </div>
    </div>
  );
}

function LoginPendingCard() {
  return (
    <div
      className="flex flex-col gap-2 rounded-[16px] border-2 border-[#05060a] p-6"
      style={{ backgroundImage: GRAD_CARD }}
    >
      <div className="flex w-full items-end gap-4">
        <div className="flex min-w-0 flex-1 flex-col">
          <p
            className="text-[16px] font-semibold uppercase leading-[24px] text-[#f6dda6]"
            style={{ letterSpacing: "-1px" }}
          >
            Login Pending
          </p>
          <p
            className="bg-clip-text text-transparent font-bold"
            style={{
              backgroundImage: GRAD_GOLD,
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: "38px",
              lineHeight: "44px",
            }}
          >
            {PENDING_VALUE}
          </p>
        </div>
        <button
          type="button"
          aria-label="View pending login requests"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border-2 border-[#f2cb7a] transition hover:brightness-110"
          style={{ backgroundImage: GRAD_DARK }}
        >
          <ArrowRightIcon />
        </button>
      </div>
    </div>
  );
}

function UserList() {
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return USERS.filter((u) => {
      if (role && u.role !== role) return false;
      if (status && u.status !== status) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!u.name.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [role, status, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  // Reset to page 1 whenever filters change so the user isn't stranded on a
  // page that no longer exists.
  useEffect(() => {
    setPage(1);
  }, [role, status, query]);

  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const visibleRows = filtered.slice(startIdx, startIdx + PAGE_SIZE);
  const showingFrom = filtered.length === 0 ? 0 : startIdx + 1;
  const showingTo = Math.min(startIdx + PAGE_SIZE, filtered.length);

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
          User List
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <FilterPill label="Role" value={role} onChange={setRole} options={ROLE_OPTIONS} />
          <FilterPill label="Status" value={status} onChange={setStatus} options={STATUS_OPTIONS} />
          <SearchInput value={query} onChange={setQuery} />
          <AddUserButton />
        </div>
      </header>

      <div className="overflow-x-auto overflow-y-hidden scrollbar-admin">
        <div style={{ minWidth: TABLE_MIN_WIDTH }}>
          <TableHeader />
          <div className="flex w-full flex-col">
            {visibleRows.length === 0 ? (
              <EmptyRow />
            ) : (
              visibleRows.map((user) => <UserRow key={user.id} user={user} />)
            )}
          </div>
        </div>
      </div>

      <PaginationBar
        from={showingFrom}
        to={showingTo}
        total={filtered.length}
        page={safePage}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </section>
  );
}

function AddUserButton() {
  return (
    <Link
      href="/admin/settings/user-access/add"
      className="flex items-center justify-center gap-1 rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold text-[#141828] whitespace-nowrap transition hover:brightness-110"
      style={{ backgroundImage: GRAD_GOLD, letterSpacing: "-1px" }}
    >
      <UserAddIcon />
      <span>Add User</span>
    </Link>
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

function SearchInput({ value, onChange }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search by name"
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
          className={`flex flex-1 flex-col px-6 py-4 ${
            col.align === "end"
              ? "items-end"
              : col.align === "center"
                ? "items-center"
                : "items-start"
          }`}
          style={{ minWidth: col.minW }}
        >
          <p className="text-[14px] font-semibold text-[#fbeed2] leading-[21px] whitespace-nowrap" style={{ letterSpacing: "-1px" }}>
            {col.label}
          </p>
        </div>
      ))}
    </div>
  );
}

function UserRow({ user }) {
  return (
    <div className="flex w-full items-stretch -mb-px border-b border-white/5">
      <Cell minW={COLUMNS[0].minW}>
        <div className="flex items-center gap-3 min-w-0">
          <Avatar src={user.avatar} alt={user.name} />
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[12px] font-medium text-white leading-[18px] whitespace-nowrap">
              {user.name}
            </span>
            <VipBadge tier={user.vip} />
          </div>
        </div>
      </Cell>
      <Cell minW={COLUMNS[1].minW}>
        <span className="text-[12px] font-medium text-white leading-[18px] whitespace-nowrap">
          {user.name}
        </span>
      </Cell>
      <Cell minW={COLUMNS[2].minW}>
        <span className="text-[12px] font-medium text-white leading-[18px] whitespace-nowrap">
          {user.role}
        </span>
      </Cell>
      <Cell minW={COLUMNS[3].minW} align="center">
        <StatusBadge status={user.status} />
      </Cell>
      <Cell minW={COLUMNS[4].minW} align="end">
        <EditButton />
      </Cell>
    </div>
  );
}

function Cell({ children, minW, align = "start" }) {
  const justify =
    align === "end" ? "justify-end" : align === "center" ? "justify-center" : "justify-start";
  return (
    <div className={`flex flex-1 items-center p-6 ${justify}`} style={{ minWidth: minW }}>
      {children}
    </div>
  );
}

function Avatar({ src, alt }) {
  return (
    <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-[#f1f5f9]">
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    </div>
  );
}

function VipBadge({ tier }) {
  return (
    <span
      className="flex items-center rounded-[12px] px-3 py-1 text-[8px] leading-[12px] text-[#05060a] whitespace-nowrap"
      style={{ backgroundImage: GRAD_GOLD }}
    >
      {tier}
    </span>
  );
}

function StatusBadge({ status }) {
  const isActive = status === "Active";
  return (
    <span
      className={`flex items-center justify-center rounded-[8px] px-4 py-2 text-[12px] font-medium leading-[18px] text-white whitespace-nowrap ${
        isActive ? "bg-[#01813d]" : "bg-[#d00416]"
      }`}
    >
      {status}
    </span>
  );
}

function EditButton() {
  return (
    <button
      type="button"
      className="flex items-center justify-center gap-1 rounded-[8px] border-2 border-[#f2cb7a] px-4 py-2 text-[12px] font-medium text-[#141828] transition hover:brightness-110"
      style={{ backgroundImage: GRAD_GOLD }}
    >
      <EditIcon />
      <span>Edit</span>
    </button>
  );
}

function EmptyRow() {
  return (
    <div className="px-6 py-12 text-center text-[12px] text-white/40">
      No users found.
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

// ── Inline icon glyphs ──────────────────────────────────────────────────

function KpiIcon({ name }) {
  if (name === "users") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#f6dda6" aria-hidden="true">
        <circle cx="8" cy="8" r="3.5" />
        <circle cx="17" cy="9" r="2.8" />
        <path d="M2 19c0-3 3-5 6-5s6 2 6 5v1H2v-1z" />
        <path d="M14 20v-1c0-2 1-3.5 2.5-4.2 2.5-.4 5.5 1 5.5 4.2v1H14z" />
      </svg>
    );
  }
  if (name === "alert") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#dea220" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <rect x="11" y="6" width="2" height="8" rx="1" fill="#05060a" />
        <circle cx="12" cy="17" r="1.4" fill="#05060a" />
      </svg>
    );
  }
  // single user — default
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#f6dda6" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6v1H4v-1z" />
    </svg>
  );
}

function UserAddIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#141828" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="16" y1="11" x2="22" y2="11" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#141828" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#eaad2c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
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
