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

/** Ink for copy sitting on a frame interior — the same on every skin except
 *  those whose frames are light inside (kgame99). */
export function useFrameInk() {
  const skin = useRpgSkin();
  return skin.war.inkFrame || skin.war.ink;
}

// ---------------------------------------------------------------------------
// Text
// ---------------------------------------------------------------------------

/** Gold gradient-filled text (the comps paint titles with an image fill).
 *  `solid` is for copy sitting on a light frame interior — kgame99's sky-blue
 *  panels make the gold gradient nearly unreadable, so those skins supply a
 *  dark ink instead (same call the leaderboard's --lb-heading makes). */
export function GoldText({ children, className = "", style, as: Tag = "span", solid = false }) {
  const skin = useRpgSkin();
  const ink = solid ? skin.war.frameInkSolid : null;
  if (ink) {
    return (
      <Tag
        className={className}
        style={{ color: ink, fontFamily: skin.war.font, textShadow: "0 1px 1px rgba(255,255,255,0.35)", ...style }}
      >
        {children}
      </Tag>
    );
  }
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
        // The gradient is clipped to the background box, so a descender that
        // hangs below a tight line-height (the comps set 28px on 32px text)
        // would simply vanish. Grow the box, cancel it in the layout.
        display: "inline-block",
        paddingBottom: "0.18em",
        marginBottom: "-0.18em",
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
  // Where the plaque art's opening actually is, per theme — acebet77 spends
  // 30% of its height on a crown, ep369 only 16%, so a shared padding put the
  // title below centre on most skins.
  const box = skin.war.titleInset;
  return (
    <div className="relative mx-auto h-[105px] w-full max-w-[358px]">
      {plaque ? (
        <img src={plaque} alt="" aria-hidden className="pointer-events-none absolute inset-0 size-full object-fill" draggable={false} />
      ) : (
        <div
          className="pointer-events-none absolute inset-x-[8px] bottom-[6px] top-[34px] rounded-[18px] border"
          style={{ background: skin.c.inset, borderColor: skin.c.edge, boxShadow: `0 0 24px ${skin.c.edgeSoft}` }}
        />
      )}
      <div
        className="absolute flex items-center justify-center overflow-hidden"
        style={{
          top: `${box.top}%`,
          bottom: `${box.bottom}%`,
          left: `${box.left}%`,
          right: `${box.right}%`,
        }}
      >
        <GoldText as="h1" className="w-full truncate text-center text-[30px] font-bold leading-[32px] tracking-[0.32px]">
          {children}
        </GoldText>
      </div>
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
  const fi = useFrameInk();
  const s = skin.war.plaque;
  return (
    <WarCard spec={s} className={`flex flex-col items-center gap-[10px] text-center ${className}`}>
      {!s.frame && WAR_IMAGES.ui.crown ? (
        <img src={WAR_IMAGES.ui.crown} alt="" aria-hidden className="pointer-events-none absolute -top-[18px] left-1/2 h-[34px] w-auto -translate-x-1/2" />
      ) : null}
      {title ? <GoldText solid className="text-[14px] font-bold">{title}</GoldText> : null}
      {lines.length ? (
        <div className="flex flex-col gap-[2px]">
          {lines.map((l) => (
            <p key={l} className="text-[10px] leading-[14px]" style={{ color: fi.meta, fontFamily: skin.war.font }}>
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
        // Themes without inactive-pill art dim the active pill instead.
        const art = isOn ? on : off || on;
        const dimmed = !isOn && !off && Boolean(on);
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
            {art ? (
              <img
                src={art}
                alt=""
                aria-hidden
                className="pointer-events-none absolute inset-0 size-full object-fill"
                style={dimmed ? { filter: "brightness(0.42) saturate(0.55)" } : undefined}
                draggable={false}
              />
            ) : null}
            <GoldText
              className="relative z-10 whitespace-nowrap text-[13px] font-bold leading-[12px]"
              style={isOn ? { filter: "drop-shadow(0 0 6px rgba(255,214,120,0.55))" } : { opacity: 0.62 }}
            >
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
      <GoldText
        solid
        className={`relative z-10 whitespace-nowrap font-bold ${text}`}
        style={variant === "attack" && skin.war.attackLabelBias ? { marginTop: `${skin.war.attackLabelBias * 100}%` } : undefined}
      >
        {children}
      </GoldText>
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
  // The themed plaque art already has a clock at its left end, so the label
  // is pushed past it. Without art we draw the clock and keep the pair
  // together rather than throwing the time to the far edge.
  // The box takes the artwork's own aspect: forcing every theme's plaque into
  // one 139x50 slot squashed the clock baked into it into an oval.
  return art ? (
    <div
      className="relative flex h-[42px] items-center justify-end"
      style={{ aspectRatio: String(skin.war.timerAspect), paddingLeft: "27%", paddingRight: "7%" }}
    >
      <img src={art} alt="" aria-hidden className="pointer-events-none absolute inset-0 size-full object-fill" draggable={false} />
      <span className="relative z-10 whitespace-nowrap text-[12px] font-bold tabular-nums" style={{ color: skin.war.ink.text, fontFamily: skin.war.font }}>
        {label}
      </span>
    </div>
  ) : (
    <div
      className="relative flex h-[34px] items-center gap-[7px] rounded-full border px-[12px]"
      style={{ background: skin.c.inset, borderColor: skin.c.edgeSoft }}
    >
      {WAR_IMAGES.ui.clock ? (
        <img src={WAR_IMAGES.ui.clock} alt="" aria-hidden className="size-[20px] shrink-0 object-contain" draggable={false} />
      ) : null}
      <span className="whitespace-nowrap text-[12px] font-bold tabular-nums" style={{ color: skin.war.ink.text, fontFamily: skin.war.font }}>
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
        {rank}
      </span>
    </div>
  );
}

/** Stat column: icon over label over value (Participants / My Damage / Total Damage). */
export function StatCell({ icon, label, value }) {
  const skin = useRpgSkin();
  const fi = skin.war.inkFrame || skin.war.ink;
  const onFrame = fi.text;
  const onFrameValue = fi.value;
  const shadow = skin.war.inkFrame ? "0 1px 1px rgba(255,255,255,0.35)" : "0 1px 2px rgba(0,0,0,0.75)";
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-[4px]">
      {icon ? <img src={icon} alt="" aria-hidden className="size-[28px] object-contain" draggable={false} /> : null}
      {/* Some stat plaques (kgame99) have a light sky interior; the shadow keeps the ink legible on both. */}
      <span className="text-[9px] leading-[10px]" style={{ color: onFrame, fontFamily: skin.war.font, textShadow: shadow }}>
        {label}
      </span>
      <span className="text-[15px] font-bold leading-[18px]" style={{ color: onFrameValue, fontFamily: skin.war.font, textShadow: shadow }}>
        {typeof value === "number" ? fmt(value) : value}
      </span>
    </div>
  );
}

/** The four "How to Earn Attack Points" tiles.
 *
 *  A station's tile art is a portrait frame. acebet77, n1gang and lv918 bake a
 *  CTA pill into the bottom of theirs (`earnTile.ctaBand`, measured off the
 *  art) — the label rides that band. The rest get a drawn pill. Content sits
 *  inside `earnTile.inset` so it never rides the frame's ornament. */
export function EarnApTiles({ tiles, onAction, busyId }) {
  const skin = useRpgSkin();
  const spec = skin.war.earnTile;
  const art = spec.frame;
  const ink = useFrameInk();
  const band = spec.ctaBand;
  const inset = spec.inset || 13;
  // Content stops above the CTA, wherever that ends up.
  const contentBottom = band ? 100 - band[0] + 2 : 26;

  return (
    <div className="flex w-full items-stretch justify-center gap-[6px]">
      {tiles.map((t) => {
        const disabled = busyId === t.id || (!t.href && t.claimable === false);
        const cta = busyId === t.id ? "..." : t.claimable === false && !t.href ? "Claimed" : t.cta;
        if (!art) {
          return (
            <div
              key={t.id}
              className="flex min-w-0 flex-1 flex-col items-center gap-[4px] rounded-[12px] border px-[2px] pb-[8px] pt-[6px]"
              style={{ background: skin.c.inset, borderColor: skin.c.edgeSoft }}
            >
              <GoldText solid className="text-[10px] font-bold">{t.label}</GoldText>
              <img src={t.icon} alt="" aria-hidden className="size-[40px] object-contain" draggable={false} />
              <span className="text-[8px] leading-[10px]" style={{ color: ink.meta, fontFamily: skin.war.font }}>
                {t.sub}
              </span>
              <WarButton size="sm" className="w-full max-w-[64px]" onClick={() => onAction(t)} disabled={disabled}>
                {cta}
              </WarButton>
            </div>
          );
        }
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onAction(t)}
            disabled={disabled}
            className="relative min-w-0 flex-1 disabled:cursor-not-allowed"
            style={{ opacity: disabled ? 0.72 : 1, aspectRatio: String(spec.aspect || 0.6) }}
          >
            <img src={art} alt="" aria-hidden className="pointer-events-none absolute inset-0 size-full object-fill" draggable={false} />
            <div
              className="absolute flex flex-col items-center justify-between"
              style={{ left: `${inset}%`, right: `${inset}%`, top: "17%", bottom: `${contentBottom}%` }}
            >
              <GoldText solid className="text-[9px] font-bold leading-[11px]">{t.label}</GoldText>
              <img src={t.icon} alt="" aria-hidden className="min-h-0 w-auto flex-1 object-contain py-[2px]" draggable={false} />
              <span className="text-[7.5px] leading-[9px]" style={{ color: ink.meta, fontFamily: skin.war.font }}>
                {t.sub}
              </span>
            </div>
            {band ? (
              <div
                className="absolute flex items-center justify-center"
                style={{ left: `${inset + 3}%`, right: `${inset + 3}%`, top: `${band[0]}%`, bottom: `${100 - band[1]}%` }}
              >
                <GoldText solid className="text-[9px] font-bold leading-none">{cta}</GoldText>
              </div>
            ) : (
              <div
                className="absolute flex items-center justify-center rounded-full border"
                style={{
                  left: `${inset + 1}%`,
                  right: `${inset + 1}%`,
                  bottom: "7%",
                  height: "13%",
                  background: skin.c.inset,
                  borderColor: skin.c.edgeSoft,
                }}
              >
                <GoldText solid className="text-[9px] font-bold leading-none">{cta}</GoldText>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Boss portrait with the station's hollow ornate frame laid over it. */
export function BossPortrait({ boss, dim = false, className = "", children }) {
  const skin = useRpgSkin();
  const frame = skin.war.bossFrame;
  return (
    <div className={`relative w-full overflow-hidden ${frame ? "aspect-[354/289]" : "h-[220px] rounded-[12px]"} ${className}`}>
      <div className={`absolute ${frame ? "inset-[6%] rounded-[6px]" : "inset-0"} overflow-hidden`} style={{ background: "rgba(0,0,0,0.55)" }}>
        {/* Sized as the comp does (2634:2382): ~87% of the opening's width,
            natural height, overflowing the opening top and bottom. */}
        <img
          src={boss.art}
          alt={boss.name}
          className="absolute left-1/2 top-[-4%] h-auto w-[87%] max-w-none -translate-x-1/2"
          style={{ filter: dim ? "grayscale(0.85) brightness(0.55)" : "none" }}
          draggable={false}
        />
      </div>
      {frame ? <img src={frame} alt="" aria-hidden className="pointer-events-none absolute inset-0 size-full object-fill" draggable={false} /> : null}
      {children}
    </div>
  );
}

/** Boss HP bar + readout, laid over the bottom of the portrait as in the comps. */
export function BossHp({ boss }) {
  const skin = useRpgSkin();
  // Deliberately `ink`, not the frame ink: this rides the boss art, not a panel.
  const ink = skin.war.ink;
  return (
    <div className="flex w-full flex-col items-center gap-[3px]">
      <HpBar pct={boss.hpPct} className="w-full" />
      <p className="text-[11px] leading-none" style={{ fontFamily: skin.war.font, color: ink.text, textShadow: "0 1px 3px rgba(0,0,0,0.9)" }}>
        <span style={{ color: ink.value }}>{fmt(boss.hp)}</span> / {fmt(boss.hpMax)}
      </p>
    </div>
  );
}

/** Labeled section block (Boss Info / How to Earn). */
export function SectionCard({ label, title, children, className = "", action }) {
  const skin = useRpgSkin();
  const fi = useFrameInk();
  // `row`, not `card`: the comps dress these blocks with the wide jewelled
  // frame. ubetclub's card art is square, so stretching it across a short wide
  // block smeared the interior.
  return (
    <WarCard spec={skin.war.row} className={`flex flex-col gap-[4px] ${className}`}>
      {label ? (
        <span className="text-[9px] font-bold tracking-[1px]" style={{ color: fi.meta, fontFamily: skin.war.font }}>
          {label}
        </span>
      ) : null}
      <div className="flex items-start justify-between gap-[10px]">
        <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
          {title ? <GoldText solid className="text-[12px] font-bold">{title}</GoldText> : null}
          <div className="text-[10px] leading-[15px]" style={{ color: fi.text, fontFamily: skin.war.font }}>
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
