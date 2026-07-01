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

// One toggle, not two — Gameplay and Maintenance Mode were mutually
// exclusive anyway (turning one on always forced the other off), so this
// collapses them into a single Open/Closed switch, same as Leaderboard
// Status.
export default function GameStatusModal({ open, onClose, initial, onSave }) {
  const [isOpen, setIsOpen] = useState(Boolean(initial ?? true));

  useEffect(() => {
    if (open) setIsOpen(Boolean(initial ?? true));
  }, [initial, open]);

  const handleSave = () => {
    onSave?.(isOpen);
    onClose?.();
  };

  return (
    <ModalShell title="Game Status" open={open} onClose={onClose} onSave={handleSave} width="max-w-[420px]">
      <Toggle checked={isOpen} onChange={setIsOpen} label="Open" />
    </ModalShell>
  );
}
