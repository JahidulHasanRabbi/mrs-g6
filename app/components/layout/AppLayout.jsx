"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { HamburgerMenu } from "../hamburger";
import { FooterNav } from "../footer";
import { Header } from "../header";
import MartHeader from "../mart/MartHeader";
import { HOME_ASSETS } from "../home/homeAssets";
import { useUser } from "../../contexts/UserContext";

export default function AppLayout({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const pathname = usePathname();
  const { userData } = useUser();

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
  const isSpinPage = pathname === "/spin";
  const isTermsPage = pathname === "/terms-and-conditions";

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
        backgroundPosition: "top center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        paddingTop: isMartPage ? "0" : "52px",
      }}
    >
      {/* Conditional Header */}
      {isMartPage ? (
        <MartHeader
          balance={userData.balance}
          onMenuClick={() => setIsMenuOpen(true)}
          onProfileClick={() => console.log("Profile clicked")}
          showAnimation={!hasAnimated}
        />
      ) : (
        <Header
          onMenuClick={() => setIsMenuOpen(true)}
          showAnimation={!hasAnimated}
          balance={isSpinPage ? userData.balance : null}
        />
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
