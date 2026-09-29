"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { formatKrCoins } from "../../../api/apiOptions";
import { useUser } from "../../../contexts/UserContext";
import { LoadingState } from "../../ui/LoadingState";
import { MART_CATEGORIES } from "../../mart/MartCategoryPills";
import ThemedImagePreview from "../shared/ThemedImagePreview";
import { priceOf, useThemedMart } from "../shared/useThemedMart";
import KrMartCard, { StruckPrice } from "./KrMartCard";
import KrCheckinMartDialog, { KrDialogLine, KrDialogPrize } from "./KrCheckinMartDialog";
import KingRewardsButton from "./KingRewardsButton";
import { GoldText, KrImage, PageTitle } from "./KrUi";
import { KR_ASSETS, KR_COLORS, KR_FONT, KR_SURFACES } from "./assets";

const PREVIEW_SKIN = { font: KR_FONT, c: { name: KR_COLORS.goldText, coins: KR_COLORS.goldBright } };

/** Figma tab pill: gold hairline, 0.3 fill when active, 0.5 opacity when locked. */
function TierTab({ label, ariaLabel, active, locked, onClick }) {
  const icon = locked ? KR_ASSETS.mart.iconLock : active ? null : KR_ASSETS.mart.iconLockOpen;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={active}
      className="flex min-w-0 items-center justify-center gap-2 rounded-[8px] px-1 py-2 text-[10px] font-semibold"
      style={{
        fontFamily: KR_FONT,
        color: KR_COLORS.goldText,
        border: `1px solid ${KR_COLORS.goldBright}`,
        background: active ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.08)",
        opacity: locked && !active ? 0.5 : 1,
      }}
    >
      <span className="truncate leading-4">{label}</span>
      {icon && <img src={icon} alt="" className="size-4 shrink-0" />}
    </button>
  );
}

