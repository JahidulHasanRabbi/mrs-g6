"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FormChrome, { INPUT_BASE } from "../../../../components/admin/world-cup/FormChrome";
import { useWorldCupSettings } from "../../../../contexts/WorldCupSettingsContext";

const ITEM_TYPES = [
  "Top Country",
  "Top Player",
  "Top Region",
];

const COUNTRIES = [
  "Brazil", "Argentina", "USA", "Germany", "England", "Japan", "Portugal", "Spain", "France", "Italy",
];

function ChevronIcon() {
  return (
    <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#e9af41" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
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

function Select({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${INPUT_BASE} appearance-none pr-10`}
      >
        {options.map((o) => (
          <option key={o} value={o} style={{ background: "#041502", color: "white" }}>{o}</option>
        ))}
      </select>
      <ChevronIcon />
    </div>
  );
}

function RewardForm() {
  const router = useRouter();
  const params = useSearchParams();
  const editingId = params.get("id");

  const { rewards, upsertReward } = useWorldCupSettings();
  const existing = editingId ? rewards.find((r) => r.id === editingId) : null;

  const [form, setForm] = useState({
    id: editingId || "",
    name: "BMW M3",
    quantity: "3,700",
    itemType: "Top Country",
    country: "Brazil",
    description: "This prize will be given to the winner",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (existing) {
      setForm({
        id: existing.id,
        name: existing.name || "",
        quantity: String(existing.quantity ?? ""),
        itemType: existing.itemType || "Top Country",
        country: existing.country || "Brazil",
        description: existing.description || "",
        image: existing.image || null,
      });
      setImagePreview(existing.image || null);
    }
  }, [existing]);

  const set = (k) => (v) => setForm((p) => ({ ...p, [k]: typeof v === "object" && v?.target ? v.target.value : v }));

  const onImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const onSave = async () => {
    setSaving(true);
    const payload = {
      ...form,
      quantity: Number(String(form.quantity).replace(/[,\s]/g, "")) || 0,
      image: imagePreview,
    };
    upsertReward(payload);
    await new Promise((r) => setTimeout(r, 200));
    setSaving(false);
    router.push("/admin/world-cup/settings");
  };

  return (
    <FormChrome
      title={editingId ? "Edit Reward" : "Add Reward"}
      onBack={() => router.push("/admin/world-cup/settings")}
      onSave={onSave}
      saving={saving}
    >
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
          <Select value={form.itemType} onChange={set("itemType")} options={ITEM_TYPES} />
        </div>

        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Country</label>
          <Select value={form.country} onChange={set("country")} options={COUNTRIES} />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Description</label>
          <textarea
            value={form.description}
            onChange={set("description")}
            rows={3}
            className={`${INPUT_BASE} resize-none`}
          />
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
                <ImagePlaceholder />
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
