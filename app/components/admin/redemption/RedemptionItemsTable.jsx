"use client";

import Image from "next/image";
import { getOptionLabel } from "../../../api/apiOptions";

export default function RedemptionItemsTable({ items = [], onEditClick, onDeleteClick }) {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-white/60">No redemption items found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="px-4 py-3 text-left text-sm font-medium text-white/60">
              Name
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-white/60">
              Quantity
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-white/60">
              Start Date
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-white/60">
              End Date
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-white/60">
              Prize Type
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-white/60">
              Tokens
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-white/60">
              Promotion
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-white/60">
              Image
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-white/60">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.uuid}
              className="border-b border-white/5 transition-colors hover:bg-white/[0.02]"
            >
              <td className="px-4 py-4">
                <p className="text-sm text-white font-['Times_New_Roman']">
                  {item.name}
                </p>
              </td>
              <td className="px-4 py-4">
                <p className="text-sm text-white/80 font-['Times_New_Roman']">
                  {item.quantity}
                </p>
              </td>
              <td className="px-4 py-4">
                <p className="text-sm text-white/80 font-['Times_New_Roman']">
                  {item.start_date}
                </p>
              </td>
              <td className="px-4 py-4">
                <p className="text-sm text-white/80 font-['Times_New_Roman']">
                  {item.end_date}
                </p>
              </td>
              <td className="px-4 py-4">
                <p className="text-sm text-white/80 font-['Times_New_Roman']">
                  {getOptionLabel('PRIZE_TYPE', item.prize_type)}
                </p>
              </td>
              <td className="px-4 py-4">
                <p className="text-sm text-white/80 font-['Times_New_Roman']">
                  {item.tokens_needed}
                </p>
              </td>
              <td className="px-4 py-4">
                <p className="text-sm text-white/80 font-['Times_New_Roman']">
                  {item.promotion}
                </p>
              </td>
              <td className="px-4 py-4">
                {item.image ? (
                  <div className="relative h-10 w-10">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <p className="text-sm text-white/40 font-['Times_New_Roman']">
                    No image
                  </p>
                )}
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onEditClick(item)}
                    className="rounded bg-[#06b800] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#06b800]/90"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteClick?.(item)}
                    className="rounded border border-[#f04a4a] px-4 py-2 text-sm text-[#f04a4a] transition-colors hover:bg-[#f04a4a]/10"
                  >
                    Archive
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
