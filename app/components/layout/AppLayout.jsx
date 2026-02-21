"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { HamburgerMenu } from "../hamburger";
import { FooterNav } from "../footer";
import { Header } from "../header";
import MartHeader from "../mart/MartHeader";
import { HOME_ASSETS } from "../home/homeAssets";

export default function AppLayout({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const pathname = usePathname();

  // Track initial mount to show animations only once
  useEffect(() => {
    console.log('AppLayout mounted, hasAnimated:', hasAnimated);
    
    // Delay setting hasAnimated to allow entrance animations to complete
    const timer = setTimeout(() => {
      console.log('Setting hasAnimated to true');
      setHasAnimated(true);
    }, 1000); // Wait 1 second for animations to finish

    return () => clearTimeout(timer);
  }, []);

  // Determine if we're on the mart page (uses different header)
  const isMartPage = pathname === "/mart";
  const isHomePage = pathname === "/";

  // Don't show layout on home page
  if (isHomePage) {
    return <>{children}</>;
  }

  return (
    <div
      className="min-h-screen w-full pb-[100px] relative"
      style={{
        backgroundImage: `url(${HOME_ASSETS.backgroundPattern})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        paddingTop: isMartPage ? "0" : "52px",
      }}
    >
      {/* Conditional Header */}
      {isMartPage ? (
        <MartHeader
          balance="5,450.00"
          onMenuClick={() => setIsMenuOpen(true)}
          onProfileClick={() => console.log("Profile clicked")}
          showAnimation={!hasAnimated}
        />
      ) : (
        <Header onMenuClick={() => setIsMenuOpen(true)} showAnimation={!hasAnimated} />
      )}

      {/* Hamburger Menu - Persists across all pages */}
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Page Content */}
      <main className="w-full">{children}</main>

      {/* Footer - Persists across all pages */}
      <FooterNav showAnimation={!hasAnimated} />
    </div>
  );
}
