"use client";
import { useState } from "react";
import { FooterNav } from "../components/footer";
import { HamburgerMenu } from "../components/hamburger";
import { Header } from "../components/header";
import { HOME_ASSETS } from "../components/home/homeAssets";
import AnimatedSection from "../components/ui/AnimatedSection";
import ProfileCard from "../components/profile/ProfileCard";
import EditProfileSection from "../components/profile/EditProfileSection";

export default function ProfilePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleVipDetailsClick = () => {
    console.log("VIP Details clicked");
    // Add navigation to VIP details page
  };

  const handleDisplayPhoto = () => console.log("Display Photo clicked");
  const handleGender = () => console.log("Gender clicked");
  const handleBirthday = () => console.log("Birthday clicked");
  const handlePhone = () => console.log("Phone clicked");
  const handleEmail = () => console.log("Email clicked");
  const handleInterest = () => console.log("Interest clicked");

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
          imageSrc="/assets/profile/my-profile.png"
          imageAlt="my profile"
        />

        <div className="mt-8">
          <ProfileCard
            name="Jhon Doe"
            totalTokens={100}
            currentLevel="Gold"
            nextLevel="Platinum"
            progress={61.6}
            tokensNeeded={20000}
            onVipDetailsClick={handleVipDetailsClick}
          />
        </div>

        <div className="mt-6">
          <EditProfileSection
            onDisplayPhoto={handleDisplayPhoto}
            onGender={handleGender}
            onBirthday={handleBirthday}
            onPhone={handlePhone}
            onEmail={handleEmail}
            onInterest={handleInterest}
          />
        </div>
      </main>

      <FooterNav />
    </div>
  );
}
