"use client";

// Rewards (Figma 2623:1342): Rank / Boss / Event tiers, View History, and
// the "How to Earn Rewards" plaque.

import { useState } from "react";
import { useRpgSkin } from "../../rpg/rpgSkin";
import { HOW_TO_EARN_NOTE, WAR_VIEWS } from "../constants";
import * as warApi from "../bossWarApi";
import { useFrameInk, useWarResource, GoldText, InfoPlaque, RewardBadge, WarButton, WarCard, WarScreen, WarState, WarTabs } from "../primitives";

const TABS = [
  { id: "rank", label: "Rank" },
  { id: "boss", label: "Boss" },
  { id: "event", label: "Event" },
];

function TierRow({ tier }) {
  const skin = useRpgSkin();
  const ink = useFrameInk(skin.war.row);
  // No fixed height: the frame's rails eat ~26px, so a 58px row left the 48px
  // reward plaque sitting on top of them.
  return (
    <WarCard spec={skin.war.row} className="flex items-center gap-[12px] !py-[5px]">
      <span className="w-[54px] shrink-0 text-center text-[11px] font-bold" style={{ color: ink.text, fontFamily: skin.war.font }}>
        {tier.rank}
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <GoldText solid className="truncate text-[13px] font-bold">{tier.name}</GoldText>
        <span className="truncate text-[9px]" style={{ color: ink.meta, fontFamily: skin.war.font }}>{tier.desc}</span>
      </div>
      <RewardBadge gem={tier.gem} />
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
