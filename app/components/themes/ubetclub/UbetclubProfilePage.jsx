"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import HistorySection from "../../profile/HistorySection";
import ThemedProfileCard from "../shared/ThemedProfileCard";
import ThemedEditProfileList from "../shared/ThemedEditProfileList";
import WelcomeGiftButton from "../shared/WelcomeGiftButton";
import { UBET_ASSETS, UBET_COLORS } from "./assets";
import { useUser } from "../../../contexts/UserContext";

// God-of-Wealth red-on-gold card palette. Dark red interior → cream/gold text.
const UBET_CARD_COLORS = {
  name: "#fff6df",
  label: "rgba(255,246,223,0.7)",
  tokenValue: "#ffe16d",
  level: "#f2c36b",
  getText: "rgba(255,246,223,0.85)",
  getEmph: "#f2c36b",
  barBase: "#480e0f",
  barFill: "linear-gradient(90deg, #dd8f1f 0%, #f2c36b 100%)",
  barGlow: "rgba(242,195,107,0.7)",
  barBorder: "#f2c36b",
  divider: "rgba(242,195,107,0.26)",
  pillFrom: "#f2c36b",
  pillTo: "#dd8f1f",
  pillText: "#280506",
  avatarRing: "#f2c36b",
};

export default function UbetclubProfilePage() {
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
          src={UBET_ASSETS.profile.title}
          alt="My Profile"
          draggable={false}
          className="mt-2 h-auto w-[340px] max-w-[92%] select-none object-contain"
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
        />

        <ThemedProfileCard
          frame={UBET_ASSETS.frames.crown}
          pad={{ x: "15%", top: "22%", bottom: "15%" }}
          colors={UBET_CARD_COLORS}
          coinIcon={UBET_ASSETS.ui.iconCoin}
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
          frame={UBET_ASSETS.frames.scroll}
          pad={{ x: "19%", top: "19%", bottom: "21%" }}
          colors={{
            heading: UBET_COLORS.goldBright,
            rowText: UBET_COLORS.goldBright,
            chevron: UBET_COLORS.goldBright,
            divider: "rgba(242,195,107,0.2)",
          }}
          onItem={goPersonalData}
        />
      </div>
    </>
  );
}
