"use client";

// How to Earn (Figma 2642:3435 / 2623:715): Deposit / Missions / Mini Games
// rule blocks plus the earn tiles.

import { useRouter } from "next/navigation";
import { useRpgSkin } from "../../rpg/rpgSkin";
import { stationDepositUrl, useEarnActions } from "../useEarnActions";
import { EarnApTiles, GoldText, InfoPlaque, WarButton, WarCard, WarScreen, useFrameInk } from "../primitives";

// The comp dresses these in the CARD frame, not the chevron row — a rule block
// carries five lines and a CTA, and the row frame is sized for one line.
function RuleBlock({ label, title, lines, cta, onClick }) {
  const skin = useRpgSkin();
  const ink = useFrameInk(skin.war.card);
  return (
    <WarCard className="flex items-end justify-between gap-[12px]">
      <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
        <span className="text-[11px] font-bold leading-[13px]" style={{ color: ink.value, fontFamily: skin.war.font }}>
          {label}
        </span>
        <GoldText solid className="text-[12px] font-bold leading-[20px] tracking-[0.12px]">{title}</GoldText>
        <div className="flex flex-col text-[12px] leading-[16px]" style={{ color: ink.meta, fontFamily: skin.war.font }}>
          {lines.map((l) => (
            <p key={l}>{l}</p>
          ))}
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-center gap-[4px]">
        <span className="whitespace-nowrap text-[8px] leading-[10px]" style={{ color: ink.meta, fontFamily: skin.war.font }}>
          Claim Bonus!
        </span>
        <WarButton className="w-40" onClick={onClick}>
          {cta}
        </WarButton>
      </div>
    </WarCard>
  );
}

export default function HowToEarn({ onApUpdate, onNotice }) {
  const router = useRouter();
  // One fetch for the whole screen — the tiles and these rule blocks are the
  // same payload.
  const earn = useEarnActions({ onApUpdate, onNotice });

  const deposit = () => {
    const url = stationDepositUrl();
    if (url) window.location.assign(url);
    else onNotice?.("DEPOSIT", "Deposit from your station to earn Attack Points.");
  };

  return (
    <WarScreen title="How to Earn">
      <RuleBlock
        label="DEPOSIT"
        title="Deposit Rewards"
        lines={earn.deposit.map((d) => `RM${d.amount} → ${d.ap} AP`)}
        cta="DEPOSIT NOW"
        onClick={deposit}
      />
      <RuleBlock
        label="MISSIONS"
        title="Daily Missions"
        lines={earn.free.map((f) => `${f.label} → ${f.ap} AP`)}
        cta="GO"
        onClick={() => router.push("/missions")}
      />
      <RuleBlock
        label="MINI GAMES"
        title="Mini Games"
        lines={[earn.miniGames || "Play eligible MRS mini games to earn Attack Points."]}
        cta="PLAY"
        onClick={() => router.push("/spin")}
      />
      <InfoPlaque title="How to Earn Attack Points" className="mt-[14px]">
        <EarnApTiles tiles={earn.tiles} onAction={earn.onAction} busyId={earn.busyId} />
      </InfoPlaque>
    </WarScreen>
  );
}
