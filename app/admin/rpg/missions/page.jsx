"use client";

// /admin/rpg/missions — Avatar missions list (full CRUD + archive).
// Creating a mission enrols all journey-started members in the background,
// so creation lives on its own page (penalty-kick add-reward pattern):
// /admin/rpg/missions/add, with ?uuid= for edit.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pagination } from "../../../components/admin/members/DataTable";
import ConfirmDialog from "../../../components/admin/ui/ConfirmDialog";
import { useToast } from "../../../components/admin/ui/Toast";
import { archiveAvatarMission, getAvatarMissions } from "../../../api/adminApi";
import {
  AVATAR_MISSION_ACTION_LABELS,
  AVATAR_MISSION_CATEGORY_LABELS,
  AVATAR_MISSION_CATEGORY_OPTIONS,
} from "../../../config/avatarOptions";
import {
  ActionButton,
  Card,
  CardHeader,
  EmptyRow,
  ICONS,
  MaskIcon,
  ResultsFooter,
  RowActions,
  Select,
  TableShell,
  Thead,
  apiErrorMessage,
} from "../../../components/admin/ui/GameUI";

const PAGE_SIZE = 7;

const COLUMNS = [
  { label: "Mission Name" },
  { label: "Category" },
  { label: "Condition" },
  { label: "Target" },
  { label: "Reward" },
  { label: "Start Date" },
  { label: "End Date" },
  { label: "Action", align: "right", width: 227 },
];

const FILTER_OPTIONS = [{ value: 0, label: "All Categories" }, ...AVATAR_MISSION_CATEGORY_OPTIONS];

function rewardLabel(m) {
  const parts = [];
  const bp = Number(m.reward_battle_point_quantity ?? 0);
  const tokens = Number(m.reward_token_quantity ?? 0);
  if (bp > 0) parts.push(`${bp.toLocaleString("en-US")} BP`);
  if (tokens > 0) parts.push(`${tokens.toLocaleString("en-US")} Tokens`);
  return parts.length ? parts.join(" + ") : "-";
}

export default function AvatarMissionsPage() {
  const router = useRouter();
  const toast = useToast();
  const [missions, setMissions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState(0);
  const [loading, setLoading] = useState(true);
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [archiving, setArchiving] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const load = () => {
    setLoading(true);
    const params = { page, page_size: PAGE_SIZE };
    if (categoryFilter) params.category = categoryFilter;
    getAvatarMissions(params)
      .then((data) => {
        const rows = data.results ?? data ?? [];
        setMissions(rows);
        setTotal(data.count ?? rows.length);
      })
      .catch((err) => {
        setMissions([]);
        setTotal(0);
        toast.error("Failed to load avatar missions", { description: apiErrorMessage(err, "Please try again.") });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, categoryFilter]);

  const confirmArchive = async () => {
    if (!archiveTarget?.uuid) return;
    setArchiving(true);
    try {
      await archiveAvatarMission(archiveTarget.uuid);
      toast.success("Mission archived");
      setArchiveTarget(null);
      // Refetch — archiving can empty the current page, and the count changes.
      load();
    } catch (err) {
      toast.error("Failed to archive mission", { description: apiErrorMessage(err, "Please try again.") });
    } finally {
      setArchiving(false);
    }
  };

  return (
    <Card>
      <CardHeader title="Avatar Missions">
        <div className="w-44">
          <Select
            value={categoryFilter}
            onChange={(v) => {
              setPage(1);
              setCategoryFilter(v);
            }}
            options={FILTER_OPTIONS}
          />
        </div>
        <ActionButton
          icon={<MaskIcon src={ICONS.level} />}
          variant="filled"
          onClick={() => router.push("/admin/rpg/missions/add")}
        >
          Add Mission
        </ActionButton>
      </CardHeader>

      <div className="px-2 pb-2">
        <TableShell minWidth={1100}>
          <Thead columns={COLUMNS} />
          <tbody>
            {loading ? (
              <EmptyRow colSpan={COLUMNS.length}>Loading avatar missions...</EmptyRow>
            ) : missions.length === 0 ? (
              <EmptyRow colSpan={COLUMNS.length}>No avatar missions yet. Click "Add Mission" to create one.</EmptyRow>
            ) : (
              missions.map((m) => (
                <tr key={m.uuid} className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02]">
                  <td className="px-6 py-5 text-[12px] font-semibold text-white">{m.mission_name}</td>
                  <td className="px-6 py-5 text-[12px] text-white">{AVATAR_MISSION_CATEGORY_LABELS[m.category] ?? m.category}</td>
                  <td className="px-6 py-5 text-[12px] text-white">{AVATAR_MISSION_ACTION_LABELS[m.condition_action] ?? m.condition_action}</td>
                  <td className="px-6 py-5 text-[12px] text-white">{m.accumulate_target}</td>
                  <td className="px-6 py-5 text-[12px] text-white">{rewardLabel(m)}</td>
                  <td className="px-6 py-5 text-[12px] text-white">{m.start_date || "-"}</td>
                  <td className="px-6 py-5 text-[12px] text-white">{m.end_date || "-"}</td>
                  <td className="px-6 py-5">
                    <RowActions
                      onEdit={() => router.push(`/admin/rpg/missions/add?uuid=${m.uuid}`)}
                      onArchive={() => setArchiveTarget(m)}
                    />
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
        open={Boolean(archiveTarget)}
        title="Archive mission?"
        message={archiveTarget ? `Archive "${archiveTarget.mission_name}"? Members will no longer see this mission.` : ""}
        confirmLabel="Archive"
        tone="destructive"
        loading={archiving}
        onConfirm={confirmArchive}
        onCancel={() => setArchiveTarget(null)}
      />
    </Card>
  );
}
