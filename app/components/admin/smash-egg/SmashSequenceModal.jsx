"use client";

import { useEffect, useState } from "react";
import ModalShell from "../penalty-kick/ModalShell";

// Smash Sequence editor. Lets the admin set the order in which rewards are
// awarded as eggs are smashed. Operates on a working copy and only commits the
// new order on Save, mirroring the Lucky Spin "Spin Sequence" pattern.

function ArrowIcon({ up }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {up ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}
    </svg>
  );
}

export default function SmashSequenceModal({ open, rewards = [], onClose, onSave }) {
  const [order, setOrder] = useState(rewards);

  useEffect(() => {
    if (open) setOrder(rewards);
  }, [open, rewards]);

  const move = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= order.length) return;
    setOrder((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleSave = () => {
    onSave?.(order);
    onClose?.();
  };

  return (
    <ModalShell title="Smash Sequence" open={open} onClose={onClose} onSave={handleSave}>
      <p className="mb-4 text-[13px] text-white/60">
        Set the order in which rewards are awarded when members smash their eggs.
      </p>
      <div className="overflow-hidden rounded-[12px] border border-white/5">
        <table className="w-full">
          <thead>
            <tr className="text-left" style={{ backgroundImage: "linear-gradient(180deg, #141828 0%, #333333 99.75%)" }}>
              <th className="px-5 py-3 text-[13px] font-semibold text-[#fbeed2]" style={{ width: 90 }}>Position</th>
              <th className="px-5 py-3 text-[13px] font-semibold text-[#fbeed2]">Reward</th>
              <th className="px-5 py-3 text-right text-[13px] font-semibold text-[#fbeed2]">Order</th>
            </tr>
          </thead>
          <tbody>
            {order.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-[13px] text-white/50">
                  No rewards to sequence yet.
                </td>
              </tr>
            ) : (
              order.map((r, index) => (
                <tr key={r.id} className="border-b border-white/5 last:border-b-0">
                  <td className="px-5 py-3 text-[12px] text-white">#{index + 1}</td>
                  <td className="px-5 py-3 text-[12px] text-white">{r.name}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => move(index, -1)}
                        disabled={index === 0}
                        aria-label="Move up"
                        className="rounded-[8px] border border-[#f2cb7a] px-2.5 py-1.5 text-[#eaad2c] transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ArrowIcon up />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(index, 1)}
                        disabled={index === order.length - 1}
                        aria-label="Move down"
                        className="rounded-[8px] border border-[#f2cb7a] px-2.5 py-1.5 text-[#eaad2c] transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ArrowIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </ModalShell>
  );
}
