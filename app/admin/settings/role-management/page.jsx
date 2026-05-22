"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  GRAD_DARK,
  GRAD_GOLD,
} from "../../../components/admin/retention/constants";

// Retention/user list shown in the Assign modal's "Choose Retention" dropdown.
// Pulled from the same seed avatars used on /admin/settings/user-access so the
// two surfaces stay in sync until the backend is wired up.
const RETENTION_USERS = [
  "Sarah Jenkins",
  "Marcus Henry",
  "David Chen",
  "Elena Rody",
  "Adam Ron",
  "Omar Al-Farsi",
  "Samantha",
];

const ASSIGNABLE_ROLES = [
  "Retention",
  "Lucky Spin Manager",
  "Prize Moderator",
  "Game Master",
  "Supervisor Retention",
];

// Role Management — Figma 94:11313. Roles table with Add Role, Edit, and
// Assign actions per row. Chrome (auth guard, topbar, padding) is provided
// by app/admin/settings/layout.jsx.

const PAGE_SIZE = 7;

// Mock seed cycled out to 150 rows so pagination has content to flip through
// until the backend is wired up. Mirrors how `user-access/page.jsx` does it.
const SEED_ROLES = [
  { name: "Retention",            assigned: 12, status: "Active"   },
  { name: "Lucky Spin Manager",   assigned: 6,  status: "Active"   },
  { name: "Prize Moderator",      assigned: 33, status: "Active"   },
  { name: "Game Master",          assigned: 10, status: "Active"   },
  { name: "Supervisor Retention", assigned: 3,  status: "Inactive" },
];

const ROLES = Array.from({ length: 150 }, (_, i) => {
  const seed = SEED_ROLES[i % SEED_ROLES.length];
  return { ...seed, id: i + 1 };
});

const COLUMNS = [
  { key: "name",     label: "Role Name",      width: 347 },
  { key: "assigned", label: "Total Assigned", flex: true },
  { key: "status",   label: "Status",         flex: true, align: "center" },
  { key: "action",   label: "Action",         flex: true, align: "end"    },
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
  // `assignRole` is the role currently being assigned, or null when the modal
  // is closed. Held at the list level (not on the row) so the modal renders
  // exactly once and isn't trapped inside the row's transform context.
  const [assignRole, setAssignRole] = useState(null);

  const totalPages = Math.max(1, Math.ceil(ROLES.length / PAGE_SIZE));

  // Reset to page 1 if data ever shrinks below current page (defensive — the
  // seed is fixed today, but keeps behavior consistent with user-access).
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const visibleRows = useMemo(
    () => ROLES.slice(startIdx, startIdx + PAGE_SIZE),
    [startIdx],
  );
  const showingFrom = ROLES.length === 0 ? 0 : startIdx + 1;
  const showingTo = Math.min(startIdx + PAGE_SIZE, ROLES.length);

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
            {visibleRows.map((role) => (
              <RoleRow
                key={role.id}
                role={role}
                onAssign={() => setAssignRole(role)}
              />
            ))}
          </div>
        </div>
      </div>

      <PaginationBar
        from={showingFrom}
        to={showingTo}
        total={ROLES.length}
        page={safePage}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {assignRole && (
        <AssignRoleModal
          role={assignRole}
          onClose={() => setAssignRole(null)}
        />
      )}
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

function RoleRow({ role, onAssign }) {
  return (
    <div className="flex w-full items-stretch -mb-px border-b border-white/5">
      <Cell width={COLUMNS[0].width}>
        <span className="text-[12px] font-medium text-white leading-[18px] whitespace-nowrap">
          {role.name}
        </span>
      </Cell>
      <Cell flex>
        <span className="text-[12px] font-medium text-white leading-[18px] whitespace-nowrap">
          {role.assigned}
        </span>
      </Cell>
      <Cell flex align="center">
        <StatusBadge status={role.status} />
      </Cell>
      <Cell flex align="end">
        <div className="flex items-center gap-2">
          <EditButton roleId={role.id} />
          <AssignButton onClick={onAssign} />
        </div>
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

function AssignButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-1 rounded-[8px] border border-[#f2cb7a] px-4 py-2 text-[12px] font-medium text-[#eaad2c] transition hover:brightness-110"
      style={{ backgroundImage: GRAD_DARK }}
    >
      <AssignIcon />
      <span>Assign</span>
    </button>
  );
}

// ── Assign Role modal — Figma 168:2923 ──────────────────────────────────

// Modal lives in the page tree (rendered conditionally) rather than via
// portal so it inherits the admin layout's z-index without needing a
// dedicated portal root. The fixed overlay covers the entire viewport.
function AssignRoleModal({ role, onClose }) {
  const [user, setUser] = useState(RETENTION_USERS[0]);
  const [selectedRole, setSelectedRole] = useState(role.name);

  // Close on Escape — standard modal affordance.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Assign role"
    >
      <div
        className="w-full max-w-[760px] rounded-[16px] bg-[#05060a] p-10 shadow-[0_0_1.5px_#dea220]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-6">
          <h3
            className="bg-clip-text text-transparent font-bold"
            style={{
              backgroundImage: GRAD_GOLD,
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: "26px",
              lineHeight: "39px",
              letterSpacing: "-2px",
            }}
          >
            Assign Role
          </h3>

          <div className="flex flex-col gap-4 md:flex-row md:gap-10">
            <ModalField label="Choose Retention">
              <ModalSelect value={user} onChange={setUser} options={RETENTION_USERS} />
            </ModalField>
            <ModalField label="Select Role">
              <ModalSelect
                value={selectedRole}
                onChange={setSelectedRole}
                options={ASSIGNABLE_ROLES}
              />
            </ModalField>
          </div>

          <div className="flex items-center justify-end gap-4 pt-10">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center gap-1 rounded-[8px] border-2 border-[#f2cb7a] bg-transparent px-6 py-2 text-[14px] font-semibold text-[#fbeed2] transition hover:bg-white/5"
              style={{ letterSpacing: "-1px" }}
            >
              <CloseIcon />
              <span>Close</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center gap-1 rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold text-[#141828] transition hover:brightness-110"
              style={{ backgroundImage: GRAD_GOLD, letterSpacing: "-1px" }}
            >
              <CheckIcon />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModalField({ label, children }) {
  return (
    <div className="flex flex-1 min-w-0 flex-col gap-2">
      <span
        className="text-[18px] font-medium text-[#f6dda6] leading-[27px] whitespace-nowrap"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

function ModalSelect({ value, onChange, options }) {
  return (
    <div className="relative w-full">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none w-full rounded-[8px] border border-[#fbeed2] bg-transparent pl-4 pr-10 py-3 text-[12px] font-medium text-white focus:outline-none focus:border-[#eaad2c] cursor-pointer"
        style={{ fontFamily: "Inter, sans-serif", lineHeight: "18px" }}
      >
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-[#05060a] text-white">
            {opt}
          </option>
        ))}
      </select>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#eaad2c]"
      >
        <ChevronDownIcon />
      </span>
    </div>
  );
}

// ── Icons ───────────────────────────────────────────────────────────────

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

function AssignIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#eaad2c"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="6" y="4" width="12" height="16" rx="2" />
      <path d="M9 4h6v3H9z" fill="#eaad2c" stroke="none" />
      <line x1="9" y1="11" x2="15" y2="11" />
      <line x1="9" y1="15" x2="13" y2="15" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fbeed2"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#141828"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
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
