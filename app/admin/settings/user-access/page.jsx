"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  GRAD_CARD,
  GRAD_DARK,
  GRAD_GOLD,
} from "../../../components/admin/retention/constants";
import Pagination from "../../../components/admin/retention/Pagination";
import { getCrmLoginRequests, getCrmUsers } from "../../../api/crmApi";

// User Access management — Figma 94:11764. Four KPI cards (Total Users,
// Active Users, Suspended, Login Pending) and a User List table with
// inline status badges and an Edit affordance per row. Chrome (auth guard,
// topbar, padding) is provided by app/admin/retention/layout.jsx.

const PAGE_SIZE = 7;
const API_PAGE_SIZE = 100;

const COLUMNS = [
  { key: "username", label: "Username",  minW: 240 },
  { key: "name",     label: "Full Name", minW: 160 },
  { key: "role",     label: "Role",      minW: 160 },
  { key: "status",   label: "Status",    minW: 140, align: "center" },
  { key: "action",   label: "Action",    minW: 140, align: "end" },
];

const TABLE_MIN_WIDTH = COLUMNS.reduce((sum, c) => sum + c.minW, 0);

export default function UserAccessPage() {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingLogins, setPendingLogins] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchAllPages(getCrmUsers)
      .then((users) => {
        if (cancelled) return;
        setAllUsers(users);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[user-access] fetch failed", err);
        setError(err);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchAllPages(getCrmLoginRequests)
      .then((results) => {
        if (cancelled) return;
        setPendingLogins(results.filter((row) => row.status === "Pending").length);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[user-access] login requests fetch failed", err);
        setPendingLogins(null);
      });
    return () => { cancelled = true; };
  }, []);

  const kpis = useMemo(() => {
    const total = allUsers.length;
    const active = allUsers.filter((u) => u.status === "Active").length;
    const inactive = allUsers.filter((u) => u.status !== "Active").length;
    return [
      { id: "total",     label: "Total Users",  value: String(total),     icon: "user"   },
      { id: "active",    label: "Active Users", value: String(active),    icon: "users"  },
      { id: "inactive",  label: "Inactive",     value: String(inactive),  icon: "alert"  },
    ];
  }, [allUsers]);

  return (
    <>
      <OverviewHeader />
      <KpiRow kpis={kpis} pendingLogins={pendingLogins} />
      <UserList allUsers={allUsers} loading={loading} error={error} />
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

async function fetchAllPages(fetcher) {
  const rows = [];
  let page = 1;
  let hasNext = true;

  while (hasNext) {
    const res = await fetcher({ page, page_size: API_PAGE_SIZE });
    const results = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
    rows.push(...results);
    hasNext = Boolean(res?.next) && results.length > 0;
    page += 1;
  }

  return rows;
}

function KpiRow({ kpis, pendingLogins }) {
  return (
    <div className="grid w-full gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => (
        <KpiCard key={kpi.id} kpi={kpi} />
      ))}
      <LoginPendingCard count={pendingLogins} />
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

function LoginPendingCard({ count }) {
  const value = count === null ? "-" : String(count);
  return (
    <Link
      href="/admin/settings/login-requests"
      className="flex flex-col gap-2 rounded-[16px] border-2 border-[#05060a] p-6 transition hover:brightness-110"
      style={{ backgroundImage: GRAD_CARD }}
      aria-label="View pending login requests"
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
            {value}
          </p>
        </div>
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border-2 border-[#f2cb7a]"
          style={{ backgroundImage: GRAD_DARK }}
          aria-hidden="true"
        >
          <ArrowRightIcon />
        </span>
      </div>
    </Link>
  );
}

function UserList({ allUsers, loading, error }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!query) return allUsers;
    const q = query.toLowerCase();
    return allUsers.filter((u) => {
      const name = (u.full_name || u.username || "").toLowerCase();
      return name.includes(q);
    });
  }, [allUsers, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [query]);

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
          <SearchInput value={query} onChange={setQuery} />
          <AddUserButton />
        </div>
      </header>

      <div className="overflow-x-auto overflow-y-hidden scrollbar-admin">
        <div style={{ minWidth: TABLE_MIN_WIDTH }}>
          <TableHeader />
          <div className="flex w-full flex-col">
            {loading ? (
              Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonRow key={i} />)
            ) : error ? (
              <div className="px-6 py-12 text-center text-[12px] text-red-400">Failed to load users.</div>
            ) : visibleRows.length === 0 ? (
              <EmptyRow />
            ) : (
              visibleRows.map((user, idx) => <UserRow key={user.uuid || `${user.username}-${idx}`} user={user} />)
            )}
          </div>
        </div>
      </div>

      <Pagination
        from={showingFrom}
        to={showingTo}
        total={filtered.length}
        currentPage={safePage}
        pageCount={totalPages}
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
          <UserAvatar />
          <span className="text-[12px] font-medium text-white leading-[18px] whitespace-nowrap">
            {user.username}
          </span>
        </div>
      </Cell>
      <Cell minW={COLUMNS[1].minW}>
        <span className="text-[12px] font-medium text-white leading-[18px] whitespace-nowrap">
          {user.full_name}
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
        <EditButton href={`/admin/settings/user-access/edit/${user.uuid}`} />
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

function UserAvatar() {
  return (
    <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[12px] bg-[#3a4255]">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f6dda6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </div>
  );
}

function StatusBadge({ status }) {
  const normalized = status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : status;
  const isActive = normalized === "Active";
  return (
    <span
      className={`flex items-center justify-center rounded-[8px] px-4 py-2 text-[12px] font-medium leading-[18px] text-white whitespace-nowrap ${
        isActive ? "bg-[#01813d]" : "bg-[#d00416]"
      }`}
    >
      {normalized}
    </span>
  );
}

function EditButton({ href }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-center gap-1 rounded-[8px] border-2 border-[#f2cb7a] px-4 py-2 text-[12px] font-medium text-[#141828] transition hover:brightness-110"
      style={{ backgroundImage: GRAD_GOLD }}
    >
      <EditIcon />
      <span>Edit</span>
    </Link>
  );
}

function EmptyRow() {
  return (
    <div className="px-6 py-12 text-center text-[12px] text-white/40">
      No users found.
    </div>
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

function SkeletonRow() {
  return (
    <div className="flex w-full items-stretch border-b border-white/5">
      {COLUMNS.map((col) => (
        <div key={col.key} className="flex flex-1 items-center p-6" style={{ minWidth: col.minW }}>
          <div className="h-3 w-3/4 rounded bg-white/10 animate-pulse" />
        </div>
      ))}
    </div>
  );
}
