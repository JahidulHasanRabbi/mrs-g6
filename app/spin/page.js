"use client";

import { useState } from "react";
import { HamburgerMenu } from "../components/hamburger";
import { FooterNav } from "../components/footer";
import { Header } from "../components/header";
import { HOME_ASSETS } from "../components/home/homeAssets";
import AnimatedSection from "../components/ui/AnimatedSection";
import LuckySPin from "../../public/assets/lucky-spin/lucky-spin.png";
import LuckySpinGrid from "../components/spin/LuckySpinGrid";
import SpinButtonsContainer from "../components/spin/SpinButtonsContainer";


export default function SpinPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleButtonClick = (buttonData) => {
    console.log(`Button clicked: ${buttonData.spins} spins for ${buttonData.tokens} tokens`);
    // Add your button click logic here
  };

  return (
    <div
      className="min-h-screen w-full pt-[52px] pb-[100px] relative"
      style={{
        backgroundImage: `url(${HOME_ASSETS.backgroundPattern})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Header onMenuClick={() => setIsMenuOpen(true)} />

      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <main className="w-full">
        <AnimatedSection
          title=""
          imageSrc={LuckySPin}
          imageAlt="lucky spin"
        />
        
        <div className="flex justify-center items-center py-8">
          <LuckySpinGrid />
        </div>
        
        <div className="flex justify-center px-8 py-4">
          <SpinButtonsContainer onButtonClick={handleButtonClick} />
        </div>
      </main>

      <FooterNav />
    </div>
  );
}
