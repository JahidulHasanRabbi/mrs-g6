"use client";

import { useState, useRef, useEffect } from "react";

import { STICKY_ACTION, STICKY_ACTION_CELL, TABLE_HEAD_BG } from "./formControls";

const GOLD_BG = "linear-gradient(96deg, #dc9d16 1%, #f2cb7a 98%)";

function KebabIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  );
}

function ActionMenu({ onEdit, onArchive }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Row actions"
        className="inline-flex h-8 w-10 items-center justify-center rounded-[8px] border border-[#f2cb7a] text-[#141828] transition-opacity hover:opacity-90"
        style={{ backgroundImage: GOLD_BG }}
      >
        <KebabIcon />
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-1 w-32 overflow-hidden rounded-[8px] border border-[#f2cb7a]/60 bg-[#0a1c08] shadow-lg">
          <button
            type="button"
            onClick={() => { setOpen(false); onEdit?.(); }}
            className="block w-full px-4 py-2 text-left text-[13px] text-white hover:bg-white/5"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); onArchive?.(); }}
            className="block w-full px-4 py-2 text-left text-[13px] text-[#eaad2c] hover:bg-white/5"
          >
            Archive
          </button>
        </div>
      )}
    </div>
  );
}

export default function MissionsTable({ missions = [], loading = false, onEdit, onArchive }) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-white/5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px]">
          <thead>
            <tr
              className="text-left"
              style={{
                backgroundImage: TABLE_HEAD_BG,
              }}
            >
              <th className="px-5 py-4 text-[13px] font-semibold tracking-[-0.5px] text-[#fbeed2]">Mission Name</th>
              <th className="px-5 py-4 text-[13px] font-semibold tracking-[-0.5px] text-[#fbeed2]">Category</th>
              <th className="px-5 py-4 text-[13px] font-semibold tracking-[-0.5px] text-[#fbeed2]">Description</th>
              <th className="px-5 py-4 text-[13px] font-semibold tracking-[-0.5px] text-[#fbeed2]">Mission Type</th>
              <th className="px-5 py-4 text-[13px] font-semibold tracking-[-0.5px] text-[#fbeed2]">Reset Type</th>
              <th className="px-5 py-4 text-[13px] font-semibold tracking-[-0.5px] text-[#fbeed2]">Condition</th>
              <th className="px-5 py-4 text-[13px] font-semibold tracking-[-0.5px] text-[#fbeed2]">Target</th>
              <th className="px-5 py-4 text-[13px] font-semibold tracking-[-0.5px] text-[#fbeed2]">Reward</th>
              <th className="px-5 py-4 text-[13px] font-semibold tracking-[-0.5px] text-[#fbeed2]">Limit Control</th>
              {/* Pinned: the table is wider than the panel at 1440, and Edit /
                  Archive were landing off-screen behind the sidebar. */}
              <th
                className={`${STICKY_ACTION} px-5 py-4 text-right text-[13px] font-semibold tracking-[-0.5px] text-[#fbeed2]`}
                style={{ backgroundImage: TABLE_HEAD_BG }}
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="px-5 py-10 text-center text-[13px] text-white/50">
                  Loading missions...
                </td>
              </tr>
            ) : missions.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-5 py-10 text-center text-[13px] text-white/50">
                  No missions yet. Click "Add Mission" to create one.
                </td>
              </tr>
            ) : (
              missions.map((m) => (
                <tr key={m.id} className="group border-b border-white/5 last:border-b-0 hover:bg-white/[0.02]">
                  <td className="px-5 py-5 text-[12px] text-white">{m.name}</td>
                  <td className="px-5 py-5 text-[12px] text-white">{m.category}</td>
                  <td className="px-5 py-5 text-[12px] text-white">{m.description}</td>
                  <td className="px-5 py-5 text-[12px] text-white">{m.missionType}</td>
                  <td className="px-5 py-5 text-[12px] text-white">{m.resetType}</td>
                  <td className="px-5 py-5 text-[12px] text-white">{m.condition}</td>
                  <td className="px-5 py-5 text-[12px] text-white">{m.target}</td>
                  <td className="px-5 py-5 text-[12px] text-white">{m.reward}</td>
                  <td className="px-5 py-5 text-[12px] text-white">{m.limitControl}</td>
                  <td className={`${STICKY_ACTION} ${STICKY_ACTION_CELL} px-5 py-5 text-right`}>
                    <ActionMenu
                      onEdit={() => onEdit?.(m)}
                      onArchive={() => onArchive?.(m)}
                    />
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
