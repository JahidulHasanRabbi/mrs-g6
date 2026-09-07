"use client";

// Boss War building blocks. Every piece reads `skin.war.*` off the RPG skin:
// a station ships frame art (9-sliced so the ornament survives any box), the
// default look falls back to CSS borders and gradients.

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { nineSlice, useRpgSkin } from "../rpg/rpgSkin";
import { WAR_IMAGES, gemFor, rankBadgeFor } from "./warAssets";
import { fmt } from "./constants";

// ---------------------------------------------------------------------------
// Time
// ---------------------------------------------------------------------------

function splitLeft(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return { days, hms: `${pad(h)}:${pad(m)}:${pad(s)}`, done: total === 0 };
}

/** Live countdown to an ISO timestamp → { days, hms, done, label }. */
export function useCountdown(endsAt) {
  const target = endsAt ? new Date(endsAt).getTime() : null;
  const [left, setLeft] = useState(() => splitLeft(target ? target - Date.now() : 0));
  useEffect(() => {
    if (!target) return undefined;
    setLeft(splitLeft(target - Date.now()));
    const id = setInterval(() => setLeft(splitLeft(target - Date.now())), 1000);
    return () => clearInterval(id);
  }, [target]);
  const label = !target ? "--:--:--" : left.days > 0 ? `${left.days}d ${left.hms}` : left.hms;
  return { ...left, label };
}

// ---------------------------------------------------------------------------
// Text
// ---------------------------------------------------------------------------

