"use client";

import { PROMO, PROMO_ASSETS } from "./promoColors";
import { POPUP_REWARD_UNIT } from "../../../config/missionPopupOptions";

// Client slide 4. Everything scales off the art's own width (cqw) so the
// composition holds together from 320px phones up to the 420px modal.
const CONFETTI = [
  { left: 4, top: 6, rotate: 18, color: "#45a2ff", w: 3.6, h: 2 },
  { left: 12, top: 20, rotate: -28, color: "#ff5252", w: 4, h: 2.3 },
  { left: 6, top: 34, rotate: 40, color: "#ffeb3b", w: 3.2, h: 1.9 },
  { left: 22, top: 4, rotate: -12, color: "#00e676", w: 3.4, h: 2 },
  { left: 33, top: 15, rotate: 32, color: "#e040fb", w: 3, h: 1.8 },
  { left: 62, top: 3, rotate: -34, color: "#ffeb3b", w: 3.8, h: 2.2 },
  { left: 74, top: 13, rotate: 22, color: "#45a2ff", w: 3.4, h: 2 },
  { left: 88, top: 6, rotate: -18, color: "#ff5252", w: 4, h: 2.3 },
  { left: 93, top: 24, rotate: 44, color: "#00e676", w: 3.2, h: 1.9 },
  { left: 82, top: 33, rotate: -40, color: "#e040fb", w: 3.6, h: 2.1 },
  { left: 50, top: 2, rotate: 14, color: "#ff5252", w: 3, h: 1.8 },
  { left: 96, top: 42, rotate: 26, color: "#ffeb3b", w: 3.2, h: 1.9 },
];

