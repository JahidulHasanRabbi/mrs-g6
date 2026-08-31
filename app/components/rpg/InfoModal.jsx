"use client";

// How-to-play modal opened from the top bar info icon. Every number comes
// from the live game settings carried on `profile` (/avatar/settings/), so the
// rules always match what the back office has configured.

import { RPG_COLORS, RPG_FONTS, EXTRA_ATTEMPT_COST, DISCARD_COST, POWER_PER_LEVEL, EQUIP_POWER, MAX_LEVEL } from "./constants";
import { useRpgSkin } from "./rpgSkin";
import { GoldCta } from "./primitives";

const fmt = (n) => Number(n).toLocaleString("en-GB");

function rulesFor(profile) {
  const perLevel = profile?.powerPerLevel ?? POWER_PER_LEVEL;
  const multiplier = profile?.bpPerLevelMultiplier ?? 100;
  const capacity = profile?.backpackCapacity ?? 100;
  const extraCost = profile?.extraAttemptCost ?? EXTRA_ATTEMPT_COST;
  const discardCost = profile?.discardCost ?? DISCARD_COST;
  const maxLevel = profile?.maxLevel ?? MAX_LEVEL;
  return [
    ["LEVEL UP", `Spend Battle Points (BP) to level your avatar — BP cost = current level × ${multiplier}. Each level grants +${fmt(perLevel)} Power (max Lv.${maxLevel}).`],
    ["EQUIP GEAR", `Weapons, helmets, armor and boots each add Power. Spare gear lives in your backpack (${fmt(capacity)} slots).`],
    ["CHALLENGE BOSSES", `Each planet boss needs a minimum Power. Roll the dice — every pip is an attack. Free daily attempts are shared across bosses; extras cost ${extraCost} Tokens.`],
    ["MYSTERY BOXES", "Every boss kill drops a Mystery Box with Tokens, BP, free credit, rare gear or instant level-ups."],
    ["EARN MORE", `Missions pay Battle Points. Discarding gear costs ${discardCost} Tokens per item.`],
  ];
}

export default function InfoModal({ open, onClose, profile }) {
  const skin = useRpgSkin();
  if (!open) return null;

  const RULES = rulesFor(profile);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-6 backdrop-blur-sm" onClick={onClose}>
      <div
        className="max-h-[78vh] w-full max-w-[350px] overflow-y-auto rounded-[18px] border p-[22px]"
        style={{
          background: skin.modal.bg,
          borderColor: skin.modal.border,
          boxShadow: skin.modal.shadow,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-center text-[18px] font-bold tracking-[3px]" style={{ color: skin.c.text, fontFamily: RPG_FONTS.display }}>
          HOW TO PLAY
        </p>
        <div className="mt-[14px] flex flex-col gap-[12px]">
          {RULES.map(([title, body]) => (
            <div key={title}>
              <p className="text-[11px] font-bold tracking-[2px]" style={{ color: skin.c.accent, fontFamily: RPG_FONTS.display }}>
                {title}
              </p>
              <p className="mt-[3px] text-[12px] leading-[17px]" style={{ color: skin.c.textDim, fontFamily: RPG_FONTS.display }}>
                {body}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-[18px]">
          <GoldCta onClick={onClose} glow={false} className="!p-[12px] !text-[13px]">
            GOT IT
          </GoldCta>
        </div>
      </div>
    </div>
  );
}
