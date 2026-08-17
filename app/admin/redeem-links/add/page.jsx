"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "../../../components/admin/ui/Toast";
import {
  STATION_OPTIONS,
  REWARD_TYPE_OPTIONS,
  buildRedeemLinkPayload,
  describeRedeemLinkError,
  formatRedeemLinkDateTime,
  mapRedeemLinkToForm,
  validateRedeemLinkForm,
} from "../../../components/admin/redeem-links/redeemLinkUtils.mjs";
import * as adminApi from "../../../api/adminApi";

const GOLD_BG = "linear-gradient(96deg, #dc9d16 1%, #f2cb7a 98%)";
const INPUT_BASE = "w-full rounded-[8px] border bg-transparent px-4 py-2.5 text-[14px] text-white placeholder:text-white/40 focus:outline-none focus:ring-2";
const INITIAL_FORM = {
  name: "",
  station: "1",
  stationUrl: "",
  rewardType: "1",
  amount: "",
  quantity: "",
  startDate: "",
  endDate: "",
};

function BackIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>;
}

function CheckIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>;
}

function Chevron() {
  return <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#e9af41" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>;
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="mb-2 block text-[14px] font-semibold text-white">{label}</label>
      {children}
      {error && <p className="mt-1.5 text-[12px] text-red-300">{error}</p>}
    </div>
  );
}

function inputClass(error) {
  return `${INPUT_BASE} ${error ? "border-red-400 focus:ring-red-400/30" : "border-[#f2cb7a] focus:ring-[#e9af41]/40"}`;
}

function CalendarIcon() {
  return (
    <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#e9af41" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="3" x2="8" y2="7" />
      <line x1="16" y1="3" x2="16" y2="7" />
    </svg>
  );
}

// `datetime-local` renders its value in the browser's own locale (mm/dd/yyyy
// with am/pm for US admins), and its inner fields paint their own color, so
// text-transparent does not hide them. Instead the native input is laid over
// the box at opacity-0 — it still owns the value, keyboard editing and picker,
// while the visible text is ours and always dd/mm/yyyy hh:mm. Same pattern as
// the member alert date filter.
function DateTimeInput({ value, onChange, error, min }) {
  const inputRef = useRef(null);

  // Clicking anywhere in the box opens the calendar, not just the icon.
  // showPicker() is Chromium/Firefox/Safari 16+; where it is missing (or throws
  // because the click was not user-activated) focus is still a usable fallback.
  const openPicker = () => {
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    try {
      input.showPicker?.();
    } catch {
      /* not supported here — the focused field is still editable */
    }
  };

  const border = error ? "border-red-400" : "border-[#f2cb7a]";

  return (
    <div
      className={`relative flex w-full cursor-pointer items-center rounded-[8px] border px-4 py-2.5 ${border} focus-within:ring-2 focus-within:ring-[#e9af41]/40`}
      onClick={openPicker}
    >
      <span className={`pointer-events-none text-[14px] tabular-nums ${value ? "text-white" : "text-white/40"}`}>
        {value ? formatRedeemLinkDateTime(value) : "dd/mm/yyyy hh:mm"}
      </span>
      <input
        ref={inputRef}
        type="datetime-local"
        value={value}
        min={min}
        onChange={onChange}
        aria-label="Date and time"
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0 [color-scheme:dark]"
      />
      <CalendarIcon />
    </div>
  );
}

function RedeemLinkForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const redeemLinkUuid = searchParams.get("id");
  const isEditing = Boolean(redeemLinkUuid);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!redeemLinkUuid) return;
    let cancelled = false;
    setLoading(true);
    adminApi.getRedeemLink(redeemLinkUuid).then((item) => {
      if (!cancelled) setForm(mapRedeemLinkToForm(item));
    }).catch((error) => {
      if (!cancelled) toast.error("Failed to load redeem link", { description: describeRedeemLinkError(error) });
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [redeemLinkUuid, toast]);

  const set = (key) => (event) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSave = async () => {
    if (saving) return;
    const nextErrors = validateRedeemLinkForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.warning("Please correct the highlighted fields", { description: Object.values(nextErrors)[0] });
      return;
    }

    setSaving(true);
    try {
      const payload = buildRedeemLinkPayload(form);
      if (isEditing) {
        await adminApi.updateRedeemLink(redeemLinkUuid, payload);
        toast.success("Redeem link updated");
      } else {
        await adminApi.createRedeemLink(payload);
        toast.success("Redeem link created");
      }
      router.push("/admin/redeem-links");
    } catch (error) {
      toast.error(isEditing ? "Failed to update redeem link" : "Failed to create redeem link", {
        description: describeRedeemLinkError(error),
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-[16px] bg-[#041502] p-6 text-center text-[13px] text-white/60 shadow-[0_-4px_12px_-2px_#dea220]">
        Loading redeem link...
      </div>
    );
  }

  return (
    <div className="rounded-[16px] bg-[#041502] p-6 shadow-[0_-4px_12px_-2px_#dea220]">
      <h2 className="mb-6 bg-clip-text text-[24px] font-bold leading-[1.2] text-transparent" style={{ fontFamily: "'DM Sans', sans-serif", backgroundImage: GOLD_BG }}>
        {isEditing ? "Edit Redeem Link" : "Add Redeem Link"}
      </h2>

      <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">
        <Field label="Campaign Name" error={errors.name}>
          <input type="text" value={form.name} onChange={set("name")} className={inputClass(errors.name)} placeholder="Enter campaign name" />
        </Field>

        <Field label="Station" error={errors.station}>
          <div className="relative">
            <select value={form.station} onChange={set("station")} className={`${inputClass(errors.station)} appearance-none pr-10`}>
              {STATION_OPTIONS.map((option) => <option key={option.value} value={option.value} style={{ background: "#041502", color: "white" }}>{option.label}</option>)}
            </select>
            <Chevron />
          </div>
        </Field>

        <Field label="Station URL" error={errors.stationUrl}>
          <input type="url" value={form.stationUrl} onChange={set("stationUrl")} className={inputClass(errors.stationUrl)} placeholder="https://example.com/" />
        </Field>

        <Field label="Reward Type" error={errors.rewardType}>
          <div className="relative">
            <select value={form.rewardType} onChange={set("rewardType")} className={`${inputClass(errors.rewardType)} appearance-none pr-10`}>
              {REWARD_TYPE_OPTIONS.map((option) => <option key={option.value} value={option.value} style={{ background: "#041502", color: "white" }}>{option.label}</option>)}
            </select>
            <Chevron />
          </div>
        </Field>

        <Field label="Amount" error={errors.amount}>
          <input type="number" min="1" step="1" value={form.amount} onChange={set("amount")} className={inputClass(errors.amount)} placeholder="Reward per member" />
        </Field>

        <Field label="Quantity" error={errors.quantity}>
          <input type="number" min="1" step="1" value={form.quantity} onChange={set("quantity")} className={inputClass(errors.quantity)} placeholder="Maximum members" />
        </Field>

        <Field label="Start Date" error={errors.startDate}>
          <DateTimeInput value={form.startDate} onChange={set("startDate")} error={errors.startDate} />
        </Field>

        <Field label="End Date" error={errors.endDate}>
          <DateTimeInput value={form.endDate} onChange={set("endDate")} error={errors.endDate} min={form.startDate || undefined} />
        </Field>
      </div>

      <div className="mt-8 flex items-center justify-end gap-3">
        <button type="button" onClick={() => router.push("/admin/redeem-links")} disabled={saving} className="inline-flex items-center gap-1.5 rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold text-[#fbeed2] transition-colors hover:bg-white/5 disabled:opacity-50">
          <BackIcon /> Back
        </button>
        <button type="button" onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1.5 rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold text-[#141828] transition-opacity hover:opacity-90 disabled:opacity-50" style={{ backgroundImage: GOLD_BG }}>
          <CheckIcon /> {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}

export default function AddRedeemLinkPage() {
  return <Suspense fallback={null}><RedeemLinkForm /></Suspense>;
}
