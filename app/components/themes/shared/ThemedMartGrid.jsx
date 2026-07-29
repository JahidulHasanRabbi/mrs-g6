"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  getAvailableRedemptionItems,
  getPublicRedemptionTiers,
  getVipTiers,
  redeemItem,
} from "../../../api/memberApi";
import { mapRedemptionItems } from "../../../api/responseMappers";
import { tokenStorage } from "../../../api/tokenStorage";
import { useUser } from "../../../contexts/UserContext";
import { MART_CARD } from "./checkinMartSkin";
import ThemedDialog from "./ThemedDialog";
import ThemedActionButton from "./ThemedActionButton";

const formatCoins = (value) => {
  const n = Number(String(value ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n.toLocaleString("en-GB") : String(value ?? "");
};

/**
 * Skin-driven Mart (Figma "Mart", MRS Theme Engine file).
 *
 * Same data pipeline as the default app/mart/page.js — redemption items from
 * `getAvailableRedemptionItems()`, tier gating from the member's VIP tier
 * `mart_tier` vs `getPublicRedemptionTiers()` levels, and `redeemItem()` on
 * confirm. Only the art changes per theme; the card geometry lives in
 * ./checkinMartSkin.js (MART_CARD) and is shared by all six skins.
 *
 * NOTE: the comps show a single two-column grid with no category pills and no
 * sort control, so every unlocked-or-locked item is listed together here rather
 * than filtered to one tier at a time (the default page's pills gate the list to
 * a single tier and render nothing until one is picked).
 */
export default function ThemedMartGrid({ skin }) {
  const [items, setItems] = useState([]);
  const [martTiers, setMartTiers] = useState([]);
  const [userMartTier, setUserMartTier] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [result, setResult] = useState(null);
  const { refreshUserData, userData } = useUser();

  const fetchItems = useCallback(async () => {
    const response = await getAvailableRedemptionItems();
    setItems(mapRedemptionItems(response));
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setIsLoading(true);
      const [tiersResult, vipResult] = await Promise.allSettled([
        getPublicRedemptionTiers(),
        getVipTiers(),
      ]);

      if (!cancelled && tiersResult.status === "fulfilled") {
        setMartTiers([...tiersResult.value].sort((a, b) => a.level - b.level));
      } else if (tiersResult.status === "rejected") {
        console.error("Error fetching mart tiers:", tiersResult.reason);
      }

      if (!cancelled && vipResult.status === "fulfilled") {
        const tier = vipResult.value.find(
          (t) => t.name?.toLowerCase() === userData?.currentLevel?.toLowerCase()
        );
        setUserMartTier(tier?.mart_tier || null);
      } else if (vipResult.status === "rejected") {
        console.error("Error fetching user mart tier:", vipResult.reason);
      }

      try {
        await fetchItems();
      } catch (err) {
        console.error("Error fetching redemption items:", err);
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userData?.currentLevel, fetchItems]);

  const tierLevel = useCallback(
    (name) => {
      if (!name || !martTiers.length) return 999;
      return martTiers.find((t) => t.name?.toLowerCase() === name.toLowerCase())?.level ?? 999;
    },
    [martTiers]
  );

  // An item is locked when the tier it requires outranks the member's own.
  const isItemLocked = useCallback(
    (item) => {
      if (!item.mart_tier) return false;
      if (!userMartTier) return true;
      return tierLevel(item.mart_tier) > tierLevel(userMartTier);
    },
    [userMartTier, tierLevel]
  );

  const visibleItems = useMemo(() => items, [items]);

  // Tapping a card opens the confirm step; locked items short-circuit straight
  // to the upgrade notice without hitting the API.
  const openItem = useCallback(
    (item) => {
      setSelected(item);
      if (isItemLocked(item)) {
        setResult({
          success: false,
          message: `Upgrade to ${item.mart_tier || "a higher"} tier to unlock this item.`,
        });
        return;
      }
      setResult(null);
    },
    [isItemLocked]
  );

  const confirmRedeem = useCallback(
    async (item) => {
      if (!item || isItemLocked(item)) return;

      const memberUuid = tokenStorage.getMemberUuid();
      if (!memberUuid) {
        setResult({ success: false, message: "Please log in to redeem items." });
        return;
      }

      setIsRedeeming(true);
      try {
        const response = await redeemItem(item.uuid, memberUuid);
        setResult({
          success: true,
          message:
            response.details ||
            "Congratulations! You've successfully redeemed this item!",
        });
        await Promise.all([refreshUserData(), fetchItems()]);
      } catch (err) {
        setResult({
          success: false,
          message:
            err.data?.details || err.message || "Failed to redeem item. Please try again.",
        });
      } finally {
        setIsRedeeming(false);
      }
    },
    [isItemLocked, refreshUserData, fetchItems]
  );

  const closeDialog = () => {
    setSelected(null);
    setResult(null);
  };

  return (
    <section className="relative w-full px-4">
      {/* -mx-4 cancels the section padding so the full-bleed plaque reaches
          both screen edges, as the comps do. */}
      <div className="-mx-4 flex justify-center">
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

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div
            className="h-10 w-10 animate-spin rounded-full border-2 border-transparent"
            style={{ borderTopColor: skin.c.redeem, borderRightColor: skin.c.redeem }}
          />
        </div>
      ) : visibleItems.length === 0 ? (
        <p
          className="py-16 text-center text-[16px] font-bold"
          style={{ fontFamily: skin.font, color: skin.c.name }}
        >
          No rewards available right now.
        </p>
      ) : (
        // Row gap absorbs the redeem plaque's designed overhang past the card
        // frame's bottom edge (see MART_CARD.redeem).
        <div className="mx-auto grid w-full max-w-[358px] grid-cols-2 gap-x-4 gap-y-8 pt-2">
          {visibleItems.map((item, i) => {
            const locked = isItemLocked(item);
            return (
              <motion.div
                key={item.uuid}
                className="@container relative w-full"
                style={{ aspectRatio: MART_CARD.aspect }}
                initial={{ opacity: 0, y: 34, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 170,
                  damping: 18,
                  delay: 0.12 + i * 0.07,
                }}
              >
                <Image
                  src={skin.itemFrame}
                  alt=""
                  fill
                  className="pointer-events-none object-fill"
                  sizes="(max-width: 400px) 50vw, 180px"
                />

                {/* Gold plinth + product shot */}
                <div
                  className="absolute overflow-hidden"
                  style={{
                    left: `${MART_CARD.panel.left}%`,
                    top: `${MART_CARD.panel.top}%`,
                    width: `${MART_CARD.panel.w}%`,
                    height: `${MART_CARD.panel.h}%`,
                    borderRadius: `${MART_CARD.panel.radiusCqi}cqi`,
                    backgroundImage: skin.panelGradient,
                  }}
                >
                  {item.image && (
                    <div
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                      style={{
                        width: `${MART_CARD.image.w}%`,
                        height: `${MART_CARD.image.h}%`,
                      }}
                    >
                      {/* Product shots come from the backend on an arbitrary
                          host, so they use a plain <img> like the default
                          <MartItem> rather than next/image (whose
                          remotePatterns don't cover it). */}
                      <img
                        src={item.image}
                        alt={item.title || ""}
                        className={`h-full w-full object-contain ${locked ? "opacity-60 grayscale" : ""}`}
                      />
                    </div>
                  )}
                </div>

                <p
                  className="absolute left-1/2 w-[86%] -translate-x-1/2 -translate-y-1/2 truncate text-center"
                  style={{
                    top: `${MART_CARD.name.top}%`,
                    fontFamily: skin.font,
                    fontSize: `${MART_CARD.name.sizeCqi}cqi`,
                    color: locked ? skin.c.locked : skin.c.name,
                  }}
                >
                  {item.title}
                </p>

                <p
                  className="absolute left-1/2 w-[86%] -translate-x-1/2 -translate-y-1/2 truncate text-center"
                  style={{
                    top: `${MART_CARD.coins.top}%`,
                    fontFamily: skin.font,
                    fontSize: `${MART_CARD.coins.sizeCqi}cqi`,
                    color: locked ? skin.c.locked : skin.c.coins,
                  }}
                >
                  {formatCoins(item.discountPrice ?? item.coins)} Pagcor Coins
                </p>

                <button
                  type="button"
                  onClick={() => openItem(item)}
                  className="absolute transition-transform active:scale-95"
                  style={{
                    left: `${MART_CARD.redeem.left}%`,
                    top: `${MART_CARD.redeem.top}%`,
                    width: `${MART_CARD.redeem.w}%`,
                    height: `${MART_CARD.redeem.h}%`,
                  }}
                  aria-label={locked ? `${item.title} locked` : `Redeem ${item.title}`}
                >
                  <Image
                    src={skin.redeemButton}
                    alt=""
                    fill
                    className="object-fill"
                    sizes="180px"
                  />
                  <span
                    className="absolute inset-0 flex items-center justify-center whitespace-nowrap"
                    style={{
                      fontFamily: skin.font,
                      fontSize: `${MART_CARD.redeem.sizeCqi}cqi`,
                      color: locked ? skin.c.locked : skin.c.redeem,
                    }}
                  >
                    {locked ? "Locked" : "Redeem"}
                  </span>
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      <ThemedDialog open={!!selected} onClose={closeDialog}>
        {isRedeeming ? (
          <p
            className="text-center text-[16px] font-bold"
            style={{ fontFamily: skin.font, color: skin.c.redeem }}
          >
            Redeeming…
          </p>
        ) : result ? (
          <>
            <p
              className="text-center text-[16px] font-bold leading-[1.45]"
              style={{
                fontFamily: skin.font,
                color: result.success ? skin.c.redeem : skin.c.locked,
              }}
            >
              {result.message}
            </p>
            <ThemedActionButton textSize={16} onClick={closeDialog}>
              Close
            </ThemedActionButton>
          </>
        ) : (
          <>
            <p
              className="text-center text-[16px] font-bold leading-[1.45]"
              style={{ fontFamily: skin.font, color: skin.c.name }}
            >
              Redeem {selected?.title} for{" "}
              {formatCoins(selected?.discountPrice ?? selected?.coins)} Pagcor Coins?
            </p>
            <div className="flex w-full flex-col items-center gap-2">
              <ThemedActionButton
                textSize={16}
                onClick={() => confirmRedeem(selected)}
              >
                Confirm
              </ThemedActionButton>
              <ThemedActionButton textSize={14} variant="dark" onClick={closeDialog}>
                Cancel
              </ThemedActionButton>
            </div>
          </>
        )}
      </ThemedDialog>
    </section>
  );
}