/** Gold gradient-filled text (the comps paint titles with an image fill). */
export function GoldText({ children, className = "", style, as: Tag = "span" }) {
  const skin = useRpgSkin();
  return (
    <Tag
      className={className}
      style={{
        backgroundImage: skin.war.titleGradient,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        fontFamily: skin.war.font,
        filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.6))",
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}

// ---------------------------------------------------------------------------
// Header plaque
// ---------------------------------------------------------------------------

export function WarTitle({ children }) {
  const skin = useRpgSkin();
  const plaque = skin.war.titlePlaque;
  return (
    <div className="relative mx-auto flex h-[105px] w-full max-w-[358px] items-center justify-center px-[10px] pb-[10px] pt-[40px]">
      {plaque ? (
        <img src={plaque} alt="" aria-hidden className="pointer-events-none absolute inset-0 size-full object-fill" draggable={false} />
      ) : (
        <div
          className="pointer-events-none absolute inset-x-[8px] bottom-[6px] top-[34px] rounded-[18px] border"
          style={{ background: skin.c.inset, borderColor: skin.c.edge, boxShadow: `0 0 24px ${skin.c.edgeSoft}` }}
        />
      )}
      <GoldText as="h1" className="relative z-10 text-center text-[32px] font-bold leading-[28px] tracking-[0.32px]">
        {children}
      </GoldText>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Framed containers
// ---------------------------------------------------------------------------

/** Ornate content card (boss card, stat card, attack card). */
export function WarCard({ children, className = "", style, spec }) {
  const skin = useRpgSkin();
  const s = spec || skin.war.card;
  if (!s.frame) {
    return (
      <div
        className={`relative w-full rounded-[16px] border ${className}`}
        style={{ background: skin.panel.fillDark, borderColor: skin.c.edgeSoft, padding: s.pad, ...style }}
      >
        {children}
      </div>
    );
  }
  return (
    <div className={`relative w-full ${className}`} style={{ ...nineSlice(s), ...style }}>
      {children}
    </div>
  );
}

/** Crowned wide plaque ("How to Earn Attack Points", "How to Earn Rewards"). */
export function InfoPlaque({ title, lines = [], children, className = "" }) {
  const skin = useRpgSkin();
  const s = skin.war.plaque;
  return (
    <WarCard spec={s} className={`flex flex-col items-center gap-[10px] text-center ${className}`}>
      {!s.frame && WAR_IMAGES.ui.crown ? (
        <img src={WAR_IMAGES.ui.crown} alt="" aria-hidden className="pointer-events-none absolute -top-[18px] left-1/2 h-[34px] w-auto -translate-x-1/2" />
      ) : null}
      {title ? <GoldText className="text-[14px] font-bold">{title}</GoldText> : null}
      {lines.length ? (
        <div className="flex flex-col gap-[2px]">
          {lines.map((l) => (
            <p key={l} className="text-[10px] leading-[14px]" style={{ color: skin.war.ink.meta, fontFamily: skin.war.font }}>
              {l}
            </p>
          ))}
        </div>
      ) : null}
      {children}
    </WarCard>
  );
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------

/** Pill tab strip (Daily / Weekly / Event, Total Damage / My Ranking, …). */
export function WarTabs({ tabs, active, onChange, className = "" }) {
  const skin = useRpgSkin();
  const { on, off } = skin.war.tab;
  return (
    <div className={`flex w-full items-center gap-[8px] ${className}`} role="tablist">
      {tabs.map((t) => {
        const isOn = t.id === active;
        const art = isOn ? on : off || on;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={isOn}
            onClick={() => onChange(t.id)}
            className="relative flex h-[36px] min-w-0 flex-1 items-center justify-center transition-transform active:scale-95"
            style={
              art
                ? undefined
                : {
                    borderRadius: 18,
                    border: `1px solid ${isOn ? skin.c.accent : skin.c.edgeSoft}`,
                    background: isOn ? skin.c.rowActive : skin.c.inset,
                    boxShadow: isOn ? `0 0 12px ${skin.c.accent}55` : "none",
                  }
            }
          >
            {art ? <img src={art} alt="" aria-hidden className="pointer-events-none absolute inset-0 size-full object-fill" draggable={false} /> : null}
            <GoldText className="relative z-10 whitespace-nowrap text-[13px] font-bold leading-[12px]" style={isOn ? undefined : { opacity: 0.8 }}>
              {t.label}
            </GoldText>
          </button>
        );
      })}
    </div>
  );
}

/** Plaque button: the ATTACK button and the wide Rewards / Rankings pills. */
export function WarButton({ children, onClick, disabled, variant = "pill", className = "", size = "md" }) {
  const skin = useRpgSkin();
  const art = variant === "attack" ? skin.war.attackBtn : skin.war.pill;
  const dims = size === "sm" ? "h-[30px]" : size === "lg" ? "h-[52px]" : "h-[44px]";
  const text = size === "sm" ? "text-[10.5px]" : size === "lg" ? "text-[15px]" : "text-[14px]";
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      className={`relative flex items-center justify-center ${dims} ${className} disabled:cursor-not-allowed`}
      style={
        art
          ? { opacity: disabled ? 0.55 : 1, filter: disabled ? "grayscale(0.6)" : "none" }
          : {
              borderRadius: 22,
              border: `1px solid ${disabled ? skin.c.edgeSoft : skin.c.accent}`,
              background: disabled ? skin.c.muted : skin.c.rowActive,
              boxShadow: disabled ? "none" : `0 0 14px ${skin.c.accent}55`,
            }
      }
    >
      {art ? <img src={art} alt="" aria-hidden className="pointer-events-none absolute inset-0 size-full object-fill" draggable={false} /> : null}
      <GoldText className={`relative z-10 whitespace-nowrap font-bold ${text}`}>{children}</GoldText>
    </motion.button>
  );
}

/** "DAILY BOSS" type chip with the crown. */
export function TypeChip({ children }) {
  const skin = useRpgSkin();
  return (
    <div className="relative flex h-[38px] w-[125px] items-center justify-center pb-[12px] pl-[29px] pr-[12px] pt-[8px]">
      {skin.war.chip ? (
        <img src={skin.war.chip} alt="" aria-hidden className="pointer-events-none absolute inset-0 size-full object-fill" draggable={false} />
      ) : (
        <div className="pointer-events-none absolute inset-x-0 inset-y-[6px] rounded-full" style={{ background: "linear-gradient(90deg,#7b1fa2,#c2185b)" }} />
      )}
      <span className="relative z-10 whitespace-nowrap text-[12px] font-bold text-white" style={{ fontFamily: skin.war.font }}>
        {children}
      </span>
    </div>
  );
}

/** Clock plaque with a live countdown. */
export function TimerPlaque({ endsAt }) {
  const skin = useRpgSkin();
  const { label } = useCountdown(endsAt);
  const art = skin.war.timer;
  return (
    <div className="relative flex h-[50px] w-[139px] items-center justify-end pb-[10px] pl-[35px] pr-[12px] pt-[15px]">
      {art ? (
        <img src={art} alt="" aria-hidden className="pointer-events-none absolute inset-0 size-full object-fill" draggable={false} />
      ) : (
        <div className="pointer-events-none absolute inset-x-0 inset-y-[10px] rounded-full border" style={{ background: skin.c.inset, borderColor: skin.c.edgeSoft }} />
      )}
      {!art && WAR_IMAGES.ui.clock ? (
        <img src={WAR_IMAGES.ui.clock} alt="" aria-hidden className="absolute left-[8px] top-1/2 size-[24px] -translate-y-1/2" />
      ) : null}
      <span className="relative z-10 whitespace-nowrap text-[12px] font-bold tabular-nums" style={{ color: skin.war.ink.text, fontFamily: skin.war.font }}>
        {label}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Data display
// ---------------------------------------------------------------------------

export function HpBar({ pct, height = 14, className = "" }) {
  const skin = useRpgSkin();
  const { track, border, fill } = skin.war.hp;
  return (
    <div className={`overflow-hidden rounded-full border ${className}`} style={{ height, background: track, borderColor: border }}>
      <motion.div
        className="h-full rounded-r-[9px]"
        style={{ background: fill }}
        initial={false}
        animate={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
        transition={{ type: "spring", stiffness: 90, damping: 20 }}
      />
    </div>
  );
}

export function GemIcon({ gem, size = 26, className = "" }) {
  return <img src={gemFor(gem)} alt="" aria-hidden className={`object-contain ${className}`} style={{ width: size, height: size }} draggable={false} />;
}

export function RankBadge({ rank, size = 34 }) {
  const skin = useRpgSkin();
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <img src={rankBadgeFor(rank)} alt="" aria-hidden className="absolute inset-0 size-full object-contain" draggable={false} />
      <span
        className="absolute inset-0 flex items-center justify-center pb-[2px] text-[11px] font-bold text-white"
        style={{ fontFamily: skin.war.font, textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}
      >
        {rank > 3 ? `#${rank}` : rank}
      </span>
    </div>
  );
}

/** Stat column: icon over label over value (Participants / My Damage / Total Damage). */
export function StatCell({ icon, label, value }) {
  const skin = useRpgSkin();
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-[4px]">
      {icon ? <img src={icon} alt="" aria-hidden className="size-[28px] object-contain" draggable={false} /> : null}
      <span className="text-[9px] leading-[10px]" style={{ color: skin.war.ink.meta, fontFamily: skin.war.font }}>
        {label}
      </span>
      <span className="text-[15px] font-bold leading-[18px]" style={{ color: skin.war.ink.value, fontFamily: skin.war.font }}>
        {typeof value === "number" ? fmt(value) : value}
      </span>
    </div>
  );
}

/** The four "How to Earn Attack Points" tiles. */
export function EarnApTiles({ tiles, onAction, busyId }) {
  const skin = useRpgSkin();
  const spec = skin.war.earnTile;
  return (
    <div className="flex w-full items-stretch justify-center gap-[6px]">
      {tiles.map((t) => (
        <div
          key={t.id}
          className={`flex min-w-0 flex-1 flex-col items-center gap-[4px] ${spec.frame ? "" : "rounded-[12px] border"}`}
          style={spec.frame ? nineSlice(spec) : { padding: spec.pad, background: skin.c.inset, borderColor: skin.c.edgeSoft }}
        >
          <GoldText className="text-[10px] font-bold">{t.label}</GoldText>
          <img src={t.icon} alt="" aria-hidden className="size-[40px] object-contain" draggable={false} />
          <span className="text-[8px] leading-[10px]" style={{ color: skin.war.ink.meta, fontFamily: skin.war.font }}>
            {t.sub}
          </span>
          <WarButton size="sm" className="w-full max-w-[64px]" onClick={() => onAction(t)} disabled={busyId === t.id || (!t.href && t.claimable === false)}>
            {busyId === t.id ? "..." : t.claimable === false && !t.href ? "Claimed" : t.cta}
          </WarButton>
        </div>
      ))}
    </div>
  );
}

/** Labeled section block (Boss Info / How to Earn). */
export function SectionCard({ label, title, children, className = "", action }) {
  const skin = useRpgSkin();
  return (
    <WarCard className={`flex flex-col gap-[4px] ${className}`}>
      {label ? (
        <span className="text-[9px] font-bold tracking-[1px]" style={{ color: skin.war.ink.meta, fontFamily: skin.war.font }}>
          {label}
        </span>
      ) : null}
      <div className="flex items-start justify-between gap-[10px]">
        <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
          {title ? <GoldText className="text-[12px] font-bold">{title}</GoldText> : null}
          <div className="text-[10px] leading-[15px]" style={{ color: skin.war.ink.text, fontFamily: skin.war.font }}>
            {children}
          </div>
        </div>
        {action}
      </div>
    </WarCard>
  );
}

/** Centered loading / empty / error line. */
export function StateLine({ children }) {
  const skin = useRpgSkin();
  return (
    <p className="py-[28px] text-center text-[12px] tracking-[2px]" style={{ color: skin.c.textDim, fontFamily: skin.war.font }}>
      {children}
    </p>
  );
}
