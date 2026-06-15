"use client";

import { useEffect, useMemo, useState } from "react";
import { Pagination } from "../../components/admin/members/DataTable";
import RewardsTable from "../../components/admin/smash-egg/RewardsTable";
import SmashEggRewardModal from "../../components/admin/smash-egg/SmashEggRewardModal";
import SmashSequenceModal from "../../components/admin/smash-egg/SmashSequenceModal";
import ConfirmDialog from "../../components/admin/ui/ConfirmDialog";
import { useToast } from "../../components/admin/ui/Toast";

const GOLD_BG = "linear-gradient(101deg, #dc9d16 1%, #f2cb7a 98%)";
const PAGE_SIZE = 7;

const EGG_ICON = "/assets/admin/sidebar/icons/material-symbols-light-egg-outline-sharp.svg";
const LEVEL_ICON = "/assets/admin/icons/icon-park-outline-level.svg";

// Seed data — matches the sample rows in Figma 1727:4046 so the page renders
// faithfully out of the box. The Smash Egg feature has no backend yet, so all
// mutations operate on local state.
const SEED_REWARDS = [
  { id: "se-1", name: "BMW Car", quantity: 34053, itemType: "Free credit", unlimited: false, image: null },
  { id: "se-2", name: "Audi Sedan", quantity: 28470, itemType: "Min withdraw", unlimited: false, image: null },
  { id: "se-3", name: "Ford Pickup", quantity: 32540, itemType: "Max withdraw", unlimited: false, image: null },
  { id: "se-4", name: "BMW Car", quantity: 34053, itemType: "Prize", unlimited: false, image: null },
  { id: "se-5", name: "Mercedes SUV", quantity: 45237, itemType: "Prize", unlimited: false, image: null },
  { id: "se-6", name: "Toyota Hatchback", quantity: 23890, itemType: "Worldcup Leaderboard Score", unlimited: false, image: null },
  { id: "se-7", name: "Tesla Model 3", quantity: 39000, itemType: "Token", unlimited: false, image: null },
];

function MaskIcon({ src, size = 16 }) {
  return (
    <span
      aria-hidden="true"
      className="block shrink-0 bg-current"
      style={{
        width: size,
        height: size,
        WebkitMaskImage: `url(${src})`,
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        WebkitMaskSize: "contain",
        maskImage: `url(${src})`,
        maskRepeat: "no-repeat",
        maskPosition: "center",
        maskSize: "contain",
      }}
    />
  );
}

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `se-new-${idCounter}`;
}

export default function SmashEggPage() {
  const toast = useToast();
  const [rewards, setRewards] = useState(SEED_REWARDS);
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [editTarget, setEditTarget] = useState(null);
  const [sequenceOpen, setSequenceOpen] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState(null);

  const totalPages = Math.max(1, Math.ceil(rewards.length / PAGE_SIZE));
  const pageRewards = useMemo(
    () => rewards.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [rewards, page],
  );

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const openAdd = () => {
    setModalMode("add");
    setEditTarget(null);
    setModalOpen(true);
  };

  const openEdit = (reward) => {
    setModalMode("edit");
    setEditTarget(reward);
    setModalOpen(true);
  };

  const handleSave = (data) => {
    if (modalMode === "edit" && editTarget) {
      setRewards((prev) => prev.map((r) => (r.id === editTarget.id ? { ...r, ...data } : r)));
      toast.success("Reward updated");
    } else {
      setRewards((prev) => [...prev, { id: nextId(), ...data }]);
      toast.success("Reward added");
    }
  };

  const confirmArchive = () => {
    if (!archiveTarget) return;
    setRewards((prev) => prev.filter((r) => r.id !== archiveTarget.id));
    toast.success("Reward archived");
    setArchiveTarget(null);
  };

  const handleSequenceSave = (orderedRewards) => {
    setRewards(orderedRewards);
    setPage(1);
    toast.success("Smash sequence saved");
  };

  return (
    <div className="rounded-[16px] bg-[#041502] shadow-[0_-4px_12px_-2px_#dea220]">
      <div className="flex flex-wrap items-center justify-between gap-4 p-6">
        <h2 className="text-[26px] font-bold text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Rewards
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setSequenceOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold tracking-[-0.5px] text-[#fbeed2] transition-colors hover:bg-white/5"
          >
            <MaskIcon src={EGG_ICON} />
            Smash Sequence
          </button>
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-1.5 rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold tracking-[-0.5px] text-[#141828] transition-opacity hover:opacity-90"
            style={{ backgroundImage: GOLD_BG }}
          >
            <MaskIcon src={LEVEL_ICON} />
            Add Reward
          </button>
        </div>
      </div>

      <div className="px-2 pb-2">
        <RewardsTable rewards={pageRewards} onEdit={openEdit} onArchive={setArchiveTarget} />
      </div>

      <div className="flex items-center justify-between px-6 py-3">
        <p className="text-[10px] text-white/80">
          {rewards.length === 0
            ? "Showing 0 to 0 of 0 Results"
            : `Showing ${(page - 1) * PAGE_SIZE + 1} to ${Math.min(page * PAGE_SIZE, rewards.length)} of ${rewards.length} Results`}
        </p>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <SmashEggRewardModal
        open={modalOpen}
        mode={modalMode}
        initial={editTarget}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />

      <SmashSequenceModal
        open={sequenceOpen}
        rewards={rewards}
        onClose={() => setSequenceOpen(false)}
        onSave={handleSequenceSave}
      />

      <ConfirmDialog
        open={!!archiveTarget}
        title="Archive reward?"
        message={archiveTarget ? `Archive ${archiveTarget.name}? This reward will be removed from the active list.` : ""}
        confirmLabel="Archive"
        tone="destructive"
        onConfirm={confirmArchive}
        onCancel={() => setArchiveTarget(null)}
      />
    </div>
  );
}
