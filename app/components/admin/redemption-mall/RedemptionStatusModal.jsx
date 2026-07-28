"use client";

import { useEffect, useState } from "react";
import ModalShell from "../penalty-kick/ModalShell";

function Toggle({ checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-[14px] font-semibold text-white">Member Mart</p>
        <p className="mt-1 text-[12px] text-white/50">
          {checked ? "Members can view and redeem available items." : "Member redemption is temporarily closed."}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label="Toggle member Mart status"
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
    </div>
  );
}

export default function RedemptionStatusModal({
  open,
  initialOpen,
  saving,
  onClose,
  onSave,
}) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  useEffect(() => {
    if (open) setIsOpen(initialOpen);
  }, [initialOpen, open]);

  return (
    <ModalShell
      title="Game Status"
      open={open}
      onClose={onClose}
      onSave={() => onSave?.(isOpen)}
      saving={saving}
    >
      <div>
        <label className="mb-4 block text-[14px] font-semibold text-white">Gameplay</label>
        <Toggle checked={isOpen} onChange={setIsOpen} />
      </div>
    </ModalShell>
  );
}
