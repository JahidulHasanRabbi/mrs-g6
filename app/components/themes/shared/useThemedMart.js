"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getAvailableRedemptionItems,
  getPublicRedemptionTiers,
  getRedemptionGameStatus,
  getVipTiers,
  redeemItem,
} from "../../../api/memberApi";
import { mapRedemptionItems } from "../../../api/responseMappers";
import { tokenStorage } from "../../../api/tokenStorage";
import { useUser } from "../../../contexts/UserContext";

/**
 * Themed Mart state + redeem flow, a 1:1 functional copy of the default
 * app/mart/page.js. Shared by <ThemedMartGrid> (art skins) and the King Rewards
 * Mart so every skin runs the same fetches, tier locks, sort and redeem rules.
 */

// Mirrors TIER_NAME_TO_ORDER in app/mart/page.js — kept in sync by hand so the
// default page needs no edits.
const TIER_NAME_TO_ORDER = {
  starter: 1,
  bronze: 1,
  silver: 1,
  premium: 2,
  gold: 2,
  exclusive: 3,
  platinum: 3,
  vip: 4,
  diamond: 4,
};

function resolveUnlockedTierOrder(currentLevel) {
  if (!currentLevel) return 1;
  const key = String(currentLevel).trim().toLowerCase();
  return TIER_NAME_TO_ORDER[key] || 1;
}

export const priceOf = (item) => item.discountPrice || item.coins;

// Mirrors STRUCTURAL_BLOCK_LABELS in app/components/mart/MartItem.jsx —
// reasons the item itself isn't redeemable right now, as opposed to
// "insufficient_balance" which the user can still fix.
export const STRUCTURAL_BLOCK_LABELS = {
  out_of_stock: "Out of Stock",
  not_yet_available: "Not Available Yet",
  no_longer_available: "No Longer Available",
};

