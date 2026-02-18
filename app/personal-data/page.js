"use client";
import { useState } from "react";
import { FooterNav } from "../components/footer";
import { HamburgerMenu } from "../components/hamburger";
import { Header } from "../components/header";
import { HOME_ASSETS } from "../components/home/homeAssets";
import AnimatedSection from "../components/ui/AnimatedSection";
import PersonalDataForm from "../components/personal-data/PersonalDataForm";

export default function PersonalDataPage() {
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
      </main>

      <FooterNav />
    </div>
  );
}
