"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { GRAD_GOLD } from "../../../../../components/admin/retention/constants";
import { ROLE_OPTIONS, STATUS_OPTIONS } from "../../_data";
import { getCrmUsers } from "../../../../../api/crmApi";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const uuid = params?.id;

  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  const [form, setForm] = useState({
    username: "",
    fullName: "",
    role: "",
    status: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!uuid) { setUserLoading(false); return; }
    getCrmUsers({ page: 1, page_size: 100 })
      .then((res) => {
        const users = Array.isArray(res?.results) ? res.results : Array.isArray(res) ? res : [];
        const found = users.find((u) => u.uuid === uuid) || null;
        setUser(found);
        if (found) {
          setForm({
            username: found.username || "",
            fullName: found.full_name || "",
            role: found.role || "",
            status: found.status || "",
            password: "",
            confirmPassword: "",
          });
        }
      })
      .catch(() => setUser(null))
      .finally(() => setUserLoading(false));
  }, [uuid]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const update = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: wire to admin user-update endpoint. For now just navigate back.
    router.push("/admin/settings/user-access");
  };

  if (userLoading) {
    return (
      <>
        <PageHeader />
        <div className="rounded-[16px] bg-[#05060a] p-6 md:p-10 text-[14px] text-white/40" style={{ filter: "drop-shadow(0 0 1.5px #dea220)" }}>
          Loading...
        </div>
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
              value={form.role}
              onChange={update("role")}
              options={ROLE_OPTIONS}
              placeholder="Select role"
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

          <div className="flex flex-wrap items-center justify-end gap-4 pt-2">
            <BackButton />
            <SaveButton />
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

function SaveButton() {
  return (
    <button
      type="submit"
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
