"use client";

// Boss Battle screen (Figma 2026:3460). The outcome is already decided —
// rpgApi.startBattle() returned a full roll script and banked the mystery
// box — so this screen is pure theatre: dice shake (designer note #5),
// per-hit damage numbers, springy HP drain, boss lunge, victory banner.
//
//   INTRO → IDLE → ROLLING → PLAYER_ATTACK → BOSS_ATTACK ─┐
//             ▲                                            │ (more rounds)
//             └────────────────────────────────────────────┘
//                                  (threshold cleared) → VICTORY → box

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RPG_COLORS, RPG_FONTS } from "../constants";
import { RPG_IMAGES } from "../rpgAssets";
import { GoldCta } from "../primitives";

const PHASES = {
  IDLE: "IDLE",
  ROLLING: "ROLLING",
  PLAYER_ATTACK: "PLAYER_ATTACK",
  BOSS_ATTACK: "BOSS_ATTACK",
  VICTORY: "VICTORY",
};

const ROLL_MS = 950;
const HIT_GAP_MS = 260;
const BOSS_ATTACK_MS = 750;

const fmt = (n) => Number(n).toLocaleString("en-GB");

// SVG die with the design's dark-navy face and cyan pips.
const PIP_LAYOUTS = {
  1: [[50, 50]],
  2: [[30, 30], [70, 70]],
  3: [[28, 28], [50, 50], [72, 72]],
  4: [[31, 31], [69, 31], [31, 69], [69, 69]],
  5: [[29, 29], [71, 29], [50, 50], [29, 71], [71, 71]],
  6: [[31, 27], [69, 27], [31, 50], [69, 50], [31, 73], [69, 73]],
};

function DieFace({ value, size = 96 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-label={`Die showing ${value}`}>
      <rect x="4" y="4" width="92" height="92" rx="22" fill="#141833" stroke="#2fe6c8" strokeWidth="2.5" />
      {(PIP_LAYOUTS[value] || PIP_LAYOUTS[1]).map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="7.5" fill="#40e5d1" />
      ))}
    </svg>
  );
}

