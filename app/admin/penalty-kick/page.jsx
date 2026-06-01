"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Pagination } from "../../components/admin/members/DataTable";
import RewardsTable from "../../components/admin/penalty-kick/RewardsTable";
import KeeperDifficultyModal from "../../components/admin/penalty-kick/KeeperDifficultyModal";
import GameStatusModal from "../../components/admin/penalty-kick/GameStatusModal";
import CostSettingModal from "../../components/admin/penalty-kick/CostSettingModal";
import KickSequenceModal from "../../components/admin/penalty-kick/KickSequenceModal";
import {
  saveKeeperDifficultyMock,
  saveCostMock,
  saveGameStatusMock,
  saveKickSequenceMock,
} from "../../components/penalty-kick/mockApi";

const GOLD_BG = "linear-gradient(101deg, #dc9d16 1%, #f2cb7a 98%)";

const PAGE_SIZE = 7;

const SEED_REWARDS = [
  { id: "1", name: "BMW Car",         quantity: 34053, itemType: "Free credit" },
  { id: "2", name: "Audi Sedan",      quantity: 28470, itemType: "Min withdraw" },
  { id: "3", name: "Ford Pickup",     quantity: 32540, itemType: "Max withdraw" },
  { id: "4", name: "BMW Car",         quantity: 34053, itemType: "Prize" },
  { id: "5", name: "Mercedes SUV",    quantity: 45237, itemType: "Prize" },
  { id: "6", name: "Toyota Hatchback",quantity: 23890, itemType: "Worldcup Leaderboard Score" },
  { id: "7", name: "Tesla Model 3",   quantity: 39000, itemType: "Token" },
];

// Use CSS mask so the downloaded Iconify SVG tints with `currentColor`.
// Source SVGs already use `stroke="currentColor"` but rendering via mask
// guarantees consistent sizing and color across button variants.
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

const ICON = {
  keeper: "/assets/admin/icons/pepicons-pencil-hands-clapping.svg",
  coins: "/assets/admin/icons/iconoir-coins.svg",
  check: "/assets/admin/icons/lsicon-batch-check-outline.svg",
  soccer: "/assets/admin/icons/lucide-lab-soccer-ball.svg",
  level: "/assets/admin/icons/icon-park-outline-level.svg",
};

function ActionButton({ children, icon, variant = "outline", onClick }) {
  if (variant === "filled") {
    return (
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1.5 rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold tracking-[-0.5px] text-[#141828] transition-opacity hover:opacity-90"
        style={{ backgroundImage: GOLD_BG }}
      >
        {icon}
        {children}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold tracking-[-0.5px] text-[#fbeed2] transition-colors hover:bg-white/5"
    >
      {icon}
      {children}
    </button>
  );
}

export default function PenaltyKickPage() {
  const router = useRouter();
  const [rewards] = useState(SEED_REWARDS);
  const [page, setPage] = useState(1);

  const [keeperOpen, setKeeperOpen] = useState(false);
  const [costOpen, setCostOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [sequenceOpen, setSequenceOpen] = useState(false);

  const [keeperData, setKeeperData] = useState({ easy: 75, medium: 50, hard: 15, selected: "easy" });
  const [costData, setCostData] = useState({ cost: 10.00 });
  const [statusData, setStatusData] = useState({ gameplay: true, maintenance: true });

  const totalPages = Math.max(1, Math.ceil(rewards.length / PAGE_SIZE));
  const pageRewards = useMemo(
    () => rewards.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [rewards, page],
  );

  return (
    <div
      className="rounded-[16px] bg-[#041502] shadow-[0_-4px_12px_-2px_#dea220]"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 p-6">
        <h2
          className="text-[26px] font-bold tracking-[-1px] text-white"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Rewards
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <ActionButton icon={<MaskIcon src={ICON.keeper} />} onClick={() => setKeeperOpen(true)}>
            Keeper Difficulty
          </ActionButton>
          <ActionButton icon={<MaskIcon src={ICON.coins} />} onClick={() => setCostOpen(true)}>
            Cost Setting
          </ActionButton>
          <ActionButton icon={<MaskIcon src={ICON.check} />} onClick={() => setStatusOpen(true)}>
            Game Status
          </ActionButton>
          <ActionButton icon={<MaskIcon src={ICON.soccer} />} onClick={() => setSequenceOpen(true)}>
            Kick Sequence
          </ActionButton>
          <ActionButton
            icon={<MaskIcon src={ICON.level} />}
            variant="filled"
            onClick={() => router.push("/admin/penalty-kick/add-reward")}
          >
            Add Reward
          </ActionButton>
        </div>
      </div>

      <div className="px-2 pb-2">
        <RewardsTable
          rewards={pageRewards}
          onEdit={(r) => router.push(`/admin/penalty-kick/add-reward?id=${r.id}`)}
          onArchive={(r) => console.log("archive", r)}
        />
      </div>

      <div className="flex items-center justify-between px-6 py-3">
        <p className="text-[10px] text-white/80">
          Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, rewards.length)} of {rewards.length} Results
        </p>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <KeeperDifficultyModal
        open={keeperOpen}
        initial={keeperData}
        onClose={() => setKeeperOpen(false)}
        onSave={async (payload) => {
          setKeeperData(payload);
          await saveKeeperDifficultyMock(payload);
        }}
      />
      <CostSettingModal
        open={costOpen}
        initial={costData}
        onClose={() => setCostOpen(false)}
        onSave={async (payload) => {
          setCostData(payload);
          await saveCostMock(payload);
        }}
      />
      <GameStatusModal
        open={statusOpen}
        initial={statusData}
        onClose={() => setStatusOpen(false)}
        onSave={async (payload) => {
          setStatusData(payload);
          await saveGameStatusMock(payload);
        }}
      />
      <KickSequenceModal
        open={sequenceOpen}
        rewards={rewards.map((r) => ({ id: r.id, name: r.name }))}
        onClose={() => setSequenceOpen(false)}
        onSave={async (payload) => {
          await saveKickSequenceMock(payload);
        }}
      />
    </div>
  );
}
