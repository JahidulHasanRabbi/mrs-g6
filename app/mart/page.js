"use client";

import { useMemo, useState, useEffect } from "react";
import MartTitleBanner from "../components/mart/MartTitleBanner";
import MartSortButton from "../components/mart/MartSortButton";
import MartGrid from "../components/mart/MartGrid";
import RedeemModal from "../components/mart/RedeemModal";
import { LoadingState } from "../components/ui/LoadingState";
import ErrorDisplay from "../components/ui/ErrorDisplay";
import { getAvailableRedemptionItems, redeemItem } from "../api/memberApi";
import { mapRedemptionItems } from "../api/responseMappers";
import { tokenStorage } from "../api/tokenStorage";

export default function MartPage() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [sortMode, setSortMode] = useState("default");
  const [martItems, setMartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemResult, setRedeemResult] = useState(null);

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
      setMartItems(mappedItems);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const parseCoins = (value) => {
    if (!value) return 0;
    const n = Number(String(value).replace(/,/g, ""));
    return Number.isFinite(n) ? n : 0;
  };

  const sortedItems = useMemo(() => {
    if (sortMode === "default") return martItems;

    const itemsCopy = [...martItems];
    itemsCopy.sort((a, b) => {
      const aPrice = parseCoins(a.discountPrice || a.coins);
      const bPrice = parseCoins(b.discountPrice || b.coins);

      if (sortMode === "price-asc") return aPrice - bPrice;
      if (sortMode === "price-desc") return bPrice - aPrice;
      return 0;
    });

    return itemsCopy;
  }, [martItems, sortMode]);

  const sortButtonLabel =
    sortMode === "price-asc"
      ? "Sort: Low to High"
      : sortMode === "price-desc"
        ? "Sort: High to Low"
        : "Sort by Default";

  const handleRedeem = async (item) => {
    setSelectedItem(item);
    setRedeemResult(null);
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
      
      // Refresh items list after successful redemption
      await fetchRedemptionItems();
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
        
      <div className="flex justify-end px-8 mt-6">
        <MartSortButton onSort={handleSort} label={sortButtonLabel} />
      </div>

      <LoadingState isLoading={isLoading}>
        {error ? (
          <div className="px-8 mt-6">
            <ErrorDisplay error={error} />
          </div>
        ) : (
          <MartGrid items={sortedItems} onRedeem={handleRedeem} />
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
