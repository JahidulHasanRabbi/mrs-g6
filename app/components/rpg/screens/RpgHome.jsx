"use client";

// RPG Home (Figma 2026:3034): POWER headline, the hero with an idle float,
// and the four equipment slot chips. Tapping POWER (or the chips) deep-links
// into the Avatar Level / Hero Item screens.

import { motion } from "framer-motion";
import { RPG_COLORS, RPG_FONTS, RPG_VIEWS, EQUIP_SLOTS } from "../constants";
import { heroPoseFor } from "../rpgAssets";
import { SlotChip } from "../primitives";

export default function RpgHome({ profile, equipment, onNavigate }) {
  const gender = profile?.gender || "male";
  // Hero visually wears whatever's equipped (falls back to the base pose).
  const heroPose = heroPoseFor(gender, equipment);
  return (
    <div className="flex w-full flex-1 flex-col items-center px-[18px]">
      <button
        type="button"
        className="mt-[30px] flex w-full flex-col items-center active:scale-[0.99] transition-transform"
        onClick={() => onNavigate(RPG_VIEWS.LEVEL)}
        aria-label="View avatar level"
      >
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
      </button>

      <motion.img
        key={heroPose}
        src={heroPose}
        alt="Your hero"
        className="mt-[4px] h-[min(345px,42vh)] w-auto"
        initial={{ opacity: 0.4 }}
        animate={{ opacity: 1, y: [0, -8, 0] }}
        transition={{
          opacity: { duration: 0.25 },
          y: { duration: 3.6, repeat: Infinity, ease: "easeInOut" },
        }}
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
