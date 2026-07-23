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
import { RPG_IMAGES, heroBattlePoseFor, equipMask } from "../rpgAssets";
import { GoldCta } from "../primitives";
import BossSprite from "../BossSprite";

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
const BOSS_WINDUP_MS = 220;
const BOSS_STRIKE_MS = 310;

const fmt = (n) => Number(n).toLocaleString("en-GB");

// Realistic 3D die (client feedback #3) — a CSS cube with white bevelled
// faces and recessed black pips, shown at a slight isometric tilt so its
// depth reads even at rest. While ROLLING the fast face cycling keeps
// retargeting the cube's rotation (a chaotic tumble), then it springs onto
// the real roll's face with a settling wobble.
const PIP_LAYOUTS = {
  1: [[50, 50]],
  2: [[30, 30], [70, 70]],
  3: [[28, 28], [50, 50], [72, 72]],
  4: [[31, 31], [69, 31], [31, 69], [69, 69]],
  5: [[29, 29], [71, 29], [50, 50], [29, 71], [71, 71]],
  6: [[31, 27], [69, 27], [31, 50], [69, 50], [31, 73], [69, 73]],
};

// Cube face planes (opposite faces sum to 7, like a real die).
const DIE_FACES = [
  { value: 1, transform: "rotateY(0deg)" },
  { value: 6, transform: "rotateY(180deg)" },
  { value: 3, transform: "rotateY(90deg)" },
  { value: 4, transform: "rotateY(-90deg)" },
  { value: 2, transform: "rotateX(90deg)" },
  { value: 5, transform: "rotateX(-90deg)" },
];

// Cube rotation that brings each value's face to the front.
const DIE_ORIENT = {
  1: { x: 0, y: 0 },
  2: { x: -90, y: 0 },
  3: { x: 0, y: -90 },
  4: { x: 0, y: 90 },
  5: { x: 90, y: 0 },
  6: { x: 0, y: 180 },
};

