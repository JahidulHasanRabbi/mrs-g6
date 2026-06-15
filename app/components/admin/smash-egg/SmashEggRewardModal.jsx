"use client";

import { useEffect, useRef, useState } from "react";
import ModalShell from "../penalty-kick/ModalShell";

// Add / Edit reward modal for the Smash Egg game. Mirrors the Penalty Kick
// reward form fields but lives in a ModalShell so the flow stays on the page.

const INPUT_BASE =
  "w-full rounded-[8px] border border-[#f2cb7a] bg-transparent px-4 py-2.5 text-[14px] text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#e9af41]/40";

const ITEM_TYPES = [
  "Free credit",
  "Token",
  "Prize",
  "Min withdraw",
  "Max withdraw",
  "Worldcup Leaderboard Score",
];

const EMPTY = { name: "", quantity: "", itemType: ITEM_TYPES[0], unlimited: false };

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full transition-colors ${
        checked ? "bg-[#e9af41]" : "bg-white/15"
      }`}
    >
      <span
        className={`inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-[23px]" : "translate-x-[3px]"
        }`}
      />
    </button>
  );
}

function ImagePlaceholderIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.7">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="1.5" fill="white" fillOpacity="0.7" stroke="none" />
      <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function SmashEggRewardModal({ open, mode = "add", initial = null, onClose, onSave }) {
  const fileRef = useRef(null);
  const [form, setForm] = useState(EMPTY);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && initial) {
      setForm({
        name: initial.name || "",
        quantity: initial.unlimited ? "" : String(initial.quantity ?? ""),
        itemType: initial.itemType || ITEM_TYPES[0],
        unlimited: Boolean(initial.unlimited),
      });
      setImagePreview(initial.image || null);
    } else {
      setForm(EMPTY);
      setImagePreview(null);
    }
  }, [open, mode, initial]);

  const handleChange = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    onSave?.({
      name: form.name.trim(),
      quantity: form.unlimited ? 0 : Number(String(form.quantity).replace(/,/g, "")) || 0,
      itemType: form.itemType,
      unlimited: form.unlimited,
      image: imagePreview,
    });
    onClose?.();
  };

  return (
    <ModalShell
      title={mode === "edit" ? "Edit Reward" : "Add Reward"}
      open={open}
      onClose={onClose}
      onSave={handleSave}
      saveLabel={mode === "edit" ? "Save" : "Add"}
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Reward Name</label>
          <input
            type="text"
            value={form.name}
            onChange={handleChange("name")}
            placeholder="Enter reward name"
            className={INPUT_BASE}
          />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Item Type</label>
          <div className="relative">
            <select value={form.itemType} onChange={handleChange("itemType")} className={`${INPUT_BASE} appearance-none pr-10`}>
              {ITEM_TYPES.map((t) => (
                <option key={t} value={t} style={{ background: "#041502", color: "white" }}>
                  {t}
                </option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#e9af41" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Quantity</label>
          <input
            type="number"
            min="1"
            value={form.quantity}
            onChange={handleChange("quantity")}
            disabled={form.unlimited}
            placeholder="Enter quantity"
            className={`${INPUT_BASE} ${form.unlimited ? "opacity-50" : ""}`}
          />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Unlimited</label>
          <div className="flex h-[44px] items-center gap-3">
            <Toggle checked={form.unlimited} onChange={(v) => setForm((prev) => ({ ...prev, unlimited: v }))} />
            <span className="text-[13px] text-white/70">{form.unlimited ? "Active" : "Inactive"}</span>
          </div>
        </div>

        <div className="md:col-span-2">
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
                <ImagePlaceholderIcon />
                <span className="text-[14px]">Upload Image</span>
              </>
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
        </div>
      </div>
    </ModalShell>
  );
}
