"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { GRAD_GOLD } from "../../../../../components/admin/retention/constants";
import { STATUS_OPTIONS } from "../../_data";
import { getCrmRoles, getCrmUsers, updateCrmUser } from "../../../../../api/crmApi";
import Skeleton from "../../../../../components/admin/ui/Skeleton";

const STATUS_TO_INT = { Active: 1, Inactive: 2 };

function normalizeStatus(value) {
  if (value === 1 || value === "1") return "Active";
  if (value === 2 || value === "2") return "Inactive";
  const normalized = String(value || "").trim().toUpperCase();
  if (normalized === "ACTIVE") return "Active";
  if (normalized === "INACTIVE") return "Inactive";
  return "";
}

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const uuid = params?.id;

  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [rolesError, setRolesError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [originalForm, setOriginalForm] = useState(null);

  const [form, setForm] = useState({
    username: "",
    fullName: "",
    role_uuid: "",
    roleName: "",
    status: "",
    profilePicture: null,
    profilePictureUrl: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!uuid) { setUserLoading(false); return; }
    Promise.all([
      getCrmUsers({ page: 1, page_size: 100 }),
      getCrmRoles({ page: 1, page_size: 100 }).catch(() => {
        setRolesError(true);
        return { results: [] };
      }),
    ])
      .then(([usersRes, rolesRes]) => {
        const users = Array.isArray(usersRes?.results) ? usersRes.results : Array.isArray(usersRes) ? usersRes : [];
        const roleResults = Array.isArray(rolesRes?.results) ? rolesRes.results : Array.isArray(rolesRes) ? rolesRes : [];
        setRoles(roleResults);
        if (roleResults.length) setRolesError(false);
        const found = users.find((u) => u.uuid === uuid) || null;
        setUser(found);
        if (found) {
          const matchedRole = roleResults.find((r) => r.name === found.role);
          const initialForm = {
            username: found.username || "",
            fullName: found.full_name || "",
            role_uuid: matchedRole?.uuid || "",
            roleName: found.role || "",
            status: normalizeStatus(found.status),
            profilePicture: null,
            profilePictureUrl: found.profile_picture || "",
            password: "",
            confirmPassword: "",
          };
          setForm(initialForm);
          setOriginalForm(initialForm);
        }
      })
      .catch(() => setUser(null))
      .finally(() => setUserLoading(false));
  }, [uuid]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const update = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      alert("Password and confirm password must match.");
      return;
    }

    const orig = originalForm || {};
    const payload = {};

    // Only include fields that actually changed
    if (form.username !== orig.username) payload.username = form.username;
    if (form.fullName !== orig.fullName) payload.full_name = form.fullName || "";
    if (form.role_uuid && form.role_uuid !== orig.role_uuid) payload.role_uuid = form.role_uuid;
    if (form.status && form.status !== orig.status) payload.status = STATUS_TO_INT[form.status];
    if (form.profilePicture) payload.profile_picture = form.profilePicture;
    if (form.password) {
      payload.password = form.password;
      payload.confirm_password = form.confirmPassword;
    }

    // Nothing actually changed — just go back
    if (Object.keys(payload).length === 0) {
      router.push("/admin/settings/user-access");
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      await updateCrmUser(uuid, payload);
      router.push("/admin/settings/user-access");
    } catch (err) {
      setSaveError(extractApiError(err, "Failed to save user."));
    } finally {
      setSaving(false);
    }
  };

  if (userLoading) {
    return (
      <>
        <PageHeader />
        <Skeleton.FormPage fields={5} withHeader={false} bare />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <PageHeader />
        <div className="rounded-[16px] bg-[#05060a] p-6 md:p-10 text-[14px] text-white/70" style={{ filter: "drop-shadow(0 0 1.5px #dea220)" }}>
          We could not find a user with that id.
          <Link href="/admin/settings/user-access" className="ml-2 text-[#f6dda6] underline">
            Back to User List
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader />
      <form onSubmit={handleSubmit} className="flex w-full flex-col">
        <div
          className="flex w-full flex-col gap-6 rounded-[16px] bg-[#05060a] p-6 md:p-10"
          style={{ filter: "drop-shadow(0 0 1.5px #dea220)" }}
        >
          <SectionTitle>User Info</SectionTitle>

          <div className="grid w-full gap-6 md:gap-10 grid-cols-1 md:grid-cols-3">
            <TextField
              label="Username"
              value={form.username}
              onChange={update("username")}
              placeholder="Sarah23"
              autoComplete="off"
            />
            <TextField
              label="Full Name"
              value={form.fullName}
              onChange={update("fullName")}
              placeholder="Sarah Jenkins"
              autoComplete="off"
            />
            <SelectField
              label="Assign Role"
              value={roles.find((r) => r.uuid === form.role_uuid)?.name || form.roleName}
              onChange={(name) => {
                const match = roles.find((r) => r.name === name);
                if (match) setForm((prev) => ({ ...prev, role_uuid: match.uuid, roleName: "" }));
              }}
              options={roles.map((r) => r.name)}
              placeholder={rolesError ? "Failed to load roles" : roles.length === 0 ? "Loading..." : "Select role"}
            />
            <ImageUploadField
              label="Profile Picture"
              file={form.profilePicture}
              currentUrl={form.profilePictureUrl}
              onChange={update("profilePicture")}
            />
          </div>

          <div className="grid w-full gap-6 md:gap-10 grid-cols-1 md:grid-cols-3">
            <SelectField
              label="Status"
              value={form.status}
              onChange={update("status")}
              options={STATUS_OPTIONS}
              placeholder="Select status"
            />
          </div>

          <SectionTitle>Account Credentials</SectionTitle>

          <div className="grid w-full gap-6 md:gap-10 grid-cols-1 md:grid-cols-3">
            <PasswordField
              label="Password"
              value={form.password}
              onChange={update("password")}
              visible={showPassword}
              onToggleVisible={() => setShowPassword((v) => !v)}
              autoComplete="new-password"
            />
            <PasswordField
              label="Confirm Password"
              value={form.confirmPassword}
              onChange={update("confirmPassword")}
              visible={showConfirm}
              onToggleVisible={() => setShowConfirm((v) => !v)}
              autoComplete="new-password"
            />
          </div>

          {saveError && (
            <p className="text-[13px] text-red-400 text-right">{saveError}</p>
          )}
          <div className="flex flex-wrap items-center justify-end gap-4 pt-2">
            <BackButton />
            <SaveButton disabled={saving} />
          </div>
        </div>
      </form>
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
          Edit User
        </h1>
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
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
      {children}
    </h2>
  );
}

