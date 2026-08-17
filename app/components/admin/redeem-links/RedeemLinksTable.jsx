"use client";

import StatusBadge from "../ui/StatusBadge";
import { getRedeemLinkStatus } from "./redeemLinkUtils.mjs";

const GOLD_BG = "linear-gradient(96deg, #dc9d16 1%, #f2cb7a 98%)";
const DARK_BG = "linear-gradient(178deg, #141828 0%, #333333 99.75%)";

function Icon({ type }) {
  if (type === "copy") {
    return <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>;
  }
  if (type === "check") return <polyline points="20 6 9 17 4 12" />;
  if (type === "history") return <><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 16 14" /></>;
  if (type === "edit") return <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="m18.5 2.5 3 3-11 11H7.5v-3l11-11Z" /></>;
  return <><rect x="3" y="3" width="18" height="5" rx="1" /><path d="M5 8v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" /><line x1="10" y1="12" x2="14" y2="12" /></>;
}

function ActionIcon({ type }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <Icon type={type} />
    </svg>
  );
}

function number(value) {
  return Number(value ?? 0).toLocaleString("en-US");
}

export default function RedeemLinksTable({ links = [], copiedUuid, onCopy, onHistory, onEdit, onArchive }) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-white/5">
      <div className="overflow-x-auto scrollbar-admin">
        <table className="w-full min-w-[1540px]">
          <thead>
            <tr className="text-left" style={{ backgroundImage: "linear-gradient(180deg, #141828 0%, #333333 99.75%)" }}>
              {[
                "Name", "Station", "Reward", "Amount", "Quantity", "Redeemed", "Remaining",
                "Start Date", "End Date", "Status", "Share Link", "Action",
              ].map((label) => (
                <th key={label} className={`px-4 py-4 text-[14px] font-semibold tracking-[-0.5px] text-[#fbeed2] ${label === "Action" ? "text-right" : ""}`}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {links.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-6 py-12 text-center text-[13px] text-white/50">
                  No redeem links yet. Click &quot;Add Redeem Link&quot; to create the first campaign.
                </td>
              </tr>
            ) : links.map((link) => {
              const status = getRedeemLinkStatus(link.unavailable_reason);
              const copied = copiedUuid === link.uuid;
              return (
                <tr key={link.uuid} className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02]">
                  <td className="max-w-[220px] px-4 py-5 text-[12px] text-white"><span className="block truncate" title={link.name}>{link.name || "-"}</span></td>
                  <td className="px-4 py-5 text-[12px] text-white">{link.station || "-"}</td>
                  <td className="px-4 py-5 text-[12px] text-white">{link.reward_type || "-"}</td>
                  <td className="px-4 py-5 text-[12px] text-white">{number(link.amount)}</td>
                  <td className="px-4 py-5 text-[12px] text-white">{number(link.quantity)}</td>
                  <td className="px-4 py-5 text-[12px] text-white">{number(link.redeemed_count)}</td>
                  <td className="px-4 py-5 text-[12px] text-white">{number(link.remaining)}</td>
                  <td className="px-4 py-5 text-[12px] text-white">{link.start_date || "-"}</td>
                  <td className="px-4 py-5 text-[12px] text-white">{link.end_date || "-"}</td>
                  <td className="px-4 py-5"><StatusBadge tone={status.tone}>{status.label}</StatusBadge></td>
                  <td className="px-4 py-5">
                    <button
                      type="button"
                      onClick={() => onCopy?.(link)}
                      className={`inline-flex min-w-[104px] items-center justify-center gap-1.5 rounded-[8px] border px-3 py-2 text-[12px] font-medium transition-all duration-200 ${copied ? "scale-[1.03] border-emerald-300 text-emerald-200" : "border-[#f2cb7a] text-[#eaad2c] hover:bg-white/5"}`}
                      aria-label={`Copy share link for ${link.name}`}
                    >
                      <ActionIcon type={copied ? "check" : "copy"} />
                      {copied ? "Copied" : "Copy Link"}
                    </button>
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <button type="button" onClick={() => onHistory?.(link)} className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#f2cb7a] px-3 py-2 text-[12px] font-medium text-[#eaad2c] hover:bg-white/5">
                        <ActionIcon type="history" /> Details / History
                      </button>
                      <button type="button" onClick={() => onEdit?.(link)} className="inline-flex items-center gap-1.5 rounded-[8px] border-2 border-[#f2cb7a] px-3 py-2 text-[12px] font-medium text-[#141828] hover:opacity-90" style={{ backgroundImage: GOLD_BG }}>
                        <ActionIcon type="edit" /> Edit
                      </button>
                      <button type="button" onClick={() => onArchive?.(link)} className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#f2cb7a] px-3 py-2 text-[12px] font-medium text-[#eaad2c] hover:opacity-90" style={{ backgroundImage: DARK_BG }}>
                        <ActionIcon type="archive" /> Archive
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
