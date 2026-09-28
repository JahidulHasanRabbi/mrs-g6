"use client";

import { formatKrCoins } from "../../../api/apiOptions";
import { motion } from "framer-motion";
import { LoadingState } from "../../ui/LoadingState";
import { MART_ASSETS } from "../../mart/martAssets";
import { MART_CARD } from "./checkinMartSkin";
import ThemedDialog from "./ThemedDialog";
import ThemedActionButton from "./ThemedActionButton";
import ThemedImagePreview from "./ThemedImagePreview";
import { STRUCTURAL_BLOCK_LABELS, priceOf, useThemedMart } from "./useThemedMart";

/**
 * Themed Mart — a 1:1 functional copy of the default app/mart/page.js.
 *
 * Every piece of behaviour is mirrored from that page deliberately: the same
 * fetches (game status, VIP tier -> mart_tier, public redemption tiers, available
 * items), the same category-pill filtering, the same 3-way sort toggle, the same
 * tier-lock rules and copy ("KR Coins", "Upgrade to X to unlock"), and the same
 * closed-for-maintenance overlay. ONLY the artwork is swapped per theme, with
 * one deliberate exception: the themed card adds a full-size reward preview the
 * default card has no counterpart for (the default's plinth art blocks it).
 *
 * The comps (Figma "Mart") omit the category pills and sort control, but dropping
 * them would change behaviour — `filteredItems` is empty until a category is
 * selected — so they are kept and skinned instead.
 *
 * The logic lives in ./useThemedMart, duplicated from rather than shared with
 * the default page so that page stays untouched.
 */

/** Themed pill/sort plaque — the theme's button art with a centred label. */
function PlaquePill({ skin, label, locked, selected, onClick, ariaLabel, ariaPressed, delay }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel || label}
      aria-pressed={ariaPressed}
      className="relative block h-[51px] w-[186px]"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{
        opacity: locked && !selected ? 0.85 : 1,
        scale: selected ? 1.04 : 1,
      }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.96 }}
    >
      <img
        alt=""
        src={skin.redeemButton}
        className="h-full w-full object-fill"
        style={{
          filter: selected ? "drop-shadow(0 0 6px rgba(233,175,65,0.85))" : "none",
        }}
      />
      <span className="absolute inset-0 flex items-center justify-center gap-1.5 px-3">
        {locked && (
          <img alt="" src={MART_ASSETS.lockIcon} className="h-[14px] w-[14px] flex-shrink-0" />
        )}
        <span
          className="whitespace-nowrap text-[14px] font-bold leading-none"
          style={{ fontFamily: skin.font, color: skin.c.redeem }}
        >
          {label}
        </span>
      </span>
    </motion.button>
  );
}

/** Zoom-in glyph for the card's preview affordance. */
function ZoomGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      className="h-[62%] w-[62%]"
      aria-hidden="true"
    >
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.4 15.4 21 21M10.5 7.6v5.8M7.6 10.5h5.8" />
    </svg>
  );
}

/**
 * Themed item card. Card art + geometry come from the comps (MART_CARD); the
 * content is exactly what the default <MartItem> renders.
 */
