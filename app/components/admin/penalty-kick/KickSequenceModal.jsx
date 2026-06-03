"use client";

import { useEffect, useState } from "react";
import ModalShell from "./ModalShell";

const INPUT_BASE =
  "w-full rounded-[8px] border border-[#f2cb7a] bg-transparent px-4 py-2.5 text-[14px] text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#e9af41]/40";

export default function KickSequenceModal({ open, onClose, initial, rewards = [], onSave }) {
  const [position, setPosition] = useState(initial?.position ?? 11);
  const [rewardId, setRewardId] = useState(initial?.rewardId ?? rewards[0]?.id ?? "");

  useEffect(() => {
    if (!open) return;
    setPosition(initial?.position ?? 1);
    setRewardId(initial?.rewardId ?? rewards[0]?.id ?? "");
  }, [initial, open, rewards]);

  const handleSave = () => {
    onSave?.({ position: Number(position), rewardId });
    onClose?.();
  };

  return (
    <ModalShell title="Kick Sequence" open={open} onClose={onClose} onSave={handleSave}>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Position</label>
          <div className="relative flex items-center">
            <span className="pointer-events-none absolute left-4 text-[14px] text-[#e9af41]">#</span>
            <input
              type="number"
              min="1"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className={`${INPUT_BASE} pl-9`}
            />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Reward Selection</label>
          <div className="relative">
            <select
              value={rewardId}
              onChange={(e) => setRewardId(e.target.value)}
              className={`${INPUT_BASE} appearance-none pr-10`}
            >
              {rewards.length === 0 && (
                <option value="" style={{ background: "#041502", color: "white" }}>No rewards available</option>
              )}
              {rewards.map((r) => (
                <option key={r.id} value={r.id} style={{ background: "#041502", color: "white" }}>
                  {r.name}
                </option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#e9af41" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
