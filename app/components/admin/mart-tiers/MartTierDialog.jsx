"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const EMPTY = {
  name: "",
  level: "",
};

export default function MartTierDialog({ open, mode = "create", initial, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!open) return;
    
    if (mode === "edit" && initial) {
      setForm({
        name: initial.name || "",
        level: initial.level || "",
      });
    } else {
      setForm(EMPTY);
    }
    setErrorMessage("");
  }, [open, mode, initial]);

  if (!open) return null;

  const isEdit = mode === "edit";
  const title = isEdit ? "Edit Mart Tier" : "Create Mart Tier";
  const submitLabel = isEdit ? "Save" : "Create";

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const submitData = {
        name: form.name,
        level: parseInt(form.level, 10),
      };

      await onSubmit(submitData);
    } catch (err) {
      console.error('Form submission error:', err);
      // Extract error message from API response
      let message = "Failed to save tier. Please try again.";
      if (err.data) {
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
      } else if (err.message) {
        message = err.message;
      }
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
      <div className="w-full max-w-[480px] rounded-[14px] bg-[#3d3d3d] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        {/* Logo + title */}
        <div className="mb-6 flex flex-col items-center">
          <TierLogo />
          <h2 className=" text-[22px] font-bold text-white">{title}</h2>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded bg-red-500/20 border border-red-500/50">
            <p className="text-red-200 text-sm">{errorMessage}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Tier Name */}
          <div className="grid grid-cols-[100px_1fr] items-center gap-4">
            <label className=" text-[14px] text-white">
              Tier Name:
            </label>
            <input
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="h-[36px] rounded-[8px] bg-[#5a5a5a] px-3 text-[14px] text-white outline-none transition focus:border-[#e9af41] border border-[#e9af41]"
              placeholder="e.g., Bronze, Silver, Gold"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Level */}
          <div className="grid grid-cols-[100px_1fr] items-center gap-4">
            <label className=" text-[14px] text-white">
              Level:
            </label>
            <input
              type="number"
              value={form.level}
              onChange={(e) => handleChange("level", e.target.value)}
              className="h-[36px] rounded-[8px] bg-[#5a5a5a] px-3 text-[14px] text-white outline-none transition focus:border-[#e9af41] border border-transparent"
              placeholder="e.g., 1, 2, 3"
              min="1"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Helper text */}
          <p className="text-xs text-white/50 -mt-2">
            Level determines the tier hierarchy. Lower numbers = lower tiers.
          </p>

          {/* Actions */}
          <div className="mt-4 flex items-center justify-end gap-3">
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

function TierLogo() {
  return (
    <Image src="/assets/admin/Tier.webp" alt="Tier Logo" width={72} height={72} />
  );
}
