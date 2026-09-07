"use client";

// How to Earn (Figma 2623:715): Deposit / Missions / Mini Games rule blocks
// plus the earn tiles.

import { useRouter } from "next/navigation";
import { stationDepositUrl, useEarnActions } from "../useEarnActions";
import { EarnApTiles, InfoPlaque, SectionCard, WarButton, WarScreen, useFrameInk } from "../primitives";

export default function HowToEarn({ onApUpdate, onNotice }) {
  const ink = useFrameInk();
  const router = useRouter();
  // One fetch for the whole screen — the tiles and these rule blocks are the
  // same payload.
  const earn = useEarnActions({ onApUpdate, onNotice });

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
    <WarScreen title="How to Earn">
        <SectionCard label="DEPOSIT" title="Deposit Rewards" action={<WarButton size="sm" className="w-[92px] shrink-0" onClick={deposit}>DEPOSIT NOW</WarButton>}>
          {earn.deposit.map((d) => line(`RM${d.amount} → ${d.ap} AP`))}
        </SectionCard>
        <SectionCard label="MISSIONS" title="Daily Missions" action={<WarButton size="sm" className="w-[92px] shrink-0" onClick={() => router.push("/missions")}>GO</WarButton>}>
          {earn.free.map((f) => line(`${f.label} → ${f.ap} AP`))}
        </SectionCard>
        <SectionCard label="MINI GAMES" title="Mini Games" action={<WarButton size="sm" className="w-[92px] shrink-0" onClick={() => router.push("/spin")}>PLAY</WarButton>}>
          {line(earn.miniGames || "Play eligible MRS mini games to earn Attack Points.")}
        </SectionCard>
      <InfoPlaque title="How to Earn Attack Points" className="mt-[14px]">
        <EarnApTiles tiles={earn.tiles} onAction={earn.onAction} busyId={earn.busyId} />
      </InfoPlaque>
    </WarScreen>
  );
}
