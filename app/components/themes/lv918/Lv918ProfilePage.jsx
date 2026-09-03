"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import HistorySection from "../../profile/HistorySection";
import ThemedProfileCard from "../shared/ThemedProfileCard";
import ThemedEditProfileList from "../shared/ThemedEditProfileList";
import WelcomeGiftButton from "../shared/WelcomeGiftButton";
import { LV918_ASSETS, LV918_COLORS } from "./assets";
import { useUser } from "../../../contexts/UserContext";

// Royal-pink frame: LIGHT pink interior, so the ink is deep rose and the
// token amount carries no glow.
const LV918_CARD_COLORS = {
  name: "#6b0a32",
  label: "rgba(58,10,30,0.75)",
  level: "#6b0a32",
  getText: "rgba(58,10,30,0.85)",
  getNum: "#c22060",
  getEmph: "#6b0a32",
  nextLabel: "#6b0a32",
  wellBg: "rgba(107,10,50,0.08)",
  wellBorder: "rgba(107,10,50,0.3)",
  tokenColor: "#6b0a32",
  barBase: "rgba(107,10,50,0.20)",
  barFill: "linear-gradient(90deg, #c22060, #e05888)",
  barGlow: "rgba(194,32,96,0.7)",
  avatarFrom: "#ffe2ee",
  avatarTo: "#d898b4",
  avatarInk: "#6b0a32",
  avatarRing: "#8a1848",
  pillFrom: "#f5c451",
  pillMid: "#d79f2e",
  pillTo: "#b57718",
  pillText: "#2a0a1f",
  pillGlow: "rgba(245,196,81,0.45)",
};

export default function Lv918ProfilePage() {
  const router = useRouter();
  const { userData, profilePicture } = useUser();

  const name = userData?.name || "";
  const balance = userData?.balance ?? "0.00";
  const currentLevel = userData?.currentLevel || "Gold";
  const nextLevel = userData?.nextLevel || "Platinum";
  const progress = Number.isFinite(userData?.progress) ? userData.progress : 0;
  const tokensNeeded = userData?.tokensNeeded ?? 0;
  const currentTierIcon = userData?.currentTierIcon;

  const goPersonalData = () => router.push("/personal-data");
  const goVip = () => router.push("/vip");

  return (
    <>
      <div className="flex flex-col items-center gap-5 px-4">
        <motion.img
          src={LV918_ASSETS.profile.title}
          alt="My Profile"
          draggable={false}
          className="mt-2 h-auto w-[340px] max-w-[92%] select-none object-contain"
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
        />

        <ThemedProfileCard
          frame={LV918_ASSETS.frames.crown}
          pad={{ left: "12.2%", right: "10.7%", top: "35.4%", bottom: "24%" }}
          colors={LV918_CARD_COLORS}
          coinIcon={LV918_ASSETS.ui.iconCoins}
          name={name}
          totalTokens={balance}
          currentLevel={currentLevel}
          nextLevel={nextLevel}
          progress={progress}
          tokensNeeded={tokensNeeded}
          currentTierIcon={currentTierIcon}
          profilePicture={profilePicture}
          onVipDetails={goVip}
        />

        <WelcomeGiftButton />

        <div className="w-full max-w-[360px]">
          <HistorySection />
        </div>

        {/* lv918's scroll frame is square (1254²) and stretches to the list's
            height, so its crown-and-bow ornaments land at fixed fractions of
            that height: the top one ends at ~26.6%, the bottom one starts at
            ~74.7%. The shared 18/21% pad (a fraction of WIDTH) left the last
            rows sitting on the bottom bow — these deeper pads size the panel so
            the six rows land inside the clear pink interior. */}
        <ThemedEditProfileList
          frame={LV918_ASSETS.frames.scroll}
          pad={{ x: "19%", top: "35%", bottom: "35%" }}
          headingMt={6}
          colors={{
            heading: "#6b0a32",
            rowText: "#6b0a32",
            chevron: "#6b0a32",
            divider: "rgba(107,10,50,0.3)",
          }}
          onItem={goPersonalData}
        />
      </div>
    </>
  );
}
