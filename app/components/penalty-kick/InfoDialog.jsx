"use client";

import GlassCard from "./GlassCard";
import GreenCta from "./GreenCta";
import { usePkColors } from "./usePkColors";

function SectionBadge({ children, align = "center" }) {
  const { colors: COLORS } = usePkColors();
  return (
    <div
      className="mb-4 w-full rounded-[4px] px-4 py-2 text-[14px] tracking-[0.5px] uppercase"
      style={{
        backgroundColor: COLORS.greenSoft10,
        color: COLORS.primary,
        fontFamily: "'Lexend', sans-serif",
        textAlign: align,
        lineHeight: "15px",
      }}
    >
      {children}
    </div>
  );
}

function SwipeIllustration({ compact = false }) {
  const { colors: COLORS } = usePkColors();
  return (
    <svg viewBox="0 0 240 156" className={`w-full ${compact ? "my-1 h-[62px]" : "my-2 h-[156px]"}`}>
      <defs>
        <marker id="arrowHead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill={COLORS.primary} />
        </marker>
      </defs>
      <g
        fill="none"
        stroke={COLORS.primary}
        strokeWidth="2.5"
        strokeDasharray="6 6"
        markerEnd="url(#arrowHead)"
        opacity="0.9"
      >
        <path d="M 120 130 Q 60 80 30 30" />
        <path d="M 120 130 Q 120 70 120 20" />
        <path d="M 120 130 Q 180 80 210 30" />
      </g>
      <circle cx="120" cy="138" r="14" fill="#e7e7e7" stroke="#1a1a1a" strokeWidth="1.2" />
      <polygon points="120,128 126,133 124,140 116,140 114,133" fill="#141414" />
    </svg>
  );
}

export default function InfoDialog({ onClose, onOpenTerms }) {
  const { colors: COLORS, soft, theme } = usePkColors();
  // (kgame99 + lv918 use the growing 3-slice/single-frame ornate card; the
  // shared `theme` branch below handles them the same way.)

  // Themed skins: keep the info inside the skin's ornate frame but render the
  // themed Button (and Terms link) BELOW it, exactly like TermsDialog / the
  // Figma result dialogs — the earlier build stuffed the plain green CTA inside
  // the growing 3-slice frame, which (a) left an off-theme gold pill and (b) on
  // kgame99 stretched the ~142px-tall rail slice so far that its castle art
  // smeared into vertical streaks. Compact content + button-below fixes both.
  if (theme) {
    const { OrnateCard, Button, palette } = theme;
    return (
      <div className="flex w-full max-w-[360px] flex-col items-center gap-3">
        <OrnateCard>
          {/* Dark inner panel (same pattern as the theme's welcome/result
              dialogs) — it covers the frame-mid rail art whose castle spires
              would otherwise read as vertical streaks behind the content, and
              lifts the gold arrows + text for contrast. */}
          <div className="relative w-full">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-x-3 -inset-y-1 rounded-[14px]"
              style={{ backgroundColor: "rgba(8,20,44,0.55)" }}
            />
            <div className="relative flex flex-col items-center">
              <p
                className="text-[15px] uppercase tracking-[1px]"
                style={{ fontFamily: "var(--font-acme), sans-serif", color: palette.cream }}
              >
                Information
              </p>
              <SwipeIllustration compact />
              <h3
                className="mt-1 text-[20px] font-bold uppercase tracking-wider"
                style={{
                  color: COLORS.primary,
                  fontFamily: "var(--font-acme), sans-serif",
                  textShadow: `0 0 10px ${soft(0.45)}`,
                }}
              >
                Swipe to Kick
              </h3>
            </div>
          </div>
        </OrnateCard>

        <Button onClick={onClose}>Close</Button>

        <button
          type="button"
          onClick={onOpenTerms}
          className="text-[12px] underline"
          style={{ color: palette.sand, fontFamily: "var(--font-rubik), sans-serif" }}
        >
          Terms & Conditions
        </button>
      </div>
    );
  }

  return (
    <GlassCard>
      <SectionBadge>Information</SectionBadge>
      <SwipeIllustration compact={false} />
      <h3
        className="mb-5 text-center text-[20px] font-bold tracking-wider uppercase"
        style={{
          color: COLORS.primary,
          fontFamily: "'Lexend', sans-serif",
          textShadow: `0 0 10px ${soft(0.45)}`,
        }}
      >
        Swipe to Kick
      </h3>

      <GreenCta onClick={onClose} showPlayIcon={false}>
        Close
      </GreenCta>

      <button
        type="button"
        onClick={onOpenTerms}
        className="mt-4 block w-full text-center text-[12px] underline"
        style={{ color: COLORS.textMuted, fontFamily: "'Lexend', sans-serif" }}
      >
        Terms & Conditions
      </button>
    </GlassCard>
  );
}
