"use client";

const GOLD_BG = "linear-gradient(96deg, #dc9d16 1%, #f2cb7a 98%)";

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export default function SettingsSection({ title, addLabel, onAdd, children }) {
  return (
    <section className="overflow-hidden rounded-[16px] bg-[#041502] shadow-[0_-4px_12px_-2px_#dea220]">
      <header className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-6">
        <h2
          className="text-[22px] font-bold tracking-[-1px] text-white sm:text-[26px]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {title}
        </h2>
        {addLabel && (
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-1.5 rounded-[8px] border-2 border-[#f2cb7a] px-4 py-2 text-[13px] font-semibold tracking-[-0.5px] text-[#141828] transition-opacity hover:opacity-90 sm:px-6 sm:text-[14px]"
            style={{ backgroundImage: GOLD_BG }}
          >
            <PlusIcon />
            {addLabel}
          </button>
        )}
      </header>
      <div className="px-2 pb-2">{children}</div>
    </section>
  );
}
