"use client";

const GOLD_BG = "linear-gradient(96deg, #dc9d16 1%, #f2cb7a 98%)";

function EditIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="m18.5 2.5 3 3-11 11H7.5v-3l11-11Z" />
    </svg>
  );
}

function ArchiveIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="5" rx="1" />
      <path d="M5 8v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  );
}

export default function RowActions({ onEdit, onArchive, showArchive = true, archiveBusy = false }) {
  return (
    <div className="flex items-center justify-end gap-2 whitespace-nowrap">
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex items-center gap-1.5 rounded-[8px] border-2 border-[#f2cb7a] px-3 py-1.5 text-[12px] font-medium text-[#141828] transition-opacity hover:opacity-90"
        style={{ backgroundImage: GOLD_BG }}
      >
        <EditIcon />
        Edit
      </button>
      {showArchive && (
        <button
          type="button"
          onClick={onArchive}
          disabled={archiveBusy}
          className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#f2cb7a] px-3 py-1.5 text-[12px] font-medium text-[#eaad2c] transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundImage: "linear-gradient(178deg, #141828 0%, #333333 99.75%)" }}
        >
          <ArchiveIcon />
          Archive
        </button>
      )}
    </div>
  );
}
