"use client";

// Boss list card (Figma 2642:3280): framed illustration, name / type / HP, the
// reward plaque, HP bar with remaining %, availability dot and ATTACK.

import { useRpgSkin } from "../rpg/rpgSkin";
import { fmt, BOSS_THUMB_ASPECT } from "./constants";
import { useFrameInk, BossPortrait, GoldText, HpBar, RewardBadge, WarButton, WarCard } from "./primitives";

export default function BossCard({ boss, onAttack }) {
  const skin = useRpgSkin();
  const ink = useFrameInk();
  const available = boss.status === "active";
  const statusText = boss.status === "defeated" ? "Boss defeated" : boss.status === "upcoming" ? "Coming soon" : available ? "Boss room available!" : "Boss room closed";

  // The thumbnail sets the card's height (38% of the interior, the comp's
  // 137-in-354 share) and the copy column stretches to it. A fixed card height
  // clipped the ATTACK row on the long names.
  return (
    <WarCard hover className="group flex items-stretch gap-[4px] !p-0">
      {/* backdrop="transparent": the thumbnail sits inside the card's own
          frame fill, so the art's transparent margins should show that
          themed texture, not a flat black plate (BossBattle's full-screen
          portrait keeps the black stage backdrop — it isn't inside a card). */}
      <BossPortrait boss={boss} dim={!available} scrim={false} backdrop="transparent" aspect={BOSS_THUMB_ASPECT} zoomOnHover className="w-[38%] shrink-0 self-center" />

      <div className="flex min-w-0 flex-1 flex-col gap-[10px] py-[4px] pl-[8px] pr-[4px]">
        <div className="flex min-h-0 flex-1 flex-col justify-end gap-[12px]">
          <div className="flex items-start gap-[4px]">
            <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
              <GoldText solid className="truncate text-[12px] font-bold uppercase leading-[20px] tracking-[0.12px]">{boss.name}</GoldText>
              {/* Card interiors are textured art, not a flat colour — a bright
                  patch (ep369's green glow) can wash out ink.meta with no
                  shadow, so give every line here the same dark halo. */}
              <span className="text-[10px] leading-[12px]" style={{ color: ink.meta, fontFamily: skin.war.font, textShadow: "0 1px 2px rgba(0,0,0,0.75)" }}>
                {boss.typeLabel}
              </span>
              <span className="text-[11px] font-bold leading-[13px]" style={{ color: ink.value, fontFamily: skin.war.font, textShadow: "0 1px 2px rgba(0,0,0,0.75)" }}>
                HP {fmt(boss.hpMax)}
              </span>
            </div>
            <RewardBadge gem={boss.gem} />
          </div>

          <div className="flex items-center gap-[8px]">
            <HpBar pct={boss.hpPct} className="min-w-0 max-w-[165px] flex-1" />
            <span className="shrink-0 text-[11px] leading-none tabular-nums" style={{ color: ink.text, fontFamily: skin.war.font, textShadow: "0 1px 2px rgba(0,0,0,0.75)" }}>
              {boss.hpPct}%
            </span>
          </div>
        </div>

        <div className="flex items-center gap-[4px]">
          <div className="flex min-w-0 flex-1 items-center justify-end gap-[2px]">
            <span className="size-[4px] shrink-0 rounded-full" style={{ background: available ? ink.crit : ink.meta }} />
            <span className="truncate text-[8px] leading-[10px]" style={{ color: ink.meta, fontFamily: skin.war.font, textShadow: "0 1px 2px rgba(0,0,0,0.75)" }}>
              {statusText}
            </span>
          </div>
          <WarButton
            variant="attack"
            size="sm"
            className="w-[86px] shrink-0"
            style={{ marginRight: skin.war.attackInset || 0 }}
            onClick={() => onAttack(boss)}
            disabled={!available && boss.status !== "defeated"}
          >
            {boss.status === "defeated" ? "RESULTS" : "ATTACK"}
          </WarButton>
        </div>
      </div>
    </WarCard>
  );
}
