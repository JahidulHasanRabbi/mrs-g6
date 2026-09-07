"use client";

// Boss list card (Figma 2623:560): illustration, name / type / HP, the reward
// gem badge, HP bar with remaining %, availability dot and the ATTACK plaque.

import { useRpgSkin } from "../rpg/rpgSkin";
import { fmt } from "./constants";
import { GemIcon, GoldText, HpBar, WarButton, WarCard } from "./primitives";

export default function BossCard({ boss, onAttack }) {
  const skin = useRpgSkin();
  const ink = skin.war.ink;
  const available = boss.status === "active";
  const statusText = boss.status === "defeated" ? "Boss defeated" : boss.status === "upcoming" ? "Coming soon" : available ? "Boss room available!" : "Boss room closed";

  return (
    <WarCard className="flex h-[154px] items-center gap-[4px] !p-0">
      <div className="relative h-[139px] w-[137px] shrink-0 overflow-hidden rounded-[10px]">
        <img
          src={boss.art}
          alt={boss.name}
          className="absolute inset-0 size-full object-cover"
          style={{ filter: available ? "none" : "grayscale(0.7) brightness(0.7)" }}
          draggable={false}
        />
      </div>

      <div className="flex h-full min-w-0 flex-1 flex-col justify-center gap-[10px] pb-[13px] pl-[8px] pr-[16px] pt-[8px]">
        <div className="flex items-start gap-[4px]">
          <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
            <GoldText className="truncate text-[12px] font-bold uppercase leading-[20px] tracking-[0.12px]">{boss.name}</GoldText>
            <span className="text-[10px]" style={{ color: ink.meta, fontFamily: skin.war.font }}>
              {boss.typeLabel}
            </span>
            <span className="text-[11px] font-bold" style={{ color: ink.value, fontFamily: skin.war.font }}>
              HP {fmt(boss.hpMax)}
            </span>
          </div>
          <div
            className="flex h-[48px] w-[38px] shrink-0 flex-col items-center justify-center gap-[2px] rounded-[6px] border"
            style={{ background: skin.c.inset, borderColor: skin.c.edgeSoft }}
          >
            <GemIcon gem={boss.gem} size={24} />
            <span className="text-[6px] leading-[8px]" style={{ color: ink.meta, fontFamily: skin.war.font }}>
              Reward
            </span>
          </div>
        </div>

        <div className="flex items-center gap-[8px]">
          <HpBar pct={boss.hpPct} className="w-[165px] max-w-full flex-1" />
          <span className="shrink-0 text-[11px]" style={{ color: ink.text, fontFamily: skin.war.font }}>
            {boss.hpPct}%
          </span>
        </div>

        <div className="flex items-center gap-[4px]">
          <div className="flex min-w-0 flex-1 items-center justify-end gap-[3px]">
            <span className="size-[4px] shrink-0 rounded-full" style={{ background: available ? ink.crit : ink.meta }} />
            <span className="truncate text-[8px] leading-[10px]" style={{ color: ink.meta, fontFamily: skin.war.font }}>
              {statusText}
            </span>
          </div>
          <WarButton variant="attack" size="sm" className="w-[86px] shrink-0" onClick={() => onAttack(boss)} disabled={!available && boss.status !== "defeated"}>
            {boss.status === "defeated" ? "RESULTS" : "ATTACK"}
          </WarButton>
        </div>
      </div>
    </WarCard>
  );
}
