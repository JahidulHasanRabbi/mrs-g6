"use client";

import { useEffect, useState } from "react";
import ModalShell from "../penalty-kick/ModalShell";

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export default function SmashSequenceModal({ open, rewards = [], onClose, onSave }) {
  const [position, setPosition] = useState("");
  const [selectedRewardId, setSelectedRewardId] = useState("");

  useEffect(() => {
    if (open) {
      setPosition("");
      setSelectedRewardId("");
    }
  }, [open]);

  const handleSave = () => {
    const pos = parseInt(position, 10);
    if (!pos || pos < 1 || pos > rewards.length || !selectedRewardId) return;

    const rewardIndex = rewards.findIndex((r) => r.id === selectedRewardId);
    if (rewardIndex === -1) return;

    const targetIndex = pos - 1;
    if (rewardIndex === targetIndex) {
      onClose?.();
      return;
    }

    const next = [...rewards];
    const [moved] = next.splice(rewardIndex, 1);
    next.splice(targetIndex, 0, moved);
    onSave?.(next);
    onClose?.();
  };

  return (
    <ModalShell title="Smash Sequence" open={open} onClose={onClose} onSave={handleSave}>
      <div className="flex gap-10 items-start">
        <div className="flex flex-1 flex-col gap-2 min-w-0">
          <label className="text-[18px] font-medium text-[#f6dda6]" style={{ fontFamily: "Inter, sans-serif" }}>
            Position
          </label>
          <div className="flex items-center rounded-[8px] border border-[#fbeed2] px-4 py-3">
            <span className="text-[12px] font-bold text-white mr-3">#</span>
            <input
              type="number"
              min={1}
              max={rewards.length}
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder={rewards.length ? `1–${rewards.length}` : "—"}
              className="w-full bg-transparent text-[12px] font-medium text-white outline-none placeholder:text-white/40 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2 min-w-0">
          <label className="text-[18px] font-medium text-[#f6dda6]" style={{ fontFamily: "Inter, sans-serif" }}>
            Reward Selection
          </label>
          <div className="relative">
            <select
              value={selectedRewardId}
              onChange={(e) => setSelectedRewardId(e.target.value)}
              className="w-full appearance-none rounded-[8px] border border-[#fbeed2] bg-transparent px-4 py-3 pr-10 text-[12px] font-medium text-white outline-none cursor-pointer"
            >
              <option value="" disabled className="bg-[#041502] text-white/40">
                Select reward
              </option>
              {rewards.map((r) => (
                <option key={r.id} value={r.id} className="bg-[#041502] text-white">
                  {r.name}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white">
              <ChevronIcon />
            </span>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
