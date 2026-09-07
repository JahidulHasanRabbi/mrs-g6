"use client";

// Player Results (Figma 2623:453): rank + headline reward, Rank / Boss /
// Participation tabs, and the "How Rewards are Calculated" sections.

import { useState } from "react";
import { useRpgSkin } from "../../rpg/rpgSkin";
import { fmt, ORDINAL, REWARD_CALC_SECTIONS } from "../constants";
import * as warApi from "../bossWarApi";
import { WAR_IMAGES } from "../warAssets";
import { useFrameInk, useWarResource, GemIcon, GoldText, SectionCard, WarCard, WarScreen, WarState, WarTabs } from "../primitives";

const TABS = [
  { id: "rank", label: "Rank" },
  { id: "boss", label: "Boss" },
  { id: "participation", label: "Participation" },
];

export default function Results({ bossId }) {
  const skin = useRpgSkin();
  const ink = useFrameInk();
  const [tab, setTab] = useState("rank");
  const { data, error } = useWarResource(() => warApi.getResults(bossId), [bossId], "Could not load results.");

  const shown = data ? data.rewards[tab] || data.reward : null;

  return (
    <WarScreen title="Results">
      <WarState data={data} error={error} />
      {data ? (
          <>
            <WarCard className="relative flex flex-col items-center gap-[6px] !px-[20px] text-center">
              {WAR_IMAGES.ui.crown ? (
                <img src={WAR_IMAGES.ui.crown} alt="" aria-hidden className="pointer-events-none absolute -top-[16px] left-1/2 h-[34px] -translate-x-1/2 object-contain" />
              ) : null}
              <span className="text-[10px]" style={{ color: ink.meta, fontFamily: skin.war.font }}>Your Rank</span>
              <GoldText solid className="text-[26px] font-bold leading-[28px]">
                {data.rank ? `#${data.rank}` : "—"}
                {data.rank ? <span className="text-[12px]"> {ORDINAL(data.rank)}</span> : null}
              </GoldText>
              <span className="text-[10px]" style={{ color: ink.meta, fontFamily: skin.war.font }}>
                Damage {fmt(data.damage)}
              </span>
              <div className="mt-[6px] flex size-[64px] items-center justify-center rounded-[10px] border" style={{ background: skin.c.inset, borderColor: skin.c.edgeSoft }}>
                <GemIcon gem={shown?.gem || data.reward.gem} size={44} />
              </div>
              <GoldText solid className="mt-[4px] text-[16px] font-bold">{shown?.name || data.reward.name}</GoldText>
              <span className="text-[10px]" style={{ color: ink.meta, fontFamily: skin.war.font }}>
                {data.calculating ? "Rewards are currently being calculated" : shown?.desc || data.reward.desc}
              </span>
            </WarCard>

            <WarTabs tabs={TABS} active={tab} onChange={setTab} />

            <GoldText className="pt-[4px] text-center text-[11px] font-bold">How Rewards are Calculated</GoldText>
            {REWARD_CALC_SECTIONS.map((s) => (
              <SectionCard key={s.id} title={s.title}>
                {s.body}
              </SectionCard>
            ))}
        </>
      ) : null}
    </WarScreen>
  );
}
