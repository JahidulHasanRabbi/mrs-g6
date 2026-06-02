"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  GRAD_GOLD,
} from "../../../../components/admin/retention/constants";
import {
  archiveCrmRole,
  createCrmRole,
  getCrmPermissions,
  getCrmRoles,
  updateCrmRole,
} from "../../../../api/crmApi";
import { ADMIN_PERMISSIONS, hasAdminPermission } from "../../../../config/adminPermissions";

const PAGE_WIDTH_MAX = 1112;
const COL_WIDTH = 317.33;
const ROLE_PAGE_SIZE = 100;

export default function RoleSettingPage({ params }) {
  const { id } = use(params);
  const isNew = id === "new";
  const router = useRouter();

  const [name, setName] = useState("");
  const [permissionAreas, setPermissionAreas] = useState([]);
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [permissionsError, setPermissionsError] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeletePrompt, setShowDeletePrompt] = useState(false);
  const canArchiveRoles = hasAdminPermission(ADMIN_PERMISSIONS.ARCHIVE_ROLES);

  useEffect(() => {
    let cancelled = false;

    async function loadRoleForm() {
      setLoading(true);
      setLoadError(false);
      setPermissionsLoading(true);
      setPermissionsError(false);

      try {
        const [permissionsRes, role] = await Promise.all([
          getCrmPermissions().catch((err) => {
            console.error("[role-setting] permissions load failed", err);
            return null;
          }),
          isNew ? Promise.resolve(null) : fetchRoleByUuid(id),
        ]);

        if (cancelled) return;

        if (permissionsRes !== null) {
          setPermissionAreas(normalizePermissionAreas(permissionsRes));
        } else {
          setPermissionsError(true);
        }
        setPermissionsLoading(false);

        if (role) {
          setName(role.name || "");
          setSelectedPermissions(normalizeSelectedPermissions(role.permissions));
        } else if (isNew) {
          setName("");
          setSelectedPermissions([]);
        } else {
          setLoadError(true);
        }
      } catch (err) {
        if (cancelled) return;
        console.error("[role-setting] load failed", err);
        setLoadError(true);
        setPermissionsLoading(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadRoleForm();
    return () => { cancelled = true; };
  }, [id, isNew]);

  const goBack = () => router.push("/admin/settings/role-management");

  const updatePermission = (key, checked) => {
    setSelectedPermissions((prev) => {
      const set = new Set(prev);
      if (checked) set.add(key);
      else set.delete(key);
      return Array.from(set);
    });
  };

  const updateGroup = (group, checked) => {
    setSelectedPermissions((prev) => {
      const set = new Set(prev);
      for (const permission of group.permissions) {
        if (checked) set.add(permission.key);
        else set.delete(permission.key);
      }
      return Array.from(set);
    });
  };

  const updateArea = (area, checked) => {
    setSelectedPermissions((prev) => {
      const set = new Set(prev);
      for (const group of area.groups) {
        for (const permission of group.permissions) {
          if (checked) set.add(permission.key);
          else set.delete(permission.key);
        }
      }
      return Array.from(set);
    });
  };

  const saveRole = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      alert("Cannot save: role name is required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: trimmedName,
        permissions: selectedPermissions,
      };

      if (isNew) await createCrmRole(payload);
      else await updateCrmRole(id, payload);

      goBack();
    } catch (err) {
      console.error("[role-setting] save failed", err);
      alert("Failed to save role.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setSaving(true);
    try {
      await archiveCrmRole(id);
      setShowDeletePrompt(false);
      goBack();
    } catch (err) {
      console.error("[role-setting] archive failed", err);
      alert("Failed to delete role.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader />
      <div className="w-full">
        <div
          className="flex flex-col items-stretch rounded-[16px] bg-[#05060a] p-6 md:p-10 shadow-[0_0_1.5px_#dea220]"
          style={{ maxWidth: PAGE_WIDTH_MAX }}
        >
          {loading ? (
            <div className="py-12 text-center text-[12px] text-white/40">Loading...</div>
          ) : loadError ? (
            <div className="py-12 text-center text-[12px] text-red-400">Failed to load role settings.</div>
          ) : (
            <div className="flex flex-col gap-6 w-full">
              <h2
                className="bg-clip-text text-transparent font-bold whitespace-nowrap"
                style={{
                  backgroundImage: GRAD_GOLD,
                  fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                  fontSize: "26px",
                  lineHeight: "39px",
                  letterSpacing: "-2px",
                }}
              >
                {isNew ? "Add Role" : "Edit Role"}
              </h2>

              <div className="flex flex-col gap-6 md:flex-row md:gap-10 md:flex-wrap">
                <FieldColumn>
                  <FieldLabel>Role Name</FieldLabel>
                  <TextInput
                    value={name}
                    onChange={setName}
                    placeholder="Enter role name"
                  />
                </FieldColumn>
              </div>

              <div className="grid w-full grid-cols-1 overflow-hidden rounded-[12px] border border-[#f2cb7a]/20 bg-black/10 lg:grid-cols-2">
                {permissionsLoading ? (
                  <p className="text-[12px] text-white/40">Loading permissions...</p>
                ) : permissionsError ? (
                  <p className="text-[12px] text-red-400">Failed to load permissions. Please refresh.</p>
                ) : (
                  permissionAreas.map((area) => (
                    <PermissionArea
                      key={area.name}
                      area={area}
                      selectedPermissions={selectedPermissions}
                      onAreaChange={updateArea}
                      onGroupChange={updateGroup}
                      onPermissionChange={updatePermission}
                    />
                  ))
                )}
              </div>

              <FooterActions
                isNew={isNew}
                canDelete={canArchiveRoles}
                saving={saving}
                onBack={goBack}
                onDelete={() => setShowDeletePrompt(true)}
                onSave={saveRole}
              />
            </div>
          )}
        </div>
      </div>

      {showDeletePrompt && (
        <DeleteRoleModal
          saving={saving}
          onCancel={() => setShowDeletePrompt(false)}
          onConfirm={confirmDelete}
        />
      )}
    </>
  );
}

async function fetchRoleByUuid(uuid) {
  const roles = [];
  let page = 1;
  let hasNext = true;

  while (hasNext) {
    const res = await getCrmRoles({ page, page_size: ROLE_PAGE_SIZE });
    const results = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
    roles.push(...results);
    hasNext = Boolean(res?.next) && results.length > 0;
    page += 1;
  }

  return roles.find((role) => role.uuid === uuid) || null;
}

function normalizeSelectedPermissions(permissions) {
  if (!Array.isArray(permissions)) return [];
  return permissions
    .map((permission) => {
      if (typeof permission === "string") return permission;
      return permission?.key;
    })
    .filter(Boolean);
}

function normalizePermissionAreas(response) {
  if (!response || typeof response !== "object") return [];

  // Handle paginated wrapper like { results: { AreaName: { GroupName: [...] } } }
  const data = (
    !Array.isArray(response) &&
    response.results &&
    typeof response.results === "object" &&
    !Array.isArray(response.results)
  ) ? response.results : response;

  if (!data || Array.isArray(data) || typeof data !== "object") return [];

  const rawAreas = Object.entries(data)
    .map(([areaName, groupsOrPermissions]) => ({
      name: areaName,
      groups: normalizePermissionGroups(groupsOrPermissions),
    }))
    .filter((area) => area.groups.length > 0);

  return groupPermissionAreas(rawAreas);
}

function groupPermissionAreas(areas) {
  const mrsGroups = [];
  const retentionGroups = [];

  for (const area of areas) {
    const normalized = area.name.toLowerCase();
    if (normalized === "retention") {
      retentionGroups.push(...area.groups);
    } else if (normalized === "others") {
      for (const group of area.groups) {
        const groupName = group.name.toLowerCase();
        if (groupName === "login") retentionGroups.push(group);
        else mrsGroups.push(group);
      }
    } else {
      mrsGroups.push(...area.groups);
    }
  }

  return [
    { name: "MRS Access", groups: mrsGroups },
    { name: "Retention System Access", groups: retentionGroups },
  ].filter((area) => area.groups.length > 0);
}

function normalizePermissionGroups(value) {
  if (Array.isArray(value)) {
    return [{
      name: "Permissions",
      permissions: normalizePermissionList(value),
    }].filter((group) => group.permissions.length > 0);
  }

  if (!value || typeof value !== "object") return [];

  return Object.entries(value)
    .map(([groupName, permissions]) => ({
      name: groupName,
      permissions: normalizePermissionList(permissions),
    }))
    .filter((group) => group.permissions.length > 0);
}

function normalizePermissionList(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((permission) => permission?.key)
    .map((permission) => ({
      key: permission.key,
      label: permission.label || permission.key,
    }));
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
          Role Setting
        </h1>
      </div>
    </div>
  );
}

function FieldColumn({ children }) {
  return (
    <div
      className="flex flex-col gap-2 w-full"
      style={{ maxWidth: COL_WIDTH, flexBasis: COL_WIDTH }}
    >
      {children}
    </div>
  );
}

function FieldLabel({ children }) {
  return (
    <span
      className="text-[18px] font-medium text-[#f6dda6] leading-[27px] whitespace-nowrap"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {children}
    </span>
  );
}

function TextInput({ value, onChange, placeholder }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-[8px] border border-[#fbeed2] bg-transparent px-4 py-3 text-[12px] font-medium text-white placeholder:text-white/40 focus:outline-none focus:border-[#eaad2c]"
      style={{ fontFamily: "Inter, sans-serif", lineHeight: "18px" }}
    />
  );
}

function PermissionArea({ area, selectedPermissions, onAreaChange, onGroupChange, onPermissionChange }) {
  const areaKeys = area.groups.flatMap((group) => group.permissions.map((permission) => permission.key));
  const enabledCount = areaKeys.filter((key) => selectedPermissions.includes(key)).length;
  const allEnabled = areaKeys.length > 0 && enabledCount === areaKeys.length;

  return (
    <div className="flex min-w-0 flex-col gap-4 border-b border-[#f2cb7a]/15 p-5 last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0">
      <div className="flex min-h-[32px] items-center gap-3">
        <h3
          className="min-w-0 text-[18px] font-medium text-[#f6dda6] leading-[27px]"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {area.name}
        </h3>
        <Toggle
          size="lg"
          checked={allEnabled}
          onChange={(checked) => onAreaChange(area, checked)}
          ariaLabel={`${area.name} module permissions`}
        />
      </div>
      <div className="flex flex-col gap-1">
        {area.groups.map((group) => (
          <PermissionGroupRows
            key={`${area.name}-${group.name}`}
            group={group}
            selectedPermissions={selectedPermissions}
            onGroupChange={onGroupChange}
            onPermissionChange={onPermissionChange}
          />
        ))}
      </div>
    </div>
  );
}

function PermissionGroupRows({ group, selectedPermissions, onGroupChange, onPermissionChange }) {
  const keys = group.permissions.map((permission) => permission.key);
  const checkedCount = keys.filter((key) => selectedPermissions.includes(key)).length;
  const allChecked = keys.length > 0 && checkedCount === keys.length;

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div className="mt-2 flex min-h-[28px] items-center gap-3">
        <span
          className="min-w-0 pr-3 text-[12px] font-semibold text-[#edba4d] leading-[18px]"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {group.name}
        </span>
        <Toggle
          size="sm"
          checked={allChecked}
          onChange={(checked) => onGroupChange(group, checked)}
          ariaLabel={`${group.name} permissions`}
        />
      </div>
      {group.permissions.map((permission) => (
        <ToggleRow
          key={permission.key}
          label={permission.label || permission.key}
          checked={selectedPermissions.includes(permission.key)}
          onChange={(checked) => onPermissionChange(permission.key, checked)}
        />
      ))}
    </div>
  );
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <div className="flex min-h-[28px] w-full items-center gap-3">
      <span
        className="min-w-0 max-w-[260px] break-words text-[12px] font-medium text-white leading-[18px]"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {label}
      </span>
      <Toggle
        size="sm"
        checked={checked}
        onChange={onChange}
        ariaLabel={label}
      />
    </div>
  );
}

function Toggle({ size = "sm", checked, onChange, ariaLabel, disabled }) {
  const isLarge = size === "lg";
  const trackW = isLarge ? 46 : 32;
  const trackH = isLarge ? 24 : 17;
  const knob = isLarge ? 20 : 13;
  const pad = 2;
  const offX = checked ? trackW - knob - pad : pad;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative shrink-0 rounded-full transition-colors ${
        disabled ? "cursor-not-allowed" : "cursor-pointer"
      }`}
      style={{
        width: trackW,
        height: trackH,
        backgroundColor: checked ? "#eaad2c" : "#3a3a3a",
        boxShadow: checked
          ? "inset 0 0 0 1px rgba(208,208,208,0.18)"
          : "inset 0 0 0 1px rgba(255,255,255,0.08)",
      }}
    >
      <span
        className="absolute rounded-full bg-white shadow-[0_1px_1px_rgba(0,0,0,0.22)]"
        style={{
          width: knob,
          height: knob,
          top: (trackH - knob) / 2,
          left: offX,
          transition: "left 0.18s ease",
        }}
      />
    </button>
  );
}

function FooterActions({ isNew, canDelete, saving, onBack, onDelete, onSave }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-4 pt-2">
      <ActionButton variant="back" onClick={onBack} disabled={saving} />
      {!isNew && canDelete && <ActionButton variant="delete" onClick={onDelete} disabled={saving} />}
      <ActionButton variant="save" onClick={onSave} disabled={saving} />
    </div>
  );
}

function DeleteRoleModal({ saving, onCancel, onConfirm }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-label="Confirm delete role"
    >
      <div
        className="w-full max-w-[420px] rounded-[16px] bg-[#010c01] px-10 py-8 sm:px-16"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center">
          <div
            className="mb-6 flex h-20 w-20 items-center justify-center rounded-[12px] bg-[rgba(208,4,22,0.75)]"
            style={{
              boxShadow:
                "0 -2px 40px 0 rgba(208,4,22,0.15), 0 0 55px 0 rgba(208,4,22,0.5)",
            }}
          >
            <LargeTrashIcon />
          </div>
          <h3
            className="mb-2 text-center font-bold text-[#edba4d]"
            style={{
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: "22px",
              lineHeight: "33px",
            }}
          >
            Delete Role?
          </h3>
          <p
            className="mb-8 max-w-[320px] px-4 text-center text-[12px] font-medium text-[#fbeed2]"
            style={{ fontFamily: "Inter, sans-serif", lineHeight: "18px" }}
          >
            This role will be archived.
          </p>
          <div className="flex w-full items-center justify-between gap-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="flex items-center justify-center gap-1 rounded-[8px] border-2 border-[#f2cb7a] bg-transparent px-6 py-2 text-[14px] font-semibold text-[#fbeed2] transition hover:bg-white/5 disabled:opacity-50"
              style={{ letterSpacing: "-1px" }}
            >
              <ArrowLeftIcon />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={saving}
              className="flex items-center justify-center gap-1 rounded-[8px] border-2 border-[#fb3748] bg-[#d00416] px-6 py-2 text-[14px] font-semibold text-[#fbeed2] transition hover:brightness-110 disabled:opacity-50"
              style={{ letterSpacing: "-1px" }}
            >
              <TrashIcon />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LargeTrashIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#ffffff"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function ActionButton({ variant, onClick, disabled }) {
  if (variant === "back") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="flex items-center justify-center gap-1 rounded-[8px] border-2 border-[#f2cb7a] bg-transparent px-6 py-2 text-[14px] font-semibold text-[#fbeed2] transition hover:bg-white/5 disabled:opacity-50"
        style={{ letterSpacing: "-1px" }}
      >
        <ArrowLeftIcon />
        <span>Back</span>
      </button>
    );
  }
  if (variant === "delete") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="flex items-center justify-center gap-1 rounded-[8px] border-2 border-[#fb3748] bg-[#d00416] px-6 py-2 text-[14px] font-semibold text-[#fbeed2] transition hover:brightness-110 disabled:opacity-50"
        style={{ letterSpacing: "-1px" }}
      >
        <TrashIcon />
        <span>Delete</span>
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center gap-1 rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold text-[#141828] transition hover:brightness-110 disabled:opacity-50"
      style={{ backgroundImage: GRAD_GOLD, letterSpacing: "-1px" }}
    >
      <CheckIcon />
      <span>Save</span>
    </button>
  );
}

function ArrowLeftIcon() {
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
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function TrashIcon() {
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
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
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
