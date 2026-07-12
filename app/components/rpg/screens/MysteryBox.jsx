"use client";

// Mystery Box screen (Figma 2026:3567): the chest with its gold aura, the
// "possible rewards" table straight from the spec drop table, and the
// CLOSED → OPENING → REVEALED flow. The reward is decided (and applied) the
// instant OPEN BOX is pressed — the shake is just suspense.

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RPG_COLORS, RPG_FONTS, RPG_GRADIENTS, RPG_VIEWS, MYSTERY_BOX_TABLE } from "../constants";
import { RPG_IMAGES } from "../rpgAssets";
import * as rpgApi from "../rpgApi";
import { GoldCta } from "../primitives";

const STAGES = { CLOSED: "CLOSED", OPENING: "OPENING", REVEALED: "REVEALED" };

function RewardIcon({ type, size = 22 }) {
  if (type === "tokens") {
    return (
      <span
        className="inline-block rounded-full border"
        style={{ width: size, height: size, background: RPG_GRADIENTS.coin, borderColor: RPG_COLORS.coinBorder }}
      />
    );
  }
  if (type === "bp" || type === "levelup") {
    return <img src={RPG_IMAGES.icons.bpGem} alt="" style={{ width: size, height: size }} />;
  }
  if (type === "equipment") {
    return <img src={RPG_IMAGES.equipment.weapon} alt="" style={{ width: size, height: size }} />;
  }
  // credit / gold bar
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <rect x="2" y="6" width="20" height="12" rx="3" fill="none" stroke="#39d98a" strokeWidth="2" />
      <circle cx="12" cy="12" r="3" fill="#39d98a" />
    </svg>
  );
}

