"use client";

import { useState } from "react";
import ModalShell from "./ModalShell";

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

export default function GameStatusModal({ open, onClose, initial, onSave }) {
  const [gameplay, setGameplay] = useState(initial?.gameplay ?? true);
  const [maintenance, setMaintenance] = useState(initial?.maintenance ?? true);

  const handleSave = () => {
    onSave?.({ gameplay, maintenance });
    onClose?.();
  };

  return (
    <ModalShell title="Game Status" open={open} onClose={onClose} onSave={handleSave}>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <label className="mb-4 block text-[14px] font-semibold text-white">Gameplay</label>
          <Toggle checked={gameplay} onChange={setGameplay} label="Open" />
        </div>
        <div>
          <label className="mb-4 block text-[14px] font-semibold text-white">Maintenance Mode</label>
          <Toggle checked={maintenance} onChange={setMaintenance} label="Active" />
        </div>
      </div>
    </ModalShell>
  );
}
