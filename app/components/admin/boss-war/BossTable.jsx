"use client";

import { useState } from "react";
import { SortIcon } from "../members/DataTable";
import { GOLD_BG } from "./constants";

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

function ViewIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

const STATUS_STYLES = {
  UPCOMING: "bg-sky-400/15 text-sky-300",
  ACTIVE: "bg-emerald-400/15 text-emerald-300",
  DEFEATED: "bg-amber-400/15 text-amber-300",
  ENDED: "bg-white/10 text-white/60",
};

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function BossTable({ bosses = [], onEdit, onArchive, onView }) {
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

  const sorted = [...bosses].sort((a, b) => {
    let av = a[sortKey];
    let bv = b[sortKey];
    if (sortKey === "numericId" || sortKey === "hpMax") {
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
        <table className="w-full min-w-[1100px]">
          <thead>
            <tr
              className="text-left"
              style={{ backgroundImage: "linear-gradient(180deg, #141828 0%, #333333 99.75%)" }}
            >
              <SortableHeader label="ID" sortableKey="numericId" style={{ width: 70 }} />
              <SortableHeader label="Boss Name" sortableKey="name" style={{ width: 200 }} />
              <th className="px-6 py-4 text-[14px] font-semibold tracking-[-0.5px] text-[#fbeed2]">Type</th>
              <th className="px-6 py-4 text-[14px] font-semibold tracking-[-0.5px] text-[#fbeed2]">Status</th>
              <th className="px-6 py-4 text-[14px] font-semibold tracking-[-0.5px] text-[#fbeed2]">HP</th>
              <th className="px-6 py-4 text-[14px] font-semibold tracking-[-0.5px] text-[#fbeed2]">Gem</th>
              <th className="px-6 py-4 text-[14px] font-semibold tracking-[-0.5px] text-[#fbeed2]">Runs</th>
              <th className="px-6 py-4 text-center text-[14px] font-semibold tracking-[-0.5px] text-[#fbeed2]">Image</th>
              <th className="px-6 py-4 text-right text-[14px] font-semibold tracking-[-0.5px] text-[#fbeed2]" style={{ width: 300 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-10 text-center text-[13px] text-white/50">
                  No bosses yet. Click &quot;Add Boss&quot; to create your first one.
                </td>
              </tr>
            ) : (
              sorted.map((b) => {
                const pct = b.hpMax > 0 ? Math.round((b.hpRemaining / b.hpMax) * 100) : 0;
                return (
                  <tr key={b.id} className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02]">
                    <td className="px-6 py-5 text-[12px] text-white/70">{b.numericId ?? "-"}</td>
                    <td className="px-6 py-5 text-[12px] text-white">{b.name}</td>
                    <td className="px-6 py-5 text-[12px] text-white">{b.bossType}</td>
                    <td className="px-6 py-5">
                      <span className={`inline-block rounded-full px-3 py-1 text-[11px] font-semibold ${STATUS_STYLES[b.status] || "bg-white/10 text-white/70"}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-[12px] text-white">
                      <div className="flex flex-col gap-1">
                        <span>
                          {Number(b.hpRemaining ?? 0).toLocaleString("en-US")} / {Number(b.hpMax ?? 0).toLocaleString("en-US")}
                        </span>
                        <span className="h-1.5 w-[120px] overflow-hidden rounded-full bg-white/10">
                          <span className="block h-full rounded-full bg-[#e9af41]" style={{ width: `${pct}%` }} />
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-[12px] text-white">{b.rewardGem}</td>
                    <td className="px-6 py-5 text-[12px] text-white/80">
                      <div className="flex flex-col">
                        <span>{formatDate(b.startsAt)}</span>
                        <span className="text-white/50">{formatDate(b.endsAt)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center overflow-hidden rounded-[4px] bg-white/5">
                        {b.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={b.image} alt={b.name} className="h-full w-full object-cover" />
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e9af41" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="9" cy="9" r="1.5" fill="#e9af41" />
                            <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onView?.(b)}
                          className="inline-flex items-center gap-1.5 rounded-[8px] border-2 border-[#f2cb7a] px-3 py-2 text-[12px] font-medium text-[#141828] transition-opacity hover:opacity-90"
                          style={{ backgroundImage: GOLD_BG }}
                        >
                          <ViewIcon />
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => onEdit?.(b)}
                          className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#f2cb7a] px-3 py-2 text-[12px] font-medium text-[#eaad2c] transition-opacity hover:opacity-90"
                          style={{ backgroundImage: "linear-gradient(178deg, #141828 0%, #333333 99.75%)" }}
                        >
                          <EditIcon />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onArchive?.(b)}
                          className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#f2cb7a] px-3 py-2 text-[12px] font-medium text-[#eaad2c] transition-opacity hover:opacity-90"
                          style={{ backgroundImage: "linear-gradient(178deg, #141828 0%, #333333 99.75%)" }}
                        >
                          <ArchiveIcon />
                          Archive
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
