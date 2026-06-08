"use client";

import { useEffect, useState } from "react";
import ModalShell from "./ModalShell";

const INPUT_BASE =
  "w-full rounded-[8px] border border-[#f2cb7a] bg-transparent px-4 py-2.5 text-[14px] text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#e9af41]/40";

function PercentInput({ value, onChange }) {
  return (
    <div className="relative flex items-center">
      <span className="pointer-events-none absolute left-4 text-[14px] text-[#e9af41]">%</span>
      <input
        type="number"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${INPUT_BASE} pl-9`}
      />
    </div>
  );
}

export default function KeeperDifficultyModal({ open, onClose, initial, onSave }) {
  const [easy, setEasy] = useState(initial?.easy ?? 75);
  const [medium, setMedium] = useState(initial?.medium ?? 50);
  const [hard, setHard] = useState(initial?.hard ?? 15);
  const [selected, setSelected] = useState(initial?.selected ?? "easy");

  useEffect(() => {
    if (!open) return;
    setEasy(initial?.easy ?? 75);
    setMedium(initial?.medium ?? 50);
    setHard(initial?.hard ?? 25);
    setSelected(initial?.selected ?? "easy");
  }, [initial, open]);

  const handleSave = () => {
    onSave?.({ easy: Number(easy), medium: Number(medium), hard: Number(hard), selected });
    onClose?.();
  };

  return (
    <ModalShell title="Keeper Difficulty" open={open} onClose={onClose} onSave={handleSave}>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Easy</label>
          <PercentInput value={easy} onChange={setEasy} />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Medium</label>
          <PercentInput value={medium} onChange={setMedium} />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Hard</label>
          <PercentInput value={hard} onChange={setHard} />
        </div>
        <div>
          <label className="mb-2 block text-[14px] font-semibold text-white">Select Difficulty</label>
          <div className="relative">
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className={`${INPUT_BASE} appearance-none pr-10`}
            >
              <option value="easy"   style={{ background: "#041502", color: "white" }}>Easy</option>
              <option value="medium" style={{ background: "#041502", color: "white" }}>Medium</option>
              <option value="hard"   style={{ background: "#041502", color: "white" }}>Hard</option>
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