export function useThemedMart() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);
  const [sortMode, setSortMode] = useState("default");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [martItems, setMartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemResult, setRedeemResult] = useState(null);
  const [gameStatus, setGameStatus] = useState(null);
  const [userMartTierLevel, setUserMartTierLevel] = useState(null);
  const [martTiers, setMartTiers] = useState([]);
  const { refreshUserData, userData } = useUser();
  const unlockedTierOrder = resolveUnlockedTierOrder(userData?.currentLevel);

  useEffect(() => {
    fetchUserMartTierLevel();
    fetchMartTiers();
    fetchRedemptionStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.currentLevel]);

  const handleClosePreview = useCallback(() => setPreviewItem(null), []);

  const fetchRedemptionStatus = async () => {
    try {
      const status = await getRedemptionGameStatus();
      const nextStatus = Number(status?.game_status ?? 1);
      setGameStatus(nextStatus);
      if (nextStatus === 1) {
        await fetchRedemptionItems();
      } else {
        setMartItems([]);
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error fetching redemption status:", err);
      setGameStatus(1);
      await fetchRedemptionItems();
    }
  };

  const fetchUserMartTierLevel = async () => {
    try {
      const vipTiers = await getVipTiers();
      const userTier = vipTiers.find(
        (tier) => tier.name.toLowerCase() === userData?.currentLevel?.toLowerCase()
      );
      setUserMartTierLevel(userTier && userTier.mart_tier ? userTier.mart_tier : null);
    } catch (err) {
      console.error("Error fetching user mart tier level:", err);
      setUserMartTierLevel(null);
    }
  };

  const fetchMartTiers = async () => {
    try {
      const tiers = await getPublicRedemptionTiers();
      const sortedTiers = tiers.sort((a, b) => a.level - b.level);
      setMartTiers(sortedTiers);
      if (sortedTiers.length > 0 && !selectedCategory) {
        setSelectedCategory(sortedTiers[0].name.toLowerCase());
      }
    } catch (err) {
      console.error("Error fetching mart tiers:", err);
      setMartTiers([]);
    }
  };

  const fetchRedemptionItems = async () => {
    setIsLoading(true);
    try {
      const response = await getAvailableRedemptionItems();
      setMartItems(mapRedemptionItems(response));
    } catch (err) {
      console.error("Error fetching redemption items:", err);
      setMartItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getMartTierLevel = (tierName) => {
    if (!tierName || !martTiers.length) return 999;
    const tier = martTiers.find((t) => t.name.toLowerCase() === tierName.toLowerCase());
    return tier ? tier.level : 999;
  };

  const isItemLocked = (item) => {
    if (!item.mart_tier) return false;
    if (!userMartTierLevel) return true;
    return getMartTierLevel(item.mart_tier) > getMartTierLevel(userMartTierLevel);
  };

  const getRequiredTierName = (item) => item.mart_tier || "Premium";

  const parseCoins = (value) => {
    if (!value) return 0;
    const n = Number(String(value).replace(/,/g, ""));
    return Number.isFinite(n) ? n : 0;
  };

  // Mirrors getBlockReason in app/mart/page.js — only matters once an item is
  // already within the user's tier reach (see isItemLocked above).
  const getBlockReason = (item) => {
    const qty = item.quantity_available;
    if (qty !== null && qty !== undefined && qty !== "" && Number(qty) <= 0) {
      return "out_of_stock";
    }

    const now = new Date();
    if (item.start_date) {
      const start = new Date(item.start_date);
      if (!Number.isNaN(start.getTime()) && now < start) return "not_yet_available";
    }
    if (item.end_date) {
      const end = new Date(item.end_date);
      if (!Number.isNaN(end.getTime())) {
        end.setHours(23, 59, 59, 999); // end_date is a whole calendar day
        if (now > end) return "no_longer_available";
      }
    }

    if (parseCoins(priceOf(item)) > parseCoins(userData?.balance)) return "insufficient_balance";

    return null;
  };

  const BLOCK_REASON_MESSAGES = {
    out_of_stock: "This item is out of stock.",
    not_yet_available: "This item is not available yet.",
    no_longer_available: "This item is no longer available.",
    insufficient_balance: "You don't have enough KR Coins to redeem this item.",
  };

  const filteredItems = useMemo(() => {
    if (!selectedCategory) return [];
    return martItems.filter(
      (item) => (item.mart_tier || "").toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [martItems, selectedCategory]);

  const sortedItems = useMemo(() => {
    if (sortMode === "default") return filteredItems;
    const itemsCopy = [...filteredItems];
    itemsCopy.sort((a, b) => {
      const aPrice = parseCoins(priceOf(a));
      const bPrice = parseCoins(priceOf(b));
      if (sortMode === "price-asc") return aPrice - bPrice;
      if (sortMode === "price-desc") return bPrice - aPrice;
      return 0;
    });
    return itemsCopy;
  }, [filteredItems, sortMode]);

  const dynamicCategories = useMemo(
    () =>
      martTiers.map((tier) => ({
        key: tier.name.toLowerCase(),
        label: tier.name,
        fullLabel: `${tier.name} Rewards`,
        tierOrder: tier.level,
        tierName: tier.name,
      })),
    [martTiers]
  );

  const selectedCategoryFullLabel =
    dynamicCategories.find((c) => c.key === selectedCategory)?.fullLabel || "Rewards";

  const sortButtonLabel =
    sortMode === "price-asc"
      ? "Sort: Low to High"
      : sortMode === "price-desc"
        ? "Sort: High to Low"
        : "Sort by Default";

  const handleRedeem = async (item) => {
    setSelectedItem(item);
    setRedeemResult(null);

    if (gameStatus === 2) {
      setRedeemResult({ success: false, message: "Redemption is currently closed." });
      return;
    }

    if (isItemLocked(item)) {
      setRedeemResult({
        success: false,
        message: `Upgrade to ${getRequiredTierName(item)} tier to unlock this item.`,
      });
      setIsRedeeming(false);
      return;
    }

    const blockReason = getBlockReason(item);
    if (blockReason) {
      setRedeemResult({ success: false, message: BLOCK_REASON_MESSAGES[blockReason] });
      setIsRedeeming(false);
      return;
    }

    setIsRedeeming(true);
    try {
      const memberUuid = tokenStorage.getMemberUuid();
      if (!memberUuid) {
        setRedeemResult({ success: false, message: "Please log in to redeem items" });
        setIsRedeeming(false);
        return;
      }
      const response = await redeemItem(item.uuid, memberUuid);
      setRedeemResult({
        success: true,
        message:
          response.details || "Congratulations! You've successfully redeemed this item!",
      });
      await Promise.all([refreshUserData(), fetchRedemptionItems()]);
    } catch (err) {
      setRedeemResult({
        success: false,
        message:
          err.data?.details || err.message || "Failed to redeem item. Please try again.",
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
    setRedeemResult(null);
  };

  const handleSort = () => {
    setSortMode((prev) => {
      if (prev === "default") return "price-asc";
      if (prev === "price-asc") return "price-desc";
      return "default";
    });
  };

  return {
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
  };
}
