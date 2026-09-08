"use client";

// Boss War building blocks. Every piece reads `skin.war.*` off the RPG skin:
// a station ships frame art (9-sliced so the ornament survives any box), the
// default look falls back to CSS borders and gradients.

import { Children, createContext, isValidElement, useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { nineSlice, useRpgSkin } from "../rpg/rpgSkin";
import { WAR_IMAGES, gemFor } from "./warAssets";
import { fmt, GEM_TINT } from "./constants";

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

/** Whether the frame we are inside is light or dark on the interior. WarCard
 *  publishes it; nothing outside a frame reads it. */
const OnDarkFrame = createContext(false);

/** Ink for copy sitting on a frame interior. A skin with light frames supplies
 *  `inkFrame`, but kgame99's are mixed — sky-blue cards, dark navy rows — so a
 *  frame named in `darkFrames` keeps the light ink (its dark navy measured
 *  1.0:1 against those rows). */
export function useFrameInk(spec) {
  const skin = useRpgSkin();
  const fromContext = useContext(OnDarkFrame);
  // A component that renders its own WarCard sits ABOVE the provider, so it
  // has to name the frame it is about to draw into; anything nested reads it
  // off the context instead.
  const frame = (spec === undefined ? skin.war.card : spec)?.frame;
  const onDark = spec === undefined ? fromContext : !frame || (skin.war.darkFrames || []).includes(frame);
  if (onDark) return skin.war.ink;
  return skin.war.inkFrame || skin.war.ink;
}

/** The solid colour GoldText falls back to on a light frame interior. */
function useSolidInk() {
  const skin = useRpgSkin();
  return useContext(OnDarkFrame) ? null : skin.war.frameInkSolid;
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
  const solidInk = useSolidInk();
  const ink = solid ? solidInk : null;
  const fill = ink
    ? { color: ink, textShadow: "0 1px 1px rgba(255,255,255,0.35)" }
    : {
        backgroundImage: skin.war.titleGradient,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.6))",
        // The gradient is clipped to the background box, so a descender that
        // hangs below a tight line-height (the comps set 28px on 32px text)
        // would simply vanish. Grow the box, cancel it in the layout.
        display: "inline-block",
        paddingBottom: "0.18em",
        marginBottom: "-0.18em",
      };
  return (
    <Tag className={className} style={{ fontFamily: skin.war.font, ...fill, ...style }}>
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

/** Ornate content card (boss card, stat card, attack card). Pass `hover` to make
 *  it lift and cast a gold glow under the pointer (the drop-shadow hugs the
 *  frame art's own alpha, so a 9-sliced ornament glows by its shape). */
export function WarCard({ children, className = "", style, spec, hover = false }) {
  const skin = useRpgSkin();
  const s = spec || skin.war.card;
  // An unframed card is always dark inside; a framed one is dark only if the
  // skin lists it that way.
  const onDark = !s.frame || (skin.war.darkFrames || []).includes(s.frame);
  const hoverAnim = hover
    ? {
        whileHover: { scale: 1.03, y: -4, filter: "drop-shadow(0 8px 22px rgba(242,203,122,0.5))" },
        transition: { type: "spring", stiffness: 320, damping: 24 },
      }
    : null;
  const body = !s.frame ? (
    <motion.div
      className={`relative w-full rounded-[16px] border ${className}`}
      style={{ background: skin.panel.fillDark, borderColor: skin.c.edgeSoft, padding: s.pad, ...style }}
      {...hoverAnim}
    >
      {children}
    </motion.div>
  ) : (
    <motion.div
      className={`relative w-full ${className}`}
      style={{ ...nineSlice(s), ...style }}
      {...hoverAnim}
    >
      {children}
    </motion.div>
  );
  return <OnDarkFrame.Provider value={onDark}>{body}</OnDarkFrame.Provider>;
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
// Attention
// ---------------------------------------------------------------------------

// A warm gold that reads on every station's dark battle backdrop, kept as rgba
// so it composes without depending on any skin token being a 6-digit hex.
const GOLD_GLOW = (a) => `rgba(242, 203, 122, ${a})`;

/** Soft pulsing gold aura that sits BEHIND a CTA to pull the eye onto it.
 *  Render it as the first child of a `relative` box; it spills past the box on
 *  purpose (the button is never `overflow-hidden`) so the halo is visible. */
export function AttentionGlow({ radius = 22, className = "" }) {
  return (
    <motion.span
      aria-hidden
      className={`pointer-events-none absolute -inset-[7px] ${className}`}
      style={{ borderRadius: radius + 7, background: `radial-gradient(closest-side, ${GOLD_GLOW(0.5)}, ${GOLD_GLOW(0)} 78%)` }}
      animate={{ opacity: [0.35, 0.85, 0.35], scale: [0.9, 1.07, 0.9] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
    />
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
            className="relative flex h-[36px] min-w-0 flex-1 items-center justify-center transition-transform hover:scale-[1.05] active:scale-95"
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
export function WarButton({ children, onClick, disabled, variant = "pill", className = "", size = "md", style }) {
  const skin = useRpgSkin();
  const art = variant === "attack" ? skin.war.attackBtn : skin.war.pill;
  const dims = size === "sm" ? "h-[30px]" : size === "lg" ? "h-[52px]" : "h-[44px]";
  const text = size === "sm" ? "text-[10.5px]" : size === "lg" ? "text-[15px]" : "text-[14px]";
  const win = variant === "attack" && art ? skin.war.attackWindow : null;
  const labelBox = win
    ? { position: "absolute", left: `${win[0]}%`, right: `${100 - win[1]}%`, top: `${win[2]}%`, bottom: `${100 - win[3]}%` }
    : variant === "attack" && skin.war.attackLabelBias
      ? { marginTop: `${skin.war.attackLabelBias * 100}%` }
      : undefined;
  // The attack plaque is the whole screen's call to action, so when it's live
  // it breathes, glows and catches a periodic shine to keep the eye on it.
  const attention = variant === "attack" && !disabled;
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      animate={attention ? { scale: [1, 1.045, 1] } : undefined}
      transition={attention ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" } : undefined}
      className={`relative flex items-center justify-center ${dims} ${className} disabled:cursor-not-allowed`}
      style={{
        ...(art
          ? { opacity: disabled ? 0.55 : 1, filter: disabled ? "grayscale(0.6)" : "none" }
          : {
              borderRadius: 22,
              border: `1px solid ${disabled ? skin.c.edgeSoft : skin.c.accent}`,
              background: disabled ? skin.c.muted : skin.c.rowActive,
              boxShadow: disabled ? "none" : `0 0 14px ${skin.c.accent}55`,
            }),
        ...style,
      }}
    >
      {attention ? <AttentionGlow radius={22} /> : null}
      {art ? <img src={art} alt="" aria-hidden className="pointer-events-none absolute inset-0 size-full object-fill" draggable={false} /> : null}
      {/* Shine sweep, masked to the plaque art so the light band never spills
          past the ornament onto the button's transparent corners. */}
      {attention && art ? (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            WebkitMaskImage: `url(${art})`,
            maskImage: `url(${art})`,
            WebkitMaskSize: "100% 100%",
            maskSize: "100% 100%",
            background: "linear-gradient(105deg, transparent 42%, rgba(255,255,255,0.55) 50%, transparent 58%)",
            backgroundSize: "260% 100%",
          }}
          animate={{ backgroundPositionX: ["150%", "-60%"] }}
          transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.3, ease: "easeInOut" }}
        />
      ) : null}
      {/* Every ATTACK plaque hangs an ornament off its top, so the opening's
          centre sits 55-61% down the art. Centring the label on the box put it
          visibly high; it takes the measured window instead. */}
      <GoldText
        solid
        className={`relative z-10 flex items-center justify-center whitespace-nowrap font-bold ${text}`}
        style={labelBox}
      >
        {children}
      </GoldText>
    </motion.button>
  );
}

// The chip and the timer plaque sit side by side, but their art frames the
// pill very differently (acebet77 hangs a crown above its plaque, ep369 spends
// the whole file on the pill). Both boxes are therefore derived from a shared
// pill height and nudged so the two pills share one centre line.
const PILL_BODY_H = 30;

function pillMetrics([top, bottom]) {
  const height = Math.round(PILL_BODY_H / ((bottom - top) / 100));
  return { height, bias: Math.round((0.5 - (top + bottom) / 200) * height) };
}

/** "DAILY BOSS" type chip with the crown. */
export function TypeChip({ children }) {
  const skin = useRpgSkin();
  const spec = skin.war.chipSpec;
  const { height, bias } = pillMetrics(spec.body);
  const [aw, ah] = spec.art;
  const [t, r, b, l] = spec.slice;
  // One scale for all four caps, from the art's own height — the crown keeps
  // its shape only if its border box scales like the slice it comes from.
  const k = height / ah;
  const px = (v, span) => `${Math.round((v / 100) * span * k)}px`;
  return (
    <div
      className="relative flex shrink-0 items-center justify-center"
      style={{
        height,
        transform: `translateY(${bias}px)`,
        ...nineSlice({
          frame: spec.frame,
          slice: `${t}% ${r}% ${b}% ${l}% fill`,
          width: `${px(t, ah)} ${px(r, aw)} ${px(b, ah)} ${px(l, aw)}`,
          // The caps stop flush against the crown and the gem, so this is the
          // whole visible gap either side of the label — the box grows to fit.
          pad: "0 14px",
        }),
      }}
    >
      <span className="whitespace-nowrap text-[11.5px] font-bold leading-none text-white" style={{ fontFamily: skin.war.font }}>
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
  // The box takes the artwork's own aspect: forcing every theme's plaque into
  // one 139x50 slot squashed the clock baked into it into an oval. The label
  // then sits centred in the plaque's measured window, clear of both the
  // clock at the left end and the gem at the right.
  const [wl, wr, wt, wb] = skin.war.timerWindow;
  const { height, bias } = pillMetrics(skin.war.timerBody);
  return art ? (
    <div
      className="relative shrink-0"
      style={{ height, aspectRatio: String(skin.war.timerAspect), transform: `translateY(${bias}px)` }}
    >
      <img src={art} alt="" aria-hidden className="pointer-events-none absolute inset-0 size-full object-fill" draggable={false} />
      <span
        className="absolute flex items-center justify-center overflow-hidden whitespace-nowrap text-[12px] font-bold leading-none tabular-nums"
        style={{
          left: `${wl}%`,
          right: `${100 - wr}%`,
          top: `${wt}%`,
          bottom: `${100 - wb}%`,
          color: skin.war.ink.text,
          fontFamily: skin.war.font,
        }}
      >
        {label}
      </span>
    </div>
  ) : (
    // No plaque art: draw the clock and keep the pair together rather than
    // throwing the time to the far edge.
    <div
      className="relative flex h-[34px] shrink-0 items-center gap-[7px] rounded-full border px-[12px]"
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
      <img src={WAR_IMAGES.rankBadge} alt="" aria-hidden className="absolute inset-0 size-full object-contain" draggable={false} />
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
  const fi = useFrameInk();
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

// Every comp sizes the four tiles identically whatever the station's frame-art
// aspect (0.34–0.74); the art stretches to the tile and the %-based `box`/
// `ctaBand` insets ride along. Rendering at each art's own aspect towered the
// narrow skins (ep369 0.39, kgame99 0.34) to 218px, over the bottom nav.
const EARN_TILE_ASPECT = 0.56;
// Cap the tile so four across never balloon on the wider `max-w-475` column —
// they stay comp-sized and centre with breathing room inside the plaque.
const EARN_TILE_MAX_W = 84;
// Extra inset added to every measured `box` edge so the label/icon/CTA clear
// the frame's gold rail on all four sides.
const EARN_BOX_PAD = 3;

/** The four "How to Earn Attack Points" tiles.
 *
 *  A station's tile art is a portrait frame. acebet77, n1gang and lv918 bake a
 *  CTA pill into the bottom of theirs (`earnTile.ctaBand`, measured off the
 *  art) — the label rides that band. The rest get a drawn pill inside the
 *  interior. Everything — label, icon, CTA — lives in `earnTile.box`, the
 *  interior measured off that station's own art (tools/frame_grid.py). */
export function EarnApTiles({ tiles, onAction, busyId }) {
  const skin = useRpgSkin();
  const spec = skin.war.earnTile;
  const art = spec.frame;
  const ink = useFrameInk();
  const band = spec.ctaBand;
  const [boxT, boxR, artBottom, boxL] = spec.box || [18, 16, 18, 16];
  // A baked pill ends the interior where it starts.
  const boxB = band ? Math.max(artBottom, 102 - band[0]) : artBottom;
  // Space between tiles. Per-theme because a skin whose frame art carries wide
  // side ornaments reads as too far apart at the shared default.
  const gap = spec.gap ?? 10;

  return (
    <div className="flex w-full items-stretch justify-center" style={{ gap: `${gap}px` }}>
      {tiles.map((t) => {
        const disabled = busyId === t.id || (!t.href && t.claimable === false);
        const cta = busyId === t.id ? "..." : t.claimable === false && !t.href ? "Claimed" : t.cta;
        // Deposit is the highest-value way to gain AP — give its tile the same
        // gold pull as the ATTACK plaque so long as it's still claimable.
        const lure = t.id === "deposit" && !disabled;
        if (!art) {
          return (
            <motion.div
              key={t.id}
              className="relative flex min-w-0 flex-1 flex-col items-center gap-[4px] rounded-[12px] border px-[2px] pb-[8px] pt-[6px]"
              style={{ background: skin.c.inset, borderColor: lure ? GOLD_GLOW(0.9) : skin.c.edgeSoft }}
              animate={lure ? { scale: [1, 1.035, 1] } : undefined}
              transition={lure ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" } : undefined}
            >
              {lure ? <AttentionGlow radius={12} /> : null}
              <GoldText solid className="text-[10px] font-bold">{t.label}</GoldText>
              <img src={t.icon} alt="" aria-hidden className="size-[40px] object-contain" draggable={false} />
              <span className="text-[9px] leading-[11px]" style={{ color: ink.meta, fontFamily: skin.war.font }}>
                {t.sub}
              </span>
              <WarButton size="sm" className="w-full max-w-[64px]" onClick={() => onAction(t)} disabled={disabled}>
                {cta}
              </WarButton>
            </motion.div>
          );
        }
        return (
          <motion.button
            key={t.id}
            type="button"
            onClick={() => onAction(t)}
            disabled={disabled}
            className="relative min-w-0 flex-1 disabled:cursor-not-allowed"
            style={{ opacity: disabled ? 0.72 : 1, aspectRatio: String(EARN_TILE_ASPECT), maxWidth: EARN_TILE_MAX_W }}
            animate={lure ? { scale: [1, 1.04, 1] } : undefined}
            transition={lure ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" } : undefined}
          >
            {lure ? <AttentionGlow radius={14} /> : null}
            <img src={art} alt="" aria-hidden className="pointer-events-none absolute inset-0 size-full object-fill" draggable={false} />
            <div
              className="absolute flex flex-col items-center justify-between gap-[2px] overflow-hidden"
              style={{ left: `${boxL + EARN_BOX_PAD}%`, right: `${boxR + EARN_BOX_PAD}%`, top: `${boxT + EARN_BOX_PAD}%`, bottom: `${boxB + EARN_BOX_PAD}%` }}
            >
              <GoldText solid className="max-w-full text-[9px] font-bold leading-[11px]">{t.label}</GoldText>
              {/* Capped on BOTH axes so the glyph sits centred with clear margin
                  inside the opening — off the side rails and never grown by
                  flex-1 to fill the whole interior height. */}
              <img src={t.icon} alt="" aria-hidden className="min-h-0 w-[66%] max-h-[46%] flex-1 object-contain" draggable={false} />
              <span className="max-w-full text-[9px] leading-[11px]" style={{ color: ink.meta, fontFamily: skin.war.font }}>
                {t.sub}
              </span>
              {band ? null : (
                <div
                  className="relative flex h-[15px] w-full shrink-0 items-center justify-center"
                  style={
                    // The station's own pill, not a flat dark fill: skin.c.inset
                    // is a black translucent and read as a hole punched in
                    // ubetclub's red tile (comp 2642:3435).
                    skin.war.pill
                      ? undefined
                      : { borderRadius: 999, border: `1px solid ${skin.c.edgeSoft}`, background: skin.c.inset }
                  }
                >
                  {skin.war.pill ? (
                    <img src={skin.war.pill} alt="" aria-hidden className="pointer-events-none absolute inset-0 size-full object-fill" draggable={false} />
                  ) : null}
                  <GoldText solid className="relative z-10 text-[9px] font-bold leading-none">{cta}</GoldText>
                </div>
              )}
            </div>
            {band ? (
              <div
                className="absolute flex items-center justify-center"
                style={{ left: `${boxL + 3}%`, right: `${boxR + 3}%`, top: `${band[0]}%`, bottom: `${100 - band[1]}%` }}
              >
                <GoldText solid className="text-[9px] font-bold leading-none">{cta}</GoldText>
              </div>
            ) : null}
          </motion.button>
        );
      })}
    </div>
  );
}

/** Boss portrait with the station's hollow ornate frame laid over it.
 *
 *  Both the box aspect and the opening come off the artwork (gen_skins.py):
 *  a shared 354/289 stretched acebet77's 1.08 frame 13% wide and squeezed the
 *  opening so short that a third of the boss was cut away. `children` are
 *  positioned against the opening, never the box, so nothing rides the rails.
 *  `aspect` overrides the art's own box — the list card's thumbnail is near
 *  square (BOSS_THUMB_ASPECT); `scrim` is the band the battle screen's readout
 *  sits on, which a card has nothing to put there. */
export function BossPortrait({ boss, dim = false, className = "", children, aspect, scrim = true, backdrop = "rgba(0,0,0,0.55)", zoomOnHover = false }) {
  const skin = useRpgSkin();
  const { art: frame, aspect: artAspect, open } = skin.war.bossFrame;
  const [t, r, b, l] = open;
  const box = aspect || (frame ? artAspect : null);
  return (
    <div
      className={`relative overflow-hidden ${box ? "" : "h-[220px]"} ${frame ? "" : "rounded-[12px]"} ${className}`}
      style={box ? { aspectRatio: String(box) } : undefined}
    >
      <div
        className={`absolute overflow-hidden ${frame ? "rounded-[6px]" : "inset-0"}`}
        style={frame ? { top: `${t}%`, right: `${r}%`, bottom: `${b}%`, left: `${l}%`, background: backdrop } : { background: backdrop }}
      >
        {/* Top-anchored cover: the art is a tall portrait and every opening is
            landscape, so something has to go — losing the throne base beats
            cropping the boss's head. The caption band below sits on that crop. */}
        <img
          src={boss.art}
          alt={boss.name}
          className={`absolute inset-0 size-full object-cover ${zoomOnHover ? "transition-transform duration-[600ms] ease-out group-hover:scale-[1.12]" : ""}`}
          style={{ objectPosition: "50% 4%", filter: dim ? "grayscale(0.85) brightness(0.55)" : "none" }}
          draggable={false}
        />
        {scrim ? (
          /* The illustration is busy and mid-tone right where the readout sits. */
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%]"
            style={{ background: "linear-gradient(180deg, rgba(6,4,2,0) 0%, rgba(6,4,2,0.62) 45%, rgba(6,4,2,0.88) 100%)" }}
          />
        ) : null}
      </div>
      {frame ? <img src={frame} alt="" aria-hidden className="pointer-events-none absolute inset-0 size-full object-fill" draggable={false} /> : null}
      {children}
    </div>
  );
}

/** The reward plaque on a boss list card (comp 2642:3294): the tier's colour
 *  under the shared hollow badge frame, the gem, and the "Reward" caption. */
export function RewardBadge({ gem }) {
  const skin = useRpgSkin();
  const art = WAR_IMAGES.ui.rewardBadge;
  return (
    <div className="relative flex h-[48px] w-[38px] shrink-0 flex-col items-center gap-[5px] pt-[5px]">
      <div
        className="absolute inset-[2px] rounded-[4px]"
        style={{ background: GEM_TINT[gem] || GEM_TINT.common, border: art ? "none" : `1px solid ${skin.c.edgeSoft}` }}
      />
      <GemIcon gem={gem} size={23} className="relative" />
      <span className="relative text-[6.5px] leading-[8px]" style={{ color: skin.war.ink.value, fontFamily: skin.war.font }}>
        Reward
      </span>
      {art ? <img src={art} alt="" aria-hidden className="pointer-events-none absolute inset-0 size-full object-fill" draggable={false} /> : null}
    </div>
  );
}

/** The opening's inset as a style object, so overlays inside a BossPortrait
 *  can be positioned against the frame's hollow rather than its box. */
export function useBossOpening(pad = 0) {
  const [t, r, b, l] = useRpgSkin().war.bossFrame.open;
  return { top: `${t + pad}%`, right: `${r + pad}%`, bottom: `${b + pad}%`, left: `${l + pad}%` };
}

/** Boss HP bar + readout, laid over the bottom of the portrait as in the comps. */
export function BossHp({ boss }) {
  const skin = useRpgSkin();
  // Deliberately `ink`, not the frame ink: this rides the boss art, not a panel.
  const ink = skin.war.ink;
  return (
    <div className="flex w-full flex-col items-center gap-[4px]">
      <HpBar pct={boss.hpPct} className="w-full" />
      <p
        className="text-[12px] font-bold leading-none tabular-nums"
        style={{ fontFamily: skin.war.font, color: ink.text, textShadow: "0 1px 4px rgba(0,0,0,0.95)" }}
      >
        <span style={{ color: ink.value }}>{fmt(boss.hp)}</span> / {fmt(boss.hpMax)}
      </p>
    </div>
  );
}

/** The boss's name on the ATTACK plaque art. A label, not a control — this
 *  used to be a WarButton, which put a focusable button with no action on the
 *  portrait. */
// The plate width comes from the name. `object-fill` stretched the whole
// plaque, so it needed a fixed width and long names truncated. Here the
// ornamented end-caps are pinned via a horizontal border-image (their pixel
// width read off attackWindow at this reference plate width) while the flat
// middle — where the label sits — stretches to fit the text.
const NAMEPLATE_REF = 189;
const NAMEPLATE_H = 38;

export function NamePlate({ children, className = "" }) {
  const skin = useRpgSkin();
  const art = skin.war.attackBtn;
  if (!art) {
    return (
      <div
        className={`inline-flex h-[38px] max-w-full items-center justify-center rounded-[19px] border px-[18px] ${className}`}
        style={{ borderColor: skin.c.accent, background: "rgba(6,4,2,0.72)" }}
      >
        <GoldText solid className="min-w-0 truncate text-[13px] font-bold leading-none">{children}</GoldText>
      </div>
    );
  }
  const [l, r, t, b] = skin.war.attackWindow || [12, 88, 30, 84];
  const capL = Math.round((l / 100) * NAMEPLATE_REF);
  const capR = Math.round(((100 - r) / 100) * NAMEPLATE_REF);
  // Nudge the label down onto the panel centre, same window the ATTACK label uses.
  const vBias = (((t + b) / 2 - 50) / 100) * NAMEPLATE_H;
  return (
    <div
      className={`relative inline-flex h-[38px] max-w-full items-center justify-center ${className}`}
      style={{
        minWidth: NAMEPLATE_REF,
        borderStyle: "solid",
        borderColor: "transparent",
        borderImageSource: `url(${art})`,
        borderImageSlice: `0 ${(100 - r).toFixed(1)}% 0 ${l.toFixed(1)}% fill`,
        borderImageWidth: `0 ${capR}px 0 ${capL}px`,
        borderImageRepeat: "stretch",
        borderWidth: `0 ${capR}px 0 ${capL}px`,
      }}
    >
      <GoldText
        solid
        className="min-w-0 truncate px-[6px] text-[13px] font-bold leading-none"
        style={{ transform: `translateY(${vBias}px)` }}
      >
        {children}
      </GoldText>
    </div>
  );
}

/** Labeled section block (Boss Info / How to Earn). */
export function SectionCard({ label, title, children, className = "", action }) {
  const skin = useRpgSkin();
  const fi = useFrameInk(skin.war.row);
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
      {/* items-center, not items-start: the action used to be self-end on a
          variable-height block, so DEPOSIT NOW / GO / PLAY each landed at a
          different height down the page. */}
      <div className="flex items-center justify-between gap-[10px]">
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

/**
 * One fetch-once-per-dep-change resource for a screen. Every Boss War screen
 * repeated the same useState pair plus a cancel-guarded effect; the fallback
 * message and the guard now live in one place.
 */
export function useWarResource(fetcher, deps, fallbackMessage) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    let cancelled = false;
    setError(null);
    Promise.resolve()
      .then(fetcher)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || fallbackMessage);
      });
    return () => {
      cancelled = true;
    };
    // `fetcher` is re-created every render by design; `deps` is the real key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return { data, error };
}

// Screen entrance: the title plaque drops in, then the column reveals its
// children one after another. A WarState line is left unwrapped so its null
// render in the loaded state doesn't leave an empty item (and an extra gap)
// in the stack.
const SCREEN_STAGGER = { show: { transition: { staggerChildren: 0.07, delayChildren: 0.12 } } };
const SCREEN_ITEM = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 240, damping: 22 } },
};

/** The screen frame every Boss War view shares: title plaque + content column. */
export function WarScreen({ title, gap = 12, children, className = "" }) {
  return (
    <div className={`flex w-full flex-1 flex-col px-[16px] pb-[8px] ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: -14, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <WarTitle>{title}</WarTitle>
      </motion.div>
      <motion.div
        className="flex flex-col px-[2px] pt-[8px]"
        style={{ gap: `${gap}px` }}
        variants={SCREEN_STAGGER}
        initial="hidden"
        animate="show"
      >
        {Children.map(children, (child) =>
          !isValidElement(child) || child.type === WarState ? (
            child
          ) : (
            <motion.div variants={SCREEN_ITEM}>{child}</motion.div>
          ),
        )}
      </motion.div>
    </div>
  );
}

/** The loading / error pair each screen renders above its content. */
export function WarState({ data, error, empty }) {
  if (error) return <StateLine>{error}</StateLine>;
  if (!data) return <StateLine>LOADING...</StateLine>;
  if (empty) return <StateLine>{empty}</StateLine>;
  return null;
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
