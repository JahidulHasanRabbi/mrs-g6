"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  GRAD_DARK,
  GRAD_GOLD,
} from "../../../components/admin/retention/constants";
import { getCrmRoles } from "../../../api/crmApi";

const PAGE_SIZE = 7;

const COLUMNS = [
  { key: "name", label: "Role Name", width: 347 },
  { key: "permissions", label: "Permissions", flex: true },
  { key: "action", label: "Action", flex: true, align: "end" },
];

const TABLE_MIN_WIDTH = 900;

export default function RoleManagementPage() {
  return (
    <>
      <OverviewHeader />
      <RoleList />
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
          Role Management
        </h1>
      </div>
    </div>
  );
}

function RoleList() {
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadRows = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await getCrmRoles({ page, page_size: PAGE_SIZE });
      const results = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
      setRows(results);
      setTotal(Number.isFinite(res?.count) ? res.count : results.length);
    } catch (err) {
      console.error("[role-management] fetch failed", err);
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
          Roles
        </h2>
        <AddRoleButton />
      </header>

      <div className="overflow-x-auto overflow-y-hidden scrollbar-admin">
        <div style={{ minWidth: TABLE_MIN_WIDTH }}>
          <TableHeader />
          <div className="flex w-full flex-col">
            {loading ? (
              <div className="px-6 py-12 text-center text-[12px] text-white/40">Loading...</div>
            ) : error ? (
              <div className="px-6 py-12 text-center text-[12px] text-red-400">Failed to load roles.</div>
            ) : rows.length === 0 ? (
              <EmptyRow />
            ) : (
              rows.map((role) => <RoleRow key={role.uuid || role.name} role={role} />)
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

function AddRoleButton() {
  return (
    <Link
      href="/admin/settings/role-management/new"
      className="flex items-center justify-center gap-1 rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold text-[#141828] whitespace-nowrap transition hover:brightness-110"
      style={{ backgroundImage: GRAD_GOLD, letterSpacing: "-1px" }}
    >
      <UserAddIcon />
      <span>Add Role</span>
    </Link>
  );
}

function TableHeader() {
  return (
    <div className="flex w-full items-stretch" style={{ backgroundImage: GRAD_DARK }}>
      {COLUMNS.map((col) => (
        <div
          key={col.key}
          className={`flex flex-col px-6 py-4 ${
            col.flex ? "flex-1 min-w-0" : "shrink-0"
          } ${
            col.align === "end"
              ? "items-end"
              : col.align === "center"
                ? "items-center"
                : "items-start"
          }`}
          style={col.width ? { width: col.width } : undefined}
        >
          <p
            className="text-[14px] font-semibold text-[#fbeed2] leading-[21px] whitespace-nowrap"
            style={{ letterSpacing: "-1px" }}
          >
            {col.label}
          </p>
        </div>
      ))}
    </div>
  );
}

function RoleRow({ role }) {
  const permissions = Array.isArray(role.permissions) ? role.permissions : [];
  const permissionLabel = permissions.length ? `${permissions.length} selected` : "None";

  return (
    <div className="flex w-full items-stretch -mb-px border-b border-white/5">
      <Cell width={COLUMNS[0].width}>
        <span className="text-[12px] font-medium text-white leading-[18px] whitespace-nowrap">
          {role.name}
        </span>
      </Cell>
      <Cell flex>
        <span className="text-[12px] font-medium text-white leading-[18px] whitespace-nowrap">
          {permissionLabel}
        </span>
      </Cell>
      <Cell flex align="end">
        <EditButton roleId={role.uuid} />
      </Cell>
    </div>
  );
}

function Cell({ children, width, flex = false, align = "start" }) {
  const justify =
    align === "end" ? "justify-end" : align === "center" ? "justify-center" : "justify-start";
  return (
    <div
      className={`flex items-center p-6 ${justify} ${flex ? "flex-1 min-w-0" : "shrink-0"}`}
      style={width ? { width } : undefined}
    >
      {children}
    </div>
  );
}

function EditButton({ roleId }) {
  return (
    <Link
      href={`/admin/settings/role-management/${roleId}`}
      className="flex items-center justify-center gap-1 rounded-[8px] border-2 border-[#f2cb7a] px-4 py-2 text-[12px] font-medium text-[#141828] transition hover:brightness-110"
      style={{ backgroundImage: GRAD_GOLD }}
    >
      <EditIcon />
      <span>Edit</span>
    </Link>
  );
}

function EmptyRow() {
  return <div className="px-6 py-12 text-center text-[12px] text-white/40">No roles found.</div>;
}

function UserAddIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#141828"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="16" y1="11" x2="22" y2="11" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#141828"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
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
