"use client";

export default function SpinSequenceTable({ sequences = [], spinItems = [], onEditClick, onDeleteClick, onReorder }) {
  if (sequences.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-white/60">No spin sequences found</p>
      </div>
    );
  }

  // Helper to get item name from uuid
  const getItemName = (itemUuid) => {
    const item = spinItems.find(i => i.uuid === itemUuid);
    return item ? item.reward_name : 'Unknown Item';
  };

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
                  Actions
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
          {sequences.map((sequence) => (
            <tr
              key={sequence.uuid}
              className="border-b border-white/5 transition-colors hover:bg-white/[0.02]"
            >
              <td className="px-4 py-4">
                <p className="text-[16px] text-white font-['Times_New_Roman']">
                  {sequence.item_order}
                </p>
              </td>
              <td className="px-4 py-4">
                <p className="text-[16px] text-white/80 font-['Times_New_Roman']">
                  {getItemName(sequence.item_uuid)}
                </p>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onEditClick(sequence)}
                    className="rounded bg-[#06b800] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#06b800]/90"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => onDeleteClick(sequence)}
                    className="rounded border border-[#f04a4a] px-4 py-2 text-sm text-[#f04a4a] transition-colors hover:bg-[#f04a4a]/10"
                  >
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
