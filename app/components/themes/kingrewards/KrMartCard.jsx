"use client";

import { motion } from "framer-motion";
import { formatKrCoins } from "../../../api/apiOptions";
import { STRUCTURAL_BLOCK_LABELS, priceOf } from "../shared/useThemedMart";
import { GoldText, KrImage } from "./KrUi";
import { KR_ASSETS, KR_COLORS, KR_FONT, KR_SURFACES } from "./assets";

const IMAGE_BOX = {
  background:
    "linear-gradient(to top, rgba(66,97,146,0.4) 0%, rgba(20,43,71,0.4) 51.925%, rgba(129,129,129,0.23) 100%)",
  boxShadow: "inset 0 12px 12px 0 rgba(241,247,255,0.25)",
  border: `2px solid ${KR_COLORS.goldBright}`,
};

const NOTICE = "text-center text-[10px] font-semibold leading-[1.2] text-[#bbcbbb]";

/** "6,999,000 KR Coins" struck through, number red and unit white (Figma 822:2560). */
function StruckPrice({ value }) {
  const [amount, ...unit] = formatKrCoins(value).split(" ");
  return (
    <p className="max-w-full truncate text-[7px] font-semibold leading-[1.2] text-white line-through">
      <span className="text-[#ff7979]">{amount}</span> {unit.join(" ")}
    </p>
  );
}

function ZoomGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className="size-[62%]" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.4 15.4 21 21M10.5 7.6v5.8M7.6 10.5h5.8" />
    </svg>
  );
}

/**
 * One Mart item (Figma 691:1483). Same content and states as <ThemedMartItem>:
 * tier lock, out-of-stock / date windows, insufficient balance, preview.
 */
export default function KrMartCard({ item, index, locked, requiredTierLabel, blockReason, onRedeem, onPreview }) {
  const amount = priceOf(item);
  const hasStrikethrough = item.originalPrice && item.originalPrice != amount;
  const isBlocked = !locked && !!blockReason;
  const structuralLabel = STRUCTURAL_BLOCK_LABELS[blockReason];
  // Redeem stays live when locked so the dialog can explain the upgrade.
  const canPreview = !locked && !!item.image;

  return (
    <motion.div
      className="flex h-full min-w-0 flex-col items-center gap-4 rounded-[8px] p-2"
      style={{ ...KR_SURFACES.inner, fontFamily: KR_FONT }}
      initial={{ opacity: 0, scale: 0.6, y: -40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay: index * 0.08 + 0.2 }}
    >
      <div
        className="relative flex aspect-[3/2] w-full items-center justify-center overflow-hidden rounded-[27px] p-[10px]"
        style={IMAGE_BOX}
      >
        {item.image && (
          // Backend-hosted product shot; next/image remotePatterns don't cover it.
          <KrImage
            alt={item.title || ""}
            src={item.image}
            className="h-[80%] max-w-full object-contain"
            style={
              locked
                ? { filter: "grayscale(0.85) brightness(0.55) blur(6px)" }
                : isBlocked
                  ? { filter: "grayscale(0.5) brightness(0.75)" }
                  : undefined
            }
          />
        )}
        {locked && (
          <img
            alt="Locked"
            src={KR_ASSETS.mart.iconLock}
            className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2"
            style={{ filter: "drop-shadow(0 0 4px rgba(0,0,0,0.8))" }}
          />
        )}
        {canPreview && (
          <button
            type="button"
            onClick={onPreview}
            className="absolute inset-0 flex items-start justify-end p-2"
            style={{ color: KR_COLORS.goldText }}
            aria-label={`Preview ${item.title}`}
          >
            <span className="grid size-6 place-items-center rounded-full border border-current bg-[rgba(0,30,74,0.6)]">
              <ZoomGlyph />
            </span>
          </button>
        )}
      </div>

      <GoldText as="p" className="block w-full truncate text-center text-[14px] font-bold uppercase">
        {item.title}
      </GoldText>

      <div className="flex w-full flex-1 flex-col items-center justify-end gap-1">
        {locked ? (
          <p className={NOTICE}>Upgrade to {requiredTierLabel || "next tier"} to unlock</p>
        ) : structuralLabel ? (
          <p className={NOTICE}>{structuralLabel}</p>
        ) : (
          <>
            {hasStrikethrough && <StruckPrice value={item.originalPrice} />}
            <p
              className="max-w-full truncate text-[10px] font-semibold leading-[1.2]"
              style={{ color: KR_COLORS.goldText, opacity: isBlocked ? 0.6 : 1 }}
            >
              {formatKrCoins(amount)}
            </p>
            {blockReason === "insufficient_balance" && (
              <p className="text-center text-[10px] font-semibold leading-[1.2] text-[#ff7979]">Not enough KR Coins</p>
            )}
          </>
        )}
      </div>

      <button
        type="button"
        onClick={onRedeem}
        disabled={isBlocked}
        className="flex w-full items-center justify-center px-4 py-3 text-[12px] font-semibold leading-[1.2] transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          color: KR_COLORS.onGold,
          backgroundImage: `url(${KR_ASSETS.ui.btnGold})`,
          backgroundSize: "100% 100%",
        }}
        aria-label={
          locked
            ? `${item.title} (locked)`
            : structuralLabel
              ? `${item.title} (${structuralLabel.toLowerCase()})`
              : blockReason === "insufficient_balance"
                ? `${item.title} (not enough KR Coins)`
                : `Claim ${item.title}`
        }
      >
        Claim
      </button>
    </motion.div>
  );
}
