"use client";

// Damage leaderboard (Figma 2623:919 / :1126): Total Damage lists the top
// rows; My Ranking windows the rows around the member with "(You)" marked.

import { useMemo, useState } from "react";
import { useRpgSkin } from "../../rpg/rpgSkin";
import { fmt } from "../constants";
import * as warApi from "../bossWarApi";
import { shortenMaskedName } from "../../leaderboard-new/format";
import { useFrameInk, useWarResource, GemIcon, GoldText, RankBadge, WarCard, WarScreen, WarState, WarTabs } from "../primitives";

const TABS = [
  { id: "total", label: "Total Damage" },
  { id: "me", label: "My Ranking" },
];
const TOP_GEM = { 1: "legendary", 2: "epic", 3: "premium" };
const DEFAULT_AVATAR = "/assets/profile/profile-avatar.webp";

function Row({ row }) {
  const skin = useRpgSkin();
  const ink = useFrameInk(skin.war.row);
  return (
    <WarCard spec={skin.war.row} className="flex items-center gap-[8px] !py-[5px]">
      <RankBadge rank={row.rank} />
      {/* Portrait slot. `avatar` is whatever the API returns; until it does,
          every row shows the shared placeholder the profile page uses. */}
      <img
        src={row.avatar || DEFAULT_AVATAR}
        alt=""
        aria-hidden
        className="size-[34px] shrink-0 rounded-[6px] border object-cover"
        style={{ borderColor: skin.c.edgeSoft, background: skin.c.inset }}
        draggable={false}
      />
      <div className="flex min-w-0 flex-1 items-center gap-[6px]">
        <GoldText solid className="truncate text-[12px] font-bold">
          {shortenMaskedName(row.name)}
          {row.isMe ? " (You)" : ""}
        </GoldText>
        {TOP_GEM[row.rank] ? <GemIcon gem={TOP_GEM[row.rank]} size={14} /> : null}
      </div>
      <div className="flex flex-col items-end">
        <span className="text-[9px] leading-[11px]" style={{ color: ink.meta, fontFamily: skin.war.font }}>Total Damage</span>
        <span className="text-[12px] font-bold leading-[14px]" style={{ color: ink.value, fontFamily: skin.war.font }}>{fmt(row.damage)}</span>
      </div>
    </WarCard>
  );
}

export default function WarLeaderboard({ bossId }) {
  const [tab, setTab] = useState("total");
  const { data, error } = useWarResource(
    () => warApi.getLeaderboard(bossId, { limit: 50 }),
    [bossId],
    "Could not load the leaderboard.",
  );

  // The comp pins the member's own row below the top ten so they can always
  // see where they stand without switching tabs.
  const pinned = useMemo(() => {
    if (!data?.me || tab !== "total") return null;
    if (data.rows.slice(0, 10).some((r) => r.isMe)) return null;
    return { ...data.me, isMe: true };
  }, [data, tab]);

  const rows = useMemo(() => {
    if (!data) return [];
    if (tab === "total") return data.rows.slice(0, 10);
    if (!data.me) return [];
    const idx = data.rows.findIndex((r) => r.isMe);
    if (idx === -1) return [{ ...data.me, isMe: true }];
    return data.rows.slice(Math.max(0, idx - 9), idx + 1);
  }, [data, tab]);

  return (
    <WarScreen title="Leaderboard" gap={8}>
      <WarTabs tabs={TABS} active={tab} onChange={setTab} className="mb-[4px]" />
      <WarState
        data={data}
        error={error}
        empty={data && !rows.length ? (tab === "me" ? "Attack the boss to enter the ranking." : "No damage recorded yet.") : null}
      />
      {rows.map((r) => (
        <Row key={r.rank} row={r} />
      ))}
      {pinned ? <Row key={`me-${pinned.rank}`} row={pinned} /> : null}
    </WarScreen>
  );
}