function FieldLabel({ children, htmlFor }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-[18px] font-medium leading-[27px] text-[#f6dda6] whitespace-nowrap"
    >
      {children}
    </label>
  );
}

function TextField({ label, value, onChange, placeholder, autoComplete }) {
  const id = `field-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div className="flex w-full flex-col gap-2">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full rounded-[8px] border border-[#fbeed2] bg-transparent px-4 py-3 text-[12px] font-medium leading-[18px] text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#eaad2c]"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex w-full flex-col gap-2">
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="flex w-full items-center gap-3 rounded-[8px] border border-[#fbeed2] bg-transparent px-4 py-3 text-left"
        >
          <span
            className={`flex-1 min-w-0 truncate text-[12px] font-medium leading-[18px] ${
              value ? "text-white" : "text-white/30"
            }`}
          >
            {value || placeholder}
          </span>
          <ChevronIcon up={open} />
        </button>
        {open ? (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <ul
              role="listbox"
              className="absolute left-0 right-0 top-full mt-1 z-20 overflow-hidden rounded-[8px] border border-[#fbeed2] bg-[#0a0d0e]"
            >
              {options.map((opt) => (
                <li key={opt}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={opt === value}
                    onClick={() => { onChange(opt); setOpen(false); }}
                    className="block w-full text-left px-4 py-2 text-[12px] font-medium text-white hover:bg-white/5"
                  >
                    {opt}
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
    </div>
  );
}

function ImageUploadField({ label, file, currentUrl, onChange }) {
  const [preview, setPreview] = useState(currentUrl || "");
  const id = `field-${label.replace(/\s+/g, "-").toLowerCase()}`;

  useEffect(() => {
    if (!file) {
      setPreview(currentUrl || "");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [currentUrl, file]);

  return (
    <div className="flex w-full flex-col gap-2">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <label
        htmlFor={id}
        className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-[8px] border border-[#fbeed2] bg-transparent px-4 py-2 text-[12px] font-medium leading-[18px] text-white hover:border-[#eaad2c]"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-[#3a4255]">
          {preview ? (
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <UserIcon />
          )}
        </span>
        <span className="min-w-0 flex-1 truncate text-white/70">
          {file?.name || (currentUrl ? "Current image" : "Choose image")}
        </span>
      </label>
      <input
        id={id}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
    </div>
  );
}

function PasswordField({ label, value, onChange, visible, onToggleVisible, autoComplete }) {
  const id = `field-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div className="flex w-full flex-col gap-2">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative flex w-full items-center rounded-[8px] border border-[#fbeed2] bg-transparent px-4 py-3 focus-within:ring-1 focus-within:ring-[#eaad2c]">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className="flex-1 min-w-0 bg-transparent text-[12px] font-medium leading-[18px] text-white placeholder:text-white/30 focus:outline-none"
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={onToggleVisible}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="ml-3 flex h-4 w-4 shrink-0 items-center justify-center text-[#fbeed2] hover:text-[#eaad2c]"
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  );
}

function BackButton() {
  return (
    <Link
      href="/admin/settings/user-access"
      className="flex items-center justify-center gap-1 rounded-[8px] border-2 border-[#f2cb7a] bg-transparent px-6 py-2 text-[14px] font-semibold text-[#fbeed2] transition hover:brightness-110"
      style={{ letterSpacing: "-1px" }}
    >
      <ArrowLeftIcon />
      <span>Back</span>
    </Link>
  );
}

function SaveButton({ disabled = false }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="flex items-center justify-center gap-1 rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold text-[#141828] transition hover:brightness-110"
      style={{ backgroundImage: GRAD_GOLD, letterSpacing: "-1px" }}
    >
      <CheckIcon />
      <span>Save</span>
    </button>
  );
}

function ChevronIcon({ up }) {
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
      style={{ transform: up ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f6dda6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a19.4 19.4 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 7 11 7a19.4 19.4 0 0 1-2.16 3.19" />
      <path d="M14.12 14.12A3 3 0 1 1 9.88 9.88" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbeed2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#141828" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
