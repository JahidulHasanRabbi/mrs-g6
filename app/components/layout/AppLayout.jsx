"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { HamburgerMenu } from "../hamburger";
import { FooterNav } from "../footer";
import { Header } from "../header";
import MartHeader from "../mart/MartHeader";
import { HOME_ASSETS } from "../home/homeAssets";
import { useUser } from "../../contexts/UserContext";
import { useTheme } from "../../contexts/ThemeContext";
import ThemedPageShell from "../themes/shared/ThemedPageShell";

export default function AppLayout({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const pathname = usePathname();
  const { userData, profilePicture } = useUser();
  const { isThemed } = useTheme();

  // Track initial mount to show animations only once
  useEffect(() => {
    // Delay setting hasAnimated to allow entrance animations to complete
    const timer = setTimeout(() => {
      setHasAnimated(true);
    }, 1000); // Wait 1 second for animations to finish

    return () => clearTimeout(timer);
  }, []);

  // Determine if we're on the mart page (uses different header)
  const isMartPage = pathname === "/mart";
  const isHomePage = pathname === "/";
  const isSpinPage = pathname === "/spin";
  const isTermsPage = pathname === "/terms-and-conditions";
  // The whole Penalty Kick section (the game at /penalty-kick plus the
  // Missions sub-page at /penalty-kick/missions) is self-contained — each
  // screen draws its own header + FooterNav over a full-bleed backdrop.
  const isPenaltyKickPage =
    pathname === "/penalty-kick" || pathname?.startsWith("/penalty-kick/");
  const isSmashEggPage = pathname === "/smash-egg";
  const isMissionsPage = pathname === "/missions";
  const isLeaderboardPage =
    pathname === "/leaderboard" || pathname?.startsWith("/leaderboard/");
  // The Avatar game draws its own top bar + bottom nav (see app/avatar/page.js).
  const isRpgPage = pathname === "/avatar" || pathname?.startsWith("/avatar/");

  // Don't show layout on home page
  if (isHomePage) {
    return <>{children}</>;
  }

  // /auth is a full-screen spinner that redirects on its own. Wrapping it in
  // themed chrome only makes the shell chunk load a screen early, blanking the
  // page while it arrives.
  if (pathname === "/auth") {
    return <>{children}</>;
  }

  // Themed Spin and Terms pages draw their own station shell.
  // — skip the default header/footer chrome like the self-contained game
  // pages below.
  if (isThemed && (isSpinPage || isTermsPage)) {
    return <>{children}</>;
  }

  // Penalty Kick and Leaderboard each draw their own top HUD + bottom
  // FooterNav and need a full-bleed surface — skip the global header/
  // footer chrome here so we don't end up with two stacked headers
  // (the global hamburger + the page's "LEADERBOARDS" bar).
  if (isPenaltyKickPage || isSmashEggPage || isMissionsPage || isLeaderboardPage || isRpgPage) {
    return <>{children}</>;
  }

  // Remaining content-only member pages (profile, vip, mart, personal-data).
  // When a theme is active, wrap them in the themed shell — full-bleed lucky-spin
  // background + themed header + themed bottom nav — instead of the default green
  // chrome below, so themed members never fall back to the default look. These
  // pages' content isn't skinned yet; only the surrounding chrome changes.
  if (isThemed) {
    return (
      <ThemedPageShell balance={userData.balance}>{children}</ThemedPageShell>
    );
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
        paddingTop: isMartPage ? "0" : "72px",
      }}
    >
      {/* Conditional Header */}
      {isMartPage ? (
        <MartHeader
          balance={userData.balance}
          onMenuClick={() => setIsMenuOpen(true)}
          onProfileClick={() => {}}
          showAnimation={!hasAnimated}
          profilePhoto={profilePicture}
        />
      ) : (
        <Header
          onMenuClick={() => setIsMenuOpen(true)}
          showAnimation={!hasAnimated}
          balance={isSpinPage ? userData.balance : null}
          battlePoints={isSpinPage ? userData.battlePoints : null}
          profilePhoto={profilePicture}
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
