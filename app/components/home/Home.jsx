"use client";
import { useState } from "react";
import { HamburgerMenu } from "../hamburger";
import { FooterNav } from "../footer";
import { Header } from "../header";
import HomeHero from "./HomeHero";
import CheckInBoard from "./CheckInBoard";
import SpecialOffersCarousel from "./SpecialOffersCarousel";
import VideoGallery from "./VideoGallery";
import { HOME_ASSETS } from "./homeAssets";

function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
        <HomeHero />
        <CheckInBoard />
        <SpecialOffersCarousel />

        {/* Video Gallery */}
        <VideoGallery />
      </main>
      <FooterNav />
    </div>
  );
}

export default Home;
