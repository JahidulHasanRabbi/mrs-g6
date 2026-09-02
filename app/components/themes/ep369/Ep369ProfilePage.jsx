"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import HistorySection from "../../profile/HistorySection";
import ThemedProfileCard from "../shared/ThemedProfileCard";
import ThemedEditProfileList from "../shared/ThemedEditProfileList";
import WelcomeGiftButton from "../shared/WelcomeGiftButton";
import { EP369_ASSETS, EP369_COLORS } from "./assets";
import { useUser } from "../../../contexts/UserContext";

const EP369_CARD_COLORS = {
  name: "#fff6df",
  label: "rgba(255,246,223,0.7)",
  tokenValue: "#f2c36b",
  level: "#f2c36b",
  getText: "rgba(255,246,223,0.85)",
  getEmph: "#f2c36b",
  barBase: "#0d3d1c",
  barFill: "linear-gradient(90deg, #1d6b36 0%, #54e07a 100%)",
  barGlow: "rgba(84,224,122,0.7)",
  barBorder: "#e9af41",
  divider: "rgba(242,195,107,0.28)",
  pillFrom: "#f6d488",
  pillTo: "#dd8f1f",
  pillText: "#063017",
  avatarRing: "#e9af41",
};

export default function Ep369ProfilePage() {
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
          src={EP369_ASSETS.profile.title}
          alt="My Profile"
          draggable={false}
          className="mt-2 h-auto w-[340px] max-w-[92%] select-none object-contain"
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
        />

        <ThemedProfileCard
          frame={EP369_ASSETS.frames.crown}
          pad={{ x: "15%", top: "20%", bottom: "14%" }}
          colors={EP369_CARD_COLORS}
          coinIcon={EP369_ASSETS.ui.iconCoin}
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

        <WelcomeGiftButton />

        <div className="w-full max-w-[360px]">
          <HistorySection />
        </div>

        <ThemedEditProfileList
          frame={EP369_ASSETS.frames.scroll}
          pad={{ x: "17%", top: "18%", bottom: "21%" }}
          colors={{
            heading: EP369_COLORS.gold,
            rowText: EP369_COLORS.gold,
            chevron: EP369_COLORS.gold,
            divider: "rgba(242,195,107,0.2)",
          }}
          onItem={goPersonalData}
        />
      </div>
    </>
  );
}
