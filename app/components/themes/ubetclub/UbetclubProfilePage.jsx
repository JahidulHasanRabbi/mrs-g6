"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import HistorySection from "../../profile/HistorySection";
import ThemedProfileCard from "../shared/ThemedProfileCard";
import ThemedEditProfileList from "../shared/ThemedEditProfileList";
import { UBET_ASSETS, UBET_COLORS } from "./assets";
import { useUser } from "../../../contexts/UserContext";

// God-of-Wealth frame: dark red interior, so cream/gold ink.
const UBET_CARD_COLORS = {
  name: "#fff6df",
  label: "rgba(255,246,223,0.7)",
  level: "#f2c36b",
  getText: "rgba(255,246,223,0.85)",
  getNum: "#ffe16d",
  getEmph: "#f2c36b",
  nextLabel: "#f2c36b",
  wellBg: "rgba(255,255,255,0.06)",
  wellBorder: "rgba(242,195,107,0.35)",
  tokenColor: "#ffe16d",
  tokenGlow: "rgba(255,225,109,0.45)",
  barBase: "#480e0f",
  barFill: "linear-gradient(90deg, #dd8f1f, #f2c36b)",
  barGlow: "rgba(242,195,107,0.7)",
  avatarFrom: "#ffe6d2",
  avatarTo: "#d9a184",
  avatarInk: "#480e0f",
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
          pad={{ left: "13.6%", right: "13.6%", top: "25.5%", bottom: "17.6%" }}
          colors={UBET_CARD_COLORS}
          coinIcon={UBET_ASSETS.ui.iconCoin}
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
