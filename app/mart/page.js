"use client";

import { useMemo, useState, useEffect } from "react";
import MartTitleBanner from "../components/mart/MartTitleBanner";
import MartSortButton from "../components/mart/MartSortButton";
import MartCategoryPills from "../components/mart/MartCategoryPills";
import MartGrid from "../components/mart/MartGrid";
import RedeemModal from "../components/mart/RedeemModal";
import { LoadingState } from "../components/ui/LoadingState";
import { getAvailableRedemptionItems, redeemItem, getVipTiers, getPublicRedemptionTiers } from "../api/memberApi";
import { mapRedemptionItems } from "../api/responseMappers";
import { tokenStorage } from "../api/tokenStorage";
import { useUser } from "../contexts/UserContext";

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

export default function MartPage() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [sortMode, setSortMode] = useState("default");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [martItems, setMartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemResult, setRedeemResult] = useState(null);
  const { refreshUserData, userData } = useUser();
  const unlockedTierOrder = resolveUnlockedTierOrder(userData?.currentLevel);
  const [userMartTierLevel, setUserMartTierLevel] = useState(null);
  const [martTiers, setMartTiers] = useState([]);

  // Fetch user's mart tier level and all mart tiers on mount
  useEffect(() => {
    fetchUserMartTierLevel();
    fetchMartTiers();
    fetchRedemptionItems();
  }, [userData?.currentLevel]);

  const fetchUserMartTierLevel = async () => {
    try {
      // Get all VIP tiers
      const vipTiers = await getVipTiers();
      
      // Find the user's current VIP tier
      const userTier = vipTiers.find(
        tier => tier.name.toLowerCase() === userData?.currentLevel?.toLowerCase()
      );
      
      if (userTier && userTier.mart_tier) {
        // Store the mart_tier name from user's VIP tier
        setUserMartTierLevel(userTier.mart_tier);
      } else {
        setUserMartTierLevel(null);
      }
    } catch (err) {
      console.error('Error fetching user mart tier level:', err);
      setUserMartTierLevel(null);
    }
  };

  const fetchMartTiers = async () => {
    try {
      const tiers = await getPublicRedemptionTiers();
      // Sort by level ascending
      const sortedTiers = tiers.sort((a, b) => a.level - b.level);
      setMartTiers(sortedTiers);
      
      // Set first category as default if available
      if (sortedTiers.length > 0 && !selectedCategory) {
        setSelectedCategory(sortedTiers[0].name.toLowerCase());
      }
    } catch (err) {
      console.error('Error fetching mart tiers:', err);
      setMartTiers([]);
    }
  };

  const fetchRedemptionItems = async () => {
    setIsLoading(true);
    
    try {
      const response = await getAvailableRedemptionItems();
      const mappedItems = mapRedemptionItems(response);
      setMartItems(mappedItems);
    } catch (err) {
      console.error('Error fetching redemption items:', err);
      setMartItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get mart tier level by name
  const getMartTierLevel = (tierName) => {
    if (!tierName || !martTiers.length) return 999; // Unknown tier = highest level (locked)
    const tier = martTiers.find(t => t.name.toLowerCase() === tierName.toLowerCase());
    return tier ? tier.level : 999;
  };

  // Helper function to check if an item is locked for the user
  const isItemLocked = (item) => {
    // If item has no mart_tier, it's available to everyone
    if (!item.mart_tier) {
      return false;
    }
    
    // If no user mart tier, lock everything that requires a tier
    if (!userMartTierLevel) {
      return true;
    }
    
    const userLevel = getMartTierLevel(userMartTierLevel);
    const itemLevel = getMartTierLevel(item.mart_tier);
    
    // Item is LOCKED if its required level is HIGHER than user's level
    // Item is UNLOCKED if its required level is LOWER or EQUAL to user's level
    return itemLevel > userLevel;
  };

  // Helper function to get required tier name for locked items
  const getRequiredTierName = (item) => {
    return item.mart_tier || 'Premium';
  };

  const parseCoins = (value) => {
    if (!value) return 0;
    const n = Number(String(value).replace(/,/g, ""));
    return Number.isFinite(n) ? n : 0;
  };

  const filteredItems = useMemo(() => {
    if (!selectedCategory) return [];
    return martItems.filter((item) => {
      const itemCategory = (item.mart_tier || "").toLowerCase();
      return itemCategory === selectedCategory.toLowerCase();
    });
  }, [martItems, selectedCategory]);

  const sortedItems = useMemo(() => {
    if (sortMode === "default") return filteredItems;

    const itemsCopy = [...filteredItems];
    itemsCopy.sort((a, b) => {
      const aPrice = parseCoins(a.discountPrice || a.coins);
      const bPrice = parseCoins(b.discountPrice || b.coins);

      if (sortMode === "price-asc") return aPrice - bPrice;
      if (sortMode === "price-desc") return bPrice - aPrice;
      return 0;
    });

    return itemsCopy;
  }, [filteredItems, sortMode]);

  // Generate dynamic categories from mart tiers
  const dynamicCategories = useMemo(() => {
    return martTiers.map(tier => ({
      key: tier.name.toLowerCase(),
      label: tier.name,
      fullLabel: `${tier.name} Rewards`,
      tierOrder: tier.level,
      tierName: tier.name
    }));
  }, [martTiers]);

  const selectedCategoryDef = dynamicCategories.find((c) => c.key === selectedCategory);
  const selectedCategoryFullLabel = selectedCategoryDef?.fullLabel || "Rewards";

  const sortButtonLabel =
    sortMode === "price-asc"
      ? "Sort: Low to High"
      : sortMode === "price-desc"
        ? "Sort: High to Low"
        : "Sort by Default";

  const handleRedeem = async (item) => {
    setSelectedItem(item);
    setRedeemResult(null);

    // Check if this specific item is locked
    const itemLocked = isItemLocked(item);
    
    if (itemLocked) {
      setRedeemResult({
        success: false,
        message: `Upgrade to ${getRequiredTierName(item)} tier to unlock this item.`,
      });
      setIsRedeeming(false);
      return;
    }

    setIsRedeeming(true);

    try {
      const memberUuid = tokenStorage.getMemberUuid();
      
      if (!memberUuid) {
        setRedeemResult({
          success: false,
          message: "Please log in to redeem items"
        });
        setIsRedeeming(false);
        return;
      }
      
      const response = await redeemItem(item.uuid, memberUuid);
      
      setRedeemResult({
        success: true,
        message: response.details || "Congratulations! You've successfully redeemed this item!"
      });
      
      // Refresh balance and items list after successful redemption
      await Promise.all([
        refreshUserData(),
        fetchRedemptionItems()
      ]);
    } catch (err) {
      setRedeemResult({
        success: false,
        message: err.data?.details || err.message || "Failed to redeem item. Please try again."
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

  return (
    <div className="relative min-h-screen">
      <MartTitleBanner />

      <MartCategoryPills
        selected={selectedCategory}
        onSelect={setSelectedCategory}
        unlockedTierOrder={unlockedTierOrder}
        categories={dynamicCategories}
      />

      <div className="flex justify-end px-8 mt-4">
        <MartSortButton onSort={handleSort} label={sortButtonLabel} />
      </div>

      <LoadingState isLoading={isLoading}>
        {sortedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-8 mt-12 mb-12">
            <div className="text-center">
              <p className="text-[#60803C] text-[20px] font-bold font-['Times_New_Roman'] mb-2">
                No {selectedCategoryFullLabel} Available
              </p>
              <p className="text-[#60803C] text-[16px] font-['Times_New_Roman'] opacity-70">
                There are currently no items in this category.
              </p>
            </div>
          </div>
        ) : (
          <MartGrid
            items={sortedItems}
            onRedeem={handleRedeem}
            isItemLocked={isItemLocked}
            getRequiredTierName={getRequiredTierName}
          />
        )}
      </LoadingState>
      
      <RedeemModal 
        isOpen={!!selectedItem}
        onClose={handleCloseModal}
        item={selectedItem}
        isRedeeming={isRedeeming}
        redeemResult={redeemResult}
      />

      {/* Coming Soon Overlay - Covers entire page content */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center">
        <div className="text-center px-8">
          <h1 className="text-white text-[48px] md:text-[72px] font-bold font-['Times_New_Roman'] animate-pulse">
            COMING SOON
          </h1>
        </div>
      </div>
    </div>
  );
}
