"use client";

// Mystery Box screen (Figma 2026:3567): the chest with its gold aura, the
// "possible rewards" table (the live admin catalog), and the
// CLOSED → OPENING → REVEALED flow. The server decides and applies the reward
// the instant OPEN BOX is pressed — the shake is just suspense.

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RPG_COLORS, RPG_FONTS, RPG_VIEWS } from "../constants";
import { RPG_IMAGES } from "../rpgAssets";
import * as rpgApi from "../rpgApi";
import { GoldCta, Panel } from "../primitives";
import { useRpgSkin } from "../rpgSkin";
import NoticeModal from "../NoticeModal";

const STAGES = { CLOSED: "CLOSED", OPENING: "OPENING", REVEALED: "REVEALED" };

// Admin-uploaded artwork wins; otherwise fall back to a per-type glyph.
function RewardIcon({ type, size = 22, image }) {
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image} alt="" className="object-contain" style={{ width: size, height: size }} />;
  }
  if (type === "tokens") {
    return <img src={RPG_IMAGES.icons.token} alt="" style={{ width: size, height: size }} />;
  }
  if (type === "bp" || type === "levelup") {
    return <img src={RPG_IMAGES.icons.bpGem} alt="" style={{ width: size, height: size }} />;
  }
  if (type === "equipment") {
    // eslint-disable-next-line @next/next/no-img-element
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
  const skin = useRpgSkin();
  const pc = skin.cOnPanel;
  const [stage, setStage] = useState(STAGES.CLOSED);
  const [box, setBox] = useState(undefined); // undefined = loading, null = none
  const [reward, setReward] = useState(null);
  const [rewardTable, setRewardTable] = useState([]);
  const [notice, setNotice] = useState(null);
  // The lid pops partway through OPENING: closed chest shakes, then we swap to
  // the open-chest art with a light burst before the reward card appears.
  const [lidOpen, setLidOpen] = useState(false);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

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

  // Possible rewards = every item returned by the live admin catalog.
  useEffect(() => {
    let cancelled = false;
    rpgApi.getMysteryBoxRewards().then((rows) => {
      if (!cancelled) setRewardTable(rows);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleOpen = async () => {
    if (!box || stage !== STAGES.CLOSED) return;
    setStage(STAGES.OPENING);
    try {
      const result = await rpgApi.openMysteryBox(box.id);
      onProfileUpdate(result.profile);
      setReward(result.reward);
      // Shake the closed chest, pop the lid (swap to open art + burst), then
      // reveal the reward.
      timers.current.push(setTimeout(() => setLidOpen(true), 650));
      timers.current.push(setTimeout(() => setStage(STAGES.REVEALED), 1250));
    } catch (err) {
      // e.g. "Backpack is full" — the box stays unopened and claimable.
      setStage(STAGES.CLOSED);
      setLidOpen(false);
      setNotice({ title: "CANNOT OPEN", message: err?.message || "Could not open the mystery box." });
    }
  };

  const handleCollect = () => {
    onNavigate(reward?.type === "equipment" && reward?.item ? RPG_VIEWS.ITEMS : RPG_VIEWS.CHALLENGE);
  };

  return (
    <div className="flex w-full flex-1 flex-col items-center px-[18px]">
      <h2
        className="pt-[22px] text-center text-[24px] font-bold tracking-[6px]"
        style={{ color: skin.c.title, fontFamily: RPG_FONTS.display, textShadow: skin.c.titleShadow }}
      >
        MYSTERY BOX
      </h2>
      <p className="mt-[4px] text-center text-[12px]" style={{ color: skin.c.textDim, fontFamily: RPG_FONTS.display }}>
        {box?.boss ? `${box.boss.name} defeated — claim your reward!` : "Claim your reward!"}
      </p>

      {/* Chest with gold aura */}
      <div className="relative mt-[8px] grid h-[240px] w-full place-items-center">
        {/* gold aura — brightens as the lid opens */}
        <motion.div
          className="pointer-events-none absolute size-[260px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,201,77,0.35) 0%, rgba(255,201,77,0.12) 45%, rgba(255,201,77,0) 70%)" }}
          animate={{ scale: lidOpen ? 1.15 : 1, opacity: lidOpen ? 1 : 0.85 }}
          transition={{ duration: 0.5 }}
        />
        {/* light burst at the moment the lid pops */}
        <AnimatePresence>
          {lidOpen && stage === STAGES.OPENING && (
            <motion.div
              key="burst"
              className="pointer-events-none absolute size-[210px] rounded-full"
              style={{ background: "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,201,77,0.5) 32%, rgba(255,201,77,0) 66%)" }}
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1.9, opacity: [0, 1, 0] }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>

        {/* Closed chest — idles, then shakes; fades out as the lid pops */}
        <motion.img
          src={RPG_IMAGES.chest}
          alt="Mystery box"
          className="absolute h-[200px] w-auto"
          animate={
            stage === STAGES.CLOSED
              ? { y: [0, -7, 0], opacity: 1 }
              : lidOpen
                ? { opacity: 0 }
                : { rotate: [0, -4, 4, -6, 6, -3, 3, 0], scale: [1, 1.04, 1.08], filter: "brightness(1.5)", opacity: 1 }
          }
          transition={
            stage === STAGES.CLOSED
              ? { duration: 3, repeat: Infinity, ease: "easeInOut" }
              : lidOpen
                ? { duration: 0.15 }
                : { duration: 0.65 }
          }
        />

        {/* Open chest — pops in when the lid opens, dims behind the reward */}
        <motion.img
          src={RPG_IMAGES.chestOpen}
          alt=""
          aria-hidden="true"
          className="absolute h-[214px] w-auto"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={
            !lidOpen
              ? { opacity: 0, scale: 0.85 }
              : stage === STAGES.REVEALED
                ? { opacity: 0.45, scale: 0.82, y: 14 }
                : { opacity: 1, scale: [1.18, 1], y: 0 }
          }
          transition={{ duration: stage === STAGES.REVEALED ? 0.4 : 0.5, ease: "easeOut" }}
        />

        {/* Reward pop */}
        <AnimatePresence>
          {stage === STAGES.REVEALED && reward && (
            <motion.div
              className="absolute flex flex-col items-center gap-[10px] rounded-[18px] border px-[26px] py-[20px]"
              style={{
                background: skin.modal.bg,
                borderColor: skin.c.value,
                boxShadow: "0 0 50px rgba(255,201,77,0.45)",
              }}
              initial={{ scale: 0.4, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 15 }}
            >
              <RewardIcon type={reward.type} size={40} />
              <p className="text-center text-[16px] font-bold tracking-[1px]" style={{ color: skin.c.value, fontFamily: RPG_FONTS.display }}>
                {reward.item ? reward.item.name : reward.label}
              </p>
              <p className="text-center text-[11px]" style={{ color: skin.c.textDim, fontFamily: RPG_FONTS.display }}>
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
      <Panel
        className="mt-[6px]"
        tone="dark"
      >
        <p className="pb-[10px] text-center text-[13px] font-bold tracking-[3px]" style={{ color: pc.text, fontFamily: RPG_FONTS.display }}>
          ◇ POSSIBLE REWARDS ◇
        </p>
        <div className="grid grid-cols-2 gap-x-[12px]">
          {rewardTable.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-[10px] border-b py-[9px]"
              style={{ borderColor: pc.rule }}
            >
              <RewardIcon type={r.type} image={r.image} />
              <span className="min-w-0 truncate text-[12px] font-semibold" style={{ color: pc.text, fontFamily: RPG_FONTS.display }}>
                {r.label}
              </span>
            </div>
          ))}
        </div>
        <p className="pt-[10px] text-center text-[10px]" style={{ color: pc.footnote, fontFamily: RPG_FONTS.display }}>
          Rewards are randomly selected
        </p>
      </Panel>

      <div className="mt-auto w-full pb-[6px] pt-[16px]">
        <GoldCta
          onClick={stage === STAGES.REVEALED ? handleCollect : handleOpen}
          disabled={stage === STAGES.OPENING || box === undefined}
        >
          {stage === STAGES.REVEALED ? "COLLECT" : stage === STAGES.OPENING ? "OPENING..." : "OPEN BOX"}
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
