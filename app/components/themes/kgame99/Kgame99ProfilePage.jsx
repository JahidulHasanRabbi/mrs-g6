"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import HistorySection from "../../profile/HistorySection";
import ThemedProfileCard from "../shared/ThemedProfileCard";
import ThemedEditProfileList from "../shared/ThemedEditProfileList";
import { KGAME99_ASSETS, KGAME99_COLORS } from "./assets";
import { useUser } from "../../../contexts/UserContext";

// Celestial crystal-kingdom card palette. Unlike the other skins this frame has
// a LIGHT sky-blue marble interior, so text is dark navy (not cream/gold).
const KGAME_CARD_COLORS = {
  name: "#0a4e9e",
  label: "rgba(10,78,158,0.75)",
  tokenValue: "#0a4e9e",
  level: "#0a4e9e",
  getText: "rgba(10,78,158,0.85)",
  getEmph: "#0a4e9e",
  barBase: "#0f2a4a",
  barFill: "linear-gradient(90deg, #0a4e9e 0%, #4fa0e0 100%)",
  barGlow: "rgba(79,160,224,0.7)",
  barBorder: "#0a4e9e",
  divider: "rgba(10,78,158,0.3)",
  pillFrom: "#f5c451",
  pillTo: "#b57718",
  pillText: "#0a1a2f",
  avatarRing: "#0a4e9e",
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
  const nextTierIcon = userData?.nextTierIcon;

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

        <ThemedProfileCard
          frame={KGAME99_ASSETS.frames.crown}
          pad={{ x: "18%", top: "22%", bottom: "18%" }}
          colors={KGAME_CARD_COLORS}
          coinIcon={KGAME99_ASSETS.ui.iconCoins}
          name={name}
          totalTokens={balance}
          currentLevel={currentLevel}
          nextLevel={nextLevel}
          progress={progress}
          tokensNeeded={tokensNeeded}
          currentTierIcon={currentTierIcon}
          nextTierIcon={nextTierIcon}
          profilePicture={profilePicture}
          onVipDetails={goVip}
        />

        <div className="w-full max-w-[360px]">
          <HistorySection />
        </div>

        <ThemedEditProfileList
          frame={KGAME99_ASSETS.frames.scroll}
          pad={{ x: "17%", top: "18%", bottom: "21%" }}
          colors={{
            heading: "#ffac22",
            rowText: KGAME99_COLORS.lightBlue,
            chevron: "#ffac22",
            divider: "rgba(219,236,255,0.25)",
          }}
          onItem={goPersonalData}
        />
      </div>
    </>
  );
}