// Two stroked copies behind a gradient face: the offset one is the extrusion,
// the flat one is the keyline. Same trick as MissionCompletedModal's Title3D.
function ArtTitle({ children, size, gradient, stroke, depth, className = "" }) {
  const outline = size * 0.15;
  return (
    <span
      className={`relative inline-block whitespace-nowrap font-black uppercase italic leading-[0.92] ${className}`}
      style={{ fontSize: `${size}cqw`, letterSpacing: "-0.01em" }}
    >
      <span
        aria-hidden="true"
        className="absolute left-0 top-0"
        style={{
          WebkitTextStroke: `${outline}cqw ${depth}`,
          paintOrder: "stroke fill",
          color: depth,
          transform: `translateY(${size * 0.1}cqw)`,
        }}
      >
        {children}
      </span>
      <span
        aria-hidden="true"
        className="absolute left-0 top-0"
        style={{
          WebkitTextStroke: `${outline * 1.5}cqw ${stroke}`,
          paintOrder: "stroke fill",
          color: stroke,
        }}
      >
        {children}
      </span>
      <span
        aria-hidden="true"
        className="absolute left-0 top-0"
        style={{
          WebkitTextStroke: `${outline * 0.55}cqw ${depth}`,
          paintOrder: "stroke fill",
          color: depth,
        }}
      >
        {children}
      </span>
      <span
        className="relative"
        style={{
          backgroundImage: gradient,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        {children}
      </span>
    </span>
  );
}

function PartyPopper() {
  return (
    <svg viewBox="0 0 48 48" className="h-[13cqw] w-[13cqw] shrink-0" aria-hidden="true">
      <path d="M6 42 18 16l14 14z" fill="#ffd043" stroke="#c2410c" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M6 42 18 16l7 7z" fill="#ff8a00" />
      <circle cx="34" cy="9" r="2.4" fill="#45a2ff" />
      <circle cx="42" cy="18" r="2" fill="#00e676" />
      <circle cx="27" cy="5" r="1.8" fill="#e040fb" />
      <rect x="37" y="27" width="5" height="3" rx="1" fill="#ff5252" transform="rotate(24 37 27)" />
      <rect x="30" y="2" width="5" height="3" rx="1" fill="#ffeb3b" transform="rotate(-30 30 2)" />
    </svg>
  );
}

// The ribbon's notched ends + the darker fold tabs tucked behind each end.
function Ribbon({ children }) {
  return (
    <div className="relative w-full px-[6cqw]">
      <span
        aria-hidden="true"
        className="absolute left-[1cqw] top-[62%] h-[4.5cqw] w-[8cqw] -translate-y-1/2"
        style={{ backgroundColor: PROMO.ribbonFold, clipPath: "polygon(0 0, 100% 0, 100% 100%, 34% 100%)" }}
      />
      <span
        aria-hidden="true"
        className="absolute right-[1cqw] top-[62%] h-[4.5cqw] w-[8cqw] -translate-y-1/2"
        style={{ backgroundColor: PROMO.ribbonFold, clipPath: "polygon(0 0, 100% 0, 66% 100%, 0 100%)" }}
      />
      <div
        className="relative grid place-items-center py-[1.9cqw]"
        style={{
          backgroundImage: `linear-gradient(180deg, ${PROMO.ribbonFrom} 0%, ${PROMO.ribbonTo} 100%)`,
          clipPath: "polygon(0 0, 100% 0, 93% 50%, 100% 100%, 0 100%, 7% 50%)",
        }}
      >
        <p
          className="whitespace-nowrap font-extrabold uppercase leading-none text-white"
          style={{ fontSize: "4.6cqw", letterSpacing: "0.02em", textShadow: "0 2px 3px rgba(0,0,0,0.45)" }}
        >
          {children}
        </p>
      </div>
    </div>
  );
}

function formatAmount(value) {
  return Number(value || 0).toLocaleString("en-US");
}

export default function PromoOfferArt({
  title,
  content,
  depositAmount,
  rewardAmount,
  rewardCategory = 1,
  currency = "RM",
}) {
  const unit = `${POPUP_REWARD_UNIT[rewardCategory] ?? "KR Coins"}!`.toUpperCase();
  // The headline splits across two lines the way the client mock does; a
  // single-word title just takes the top line.
  const words = String(title || "Happy Friday!").trim().split(/\s+/);
  const firstLine = words.length > 1 ? words.slice(0, -1).join(" ") : words[0];
  const secondLine = words.length > 1 ? words[words.length - 1] : "";
  const ribbonText = Number(depositAmount) > 0
    ? `Deposit ${currency}${formatAmount(depositAmount)} & Get`
    : content;
  // "BATTLE POINTS!" needs to come down a size to stay on one line.
  const unitSize = unit.length > 8 ? 6.4 : 9;

  return (
    <div
      className="relative w-full overflow-hidden rounded-[16px]"
      style={{
        containerType: "inline-size",
        backgroundImage: `radial-gradient(120% 90% at 50% 18%, ${PROMO.artGlow} 0%, ${PROMO.artMid} 45%, ${PROMO.artBg} 100%)`,
        border: `1px solid ${PROMO.cardBorder}`,
      }}
    >
      {CONFETTI.map((c, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="absolute block rounded-[1px]"
          style={{
            left: `${c.left}%`,
            top: `${c.top}%`,
            width: `${c.w}cqw`,
            height: `${c.h}cqw`,
            backgroundColor: c.color,
            transform: `rotate(${c.rotate}deg)`,
          }}
        />
      ))}

      <div className="relative flex flex-col items-center gap-[3cqw] px-[4cqw] pb-[5cqw] pt-[4.5cqw]">
        <div className="flex w-full flex-col items-center">
          <div className="flex items-center gap-[1.5cqw]">
            <PartyPopper />
            <ArtTitle
              size={13}
              gradient={`linear-gradient(180deg, ${PROMO.artTitleGoldTop} 0%, ${PROMO.artTitleGoldBottom} 100%)`}
              stroke={PROMO.artStroke}
              depth={PROMO.artDepthGold}
            >
              {firstLine}
            </ArtTitle>
          </div>
          {secondLine && (
            <ArtTitle
              size={15}
              gradient={`linear-gradient(180deg, ${PROMO.artTitleWhiteTop} 0%, ${PROMO.artTitleWhiteBottom} 100%)`}
              stroke={PROMO.artStroke}
              depth={PROMO.artDepthWhite}
              className="-mt-[1cqw]"
            >
              {secondLine}
            </ArtTitle>
          )}
        </div>

        {ribbonText && <Ribbon>{ribbonText}</Ribbon>}

        <div className="flex w-full items-center justify-between gap-[2cqw]">
          <div className="flex shrink-0 flex-col items-start">
            <ArtTitle
              size={24}
              gradient={`linear-gradient(180deg, ${PROMO.artTitleGoldTop} 0%, ${PROMO.artTitleGoldBottom} 100%)`}
              stroke={PROMO.artStroke}
              depth={PROMO.artDepthGold}
            >
              {formatAmount(rewardAmount)}
            </ArtTitle>
            <ArtTitle
              size={9}
              gradient={`linear-gradient(180deg, ${PROMO.artTitleWhiteTop} 0%, ${PROMO.artTitleWhiteBottom} 100%)`}
              stroke={PROMO.artStroke}
              depth={PROMO.artDepthWhite}
              className="-mt-[1.5cqw]"
            >
              Extra
            </ArtTitle>
            <ArtTitle
              size={unitSize}
              gradient={`linear-gradient(180deg, ${PROMO.artTitleGoldTop} 0%, ${PROMO.artTitleGoldBottom} 100%)`}
              stroke={PROMO.artStroke}
              depth={PROMO.artDepthGold}
              className="-mt-[1cqw]"
            >
              {unit}
            </ArtTitle>
          </div>

          <div className="relative grid min-w-0 flex-1 place-items-center">
            <span
              aria-hidden="true"
              className="absolute h-[52cqw] w-[52cqw] rounded-full"
              style={{ backgroundImage: `radial-gradient(circle, ${PROMO.artChestGlow} 0%, transparent 68%)` }}
            />
            <img
              src={PROMO_ASSETS.chest}
              alt=""
              aria-hidden="true"
              className="relative h-[47cqw] w-full select-none object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,0.45)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