/** King Rewards Mart (Figma 691:1483). Tier tabs + sort stay: items filter by the selected tier. */
export default function KingRewardsMartPage() {
  const { userData } = useUser();
  const {
    selectedItem,
    previewItem,
    setPreviewItem,
    handleClosePreview,
    isLoading,
    loadError,
    reloadItems,
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

  // The item awaiting the member's go-ahead; the redeem call only runs from the confirm dialog.
  const [confirmItem, setConfirmItem] = useState(null);
  const [confirmedRedeem, setConfirmedRedeem] = useState(false);

  // A failed redeem of an in-reach item left its block reason unchanged, so it can be re-derived here.
  const failedForBalance =
    redeemResult?.success === false &&
    gameStatus !== 2 &&
    selectedItem &&
    !isItemLocked(selectedItem) &&
    getBlockReason(selectedItem) === "insufficient_balance";
  const canRetry = redeemResult?.success === false && confirmedRedeem && !failedForBalance;

  const requestRedeem = (item) => {
    if (gameStatus === 2 || isItemLocked(item) || getBlockReason(item)) {
      setConfirmedRedeem(false);
      handleRedeem(item);
    } else {
      setConfirmItem(item);
    }
  };

  const confirmRedeem = () => {
    const item = confirmItem;
    setConfirmItem(null);
    setConfirmedRedeem(true);
    handleRedeem(item);
  };

  const retryRedeem = () => {
    const item = selectedItem;
    handleCloseModal();
    setConfirmItem(item);
  };

  // No tiers from the API: fall back to the fixed tiers, which still match items by `mart_tier` name.
  const tierTabs = dynamicCategories.length > 0 ? dynamicCategories : MART_CATEGORIES;
  const selectedTierLabel =
    tierTabs.find((c) => c.key === selectedCategory)?.fullLabel || selectedCategoryFullLabel;

  const hasUnaffordable = sortedItems.some(
    (item) => !isItemLocked(item) && getBlockReason(item) === "insufficient_balance"
  );

  const resultTitle =
    isRedeeming || !redeemResult
      ? null
      : redeemResult.success
        ? "Item Claimed!"
        : confirmedRedeem && !failedForBalance
          ? "Redeem Failed"
          : "Warning!";

  return (
    <div className="relative flex w-full flex-col gap-4 px-4 pt-4" style={{ fontFamily: KR_FONT }}>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 16 }}
      >
        <PageTitle>Mart</PageTitle>
      </motion.div>

      <motion.section
        className="flex w-full flex-col gap-2 rounded-[12px] p-1"
        style={KR_SURFACES.solid}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
      >
        <div className="grid grid-cols-2 gap-x-1 gap-y-2">
          {tierTabs.map((cat) => (
            <TierTab
              key={cat.key}
              label={cat.label}
              ariaLabel={cat.fullLabel}
              active={selectedCategory === cat.key}
              locked={cat.tierOrder > unlockedTierOrder}
              onClick={() => setSelectedCategory(cat.key)}
            />
          ))}
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSort}
            className="rounded-[8px] px-3 py-[6px] text-[10px] font-semibold"
            style={{
              color: KR_COLORS.goldText,
              border: `1px solid ${KR_COLORS.goldBright}`,
              background: "rgba(255,255,255,0.08)",
            }}
          >
            {sortButtonLabel}
          </button>
        </div>

        <LoadingState isLoading={isLoading}>
          {loadError ? (
            <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
              <GoldText as="p" className="block text-[20px] font-bold">
                Couldn&apos;t load the Mart
              </GoldText>
              <p className="text-[14px] text-[#bbcbbb]">Check your connection and try again.</p>
              <KingRewardsButton variant="dark" className="max-w-[200px]" textSize={14} onClick={reloadItems}>
                Try Again
              </KingRewardsButton>
            </div>
          ) : sortedItems.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
              <GoldText as="p" className="block text-[20px] font-bold">
                No {selectedTierLabel} Available
              </GoldText>
              <p className="text-[14px] text-[#bbcbbb]">There are currently no items in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {sortedItems.map((item, i) => {
                const locked = isItemLocked(item);
                return (
                  <KrMartCard
                    key={item.uuid || i}
                    item={item}
                    index={i}
                    locked={locked}
                    requiredTierLabel={getRequiredTierName(item)}
                    blockReason={!locked ? getBlockReason(item) : null}
                    onRedeem={() => requestRedeem(item)}
                    onPreview={() => setPreviewItem(item)}
                  />
                );
              })}
            </div>
          )}
        </LoadingState>

        {!isLoading && !loadError && hasUnaffordable && (
          <p className="flex items-center justify-center gap-2 px-2 pb-2 pt-1 text-center text-[12px] font-medium leading-[1.3] text-[#e2e2e2]">
            <img src={KR_ASSETS.ui.alert} alt="" className="size-4 shrink-0" />
            Not enough KR Coins for the dimmed items.
          </p>
        )}
      </motion.section>

      <KrCheckinMartDialog
        open={!!confirmItem}
        onClose={() => setConfirmItem(null)}
        title="Confirm Redeem"
        actions={
          <>
            <KingRewardsButton variant="gold" onClick={confirmRedeem} disabled={isRedeeming}>
              Confirm
            </KingRewardsButton>
            <KingRewardsButton variant="dark" onClick={() => setConfirmItem(null)}>
              Cancel
            </KingRewardsButton>
          </>
        }
      >
        {confirmItem && (
          <>
            <KrImage src={confirmItem.image} alt="" className="h-20 max-w-[60%] object-contain" />
            <GoldText as="p" className="block text-center text-[20px] font-bold uppercase [overflow-wrap:anywhere]">
              {confirmItem.title}
            </GoldText>
            <div className="flex flex-col items-center gap-1">
              {confirmItem.originalPrice && confirmItem.originalPrice != priceOf(confirmItem) && (
                <StruckPrice value={confirmItem.originalPrice} className="text-[13px]" />
              )}
              <p className="text-center text-[18px] font-semibold leading-6" style={{ color: KR_COLORS.goldText }}>
                {formatKrCoins(priceOf(confirmItem))}
              </p>
            </div>
            <p className="text-center text-[14px] leading-5 text-[#e2e2e2]">
              This amount will be deducted from your KR Coins.
            </p>
          </>
        )}
      </KrCheckinMartDialog>

      <KrCheckinMartDialog
        open={!!selectedItem}
        onClose={handleCloseModal}
        tone={redeemResult?.success === false ? "warning" : "success"}
        title={resultTitle}
        actions={
          canRetry ? (
            <>
              <KingRewardsButton variant="gold" onClick={retryRedeem}>
                Try Again
              </KingRewardsButton>
              <KingRewardsButton variant="dark" onClick={handleCloseModal}>
                Back
              </KingRewardsButton>
            </>
          ) : undefined
        }
      >
        {isRedeeming ? (
          <GoldText as="p" className="block text-center text-[18px] font-bold">
            Redeeming…
          </GoldText>
        ) : (
          <>
            <KrDialogLine>{redeemResult?.message || selectedItem?.title}</KrDialogLine>
            {redeemResult?.success && selectedItem && (
              <KrDialogPrize image={selectedItem.image} imageClassName="h-16 max-w-16">
                {selectedItem.title}
              </KrDialogPrize>
            )}
            {failedForBalance && (
              <KrDialogPrize image={KR_ASSETS.ui.iconCoins}>
                {formatKrCoins(userData?.balance ?? 0)} Left
              </KrDialogPrize>
            )}
          </>
        )}
      </KrCheckinMartDialog>

      <ThemedImagePreview
        open={!!previewItem}
        src={previewItem?.image}
        title={previewItem?.title}
        subtitle={previewItem && formatKrCoins(priceOf(previewItem))}
        skin={PREVIEW_SKIN}
        onClose={handleClosePreview}
      />

      {gameStatus === 2 && (
        <div className="fixed inset-x-0 bottom-[104px] top-[64px] z-30 grid place-items-center bg-black/70 px-6 backdrop-blur-md">
          <div
            className="flex w-full max-w-[360px] flex-col items-center gap-3 rounded-[16px] px-6 py-7 text-center"
            style={{ ...KR_SURFACES.solid, boxShadow: "inset 0 4px 16px 4px rgba(255,255,255,0.15)" }}
          >
            <GoldText as="p" className="block text-[22px] font-bold uppercase">
              Mart is currently closed
            </GoldText>
            <p className="text-[14px] leading-5 text-[#e2e2e2]">Please check back later.</p>
          </div>
        </div>
      )}
    </div>
  );
}
