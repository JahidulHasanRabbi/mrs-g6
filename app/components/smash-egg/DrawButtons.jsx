"use client";

import { motion } from "framer-motion";

const DRAW_OPTIONS = [
  { draws: 10, tokens: 100, featured: false },
  { draws: 50, tokens: 500, featured: true },
  { draws: 100, tokens: 1000, featured: false },
];

function DrawButton({ draws, tokens, featured, onClick, disabled }) {
  const bgGradient = featured
    ? "linear-gradient(to bottom, #ffd700, #544600)"
    : "linear-gradient(to bottom, #ffb77d, #6e3900)";
  const borderColor = featured ? "#3a3000" : "#4d2600";
  const textColor = featured ? "#3a3000" : "#4d2600";
  const tokenTextColor = featured ? "rgba(58,48,0,0.8)" : "rgba(77,38,0,0.8)";
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

export default function DrawButtons({ onDraw, disabled }) {
  return (
    <div className="grid grid-cols-3 gap-4 px-4 w-full">
      {DRAW_OPTIONS.map((opt) => (
        <DrawButton
          key={opt.draws}
          draws={opt.draws}
          tokens={opt.tokens}
          featured={opt.featured}
          onClick={onDraw}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
