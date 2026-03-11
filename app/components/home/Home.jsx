"use client";
import { useState, useCallback, memo, useEffect } from "react";
import { HamburgerMenu } from "../hamburger";
import { FooterNav } from "../footer";
import { Header } from "../header";
import HomeHero from "./HomeHero";
import CheckInBoard from "./CheckInBoard";
import SpecialOffersCarousel from "./SpecialOffersCarousel";
import VideoGallery from "./VideoGallery";
import { HOME_ASSETS } from "./homeAssets";
import { getProfile } from "@/app/api/memberApi";
import { tokenStorage } from "@/app/api/tokenStorage";

const Home = memo(function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);

  const handleMenuOpen = useCallback(() => setIsMenuOpen(true), []);
  const handleMenuClose = useCallback(() => setIsMenuOpen(false), []);

  // Fetch profile data to get profile photo
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const memberUuid = tokenStorage.getMemberUuid();
        if (!memberUuid) return;

        const profileData = await getProfile(memberUuid);
        // Use profile photo if available from API
        if (profileData.profile_photo) {
          setProfilePhoto(profileData.profile_photo);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, []);

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
      <Header onMenuClick={handleMenuOpen} profilePhoto={profilePhoto} />

      <HamburgerMenu isOpen={isMenuOpen} onClose={handleMenuClose} />

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
});

export default Home;
