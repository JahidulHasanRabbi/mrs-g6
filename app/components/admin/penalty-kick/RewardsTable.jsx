"use client";

const GOLD_BG = "linear-gradient(96deg, #dc9d16 1%, #f2cb7a 98%)";

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

export default function RewardsTable({ rewards = [], onEdit, onArchive }) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-white/5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead>
            <tr
              className="text-left"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, #141828 0%, #333333 99.75%)",
              }}
            >
              <th className="px-6 py-4 text-[14px] font-semibold tracking-[-0.5px] text-[#fbeed2]" style={{ width: 245 }}>Reward Name</th>
              <th className="px-6 py-4 text-[14px] font-semibold tracking-[-0.5px] text-[#fbeed2]">Quantity</th>
              <th className="px-6 py-4 text-[14px] font-semibold tracking-[-0.5px] text-[#fbeed2]">Item Type</th>
              <th className="px-6 py-4 text-center text-[14px] font-semibold tracking-[-0.5px] text-[#fbeed2]">Image</th>
              <th className="px-6 py-4 text-right text-[14px] font-semibold tracking-[-0.5px] text-[#fbeed2]" style={{ width: 227 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {rewards.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-[13px] text-white/50">
                  No rewards yet. Click "Add Reward" to create your first one.
                </td>
              </tr>
            ) : (
              rewards.map((r) => (
                <tr key={r.id} className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02]">
                  <td className="px-6 py-5 text-[12px] text-white">{r.name}</td>
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
                        style={{ backgroundImage: "linear-gradient(178deg, #141828 0%, #333333 99.75%)" }}
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
