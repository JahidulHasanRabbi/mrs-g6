"use client";

import { useEffect, useState } from "react";
import ModalShell from "../penalty-kick/ModalShell";

function Toggle({ checked, onChange, label }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[14px] text-white">{label}</span>
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
    </div>
  );
}

// One toggle for all three boards — the backend only exposes a single
// /leaderboard/status/ switch, there's no per-type (deposit/withdraw/
// referrer) status.
export default function LeaderboardStatusModal({ open, onClose, initial, onSave }) {
  const [isOpen, setIsOpen] = useState(initial ?? true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setIsOpen(Boolean(initial ?? true));
  }, [initial, open]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave?.(isOpen);
      onClose?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell
      title="Leaderboard Status"
      open={open}
      onClose={onClose}
      onSave={handleSave}
      saving={saving}
      width="max-w-[420px]"
    >
      <p className="mb-4 text-[13px] leading-5 text-white/60">
        Applies to Deposit, Withdrawal, and Referrer leaderboards together.
      </p>
      <Toggle checked={isOpen} onChange={setIsOpen} label="Open" />
    </ModalShell>
  );
}
