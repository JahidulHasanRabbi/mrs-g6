"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GRAD_GOLD } from "../../../../components/admin/retention/constants";
import { createPromotion, getStationList } from "../../../../api/adminApi";

// Add Promotion (Settings → Promotions → Add). Three fields — Name,
// Promotion ID, and a multi-select of Stations — inside a dark card with a
// thin gold glow, matching app/admin/settings/user-access/add/page.jsx.
// Chrome (auth guard, topbar, padding) comes from app/admin/settings/layout.jsx.
//
// NOTE: createPromotion targets a stubbed endpoint (see TODO in app/api/api.js).
// The submit flow is real; the backend path/payload must be confirmed before
// this saves against production.

const INITIAL_FORM = {
  name: "",
  promotion_id: "",
  station_uuids: [],
};

export default function AddPromotionPage() {
  const router = useRouter();
  const [form, setForm] = useState(INITIAL_FORM);
  const [stations, setStations] = useState([]);
  const [stationsError, setStationsError] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getStationList()
      .then((res) => {
        const results = Array.isArray(res) ? res : Array.isArray(res?.results) ? res.results : [];
        setStations(results);
        setStationsError(false);
      })
      .catch(() => {
        setStations([]);
        setStationsError(true);
      });
  }, []);

  const update = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert("Cannot save: please enter a promotion name.");
      return;
    }
    if (!form.promotion_id.trim()) {
      alert("Cannot save: please enter a promotion ID.");
      return;
    }
    if (form.station_uuids.length === 0) {
      alert("Cannot save: please select at least one station.");
      return;
    }
    setSaving(true);
    try {
      await createPromotion({
        name: form.name.trim(),
        promotion_id: form.promotion_id.trim(),
        station_uuids: form.station_uuids,
      });
      router.push("/admin/settings/promotions");
    } catch (err) {
      console.error("[promotions-add] save failed", err);
      alert("Failed to save promotion. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const stationOptions = stations.map((s) => ({
    value: s.uuid,
    label: s.station_name || s.name || s.uuid,
  }));

  return (
    <>
      <PageHeader />
      <form onSubmit={handleSubmit} className="flex w-full flex-col">
        <div
          className="flex w-full flex-col gap-6 rounded-[16px] bg-[#05060a] p-6 md:p-10"
          style={{ filter: "drop-shadow(0 0 1.5px #dea220)" }}
        >
          <SectionTitle>Promotion Info</SectionTitle>

          <div className="grid w-full gap-6 md:gap-10 grid-cols-1 md:grid-cols-3">
            <TextField
              label="Name"
              value={form.name}
              onChange={update("name")}
              placeholder="Welcome Gift"
              autoComplete="off"
            />
            <TextField
              label="Promotion ID"
              value={form.promotion_id}
              onChange={update("promotion_id")}
              placeholder="PROMO-001"
              autoComplete="off"
            />
            <MultiSelectField
              label="Station"
              selected={form.station_uuids}
              onChange={update("station_uuids")}
              options={stationOptions}
              placeholder={
                stationsError
                  ? "Failed to load stations"
                  : stations.length === 0
                    ? "Loading..."
                    : "Select stations"
              }
            />
          </div>

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
          Add Promotion
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

// Multi-select: a dropdown of checkboxes. Selected stations render as
// removable chips above the trigger so the current assignment is visible
// without opening the menu.
function MultiSelectField({ label, selected, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);

  const toggle = (value) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const selectedLabels = selected
    .map((v) => options.find((o) => o.value === v))
    .filter(Boolean);

  return (
    <div className="flex w-full flex-col gap-2">
      <FieldLabel>{label}</FieldLabel>

      {selectedLabels.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedLabels.map((opt) => (
            <span
              key={opt.value}
              className="flex items-center gap-1 rounded-[6px] border border-[#f2cb7a]/50 bg-[#141828] px-2 py-0.5 text-[11px] font-medium text-[#f6dda6]"
            >
              {opt.label}
              <button
                type="button"
                onClick={() => toggle(opt.value)}
                aria-label={`Remove ${opt.label}`}
                className="text-[#f6dda6]/70 hover:text-white"
              >
                <CloseIcon />
              </button>
            </span>
          ))}
        </div>
      )}

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
              selectedLabels.length > 0 ? "text-white" : "text-white/30"
            }`}
          >
            {selectedLabels.length > 0
              ? `${selectedLabels.length} station${selectedLabels.length > 1 ? "s" : ""} selected`
              : placeholder}
          </span>
          <ChevronIcon up={open} />
        </button>
        {open ? (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <ul
              role="listbox"
              aria-multiselectable="true"
              className="absolute left-0 right-0 top-full mt-1 z-20 max-h-[240px] overflow-y-auto rounded-[8px] border border-[#fbeed2] bg-[#0a0d0e] scrollbar-admin"
            >
              {options.length === 0 ? (
                <li className="px-4 py-2 text-[12px] text-white/40">No stations available</li>
              ) : (
                options.map((opt) => {
                  const checked = selected.includes(opt.value);
                  return (
                    <li key={opt.value}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={checked}
                        onClick={() => toggle(opt.value)}
                        className="flex w-full items-center gap-3 px-4 py-2 text-left text-[12px] font-medium text-white hover:bg-white/5"
                      >
                        <Checkbox checked={checked} />
                        <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </>
        ) : null}
      </div>
    </div>
  );
}

function Checkbox({ checked }) {
  return (
    <span
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border ${
        checked ? "border-[#eaad2c] bg-[#eaad2c]" : "border-[#fbeed2]/60 bg-transparent"
      }`}
      aria-hidden="true"
    >
      {checked ? (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#141828" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : null}
    </span>
  );
}

function BackButton() {
  return (
    <Link
      href="/admin/settings/promotions"
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
      className="flex items-center justify-center gap-1 rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold text-[#141828] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      style={{ backgroundImage: GRAD_GOLD, letterSpacing: "-1px" }}
    >
      <CheckIcon />
      <span>Save</span>
    </button>
  );
}

// ── Icons ───────────────────────────────────────────────────────────────

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

function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
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
