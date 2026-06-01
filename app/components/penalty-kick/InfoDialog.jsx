"use client";

import GlassCard from "./GlassCard";
import GreenCta from "./GreenCta";
import { COLORS, ICONS } from "./constants";

function SectionBadge({ children, align = "center" }) {
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

function SwipeIllustration() {
  return (
    <svg viewBox="0 0 240 156" className="my-2 h-[156px] w-full">
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
  return (
    <GlassCard>
      <SectionBadge>Information</SectionBadge>
      <SwipeIllustration />
      <h3
        className="mb-5 text-center text-[20px] font-bold tracking-wider uppercase"
        style={{
          color: COLORS.primary,
          fontFamily: "'Lexend', sans-serif",
          textShadow: "0 0 10px rgba(84,233,138,0.45)",
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