export default function MysteryBox({ boxId, onProfileUpdate, onNavigate }) {
  const [stage, setStage] = useState(STAGES.CLOSED);
  const [box, setBox] = useState(undefined); // undefined = loading, null = none
  const [reward, setReward] = useState(null);

  // Recover the pending box: prefer the URL's id, else the newest pending one
  // (covers reloads); with nothing pending, bounce back to the challenge list.
  useEffect(() => {
    let cancelled = false;
    (boxId ? rpgApi.getPendingBox(boxId) : Promise.resolve(null))
      .then((b) => b || rpgApi.getLatestPendingBox())
      .then((b) => {
        if (!cancelled) setBox(b);
      })
      .catch(() => {
        if (!cancelled) setBox(null);
      });
    return () => {
      cancelled = true;
    };
  }, [boxId]);

  useEffect(() => {
    if (box === null && stage === STAGES.CLOSED) onNavigate(RPG_VIEWS.CHALLENGE, undefined, { replace: true });
  }, [box, stage, onNavigate]);

  const handleOpen = async () => {
    if (!box || stage !== STAGES.CLOSED) return;
    setStage(STAGES.OPENING);
    try {
      const result = await rpgApi.openMysteryBox(box.id);
      onProfileUpdate(result.profile);
      setReward(result.reward);
      setTimeout(() => setStage(STAGES.REVEALED), 1200);
    } catch {
      setStage(STAGES.CLOSED);
    }
  };

  const handleCollect = () => {
    onNavigate(reward?.type === "equipment" && reward?.item ? RPG_VIEWS.ITEMS : RPG_VIEWS.CHALLENGE);
  };

  const visibleRewards = MYSTERY_BOX_TABLE.filter((r) => r.weight > 0);

  return (
    <div className="flex w-full flex-1 flex-col items-center px-[18px]">
      <h2
        className="pt-[22px] text-center text-[24px] font-bold tracking-[6px]"
        style={{ color: RPG_COLORS.text, fontFamily: RPG_FONTS.display, textShadow: "0 0 24px rgba(124,77,255,0.8)" }}
      >
        MYSTERY BOX
      </h2>
      <p className="mt-[4px] text-center text-[12px]" style={{ color: RPG_COLORS.textDim, fontFamily: RPG_FONTS.display }}>
        {box?.boss ? `${box.boss.name} defeated — claim your reward!` : "Claim your reward!"}
      </p>

      {/* Chest with gold aura */}
      <div className="relative mt-[8px] grid h-[230px] w-full place-items-center">
        <div
          className="pointer-events-none absolute size-[260px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,201,77,0.35) 0%, rgba(255,201,77,0.12) 45%, rgba(255,201,77,0) 70%)" }}
        />
        <motion.img
          src={RPG_IMAGES.chest}
          alt="Mystery box"
          className="h-[200px] w-auto"
          animate={
            stage === STAGES.OPENING
              ? { rotate: [0, -4, 4, -6, 6, -3, 3, 0], scale: [1, 1.04, 1.08], filter: "brightness(1.6)" }
              : stage === STAGES.REVEALED
                ? { scale: 0.8, opacity: 0.35, y: 18 }
                : { y: [0, -7, 0] }
          }
          transition={
            stage === STAGES.OPENING
              ? { duration: 1.1 }
              : stage === STAGES.REVEALED
                ? { duration: 0.4 }
                : { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }
        />
        {/* Reward pop */}
        <AnimatePresence>
          {stage === STAGES.REVEALED && reward && (
            <motion.div
              className="absolute flex flex-col items-center gap-[10px] rounded-[18px] border px-[26px] py-[20px]"
              style={{
                background: "rgba(10,14,26,0.95)",
                borderColor: RPG_COLORS.gold,
                boxShadow: "0 0 50px rgba(255,201,77,0.45)",
              }}
              initial={{ scale: 0.4, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 15 }}
            >
              <RewardIcon type={reward.type} size={40} />
              <p className="text-center text-[16px] font-bold tracking-[1px]" style={{ color: RPG_COLORS.gold, fontFamily: RPG_FONTS.display }}>
                {reward.item ? reward.item.name : reward.label}
              </p>
              <p className="text-center text-[11px]" style={{ color: RPG_COLORS.textDim, fontFamily: RPG_FONTS.display }}>
                {reward.type === "equipment" && reward.item
                  ? `Added to your backpack (${reward.item.slot})`
                  : reward.type === "levelup"
                    ? "Your avatar leveled up instantly!"
                    : reward.type === "credit"
                      ? "Credited to your account soon"
                      : "Added to your balance"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Possible rewards */}
      <div
        className="mt-[6px] w-full rounded-[18px] border px-[18px] py-[14px]"
        style={{ background: "rgba(8,10,22,0.72)", borderColor: RPG_COLORS.violetBorder }}
      >
        <p className="pb-[10px] text-center text-[13px] font-bold tracking-[3px]" style={{ color: RPG_COLORS.text, fontFamily: RPG_FONTS.display }}>
          ◇ POSSIBLE REWARDS ◇
        </p>
        <div className="grid grid-cols-2 gap-x-[18px]">
          {visibleRewards.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-[10px] border-b py-[9px]"
              style={{ borderColor: "rgba(139,92,246,0.18)" }}
            >
              <RewardIcon type={r.type} />
              <span className="text-[12px] font-semibold" style={{ color: RPG_COLORS.text, fontFamily: RPG_FONTS.display }}>
                {r.label}
              </span>
            </div>
          ))}
        </div>
        <p className="pt-[10px] text-center text-[10px]" style={{ color: "#cbb96a", fontFamily: RPG_FONTS.display }}>
          Rewards are randomly selected
        </p>
      </div>

      <div className="mt-auto w-full pb-[6px] pt-[16px]">
        <GoldCta
          onClick={stage === STAGES.REVEALED ? handleCollect : handleOpen}
          disabled={stage === STAGES.OPENING || box === undefined}
        >
          {stage === STAGES.REVEALED ? "COLLECT" : stage === STAGES.OPENING ? "OPENING..." : "OPEN BOX"}
        </GoldCta>
      </div>
    </div>
  );
}
