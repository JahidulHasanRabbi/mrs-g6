"use client";

// /admin/rpg/mystery-box — Mystery box items (full CRUD + archive).
// The probability banner mirrors GET /avatar/mystery-box-items/probability-total/:
// all active item probabilities should sum to exactly 1; items at 0 are shown
// to members but never drawn.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pagination } from "../../../components/admin/members/DataTable";
import ConfirmDialog from "../../../components/admin/ui/ConfirmDialog";
import { useToast } from "../../../components/admin/ui/Toast";
import {
  archiveMysteryBoxItem,
  getMysteryBoxItems,
  getMysteryBoxProbabilityTotal,
} from "../../../api/adminApi";
import {
  MYSTERY_BOX_REWARD_TYPE_LABELS,
  MYSTERY_BOX_REWARD_TYPE_OPTIONS,
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
  { label: "Reward" },
  { label: "Type" },
  { label: "Probability" },
  { label: "Value" },
  { label: "Stock" },
  { label: "Action", align: "right", width: 227 },
];

const FILTER_OPTIONS = [{ value: 0, label: "All Types" }, ...MYSTERY_BOX_REWARD_TYPE_OPTIONS];

// Human summary of the reward payload per type.
function valueLabel(item) {
  switch (item.reward_type) {
    case 1:
      return `${Number(item.token_amount ?? 0).toLocaleString("en-US")} Tokens`;
    case 2:
      return `${Number(item.battle_point_amount ?? 0).toLocaleString("en-US")} BP`;
    case 3:
      return `RM ${item.min_withdraw ?? 0} – RM ${item.max_withdraw ?? 0}`;
    case 4:
      return "1 Equipment (boss reward slot)";
    case 5:
      return `Level Up ×${Number(item.level_up_count ?? 0)}`;
    case 6:
      return "Gold Bar";
    default:
      return "-";
  }
}

function ProbabilityBanner({ summary }) {
  if (!summary) return null;
  const pct = (Number(summary.total ?? 0) * 100).toFixed(2);
  return (
    <div
      className={`mb-2 flex flex-wrap items-center justify-between gap-2 rounded-[8px] border px-4 py-2 text-[13px] ${
        summary.is_valid
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
          : "border-amber-500/40 bg-amber-500/10 text-amber-200"
      }`}
    >
      <span>
        Active probability total: <strong>{pct}%</strong>
      </span>
      <span>{summary.is_valid ? "Valid — probabilities sum to 100%" : "Invalid — active probabilities must sum to exactly 100%"}</span>
    </div>
  );
}

export default function MysteryBoxItemsPage() {
  const router = useRouter();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState(0);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [archiving, setArchiving] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const loadSummary = () => {
    getMysteryBoxProbabilityTotal()
      .then(setSummary)
      .catch(() => setSummary(null));
  };

  const load = () => {
    setLoading(true);
    const params = { page, page_size: PAGE_SIZE };
    if (typeFilter) params.reward_type = typeFilter;
    getMysteryBoxItems(params)
      .then((data) => {
        const rows = data.results ?? data ?? [];
        setItems(rows);
        setTotal(data.count ?? rows.length);
      })
      .catch((err) => {
        setItems([]);
        setTotal(0);
        toast.error("Failed to load mystery box items", { description: apiErrorMessage(err, "Please try again.") });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, typeFilter]);

  useEffect(() => {
    loadSummary();
  }, []);

  const confirmArchive = async () => {
    if (!archiveTarget?.uuid) return;
    setArchiving(true);
    try {
      await archiveMysteryBoxItem(archiveTarget.uuid);
      toast.success("Mystery box item archived");
      setArchiveTarget(null);
      load();
      // Archiving an active item changes the probability total.
      loadSummary();
    } catch (err) {
      toast.error("Failed to archive item", { description: apiErrorMessage(err, "Please try again.") });
    } finally {
      setArchiving(false);
    }
  };

  return (
    <Card>
      <CardHeader title="Mystery Box Items">
        <div className="w-44">
          <Select
            value={typeFilter}
            onChange={(v) => {
              setPage(1);
              setTypeFilter(v);
            }}
            options={FILTER_OPTIONS}
          />
        </div>
        <ActionButton
          icon={<MaskIcon src={ICONS.gift} />}
          variant="filled"
          onClick={() => router.push("/admin/rpg/mystery-box/add")}
        >
          Add Item
        </ActionButton>
      </CardHeader>

      <div className="px-6 pb-2">
        <ProbabilityBanner summary={summary} />
      </div>

      <div className="px-2 pb-2">
        <TableShell minWidth={1000}>
          <Thead columns={COLUMNS} />
          <tbody>
            {loading ? (
              <EmptyRow colSpan={COLUMNS.length}>Loading mystery box items...</EmptyRow>
            ) : items.length === 0 ? (
              <EmptyRow colSpan={COLUMNS.length}>No mystery box items yet. Click "Add Item" to create one.</EmptyRow>
            ) : (
              items.map((item) => (
                <tr key={item.uuid} className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02]">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[4px] bg-white/5">
                        {item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.image} alt={item.reward_name} className="h-full w-full object-cover" />
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e9af41" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="9" cy="9" r="1.5" fill="#e9af41" />
                            <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span className="text-[12px] font-semibold text-white">{item.reward_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[12px] text-white">
                    {MYSTERY_BOX_REWARD_TYPE_LABELS[item.reward_type] ?? item.reward_type}
                  </td>
                  <td className="px-6 py-4 text-[12px] text-white">{(Number(item.probability ?? 0) * 100).toFixed(2)}%</td>
                  <td className="px-6 py-4 text-[12px] text-white">{valueLabel(item)}</td>
                  <td className="px-6 py-4 text-[12px] text-white">
                    {item.unlimited ? "Unlimited" : Number(item.quantity ?? 0).toLocaleString("en-US")}
                  </td>
                  <td className="px-6 py-4">
                    <RowActions
                      onEdit={() => router.push(`/admin/rpg/mystery-box/add?uuid=${item.uuid}`)}
                      onArchive={() => setArchiveTarget(item)}
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
        title="Archive mystery box item?"
        message={archiveTarget ? `Archive "${archiveTarget.reward_name}"? It will stop dropping from mystery boxes and the probability total will change.` : ""}
        confirmLabel="Archive"
        tone="destructive"
        loading={archiving}
        onConfirm={confirmArchive}
        onCancel={() => setArchiveTarget(null)}
      />
    </Card>
  );
}
