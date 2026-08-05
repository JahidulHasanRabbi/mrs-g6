"use client";

import ArchiveButton from "./ArchiveButton";

const HEADER_BG = "linear-gradient(180deg, #141828 0%, #333333 99.75%)";

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("en-GB");
}

export default function ExclusionsTable({ rows = [], onArchive }) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-white/5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead>
            <tr style={{ backgroundImage: HEADER_BG }} className="text-left">
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">Member ID</th>
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">Full Name</th>
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">Phone Number</th>
              <th className="px-5 py-4 text-[13px] font-semibold text-[#fbeed2]">Excluded On</th>
              <th className="px-5 py-4 text-right text-[13px] font-semibold text-[#fbeed2]">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-[13px] text-white/50">
                  No excluded members.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.uuid} className="border-b border-white/5 align-middle last:border-b-0 hover:bg-white/[0.02]">
                  <td className="px-5 py-5 text-[12px] text-white">{row.member_id}</td>
                  <td className="px-5 py-5 text-[12px] text-white">{row.full_name || "-"}</td>
                  <td className="px-5 py-5 text-[12px] text-white">{row.phone_number || "-"}</td>
                  <td className="px-5 py-5 text-[12px] text-white">{formatDate(row.created)}</td>
                  <td className="px-5 py-5">
                    <ArchiveButton onClick={() => onArchive(row)} />
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
