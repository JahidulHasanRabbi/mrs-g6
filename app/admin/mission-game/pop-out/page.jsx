"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pagination } from "../../../components/admin/members/DataTable";
import ConfirmDialog from "../../../components/admin/ui/ConfirmDialog";
import { useToast } from "../../../components/admin/ui/Toast";
import { archiveMissionPromotion, listMissionPromotions } from "../../../api/adminApi";
import { Card, CardHeader, GOLD_BG, ResultsFooter, TableShell, apiErrorMessage, formatDateDMY } from "../../../components/admin/ui/GameUI";
import { STICKY_ACTION, STICKY_ACTION_CELL, TABLE_HEAD_BG } from "../../../components/admin/mission-game/formControls";
import {
  POPUP_CLAIM_LIMIT_LABELS,
  POPUP_DISPLAY_FREQUENCY_LABELS,
  POPUP_REWARD_CATEGORY_LABELS,
  POPUP_WEEKDAYS,
} from "../../../config/missionPopupOptions";

const PAGE_SIZE = 7;

function formatDays(days) {
  if (!Array.isArray(days) || days.length === 0 || days.length === 7) return "Every day";
  return days
    .slice()
    .sort((a, b) => a - b)
    .map((d) => POPUP_WEEKDAYS.find((w) => w.value === d)?.short ?? d)
    .join(", ");
}

function normalize(row) {
  return {
    // The promotion's own uuid identifies the row, but every write (archive
    // included) is keyed by its mission's uuid — there is no standalone
    // promotion endpoint.
    uuid: row.uuid,
    missionUuid: row.mission_uuid,
    enabled: !!row.enabled,
    missionName: row.mission_name || "-",
    schedule: `${formatDateDMY(row.start_date) || "-"} - ${formatDateDMY(row.end_date) || "-"}`,
    days: formatDays(row.days_of_week),
    time: row.daily_start_time && row.daily_end_time ? `${row.daily_start_time} - ${row.daily_end_time}` : "All day",
    reward: `${Number(row.reward_amount ?? 0).toLocaleString("en-US")} ${
      POPUP_REWARD_CATEGORY_LABELS[row.reward_type] ?? ""
    }`.trim(),
    frequency: POPUP_DISPLAY_FREQUENCY_LABELS[row.display_frequency_type] ?? "-",
    claimLimit: POPUP_CLAIM_LIMIT_LABELS[row.claim_limit_type] ?? "-",
  };
}

export default function PopOutSettingsPage() {
  const router = useRouter();
  const toast = useToast();
  const [allRows, setAllRows] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [confirming, setConfirming] = useState(null);

  const total = allRows.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rows = allRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // There is no single "list promotions" endpoint — a promotion only exists
  // reachable by its mission's uuid — so listMissionPromotions() checks every
  // mission and this page paginates the result itself.
  const load = () => {
    setLoading(true);
    setLoadError("");
    listMissionPromotions()
      .then((list) => setAllRows(list.map(normalize)))
      .catch((err) => {
        setAllRows([]);
        setLoadError(apiErrorMessage(err, "Failed to load promotions."));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleArchive = async () => {
    const target = confirming;
    setConfirming(null);
    if (!target?.missionUuid) return;
    try {
      await archiveMissionPromotion(target.missionUuid);
      toast.success("Pop-out promotion archived");
      load();
    } catch (err) {
      toast.error("Failed to archive", { description: apiErrorMessage(err) });
    }
  };

  return (
    <Card>
      <CardHeader title="Pop-out Promotions">
          <button
            type="button"
            onClick={() => router.push("/admin/mission-game")}
            className="rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold tracking-[-0.5px] text-[#fbeed2] transition-colors hover:bg-white/5"
          >
            Back to Missions
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/mission-game/pop-out/add")}
            className="rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold tracking-[-0.5px] text-[#141828] transition-opacity hover:opacity-90"
            style={{ backgroundImage: GOLD_BG }}
          >
            Add Pop-out
          </button>
      </CardHeader>

      {loadError && (
        <p className="mx-6 mb-4 rounded-[8px] border border-red-500/40 bg-red-500/10 px-4 py-3 text-[13px] text-red-200">
          {loadError}
        </p>
      )}

      <div className="px-2 pb-2">
        <TableShell minWidth={1040}>
              <thead>
                <tr className="text-left" style={{ backgroundImage: TABLE_HEAD_BG }}>
                  {["Status", "Mission", "Date Range", "Day(s)", "Time", "Reward", "Display Frequency", "Claim Limit"].map((h) => (
                    <th key={h} className="px-5 py-4 text-[13px] font-semibold tracking-[-0.5px] text-[#fbeed2]">{h}</th>
                  ))}
                  <th
                    className={`${STICKY_ACTION} px-5 py-4 text-right text-[13px] font-semibold tracking-[-0.5px] text-[#fbeed2]`}
                    style={{ backgroundImage: TABLE_HEAD_BG }}
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} className="px-5 py-10 text-center text-[13px] text-white/50">Loading promotions...</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={9} className="px-5 py-10 text-center text-[13px] text-white/50">No pop-out promotions yet. Click &quot;Add Pop-out&quot; to create one.</td></tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.uuid} className="group border-b border-white/5 last:border-b-0 hover:bg-white/[0.02]">
                      <td className="px-5 py-5">
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${r.enabled ? "bg-[#06b800]/20 text-[#84ebb4]" : "bg-white/10 text-white/60"}`}>
                          {r.enabled ? "Enabled" : "Disabled"}
                        </span>
                      </td>
                      <td className="px-5 py-5 text-[12px] text-white">{r.missionName}</td>
                      <td className="px-5 py-5 text-[12px] text-white">{r.schedule}</td>
                      <td className="px-5 py-5 text-[12px] text-white">{r.days}</td>
                      <td className="px-5 py-5 text-[12px] text-white">{r.time}</td>
                      <td className="px-5 py-5 text-[12px] text-white">{r.reward}</td>
                      <td className="px-5 py-5 text-[12px] text-white">{r.frequency}</td>
                      <td className="px-5 py-5 text-[12px] text-white">{r.claimLimit}</td>
                      <td className={`${STICKY_ACTION} ${STICKY_ACTION_CELL} px-5 py-5 text-right`}>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => router.push(`/admin/mission-game/pop-out/add?uuid=${r.missionUuid}`)}
                            className="rounded-[8px] border border-[#f2cb7a] px-3 py-1.5 text-[12px] text-[#fbeed2] hover:bg-white/5"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirming(r)}
                            className="rounded-[8px] border border-[#eaad2c]/60 px-3 py-1.5 text-[12px] text-[#eaad2c] hover:bg-white/5"
                          >
                            Archive
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
        </TableShell>
      </div>

      <ResultsFooter page={page} pageSize={PAGE_SIZE} total={total}>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </ResultsFooter>

      <ConfirmDialog
        open={!!confirming}
        title="Archive pop-out promotion"
        message={`Archive the pop-out promotion for "${confirming?.missionName ?? ""}"?`}
        confirmLabel="Archive"
        onCancel={() => setConfirming(null)}
        onConfirm={handleArchive}
      />
    </Card>
  );
}
