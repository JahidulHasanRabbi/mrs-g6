"use client";

import { getOptionLabel } from "../../../api/apiOptions";

export default function SpinItemsTable({ items = [], onEditClick, onDeleteClick }) {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-white/60">No spin items found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="px-4 py-3 text-left text-sm font-medium text-white/60">
              Reward Name
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-white/60">
              Quantity
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-white/60">
              Item Type
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
                <p className="text-sm text-white">
                  {item.reward_name}
                </p>
              </td>
              <td className="px-4 py-4">
                <p className="text-sm text-white/80">
                  {item.unlimited ? 'Unlimited' : item.quantity}
                </p>
              </td>
              <td className="px-4 py-4">
                <p className="text-sm text-white/80">
                  {getOptionLabel('ITEM_TYPE', item.item_type)}
                </p>
              </td>
              <td className="px-4 py-4">
                {item.image ? (
                  <div className="relative h-10 w-10">
                    <img
                      src={item.image}
                      alt={item.reward_name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <p className="text-sm text-white/40">
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
