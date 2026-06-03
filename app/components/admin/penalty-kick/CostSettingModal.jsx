"use client";

import { useEffect, useState } from "react";
import ModalShell from "./ModalShell";

export default function CostSettingModal({ open, onClose, initial, onSave }) {
  const [cost, setCost] = useState(initial?.cost ?? "10.00");

  useEffect(() => {
    if (!open) return;
    setCost(initial?.cost ?? "10.00");
  }, [initial, open]);

  const handleSave = () => {
    onSave?.({ cost: Number(cost) });
    onClose?.();
  };

  return (
    <ModalShell title="Cost Setting" open={open} onClose={onClose} onSave={handleSave}>
      <div>
        <label className="mb-2 block text-[14px] font-semibold text-white">Token cost per Kick</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          className="w-full rounded-[8px] border border-[#f2cb7a] bg-transparent px-4 py-2.5 text-[14px] text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#e9af41]/40"
        />
      </div>
    </ModalShell>
  );
}
