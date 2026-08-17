"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "../../../components/admin/ui/Toast";
import {
  STATION_OPTIONS,
  REWARD_TYPE_OPTIONS,
  buildRedeemLinkPayload,
  describeRedeemLinkError,
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
          <input type="date" value={form.startDate} onChange={set("startDate")} className={`${inputClass(errors.startDate)} [color-scheme:dark]`} />
        </Field>

        <Field label="End Date" error={errors.endDate}>
          <input type="date" min={form.startDate || undefined} value={form.endDate} onChange={set("endDate")} className={`${inputClass(errors.endDate)} [color-scheme:dark]`} />
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
