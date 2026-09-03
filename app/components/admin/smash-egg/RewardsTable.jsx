"use client";

// Smash Egg rewards table. Visual spec mirrors Figma 1727:4094 — gradient
// header row (#141828 → #333333), a 48px image thumbnail cell, a gold-gradient
// "Edit" button and a dark "Archive" button. Column set matches the Lucky Spin
// / Penalty Kick rewards tables, plus a Position column: ID, Reward Name,
// Position, Quantity, Item Type, Image, Action.

import { useState } from "react";
import { SortIcon } from "../members/DataTable";

const GOLD_BG = "linear-gradient(96deg, #dc9d16 1%, #f2cb7a 98%)";
const DARK_BG = "linear-gradient(178deg, #141828 0%, #333333 99.75%)";

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="m18.5 2.5 3 3-11 11H7.5v-3l11-11Z" />
    </svg>
  );
}

function ArchiveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="5" rx="1" />
      <path d="M5 8v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  );
}

function ImagePlaceholderIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e9af41" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="1.5" fill="#e9af41" />
      <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function RewardsTable({ rewards = [], onEdit, onArchive }) {
  const [sortKey, setSortKey] = useState("numericId");
  const [sortDir, setSortDir] = useState("asc");

  const handleSort = (key) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedRewards = [...rewards].sort((a, b) => {
    let av = a[sortKey];
    let bv = b[sortKey];
    if (sortKey === "numericId") {
      av = Number(av ?? 0);
      bv = Number(bv ?? 0);
    }
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const SortableHeader = ({ label, sortableKey, ...rest }) => (
    <th
      className="cursor-pointer select-none px-6 py-4 text-[14px] font-semibold tracking-[-0.5px] text-[#fbeed2]"
      onClick={() => handleSort(sortableKey)}
      {...rest}
    >
      <span className="inline-flex items-center">
        {label}
        <SortIcon active={sortKey === sortableKey} direction={sortDir} />
      </span>
    </th>
  );

  return (
    <div className="overflow-hidden rounded-[12px] border border-white/5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="text-left" style={{ backgroundImage: DARK_BG }}>
              <SortableHeader label="ID" sortableKey="numericId" style={{ width: 80 }} />
              <SortableHeader label="Reward Name" sortableKey="name" style={{ width: 220 }} />
              <th className="px-6 py-4 text-[14px] font-semibold tracking-[-0.5px] text-[#fbeed2]">Position</th>
              <th className="px-6 py-4 text-[14px] font-semibold tracking-[-0.5px] text-[#fbeed2]">Quantity</th>
              <th className="px-6 py-4 text-[14px] font-semibold tracking-[-0.5px] text-[#fbeed2]">Item Type</th>
              <th className="px-6 py-4 text-center text-[14px] font-semibold tracking-[-0.5px] text-[#fbeed2]">Image</th>
              <th className="px-6 py-4 text-right text-[14px] font-semibold tracking-[-0.5px] text-[#fbeed2]" style={{ width: 227 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedRewards.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-[13px] text-white/50">
                  No rewards yet. Click &quot;Add Reward&quot; to create your first one.
                </td>
              </tr>
            ) : (
              sortedRewards.map((r) => (
                <tr key={r.id} className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02]">
                  <td className="px-6 py-5 text-[12px] text-white/70">{r.numericId ?? "-"}</td>
                  <td className="px-6 py-5 text-[12px] text-white">{r.name}</td>
                  <td className="px-6 py-5 text-[12px] text-white">
                    {r.position == null ? <span className="text-white/40">—</span> : `#${r.position}`}
                  </td>
                  <td className="px-6 py-5 text-[12px] text-white">
                    {r.unlimited ? "Unlimited" : Number(r.quantity ?? 0).toLocaleString("en-US")}
                  </td>
                  <td className="px-6 py-5 text-[12px] text-white">{r.itemType}</td>
                  <td className="px-6 py-5">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center overflow-hidden rounded-[4px] bg-white/5">
                      {r.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.image} alt={r.name} className="h-full w-full object-cover" />
                      ) : (
                        <ImagePlaceholderIcon />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit?.(r)}
                        className="inline-flex items-center gap-1.5 rounded-[8px] border-2 border-[#f2cb7a] px-4 py-2 text-[12px] font-medium text-[#141828] transition-opacity hover:opacity-90"
                        style={{ backgroundImage: GOLD_BG }}
                      >
                        <EditIcon />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onArchive?.(r)}
                        className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#f2cb7a] px-4 py-2 text-[12px] font-medium text-[#eaad2c] transition-opacity hover:opacity-90"
                        style={{ backgroundImage: DARK_BG }}
                      >
                        <ArchiveIcon />
                        Archive
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
