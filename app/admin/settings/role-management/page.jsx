"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  GRAD_DARK,
  GRAD_GOLD,
} from "../../../components/admin/retention/constants";
import Pagination from "../../../components/admin/retention/Pagination";
import { getCrmRoles, getCrmUsers, updateCrmUser } from "../../../api/crmApi";
import { ADMIN_PERMISSIONS, hasAdminPermission } from "../../../config/adminPermissions";

const STATUS_TO_INT = { Active: 1, Inactive: 2 };

const PAGE_SIZE = 7;

const COLUMNS = [
  { key: "name", label: "Role Name", width: 280 },
  { key: "total_assigned", label: "Total Assigned", width: 160 },
  { key: "status", label: "Status", width: 130 },
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
  const [showAssign, setShowAssign] = useState(false);
  const [assignRoleUuid, setAssignRoleUuid] = useState("");
  const [assignUsers, setAssignUsers] = useState([]);
  const [assignUsersLoading, setAssignUsersLoading] = useState(false);
  const [allRoles, setAllRoles] = useState([]);

  useEffect(() => {
    if (!showAssign) return;
    let cancelled = false;
    setAssignUsersLoading(true);
    Promise.all([
      getCrmUsers({ page: 1, page_size: 100 }),
      getCrmRoles({ page: 1, page_size: 100 }),
    ])
      .then(([usersRes, rolesRes]) => {
        if (cancelled) return;
        const users = Array.isArray(usersRes?.results) ? usersRes.results : Array.isArray(usersRes) ? usersRes : [];
        const roles = Array.isArray(rolesRes?.results) ? rolesRes.results : Array.isArray(rolesRes) ? rolesRes : [];
        setAssignUsers(users);
        setAllRoles(roles);
      })
      .catch(() => { if (!cancelled) { setAssignUsers([]); setAllRoles([]); } })
      .finally(() => { if (!cancelled) setAssignUsersLoading(false); });
    return () => { cancelled = true; };
  }, [showAssign]);

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
  const canCreateRoles = hasAdminPermission(ADMIN_PERMISSIONS.CREATE_ROLES);
  const canEditRoles = hasAdminPermission(ADMIN_PERMISSIONS.EDIT_ROLES);
  const canAssignRoles = hasAdminPermission(ADMIN_PERMISSIONS.EDIT_ADMINS);

  return (
    <>
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
        <div className="flex items-center gap-3">
          {canCreateRoles && <AddRoleButton />}
        </div>
      </header>

      <div className="overflow-x-auto overflow-y-hidden scrollbar-admin">
        <div style={{ minWidth: TABLE_MIN_WIDTH }}>
          <TableHeader />
          <div className="flex w-full flex-col">
            {loading ? (
              Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonRow key={i} />)
            ) : error ? (
              <div className="px-6 py-12 text-center text-[12px] text-red-400">Failed to load roles.</div>
            ) : rows.length === 0 ? (
              <EmptyRow />
            ) : (
              rows.map((role) => (
                <RoleRow
                  key={role.uuid || role.name}
                  role={role}
                  canEdit={canEditRoles}
                  canAssign={canAssignRoles}
                  onAssign={() => { setAssignRoleUuid(role.uuid || ""); setShowAssign(true); }}
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
    </section>

    {showAssign && (
      <AssignRoleModal
        users={assignUsers}
        roles={allRoles}
        initialRoleUuid={assignRoleUuid}
        loading={assignUsersLoading}
        onClose={() => setShowAssign(false)}
        onSaved={() => { setShowAssign(false); loadRows(); }}
      />
    )}
  </>
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


function AssignRoleModal({ users, roles, initialRoleUuid, loading, onClose, onSaved }) {
  const [userUuid, setUserUuid] = useState("");
  const [roleUuid, setRoleUuid] = useState(initialRoleUuid || "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const handleSave = async () => {
    if (!userUuid || !roleUuid) {
      alert("Please choose a user and a role.");
      return;
    }
    const user = users.find((u) => u.uuid === userUuid);
    if (!user) return;
    setSaving(true);
    setSaveError(null);
    try {
      await updateCrmUser(userUuid, {
        username: user.username,
        full_name: user.full_name || "",
        role_uuid: roleUuid,
        status: STATUS_TO_INT[user.status] || 2,
      });
      onSaved();
    } catch (err) {
      setSaveError(extractApiError(err, "Failed to assign role."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-[540px] rounded-[16px] bg-[#05060a] p-8 shadow-[0_0_1.5px_#dea220]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          className="mb-6 bg-clip-text text-transparent font-bold"
          style={{
            backgroundImage: GRAD_GOLD,
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: "22px",
            lineHeight: "33px",
          }}
        >
          Assign Role
        </h3>

        {loading ? (
          <div className="py-8 text-center text-[12px] text-white/40">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ModalSelectField
              label="Choose User"
              value={userUuid}
              onChange={setUserUuid}
              options={users.map((u) => ({ value: u.uuid, label: u.full_name || u.username }))}
              placeholder="Select user"
            />
            <ModalSelectField
              label="Select Role"
              value={roleUuid}
              onChange={setRoleUuid}
              options={roles.map((r) => ({ value: r.uuid, label: r.name }))}
              placeholder="Select role"
            />
          </div>
        )}

        {saveError && (
          <p className="mt-4 rounded-[8px] border border-[#fb3748] bg-[#d00416]/20 px-4 py-2 text-[11px] text-[#fb3748]">
            {saveError}
          </p>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex items-center justify-center gap-1 rounded-[8px] border-2 border-[#f2cb7a] bg-transparent px-5 py-2 text-[12px] font-semibold text-[#fbeed2] transition hover:bg-white/5 disabled:opacity-50"
            style={{ letterSpacing: "-0.5px" }}
          >
            <CloseIcon />
            <span>Close</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center justify-center gap-1 rounded-[8px] border-2 border-[#f2cb7a] px-5 py-2 text-[12px] font-semibold text-[#141828] transition hover:brightness-110 disabled:opacity-50"
            style={{ backgroundImage: GRAD_GOLD, letterSpacing: "-0.5px" }}
          >
            <ModalCheckIcon />
            <span>{saving ? "Saving..." : "Save"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalSelectField({ label, value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find((o) => o.value === value)?.label || "";
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[14px] font-medium text-[#f6dda6]">{label}</span>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center gap-3 rounded-[8px] border border-[#fbeed2] bg-transparent px-4 py-3 text-left"
        >
          <span className={`flex-1 min-w-0 truncate text-[12px] font-medium leading-[18px] ${selectedLabel ? "text-white" : "text-white/30"}`}>
            {selectedLabel || placeholder}
          </span>
          <ModalChevron />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <ul className="absolute left-0 right-0 top-full mt-1 z-20 max-h-48 overflow-y-auto rounded-[8px] border border-[#fbeed2] bg-[#0a0d0e]">
              {options.map((opt) => (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => { onChange(opt.value); setOpen(false); }}
                    className="block w-full text-left px-4 py-2 text-[12px] font-medium text-white hover:bg-white/5"
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ModalCheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#141828" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function extractApiError(err, fallback) {
  const d = err?.data;
  if (!d) return fallback;
  let msg = d.error || d.detail || fallback;
  if (d.details && typeof d.details === "object") {
    const parts = Object.entries(d.details)
      .map(([f, v]) => `${f}: ${Array.isArray(v) ? v[0] : v}`)
      .join(" | ");
    msg += ` — ${parts}`;
  }
  return msg;
}

function ModalChevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbeed2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function AssignIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbeed2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
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

function RoleRow({ role, canEdit, canAssign, onAssign }) {
  const status = role.status || "Active";
  const isActive = status.toLowerCase() !== "inactive";

  return (
    <div className="flex w-full items-stretch -mb-px border-b border-white/5">
      <Cell width={COLUMNS[0].width}>
        <span className="text-[12px] font-medium text-white leading-[18px]">
          {role.name}
        </span>
      </Cell>
      <Cell width={COLUMNS[1].width}>
        <span className="text-[12px] font-medium text-white leading-[18px]">
          {role.total_assigned ?? "-"}
        </span>
      </Cell>
      <Cell width={COLUMNS[2].width}>
        <span
          className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold"
          style={{
            backgroundColor: isActive ? "rgba(34,197,94,0.15)" : "rgba(208,4,22,0.15)",
            color: isActive ? "#4ade80" : "#fb3748",
          }}
        >
          {status}
        </span>
      </Cell>
      <Cell flex align="end">
        <div className="flex items-center gap-2">
          {canEdit && <EditButton roleId={role.uuid} />}
          {canAssign && <AssignButton onClick={onAssign} />}
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
      className="flex items-center justify-center gap-1 rounded-[8px] border-2 border-[#f2cb7a] bg-transparent px-4 py-2 text-[12px] font-medium text-[#fbeed2] transition hover:bg-white/5"
    >
      <AssignIcon />
      <span>Assign</span>
    </button>
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

function SkeletonRow() {
  return (
    <div className="flex w-full items-stretch border-b border-white/5">
      {COLUMNS.map((col) => (
        <div
          key={col.key}
          className={`flex items-center p-6 ${col.flex ? "flex-1 min-w-0" : "shrink-0"}`}
          style={col.width ? { width: col.width } : undefined}
        >
          <div className="h-3 w-3/4 rounded bg-white/10 animate-pulse" />
        </div>
      ))}
    </div>
  );
}
