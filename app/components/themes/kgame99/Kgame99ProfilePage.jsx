"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import HistorySection from "../../profile/HistorySection";
import ThemedProfileCard from "../shared/ThemedProfileCard";
import ThemedEditProfileList from "../shared/ThemedEditProfileList";
import WelcomeGiftButton from "../shared/WelcomeGiftButton";
import { KGAME99_ASSETS } from "./assets";
import { useUser } from "../../../contexts/UserContext";

// Celestial frame: LIGHT sky-blue marble interior, so the ink is dark navy
// and the token amount carries no glow.
const KGAME_CARD_COLORS = {
  name: "#0a4e9e",
  label: "rgba(10,78,158,0.75)",
  level: "#0a4e9e",
  getText: "rgba(10,78,158,0.85)",
  getNum: "#0a4e9e",
  getEmph: "#0a4e9e",
  nextLabel: "#0a4e9e",
  wellBg: "rgba(10,78,158,0.08)",
  wellBorder: "rgba(10,78,158,0.3)",
  tokenColor: "#0a4e9e",
  barBase: "#0f2a4a",
  barFill: "linear-gradient(90deg, #0a4e9e, #4fa0e0)",
  barGlow: "rgba(79,160,224,0.7)",
  avatarFrom: "#e2f1ff",
  avatarTo: "#9cc2e2",
  avatarInk: "#0a2f57",
  avatarRing: "#0a4e9e",
  pillFrom: "#f5c451",
  pillMid: "#d79f2e",
  pillTo: "#b57718",
  pillText: "#0a1a2f",
  pillGlow: "rgba(245,196,81,0.45)",
};


export default function Kgame99ProfilePage() {
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
          src={KGAME99_ASSETS.profile.title}
          alt="My Profile"
          draggable={false}
          className="mt-2 h-auto w-[340px] max-w-[92%] select-none object-contain"
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
        />

        {/* Insets measured by eye, not by an edge-variance scan: this plate's
            interior is busy (castles, clouds) and the scan read art as border. */}
        <ThemedProfileCard
          frame={KGAME99_ASSETS.frames.crown}
          pad={{ left: "12%", right: "12%", top: "33%", bottom: "23%" }}
          colors={KGAME_CARD_COLORS}
          coinIcon={KGAME99_ASSETS.ui.iconCoins}
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

        {/* Scroll frame's interior is saturated royal blue, so text needs
            warm/light color for contrast — pale sky-blue (#dbecff) got lost.
            Warm cream reads clearly and matches the gold heading + chevron. */}
        <ThemedEditProfileList
          frame={KGAME99_ASSETS.frames.scroll}
          pad={{ x: "17%", top: "18%", bottom: "21%" }}
          colors={{
            heading: "#ffd76a",
            rowText: "#fff6df",
            chevron: "#ffd76a",
            divider: "rgba(255,246,223,0.28)",
          }}
          onItem={goPersonalData}
        />
      </div>
    </>
  );
}
