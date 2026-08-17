"use client";

import { Pagination } from "../members/DataTable";
import ModalShell from "../penalty-kick/ModalShell";
import { formatRedeemLinkDateTime } from "./redeemLinkUtils.mjs";

const PAGE_SIZE = 10;

function SummaryItem({ label, value }) {
  return (
    <div className="rounded-[8px] border border-white/10 bg-white/[0.03] px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-white/40">{label}</p>
      <p className="mt-1 text-[13px] font-medium text-white">{value ?? "-"}</p>
    </div>
  );
}

export { PAGE_SIZE as REDEEM_LINK_HISTORY_PAGE_SIZE };

export default function RedeemLinkHistoryModal({
  open,
  link,
  rows = [],
  loading,
  error,
  page,
  total,
  onPageChange,
  onClose,
}) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, total);

  return (
    <ModalShell
      title="Redeem Link Details / History"
      open={open}
      onClose={onClose}
      showSave={false}
      width="max-w-[1040px] max-h-[90vh] overflow-y-auto scrollbar-admin"
    >
      {link && (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <SummaryItem label="Campaign" value={link.name} />
            <SummaryItem label="Station" value={link.station} />
            <SummaryItem label="Reward" value={`${link.reward_type || "-"} x ${Number(link.amount ?? 0).toLocaleString("en-US")}`} />
            <SummaryItem label="Date Range" value={`${formatRedeemLinkDateTime(link.start_date)} - ${formatRedeemLinkDateTime(link.end_date)}`} />
            <SummaryItem label="Quantity" value={Number(link.quantity ?? 0).toLocaleString("en-US")} />
            <SummaryItem label="Redeemed" value={Number(link.redeemed_count ?? 0).toLocaleString("en-US")} />
            <SummaryItem label="Remaining" value={Number(link.remaining ?? 0).toLocaleString("en-US")} />
            <SummaryItem label="UUID" value={link.uuid} />
          </div>

          <div className="mt-5 overflow-hidden rounded-[12px] border border-white/5">
            <div className="overflow-x-auto scrollbar-admin">
              <table className="w-full min-w-[820px]">
                <thead>
                  <tr className="bg-gradient-to-b from-[#141828] to-[#333333] text-left">
                    {['Member ID', 'Member UUID', 'Full Name', 'Phone Number', 'Redeemed At'].map((label) => (
                      <th key={label} className="px-4 py-3 text-[13px] font-semibold text-[#fbeed2]">{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="px-6 py-10 text-center text-[13px] text-white/50">Loading redemption history...</td></tr>
                  ) : error ? (
                    <tr><td colSpan={5} className="px-6 py-10 text-center text-[13px] text-red-300">{error}</td></tr>
                  ) : rows.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-10 text-center text-[13px] text-white/50">No members have redeemed this link.</td></tr>
                  ) : rows.map((row) => (
                    <tr key={row.uuid || row.id} className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02]">
                      <td className="px-4 py-4 text-[12px] text-white">{row.member_id ?? "-"}</td>
                      <td className="px-4 py-4 text-[12px] text-white">{row.member_uuid || "-"}</td>
                      <td className="px-4 py-4 text-[12px] text-white">{row.full_name || "-"}</td>
                      <td className="px-4 py-4 text-[12px] text-white">{row.phone_number || "-"}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-[12px] tabular-nums text-white">{formatRedeemLinkDateTime(row.created)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <p className="text-[10px] text-white/70">Showing {start} to {end} of {total} Results</p>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />
          </div>
        </>
      )}
    </ModalShell>
  );
}
