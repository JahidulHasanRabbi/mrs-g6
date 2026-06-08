"use client";

const GOLD_BG = "linear-gradient(96deg, #dc9d16 1%, #f2cb7a 98%)";

function BackIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export const INPUT_BASE =
  "w-full rounded-[8px] border border-[#f2cb7a] bg-transparent px-4 py-2.5 text-[14px] text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#e9af41]/40";

export default function FormChrome({ title, onBack, onSave, saving = false, children }) {
  return (
    <div className="rounded-[16px] bg-[#041502] p-4 shadow-[0_-4px_12px_-2px_#dea220] sm:p-6">
      <h2
        className="mb-6 bg-clip-text text-[22px] font-bold leading-[1.2] text-transparent sm:text-[24px]"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          backgroundImage: "linear-gradient(101deg, #dc9d16 1%, #f2cb7a 98%)",
        }}
      >
        {title}
      </h2>

      {children}

      <div className="mt-8 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-[8px] border-2 border-[#f2cb7a] px-5 py-2 text-[13px] font-semibold tracking-[-0.5px] text-[#fbeed2] transition-colors hover:bg-white/5 disabled:opacity-50 sm:px-6 sm:text-[14px]"
        >
          <BackIcon />
          Back
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-[8px] border-2 border-[#f2cb7a] px-5 py-2 text-[13px] font-semibold tracking-[-0.5px] text-[#141828] transition-opacity hover:opacity-90 disabled:opacity-50 sm:px-6 sm:text-[14px]"
          style={{ backgroundImage: GOLD_BG }}
        >
          <CheckIcon />
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
