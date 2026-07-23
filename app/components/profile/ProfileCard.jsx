"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { PROFILE_ASSETS } from "./profileAssets";
import ProfileFrame from "./ProfileFrame";
import { getMemberInfo, getProfile, claimWelcomeGift, getVipTiers } from "@/app/api/memberApi";
import { mapMemberInfoToProfileCard } from "@/app/api/responseMappers";
import { tokenStorage } from "@/app/api/tokenStorage";
import { handleApiError, formatErrorMessage } from "@/app/api/errorHandler";
import { LoadingState } from "@/app/components/ui/LoadingState";
import ErrorDisplay from "@/app/components/ui/ErrorDisplay";
import SuccessModal from "@/app/components/ui/SuccessModal";
import FluidFrame from "@/app/components/ui/FluidFrame";
import ThemedActionButton from "@/app/components/themes/shared/ThemedActionButton";
import { useUser } from "@/app/contexts/UserContext";

export default function ProfileCard({ 
  name: propName, 
  totalTokens: propTotalTokens, 
  currentLevel: propCurrentLevel,
  nextLevel = "Platinum",
  progress = 61.6, // percentage
  tokensNeeded = 20000,
  avatarSrc = PROFILE_ASSETS.profileAvatar,
  onVipDetailsClick
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [memberData, setMemberData] = useState({
    name: propName || "Jhon Doe",
    totalTokens: propTotalTokens || "5,450.00",
    currentLevel: propCurrentLevel || "Gold"
  });
  const [fullName, setFullName] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [welcomeFlag, setWelcomeFlag] = useState(null); // null = loading, true = claimed, false = unclaimed
  const [isClaimingGift, setIsClaimingGift] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [claimError, setClaimError] = useState(null);
  const [vipTiers, setVipTiers] = useState([]);
  const [currentTierData, setCurrentTierData] = useState(null);
  const [nextTierData, setNextTierData] = useState(null);
  const [tokensToNextTier, setTokensToNextTier] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const { refreshUserData, selectedFrameId } = useUser();

  useEffect(() => {
    fetchVipTiers();
    fetchMemberInfo();
    fetchProfileData();
  }, []); // Runs on mount
  
  // Also fetch when page becomes visible (user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchVipTiers();
        fetchMemberInfo();
        fetchProfileData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const fetchVipTiers = async () => {
    try {
      const tiers = await getVipTiers();
      // Sort tiers by lifetime_deposit_required to get proper order
      const sortedTiers = [...tiers].sort((a, b) => 
        parseFloat(a.lifetime_deposit_required) - parseFloat(b.lifetime_deposit_required)
      );
      setVipTiers(sortedTiers);
    } catch (err) {
      console.error("ProfileCard: Error fetching VIP tiers:", err);
    }
  };

  const fetchMemberInfo = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const memberUuid = tokenStorage.getMemberUuid();
      if (!memberUuid) {
        throw new Error("Member UUID not found");
      }

      const response = await getMemberInfo(memberUuid);
      const transformedData = mapMemberInfoToProfileCard(response);
      setMemberData(transformedData);
      
      // Set welcome_flag from member info
      if (response.welcome_flag !== undefined) {
        setWelcomeFlag(response.welcome_flag);
      }
      
      // Calculate VIP tier progress
      if (vipTiers.length > 0 && transformedData.tierId) {
        calculateTierProgress(transformedData.tierId, transformedData.totalDeposit, vipTiers);
      }
    } catch (err) {
      const errorInfo = handleApiError(err, 'ProfileCard.fetchMemberInfo');
      setError({
        status: errorInfo.status,
        message: formatErrorMessage(errorInfo),
        data: errorInfo.details,
        retryable: errorInfo.retryable
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const calculateTierProgress = (currentTierId, totalDeposit, tiers) => {
    // Find current tier by UUID
    const currentTierIndex = tiers.findIndex(tier => tier.uuid === currentTierId);
    
    if (currentTierIndex === -1) {
      return;
    }
    
    const current = tiers[currentTierIndex];
    setCurrentTierData(current);
    
    // Get next tier (if exists)
    if (currentTierIndex < tiers.length - 1) {
      const next = tiers[currentTierIndex + 1];
      setNextTierData(next);
      
      const currentDeposit = parseFloat(totalDeposit) || 0;
      const currentRequired = parseFloat(current.lifetime_deposit_required) || 0;
      const nextRequired = parseFloat(next.lifetime_deposit_required) || 0;
      
      // Calculate tokens needed to reach next tier
      const tokensNeeded = Math.max(0, nextRequired - currentDeposit);
      setTokensToNextTier(tokensNeeded);
      
      // Calculate progress percentage
      const tierRange = nextRequired - currentRequired;
      const progressInTier = currentDeposit - currentRequired;
      const percentage = tierRange > 0 ? Math.min(100, Math.max(0, (progressInTier / tierRange) * 100)) : 0;
      setProgressPercentage(percentage);
    } else {
      // User is at max tier
      setNextTierData(null);
      setTokensToNextTier(0);
      setProgressPercentage(100);
    }
  };
  
  // Recalculate tier progress when vipTiers or memberData changes
  useEffect(() => {
    if (vipTiers.length > 0 && memberData.tierId && memberData.totalDeposit !== undefined) {
      calculateTierProgress(memberData.tierId, memberData.totalDeposit, vipTiers);
    }
  }, [vipTiers, memberData.tierId, memberData.totalDeposit]);

  const fetchProfileData = async () => {
    try {
      const memberUuid = tokenStorage.getMemberUuid();
      if (!memberUuid) {
        return;
      }

      const profileResponse = await getProfile(memberUuid);
      
      // Set full name if available
      if (profileResponse.full_name) {
        setFullName(profileResponse.full_name);
      }
      
      // Set profile picture if available
      if (profileResponse.profile_picture) {
        setProfilePicture(profileResponse.profile_picture);
      }
    } catch (err) {
      console.error("ProfileCard: Error fetching profile data:", err);
      // Don't show error for profile data fetch, just log it
    }
  };

  const handleClaimWelcomeGift = async () => {
    setIsClaimingGift(true);
    setClaimError(null);
    
    try {
      const memberUuid = tokenStorage.getMemberUuid();
      if (!memberUuid) {
        throw new Error("Member UUID not found");
      }

      await claimWelcomeGift(memberUuid);
      
      // Update welcome_flag to true (claimed)
      setWelcomeFlag(true);
      
      // Refresh VIP tiers first
      await fetchVipTiers();
      
      // Refresh member info to update token balance
      await fetchMemberInfo();
      
      // Refresh global user data
      await refreshUserData();
      
      // Refresh profile data to get updated full_name
      await fetchProfileData();
      
      // Show success modal
      setShowSuccessModal(true);
    } catch (err) {
      const errorInfo = handleApiError(err, 'ProfileCard.handleClaimWelcomeGift');
      setClaimError(formatErrorMessage(errorInfo));
    } finally {
      setIsClaimingGift(false);
    }
  };

  const { name, totalTokens, currentLevel } = memberData;
  
  // Use full_name if available, otherwise use username
  const displayName = fullName || name;

  const handleVipDetailsClick = () => {
    // Navigate to personal-data page
    router.push('/vip');
    
    // Also call the original handler if provided
    if (onVipDetailsClick) {
      onVipDetailsClick();
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="relative mx-auto w-full max-w-[336px] h-[224px] min-[465px]:max-w-[370px] min-[465px]:h-[246px]">
        <LoadingState isLoading={true} />
      </div>
    );
  }

  // Show error state with retry option
  if (error) {
    return (
      <div className="relative mx-auto w-full max-w-[336px] min-[465px]:max-w-[370px] p-4">
        <ErrorDisplay error={error} />
        <div className="mt-4 flex w-full justify-center">
          <ThemedActionButton
            textSize={16}
            onClick={() => { fetchVipTiers(); fetchMemberInfo(); }}
            fallback={
              <button
                onClick={() => { fetchVipTiers(); fetchMemberInfo(); }}
                className="w-full px-4 py-2 bg-[#e9af41] text-[#51340c] font-bold rounded hover:bg-[#d19a35] transition-colors"
              >
                Retry
              </button>
            }
          >
            Retry
          </ThemedActionButton>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        className="mx-auto w-full"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
          delay: 0.2,
        }}
      >
        <FluidFrame designWidth={402} designHeight={246}>
        <div className="absolute left-1/2 top-0 -translate-x-1/2 origin-top w-[366px] h-[224px] scale-[1.1]">
          {/* Card Background — use object-contain so the corner gem ornaments
              aren't cropped by aspect-ratio mismatch. */}
          <Image
            alt="Profile Card"
            src={PROFILE_ASSETS.profileCardBg}
            fill
            className="object-contain"
          />

          <motion.div
            className="absolute pointer-events-none overflow-hidden rounded-full"
        
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          />

         
          <motion.div
            className="absolute left-[36px] top-[18px]"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: 0.4,
            }}
          >
            <ProfileFrame
              src={profilePicture || avatarSrc}
              frameId={selectedFrameId}
              size={66}
              alt={displayName}
            />
          </motion.div>

          {/* Name and Tokens */}
          <motion.div
            className="absolute left-[110px] top-[25px]"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <p className="text-[#e9af41] text-[18px] font-bold font-['Times_New_Roman'] whitespace-nowrap">
              {displayName}
            </p>
            <p className="text-[#e9af41] text-[10px] font-bold font-['Times_New_Roman'] whitespace-nowrap mt-1">
              Total Token: {totalTokens}
            </p>
          </motion.div>

          {/* VIP Details Button — sits in the dark-green band between the
              Total Token line (~y=55) and the inner gold panel top (~y=96),
              right-aligned to clear the corner gem ornament (~30px deep). */}
          <motion.button
            onClick={handleVipDetailsClick}
            className="absolute right-[55px] top-[60px] text-[#e9af41] font-bold font-['Times_New_Roman'] whitespace-nowrap cursor-pointer"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-[10px] leading-none align-middle">VIP Details</span>
            <span className="text-[10px] leading-none align-middle ml-[3px]">&rsaquo;</span>
          </motion.button>

          {/* VIP Progress — flex container mapped to the inner gold panel area
              of profileboard-1.png. Source image is 612×408; pixel-detection
              of the panel's gold borders puts the interior at source x=30–590,
              y=175–360. With object-contain inside the 366×224 card div (image
              displayed at 336×224 with 15px horizontal letterbox), the panel
              interior lands at left=32, right=27, top=100, bottom=30. */}
          <motion.div
            className="absolute left-[62px] right-[58px] top-[118px] bottom-[42px] flex flex-col justify-around gap-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            {/* Current Tier */}
            <p className="text-[#e9af41] text-[15px] font-bold font-['Times_New_Roman'] leading-none uppercase truncate">
              {currentTierData ? currentTierData.name : currentLevel} ⭐
            </p>

            {/* Progress Text */}
            <p className="text-[#e9af41] text-[10px] font-bold font-['Times_New_Roman'] leading-tight">
              {nextTierData
                ? `Get ${tokensToNextTier.toLocaleString()} more to go ${nextTierData.name.toUpperCase()}`
                : "Maximum tier reached! 🎉"}
            </p>

            {/* Progress Bar */}
            <div className="relative w-full h-[6px] bg-[#51340c] border border-[#e9af41] rounded-full overflow-hidden shadow-[inset_0px_2px_2px_0px_rgba(0,0,0,0.25)]">
              <motion.div
                className="absolute inset-y-0 left-0 bg-[#e9af41]"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, delay: 0.9, ease: "easeOut" }}
              />
            </div>

            {/* Tier labels — truncate so long names don't push against the gold border */}
            <div className="flex justify-between gap-2 text-[#e9af41] text-[9px] font-bold font-['Times_New_Roman'] uppercase leading-none">
              <span className="truncate">
                {currentTierData ? currentTierData.name : currentLevel}
              </span>
              {nextTierData && (
                <span className="truncate text-right">{nextTierData.name}</span>
              )}
            </div>
          </motion.div>
        </div>
        </FluidFrame>
      </motion.div>

      {/* Welcome Gift Section - Only show if unclaimed (welcome_flag is false) */}
      {welcomeFlag === false && (
        <motion.div
          className="mt-4 w-full max-w-[336px] min-[465px]:max-w-[370px] mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex w-full justify-center">
            <ThemedActionButton
              textSize={16}
              disabled={isClaimingGift}
              onClick={handleClaimWelcomeGift}
              fallback={
                <button
                  onClick={handleClaimWelcomeGift}
                  disabled={isClaimingGift}
                  className="w-full px-6 py-3 bg-gradient-to-r from-[#e9af41] to-[#d19a35] text-[#51340c] font-bold font-['Times_New_Roman'] text-[16px] rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isClaimingGift ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>Claiming...</span>
                    </>
                  ) : (
                    <>
                      <span>🎁</span>
                      <span>Claim Welcome Gift</span>
                    </>
                  )}
                </button>
              }
            >
              {isClaimingGift ? "Claiming..." : "Claim Welcome Gift"}
            </ThemedActionButton>
          </div>
          
          {claimError && (
            <p className="mt-2 text-red-500 text-sm text-center font-['Times_New_Roman']">
              {claimError}
            </p>
          )}
        </motion.div>
      )}

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="🎁 Welcome Gift Claimed!"
        message="Congratulations! Your welcome tokens have been added to your account."
        backgroundColor="rgba(96, 128, 60, 1)"
      />
    </>
  );
}
