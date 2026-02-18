"use client";

import { useState } from "react";
import { HamburgerMenu } from "../components/hamburger";
import { FooterNav } from "../components/footer";
import { HOME_ASSETS } from "../components/home/homeAssets";
import MartHeader from "../components/mart/MartHeader";
import MartTitleBanner from "../components/mart/MartTitleBanner";
import MartSortButton from "../components/mart/MartSortButton";
import MartGrid from "../components/mart/MartGrid";
import RedeemModal from "../components/mart/RedeemModal";
import { MART_ASSETS } from "../components/mart/martAssets";

export default function MartPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const martItems = [
    {
      image: MART_ASSETS.prize1,
      title: "iPhone 17 Pro Max",
      coins: "8,999,000 Pagcor Coins",
    },
    {
      image: MART_ASSETS.prize2,
      title: "Sex Toy",
      coins: "1,223,000 Pagcor Coins",
    },
    {
      image: MART_ASSETS.prize3,
      title: "Birthday",
      coins: "2,333,000 Pagcor Coins",
    },
    {
      image: MART_ASSETS.prize2,
      title: "Sex Toy",
      coins: "1,223,000 Pagcor Coins",
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
    <div
      className="min-h-screen w-full pb-[100px] relative"
      style={{
        backgroundImage: `url(${HOME_ASSETS.backgroundPattern})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <MartHeader
        balance="5,450.00"
        onMenuClick={() => setIsMenuOpen(true)}
        onProfileClick={() => console.log("Profile clicked")}
      />
      
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <main className="w-full">
        <MartTitleBanner />
        
        <div className="flex justify-end px-8 mt-6">
          <MartSortButton onSort={handleSort} />
        </div>

        <MartGrid items={martItems} onRedeem={handleRedeem} />
      </main>

      <FooterNav />
      
      <RedeemModal 
        isOpen={!!selectedItem}
        onClose={handleCloseModal}
        item={selectedItem}
      />
    </div>
  );
}
