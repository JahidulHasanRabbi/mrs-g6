"use client";

import { PROMO, PROMO_ASSETS } from "./promoColors";

// Figma 2472:3936 — positions converted to % of the 416x140 header so the
// scatter holds its shape as the modal narrows.
const CONFETTI = [
  { left: 7.26, top: 7.14, rotate: 15, color: "#45a2ff", w: 12, h: 7 },
  { left: 10.1, top: 80, rotate: 15, color: "#45a2ff", w: 12, h: 7 },
  { left: 19.23, top: 23.57, rotate: -30, color: "#ff5252", w: 14, h: 8 },
  { left: 5.05, top: 56.43, rotate: -30, color: "#ff5252", w: 14, h: 8 },
  { left: 75.9, top: 10.71, rotate: 45, color: "#ffeb3b", w: 10, h: 6 },
  { left: 70.19, top: 40, rotate: 45, color: "#ffeb3b", w: 10, h: 6 },
  { left: 91.35, top: 32.94, rotate: -15, color: "#e040fb", w: 15, h: 9 },
  { left: 83.17, top: 81.43, rotate: -15, color: "#e040fb", w: 15, h: 9 },
  { left: 21.88, top: 52.86, rotate: 25, color: "#ffeb3b", w: 12, h: 7 },
  { left: 19.23, top: 82.86, rotate: 25, color: "#ffeb3b", w: 12, h: 7 },
  { left: 69.71, top: 72.6, rotate: -40, color: "#00e676", w: 13, h: 8 },
  { left: 64.66, top: 7.14, rotate: -40, color: "#00e676", w: 13, h: 8 },
];

export default function CelebrationHeader() {
  return (
    <div className="relative h-[clamp(112px,34vw,140px)] w-full shrink-0" aria-hidden="true">
      <img
        src={PROMO_ASSETS.sunburst}
        alt=""
        className="pointer-events-none absolute left-1/2 top-1/2 h-[clamp(144px,44vw,180px)] w-[clamp(144px,44vw,180px)] -translate-x-1/2 -translate-y-1/2 select-none"
      />

      {CONFETTI.map((c, i) => (
        <span
          key={i}
          className="absolute block rounded-[2px]"
          style={{
            left: `${c.left}%`,
            top: `${c.top}%`,
            width: c.w,
            height: c.h,
            backgroundColor: c.color,
            transform: `rotate(${c.rotate}deg)`,
          }}
        />
      ))}

      <div
        className="absolute left-1/2 top-1/2 grid h-[clamp(80px,24vw,100px)] w-[clamp(80px,24vw,100px)] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full drop-shadow-[0_4px_4px_rgba(0,0,0,0.31)]"
        style={{ backgroundImage: `linear-gradient(180deg, ${PROMO.badgeFrom} 0%, ${PROMO.badgeTo} 100%)` }}
      >
        <div
          className="grid h-[82%] w-[82%] place-items-center rounded-full"
          style={{ backgroundColor: PROMO.checkFill, border: `2px solid ${PROMO.checkBorder}` }}
        >
          <img src={PROMO_ASSETS.check} alt="" className="h-1/2 w-1/2 select-none" />
        </div>
      </div>
    </div>
  );
}
