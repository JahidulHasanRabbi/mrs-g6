"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import HistorySection from "../../profile/HistorySection";
import ThemedProfileCard from "../shared/ThemedProfileCard";
import ThemedEditProfileList from "../shared/ThemedEditProfileList";
import { N1GANG_ASSETS, N1GANG_COLORS } from "./assets";
import { useUser } from "../../../contexts/UserContext";

const N1GANG_CARD_COLORS = {
  name: "#fff6df",
  label: "rgba(255,246,223,0.7)",
  tokenValue: "#f2ba33",
  level: "#f2ba33",
  getText: "rgba(255,246,223,0.85)",
  getEmph: "#f2ba33",
  barBase: "#2a1a06",
  barFill: "linear-gradient(90deg, #dc9d16 0%, #f2cb7a 100%)",
  barGlow: "rgba(242,203,122,0.7)",
  barBorder: "#e9af41",
  divider: "rgba(233,175,65,0.28)",
  pillFrom: "#f2cb7a",
  pillTo: "#dc9d16",
  pillText: "#241603",
  avatarRing: "#e9af41",
};

export default function N1gangProfilePage() {
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
          src={N1GANG_ASSETS.profile.title}
          alt="My Profile"
          draggable={false}
          className="mt-2 h-auto w-[340px] max-w-[92%] select-none object-contain"
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
        />

        <ThemedProfileCard
          frame={N1GANG_ASSETS.frames.panel}
          pad={{ x: "13%", top: "15%", bottom: "13%" }}
          colors={N1GANG_CARD_COLORS}
          coinIcon={N1GANG_ASSETS.ui.iconCoins}
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
          frame={N1GANG_ASSETS.frames.scroll}
          pad={{ x: "19%", top: "19%", bottom: "21%" }}
          colors={{
            heading: N1GANG_COLORS.gold,
            rowText: N1GANG_COLORS.gold,
            chevron: N1GANG_COLORS.gold,
            divider: "rgba(233,175,65,0.2)",
          }}
          onItem={goPersonalData}
        />
      </div>
    </>
  );
}
