"use client";

import { motion } from "framer-motion";
import { KGAME99_COLORS } from "./assets";

const DRAW_OPTIONS = [
  { draws: 10, featured: false },
  { draws: 50, featured: true },
  { draws: 100, featured: false },
];

function formatTokenAmount(value) {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return "0.00";
  return amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Kgame99 Draw buttons — same 10 / 50 / 100 options + token cost as the shared
 * DrawButtons, restyled to the theme: deep-blue plaques with a gold edge, and
 * the featured (50) plaque in gold. Text is gold/cream (or dark navy on gold).
 */
function DrawButton({ draws, tokens, featured, onClick, disabled }) {
  const bg = featured
    ? "linear-gradient(to bottom, #ffe6a3, #d99a1e)"
    : "linear-gradient(to bottom, #1e50a8, #08183a)";
  const border = featured ? "#8a5e0e" : "#04122e";
  const ring = featured ? "rgba(255,240,190,0.65)" : "rgba(242,203,122,0.55)";
  const dropShadow = featured
    ? "0 16px 30px -12px rgba(0,0,0,0.45)"
    : "0 8px 16px -6px rgba(0,0,0,0.4)";
  const mainColor = featured ? "#3a2a05" : KGAME99_COLORS.goldBright;
  const tokenColor = featured ? "rgba(58,42,5,0.85)" : KGAME99_COLORS.creamMuted;

  return (
    <motion.button
      onClick={() => onClick?.(draws)}
      disabled={disabled}
      className="relative flex flex-col items-center rounded-xl border-b-4 px-4 pt-4 pb-5 disabled:opacity-50"
      style={{
        backgroundImage: bg,
        borderColor: border,
        boxShadow: `${dropShadow}, inset 0 0 0 1.5px ${ring}`,
        transform: featured ? "scale(1.1)" : undefined,
      }}
      whileHover={{ scale: featured ? 1.15 : 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <p className="text-base leading-4" style={{ fontFamily: "var(--font-acme), sans-serif", color: mainColor }}>{draws}</p>
      <p className="text-base leading-4" style={{ fontFamily: "var(--font-acme), sans-serif", color: mainColor }}>Draws</p>
      <p className="mt-1 whitespace-nowrap text-xs" style={{ fontFamily: "var(--font-rubik), sans-serif", color: tokenColor }}>{tokens} KR Coins</p>
    </motion.button>
  );
}

export default function KgameDrawButtons({ onDraw, disabled, tokensPerRound = 10 }) {
  return (
    <div className="grid w-full grid-cols-3 gap-4 px-4">
      {DRAW_OPTIONS.map((opt) => (
        <DrawButton
          key={opt.draws}
          draws={opt.draws}
          tokens={formatTokenAmount(Number(tokensPerRound) * opt.draws)}
          featured={opt.featured}
          onClick={onDraw}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
