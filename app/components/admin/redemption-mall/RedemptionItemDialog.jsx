"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const EMPTY = {
  name: "",
  quantity: "",
  startDate: "",
  endDate: "",
  prizeType: "",
  mart: "",
  tokens: "",
  promotion: "",
};

const FIELDS = [
  { id: "name",      label: "Name" },
  { id: "quantity",  label: "Quantity" },
  { id: "startDate", label: "Start Date" },
  { id: "endDate",   label: "End Date" },
  { id: "prizeType", label: "Prize Type" },
  { id: "mart",      label: "Mart" },
  { id: "tokens",    label: "Token" },
  { id: "promotion", label: "Promotion" },
];

export default function RedemptionItemDialog({ open, mode = "create", initial, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && initial) {
      setForm({
        name: initial.name ?? "",
        quantity: initial.quantity ?? "",
        startDate: initial.startDate ?? "",
        endDate: initial.endDate ?? "",
        prizeType: initial.prizeType ?? "",
        mart: initial.mart ?? "",
        tokens: initial.tokens ?? "",
        promotion: initial.promotion ?? "",
      });
      setImagePreview(initial.image ?? null);
    } else {
      setForm(EMPTY);
      setImagePreview(null);
    }
  }, [open, mode, initial]);

  if (!open) return null;

  const isEdit = mode === "edit";
  const title = isEdit ? "Edit Redemption Item" : "Create Redemption Item";
  const submitLabel = isEdit ? "Save" : "Create";

  const handleChange = (id) => (e) => setForm((f) => ({ ...f, [id]: e.target.value }));

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
      <div className="w-full max-w-[540px] rounded-[14px] bg-[#3d3d3d] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        {/* Logo + title */}
        <div className="mb-6 flex flex-col items-center">
            <FlameLogo />
          <h2 className="font-['Times_New_Roman'] text-[22px] font-bold text-white">{title}</h2>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-3">
          {FIELDS.map((field, idx) => (
            <div key={field.id} className="grid grid-cols-[110px_1fr] items-center gap-4">
              <label
                htmlFor={`field-${field.id}`}
                className="font-['Times_New_Roman'] text-[14px] text-white"
              >
                {field.label}:
              </label>
              <input
                id={`field-${field.id}`}
                value={form[field.id]}
                onChange={handleChange(field.id)}
                className={`h-[36px] rounded-[8px] bg-[#5a5a5a] px-3 font-['Times_New_Roman'] text-[14px] text-white outline-none transition focus:border-[#e9af41] ${
                  idx === 0 ? "border border-[#e9af41]" : "border border-transparent"
                }`}
              />
            </div>
          ))}

          {/* Image upload */}
          <div className="mt-2">
            <label className="font-['Times_New_Roman'] text-[14px] text-white">Image</label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 flex h-[120px] w-full items-center justify-center rounded-[8px] border-2 border-dashed border-white/30 bg-[#5a5a5a]/30 transition hover:border-[#e9af41]"
            >
              {imagePreview ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={imagePreview} alt="preview" className="max-h-full rounded-[6px] object-contain" />
              ) : (
                <ImagePlaceholderIcon />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImage}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-7 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="h-[40px] min-w-[90px] rounded-[8px] bg-white px-5 font-['Times_New_Roman'] text-[14px] font-bold text-[#b91c1c] transition hover:bg-white/90"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(form)}
            className="h-[40px] min-w-[90px] rounded-[8px] bg-[#e8b558] px-5 font-['Times_New_Roman'] text-[14px] font-bold text-[#7a3a00] shadow-[0_2px_8px_rgba(231,196,87,0.35)] transition hover:brightness-110"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function FlameLogo() {
  return (
    <Image src="/assets/admin/Tier.png" alt="Flame Logo" width={72} height={72} />
  );
}

function ImagePlaceholderIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="3" fill="#e8b558" />
      <circle cx="9" cy="9" r="1.6" fill="white" />
      <path d="M4 17l4.5-5 3.5 4 3-3 5 6V18a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" fill="white" />
    </svg>
  );
}
