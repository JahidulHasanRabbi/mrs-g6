"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import KingRewardsHistoryPanel from "../../profile/KingRewardsHistoryPanel";
import WelcomeGiftButton from "../shared/WelcomeGiftButton";
import { GlassCard, PageTitle } from "./KrUi";
import { KrMemberAvatar, KrOutlineButton, KrTierCard } from "./KingRewardsProfileParts";
import { KR_ASSETS, KR_COLORS, KR_FONT } from "./assets";
import { useUser } from "../../../contexts/UserContext";
import { getProfile } from "../../../api/memberApi";
import { tokenStorage } from "../../../api/tokenStorage";

// Edit Profile and VIP Details share one look (feedback 23 Sep).
const PAIR_BUTTON_STYLE = { paddingInline: 8, paddingBlock: 10, background: "rgba(255,255,255,0.08)" };

const hasValue = (v) => v != null && String(v).trim() !== "";

/**
 * The member's own profile record, fetched here rather than read from UserContext
 * because the context copy is not refreshed after Personal Data saves.
 */
function useFreshProfile() {
  const [profile, setProfile] = useState(null);
  const load = useCallback(async () => {
    const uuid = tokenStorage.getMemberUuid();
    if (!uuid) return;
    try {
      setProfile(await getProfile(uuid));
    } catch (err) {
      console.error("KingRewardsProfilePage: Error fetching profile data:", err);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  return [profile, load];
}

/** Same six checks as the default Edit Profiles list. */
function profileCompletion(profile, profilePicture, phoneNumber) {
  const items = [
    { label: "Photo", done: hasValue(profile?.profile_picture || profilePicture) },
    { label: "Gender", done: hasValue(profile?.gender) },
    { label: "Birthday", done: hasValue(profile?.date_of_birth) },
    { label: "Phone", done: hasValue(phoneNumber) },
    { label: "Email", done: hasValue(profile?.email) },
    { label: "Interest", done: hasValue(profile?.hobby) },
  ];
  return { done: items.filter((i) => i.done).length, total: items.length, missing: items.filter((i) => !i.done).map((i) => i.label) };
}

function CompletionNudge({ done, total, missing, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-[8px] px-2 py-[6px] text-left transition-transform active:scale-[0.99]"
      style={{ fontFamily: KR_FONT, background: "rgba(255,255,255,0.08)", border: `1px solid rgba(255,240,102,0.35)` }}
    >
      <span className="min-w-0 truncate text-[11px] leading-[1.3] text-white">
        Profile <span className="font-semibold" style={{ color: KR_COLORS.gold }}>{done}/{total}</span> complete
        <span style={{ color: KR_COLORS.sand }}> · Add {missing.join(", ")}</span>
      </span>
      <img src={KR_ASSETS.ui.iconArrowLeft} alt="" className="size-3 shrink-0 rotate-180" />
    </button>
  );
}

/** King Rewards profile (Figma 664:791). Chrome comes from the KR shell via AppLayout. */
export default function KingRewardsProfilePage() {
  const router = useRouter();
  const { userData, profilePicture, profileData, isLoadingProfile, refreshUserData } = useUser();
  const [freshProfile, reloadProfile] = useFreshProfile();
  const [retrying, setRetrying] = useState(false);
  const profile = freshProfile || profileData;

  // refreshUserData is a new function every render; keep one listener.
  const refreshRef = useRef(refreshUserData);
  useEffect(() => {
    refreshRef.current = refreshUserData;
  });

  // Returning to the tab picks up deposits and edits made elsewhere (default ProfileCard does the same).
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      refreshRef.current();
      reloadProfile();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [reloadProfile]);

  const name = profile?.full_name || userData?.name || "";
  const photo = freshProfile?.profile_picture || profilePicture;
  const currentLevel = userData?.currentLevel || "";
  const nextLevel = userData?.nextLevel || "";
  const progress = Number.isFinite(userData?.progress) ? userData.progress : 0;
  const tokensNeeded = userData?.tokensNeeded ?? 0;
  const completion = profileCompletion(profile, profilePicture, userData?.phoneNumber);

  const goPersonalData = () => router.push("/personal-data");
  const goVip = () => router.push("/vip");
  const retry = async () => {
    setRetrying(true);
    await Promise.all([refreshUserData(), reloadProfile()]);
    setRetrying(false);
  };

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
            <KrMemberAvatar src={photo} name={name} size={79} />
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
            onRetry={retry}
            retrying={retrying}
          />

          {profile && completion.done < completion.total && (
            <CompletionNudge {...completion} onClick={goPersonalData} />
          )}
        </GlassCard>
      </motion.div>

      <WelcomeGiftButton />

      <div className="w-full max-w-[380px]">
        <KingRewardsHistoryPanel />
      </div>
    </div>
  );
}
