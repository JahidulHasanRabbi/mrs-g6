"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FormChrome, { INPUT_BASE } from "../../../../components/admin/world-cup/FormChrome";
import {
  getWorldCupCountries,
  getWorldCupRewardItem,
  createWorldCupRewardItem,
  updateWorldCupRewardItem,
} from "../../../../api/adminApi";

// API item_type: 1=Prediction, 2=Top Country, 3=Global Top Player
const ITEM_TYPES = [
  { value: 1, label: "Prediction" },
  { value: 2, label: "Top Country" },
  { value: 3, label: "Global Top Player" },
];

function ChevronIcon() {
  return (
    <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#e9af41" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function Select({ value, onChange, options }) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} className={`${INPUT_BASE} appearance-none pr-10`}>
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: "#041502", color: "white" }}>{o.label}</option>
        ))}
      </select>
      <ChevronIcon />
    </div>
  );
}

function CountrySelect({ value, onChange, countries }) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} className={`${INPUT_BASE} appearance-none pr-10`}>
        <option value="" style={{ background: "#041502", color: "white" }}>— None —</option>
        {countries.map((c) => (
          <option key={c.uuid} value={c.uuid} style={{ background: "#041502", color: "white" }}>{c.name}</option>
        ))}
      </select>
      <ChevronIcon />
    </div>
  );
}

function ImagePlaceholder() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.7">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="1.5" fill="white" fillOpacity="0.7" stroke="none" />
      <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RewardForm() {
  const router = useRouter();
  const params = useSearchParams();
  const editingUuid = params.get("uuid");

  const [countryOptions, setCountryOptions] = useState([]);
  const [form, setForm] = useState({
    name: "",
    quantity: "",
    itemType: 2,
    countryUuid: "",
    description: "",
    imageFile: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    getWorldCupCountries().then((d) => setCountryOptions(d.results ?? d ?? [])).catch(() => {});

    if (editingUuid) {
      getWorldCupRewardItem(editingUuid).then((r) => {
        setForm({
          name: r.reward_name ?? "",
          quantity: String(r.quantity ?? ""),
          itemType: r.item_type ?? 2,
          countryUuid: r.country_uuid ?? "",
          description: r.description ?? "",
          imageFile: null,
        });
        setImagePreview(r.image || null);
      }).catch(() => {});
    }
  }, [editingUuid]);

  const set = (k) => (v) => setForm((p) => ({ ...p, [k]: typeof v === "object" && v?.target ? v.target.value : v }));

  const onImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((p) => ({ ...p, imageFile: file }));
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const onSave = async () => {
    if (!form.name) { setError("Reward name is required."); return; }
    setSaving(true);
    setError("");
    try {
      const payload = new FormData();
      payload.append("reward_name", form.name);
      payload.append("quantity", Number(String(form.quantity).replace(/[,\s]/g, "")) || 0);
      payload.append("item_type", form.itemType);
      if (form.countryUuid) payload.append("country_uuid", form.countryUuid);
      if (form.description) payload.append("description", form.description);
      if (form.imageFile) payload.append("image", form.imageFile);

      if (editingUuid) {
        await updateWorldCupRewardItem(editingUuid, payload);
      } else {
        await createWorldCupRewardItem(payload);
      }
      router.push("/admin/world-cup/settings");
    } catch (e) {
      setError(e?.message ?? "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormChrome
      title={editingUuid ? "Edit Reward" : "Add Reward"}
      onBack={() => router.push("/admin/world-cup/settings")}
      onSave={onSave}
      saving={saving}
    >
      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
      <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Reward Name</label>
          <input type="text" value={form.name} onChange={set("name")} className={INPUT_BASE} />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Quantity</label>
          <input type="text" value={form.quantity} onChange={set("quantity")} className={INPUT_BASE} />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Item Type</label>
          <Select
            value={form.itemType}
            onChange={(v) => setForm((p) => ({ ...p, itemType: Number(v) }))}
            options={ITEM_TYPES}
          />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Country (Top Country only)</label>
          <CountrySelect value={form.countryUuid} onChange={set("countryUuid")} countries={countryOptions} />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Description</label>
          <textarea value={form.description} onChange={set("description")} rows={3} className={`${INPUT_BASE} resize-none`} />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Choose Image</label>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex h-[140px] w-full items-center justify-center gap-3 rounded-[8px] border-2 border-dashed border-white/40 text-white/70 transition-colors hover:border-[#f2cb7a]/70 hover:text-white"
          >
            {imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imagePreview} alt="Preview" className="h-full w-full rounded-[8px] object-contain" />
            ) : (
              <>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.7">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="9" cy="9" r="1.5" fill="white" fillOpacity="0.7" stroke="none" />
                  <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-[14px]">Upload Image</span>
              </>
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onImage} />
        </div>
      </div>
    </FormChrome>
  );
}

export default function AddWorldCupRewardPage() {
  return (
    <Suspense fallback={null}>
      <RewardForm />
    </Suspense>
  );
}