function ThemedMartItem({
  skin,
  item,
  index,
  locked,
  requiredTierLabel,
  blockReason,
  onRedeem,
  onPreview,
}) {
  const amount = priceOf(item);
  const hasStrikethrough = item.originalPrice && item.originalPrice != amount;
  const isBlocked = !locked && !!blockReason;
  const structuralLabel = STRUCTURAL_BLOCK_LABELS[blockReason];
  // Redeem stays live when locked so the dialog can explain the upgrade; preview
  // does not, because the locked art is deliberately blurred out.
  const canPreview = !locked && !!item.image;

  return (
    <motion.div
      className="@container relative w-full"
      style={{ aspectRatio: MART_CARD.aspect }}
      initial={{ opacity: 0, scale: 0.4, y: -60 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay: index * 0.08 + 0.4 }}
    >
      <img alt="" src={skin.itemFrame} className="pointer-events-none absolute inset-0 h-full w-full object-fill" />

      <div
        className="absolute"
        style={{
          left: `${MART_CARD.image.left}%`,
          top: `${MART_CARD.image.top}%`,
          width: `${MART_CARD.image.w}%`,
          height: `${MART_CARD.image.h}%`,
        }}
      >
        {item.image && (
          // Backend-hosted product shot — plain <img>, as the default
          // <MartItem> does (next/image remotePatterns don't cover it).
          <img
            alt={item.title || ""}
            src={item.image}
            className="h-full w-full object-contain"
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
            src={MART_ASSETS.lockIcon}
            className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: `${MART_CARD.image.lockW}%`,
              filter: "drop-shadow(0 0 4px rgba(0,0,0,0.8))",
            }}
          />
        )}
        {canPreview && (
          // One tap target over the whole shot; the badge is only its affordance.
          <button
            type="button"
            onClick={onPreview}
            className="absolute inset-0 flex items-start justify-end"
            style={{ color: skin.c.name }}
            aria-label={`Preview ${item.title}`}
          >
            <span
              className="grid aspect-square place-items-center rounded-full border border-current"
              style={{ width: `${MART_CARD.zoom.size}%`, backgroundColor: "rgba(0,0,0,0.55)" }}
            >
              <ZoomGlyph />
            </span>
          </button>
        )}
      </div>

      <p
        className="absolute left-1/2 w-[86%] -translate-x-1/2 -translate-y-1/2 truncate text-center"
        style={{
          top: `${MART_CARD.name.top}%`,
          fontFamily: skin.font,
          fontSize: `${MART_CARD.name.sizeCqi}cqi`,
          color: skin.c.name,
        }}
      >
        {item.title}
      </p>

      {/* Price block / upgrade notice — same content as the default card.
          Anchored to its bottom so a second line (the strikethrough original)
          stacks upward instead of running into the redeem plaque. */}
      <div
        className="absolute left-1/2 flex w-[90%] -translate-x-1/2 flex-col items-center leading-none"
        style={{ bottom: `${MART_CARD.coins.bottom}%`, fontFamily: skin.font }}
      >
        {locked ? (
          <p
            className="truncate text-center"
            style={{ fontSize: `${MART_CARD.coins.sizeCqi}cqi`, color: skin.c.lockedText }}
          >
            Upgrade to {requiredTierLabel || "next tier"} to unlock
          </p>
        ) : structuralLabel ? (
          <p
            className="truncate text-center"
            style={{ fontSize: `${MART_CARD.coins.sizeCqi}cqi`, color: skin.c.lockedText }}
          >
            {structuralLabel}
          </p>
        ) : (
          <>
            {hasStrikethrough && (
              <p
                className="truncate line-through decoration-1"
                style={{
                  fontSize: `${MART_CARD.coins.sizeCqi * 0.9}cqi`,
                  color: skin.c.lockedText,
                }}
              >
                {formatKrCoins(item.originalPrice)}
              </p>
            )}
            <p
              className="truncate"
              style={{
                fontSize: `${MART_CARD.coins.sizeCqi}cqi`,
                color: skin.c.coins,
                opacity: isBlocked ? 0.6 : 1,
              }}
            >
              {formatKrCoins(amount)}
            </p>
            {blockReason === "insufficient_balance" && (
              <p
                className="truncate text-center"
                style={{ fontSize: `${MART_CARD.coins.sizeCqi}cqi`, color: skin.c.lockedText }}
              >
                Not enough tokens
              </p>
            )}
          </>
        )}
      </div>

      <button
        type="button"
        onClick={onRedeem}
        disabled={isBlocked}
        className={`absolute transition-transform active:scale-95 ${
          isBlocked ? "cursor-not-allowed opacity-60" : ""
        }`}
        style={{
          left: `${MART_CARD.redeem.left}%`,
          top: `${MART_CARD.redeem.top}%`,
          width: `${MART_CARD.redeem.w}%`,
          height: `${MART_CARD.redeem.h}%`,
        }}
        aria-label={
          locked
            ? `${item.title} (locked)`
            : structuralLabel
              ? `${item.title} (${structuralLabel.toLowerCase()})`
              : blockReason === "insufficient_balance"
                ? `${item.title} (not enough tokens)`
                : `Redeem ${item.title}`
        }
      >
        <img alt="" src={skin.redeemButton} className="absolute inset-0 h-full w-full object-fill" />
        <span
          className="absolute inset-0 flex items-center justify-center whitespace-nowrap"
          style={{
            fontFamily: skin.font,
            fontSize: `${MART_CARD.redeem.sizeCqi}cqi`,
            color: skin.c.redeem,
          }}
        >
          Redeem
        </span>
      </button>
    </motion.div>
  );
}

