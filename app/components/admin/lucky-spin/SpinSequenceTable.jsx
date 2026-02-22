"use client";

const SPIN_SEQUENCE_DATA = [
  { id: 1, sequence: 1, item: "iPhone 17 Pro Max" },
  { id: 2, sequence: 2, item: "Gold Bar 5 Gram" },
  { id: 3, sequence: 3, item: "Sex Toy" },
  { id: 4, sequence: 4, item: "Free Bonus 6.88" },
  { id: 5, sequence: 5, item: "Rolex Day" },
  { id: 6, sequence: 6, item: "Birthday" },
  { id: 7, sequence: 7, item: "Thank You" },
  { id: 8, sequence: 8, item: "Free Bonus 1.88" },
];

export default function SpinSequenceTable({ onEditClick, onAddClick }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-black border-b border-white/10">
            <th className="px-4 py-3 text-left">
              <div className="flex items-center gap-2">
                <span className="text-[18px] font-bold text-white font-['Times_New_Roman']">
                  Spin Sequence
                </span>
                <div className="relative h-8 w-8">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path d="M10 18L16 12L22 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 7L16 13L22 7" stroke="white" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </th>
            <th className="px-4 py-3 text-left">
              <div className="flex items-center gap-2">
                <span className="text-[18px] font-bold text-white font-['Times_New_Roman']">
                  Items
                </span>
                <div className="relative h-8 w-8">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path d="M10 18L16 12L22 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 7L16 13L22 7" stroke="white" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </th>
            <th className="px-4 py-3 text-left">
              <div className="flex items-center gap-2">
                <span className="text-[18px] font-bold text-white font-['Times_New_Roman']">
                  Status
                </span>
                <div className="relative h-8 w-8">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path d="M10 18L16 12L22 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 7L16 13L22 7" stroke="white" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {SPIN_SEQUENCE_DATA.map((item) => (
            <tr
              key={item.id}
              className="border-b border-white/5 transition-colors hover:bg-white/[0.02]"
            >
              <td className="px-4 py-4">
                <p className="text-[16px] text-white font-['Times_New_Roman']">
                  {item.sequence}
                </p>
              </td>
              <td className="px-4 py-4">
                <p className="text-[16px] text-white/80 font-['Times_New_Roman']">
                  {item.item}
                </p>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <button 
                      onClick={() => onEditClick(item)}
                      className="rounded bg-[#06b800] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#06b800]/90"
                    >
                      Edit
                    </button>
                  <button className="rounded border border-[#f04a4a] px-4 py-2 text-sm text-[#f04a4a] transition-colors hover:bg-[#f04a4a]/10">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
