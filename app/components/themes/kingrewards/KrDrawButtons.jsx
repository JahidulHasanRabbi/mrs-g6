"use client";

import { motion } from "framer-motion";
import { GoldText } from "./KrUi";
import { krCoins } from "./KrSpinPanels";
import { KR_COLORS, KR_FONT, KR_SURFACES } from "./assets";

const DRAW_OPTIONS = [
  { draws: 10, featured: false },
  { draws: 50, featured: true },
  { draws: 100, featured: false },
];

// Figma 707:4251: navy tile, gold hairline, gradient label; the featured one is scaled 110%.
// Unaffordable tiles are dimmed but stay tappable so the page can explain the low balance.
function DrawButton({ draws, cost, featured, onClick, disabled, affordable }) {
  return (
    <motion.button
      onClick={() => onClick?.(draws, cost)}
      disabled={disabled}
      className={`flex min-w-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-[16px] px-[9px] py-[17px] disabled:cursor-not-allowed disabled:opacity-50 ${featured ? "" : "self-start"} ${affordable ? "" : "opacity-50 grayscale-[0.5]"}`}
      style={{
        background: KR_COLORS.navy,
        border: `1px solid ${KR_COLORS.goldBright}`,
        boxShadow: KR_SURFACES.inner.boxShadow,
        fontFamily: KR_FONT,
      }}
      initial={false}
      animate={{ scale: featured ? 1.1 : 1 }}
      whileHover={{ scale: featured ? 1.14 : 1.04 }}
      whileTap={{ scale: featured ? 1.02 : 0.95 }}
    >
      <GoldText className="text-center text-[16px] font-semibold">
        {draws}
        <br />
        Draws
      </GoldText>
      <span className="text-center text-[12px] leading-[18px] text-white/80">{krCoins(cost)}</span>
    </motion.button>
  );
}

export default function KrDrawButtons({ onDraw, disabled, tokensPerRound = 10, canAfford = () => true }) {
  return (
    <div className="grid w-full grid-cols-3 gap-4">
      {DRAW_OPTIONS.map((opt) => {
        const cost = Number(tokensPerRound) * opt.draws;
        return (
          <DrawButton
            key={opt.draws}
            draws={opt.draws}
            cost={cost}
            featured={opt.featured}
            onClick={onDraw}
            disabled={disabled}
            affordable={canAfford(cost)}
          />
        );
      })}
    </div>
  );
}
