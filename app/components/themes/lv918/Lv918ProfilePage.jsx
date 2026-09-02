"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import HistorySection from "../../profile/HistorySection";
import ThemedProfileCard from "../shared/ThemedProfileCard";
import ThemedEditProfileList from "../shared/ThemedEditProfileList";
import WelcomeGiftButton from "../shared/WelcomeGiftButton";
import { LV918_ASSETS, LV918_COLORS } from "./assets";
import { useUser } from "../../../contexts/UserContext";

const LV918_CARD_COLORS = {
  name: "#6b0a32",
  label: "rgba(58,10,30,0.75)",
  tokenValue: "#6b0a32",
  level: "#6b0a32",
  getText: "rgba(58,10,30,0.85)",
  getEmph: "#6b0a32",
  // A gold-brown track (the shared progressTrack) reads as a black bar on this
  // card's light-pink interior — use a translucent rose well instead.
  barBase: "rgba(107,10,50,0.20)",
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

        {/* lv918's crown frame is a wide 1672×941 plate squeezed into a nearly
            square card, which stretches its ornaments: the top crown-and-heart
            hangs down to ~34% of the rendered height and the bottom crown
            starts at ~78%. The shared 24/20% pad let the name + VIP pill row
            sit under the hanging heart — these deeper pads size the card so the
            whole block lands in the clear pink interior. */}
        <ThemedProfileCard
          frame={LV918_ASSETS.frames.crown}
          pad={{ x: "20%", top: "39%", bottom: "26%" }}
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
