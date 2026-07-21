"use client";

import { motion } from "framer-motion";
import { useTheme } from "../../contexts/ThemeContext";
import { ACEBET_COLORS } from "../themes/acebet77/assets";
import { UBET_COLORS } from "../themes/ubetclub/assets";
import { EP369_COLORS } from "../themes/ep369/assets";

const DRAW_OPTIONS = [
  { draws: 10, featured: false },
  { draws: 50, featured: true },
  { draws: 100, featured: false },
];

function formatTokenAmount(value) {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return "0.00";
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function DrawButton({ draws, tokens, featured, onClick, disabled }) {
  const { isAcebet77, isUbetclub, isEp369 } = useTheme();

  let bgGradient, borderColor, textColor, tokenTextColor;
  if (isAcebet77) {
    bgGradient = featured
      ? "linear-gradient(to bottom, #ffd76b, #8a5514)"
      : "linear-gradient(to bottom, #17130c, #050505)";
    borderColor = featured ? "#3a2600" : ACEBET_COLORS.gold;
    textColor = featured ? "#171006" : ACEBET_COLORS.goldBright;
    tokenTextColor = featured ? "rgba(23,16,6,0.75)" : "rgba(242,186,51,0.85)";
  } else if (isUbetclub) {
    bgGradient = featured
      ? "linear-gradient(to bottom, #f2c36b, #8a5514)"
      : "linear-gradient(to bottom, #4a0e11, #180708)";
    borderColor = featured ? "#3a1a0a" : UBET_COLORS.gold;
    textColor = featured ? "#280506" : UBET_COLORS.goldBright;
    tokenTextColor = featured ? "rgba(40,5,6,0.75)" : "rgba(242,195,107,0.85)";
  } else if (isEp369) {
    bgGradient = featured
      ? "linear-gradient(to bottom, #f2c36b, #8a5514)"
      : "linear-gradient(to bottom, #0d3d1c, #001002)";
    borderColor = featured ? "#2a5a14" : EP369_COLORS.gold;
    textColor = featured ? "#04140a" : EP369_COLORS.goldBright;
    tokenTextColor = featured ? "rgba(4,20,10,0.75)" : "rgba(242,195,107,0.85)";
  } else {
    bgGradient = featured
      ? "linear-gradient(to bottom, #ffd700, #544600)"
      : "linear-gradient(to bottom, #ffb77d, #6e3900)";
    borderColor = featured ? "#3a3000" : "#4d2600";
    textColor = featured ? "#3a3000" : "#4d2600";
    tokenTextColor = featured ? "rgba(58,48,0,0.8)" : "rgba(77,38,0,0.8)";
  }
  const shadow = featured
    ? "0 25px 50px -12px rgba(0,0,0,0.25)"
    : "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)";

  return (
    <motion.button
      onClick={() => onClick?.(draws)}
      disabled={disabled}
      className="flex flex-col items-center pt-4 pb-5 px-4 rounded-xl border-b-4 relative disabled:opacity-50"
      style={{
        backgroundImage: bgGradient,
        borderColor,
        boxShadow: shadow,
        transform: featured ? "scale(1.1)" : undefined,
      }}
      whileHover={{ scale: featured ? 1.15 : 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="flex flex-col items-center">
        <p
          className="text-base text-center leading-4"
          style={{ fontFamily: "var(--font-acme), 'Acme', sans-serif", color: textColor }}
        >
          {draws}
        </p>
        <p
          className="text-base text-center leading-4"
          style={{ fontFamily: "var(--font-acme), 'Acme', sans-serif", color: textColor }}
        >
          Draws
        </p>
      </div>
      <p
        className="text-xs text-center whitespace-nowrap"
        style={{ fontFamily: "var(--font-rubik), 'Rubik', sans-serif", color: tokenTextColor }}
      >
        {tokens} Tokens
      </p>
    </motion.button>
  );
}

export default function DrawButtons({ onDraw, disabled, tokensPerRound = 10 }) {
  return (
    <div className="grid grid-cols-3 gap-4 px-4 w-full">
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