export default function ThemedMartGrid({ skin }) {
  const {
    selectedItem,
    previewItem,
    setPreviewItem,
    handleClosePreview,
    isLoading,
    isRedeeming,
    redeemResult,
    gameStatus,
    selectedCategory,
    setSelectedCategory,
    unlockedTierOrder,
    dynamicCategories,
    selectedCategoryFullLabel,
    sortButtonLabel,
    sortedItems,
    isItemLocked,
    getRequiredTierName,
    getBlockReason,
    handleRedeem,
    handleCloseModal,
    handleSort,
  } = useThemedMart();

  return (
    <div className="relative min-h-screen">
      {/* Title plaque — full-bleed, so it cancels the section padding. */}
      <div className="flex justify-center px-0">
        <motion.img
          src={skin.title}
          alt="Mart"
          draggable={false}
          style={{ width: `${skin.titleWidthPct}%` }}
          className="h-auto max-w-none select-none object-contain"
          initial={{ opacity: 0, y: -26, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 16 }}
        />
      </div>

      {/* Category pills — same behaviour as the default <MartCategoryPills>. */}
      <motion.div
        className="mx-auto mt-4 grid w-fit grid-cols-2 justify-items-center gap-x-3 gap-y-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
      >
        {dynamicCategories.map((cat, i) => (
          <PlaquePill
            key={cat.key}
            skin={skin}
            label={cat.label}
            ariaLabel={cat.fullLabel}
            locked={cat.tierOrder > unlockedTierOrder}
            selected={selectedCategory === cat.key}
            ariaPressed={selectedCategory === cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            delay={0.25 + i * 0.06}
          />
        ))}
      </motion.div>

      <div className="mt-4 flex justify-end px-8">
        <PlaquePill skin={skin} label={sortButtonLabel} onClick={handleSort} delay={0.4} />
      </div>

      <LoadingState isLoading={isLoading}>
        {sortedItems.length === 0 ? (
          <div className="mb-12 mt-12 flex flex-col items-center justify-center px-8">
            <div className="text-center">
              <p
                className="mb-2 text-[20px] font-bold"
                style={{ fontFamily: skin.font, color: skin.c.name }}
              >
                No {selectedCategoryFullLabel} Available
              </p>
              <p
                className="text-[16px] opacity-70"
                style={{ fontFamily: skin.font, color: skin.c.name }}
              >
                There are currently no items in this category.
              </p>
            </div>
          </div>
        ) : (
          // Row gap absorbs the redeem plaque's designed overhang past the
          // card frame's bottom edge (see MART_CARD.redeem).
          <div
            className="mx-auto mt-8 grid w-full grid-cols-2 gap-x-4 gap-y-8"
            style={{ maxWidth: skin.gridMaxWidth }}
          >
            {sortedItems.map((item, i) => {
              const locked = isItemLocked(item);
              const blockReason = !locked ? getBlockReason(item) : null;
              return (
                <ThemedMartItem
                  key={item.uuid || i}
                  skin={skin}
                  item={item}
                  index={i}
                  locked={locked}
                  requiredTierLabel={getRequiredTierName(item)}
                  blockReason={blockReason}
                  onRedeem={() => handleRedeem(item)}
                  onPreview={() => setPreviewItem(item)}
                />
              );
            })}
          </div>
        )}
      </LoadingState>

      {/* Redeem dialog — same states as the default <RedeemModal>. */}
      <ThemedDialog open={!!selectedItem} onClose={handleCloseModal}>
        {isRedeeming ? (
          <p
            className="text-center text-[16px] font-bold"
            style={{ fontFamily: skin.font, color: skin.c.redeem }}
          >
            Redeeming…
          </p>
        ) : (
          <>
            <p
              className="text-center text-[16px] font-bold leading-[1.45]"
              style={{
                fontFamily: skin.font,
                color: redeemResult?.success === false ? skin.c.lockedText : skin.c.redeem,
              }}
            >
              {redeemResult?.message || selectedItem?.title}
            </p>
            <ThemedActionButton textSize={16} onClick={handleCloseModal}>
              Close
            </ThemedActionButton>
          </>
        )}
      </ThemedDialog>

      <ThemedImagePreview
        open={!!previewItem}
        src={previewItem?.image}
        title={previewItem?.title}
        subtitle={previewItem && formatKrCoins(priceOf(previewItem))}
        skin={skin}
        onClose={handleClosePreview}
      />

      {gameStatus === 2 && (
        <div className="fixed inset-x-0 bottom-[120px] top-[64px] z-30 grid place-items-center bg-black/70 px-6 backdrop-blur-md">
          <div
            className="w-full max-w-[360px] rounded-xl border border-[rgba(255,246,223,0.16)] px-6 py-7 text-center shadow-[0_16px_50px_rgba(0,0,0,0.45)]"
            style={{ backgroundColor: skin.closedPanelBg }}
          >
            <p className="text-[20px]" style={{ fontFamily: skin.font, color: skin.c.redeem }}>
              Mart is currently closed
            </p>
            <p
              className="mt-3 text-[12px] leading-5"
              style={{ fontFamily: skin.font, color: skin.c.locked }}
            >
              Please check back later.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
