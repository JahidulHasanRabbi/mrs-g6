"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const EMPTY = {
  name: "",
  quantity_available: "",
  start_date: "",
  end_date: "",
  prize_type: "",
  credit_amount: "",
  tokens_needed: "",
  promotion: "",
  tier_uuid: "",
};

const PRIZE_TYPE_OPTIONS = [
  { value: 1, label: "ITEM" },
  { value: 2, label: "VOUCHER" },
  { value: 3, label: "CREDIT" },
  { value: 4, label: "OTHERS" },
];

export default function RedemptionItemDialog({ open, mode = "create", initial, martTiers = [], onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    
    if (mode === "edit" && initial) {
      // When editing, find the tier UUID from the tier name
      let tierUuid = "";
      if (initial.mart_tier && martTiers.length > 0) {
        const matchingTier = martTiers.find(t => t.name === initial.mart_tier);
        if (matchingTier) {
          tierUuid = matchingTier.uuid;
        }
      }
      
      // Convert prize_type string to number if needed
      let prizeTypeValue = initial.prize_type;
      if (typeof prizeTypeValue === 'string') {
        // Map string values to numbers: "ITEM" -> 1, "VOUCHER" -> 2, "CREDIT" -> 3, "OTHERS" -> 4
        const prizeTypeMap = { "ITEM": 1, "VOUCHER": 2, "CREDIT": 3, "OTHERS": 4 };
        prizeTypeValue = prizeTypeMap[prizeTypeValue.toUpperCase()] || prizeTypeValue;
      }
      
      setForm({
        name: initial.name || "",
        quantity_available: initial.quantity_available || "",
        start_date: initial.start_date || "",
        end_date: initial.end_date || "",
        prize_type: prizeTypeValue || "",
        credit_amount: initial.credit_amount || "",
        tokens_needed: initial.tokens_needed || "",
        promotion: initial.promotion || "",
        tier_uuid: tierUuid,
      });
      setImagePreview(initial.image || null);
      setImageFile(null);
    } else {
      setForm(EMPTY);
      setImagePreview(null);
      setImageFile(null);
    }
    setErrorMessage("");
  }, [open, mode, initial, martTiers]);

  if (!open) return null;

  const isEdit = mode === "edit";
  const title = isEdit ? "Edit Redemption Item" : "Create Redemption Item";
  const submitLabel = isEdit ? "Save" : "Create";
  const showCreditAmount = form.prize_type === 3;

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      // Prepare submission data
      const submitData = {
        name: form.name,
        quantity_available: parseInt(form.quantity_available, 10),
        start_date: form.start_date,
        end_date: form.end_date,
        prize_type: parseInt(form.prize_type, 10),
        tokens_needed: parseInt(form.tokens_needed, 10),
        promotion: form.promotion || "0.00", // Default to "0.00" if empty
      };

      // Add credit_amount only if prize_type is CREDIT (3)
      if (form.prize_type === 3 && form.credit_amount) {
        submitData.credit_amount = parseInt(form.credit_amount, 10);
      }

      // Add tier_uuid (required field)
      if (!form.tier_uuid) {
        setErrorMessage("Mart Tier is required. Please select a tier.");
        setIsSubmitting(false);
        return;
      }
      submitData.tier_uuid = form.tier_uuid;

      // Add image file if uploaded
      if (imageFile) {
        submitData.image = imageFile;
      }

      await onSubmit(submitData);
    } catch (err) {
      console.error('Form submission error:', err);
      console.error('Error type:', typeof err);
      console.error('Error keys:', Object.keys(err || {}));
      console.error('Error stringified:', JSON.stringify(err, null, 2));
      
      // Extract error message from API response
      let message = "Failed to save item. Please try again.";
      if (err && err.data) {
        if (typeof err.data === 'string') {
          message = err.data;
        } else if (err.data.detail) {
          message = err.data.detail;
        } else if (err.data.message) {
          message = err.data.message;
        } else {
          // Collect all field errors
          const errors = Object.entries(err.data)
            .map(([field, msgs]) => {
              const fieldName = field.replace(/_/g, ' ');
              const errorMsgs = Array.isArray(msgs) ? msgs.join(', ') : msgs;
              return `${fieldName}: ${errorMsgs}`;
            })
            .join('; ');
          if (errors) message = errors;
        }
      } else if (err && err.message) {
        message = err.message;
      }
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
      <div className="w-full max-w-[540px] max-h-[90vh] overflow-y-auto rounded-[14px] bg-[#3d3d3d] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)] scrollbar-admin">
        {/* Logo + title */}
        <div className="mb-6 flex flex-col items-center">
          <FlameLogo />
          <h2 className=" text-[22px] font-bold text-white">{title}</h2>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded bg-red-500/20 border border-red-500/50">
            <p className="text-red-200 text-sm">{errorMessage}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Name */}
          <div className="grid grid-cols-[110px_1fr] items-center gap-4">
            <label className=" text-[14px] text-white">
              Name:
            </label>
            <input
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="h-[36px] rounded-[8px] bg-[#5a5a5a] px-3 text-[14px] text-white outline-none transition focus:border-[#e9af41] border border-[#e9af41]"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Quantity */}
          <div className="grid grid-cols-[110px_1fr] items-center gap-4">
            <label className=" text-[14px] text-white">
              Quantity:
            </label>
            <input
              type="number"
              value={form.quantity_available}
              onChange={(e) => handleChange("quantity_available", e.target.value)}
              className="h-[36px] rounded-[8px] bg-[#5a5a5a] px-3 text-[14px] text-white outline-none transition focus:border-[#e9af41] border border-transparent"
              min="0"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Start Date */}
          <div className="grid grid-cols-[110px_1fr] items-center gap-4">
            <label className=" text-[14px] text-white">
              Start Date:
            </label>
            <input
              type="date"
              value={form.start_date}
              onChange={(e) => handleChange("start_date", e.target.value)}
              onClick={(e) => e.target.showPicker && e.target.showPicker()}
              className="h-[36px] rounded-[8px] bg-[#5a5a5a] px-3 text-[14px] text-white outline-none transition focus:border-[#e9af41] border border-transparent cursor-pointer"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* End Date */}
          <div className="grid grid-cols-[110px_1fr] items-center gap-4">
            <label className=" text-[14px] text-white">
              End Date:
            </label>
            <input
              type="date"
              value={form.end_date}
              onChange={(e) => handleChange("end_date", e.target.value)}
              onClick={(e) => e.target.showPicker && e.target.showPicker()}
              className="h-[36px] rounded-[8px] bg-[#5a5a5a] px-3 text-[14px] text-white outline-none transition focus:border-[#e9af41] border border-transparent cursor-pointer"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Prize Type */}
          <div className="grid grid-cols-[110px_1fr] items-center gap-4">
            <label className=" text-[14px] text-white">
              Prize Type:
            </label>
            <select
              value={form.prize_type}
              onChange={(e) => handleChange("prize_type", parseInt(e.target.value, 10))}
              className="h-[36px] rounded-[8px] bg-[#5a5a5a] px-3 text-[14px] text-white outline-none transition focus:border-[#e9af41] border border-transparent appearance-none cursor-pointer"
              required
              disabled={isSubmitting}
            >
              <option value="">Select prize type</option>
              {PRIZE_TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Credit Amount (conditional - only show when prize_type is CREDIT) */}
          {showCreditAmount && (
            <div className="grid grid-cols-[110px_1fr] items-center gap-4">
              <label className=" text-[14px] text-white">
                Credit Amount:
              </label>
              <input
                type="number"
                value={form.credit_amount}
                onChange={(e) => handleChange("credit_amount", e.target.value)}
                className="h-[36px] rounded-[8px] bg-[#5a5a5a] px-3 text-[14px] text-white outline-none transition focus:border-[#e9af41] border border-transparent"
                min="0"
                required
                disabled={isSubmitting}
              />
            </div>
          )}

          {/* Tokens Needed */}
          <div className="grid grid-cols-[110px_1fr] items-center gap-4">
            <label className=" text-[14px] text-white">
              Tokens Needed:
            </label>
            <input
              type="number"
              value={form.tokens_needed}
              onChange={(e) => handleChange("tokens_needed", e.target.value)}
              className="h-[36px] rounded-[8px] bg-[#5a5a5a] px-3 text-[14px] text-white outline-none transition focus:border-[#e9af41] border border-transparent"
              min="0"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Promotion */}
          <div className="grid grid-cols-[110px_1fr] items-center gap-4">
            <label className=" text-[14px] text-white">
              Promotion:
            </label>
            <input
              type="number"
              value={form.promotion}
              onChange={(e) => handleChange("promotion", e.target.value)}
              className="h-[36px] rounded-[8px] bg-[#5a5a5a] px-3 text-[14px] text-white outline-none transition focus:border-[#e9af41] border border-transparent"
              step="0.01"
              placeholder="0.00"
              disabled={isSubmitting}
            />
          </div>

          {/* Mart Tier */}
          <div className="grid grid-cols-[110px_1fr] items-center gap-4">
            <label className=" text-[14px] text-white">
              Mart Tier: <span className="text-red-400">*</span>
            </label>
            <select
              value={form.tier_uuid}
              onChange={(e) => handleChange("tier_uuid", e.target.value)}
              className="h-[36px] rounded-[8px] bg-[#5a5a5a] px-3 text-[14px] text-white outline-none transition focus:border-[#e9af41] border border-transparent appearance-none cursor-pointer"
              required
              disabled={isSubmitting}
            >
              <option value="">
                {martTiers.length === 0 ? 'No tiers available - create one first' : 'Select mart tier'}
              </option>
              {martTiers.map(tier => (
                <option key={tier.uuid} value={tier.uuid}>
                  {tier.name}
                </option>
              ))}
            </select>
          </div>

          {/* Image upload */}
          <div className="mt-2">
            <label className=" text-[14px] text-white">Image</label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 flex h-[120px] w-full items-center justify-center rounded-[8px] border-2 border-dashed border-white/30 bg-[#5a5a5a]/30 transition hover:border-[#e9af41]"
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
          </div>

          {/* Actions */}
          <div className="mt-7 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-[40px] min-w-[90px] rounded-[8px] bg-white px-5 text-[14px] font-bold text-[#b91c1c] transition hover:bg-white/90"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-[40px] min-w-[90px] rounded-[8px] bg-[#e8b558] px-5 text-[14px] font-bold text-[#7a3a00] shadow-[0_2px_8px_rgba(231,196,87,0.35)] transition hover:brightness-110 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : submitLabel}
            </button>
          </div>
        </form>
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
