"use client";

// How to Earn (Figma 2623:715): Deposit / Missions / Mini Games rule blocks
// plus the earn tiles.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRpgSkin } from "../../rpg/rpgSkin";
import { DEFAULT_DEPOSIT_AP, DEFAULT_FREE_AP } from "../constants";
import * as warApi from "../bossWarApi";
import { stationDepositUrl, useEarnActions } from "../useEarnActions";
import { EarnApTiles, InfoPlaque, SectionCard, WarButton, WarTitle } from "../primitives";

export default function HowToEarn({ onApUpdate, onNotice }) {
  const skin = useRpgSkin();
  const ink = skin.war.ink;
  const router = useRouter();
  const [rules, setRules] = useState({ deposit: DEFAULT_DEPOSIT_AP, free: DEFAULT_FREE_AP, miniGames: "" });
  const earn = useEarnActions({ onApUpdate, onNotice });

  useEffect(() => {
    let cancelled = false;
    warApi.getEarnRules().then((r) => !cancelled && setRules(r)).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const deposit = () => {
    const url = stationDepositUrl();
    if (url) window.location.assign(url);
    else onNotice?.("DEPOSIT", "Deposit from your station to earn Attack Points.");
  };

  const line = (text) => (
    <p key={text} className="leading-[15px]" style={{ color: ink.text }}>
      {text}
    </p>
  );

  return (
    <div className="flex w-full flex-1 flex-col px-[16px] pb-[8px]">
      <WarTitle>How to Earn</WarTitle>
      <div className="flex flex-col gap-[12px] px-[2px] pt-[8px]">
        <SectionCard label="DEPOSIT" title="Deposit Rewards" action={<WarButton size="sm" className="w-[92px] shrink-0 self-end" onClick={deposit}>DEPOSIT NOW</WarButton>}>
          {rules.deposit.map((d) => line(`RM${d.amount} → ${d.ap} AP`))}
        </SectionCard>
        <SectionCard label="MISSIONS" title="Daily Missions" action={<WarButton size="sm" className="w-[92px] shrink-0 self-end" onClick={() => router.push("/missions")}>GO</WarButton>}>
          {rules.free.map((f) => line(`${f.label} → ${f.ap} AP`))}
        </SectionCard>
        <SectionCard label="MINI GAMES" title="Mini Games" action={<WarButton size="sm" className="w-[92px] shrink-0 self-end" onClick={() => router.push("/spin")}>PLAY</WarButton>}>
          {line(rules.miniGames || "Play eligible MRS mini games to earn Attack Points.")}
        </SectionCard>
        <InfoPlaque title="How to Earn Attack Points" className="mt-[14px]">
          <EarnApTiles tiles={earn.tiles} onAction={earn.onAction} busyId={earn.busyId} />
        </InfoPlaque>
      </div>
    </div>
  );
}
