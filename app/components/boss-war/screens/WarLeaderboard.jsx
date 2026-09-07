"use client";

// Damage leaderboard (Figma 2623:919 / :1126): Total Damage lists the top
// rows; My Ranking windows the rows around the member with "(You)" marked.

import { useEffect, useMemo, useState } from "react";
import { useRpgSkin } from "../../rpg/rpgSkin";
import { fmt } from "../constants";
import * as warApi from "../bossWarApi";
import { shortenMaskedName } from "../../leaderboard-new/format";
import { GemIcon, GoldText, RankBadge, StateLine, WarCard, WarTabs, WarTitle } from "../primitives";

const TABS = [
  { id: "total", label: "Total Damage" },
  { id: "me", label: "My Ranking" },
];
const TOP_GEM = { 1: "legendary", 2: "epic", 3: "premium" };

function Row({ row }) {
  const skin = useRpgSkin();
  const ink = skin.war.ink;
  return (
    <WarCard spec={skin.war.row} className="flex h-[52px] items-center gap-[10px] !py-0">
      <RankBadge rank={row.rank} />
      <div className="flex min-w-0 flex-1 items-center gap-[6px]">
        <GoldText className="truncate text-[12px] font-bold">
          {shortenMaskedName(row.name)}
          {row.isMe ? " (You)" : ""}
        </GoldText>
        {TOP_GEM[row.rank] ? <GemIcon gem={TOP_GEM[row.rank]} size={14} /> : null}
      </div>
      <div className="flex flex-col items-end">
        <span className="text-[7px] leading-[9px]" style={{ color: ink.meta, fontFamily: skin.war.font }}>Total Damage</span>
        <span className="text-[12px] font-bold leading-[14px]" style={{ color: ink.value, fontFamily: skin.war.font }}>{fmt(row.damage)}</span>
      </div>
    </WarCard>
  );
}

export default function WarLeaderboard({ bossId }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("total");

  useEffect(() => {
    let cancelled = false;
    warApi
      .getLeaderboard(bossId, { limit: 50 })
      .then((d) => !cancelled && setData(d))
      .catch((err) => !cancelled && setError(err?.message || "Could not load the leaderboard."));
    return () => {
      cancelled = true;
    };
  }, [bossId]);

  const rows = useMemo(() => {
    if (!data) return [];
    if (tab === "total") return data.rows.slice(0, 10);
    if (!data.me) return [];
    const idx = data.rows.findIndex((r) => r.isMe);
    if (idx === -1) return [{ ...data.me, isMe: true }];
    return data.rows.slice(Math.max(0, idx - 9), idx + 1);
  }, [data, tab]);

  return (
    <div className="flex w-full flex-1 flex-col px-[16px] pb-[8px]">
      <WarTitle>Leaderboard</WarTitle>
      <div className="flex flex-col gap-[8px] px-[2px] pt-[8px]">
        <WarTabs tabs={TABS} active={tab} onChange={setTab} className="mb-[4px]" />
        {error ? <StateLine>{error}</StateLine> : null}
        {!data && !error ? <StateLine>LOADING...</StateLine> : null}
        {data && !rows.length ? <StateLine>{tab === "me" ? "Attack the boss to enter the ranking." : "No damage recorded yet."}</StateLine> : null}
        {rows.map((r) => (
          <Row key={r.rank} row={r} />
        ))}
      </div>
    </div>
  );
}
