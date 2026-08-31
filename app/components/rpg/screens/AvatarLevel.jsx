"use client";

// Avatar Level screen (Figma 2026:3780): big level ring, BP progress to the
// next level, the power-breakdown card, and the LEVEL UP CTA. A successful
// level-up pulses the ring.

import { useState } from "react";
import { motion } from "framer-motion";
import { RPG_COLORS, RPG_FONTS, RPG_GRADIENTS, MAX_LEVEL, POWER_PER_LEVEL, EQUIP_POWER, EQUIP_SLOTS } from "../constants";
import * as rpgApi from "../rpgApi";
import { GoldCta, Panel } from "../primitives";
import { useRpgSkin } from "../rpgSkin";
import NoticeModal from "../NoticeModal";

const fmt = (n) => Number(n).toLocaleString("en-GB");

export default function AvatarLevel({ profile, onProfileUpdate }) {
  const skin = useRpgSkin();
  const pc = skin.cOnPanel;
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const [pulseKey, setPulseKey] = useState(0);

  if (!profile) return null;

  // Every figure is server-authoritative: the level/equipment split comes from
  // battle_power minus the equipped power_bonus sum (see rpgApi.profileView).
  const maxLevel = profile.maxLevel ?? MAX_LEVEL;
  const perLevel = profile.powerPerLevel ?? POWER_PER_LEVEL;
  const slotCount = profile.equipmentSlotCount ?? EQUIP_SLOTS.length;
  const atMax = profile.level >= maxLevel;
  const levelPower = profile.levelPower ?? profile.level * perLevel;
  const equipPower = profile.equipPower ?? 0;
  const maxPower = maxLevel * perLevel + slotCount * EQUIP_POWER;

  const handleLevelUp = async () => {
    if (busy || atMax) return;
    setBusy(true);
    try {
      const p = await rpgApi.levelUp();
      onProfileUpdate(p);
      setPulseKey((k) => k + 1);
    } catch (err) {
      // The API is authoritative about why (not enough BP, max level, game
      // closed) — show its message rather than assuming.
      setNotice({
        title: "CANNOT LEVEL UP",
        message: err?.message || "Earn Battle Points from missions and mystery boxes.",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex w-full flex-1 flex-col items-center px-[24px]">
      <h2
        className="pt-[24px] text-center text-[22px] font-bold tracking-[5px]"
        style={{ color: skin.c.title, fontFamily: RPG_FONTS.display, textShadow: skin.c.titleShadow }}
      >
        AVATAR LEVEL
      </h2>

      {/* Level ring */}
      <motion.div
        key={pulseKey}
        initial={pulseKey ? { scale: 1.15, boxShadow: "0 0 80px rgba(47,230,200,0.8)" } : false}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 14 }}
        className="mt-[20px] flex size-[175px] flex-col items-center justify-center rounded-full border-2"
        style={{
          borderColor: skin.hud.badgeBorder,
          background: skin.hud.ringBg,
          boxShadow: skin.hud.ringShadow,
        }}
      >
        <span className="text-[13px] tracking-[2px]" style={{ color: skin.hud.badgeLabel, fontFamily: RPG_FONTS.display }}>
          Lv.
        </span>
        <span className="text-[62px] font-bold leading-[62px]" style={{ color: skin.c.text, fontFamily: RPG_FONTS.number }}>
          {profile.level}
        </span>
        <span className="text-[10px] tracking-[1px]" style={{ color: skin.c.textDim, fontFamily: RPG_FONTS.display }}>
          MAX Lv.{maxLevel}
        </span>
      </motion.div>

      {/* Next level progress */}
      <Panel className="mt-[24px] flex flex-col gap-[10px]" tone="dark">
        <div className="flex items-center justify-between text-[11px] font-semibold tracking-[1px]" style={{ color: pc.textDim, fontFamily: RPG_FONTS.display }}>
          <span>{atMax ? "MAX LEVEL REACHED" : `NEXT: Lv.${profile.level + 1}`}</span>
          <span>{atMax ? "—" : `${fmt(profile.bp)} / ${fmt(profile.bpToNext)} BP`}</span>
        </div>
        <div className="h-[12px] w-full overflow-hidden rounded-[6px]" style={{ background: skin.bar.track }}>
          <motion.div
            className="h-full rounded-[6px]"
            style={{ background: RPG_GRADIENTS.cta }}
            initial={false}
            animate={{ width: `${atMax ? 100 : Math.min(100, (profile.bp / profile.bpToNext) * 100)}%` }}
            transition={{ type: "spring", stiffness: 90, damping: 20 }}
          />
        </div>
        <p className="text-[10px]" style={{ color: pc.slotEmpty, fontFamily: RPG_FONTS.display }}>
          BP required = current level × {profile.bpPerLevelMultiplier ?? 100} · each level grants +{fmt(perLevel)} Power
        </p>
      </Panel>

      {/* Power breakdown */}
      <Panel className="mt-[16px] flex flex-col gap-[11px]">
        <span className="text-[12px] font-bold tracking-[2px]" style={{ color: pc.sectionLabel, fontFamily: RPG_FONTS.display }}>
          POWER BREAKDOWN
        </span>
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold" style={{ color: pc.textDim, fontFamily: RPG_FONTS.display }}>
            Avatar Level ({profile.level} × {fmt(perLevel)})
          </span>
          <span className="text-[13px] font-semibold" style={{ color: pc.text, fontFamily: RPG_FONTS.number }}>
            {fmt(levelPower)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold" style={{ color: pc.textDim, fontFamily: RPG_FONTS.display }}>
            Equipment ({profile.equippedCount} / {slotCount} equipped)
          </span>
          <span className="text-[13px] font-semibold" style={{ color: pc.text, fontFamily: RPG_FONTS.number }}>
            {fmt(equipPower)}
          </span>
        </div>
        <div className="h-px w-full" style={{ background: pc.rule }} />
        <div className="flex items-center justify-between">
          <span className="text-[15px] font-bold" style={{ color: pc.text, fontFamily: RPG_FONTS.display }}>
            TOTAL POWER
          </span>
          <span className="text-[15px] font-bold" style={{ color: pc.value, fontFamily: RPG_FONTS.number }}>
            {fmt(profile.power)}
          </span>
        </div>
        <p className="text-[10px]" style={{ color: pc.slotEmpty, fontFamily: RPG_FONTS.display }}>
          Max: Lv.{maxLevel} ({fmt(maxLevel * perLevel)}) + {slotCount} items ({fmt(slotCount * EQUIP_POWER)}) = {fmt(maxPower)} Power
        </p>
      </Panel>

      <div className="mt-auto w-full pb-[6px] pt-[22px]">
        <GoldCta onClick={handleLevelUp} disabled={busy || atMax || !profile.canLevelUp}>
          {atMax ? "MAX LEVEL" : busy ? "LEVELING UP..." : `LEVEL UP · −${fmt(profile.bpToNext)} BP`}
        </GoldCta>
      </div>

      <NoticeModal
        open={Boolean(notice)}
        title={notice?.title || ""}
        message={notice?.message}
        confirmLabel="OK"
        onClose={() => setNotice(null)}
      />
    </div>
  );
}
