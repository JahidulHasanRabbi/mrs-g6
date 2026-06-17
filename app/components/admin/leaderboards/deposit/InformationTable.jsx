"use client";

import RowActions from "../../world-cup/RowActions";

const HEADER_BG = "linear-gradient(180deg, #141828 0%, #333333 99.75%)";

export default function InformationTable({ items = [], onEdit }) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-white/5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr style={{ backgroundImage: HEADER_BG }} className="text-left">
              <th className="w-[60px] px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">No.</th>
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">Description</th>
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">Terms & Condition</th>
              <th className="px-5 py-4 text-right text-[13px] font-semibold text-[#fbeed2]">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-[13px] text-white/50">
                  No information configured yet.
                </td>
              </tr>
            ) : (
              items.map((item, idx) => (
                <tr key={item.id} className="border-b border-white/5 align-top last:border-b-0 hover:bg-white/[0.02]">
                  <td className="px-5 py-5 text-[12px] text-white">{idx + 1}</td>
                  <td className="px-5 py-5 text-[12px] leading-[1.6] text-white">{item.description}</td>
                  <td className="px-5 py-5 text-[12px] leading-[1.6] text-white">{item.termsCondition}</td>
                  <td className="px-5 py-5 align-middle">
                    <RowActions
                      onEdit={() => onEdit?.(item)}
                      showArchive={false}
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
