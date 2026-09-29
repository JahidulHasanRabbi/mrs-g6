"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import KingRewardsHistoryPanel from "../../profile/KingRewardsHistoryPanel";
import WelcomeGiftButton from "../shared/WelcomeGiftButton";
import { GlassCard, PageTitle } from "./KrUi";
import { KrAvatar, KrOutlineButton, KrTierCard } from "./KingRewardsProfileParts";
import { KR_COLORS, KR_FONT } from "./assets";
import { useUser } from "../../../contexts/UserContext";

// Edit Profile and VIP Details share one look (feedback 23 Sep).
const PAIR_BUTTON_STYLE = { paddingInline: 8, paddingBlock: 10, background: "rgba(255,255,255,0.08)" };

/** King Rewards profile (Figma 664:791). Chrome comes from the KR shell via AppLayout. */
export default function KingRewardsProfilePage() {
  const router = useRouter();
  const { userData, profilePicture, isLoadingProfile } = useUser();

  const name = userData?.name || "";
  const currentLevel = userData?.currentLevel || "";
  const nextLevel = userData?.nextLevel || "";
  const progress = Number.isFinite(userData?.progress) ? userData.progress : 0;
  const tokensNeeded = userData?.tokensNeeded ?? 0;

  const goPersonalData = () => router.push("/personal-data");
  const goVip = () => router.push("/vip");

  return (
    <div className="flex w-full flex-col items-center gap-4 px-4 pb-4 pt-8">
      <PageTitle>Profile</PageTitle>

      <motion.div
        className="w-full max-w-[380px]"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        <GlassCard className="flex w-full flex-col gap-4 px-2 py-4">
          <div className="flex items-center gap-2">
            <KrAvatar src={profilePicture} name={name} size={79} />
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <p
                className="truncate text-[16px] font-medium leading-[1.2]"
                style={{ fontFamily: KR_FONT, color: KR_COLORS.goldText }}
                title={name}
              >
                {name || (isLoadingProfile ? "Loading…" : "—")}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <KrOutlineButton className="min-w-0" style={PAIR_BUTTON_STYLE} onClick={goPersonalData}>
                  Edit Profile
                </KrOutlineButton>
                <KrOutlineButton className="min-w-0" style={PAIR_BUTTON_STYLE} onClick={goVip}>
                  VIP Details
                </KrOutlineButton>
              </div>
            </div>
          </div>

          <KrTierCard
            currentLevel={currentLevel}
            nextLevel={nextLevel}
            progress={progress}
            tokensNeeded={tokensNeeded}
            loading={isLoadingProfile && !currentLevel}
          />
        </GlassCard>
      </motion.div>

      <WelcomeGiftButton />

      <div className="w-full max-w-[380px]">
        <KingRewardsHistoryPanel />
      </div>
    </div>
  );
}
