"use client";

import RowActions from "./RowActions";
import ImageCell from "./ImageCell";
import { formatItemTypeLabel } from "../../../api/apiOptions";

const HEADER_BG = "linear-gradient(180deg, #141828 0%, #333333 99.75%)";

export default function RewardTable({ rewards = [], onEdit, onArchive }) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-white/5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr style={{ backgroundImage: HEADER_BG }} className="text-left">
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">Reward Name</th>
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">Quantity</th>
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">Item Type</th>
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">Country</th>
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">Position</th>
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">Achievement</th>
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">KR Coin Amount</th>
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">Description</th>
              <th className="px-5 py-4 text-center text-[13px] font-semibold text-[#fbeed2]">Image</th>
              <th className="px-5 py-4 text-right text-[13px] font-semibold text-[#fbeed2]">Action</th>
            </tr>
          </thead>
          <tbody>
            {rewards.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-5 py-10 text-center text-[13px] text-white/50">
                  No rewards configured yet.
                </td>
              </tr>
            ) : (
              rewards.map((r) => (
                <tr key={r.id} className="border-b border-white/5 align-top last:border-b-0 hover:bg-white/[0.02]">
                  <td className="px-5 py-5 text-[12px] text-white">{r.name}</td>
                  <td className="px-5 py-5 text-[12px] text-white">{r.quantity}</td>
                  <td className="px-5 py-5 text-[12px] text-white">{formatItemTypeLabel(r.itemType)}</td>
                  <td className="px-5 py-5 text-[12px] text-white">{r.country}</td>
                  <td className="px-5 py-5 text-[12px] text-white">{r.position ?? ""}</td>
                  <td className="px-5 py-5 text-[12px] text-white">{r.winCondition ?? ""}</td>
                  <td className="px-5 py-5 text-[12px] text-white">{r.tokenAmount ?? ""}</td>
                  <td className="px-5 py-5 text-[12px] leading-[1.6] text-white">{r.description}</td>
                  <td className="px-5 py-5 align-middle"><ImageCell src={r.image} alt={r.name} /></td>
                  <td className="px-5 py-5 align-middle">
                    <RowActions
                      onEdit={() => onEdit?.(r)}
                      onArchive={() => onArchive?.(r)}
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
