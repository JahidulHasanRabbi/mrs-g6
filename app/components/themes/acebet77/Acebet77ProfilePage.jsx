"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import HistorySection from "../../profile/HistorySection";
import ThemedProfileCard from "../shared/ThemedProfileCard";
import ThemedEditProfileList from "../shared/ThemedEditProfileList";
import { ACEBET_ASSETS, ACEBET_COLORS } from "./assets";
import { useUser } from "../../../contexts/UserContext";

// Royal gold-on-black frame: dark interior, so cream/gold ink.
const ACEBET_CARD_COLORS = {
  name: "#fff6df",
  label: "rgba(255,246,223,0.7)",
  level: "#f2ba33",
  getText: "rgba(255,246,223,0.85)",
  getNum: "#f2ba33",
  getEmph: "#f2ba33",
  nextLabel: "#f2cb7a",
  wellBg: "rgba(255,255,255,0.06)",
  wellBorder: "rgba(233,175,65,0.35)",
  tokenColor: "#f2ba33",
  tokenGlow: "rgba(242,186,51,0.45)",
  barBase: "#2a1a06",
  barFill: "linear-gradient(90deg, #dc9d16, #f2cb7a)",
  barGlow: "rgba(242,203,122,0.7)",
  avatarFrom: "#fff3d6",
  avatarTo: "#d8b671",
  avatarInk: "#3a2405",
  avatarRing: "#e9af41",
};

export default function Acebet77ProfilePage() {
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
          src={ACEBET_ASSETS.profile.title}
          alt="My Profile"
          draggable={false}
          className="mt-2 h-auto w-[340px] max-w-[92%] select-none object-contain"
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
        />

        <ThemedProfileCard
          frame={ACEBET_ASSETS.frames.crown}
          pad={{ left: "10%", right: "11.5%", top: "17.8%", bottom: "15.6%" }}
          colors={ACEBET_CARD_COLORS}
          coinIcon={ACEBET_ASSETS.ui.iconCoins}
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
          frame={ACEBET_ASSETS.frames.scroll}
          pad={{ x: "19%", top: "19%", bottom: "21%" }}
          colors={{
            heading: ACEBET_COLORS.gold,
            rowText: ACEBET_COLORS.gold,
            chevron: ACEBET_COLORS.gold,
            divider: "rgba(233,175,65,0.2)",
          }}
          onItem={goPersonalData}
        />
      </div>
    </>
  );
}
