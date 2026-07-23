"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import HistorySection from "../../profile/HistorySection";
import ThemedProfileCard from "../shared/ThemedProfileCard";
import ThemedEditProfileList from "../shared/ThemedEditProfileList";
import { LV918_ASSETS, LV918_COLORS } from "./assets";
import { useUser } from "../../../contexts/UserContext";

const LV918_CARD_COLORS = {
  name: "#6b0a32",
  label: "rgba(58,10,30,0.75)",
  tokenValue: "#6b0a32",
  level: "#6b0a32",
  getText: "rgba(58,10,30,0.85)",
  getEmph: "#6b0a32",
  barBase: LV918_COLORS.progressTrack,
  barFill: "linear-gradient(90deg, #c22060 0%, #e05888 100%)",
  barGlow: "rgba(194,32,96,0.7)",
  barBorder: "#8a1848",
  divider: "rgba(107,10,50,0.3)",
  pillFrom: "#f5c451",
  pillTo: "#b57718",
  pillText: "#2a0a1f",
  avatarRing: "#8a1848",
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
  const nextTierIcon = userData?.nextTierIcon;

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
          pad={{ x: "20%", top: "24%", bottom: "20%" }}
          colors={LV918_CARD_COLORS}
          coinIcon={LV918_ASSETS.ui.iconCoins}
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
          avatarSize={44}
        />

        <div className="w-full max-w-[360px]">
          <HistorySection />
        </div>

        <ThemedEditProfileList
          frame={LV918_ASSETS.frames.scroll}
          pad={{ x: "17%", top: "18%", bottom: "21%" }}
          headingMt={32}
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
