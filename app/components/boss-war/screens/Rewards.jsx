"use client";

// Rewards (Figma 2623:1342): Rank / Boss / Event tiers, View History, and
// the "How to Earn Rewards" plaque.

import { useState } from "react";
import { useRpgSkin } from "../../rpg/rpgSkin";
import { HOW_TO_EARN_NOTE, WAR_VIEWS } from "../constants";
import * as warApi from "../bossWarApi";
import { useFrameInk, useWarResource, GemIcon, GoldText, InfoPlaque, WarButton, WarCard, WarScreen, WarState, WarTabs } from "../primitives";

const TABS = [
  { id: "rank", label: "Rank" },
  { id: "boss", label: "Boss" },
  { id: "event", label: "Event" },
];

function TierRow({ tier }) {
  const skin = useRpgSkin();
  const ink = useFrameInk();
  return (
    <WarCard spec={skin.war.row} className="flex h-[58px] items-center gap-[12px] !py-0">
      <span className="w-[54px] shrink-0 text-center text-[11px] font-bold" style={{ color: ink.text, fontFamily: skin.war.font }}>
        {tier.rank}
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <GoldText solid className="truncate text-[13px] font-bold">{tier.name}</GoldText>
        <span className="truncate text-[9px]" style={{ color: ink.meta, fontFamily: skin.war.font }}>{tier.desc}</span>
      </div>
      <div className="flex h-[44px] w-[40px] shrink-0 flex-col items-center justify-center rounded-[6px] border" style={{ background: skin.c.inset, borderColor: skin.c.edgeSoft }}>
        <GemIcon gem={tier.gem} size={26} />
        <span className="text-[8px]" style={{ color: ink.meta, fontFamily: skin.war.font }}>Reward</span>
      </div>
    </WarCard>
  );
}

export default function Rewards({ onNavigate }) {
  const [tab, setTab] = useState("rank");
  const { data, error } = useWarResource(warApi.getRewards, [], "Could not load rewards.");

  const tiers = data?.[tab] || [];

  return (
    <WarScreen title="Rewards" gap={8}>
      <WarTabs tabs={TABS} active={tab} onChange={setTab} className="mb-[4px]" />
      <WarState data={data} error={error} />
      {tiers.map((t) => (
        <TierRow key={t.id} tier={t} />
      ))}
      <WarButton className="mx-auto mt-[10px] w-[190px]" onClick={() => onNavigate(WAR_VIEWS.HISTORY)}>View History</WarButton>
      <InfoPlaque title="How to Earn Rewards" lines={HOW_TO_EARN_NOTE} className="mt-[14px]" />
    </WarScreen>
  );
}
