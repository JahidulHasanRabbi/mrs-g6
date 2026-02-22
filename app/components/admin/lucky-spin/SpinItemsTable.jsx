"use client";

import Image from "next/image";

export const SPIN_ITEMS_DATA = [
  {
    id: 1,
    rewardName: "iPhone 17 Pro Max",
    probability: "0.5%",
    quantity: 100,
    itemImage: "https://www.figma.com/api/mcp/asset/7746f3b6-0c7d-4318-b3fb-818860ef2454",
  },
  {
    id: 2,
    rewardName: "Gold Bar 5 Gram",
    probability: "0.5%",
    quantity: 100,
    itemImage: null,
  },
  {
    id: 3,
    rewardName: "Sex Toy",
    probability: "0.5%",
    quantity: 100,
    itemImage: "https://www.figma.com/api/mcp/asset/645c766a-6d08-4683-b107-89b9cd7f5d95",
  },
  {
    id: 4,
    rewardName: "Free Bonus 6.88",
    probability: "0.5%",
    quantity: 100,
    itemImage: null,
  },
  {
    id: 5,
    rewardName: "Rolex Day",
    probability: "0.5%",
    quantity: 100,
    itemImage: "https://www.figma.com/api/mcp/asset/9d98b090-eaef-4c30-a367-2355c972375f",
  },
  {
    id: 6,
    rewardName: "Free Bonus 16.88",
    probability: "0.5%",
    quantity: 100,
    itemImage: null,
  },
  {
    id: 7,
    rewardName: "Free Bonus 23.88",
    probability: "0.5%",
    quantity: 100,
    itemImage: null,
  },
  {
    id: 8,
    rewardName: "MRS Point +3",
    probability: "0.5%",
    quantity: 100,
    itemImage: null,
  },
];

export default function SpinItemsTable({ items = SPIN_ITEMS_DATA, onEditClick, onDeleteClick }) {
  return (
    <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left text-sm font-medium text-white/60">
                Reward Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-white/60">
                Probability (%)
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-white/60">
                Quantity
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-white/60">
                Item Image
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-white/60">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-b border-white/5 transition-colors hover:bg-white/[0.02]"
              >
                <td className="px-4 py-4">
                  <p className="text-sm text-white font-['Times_New_Roman']">
                    {item.rewardName}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-sm text-white/80 font-['Times_New_Roman']">
                    {item.probability}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-sm text-white/80 font-['Times_New_Roman']">
                    {item.quantity}
                  </p>
                </td>
                <td className="px-4 py-4">
                  {item.itemImage ? (
                    <div className="relative h-10 w-10">
                      <Image
                        src={item.itemImage}
                        alt={item.rewardName}
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <p className="text-sm text-white/80 font-['Times_New_Roman']">
                      100
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
