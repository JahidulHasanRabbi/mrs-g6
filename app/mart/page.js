"use client";

import { useState } from "react";
import MartTitleBanner from "../components/mart/MartTitleBanner";
import MartSortButton from "../components/mart/MartSortButton";
import MartGrid from "../components/mart/MartGrid";
import RedeemModal from "../components/mart/RedeemModal";
import { MART_ASSETS } from "../components/mart/martAssets";

export default function MartPage() {
  const [selectedItem, setSelectedItem] = useState(null);

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

  const handleRedeem = (item) => {
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  const handleSort = () => {
    console.log("Sort clicked");
    // Add sort logic here
  };

  return (
    <>
      <MartTitleBanner />
        
        <div className="flex justify-end px-8 mt-6">
          <MartSortButton onSort={handleSort} />
        </div>

      <MartGrid items={martItems} onRedeem={handleRedeem} />
      
      <RedeemModal 
        isOpen={!!selectedItem}
        onClose={handleCloseModal}
        item={selectedItem}
      />
    </>
  );
}
