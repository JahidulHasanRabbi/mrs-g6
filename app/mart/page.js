"use client";

import { useMemo, useState, useEffect } from "react";
import MartTitleBanner from "../components/mart/MartTitleBanner";
import MartSortButton from "../components/mart/MartSortButton";
import MartCategoryPills, { MART_CATEGORIES } from "../components/mart/MartCategoryPills";
import MartGrid from "../components/mart/MartGrid";
import RedeemModal from "../components/mart/RedeemModal";
import { LoadingState } from "../components/ui/LoadingState";
import ErrorDisplay from "../components/ui/ErrorDisplay";
import { getAvailableRedemptionItems, redeemItem } from "../api/memberApi";
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

// Dummy preview data — used when the API returns nothing so designers can
// preview locked + unlocked card states across all 4 categories.
const DUMMY_PREVIEW_ITEMS = [
  {
    uuid: "dummy-starter-1",
    title: "Starter Rewards",
    coins: 6999000,
    originalPrice: 8999000,
    discountPrice: 6999000,
    image: "/assets/mart/prize-iphone.png",
    category: "starter",
  },
  {
    uuid: "dummy-starter-2",
    title: "Starter Rewards",
    coins: 1500000,
    originalPrice: null,
    discountPrice: 1500000,
    image: "/assets/mart/prize-birthday.png",
    category: "starter",
  },
  {
    uuid: "dummy-premium-1",
    title: "Premium Rewards",
    coins: 1223000,
    originalPrice: null,
    discountPrice: 1223000,
    image: "/assets/mart/prize-sex-toy.png",
    category: "premium",
  },
  {
    uuid: "dummy-premium-2",
    title: "Premium Rewards",
    coins: 2000000,
    originalPrice: null,
    discountPrice: 2000000,
    image: "/assets/mart/prize-iphone.png",
    category: "premium",
  },
  {
    uuid: "dummy-exclusive-1",
    title: "Exclusive Rewards",
    coins: 2333000,
    originalPrice: null,
    discountPrice: 2333000,
    image: "/assets/mart/prize-birthday.png",
    category: "exclusive",
  },
  {
    uuid: "dummy-exclusive-2",
    title: "Exclusive Rewards",
    coins: 3000000,
    originalPrice: null,
    discountPrice: 3000000,
    image: "/assets/mart/prize-iphone.png",
    category: "exclusive",
  },
  {
    uuid: "dummy-vip-1",
    title: "VIP Privileges",
    coins: 1223000,
    originalPrice: null,
    discountPrice: 1223000,
    image: "/assets/mart/prize-sex-toy.png",
    category: "vip",
  },
  {
    uuid: "dummy-vip-2",
    title: "VIP Privileges",
    coins: 5000000,
    originalPrice: null,
    discountPrice: 5000000,
    image: "/assets/mart/prize-iphone.png",
    category: "vip",
  },
];

export default function MartPage() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [sortMode, setSortMode] = useState("default");
  const [selectedCategory, setSelectedCategory] = useState("starter");
  const [martItems, setMartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemResult, setRedeemResult] = useState(null);
  const { refreshUserData, userData } = useUser();
  const unlockedTierOrder = resolveUnlockedTierOrder(userData?.currentLevel);

  // Fetch redemption items on mount
  useEffect(() => {
    fetchRedemptionItems();
  }, []);

  const fetchRedemptionItems = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getAvailableRedemptionItems();
      const mappedItems = mapRedemptionItems(response);
      // Merge dummy preview items into every category so the lock/unlock
      // design is reviewable while backend category data is still WIP.
      setMartItems([...mappedItems, ...DUMMY_PREVIEW_ITEMS]);
    } catch (err) {
      setError(err);
      setMartItems(DUMMY_PREVIEW_ITEMS);
    } finally {
      setIsLoading(false);
    }
  };

  const parseCoins = (value) => {
    if (!value) return 0;
    const n = Number(String(value).replace(/,/g, ""));
    return Number.isFinite(n) ? n : 0;
  };

  const filteredItems = useMemo(
    () => martItems.filter((item) => (item.category || "starter") === selectedCategory),
    [martItems, selectedCategory]
  );

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

  const selectedCategoryDef = MART_CATEGORIES.find((c) => c.key === selectedCategory);
  const selectedCategoryFullLabel = selectedCategoryDef?.fullLabel || "Rewards";
  const isCategoryLocked = (selectedCategoryDef?.tierOrder || 1) > unlockedTierOrder;
  const requiredTierLabel = selectedCategoryDef?.label;

  const sortButtonLabel =
    sortMode === "price-asc"
      ? "Sort: Low to High"
      : sortMode === "price-desc"
        ? "Sort: High to Low"
        : "Sort by Default";

  const handleRedeem = async (item) => {
    setSelectedItem(item);
    setRedeemResult(null);

    if (isCategoryLocked) {
      setRedeemResult({
        success: false,
        message: `Upgrade to ${requiredTierLabel} to unlock this item.`,
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
    <>
      <MartTitleBanner />

      <MartCategoryPills
        selected={selectedCategory}
        onSelect={setSelectedCategory}
        unlockedTierOrder={unlockedTierOrder}
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
            isLocked={isCategoryLocked}
            requiredTierLabel={requiredTierLabel}
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
    </>
  );
}
