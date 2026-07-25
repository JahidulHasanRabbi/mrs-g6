"use client";

// RPG Home (Figma 2026:3034): POWER headline, the hero with an idle float,
// and the four equipment slot chips. Tapping POWER (or the chips) deep-links
// into the Avatar Level / Hero Item screens.

import { RPG_COLORS, RPG_FONTS, RPG_GRADIENTS, RPG_VIEWS, EQUIP_SLOTS } from "../constants";
import { heroPoseFor } from "../rpgAssets";
import { SlotChip, HeroShowcase } from "../primitives";

export default function RpgHome({ profile, equipment, onNavigate }) {
  const gender = profile?.gender || "male";
  // Hero visually wears whatever's equipped (falls back to the base pose).
  const heroPose = heroPoseFor(gender, equipment);
  const equippedCount = equipment
    ? EQUIP_SLOTS.filter((slot) => equipment.slots?.[slot]).length
    : profile?.equippedCount ?? 0;
  return (
    <div className="flex w-full flex-1 flex-col items-center px-[18px]">
      <div className="mt-[30px] flex w-full flex-col items-center">
        <span
          className="text-[18px] font-bold tracking-[6px]"
          style={{ color: RPG_COLORS.textDim, fontFamily: RPG_FONTS.display }}
        >
          — POWER —
        </span>
        <span
          className="text-[56px] font-bold leading-[62px]"
          style={{
            color: RPG_COLORS.gold,
            fontFamily: RPG_FONTS.number,
            textShadow: "0 0 30px rgba(255,201,77,0.45)",
          }}
        >
          {(profile?.power ?? 0).toLocaleString("en-GB")}
        </span>
        <button
          type="button"
          onClick={() => onNavigate(RPG_VIEWS.LEVEL)}
          className="mt-[8px] rounded-[7px] border px-[18px] py-[7px] text-[11px] font-bold tracking-[1.5px] transition-transform active:scale-95"
          style={{
            background: profile?.canLevelUp ? RPG_GRADIENTS.cta : "rgba(68,31,126,0.72)",
            borderColor: profile?.canLevelUp ? RPG_COLORS.gold : RPG_COLORS.violetBorderStrong,
            color: profile?.canLevelUp ? RPG_COLORS.darkText : RPG_COLORS.text,
            fontFamily: RPG_FONTS.display,
            boxShadow: profile?.canLevelUp
              ? "0 0 18px rgba(255,201,77,0.45)"
              : "0 0 14px rgba(124,77,255,0.28)",
          }}
          aria-label="Level up avatar"
        >
          LEVEL UP AVATAR ↑
        </button>
      </div>

      <HeroShowcase
        pose={heroPose}
        equippedCount={equippedCount}
        heightClass="h-[min(345px,42vh)]"
        className={`mt-[4px] w-full ${equipment?.slots?.weapon ? "-translate-x-[12px]" : ""}`}
      />

      <div className="mt-[14px] flex w-full items-stretch justify-center gap-[10px]">
        {EQUIP_SLOTS.map((slot) => (
          <SlotChip
            key={slot}
            slot={slot}
            item={equipment?.slots?.[slot] || null}
            onClick={() => onNavigate(RPG_VIEWS.ITEMS)}
          />
        ))}
      </div>
    </div>
  );
}
