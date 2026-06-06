"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Pagination } from "../../components/admin/members/DataTable";
import MissionsTable from "../../components/admin/mission-game/MissionsTable";

const GOLD_BG = "linear-gradient(101deg, #dc9d16 1%, #f2cb7a 98%)";

const PAGE_SIZE = 7;

const SEED_MISSIONS = [
  { id: "1", name: "BMW Car",           category: 34053,  description: "Elite",    missionType: "Elite",    resetType: "Elite",    condition: "Elite",    reward: "Elite",    limitControl: "Elite"   },
  { id: "2", name: "Porsche 911",       category: 101200, description: "Super",    missionType: "Super",    resetType: "Super",    condition: "Super",    reward: "Super",    limitControl: "Super"   },
  { id: "3", name: "Ford Mustang",      category: 27155,  description: "Sport",    missionType: "Sport",    resetType: "Sport",    condition: "Sport",    reward: "Sport",    limitControl: "Sport"   },
  { id: "4", name: "Tesla Model 3",     category: 39990,  description: "Premium",  missionType: "Premium",  resetType: "Premium",  condition: "Premium",  reward: "Premium",  limitControl: "Premium" },
  { id: "5", name: "Audi Sedan",        category: 42500,  description: "Luxury",   missionType: "Luxury",   resetType: "Luxury",   condition: "Luxury",   reward: "Luxury",   limitControl: "Luxury"  },
  { id: "6", name: "Mercedes-Benz C-Class", category: 41600, description: "Advanced", missionType: "Advanced", resetType: "Advanced", condition: "Advanced", reward: "Advanced", limitControl: "Advanced" },
  { id: "7", name: "BMW Car",           category: 34053,  description: "Elite",    missionType: "Elite",    resetType: "Elite",    condition: "Elite",    reward: "Elite",    limitControl: "Elite"   },
];

// Figma `icon-park-outline:level` — downloaded to public/assets/admin/icons.
// Rendered via CSS mask so it tints with the button's text color.
function LevelIcon() {
  return (
    <span
      aria-hidden="true"
      className="block h-4 w-4 shrink-0 bg-current"
      style={{
        WebkitMaskImage: "url(/assets/admin/icons/icon-park-outline-level.svg)",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        WebkitMaskSize: "contain",
        maskImage: "url(/assets/admin/icons/icon-park-outline-level.svg)",
        maskRepeat: "no-repeat",
        maskPosition: "center",
        maskSize: "contain",
      }}
    />
  );
}

export default function MissionGamePage() {
  const router = useRouter();
  const [missions] = useState(SEED_MISSIONS);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(missions.length / PAGE_SIZE));
  const pageMissions = useMemo(
    () => missions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [missions, page],
  );

  return (
    <div className="rounded-[16px] bg-[#041502] shadow-[0_-4px_12px_-2px_#dea220]">
      <div className="flex flex-wrap items-center justify-between gap-4 p-6">
        <h2
          className="text-[26px] font-bold tracking-[-1px] text-white"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Missions
        </h2>
        <button
          type="button"
          onClick={() => router.push("/admin/mission-game/add")}
          className="inline-flex items-center gap-1.5 rounded-[8px] border-2 border-[#f2cb7a] px-6 py-2 text-[14px] font-semibold tracking-[-0.5px] text-[#141828] transition-opacity hover:opacity-90"
          style={{ backgroundImage: GOLD_BG }}
        >
          <LevelIcon />
          Add Mission
        </button>
      </div>

      <div className="px-2 pb-2">
        <MissionsTable
          missions={pageMissions}
          onEdit={(m) => router.push(`/admin/mission-game/add?id=${m.id}`)}
          onArchive={() => {}}
        />
      </div>

      <div className="flex items-center justify-between px-6 py-3">
        <p className="text-[10px] text-white/80">
          Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, missions.length)} of {missions.length} Results
        </p>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
