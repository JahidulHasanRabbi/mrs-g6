"use client";
import { useState, useCallback } from "react";
import AnimatedSection from "../components/ui/AnimatedSection";
import PersonalDataForm from "../components/personal-data/PersonalDataForm";
import { Header } from "../components/header";
import { HamburgerMenu } from "../components/hamburger";
import { FooterNav } from "../components/footer";
import { useUser } from "@/app/contexts/UserContext";
import { useTheme } from "../contexts/ThemeContext";

export default function PersonalDataPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { profilePicture } = useUser();
  // On a theme, AppLayout wraps this page in the themed shell (its own header +
  // bottom nav), so the default chrome below would stack on top — skip it.
  const { isThemed } = useTheme();

  const handleMenuOpen = useCallback(() => setIsMenuOpen(true), []);
  const handleMenuClose = useCallback(() => setIsMenuOpen(false), []);

  return (
    <>
      {!isThemed && (
        <>
          <Header onMenuClick={handleMenuOpen} profilePhoto={profilePicture} />
          <HamburgerMenu isOpen={isMenuOpen} onClose={handleMenuClose} />
        </>
      )}

      <AnimatedSection
        title="Personal Data" 
        imageSrc="" 
        imageAlt="Personal Data"
        titleSize={36}
        imageHeight={0}
      />
      
      <div className="flex flex-col items-center px-4 mt-8">
        <PersonalDataForm />
      </div>

      {!isThemed && <FooterNav />}
    </>
  );
}
