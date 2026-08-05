"use client";

function ArchiveIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="5" rx="1" />
      <path d="M5 8v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  );
}

export default function ArchiveButton({ onClick, disabled = false }) {
  return (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#f2cb7a] px-3 py-1.5 text-[12px] font-medium text-[#eaad2c] transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ backgroundImage: "linear-gradient(178deg, #141828 0%, #333333 99.75%)" }}
      >
        <ArchiveIcon />
        Archive
      </button>
    </div>
  );
}
