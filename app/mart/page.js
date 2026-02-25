"use client";

import { useMemo, useState } from "react";
import MartTitleBanner from "../components/mart/MartTitleBanner";
import MartSortButton from "../components/mart/MartSortButton";
import MartGrid from "../components/mart/MartGrid";
import RedeemModal from "../components/mart/RedeemModal";
import { MART_ASSETS } from "../components/mart/martAssets";

export default function MartPage() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [sortMode, setSortMode] = useState("default");

  const martItems = [
    {
      image: MART_ASSETS.prize1,
      title: "iPhone 17 Pro Max",
      originalPrice: "8,999,000",
      discountPrice: "6,999,000",
    },
    {
      image: MART_ASSETS.prize2,
      title: "Sex Toy",
      originalPrice: "1,500,000",
      discountPrice: "1,223,000",
    },
    {
      image: MART_ASSETS.prize3,
      title: "Birthday",
      originalPrice: "3,000,000",
      discountPrice: "2,333,000",
    },
    {
      image: MART_ASSETS.prize2,
      title: "Sex Toy",
      originalPrice: "1,500,000",
      discountPrice: "1,223,000",
    },
  ];

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

  const handleRedeem = (item) => {
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
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

      <MartGrid items={sortedItems} onRedeem={handleRedeem} />
      
      <RedeemModal 
        isOpen={!!selectedItem}
        onClose={handleCloseModal}
        item={selectedItem}
      />
    </>
  );
}
