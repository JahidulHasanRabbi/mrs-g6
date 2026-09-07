"use client";

// Boss Battle (Figma 2623:33 / :151 / :240 / :335) — one screen, four states:
//   idle      stats card + AP card + Boss Info + earn tiles
//   hit       last-attack result card replaces the stats, Rewards / Rankings
//   no AP     "0 ATTACK POINTS" card, disabled ATTACK, earn tiles
//   defeated  DEFEATED stamp, final rank / damage, Results / History, next boss
// `lastAttack` is transient React state and never enters the URL.

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRpgSkin } from "../../rpg/rpgSkin";
import { fmt, ORDINAL, WAR_VIEWS } from "../constants";
import * as warApi from "../bossWarApi";
import { WAR_IMAGES } from "../warAssets";
import { useEarnActions } from "../useEarnActions";
import BossCard from "../BossCard";
import {
  useFrameInk,
  BossHp,
  BossPortrait,
  EarnApTiles,
  GoldText,
  InfoPlaque,
  NamePlate,
  StatCell,
  StateLine,
  TimerPlaque,
  TypeChip,
  WarButton,
  WarCard,
  WarTitle,
  useBossOpening,
  useCountdown,
} from "../primitives";

function BossStage({ boss, hit, defeated }) {
  const skin = useRpgSkin();
  const ink = skin.war.ink;
  const opening = useBossOpening(4);
  return (
    <div className="relative flex flex-col items-center gap-[8px]">
      <motion.div
        key={hit?.id || "idle"}
        className="w-full"
        animate={hit ? { x: [0, -7, 7, -5, 5, 0] } : { x: 0 }}
        transition={{ duration: 0.45 }}
      >
        <BossPortrait boss={boss} dim={defeated}>
          <AnimatePresence>
            {hit ? (
              <motion.div
                key={hit.id}
                className="pointer-events-none absolute inset-x-0 top-[24px] flex justify-center"
                initial={{ opacity: 0, y: 24, scale: 0.7 }}
                animate={{ opacity: [0, 1, 1, 0], y: [24, 0, -18, -40], scale: [0.7, 1.15, 1, 1] }}
                transition={{ duration: 1.3, times: [0, 0.2, 0.7, 1] }}
              >
                <span
                  className="text-[34px] font-bold"
                  style={{ color: hit.critical ? "#ff5a3c" : ink.dmg, fontFamily: skin.war.font, textShadow: "0 2px 10px rgba(0,0,0,0.9)" }}
                >
                  -{fmt(hit.damage)}
                </span>
              </motion.div>
            ) : null}
          </AnimatePresence>
          {defeated ? (
            <motion.div
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
              initial={{ scale: 1.6, opacity: 0, rotate: -18 }}
              animate={{ scale: 1, opacity: 1, rotate: -12 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
            >
              <img src={WAR_IMAGES.ui.defeated} alt="Defeated" className="w-[80%] object-contain" draggable={false} />
            </motion.div>
          ) : null}
          {/* Caption band inside the frame's opening (+4% breathing room), so
              the plaque and the bar sit clear of the rails on every theme
              rather than flush against them. */}
          <div
            className="pointer-events-none absolute flex flex-col items-center justify-end gap-[7px]"
            style={{ ...opening, top: "auto" }}
          >
            <NamePlate className="w-[189px] max-w-full">{boss.name.toUpperCase()}</NamePlate>
            <BossHp boss={boss} />
          </div>
        </BossPortrait>
      </motion.div>
    </div>
  );
}

/** Own component so its 1Hz tick re-renders a text node, not the whole screen. */
function NextBossCountdown({ startsAt }) {
  const skin = useRpgSkin();
  const ink = useFrameInk();
  const { label } = useCountdown(startsAt);
  return (
    <p className="text-center text-[11px] font-bold" style={{ color: ink.text, fontFamily: skin.war.font }}>
      Next Boss Starts in: {label}
    </p>
  );
}

function ApCard({ ap, onAttack, busy, disabled }) {
  const skin = useRpgSkin();
  const ink = useFrameInk();
  return (
    <WarCard className="flex items-center justify-between !px-[20px]">
      <div className="flex flex-col gap-[4px]">
        <span className="text-[11px] font-bold" style={{ color: ink.meta, fontFamily: skin.war.font }}>
          Your Attack Points
        </span>
        <div className="flex items-end gap-[4px]">
          <img src={WAR_IMAGES.ui.ap} alt="" aria-hidden className="size-[25px] object-contain" draggable={false} />
          <GoldText solid className="text-[24px] font-bold leading-[26px] tracking-[0.24px]">{ap?.current ?? 0}</GoldText>
          <span className="text-[15px] font-bold leading-[24px]" style={{ color: ink.meta, fontFamily: skin.war.font }}>
            / {ap?.max ?? 0}
          </span>
        </div>
      </div>
      <img src={WAR_IMAGES.ui.plus} alt="" aria-hidden className="h-[23px] w-[22px] object-contain" draggable={false} />
      <div className="flex flex-col items-center gap-[2px]">
        <WarButton variant="attack" size="lg" className="w-[149px]" onClick={onAttack} disabled={disabled || busy}>
          {busy ? "..." : "ATTACK"}
        </WarButton>
        <span className="text-[10px] leading-[10px]" style={{ color: ink.meta, fontFamily: skin.war.font }}>
          {ap?.perAttack ?? 1} AP used per attack
        </span>
      </div>
    </WarCard>
  );
}

export default function BossBattle({ bossId, ap, onApUpdate, onNavigate, onNotice }) {
  const skin = useRpgSkin();
  const ink = useFrameInk();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [lastAttack, setLastAttack] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setLastAttack(null);
    warApi
      .getBattle(bossId)
      .then((d) => {
        if (cancelled) return;
        setData(d);
        onApUpdate?.(d.ap);
      })
      .catch((err) => !cancelled && setError(err?.message || "Could not load this boss."));
    return () => {
      cancelled = true;
    };
  }, [bossId, onApUpdate]);

  const boss = data?.boss;
  const defeated = boss?.status === "defeated";
  const noAp = (ap?.current ?? 0) < (ap?.perAttack ?? 1);
  // Only the idle and no-AP states render the tiles, so only they need the rules.
  const earn = useEarnActions({ onApUpdate, onNotice, enabled: Boolean(boss) && !defeated && !lastAttack });

  const handleAttack = useCallback(async () => {
    if (!boss || busy) return;
    setBusy(true);
    try {
      const res = await warApi.attack(boss.id);
      setLastAttack({ ...res, id: Date.now() });
      setData((d) => (d ? { ...d, boss: res.boss } : d));
      onApUpdate?.(res.ap);
    } catch (err) {
      onNotice?.("ATTACK FAILED", err?.message || "Try again later.");
    } finally {
      setBusy(false);
    }
  }, [boss, busy, onApUpdate, onNotice]);

  if (error) return <div className="px-[16px]"><WarTitle>Boss Battle</WarTitle><StateLine>{error}</StateLine></div>;
  if (!boss) return <div className="px-[16px]"><WarTitle>Boss Battle</WarTitle><StateLine>LOADING...</StateLine></div>;

  return (
    <div className="flex w-full flex-1 flex-col px-[16px] pb-[8px]">
      <WarTitle>Boss Battle</WarTitle>
      <div className="flex flex-col gap-[12px] px-[2px] pt-[8px]">
        <div className="flex items-center justify-between">
          <TypeChip>{boss.typeLabel.toUpperCase()}</TypeChip>
          <TimerPlaque endsAt={boss.endsAt} />
        </div>

        <BossStage boss={boss} hit={lastAttack} defeated={defeated} />

        {defeated ? (
          <>
            <WarCard className="flex flex-col items-center gap-[6px] !px-[20px]">
              <div className="flex w-full items-start justify-between">
                <div className="flex flex-col gap-[4px]">
                  <span className="text-[11px] font-bold" style={{ color: ink.meta, fontFamily: skin.war.font }}>Final Rank</span>
                  <GoldText solid className="text-[22px] font-bold leading-[24px]">
                    {boss.myRank ? `#${boss.myRank}` : "—"}
                    {boss.myRank ? <span className="text-[12px]"> {ORDINAL(boss.myRank)}</span> : null}
                  </GoldText>
                </div>
                <div className="flex flex-col items-end gap-[4px]">
                  <span className="text-[11px] font-bold" style={{ color: ink.meta, fontFamily: skin.war.font }}>Damage Done</span>
                  <div className="flex items-center gap-[4px]">
                    <img src={WAR_IMAGES.ui.ap} alt="" aria-hidden className="size-[22px] object-contain" />
                    <GoldText solid className="text-[22px] font-bold leading-[24px]">{fmt(boss.myDamage)}</GoldText>
                  </div>
                </div>
              </div>
              <span className="text-[9px]" style={{ color: ink.meta, fontFamily: skin.war.font }}>
                Rewards are currently being calculated
              </span>
            </WarCard>
            <div className="flex items-center gap-[8px]">
              <WarButton className="flex-1" onClick={() => onNavigate(WAR_VIEWS.RESULTS, { boss: boss.id })}>Results</WarButton>
              <WarButton className="flex-1" onClick={() => onNavigate(WAR_VIEWS.HISTORY)}>History</WarButton>
            </div>
            {data.nextStartsAt ? (
              <NextBossCountdown startsAt={data.nextStartsAt} />
            ) : null}
            {data.next ? <BossCard boss={data.next} onAttack={(b) => onNavigate(WAR_VIEWS.BATTLE, { boss: b.id })} /> : null}
          </>
        ) : lastAttack ? (
          <>
            <WarCard className="flex flex-col items-center gap-[6px] !px-[20px]">
              <GoldText solid className="text-[11px] font-bold">{lastAttack.critical ? "Critical Hit!" : "Hit!"}</GoldText>
              <div className="flex items-end gap-[4px]">
                <img src={WAR_IMAGES.ui.ap} alt="" aria-hidden className="size-[25px] object-contain" />
                <GoldText solid className="text-[24px] font-bold leading-[26px] tracking-[0.24px]">{fmt(lastAttack.damage)}</GoldText>
                <span className="text-[14px] leading-[24px]" style={{ color: ink.dmg, fontFamily: skin.war.font }}>DMG</span>
                <span className="ml-[8px] text-[15px] font-bold leading-[24px]" style={{ color: ink.meta, fontFamily: skin.war.font }}>
                  +{lastAttack.apUsed} AP used
                </span>
              </div>
              <span className="text-[10px] leading-[10px]" style={{ color: ink.meta, fontFamily: skin.war.font }}>
                Boss HP, your contribution and ranking update immediately.
              </span>
            </WarCard>
            <ApCard ap={ap} onAttack={handleAttack} busy={busy} disabled={noAp} />
            <div className="flex items-center gap-[8px]">
              <WarButton className="flex-1" onClick={() => onNavigate(WAR_VIEWS.REWARDS)}>Rewards</WarButton>
              <WarButton className="flex-1" onClick={() => onNavigate(WAR_VIEWS.LEADERBOARD, { boss: boss.id })}>Rankings</WarButton>
            </div>
          </>
        ) : noAp ? (
          <>
            <WarCard className="flex flex-col items-center gap-[8px] !px-[20px] text-center">
              <GoldText solid className="text-[14px] font-bold">0 ATTACK POINTS</GoldText>
              <span className="text-[10px]" style={{ color: ink.meta, fontFamily: skin.war.font }}>
                Earn Attack Points to continue fighting this boss.
              </span>
              <WarButton variant="attack" size="lg" className="mt-[4px] w-[149px]" disabled>
                ATTACK
              </WarButton>
            </WarCard>
            <InfoPlaque title="How to Earn Attack Points" className="mt-[12px]">
              <EarnApTiles tiles={earn.tiles} onAction={earn.onAction} busyId={earn.busyId} />
            </InfoPlaque>
          </>
        ) : (
          <>
            <WarCard spec={skin.war.statCard || skin.war.card} className="flex items-start justify-between !px-[14px]">
              <StatCell icon={WAR_IMAGES.ui.participants} label="Participants" value={boss.participants} />
              <StatCell icon={WAR_IMAGES.ui.damage} label="My Damage" value={boss.myDamage} />
              <StatCell icon={WAR_IMAGES.ui.total} label="Total Damage" value={boss.totalDamage} />
            </WarCard>
            <ApCard ap={ap} onAttack={handleAttack} busy={busy} disabled={noAp} />
            <WarButton className="mx-auto w-[150px]" onClick={() => onNavigate(WAR_VIEWS.INFO)}>Boss Info</WarButton>
            <InfoPlaque title="How to Earn Attack Points" className="mt-[12px]">
              <EarnApTiles tiles={earn.tiles} onAction={earn.onAction} busyId={earn.busyId} />
            </InfoPlaque>
          </>
        )}
      </div>
    </div>
  );
}