export default function Battle({ script, profile, onClaimBox, onExit }) {
  const [phase, setPhase] = useState(PHASES.IDLE);
  const [roundIndex, setRoundIndex] = useState(0);
  const [shownRoll, setShownRoll] = useState(1);
  const [hpFraction, setHpFraction] = useState(1);
  const [hits, setHits] = useState([]); // floating damage numbers
  const timers = useRef([]);

  const boss = script?.boss;
  const rounds = script?.rounds || [];
  const threshold = script?.threshold || 6;

  // One timer registry so unmount cleans every chained timeout.
  const later = (fn, ms) => {
    timers.current.push(setTimeout(fn, ms));
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const hpAfter = (cumulative) => Math.max(0, 1 - cumulative / (threshold + 1));

  // Per-hit cosmetic damage split — the drain fraction is authoritative,
  // the flying numbers just make it feel like combat.
  const hitDamages = useMemo(() => {
    if (!boss) return [];
    return rounds.map((round, i) => {
      const prev = i === 0 ? 1 : hpAfter(rounds[i - 1].cumulative);
      const drained = (prev - hpAfter(round.cumulative)) * boss.hp;
      const per = drained / round.roll;
      return Array.from({ length: round.roll }, (_, h) => {
        const jitter = 0.75 + ((i * 7 + h * 13) % 10) / 20; // deterministic wobble
        return Math.max(1, Math.round((per * jitter) / 10) * 10);
      });
    });
  }, [rounds, boss, threshold]);

  const startRoll = () => {
    if (phase !== PHASES.IDLE || roundIndex >= rounds.length) return;
    const round = rounds[roundIndex];
    setPhase(PHASES.ROLLING);

    // Cycle faces fast while the die shakes, then settle on the real roll.
    const cycle = setInterval(() => setShownRoll(1 + Math.floor(Math.random() * 6)), 85);
    timers.current.push(cycle);
    later(() => {
      clearInterval(cycle);
      setShownRoll(round.roll);
      setPhase(PHASES.PLAYER_ATTACK);

      // Sequential hits: flash a damage number + drain HP toward the round target.
      const prevFraction = roundIndex === 0 ? 1 : hpAfter(rounds[roundIndex - 1].cumulative);
      const targetFraction = hpAfter(round.cumulative);
      for (let h = 0; h < round.roll; h += 1) {
        later(() => {
          const t = (h + 1) / round.roll;
          setHpFraction(prevFraction + (targetFraction - prevFraction) * t);
          setHits((prev) => [...prev.slice(-4), { id: `${roundIndex}-${h}`, dmg: hitDamages[roundIndex][h] }]);
        }, (h + 1) * HIT_GAP_MS);
      }

      later(() => {
        if (round.cumulative > threshold) {
          setPhase(PHASES.VICTORY);
        } else {
          setPhase(PHASES.BOSS_ATTACK);
          later(() => {
            setRoundIndex((i) => i + 1);
            setPhase(PHASES.IDLE);
          }, BOSS_ATTACK_MS);
        }
      }, round.roll * HIT_GAP_MS + 350);
    }, ROLL_MS);
  };

  if (!boss) return null;

  const victorious = phase === PHASES.VICTORY;
  const hpNow = Math.round(boss.hp * hpFraction);
  const gender = profile?.gender || "male";

  return (
    // The arena backdrop is full-bleed at the ScreenShell level (passed via
    // backgroundImage) so it sits behind the HUD too — here we only lay out
    // the combatants over it.
    <div className="relative flex w-full flex-1 flex-col overflow-hidden">
      <div className="relative z-10 flex w-full flex-1 flex-col items-center px-[18px]">
        <span className="pt-[16px] text-[11px] font-semibold tracking-[5px]" style={{ color: RPG_COLORS.textDim, fontFamily: RPG_FONTS.display }}>
          PLANET BOSS
        </span>
        <h2 className="text-[24px] font-bold tracking-[2px]" style={{ color: "#fff", fontFamily: RPG_FONTS.display, textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}>
          {boss.name.toUpperCase()}
        </h2>

        {/* Boss HP bar */}
        <div
          className="relative mt-[8px] h-[18px] w-full max-w-[330px] overflow-hidden rounded-full border"
          style={{ background: "rgba(20,8,20,0.7)", borderColor: "rgba(255,60,100,0.5)" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #ff5c8a 0%, #e33) " }}
            initial={false}
            animate={{ width: `${hpFraction * 100}%` }}
            transition={{ type: "spring", stiffness: 110, damping: 20 }}
          />
          <span
            className="absolute inset-0 grid place-items-center text-[10px] font-bold tracking-[1px]"
            style={{ color: "#fff", fontFamily: RPG_FONTS.display, textShadow: "0 1px 2px rgba(0,0,0,0.7)" }}
          >
            {fmt(hpNow)} / {fmt(boss.hp)}
          </span>
        </div>

        {/* Boss art + floating damage. items-end so the boss stands on its
            ground shadow rather than floating mid-air. */}
        <div className="relative mt-[8px] flex h-[min(288px,33vh)] w-full items-end justify-center">
          {/* ground shadow — plants the boss in the arena */}
          <div
            className="pointer-events-none absolute bottom-[6px] h-[26px] w-[160px] rounded-[50%]"
            style={{ background: "radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 70%)" }}
          />
          <motion.img
            src={RPG_IMAGES.bossArt}
            alt={boss.name}
            className="relative h-full w-auto object-contain"
            style={{ filter: boss.artFilter === "none" ? undefined : boss.artFilter }}
            animate={
              victorious
                ? { opacity: 0.15, y: 26, scale: 0.94 }
                : phase === PHASES.PLAYER_ATTACK
                  ? { x: [0, -7, 6, -4, 0] }
                  : phase === PHASES.BOSS_ATTACK
                    ? { y: [0, 22, 0], scale: [1, 1.06, 1] }
                    : { y: [0, -5, 0] }
            }
            transition={
              victorious
                ? { duration: 0.7 }
                : phase === PHASES.PLAYER_ATTACK
                  ? { duration: 0.5, repeat: Infinity }
                  : phase === PHASES.BOSS_ATTACK
                    ? { duration: 0.7 }
                    : { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }
          />
          <AnimatePresence>
            {hits.map((hit) => (
              <motion.span
                key={hit.id}
                className="absolute text-[20px] font-bold"
                style={{ color: "#ffd76a", fontFamily: RPG_FONTS.number, textShadow: "0 2px 6px rgba(0,0,0,0.8)" }}
                initial={{ opacity: 0, y: 10, x: (hit.id.charCodeAt(0) % 2 ? -1 : 1) * ((hit.dmg % 50) + 10), scale: 0.7 }}
                animate={{ opacity: 1, y: -56, scale: 1.15 }}
                exit={{ opacity: 0, y: -85 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                onAnimationComplete={() => setHits((prev) => prev.filter((h) => h.id !== hit.id))}
              >
                -{fmt(hit.dmg)}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>

        {/* Player — grounded on the arena's magic circle */}
        <div className="relative mt-[2px] flex flex-col items-center">
          <div
            className="pointer-events-none absolute bottom-[4px] h-[14px] w-[80px] rounded-[50%]"
            style={{ background: "radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 70%)" }}
          />
          <motion.img
            src={RPG_IMAGES.hero[gender].back}
            alt="Your hero"
            className="relative h-[min(112px,13vh)] w-auto"
            animate={phase === PHASES.BOSS_ATTACK ? { x: [0, -8, 8, -5, 0] } : { y: [0, -3, 0] }}
            transition={phase === PHASES.BOSS_ATTACK ? { duration: 0.5 } : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Power line */}
        <div className="mt-[6px] grid w-full max-w-[340px] grid-cols-3 items-center">
          <span className="text-[11px] font-semibold tracking-[3px]" style={{ color: RPG_COLORS.textDim, fontFamily: RPG_FONTS.display }}>
            YOUR POWER
          </span>
          <span
            className="text-center text-[30px] font-bold"
            style={{ color: RPG_COLORS.gold, fontFamily: RPG_FONTS.number, textShadow: "0 0 18px rgba(255,201,77,0.5)" }}
          >
            {fmt(profile?.power ?? 0)}
          </span>
          <span className="text-right text-[9px] leading-[13px]" style={{ color: RPG_COLORS.slotEmpty, fontFamily: RPG_FONTS.display }}>
            Boss strikes once after your attacks
          </span>
        </div>

        {/* Dice */}
        <motion.button
          type="button"
          onClick={startRoll}
          disabled={phase !== PHASES.IDLE}
          className="mt-[8px]"
          style={{ filter: "drop-shadow(0 0 16px rgba(47,230,200,0.45))" }}
          animate={
            phase === PHASES.ROLLING
              ? { rotate: [0, -18, 14, -10, 16, -6, 0], x: [0, -6, 5, -4, 3, 0], y: [0, -10, 4, -8, 2, 0] }
              : { rotate: 0, x: 0, y: 0 }
          }
          transition={phase === PHASES.ROLLING ? { duration: 0.95, ease: "easeInOut" } : { duration: 0.2 }}
          whileTap={phase === PHASES.IDLE ? { scale: 0.92 } : undefined}
          aria-label="Roll the dice"
        >
          <DieFace value={shownRoll} />
        </motion.button>
        <span className="mt-[8px] text-[13px] font-bold tracking-[4px]" style={{ color: RPG_COLORS.cyanSoft, fontFamily: RPG_FONTS.display }}>
          {phase === PHASES.ROLLING ? "ROLLING..." : `ROLL DICE${roundIndex > 0 && phase === PHASES.IDLE ? ` · TOTAL ${rounds[roundIndex - 1]?.cumulative ?? 0}/${threshold}` : ""}`}
        </span>
        <span className="mt-[4px] text-[10px]" style={{ color: RPG_COLORS.slotEmpty, fontFamily: RPG_FONTS.display }}>
          Dice number = number of attacks · 100–500 dmg each
        </span>

        <div className="mt-auto w-full max-w-[340px] pb-[10px] pt-[10px]">
          <GoldCta onClick={startRoll} disabled={phase !== PHASES.IDLE}>
            {phase === PHASES.IDLE ? "⚔ ATTACK" : phase === PHASES.BOSS_ATTACK ? "BOSS ATTACKS..." : "FIGHTING..."}
          </GoldCta>
        </div>
      </div>

      {/* Victory overlay */}
      <AnimatePresence>
        {victorious && (
          <motion.div
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-[18px] px-[32px]"
            style={{ background: "rgba(3,5,16,0.78)", backdropFilter: "blur(3px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.p
              className="text-[38px] font-bold tracking-[8px]"
              style={{ color: RPG_COLORS.gold, fontFamily: RPG_FONTS.display, textShadow: "0 0 40px rgba(255,201,77,0.8)" }}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.15 }}
            >
              VICTORY
            </motion.p>
            <motion.img
              src={RPG_IMAGES.chest}
              alt="Mystery box"
              className="h-[130px] w-auto"
              initial={{ y: -60, opacity: 0, rotate: -8 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.4 }}
            />
            <p className="text-center text-[13px]" style={{ color: RPG_COLORS.textDim, fontFamily: RPG_FONTS.display }}>
              {boss.name} defeated — you earned a Mystery Box!
            </p>
            <div className="w-full max-w-[300px]">
              <GoldCta onClick={onClaimBox}>CLAIM MYSTERY BOX</GoldCta>
            </div>
            <button
              type="button"
              onClick={onExit}
              className="text-[11px] tracking-[2px] underline-offset-2"
              style={{ color: RPG_COLORS.slotEmpty, fontFamily: RPG_FONTS.display }}
            >
              OPEN LATER
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
