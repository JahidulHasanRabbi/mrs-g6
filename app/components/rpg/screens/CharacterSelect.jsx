"use client";

// Hero creation gate (Figma 2087:722 male / 2090:2352 female). Shown until
// the member creates a hero; unlike the in-game screens it keeps the global
// MRS FooterNav so players can still hop back to the rest of the app.

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FooterNav } from "../../footer";
import RpgTopBar from "../RpgTopBar";
import { RPG_COLORS, RPG_FONTS, RPG_GRADIENTS, POWER_PER_LEVEL, MAX_LEVEL, EQUIP_SLOTS } from "../constants";
import { RPG_IMAGES } from "../rpgAssets";
import { Panel, StatRow, GoldCta } from "../primitives";

const GENDERS = ["male", "female"];

export default function CharacterSelect({ onCreate, onInfoClick, onMenuClick, error }) {
  const [gender, setGender] = useState("male");
  const [busy, setBusy] = useState(false);

  const handleStart = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await onCreate(gender);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden" style={{ background: "#07130d" }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: `url(${RPG_IMAGES.bg})`, backgroundSize: "cover", backgroundPosition: "top center" }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(40% 22% at 88% 22%, rgba(167,139,250,0.2) 0%, rgba(167,139,250,0) 70%), radial-gradient(45% 25% at 10% 88%, rgba(47,230,200,0.16) 0%, rgba(47,230,200,0) 70%)",
        }}
      />

      <RpgTopBar onInfoClick={onInfoClick} onMenuClick={onMenuClick} />

      <div className="relative z-10 flex w-full flex-1 flex-col items-center px-[24px] pb-[140px] pt-[80px]">
        <h1
          className="text-center text-[26px] font-bold tracking-[4px]"
          style={{
            color: RPG_COLORS.text,
            fontFamily: RPG_FONTS.display,
            textShadow: "0 0 24px rgba(124,77,255,0.8)",
          }}
        >
          CHOOSE YOUR HERO
        </h1>
        <p className="mt-[6px] text-center text-[13px]" style={{ color: RPG_COLORS.textDim, fontFamily: RPG_FONTS.display }}>
          Your journey across the planets begins
        </p>

        {/* Male / Female toggle */}
        <div className="mt-[22px] flex items-stretch justify-center gap-[10px]">
          {GENDERS.map((g) => {
            const active = g === gender;
            return (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className="rounded-[12px] border px-[31px] py-[11px] text-[13px] tracking-[2px] uppercase active:scale-95 transition-transform"
                style={
                  active
                    ? {
                        background: RPG_GRADIENTS.maleToggle,
                        borderColor: RPG_COLORS.cyan,
                        color: RPG_COLORS.cyanSoft,
                        fontFamily: RPG_FONTS.display,
                        fontWeight: 700,
                        boxShadow: "0 0 18px rgba(47,230,200,0.3)",
                      }
                    : {
                        background: "rgba(255,255,255,0.04)",
                        borderColor: RPG_COLORS.violetBorder,
                        color: "#6e5fa8",
                        fontFamily: RPG_FONTS.display,
                        fontWeight: 600,
                      }
                }
              >
                {g}
              </button>
            );
          })}
        </div>

        {/* Hero art — crossfade + gentle idle float */}
        <div className="mt-[10px] flex h-[272px] items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.img
              key={gender}
              src={RPG_IMAGES.hero[gender].front}
              alt={`${gender} hero`}
              className="h-[260px] w-auto"
              initial={{ opacity: 0, x: gender === "male" ? -24 : 24 }}
              animate={{ opacity: 1, x: 0, y: [0, -6, 0] }}
              exit={{ opacity: 0, x: gender === "male" ? 24 : -24 }}
              transition={{
                opacity: { duration: 0.25 },
                x: { duration: 0.25 },
                y: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
              }}
            />
          </AnimatePresence>
        </div>

        {/* Stats card */}
        <Panel className="mt-[8px] flex flex-col gap-[10px]">
          <StatRow label="Starting Level" value="Lv.1" />
          <StatRow label="Base Power" value={POWER_PER_LEVEL.toLocaleString("en-GB")} valueColor={RPG_COLORS.cyan} />
          <StatRow label="Equipment Slots" value={String(EQUIP_SLOTS.length)} />
          <StatRow label="Max Level" value={`Lv.${MAX_LEVEL}`} valueColor={RPG_COLORS.gold} />
        </Panel>

        {error ? (
          <p className="mt-[10px] text-center text-[12px]" style={{ color: RPG_COLORS.red, fontFamily: RPG_FONTS.display }}>
            {error}
          </p>
        ) : null}

        <div className="mt-[20px] w-full">
          <GoldCta onClick={handleStart} disabled={busy}>
            {busy ? "STARTING..." : "START JOURNEY"}
          </GoldCta>
        </div>
      </div>

      <FooterNav />
    </div>
  );
}
