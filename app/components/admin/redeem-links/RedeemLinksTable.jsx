"use client";

import { useEffect, useRef, useState } from "react";
import StatusBadge from "../ui/StatusBadge";
import { formatRedeemLinkDateTime, getRedeemLinkStatus } from "./redeemLinkUtils.mjs";

const GOLD_BG = "linear-gradient(96deg, #dc9d16 1%, #f2cb7a 98%)";
const DARK_BG = "linear-gradient(178deg, #141828 0%, #333333 99.75%)";
const HEADER_BG = "linear-gradient(180deg, #141828 0%, #333333 99.75%)";

// Share Link + Action are pinned to the right edge so every button stays
// reachable without scrolling the full 1400px table — same treatment as the
// member alert list. Sticky cells need an opaque background of their own so the
// columns sliding underneath don't show through; only the leftmost pinned
// column carries the shadow, otherwise the seam between the two would show.
//
// Share Link pins to the *left* of Action, so its offset is Action's rendered
// width. That width depends on font metrics, so it is measured at runtime
// rather than hardcoded — a wrong guess would overlap the two columns.
const STICKY_ACTION = "sticky right-0 z-[2]";
const STICKY_SHARE = "sticky z-[1] shadow-[-12px_0_12px_-8px_rgba(0,0,0,0.55)]";

// Buttons follow the member alert convention: dark gradient fill, thin gold
// border, gold label, brightness lift on hover. Kept compact — three of them
// plus Copy Link sit in the pinned right edge, which eats table width.
const BTN_BASE = "flex items-center justify-center gap-1 rounded-[6px] border border-[#f2cb7a] px-2.5 py-1.5 text-[11px] font-medium leading-[16px] transition hover:brightness-110";

// The row's own hover tint cannot show through an opaque pinned cell, so each
// pinned cell repaints it via an overlay driven by the row's `group` class.
const CELL_PINNED = "relative bg-[#041502] after:pointer-events-none after:absolute after:inset-0 group-hover:after:bg-white/[0.02]";

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
    <svg width="12" height="12" className="shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <Icon type={type} />
    </svg>
  );
}

function number(value) {
  return Number(value ?? 0).toLocaleString("en-US");
}

export default function RedeemLinksTable({ links = [], copiedUuid, onCopy, onHistory, onEdit, onArchive }) {
  const actionHeaderRef = useRef(null);
  const [actionWidth, setActionWidth] = useState(0);

  // Track the Action column's width so Share Link can pin flush against it.
  // ResizeObserver keeps the offset correct when the viewport, font, or row
  // content changes; before the first measurement Share Link simply scrolls.
  useEffect(() => {
    const node = actionHeaderRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      // Border box, so the cell's own px-4 padding is already included.
      setActionWidth(node.getBoundingClientRect().width);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="overflow-hidden rounded-[12px] border border-white/5">
      <div className="overflow-x-auto scrollbar-admin">
        <table className="w-full min-w-[1180px]">
          <thead>
            <tr className="text-left" style={{ backgroundImage: "linear-gradient(180deg, #141828 0%, #333333 99.75%)" }}>
              {[
                "Name", "Station", "Reward", "Amount", "Quantity", "Redeemed", "Remaining",
                "Recurrence", "Start Date", "End Date", "Status", "Share Link", "Action",
              ].map((label) => {
                const pinned = label === "Action" ? STICKY_ACTION : label === "Share Link" ? STICKY_SHARE : "";
                return (
                  <th
                    key={label}
                    ref={label === "Action" ? actionHeaderRef : undefined}
                    className={`px-4 py-4 text-[14px] font-semibold tracking-[-0.5px] text-[#fbeed2] ${label === "Action" ? "text-right" : ""} ${pinned}`}
                    style={pinned ? { backgroundImage: HEADER_BG, right: label === "Share Link" ? actionWidth : 0 } : undefined}
                  >
                    {label}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {links.length === 0 ? (
              <tr>
                <td colSpan={13} className="px-6 py-12 text-center text-[13px] text-white/50">
                  No redeem links yet. Click &quot;Add Redeem Link&quot; to create the first campaign.
                </td>
              </tr>
            ) : links.map((link) => {
              const status = getRedeemLinkStatus(link.unavailable_reason);
              const copied = copiedUuid === link.uuid;
              return (
                <tr key={link.uuid} className="group border-b border-white/5 last:border-b-0 hover:bg-white/[0.02]">
                  <td className="max-w-[220px] px-4 py-5 text-[12px] text-white"><span className="block truncate" title={link.name}>{link.name || "-"}</span></td>
                  <td className="px-4 py-5 text-[12px] text-white">{link.station || "-"}</td>
                  <td className="px-4 py-5 text-[12px] text-white">{link.reward_type || "-"}</td>
                  <td className="px-4 py-5 text-[12px] text-white">{number(link.amount)}</td>
                  <td className="px-4 py-5 text-[12px] text-white">{number(link.quantity)}</td>
                  <td className="px-4 py-5 text-[12px] text-white">{number(link.redeemed_count)}</td>
                  <td className="px-4 py-5 text-[12px] text-white">{number(link.remaining)}</td>
                  <td className="whitespace-nowrap px-4 py-5 text-[12px] text-white">
                    {link.recurrence || "-"}
                    {/* Only repeating campaigns can carry the repeat flag, and
                        it changes what the quota means, so surface it here. */}
                    {link.redeem_per_recurrence ? (
                      <span className="ml-1.5 rounded-[4px] border border-[#f2cb7a]/40 px-1.5 py-0.5 text-[10px] text-[#eaad2c]" title="Members can redeem again each period">
                        repeat
                      </span>
                    ) : null}
                  </td>
                  <td className="whitespace-nowrap px-4 py-5 text-[12px] tabular-nums text-white">{formatRedeemLinkDateTime(link.start_date)}</td>
                  <td className="whitespace-nowrap px-4 py-5 text-[12px] tabular-nums text-white">{formatRedeemLinkDateTime(link.end_date)}</td>
                  <td className="px-4 py-5"><StatusBadge tone={status.tone}>{status.label}</StatusBadge></td>
                  <td className={`${CELL_PINNED} px-4 py-5 ${STICKY_SHARE}`} style={{ right: actionWidth }}>
                    <button
                      type="button"
                      onClick={() => onCopy?.(link)}
                      className={`${BTN_BASE} relative z-[1] min-w-[92px] whitespace-nowrap ${copied ? "border-emerald-300 text-emerald-200" : "text-[#eaad2c]"}`}
                      style={{ backgroundImage: DARK_BG }}
                      aria-label={`Copy share link for ${link.name}`}
                    >
                      <ActionIcon type={copied ? "check" : "copy"} />
                      {copied ? "Copied" : "Copy Link"}
                    </button>
                  </td>
                  <td className={`${CELL_PINNED} px-4 py-5 ${STICKY_ACTION}`}>
                    <div className="relative z-[1] flex items-center justify-end gap-2">
                      <button type="button" onClick={() => onHistory?.(link)} className={`${BTN_BASE} whitespace-nowrap text-[#eaad2c]`} style={{ backgroundImage: DARK_BG }} title="Details / History">
                        <ActionIcon type="history" /> Details
                      </button>
                      <button type="button" onClick={() => onEdit?.(link)} className={`${BTN_BASE} text-[#141828]`} style={{ backgroundImage: GOLD_BG }}>
                        <ActionIcon type="edit" /> Edit
                      </button>
                      <button type="button" onClick={() => onArchive?.(link)} className={`${BTN_BASE} text-[#eaad2c]`} style={{ backgroundImage: DARK_BG }}>
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