function Die3D({ value, rolling, size = 80 }) {
  const half = size / 2;
  // Whole extra revolutions accumulate once per roll so the cube always
  // tumbles forward instead of taking the shortest path back to the face.
  const turnsRef = useRef(0);
  const wasRolling = useRef(false);
  if (rolling && !wasRolling.current) turnsRef.current += 1;
  wasRolling.current = rolling;
  const orient = DIE_ORIENT[value] || DIE_ORIENT[1];
  const spin = turnsRef.current * 360;

  return (
    <div role="img" aria-label={`Die showing ${value}`} style={{ width: size, height: size, perspective: size * 4.5 }}>
      {/* Static isometric tilt: keeps the top + right faces visible so the
          cube never flattens into a square. */}
      <div
        className="h-full w-full"
        style={{ transform: "rotateX(-22deg) rotateY(-28deg)", transformStyle: "preserve-3d" }}
      >
        <motion.div
          className="relative h-full w-full"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateX: orient.x + spin, rotateY: orient.y + spin }}
          transition={
            rolling
              ? { duration: 0.4, ease: "linear" }
              : { type: "spring", stiffness: 160, damping: 15 }
          }
        >
          {DIE_FACES.map((face) => (
            <div
              key={face.value}
              className="absolute inset-0 rounded-[16%]"
              style={{
                transform: `${face.transform} translateZ(${half}px)`,
                background: "linear-gradient(145deg, #ffffff 0%, #edeef4 52%, #c9cedd 100%)",
                boxShadow: "inset 0 0 7px rgba(60,70,100,0.28), inset 0 -3px 6px rgba(60,70,100,0.22)",
                backfaceVisibility: "hidden",
              }}
            >
              {(PIP_LAYOUTS[face.value] || []).map(([cx, cy], i) => (
                <span
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: "17%",
                    height: "17%",
                    left: `${cx}%`,
                    top: `${cy}%`,
                    transform: "translate(-50%, -50%)",
                    background: "radial-gradient(circle at 35% 30%, #3c4150 0%, #15171f 55%, #04050a 100%)",
                    boxShadow: "inset 0 2px 3px rgba(0,0,0,0.6), 0 1px 1px rgba(255,255,255,0.55)",
                  }}
                />
              ))}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default function Battle({ script, profile, equipment, onClaimBox, onExit }) {
  const [phase, setPhase] = useState(PHASES.IDLE);
  const [roundIndex, setRoundIndex] = useState(0);
  const [shownRoll, setShownRoll] = useState(1);
  const [hpFraction, setHpFraction] = useState(1);
  const [hits, setHits] = useState([]); // floating damage numbers
  const [striking, setStriking] = useState(false); // hero ki-blast recoil pulse
  const [strikeIdx, setStrikeIdx] = useState(0); // frame index into the unarmed punch sequence
  const [hitSeq, setHitSeq] = useState(0); // increments per landed hit (keys impact FX)
  // Code-driven in-between poses derived from the existing Colossus sprite.
  const [bossFrame, setBossFrame] = useState("idle");
  const [bossAttackSeq, setBossAttackSeq] = useState(0);
  const [heroHit, setHeroHit] = useState(false);
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
          // Attack: fire an energy shot at the boss. The unarmed hero plays a
          // back-facing punch sequence (frames step ~55ms); a geared hero just
          // recoils (no per-item attack frames). Energy shot fires either way.
          setStriking(true);
          setStrikeIdx(0);
          setHitSeq((n) => n + 1);
          setBossFrame("hit");
          later(() => setStrikeIdx(1), 55);
          later(() => setStrikeIdx(2), 110);
          later(() => setStrikeIdx(3), 165);
          later(() => setStriking(false), 220);
          later(() => setBossFrame("hurt"), 70);
          later(() => setBossFrame("recover"), 150);
          later(() => setBossFrame("idle"), 240);
        }, (h + 1) * HIT_GAP_MS);
      }

      later(() => {
        setStriking(false);
        if (round.cumulative > threshold) {
          setPhase(PHASES.VICTORY);
        } else {
          setPhase(PHASES.BOSS_ATTACK);
          setBossFrame("windup");
          later(() => {
            setBossFrame("strike");
            setBossAttackSeq((n) => n + 1);
          }, BOSS_WINDUP_MS);
          later(() => {
            setBossFrame("recover");
            setHeroHit(true);
            later(() => setHeroHit(false), 170);
          }, BOSS_STRIKE_MS);
          later(() => {
            setBossFrame("idle");
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
  // The battle hero is BACK-facing (looking at the boss). With gear equipped it
  // shows the equipped back pose and just recoils on attack (no per-item attack
  // frames). Unarmed, it plays the back-facing punch sequence (2271/2272). The
  // energy shot fires either way.
  const heroPose = heroBattlePoseFor(gender, equipment);
  const unarmed = equipMask(equipment) === 0;
  const strikeFrames = RPG_IMAGES.heroStrike[gender];
  const strikeSrc =
    unarmed && Array.isArray(strikeFrames) && strikeFrames.length
      ? strikeFrames[Math.min(strikeIdx, strikeFrames.length - 1)]
      : null;

  return (
    // The arena backdrop is full-bleed at the ScreenShell level (passed via
    // backgroundImage) so it sits behind the HUD too — here we only lay out
    // the combatants over it.
    <div className="relative flex w-full min-h-0 flex-1 flex-col overflow-hidden">
      <div className="relative z-10 flex w-full min-h-0 flex-1 flex-col items-center px-[18px] pb-[6px]">
        {/* Header — fixed height */}
        <div className="flex w-full shrink-0 flex-col items-center">
          <span className="pt-[12px] text-[11px] font-semibold tracking-[5px]" style={{ color: RPG_COLORS.textDim, fontFamily: RPG_FONTS.display }}>
            PLANET BOSS
          </span>
          <h2 className="text-[24px] font-bold tracking-[2px]" style={{ color: "#fff", fontFamily: RPG_FONTS.display, textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}>
            {boss.name.toUpperCase()}
          </h2>
          <div
            className="relative mt-[6px] h-[18px] w-full max-w-[330px] overflow-hidden rounded-full border"
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
        </div>

        {/* Combat — flexible middle that shrinks so the controls always fit
            on one screen. Boss + player scale to the space they're given. */}
        <div className="relative flex w-full min-h-0 flex-1 flex-col items-center justify-end pt-[8px]">
          {/* Energy shot travelling from the hero's fist up to the boss on
              each hit — visually links the punch to the boss. */}
          <AnimatePresence>
            {striking && (
              <motion.div
                key={`proj-${hitSeq}`}
                className="pointer-events-none absolute left-1/2 z-20 size-[26px] -translate-x-1/2 rounded-full"
                style={{ background: "radial-gradient(circle, #ffffff 0%, #c9a3ff 42%, rgba(124,77,255,0) 72%)" }}
                initial={{ bottom: "20%", opacity: 0, scale: 0.5 }}
                animate={{ bottom: "60%", opacity: [0, 1, 1, 0.6], scale: [0.5, 1.1, 0.9] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              />
            )}
          </AnimatePresence>

          {/* Colossus attack: wind-up → fire punch → hero impact. */}
          <AnimatePresence>
            {bossFrame === "strike" && (
              <motion.div
                key={`boss-fire-${bossAttackSeq}`}
                className="pointer-events-none absolute left-1/2 z-20 h-[34px] w-[34px] -translate-x-1/2 rounded-full"
                style={{ background: "radial-gradient(circle, #fff7a3 0%, #ffb000 22%, #ff4b12 48%, rgba(255,52,0,0) 72%)", boxShadow: "0 0 26px rgba(255,85,10,0.9)" }}
                initial={{ bottom: "62%", opacity: 0, scale: 0.4 }}
                animate={{ bottom: "17%", opacity: [0, 1, 1, 0], scale: [0.4, 1.15, 0.7] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.24, ease: "easeIn" }}
              />
            )}
          </AnimatePresence>

          {/* Boss art + impact + floating damage. The boss + hero flex ratios
              (and the hidden HUD strip) size the combatants as the screen's
              main focus — client feedback #2. */}
          <div className="relative flex min-h-0 w-full flex-[5] items-end justify-center">
            <div
              className="pointer-events-none absolute bottom-[6px] h-[24px] w-[170px] rounded-[50%]"
              style={{ background: "radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 70%)" }}
            />
            {/* Frame-ready boss: plays real frames when registered in
                BOSS_FRAMES, else animates the base sprite per state. */}
            <BossSprite
              boss={boss}
              state={victorious ? "defeat" : bossFrame}
              seq={hitSeq + bossAttackSeq}
            />
            {/* Impact burst where the shot lands on the boss */}
            <AnimatePresence>
              {striking && (
                <motion.div
                  key={`impact-${hitSeq}`}
                  className="pointer-events-none absolute left-1/2 top-[44%] z-20 -translate-x-1/2 -translate-y-1/2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.34, ease: "easeOut" }}
                >
                  <motion.div
                    className="size-[120px] rounded-full"
                    style={{ background: "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(201,163,255,0.7) 30%, rgba(124,77,255,0) 68%)" }}
                    initial={{ scale: 0.3 }}
                    animate={{ scale: 1.6 }}
                    transition={{ duration: 0.34, ease: "easeOut" }}
                  />
                  <motion.div
                    className="absolute inset-0 m-auto size-[90px] rounded-full border-2"
                    style={{ borderColor: "rgba(210,180,255,0.9)" }}
                    initial={{ scale: 0.3, opacity: 0.9 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 0.34, ease: "easeOut" }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
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

          {/* Player — grounded on the arena's magic circle, wearing the
              equipped gear. Fires a ki blast on each landed hit (small standing
              recoil), recoils when the boss strikes back. */}
          <div className="relative flex min-h-0 w-full flex-[2.4] items-end justify-center">
            <div
              className="pointer-events-none absolute bottom-[2px] h-[12px] w-[84px] rounded-[50%]"
              style={{ background: "radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 70%)" }}
            />
            <motion.img
              src={striking && strikeSrc ? strikeSrc : heroPose}
              alt="Your hero"
              className="relative h-full max-h-full w-auto object-contain"
              style={{ transformOrigin: "bottom center" }}
              animate={
                striking
                  ? strikeSrc
                    ? { scale: 1.16, y: -20 }
                    : { scale: [1, 1.05, 1.02], y: [0, -3, -6] }
                  : heroHit
                    ? { x: [0, 13, -15, 7, 0], y: [0, 5, 0], scale: [1, 0.93, 1] }
                    : phase === PHASES.BOSS_ATTACK
                    ? { x: [0, -8, 8, -5, 0], scale: 1, y: 0 }
                    : { y: [0, -3, 0], scale: 1, x: 0 }
              }
              transition={
                striking
                  ? strikeSrc
                    ? { duration: 0.12, ease: "easeOut" }
                    : { duration: 0.2, ease: "easeOut" }
                  : heroHit
                    ? { duration: 0.22, ease: "easeOut" }
                    : phase === PHASES.BOSS_ATTACK
                    ? { duration: 0.5 }
                    : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }
              }
            />
            <AnimatePresence>
              {heroHit && (
                <motion.span
                  key={`hero-hit-${bossAttackSeq}`}
                  className="pointer-events-none absolute bottom-[42%] text-[18px] font-bold"
                  style={{ color: "#ff876f", fontFamily: RPG_FONTS.number, textShadow: "0 2px 6px rgba(0,0,0,0.9)" }}
                  initial={{ opacity: 0, y: 8, scale: 0.75 }}
                  animate={{ opacity: 1, y: -38, scale: 1.15 }}
                  exit={{ opacity: 0, y: -58 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                >
                  BLOCKED!
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer — fixed height, always on screen */}
        <div className="flex w-full shrink-0 flex-col items-center">
          <div className="mt-[4px] grid w-full max-w-[340px] grid-cols-3 items-center">
            <span className="text-[11px] font-semibold tracking-[3px]" style={{ color: RPG_COLORS.textDim, fontFamily: RPG_FONTS.display }}>
              YOUR POWER
            </span>
            <span
              className="text-center text-[26px] font-bold"
              style={{ color: RPG_COLORS.gold, fontFamily: RPG_FONTS.number, textShadow: "0 0 18px rgba(255,201,77,0.5)" }}
            >
              {fmt(profile?.power ?? 0)}
            </span>
            <span className="text-right text-[9px] leading-[13px]" style={{ color: RPG_COLORS.slotEmpty, fontFamily: RPG_FONTS.display }}>
              Boss strikes once after your attacks
            </span>
          </div>

          <motion.button
            type="button"
            onClick={startRoll}
            disabled={phase !== PHASES.IDLE}
            className="mt-[6px]"
            // Real dice are shaken, not spun flat — the 2D jiggle stays on the
            // button while the cube itself tumbles in 3D inside.
            style={{ filter: "drop-shadow(0 10px 12px rgba(0,0,0,0.5)) drop-shadow(0 0 16px rgba(124,77,255,0.45))" }}
            animate={
              phase === PHASES.ROLLING
                ? { x: [0, -6, 5, -4, 3, 0], y: [0, -10, 4, -8, 2, 0] }
                : { x: 0, y: 0 }
            }
            transition={phase === PHASES.ROLLING ? { duration: 0.95, ease: "easeInOut" } : { duration: 0.2 }}
            whileTap={phase === PHASES.IDLE ? { scale: 0.92 } : undefined}
            aria-label="Roll the dice"
          >
            <Die3D value={shownRoll} rolling={phase === PHASES.ROLLING} size={76} />
          </motion.button>
          <span className="mt-[6px] text-[13px] font-bold tracking-[4px]" style={{ color: RPG_COLORS.cyanSoft, fontFamily: RPG_FONTS.display }}>
            {phase === PHASES.ROLLING ? "ROLLING..." : `ROLL DICE${roundIndex > 0 && phase === PHASES.IDLE ? ` · TOTAL ${rounds[roundIndex - 1]?.cumulative ?? 0}/${threshold}` : ""}`}
          </span>
          <span className="mt-[3px] text-[10px]" style={{ color: RPG_COLORS.slotEmpty, fontFamily: RPG_FONTS.display }}>
            Dice number = number of attacks · beat {threshold} to win
          </span>

          <div className="mt-[8px] w-full max-w-[340px]">
            <GoldCta onClick={startRoll} disabled={phase !== PHASES.IDLE}>
              {phase === PHASES.IDLE ? "⚔ ATTACK" : phase === PHASES.BOSS_ATTACK ? "BOSS ATTACKS..." : "FIGHTING..."}
            </GoldCta>
          </div>
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
